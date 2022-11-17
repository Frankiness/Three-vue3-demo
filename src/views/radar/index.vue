<template>
  <div id="markContainer" ref="markContainer"></div>
</template>

<script setup>
import * as THREE from 'three';
import { onMounted, ref } from 'vue';
import { Web3DRenderer } from '../../utils/Web3DRenderer';
import { Radar } from './index';

//雷达波位置参数
const radarData = [
  {
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    radius: 150,
    color: '#ff0000',
    opacity: 0.5,
    speed: 2,
  },
];
let web3d = ref(null);
let markContainer = ref(null);
let group = new THREE.Group();
let time = ref(0);
const init = () => {
  web3d = new Web3DRenderer(markContainer.value);
  web3d.setCameraPosition({ x: 500, y: 500, z: 500 });
  const render = () => {
    time.value += 0.01; //雷达随时间变化
    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};

const initRadar = () => {
  // 加载扫描效果
  radarData.forEach((data) => {
    const mesh = Radar(data);
    mesh.material.uniforms.time = time;
    group.add(mesh);
  });
  web3d.scene.add(group);
};
onMounted(() => {
  init();
  initRadar();
});
</script>

<style>
#markContainer {
  width: 100%;
  height: 100%;
}
</style>
