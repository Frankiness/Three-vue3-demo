<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import * as THREE from 'three';
import { renderer as rendererTS } from './renderer';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { AmbientLight } from 'three';
import { changeModelMaterial, unreal } from './composor';
import { ref, onMounted } from 'vue';
import { loadGltf } from './loaders';

let container = ref(null);

let camera,
  controls,
  directionalLight,
  scene = new THREE.Scene(),
  renderer = rendererTS;

// 辅助线
const width = window.innerWidth,
  height = window.innerHeight;

let finalComposer, bloomComposer, renderScene, bloomPass;
const bloomLayer = new THREE.Layers();
const BLOOM_SCENE = 1;
let hull_turbine, hull_turbine_line, blades_turbine_003, blades_turbine_003_line;
bloomLayer.set(BLOOM_SCENE);

const materials = {};
const lineGroup = new THREE.Group();

const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
const params = {
  threshold: 0,
  strength: 0.972, // 强度
  radius: 0.21, // 半径
  exposure: 1.55, // 扩散
};

let model;
async function init() {
  camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
  camera.position.copy(new THREE.Vector3(3.025669715883166, 0, -2.812027151791605));

  camera.updateMatrixWorld();
  container.value.appendChild(renderer.domElement);

  controls = new TrackballControls(camera, renderer.domElement);

  controls.staticMoving = true;
  controls.rotateSpeed = 4.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;

  controls.addEventListener('change', () => {
    // 灯光位置跟随镜头改变
    directionalLight.position.copy(camera.position);
  });

  const ambientLight = new AmbientLight(0xffffff, 40);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffffff, 40);
  directionalLight.position.copy(camera.position);
  scene.add(directionalLight);

  // 获取发光场景必要元素
  const {
    finalComposer: F,
    bloomComposer: B,
    renderScene: R,
    bloomPass: BP,
  } = unreal(scene, camera, renderer, width, height);
  finalComposer = F;
  bloomComposer = B;
  renderScene = R;
  bloomPass = BP;

  bloomPass.threshold = 0;
}

function darkenNonBloomed(obj) {
  if (bloomLayer) {
    if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
      materials[obj.uuid] = obj.material;
      obj.material = darkMaterial;
    }
  }
}

function restoreMaterial(obj) {
  if (materials[obj.uuid]) {
    obj.material = materials[obj.uuid];
    // 用于删除没必要的渲染
    delete materials[obj.uuid];
  }
}

function gui() {
  const gui = new GUI();

  const bloomFolder = gui.addFolder('bloom');

  bloomFolder.add(params, 'threshold', 0.0, 1.0).onChange((value) => {
    bloomPass.threshold = Number(value);
  });
  // 强度
  bloomFolder.add(params, 'strength', 0.0, 3.0).onChange((value) => {
    bloomPass.strength = Number(value);
  });
  // 半径
  gui
    .add(params, 'radius', 0.0, 1.0)
    .step(0.01)
    .onChange((value) => {
      bloomPass.radius = Number(value);
    });
}

let rotationX = 0.03;

// 渲染函数
function render() {
  controls && controls.update();
  controls && controls.zoomCamera();
  renderer.render(scene, camera);

  if (bloomComposer) {
    scene.traverse(darkenNonBloomed.bind(this));
    bloomComposer.render();
  }
  if (finalComposer) {
    scene.traverse(restoreMaterial.bind(this));
    finalComposer.render();
  }

  // 旋转涡轮
  if (hull_turbine && hull_turbine_line) {
    hull_turbine.rotation.x += rotationX;
    hull_turbine_line.rotation.x += rotationX;
  }
  if (blades_turbine_003) {
    blades_turbine_003.rotation.x += rotationX;
  }
  blades_turbine_003_line && (blades_turbine_003_line.rotation.x += rotationX);
}

async function loadModel() {
  const res = await loadGltf('model/turbine/turbine-01.glb');
  // 使用模型原有场景
  const Sketchfab_model = res.scene.getObjectByName('Sketchfab_model');

  Sketchfab_model.traverse((mesh) => changeModelMaterial(mesh, lineGroup));
  model = Sketchfab_model;

  scene.add(model);
  scene.add(lineGroup);

  // 涡轮
  hull_turbine = scene.getObjectByName('hull_turbine');
  hull_turbine_line = lineGroup.getObjectByName('hull_turbine_line');

  // 涡轮的线
  blades_turbine_003 = scene.getObjectByName('blades_turbine_003');
  blades_turbine_003_line = scene.getObjectByName('blades_turbine_003_line');

  let right_pbr = model.getObjectByName('canister_turbine_011_Nickel-Light-PBR_0');
  let right_pbr_line = lineGroup.getObjectByName('canister_turbine_011_Nickel-Light-PBR_0_line');

  const color = new THREE.Color(0xe98575);
  let errorMeshMaterila = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.6,
  });
  let errorLineMaterila = new THREE.MeshBasicMaterial({
    color,
    depthTest: true,
    transparent: true,
  });

  let oldLineMaterila = right_pbr_line.material.clone();
  let oldMeshMaterila = right_pbr.material.clone();

  let errorFlag = false;

  setInterval(() => {
    if (errorFlag) {
      right_pbr.material = errorMeshMaterila;
      right_pbr_line.material = errorLineMaterila;
    } else {
      right_pbr.material = oldMeshMaterila;
      right_pbr_line.material = oldLineMaterila;
    }
    errorFlag = !errorFlag;
  }, 1000);

  // 创建完线条，两秒后改变其中一个线条的颜色
  // setTimeout(()=>{
  //     lineGroup.children[0].material.color = new THREE.Color(0x22ff00)
  // },2000)
  await init();
  gui();
  ray();
  animate();
}

function ray() {
  let mouse = new THREE.Vector2(); //鼠标位置
  var raycaster = new THREE.Raycaster();
  window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / document.body.offsetWidth) * 2 - 1;
    mouse.y = -(event.clientY / document.body.offsetHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var raylist = raycaster.intersectObjects(model.children);
  });
}

// 循环渲染
function animate() {
  requestAnimationFrame(animate);
  render();
}

onMounted(() => {
  loadModel();
});
</script>

<style>
#container {
  width: 100%;
  height: 100%;
}
</style>
