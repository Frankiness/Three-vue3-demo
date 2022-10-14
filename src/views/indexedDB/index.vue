<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
//打开数据库
import { onMounted, ref } from 'vue';
import { IndexDBCache } from './index';
import { Web3DRenderer } from '../../utils/Web3DRenderer';

let container = ref(null);
let web3d = null;
//初始化场景
const initScene = async () => {
  web3d = new Web3DRenderer(container.value);
  web3d.setCameraPosition({ x: 300, y: 500, z: 1000 });
  const render = () => {
    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};

onMounted(() => {
  initScene();
  const db = new IndexDBCache(() => {
    db.loadModel(web3d.scene, 'model/Audi/scene-processed.gltf').then(() => {
      console.log(`加载完成`);
    });
  });
});
</script>

<style scoped>
#container {
  width: 100%;
  height: 100%;
}
</style>
