<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Pathfinding } from 'three-pathfinding';
import { PathfindingHelper } from '../../utils/PathfindingHelper';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import {ref,onMounted} from "vue";

THREE.ColorManagement.enabled = true;

const Color = {
  GROUND: 0x606060,
  NAVMESH: 0xffffff,
};

const ZONE = 'level';
const SPEED = 20;

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

let container = ref(null)

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    20000,
);
camera.position.x = -100;
camera.position.y = 140;
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
renderer.outputEncoding = THREE.sRGBEncoding;


const controls = new OrbitControls(camera, renderer.domElement);
controls.damping = 0.2;

const ambient = new THREE.AmbientLight(0x101030);
scene.add(ambient);

const directionalLight = new THREE.DirectionalLight(0xffeedd);
directionalLight.position.set(0, 0.5, 0.5);
scene.add(directionalLight);

async function init() {
  // glb 是压缩的gltf，需要使用 dracoLoader 解压缩
  const dracoLoader = new DRACOLoader().setDecoderPath('/draco/');
  // gltf 加载器
  const gltfLoader = new GLTFLoader().setDRACOLoader(dracoLoader);

  gltfLoader.load(
      'model/Tianwei/factory.glb',
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
      'model/Tianwei/ground.glb',
      function (gltf) {
        const _navmesh = gltf.scene.getObjectByName('Navmesh');

        const zone = Pathfinding.createZone(_navmesh.geometry);

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

  helper
      .setPlayerPosition(new THREE.Vector3(-3.5, 0.5, 5.5))
      .setTargetPosition(new THREE.Vector3(-3.5, 0.5, 5.5));

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

  if (
      Math.abs(mouseDown.x - mouse.x) > 0 ||
      Math.abs(mouseDown.y - mouse.y) > 0
  )
    return; // Prevent unwanted click when rotate camera.

  camera.updateMatrixWorld();

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(navmesh);

  if (!intersects.length) return;

  if (!playerPositioned) {
    playerPosition.copy(intersects[0].point);
    targetPosition.copy(intersects[0].point);
    helper
        .reset()
        .setPlayerPosition(playerPosition)
        .setTargetPosition(playerPosition);
    playerPositioned = true;
    return;
  }

  targetPosition.copy(intersects[0].point);

  helper.reset().setPlayerPosition(playerPosition);

  // Teleport on ctrl/cmd click or RMB.
  if (event.metaKey || event.ctrlKey || event.button === 2) {
    path = null;
    groupID = pathfinder.getGroup(ZONE, targetPosition, true);
    const closestNode = pathfinder.getClosestNode(
        playerPosition,
        ZONE,
        groupID,
        true,
    );

    helper.setPlayerPosition(playerPosition.copy(targetPosition));
    if (closestNode) helper.setNodePosition(closestNode.centroid);

    return;
  }

  const targetGroupID = pathfinder.getGroup(ZONE, targetPosition, true);
  const closestTargetNode = pathfinder.getClosestNode(
      targetPosition,
      ZONE,
      targetGroupID,
      true,
  );

  helper.setTargetPosition(targetPosition);
  if (closestTargetNode) helper.setNodePosition(closestTargetNode.centroid);

  // Calculate a path to the target and store it
  path = pathfinder.findPath(playerPosition, targetPosition, ZONE, groupID);

  if (path && path.length) {
    helper.setPath(path);
  } else {
    const closestPlayerNode = pathfinder.getClosestNode(
        playerPosition,
        ZONE,
        groupID,
    );
    const clamped = new THREE.Vector3();

    // TODO(donmccurdy): Don't clone targetPosition, fix the bug.
    pathfinder.clampStep(
        playerPosition,
        targetPosition.clone(),
        closestPlayerNode,
        ZONE,
        groupID,
        clamped,
    );

    helper.setStepPosition(clamped);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  tick(clock.getDelta());
  renderer.render(scene, camera);
}

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

onMounted(()=>{
  container.value.appendChild(renderer.domElement);
  init();
  animate();
})

</script>

<template>
  <div id="container" ref="container">
    <div class="container">
      <div class="text">点击道路</div>
      <div class="text">右键设置起点</div>
      <div class="text">左键设置终点</div>
    </div>
  </div>
</template>
<style scoped>
body {
  width: 99vw;
  height: 98vh;
}
.container {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 100;
  width: 150px;
  background-color: rgba(31, 28, 24, 0.5);
  padding: 20px;
}
.text {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}
</style>
