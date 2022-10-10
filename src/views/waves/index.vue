<template>
  <div id="markContainer" ref="markContainer"></div>
</template>

<script setup>
import * as THREE from "three";
import { onMounted, ref } from "vue";
import { Web3DRenderer } from "../../utils/Web3DRenderer";
import { Wave } from "./index";

//扩散波位置参数
const waveData = [
  {
    position: {
      x: -150,
      y: 15,
      z: 100,
    },
    speed: 0.5,
    color: "#efad35",
    opacity: 0.6,
    radius: 420,
    height: 120,
    renderOrder: 5,
  },
];
let web3d = ref(null);
let markContainer = ref(null);
let group = new THREE.Group();
let time = ref(0);
const init = () => {
  web3d = new Web3DRenderer(markContainer.value);
  web3d.setCameraPosition({ x: 50, y: 50, z: 50 });
  web3d.showStatus(); // 显示帧数
  const render = () => {
    time.value += 0.01; //雷达随时间变化
    requestAnimationFrame(render);
    web3d.stats.update();
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};

const initRadar = () => {
  // 加载扫描效果
  waveData.forEach((data) => {
    const mesh = Wave(data);
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
