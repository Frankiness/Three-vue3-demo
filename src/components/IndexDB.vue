<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
//打开数据库
import { onMounted, ref } from 'vue';
import { IndexDBCache } from '../utils/utils';
import { Web3DRenderer } from '../utils/Web3DRenderer';

let container = ref(null);
let web3d = null;
//初始化场景
const initScene = async () => {
  web3d = new Web3DRenderer(container.value);
  web3d.setCameraPosition({ x: 300, y: 500, z: 1000 });
  web3d.showStatus();
  const render = () => {
    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
    web3d.stats.update();
  };
  render();
};

onMounted(() => {
  initScene();
  const db = new IndexDBCache(async () => {
    db.loadModel(web3d.scene, 'model/Audi/scene-processed.gltf').then((t) => {});
  });
});
</script>

<style scoped>
#container {
  width: 100%;
  height: 100%;
}
</style>
