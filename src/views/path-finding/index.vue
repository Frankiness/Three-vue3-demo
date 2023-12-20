<template>
  <div id="markContainer" ref="markContainer">
    <a-switch @change="onChange" v-model:checked="checked" style="position: ;absolute" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { Web3DRenderer } from '../../utils/Web3DRenderer';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Pathfinding, PathfindingHelper } from 'three-pathfinding';

let web3d = ref(null);
let markContainer = ref(null);

const checked = ref(false);

const init = () => {
  web3d = new Web3DRenderer(markContainer.value);
  web3d.setCameraPosition({ x: 50, y: 50, z: 50 });
  const render = () => {
    tick(clock.getDelta());
    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};

THREE.ColorManagement.enabled = true;

const Color = {
  GROUND: 0x606060,
  NAVMESH: 0xffffff,
};

const ZONE = 'level';
const SPEED = 20;
const OFFSET = 0.2;

let level, navmesh;

let groupID, path;

let playerPositioned = false;

const playerPosition = new THREE.Vector3(-3.5, 0.5, 5.5);
const targetPosition = new THREE.Vector3();

const pathfinder = new Pathfinding();
const helper = new PathfindingHelper();
const clock = new THREE.Clock();
const mouse = new THREE.Vector2();
const mouseDown = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

const scene = new THREE.Scene();
scene.add(helper);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 20000);
camera.position.x = -100;
camera.position.y = 140;
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.damping = 0.2;

const ambient = new THREE.AmbientLight(0x101030);
scene.add(ambient);

const directionalLight = new THREE.DirectionalLight(0xffeedd);
directionalLight.position.set(0, 0.5, 0.5);
scene.add(directionalLight);

createPath();
// animate();

async function createPath() {
  const gltfLoader = new GLTFLoader();
  let playerPositioned = false;
  gltfLoader.load(
    'model/Tianwei/factory_new.glb',
    function (gltf) {
      const levelMesh = gltf.scene.getObjectByName('Factory');

      const levelMat = new THREE.MeshStandardMaterial({
        color: Color.GROUND,
        flatShading: true,
        roughness: 1,
        metalness: 0,
      });
      level = new THREE.Mesh(levelMesh.geometry, levelMat);
      window.level = level;
      // scene.add(level);
      scene.add(gltf.scene);
    },
    null,
  );

  gltfLoader.load(
    'model/Tianwei/ground_new.glb',
    function (gltf) {
      const _navmesh = gltf.scene.getObjectByName('Navmesh');

      console.time('createZone()');
      const zone = Pathfinding.createZone(_navmesh.geometry);
      console.timeEnd('createZone()');

      pathfinder.setZoneData(ZONE, zone);

      _navmesh.position.y = -1;

      navmesh = new THREE.Mesh(
        _navmesh.geometry,
        new THREE.MeshBasicMaterial({
          color: Color.NAVMESH,
          opacity: 0.75,
          transparent: true,
        }),
      );
      scene.add(_navmesh);

      // Set the player's navigation mesh group
      groupID = pathfinder.getGroup(ZONE, playerPosition);
    },
    null,
  );

  helper.setPlayerPosition(new THREE.Vector3(-3.5, 0.5, 5.5)).setTargetPosition(new THREE.Vector3(-3.5, 0.5, 5.5));

  document.addEventListener('pointerdown', onDocumentPointerDown, false);
  document.addEventListener('pointerup', onDocumentPointerUp, false);
  window.addEventListener('resize', onWindowResize, false);
}

function onDocumentPointerDown(event) {
  mouseDown.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouseDown.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onDocumentPointerUp(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  if (Math.abs(mouseDown.x - mouse.x) > 0 || Math.abs(mouseDown.y - mouse.y) > 0) return; // Prevent unwanted click when rotate camera.

  camera.updateMatrixWorld();

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(navmesh);

  if (!intersects.length) return;

  if (!playerPositioned) {
    playerPosition.copy(intersects[0].point);
    targetPosition.copy(intersects[0].point);
    helper.reset().setPlayerPosition(playerPosition).setTargetPosition(playerPosition);
    playerPositioned = true;
    return;
  }

  targetPosition.copy(intersects[0].point);

  helper.reset().setPlayerPosition(playerPosition);

  // Teleport on ctrl/cmd click or RMB.
  if (event.metaKey || event.ctrlKey || event.button === 2) {
    path = null;
    groupID = pathfinder.getGroup(ZONE, targetPosition, true);
    const closestNode = pathfinder.getClosestNode(playerPosition, ZONE, groupID, true);

    helper.setPlayerPosition(playerPosition.copy(targetPosition));
    if (closestNode) helper.setNodePosition(closestNode.centroid);

    return;
  }

  const targetGroupID = pathfinder.getGroup(ZONE, targetPosition, true);
  const closestTargetNode = pathfinder.getClosestNode(targetPosition, ZONE, targetGroupID, true);

  helper.setTargetPosition(targetPosition);
  if (closestTargetNode) helper.setNodePosition(closestTargetNode.centroid);

  // Calculate a path to the target and store it
  path = pathfinder.findPath(playerPosition, targetPosition, ZONE, groupID);

  if (path && path.length) {
    helper.setPath(path);
  } else {
    const closestPlayerNode = pathfinder.getClosestNode(playerPosition, ZONE, groupID);
    const clamped = new THREE.Vector3();

    // TODO(donmccurdy): Don't clone targetPosition, fix the bug.
    pathfinder.clampStep(playerPosition, targetPosition.clone(), closestPlayerNode, ZONE, groupID, clamped);

    helper.setStepPosition(clamped);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

// function animate() {
//   requestAnimationFrame(animate);
//   tick(clock.getDelta());
//   renderer.render(scene, camera);
// }

function tick(dt) {
  if (!level || !(path || []).length) return;

  let targetPosition = path[0];
  const velocity = targetPosition.clone().sub(playerPosition);

  if (velocity.lengthSq() > 0.05 * 0.05) {
    velocity.normalize();
    // Move player to target
    playerPosition.add(velocity.multiplyScalar(dt * SPEED));
    helper.setPlayerPosition(playerPosition);
  } else {
    // Remove node from the path we calculated
    path.shift();
  }
}
onMounted(() => {
  init();
});
</script>

<style>
#markContainer {
  width: 100%;
  height: 100%;
}
</style>
