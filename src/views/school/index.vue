<template>
  <div id="markContainer" ref="markContainer">
    <a-switch @change="onChange" v-model:checked="checked" style="position: ;absolute" />
  </div>
</template>

<script setup>
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { onMounted, ref } from 'vue';
import { Web3DRenderer } from '../../utils/Web3DRenderer';

let web3d = ref(null);
let markContainer = ref(null);
let dayModel, nightModel;

const checked = ref(false);

const onChange = () => {
  if (!checked.value) {
    // dayModel.visible = true;
    // nightModel.visible = false;
    // nightModel.children[0].material.transparent = true;
    // nightModel.children[0].material.opacity = 0.1;

    let timer = setInterval(() => {
      if (dayModel.children[0].material.opacity >= 0.05) {
        nightModel.children[0].material.opacity += 0.1;
        dayModel.children[0].material.opacity -= 0.1;
      } else {
        clearInterval(timer);
      }
    }, 80);
  } else {
    let timer = setInterval(() => {
      if (nightModel.children[0].material.opacity >= 0.05) {
        nightModel.children[0].material.opacity -= 0.1;
        dayModel.children[0].material.opacity += 0.1;
      } else {
        clearInterval(timer);
      }
    }, 80);
  }
};

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

  loader.load('city/night.glb', (gltf) => {
    nightModel = gltf.scene;
    nightModel.children[0].material.transparent = true;
    nightModel.children[0].material.opacity = 0;
    // nightModel.visible = false;
    web3d.scene.add(nightModel);
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
