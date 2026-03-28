const canvas = document.getElementById("sceneCanvas");
const commandInput = document.getElementById("commandInput");
const sendBtn = document.getElementById("sendBtn");
const explanationText = document.getElementById("explanationText");
const intentText = document.getElementById("intentText");
const statusText = document.getElementById("statusText");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020617);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
camera.position.set(0, 1.8, 5);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: false
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;

function resizeRenderer() {
  const width = canvas.clientWidth || canvas.parentElement.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || canvas.parentElement.clientHeight || window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
resizeRenderer();
window.addEventListener("resize", resizeRenderer);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);
controls.update();

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 2.2);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2.8);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.1,
    roughness: 0.95
  })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
scene.add(floor);

const grid = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b);
scene.add(grid);

let avatar = null;
let mixer = null;
let actions = {};
let activeAction = null;
const clock = new THREE.Clock();

statusText.textContent = "Loading avatar model...";

const loader = new THREE.GLTFLoader();

loader.load(
  "/static/models/avatar.glb",
  function (gltf) {
    avatar = gltf.scene;

    avatar.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
        }
      }
    });

    centerAndScaleModel(avatar);
    scene.add(avatar);

    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(avatar);

      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        actions[clip.name.toLowerCase()] = action;
        console.log("Loaded animation:", clip.name);
      });

      const animationNames = Object.keys(actions);
      statusText.textContent = `Avatar loaded. Animations found: ${animationNames.join(", ") || "none"}`;

      // Try to play an idle animation first
      const idleName = findBestAnimation(["idle", "breathing", "standing"]);
      if (idleName) {
        playAnimation(idleName);
      }
    } else {
      statusText.textContent = "Avatar loaded, but no built-in animations were found.";
    }

    console.log("Avatar loaded:", avatar);
  },
  function (xhr) {
    if (xhr.total) {
      const percent = ((xhr.loaded / xhr.total) * 100).toFixed(0);
      statusText.textContent = `Loading avatar model... ${percent}%`;
    }
  },
  function (error) {
    console.error("Avatar load error:", error);
    statusText.textContent = "Failed to load avatar. Check avatar.glb path/file.";
  }
);

function centerAndScaleModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  box.getSize(size);
  box.getCenter(center);

  model.position.sub(center);

  const targetHeight = 2.2;
  const currentHeight = size.y || 1;
  const scale = targetHeight / currentHeight;
  model.scale.setScalar(scale);

  const updatedBox = new THREE.Box3().setFromObject(model);
  const minY = updatedBox.min.y;
  model.position.y -= minY;
}

function fadeToAction(newAction, duration = 0.3) {
  if (!newAction) return;

  if (activeAction && activeAction !== newAction) {
    activeAction.fadeOut(duration);
  }

  newAction.reset();
  newAction.fadeIn(duration);
  newAction.play();
  activeAction = newAction;
}

function playAnimation(name) {
  const action = actions[name.toLowerCase()];
  if (!action) {
    console.warn("Animation not found:", name);
    return false;
  }

  fadeToAction(action, 0.25);
  return true;
}

function findBestAnimation(candidates) {
  const keys = Object.keys(actions);

  for (const candidate of candidates) {
    const exact = keys.find((key) => key === candidate);
    if (exact) return exact;

    const partial = keys.find((key) => key.includes(candidate));
    if (partial) return partial;
  }

  return null;
}

function mapIntentToAnimation(intent) {
  if (!actions || Object.keys(actions).length === 0) {
    return null;
  }

  const keys = Object.keys(actions);

  const find = (options) => {
    for (let opt of options) {
      let match = keys.find(k => k.includes(opt));
      if (match) return match;
    }
    return null;
  };

  if (intent === "wave") {
    return find(["wave", "hello", "yes"]);
  }

  if (intent === "walk_forward") {
    return find(["walking", "running"]);
  }

  if (intent === "walk_backward") {
    return find(["walking", "running"]);
  }

  if (intent === "point_left" || intent === "point_right") {
    return find(["yes", "thumb", "gesture"]);
  }

  if (intent === "clap") {
    return find(["dance", "punch"]);
  }

  return find(["idle", "standing"]);
}

async function sendCommand() {
  const command = commandInput.value.trim();

  if (!command) {
    explanationText.textContent = "Please enter a command for the avatar.";
    intentText.textContent = "empty";
    return;
  }

  statusText.textContent = "Interpreting command...";

  try {
    const response = await fetch("/interpret", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ command: command })
    });

    const data = await response.json();

    explanationText.textContent = data.explanation;
    intentText.textContent = data.intent;

    const animationName = mapIntentToAnimation(data.intent);

    if (animationName) {
      playAnimation(animationName);
      statusText.textContent = `Playing animation: ${animationName}`;
    } else {
      statusText.textContent = "No matching animation found in this avatar.";
    }
  } catch (error) {
    console.error("Error sending command:", error);
    explanationText.textContent = "There was a problem contacting the backend.";
    intentText.textContent = "error";
    statusText.textContent = "Request failed.";
  }
}

sendBtn.addEventListener("click", sendCommand);

commandInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendCommand();
  }
});

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (mixer) {
    mixer.update(delta);
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
