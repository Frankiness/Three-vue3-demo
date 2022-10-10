<template>
  <div id="markContainer" ref="markContainer"></div>
</template>

<script setup>
import * as THREE from "three";
import { onMounted, ref } from "vue";
import { Web3DRenderer } from "../../utils/Web3DRenderer";
import { flyLine } from "./index";

//飞线位置参数
const lineData = [
  {
    source: {
      x: -150,
      y: 15,
      z: 100,
    },
    target: {
      x: -666,
      y: 25,
      z: 202,
    },
    range: 120,
    height: 100,
    color: "#ff0000",
    speed: 1,
    size: 10,
  },
  {
    source: {
      x: -150,
      y: 15,
      z: 100,
    },
    target: {
      x: 666,
      y: 22,
      z: 0,
    },
    height: 300,
    range: 150,
    color: "#ff0000",
    speed: 1,
    size: 10,
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
  lineData.forEach((data) => {
    const mesh = flyLine(data);
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
