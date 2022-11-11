<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { Web3DRenderer } from '../../utils/Web3DRenderer';
import { onMounted, ref } from 'vue';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

let web3d;
const container = ref(null);
const loader = new GLTFLoader();

/**
 * 初始化Scene
 */
const initScene = async () => {
  web3d = new Web3DRenderer(container.value);
  web3d.setCameraPosition({ x: 0, y: 0, z: 30 });

  const render = () => {
    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};

const createCylinder = () => {
  const geometry = new THREE.CylinderGeometry(5, 5, 20, 32);
  const texture = new THREE.TextureLoader().load('');
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const cylinder = new THREE.Mesh(geometry, material);
  web3d.scene.add(cylinder);
};

onMounted(() => {
  initScene();
  createCylinder();
});
</script>

<style scoped>
#container {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
