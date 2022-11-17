<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { onMounted, ref } from 'vue';
import { Web3DRenderer } from '../../utils/Web3DRenderer';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { Color, Vector2, Raycaster } from 'three';

let web3d = null;
let container = ref(null);
let composer = undefined;
let selectedObjects = [];
let outlinePass;

/**
 * 初始化outline通道
 */
function initOutlinePass() {
  composer = new EffectComposer(web3d.renderer);
  // 新建一个场景通道  为了覆盖到原理来的场景上
  const renderPass = new RenderPass(web3d.scene, web3d.camera);
  composer.addPass(renderPass);
  // 防止光源过暗
  composer.renderTarget1.texture.encoding = THREE.sRGBEncoding;
  composer.renderTarget2.texture.encoding = THREE.sRGBEncoding;
  // 物体边缘发光通道
  outlinePass = new OutlinePass(
    new Vector2(window.innerWidth, window.innerHeight),
    web3d.scene,
    web3d.camera,
  );
  outlinePass.selectedObjects = selectedObjects; //必须是数组，坑
  outlinePass.edgeStrength = 10.0; // 边框的亮度
  outlinePass.edgeGlow = 0.7; // 光晕[0,1]
  outlinePass.edgeThickness = 5.0; // 边框宽度
  outlinePass.downSampleRatio = 1; // 边框弯曲度
  outlinePass.pulsePeriod = 5; // 呼吸闪烁的速度
  outlinePass.visibleEdgeColor.set(parseInt(0xffffff)); // 呼吸显示的颜色
  outlinePass.hiddenEdgeColor = new Color(0, 0, 0); // 呼吸消失的颜色
  // outlinePass.clear = true;
  composer.addPass(outlinePass);

  // 自定义的着色器通道 作为参数
  const effectFXAA = new ShaderPass(FXAAShader);
  effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight);
  effectFXAA.renderToScreen = true;
  composer.addPass(effectFXAA);
}

/**
 * 添加outline到一个物体
 */
function addOutlineToObject(object) {
  // 改变所选物体只需要改变 outlinePass.selectedObjects 的值即可
  outlinePass.selectedObjects = [object];
}

/**
 * 射线检测
 * @param {MouseEvent} event
 */
function addRaycaster(event) {
  const ray = new Raycaster();
  const mouse = new Vector2();
  const px = web3d.renderer.domElement.getBoundingClientRect().left;
  const py = web3d.renderer.domElement.getBoundingClientRect().top;
  // 鼠标点位的坐标
  mouse.x = ((event.clientX - px) / web3d.renderer.domElement.offsetWidth) * 2 - 1;
  mouse.y = -((event.clientY - py) / web3d.renderer.domElement.offsetHeight) * 2 + 1;
  ray.setFromCamera(mouse, web3d.camera);

  // intersectObjects 第一个参数是一个数组 传 场景(scence)的各个对象 第二个参数 是否检查后代对象
  const intersects = ray.intersectObjects(web3d.scene.children, true);
  if (intersects.length > 0) {
    addOutlineToObject(intersects[0].object);
  }
}

function createModel() {
  const loader = new GLTFLoader();
  loader.load('/city/day.glb', (gltf) => {
    web3d.scene.add(gltf.scene);
  });
}

const init = () => {
  web3d = new Web3DRenderer(container.value);
  web3d.setCameraPosition({ x: 50, y: 50, z: 50 });
  const render = () => {
    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
    composer && composer.render();
  };
  render();
};

onMounted(() => {
  init();
  initOutlinePass();
  // 射线检测
  container.value.addEventListener('click', (e) => {
    addRaycaster(e);
  });
  createModel();
});
</script>

<style>
#container {
  width: 100%;
  height: 100%;
}
</style>
