import * as THREE from 'https://unpkg.com/three@0.160.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.1/examples/jsm/loaders/GLTFLoader.js';

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
camera.position.set(0, 1.5, 4);

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

const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
dirLight.position.set(3, 5, 3);
scene.add(dirLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.1,
    roughness: 0.9
  })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
scene.add(floor);

const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b);
scene.add(gridHelper);

let avatar = null;
const loader = new GLTFLoader();

statusText.textContent = 'Loading avatar model...';

loader.load(
  '/static/models/avatar.glb',
  (gltf) => {
    avatar = gltf.scene;

    centerAndScaleModel(avatar);

    scene.add(avatar);
    statusText.textContent = 'Avatar loaded successfully.';
  },
  undefined,
  (error) => {
    console.error('Error loading avatar:', error);
    statusText.textContent = 'Failed to load avatar.glb. Check the model path and file name.';
  }
);

function centerAndScaleModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  box.getSize(size);
  box.getCenter(center);

  model.position.sub(center);

  const maxDimension = Math.max(size.x, size.y, size.z);
  if (maxDimension > 0) {
    const targetHeight = 2.2;
    const scale = targetHeight / size.y;
    model.scale.setScalar(scale);
  }

  const newBox = new THREE.Box3().setFromObject(model);
  const newCenter = new THREE.Vector3();
  newBox.getCenter(newCenter);

  model.position.x -= newCenter.x;
  model.position.z -= newCenter.z;

  const minY = newBox.min.y;
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
  } catch (error) {
    console.error('Error sending command:', error);
    explanationText.textContent = 'There was a problem contacting the backend.';
    intentText.textContent = 'error';
    statusText.textContent = 'Request failed.';
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
