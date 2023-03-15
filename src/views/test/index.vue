<template>
  <div id="markContainer" ref="markContainer"></div>
</template>

<script setup>
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { onMounted, ref } from 'vue';
import { Web3DRenderer } from '../../utils/Web3DRenderer';

let web3d = ref(null);
let markContainer = ref(null);
let dayModel;

let time = ref(0);
const init = () => {
  web3d = new Web3DRenderer(markContainer.value);
  web3d.setCameraPosition({ x: 50, y: 50, z: 50 });
  const render = () => {
    time.value += 0.01; //雷达随时间变化
    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};

const loadModel = () => {
  const loader = new GLTFLoader();
  loader.load('city/day.glb', (gltf) => {
    gltf.scene.children[0].material.transparent = true;
    dayModel = gltf.scene;
    web3d.scene.add(dayModel);
  });
};

onMounted(() => {
  init();
  loadModel();
});
</script>

<style>
#markContainer {
  width: 100%;
  height: 100%;
}
</style>
