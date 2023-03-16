<template>
  <div id="markContainer" ref="markContainer"></div>
</template>

<script setup>
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { onMounted, ref } from 'vue';
import { Web3DRenderer } from '../../utils/Web3DRenderer';
import { Raycaster, Vector2 } from 'three';
import TWEEN from '@tweenjs/tween.js';
import { setTweens } from './move';

let web3d = ref(null);
let markContainer = ref(null);
let model,
  container = null;

let time = ref(0);
const init = () => {
  web3d = new Web3DRenderer(markContainer.value);
  web3d.setCameraPosition({ x: 50, y: 50, z: 50 });
  const render = () => {
    time.value += 0.01; //雷达随时间变化
    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
    TWEEN.update();
  };
  render();
};

const loadModel = () => {
  const loader = new GLTFLoader();
  loader.load('model/Tianwei/one.glb', (gltf) => {
    web3d.scene.add(gltf.scene);
  });
};
// 射线点击
function addRaycaster(event) {
  console.log(event);
  const ray = new Raycaster();
  const mouse = new Vector2();
  const px = web3d.renderer.domElement.getBoundingClientRect().left;
  const py = web3d.renderer.domElement.getBoundingClientRect().top;
  // 鼠标点位的坐标
  mouse.x = ((event.clientX - px) / web3d.renderer.domElement.offsetWidth) * 2 - 1;
  mouse.y = -((event.clientY - py) / web3d.renderer.domElement.offsetHeight) * 2 + 1;
  ray.setFromCamera(mouse, web3d.camera);

  // intersectObjects 第一个参数是一个数组 传 场景(scence)的各个对象 第二个参数 是否检查后代对象
  const intersects = ray.intersectObjects(web3d.scene.children, true);

  if (intersects.length > 0) {
    console.log('scene:', web3d.scene);
    console.log('name:', intersects[0].object.parent.name.slice(0, 2));
    model = intersects[0];
    showInnerFloor(intersects[0], 5);
  }
}

/**
 * 展示内部楼层
 * @param {*} intersectObj 射线拾取的对象
 */
const showInnerFloor = (intersectObj, direction) => {
  let innerModels = [];
  for (const item of web3d.scene.children) {
    if (item.name === 'Scene') {
      innerModels = item.children;
      break;
    }
  }
  innerModels = innerModels.filter((i) => i.name.includes('53F')); // 剔除外部模型
  console.log('内部模型：', innerModels);
  intersectObj.object.parent.visible = direction > 0 ? false : true; // 隐藏外部

  for (let i = 0; i < innerModels.length; i++) {
    if (i !== 0) {
      let { x, y, z } = innerModels[i].position;
      // 除第一层外都拉开高度
      setTweens(innerModels[i].position, {
        x,
        y: y + i * direction,
        z,
      });
      if (direction < 0) innerModels[i].visible = false;
    }
  }
  container.removeEventListener('click', addRaycaster);
};

/**
 * 初始化鼠标事件
 */
function initListener() {
  container = document.querySelector('body');
  container.addEventListener('click', addRaycaster);

  container.addEventListener('keyup', (e) => {
    showInnerFloor(model, -5);
  });
}

onMounted(() => {
  init();
  loadModel();
  initListener();
});
</script>

<style>
#markContainer {
  width: 100%;
  height: 100%;
}
</style>
