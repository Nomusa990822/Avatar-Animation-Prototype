import * as THREE from 'https://unpkg.com/three@0.160.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.1/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'https://unpkg.com/three@0.160.1/examples/jsm/loaders/FBXLoader.js';

const canvas = document.getElementById('sceneCanvas');
const commandInput = document.getElementById('commandInput');
const sendBtn = document.getElementById('sendBtn');
const explanationText = document.getElementById('explanationText');
const intentText = document.getElementById('intentText');
const statusText = document.getElementById('statusText');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020617);

const camera = new THREE.PerspectiveCamera(
  45,
  getCanvasWidth() / getCanvasHeight(),
  0.1,
  1000
);
camera.position.set(0, 1.6, 4.5);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(getCanvasWidth(), getCanvasHeight());

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableDamping = true;
controls.minDistance = 2;
controls.maxDistance = 8;
controls.update();

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 2.2);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2.8);
dirLight.position.set(3, 5, 3);
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

const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b);
scene.add(gridHelper);

let avatar = null;

const fbxLoader = new FBXLoader();
statusText.textContent = 'Loading avatar model...';

fbxLoader.load(
  '/static/models/avatar.fbx',
  (object) => {
    avatar = object;

    avatar.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    centerAndScaleFBX(avatar);
    scene.add(avatar);

    statusText.textContent = 'Avatar loaded successfully.';
  },
  undefined,
  (error) => {
    console.error('Error loading avatar:', error);
    statusText.textContent = 'Failed to load avatar.fbx. Check the model path and file name.';
  }
);

function centerAndScaleFBX(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  box.getSize(size);
  box.getCenter(center);

  model.position.x -= center.x;
  model.position.z -= center.z;

  const height = size.y;
  if (height > 0) {
    const targetHeight = 2.2;
    const scale = targetHeight / height;
    model.scale.setScalar(scale);
  }

  const updatedBox = new THREE.Box3().setFromObject(model);
  const minY = updatedBox.min.y;
  model.position.y -= minY;
}

async function sendCommand() {
  const command = commandInput.value.trim();

  if (!command) {
    explanationText.textContent = 'Please enter a command for the avatar.';
    intentText.textContent = 'empty';
    return;
  }

  statusText.textContent = 'Interpreting command...';

  try {
    const response = await fetch('/interpret', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ command })
    });

    const data = await response.json();

    explanationText.textContent = data.explanation;
    intentText.textContent = data.intent;
    statusText.textContent = `Ready. Suggested animation: ${data.animation}`;

    handleCommandVisualization(data);
  } catch (error) {
    console.error('Error sending command:', error);
    explanationText.textContent = 'There was a problem contacting the backend.';
    intentText.textContent = 'error';
    statusText.textContent = 'Request failed.';
  }
}

function handleCommandVisualization(data) {
  if (!avatar) return;

  switch (data.intent) {
    case 'wave':
      avatar.rotation.y = 0;
      break;
    case 'point_left':
      avatar.rotation.y = Math.PI / 6;
      break;
    case 'point_right':
      avatar.rotation.y = -Math.PI / 6;
      break;
    case 'walk_forward':
      avatar.position.z -= 0.2;
      break;
    case 'walk_backward':
      avatar.position.z += 0.2;
      break;
    case 'clap':
      avatar.rotation.y += 0.1;
      break;
    default:
      break;
  }
}

sendBtn.addEventListener('click', sendCommand);

commandInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendCommand();
  }
});

window.addEventListener('resize', () => {
  camera.aspect = getCanvasWidth() / getCanvasHeight();
  camera.updateProjectionMatrix();
  renderer.setSize(getCanvasWidth(), getCanvasHeight());
});

function getCanvasWidth() {
  return canvas.clientWidth || window.innerWidth;
}

function getCanvasHeight() {
  return canvas.clientHeight || window.innerHeight;
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
