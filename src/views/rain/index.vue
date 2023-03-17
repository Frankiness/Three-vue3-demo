<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { onMounted, ref } from 'vue';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Web3DRenderer } from '../../utils/Web3DRenderer';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';

let web3d = null;
let container = ref(null);
let composer = null;

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

function loadModel() {
  const loader = new GLTFLoader();
  loader.load('model/cybpunk/car.glb', (gltf) => {
    gltf.scene.scale.set(0.1, 0.1, 0.1);
    web3d.scene.add(gltf.scene);
  });
}

function setPostProcess() {
  composer = new EffectComposer(web3d.renderer);

  composer.addPass(new RenderPass(web3d.scene, web3d.camera));

  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 1);
  bloomPass.threshold = 0.8;
  bloomPass.strength = 0.8;
  bloomPass.radius = 0;
  composer.addPass(bloomPass);

  const smaa = new SMAAPass(
    window.innerWidth * web3d.renderer.getPixelRatio(),
    window.innerHeight * web3d.renderer.getPixelRatio(),
  );

  composer.addPass(smaa);

  web3d.tonemapping = THREE.NoToneMapping;
}

onMounted(() => {
  init();
  loadModel();
  setPostProcess();
});
</script>

<style>
#container {
  width: 100%;
  height: 100%;
}
</style>
