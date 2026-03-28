const canvas = document.getElementById('sceneCanvas');
const statusText = document.getElementById('statusText');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020617);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.8, 5);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.update();

const light = new THREE.HemisphereLight(0xffffff, 0x444444, 2.5);
scene.add(light);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x111827 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

let avatar;

statusText.textContent = "Loading avatar...";

const loader = new THREE.FBXLoader();

loader.load(
  "/static/models/avatar.fbx",
  function (object) {
    avatar = object;

    const box = new THREE.Box3().setFromObject(avatar);
    const center = box.getCenter(new THREE.Vector3());
    avatar.position.sub(center);

    const size = box.getSize(new THREE.Vector3());
    const scale = 2 / size.y;
    avatar.scale.setScalar(scale);

    scene.add(avatar);

    statusText.textContent = "Avatar loaded successfully";
    console.log("Avatar loaded");
  },
  undefined,
  function (error) {
    console.error(error);
    statusText.textContent = "Failed to load avatar";
  }
);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
