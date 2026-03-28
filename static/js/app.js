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
let avatarBasePosition = new THREE.Vector3(0, 0, 0);
let isAvatarLoaded = false;

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
    avatarBasePosition.copy(avatar.position);

    scene.add(avatar);
    isAvatarLoaded = true;
    statusText.textContent = "Avatar loaded successfully.";
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

async function sendCommand() {
  const command = commandInput.value.trim();

  if (!command) {
    explanationText.textContent = "Please enter a command for the avatar.";
    intentText.textContent = "empty";
    statusText.textContent = isAvatarLoaded
      ? "Avatar ready."
      : "Avatar not loaded yet.";
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

    if (isAvatarLoaded) {
      handleCommandVisualization(data.intent);
      statusText.textContent = `Ready. Suggested animation: ${data.animation}`;
    } else {
      statusText.textContent = "Command interpreted, but avatar is not loaded.";
    }
  } catch (error) {
    console.error("Error sending command:", error);
    explanationText.textContent = "There was a problem contacting the backend.";
    intentText.textContent = "error";
    statusText.textContent = "Request failed.";
  }
}

function handleCommandVisualization(intent) {
  if (!avatar) return;

  avatar.position.copy(avatarBasePosition);
  avatar.rotation.set(0, 0, 0);

  if (intent === "wave") {
    avatar.rotation.y = 0.2;
  } else if (intent === "point_left") {
    avatar.rotation.y = 0.45;
  } else if (intent === "point_right") {
    avatar.rotation.y = -0.45;
  } else if (intent === "walk_forward") {
    avatar.position.z -= 0.35;
  } else if (intent === "walk_backward") {
    avatar.position.z += 0.35;
  } else if (intent === "clap") {
    avatar.rotation.y = 0.1;
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
  controls.update();
  renderer.render(scene, camera);
}

animate();
