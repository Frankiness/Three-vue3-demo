<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import * as THREE from 'three';
import * as dat from 'lil-gui';
import { onMounted, onUnmounted, ref } from 'vue';
import { Web3DRenderer } from '../../utils/Web3DRenderer';
import waterVertexShader from './shader/vertex.glsl';
import waterFragmentShader from './shader/fragment.glsl.js';
import { gui } from 'dat.gui';

let web3d = ref(null);
let container = ref(null);
let waterMaterial = undefined;
const debugObject = {};
const clock = new THREE.Clock();

const init = () => {
  web3d = new Web3DRenderer(container.value);
  web3d.setCameraPosition({ x: 1, y: 1, z: 1 });

  initSea();

  const render = () => {
    const elapsedTime = clock.getElapsedTime();
    // Update material
    waterMaterial.uniforms.uTime.value = elapsedTime;

    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};

const initSea = () => {
  debugObject.fogColor = '#fef5ff';

  web3d.scene.background = new THREE.Color(debugObject.fogColor);
  web3d.scene.fog = new THREE.Fog(debugObject.fogColor, 0.5, 3);
  const waterGeometry = new THREE.PlaneGeometry(5, 5, 512, 512);

  // Colors
  debugObject.depthColor = '#283c8a';
  debugObject.surfaceColor = '#a8d9ff';

  // Material
  waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    fog: true,
    uniforms: {
      uTime: { value: 0 },

      uBigWavesElevation: { value: 0.2 },
      uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
      uBigWavesSpeed: { value: 0.75 },

      uSmallWavesElevation: { value: 0.15 },
      uSmallWavesFrequency: { value: 3 },
      uSmallWavesSpeed: { value: 0.2 },
      uSmallWavesIterations: { value: 4 },

      uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
      uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
      uColorOffset: { value: 0.1 },
      uColorMultiplier: { value: 3 },

      fogColor: { value: web3d.scene.fog.color },
      fogNear: { value: web3d.scene.fog.near },
      fogFar: { value: web3d.scene.fog.far },
    },
  });

  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.rotation.x = -Math.PI * 0.5;
  web3d.scene.add(water);
  createGUI();
};

const createGUI = () => {
  const gui = new dat.GUI({ width: 340 });
  gui.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation');
  gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequencyX');
  gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY');
  gui.add(waterMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed');

  gui.add(waterMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(1).step(0.001).name('uSmallWavesElevation');
  gui.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.001).name('uSmallWavesFrequency');
  gui.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value').min(0).max(4).step(0.001).name('uSmallWavesSpeed');
  gui.add(waterMaterial.uniforms.uSmallWavesIterations, 'value').min(0).max(5).step(1).name('uSmallWavesIterations');

  gui
    .addColor(debugObject, 'fogColor')
    .name('fogColor')
    .onChange(() => {
      web3d.scene.background.set(debugObject.fogColor);
      web3d.scene.fog.color.set(debugObject.fogColor);
    });
  gui
    .addColor(debugObject, 'depthColor')
    .name('depthColor')
    .onChange(() => {
      waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor);
    });
  gui
    .addColor(debugObject, 'surfaceColor')
    .name('surfaceColor')
    .onChange(() => {
      waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
    });
  gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset');
  gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier');
};

onMounted(() => {
  init();
});

onUnmounted(() => {
  console.log(gui);
});
</script>

<style>
#container {
  width: 100%;
  height: 100%;
}
</style>
