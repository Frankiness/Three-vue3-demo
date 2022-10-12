<template>
  <div id="markContainer" ref="markContainer">
    <input
      type="range"
      min="0"
      max="1"
      step="0.05"
      value="0"
      class="slider"
      id="myRange"
      style="position: absolute; top: 0; width: 350px"
    />
  </div>
</template>

<script setup>
import * as THREE from 'three';
import { onMounted, ref } from 'vue';
import { Web3DRenderer } from '../../utils/Web3DRenderer';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

let web3d = ref(null);
let markContainer = ref(null);
// 初始化场景
const init = () => {
  web3d = new Web3DRenderer(markContainer.value);
  web3d.setCameraPosition({ x: 800, y: 500, z: 100 });
  const render = () => {
    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};

/**
 * 加载模型（建议使用obj模型，gltf模型存在部分位置偏差）
 */
const load = async () => {
  const loader = new OBJLoader();
  loader.load('model/Obj/new_car.obj', (obj) => {
    createExploder(obj); //如果是gltf模型，则填入obj.scene
  });
};

// 添加爆炸效果
const createExploder = (obj) => {
  //模型包围盒
  const modelBox3 = new THREE.Box3();
  const meshBox3 = new THREE.Box3();

  web3d.scene.add(obj);

  //获取模型的包围盒
  modelBox3.expandByObject(obj);

  //计算模型的中心点坐标，这个为爆炸中心
  const modelWorldPs = new THREE.Vector3()
    .addVectors(modelBox3.max, modelBox3.min)
    .multiplyScalar(0.5);

  //遍历模型每一个组件
  obj.traverse((model) => {
    if (model.isMesh) {
      meshBox3.setFromObject(model);

      //获取每个mesh的中心点，爆炸方向为爆炸中心点指向mesh中心点
      const worldPs = new THREE.Vector3()
        .addVectors(meshBox3.max, meshBox3.min)
        .multiplyScalar(0.5);
      if (isNaN(worldPs.x)) return;
      //计算爆炸方向
      model.worldDir = new THREE.Vector3().subVectors(worldPs, modelWorldPs).normalize();
      //保存初始坐标
      model.userData.oldPs = model.getWorldPosition(new THREE.Vector3());
    }
  });

  const applyScalar = (scalar) => {
    obj.traverse(function (value) {
      if (!value.isMesh || !value.worldDir) return;
      //爆炸公式
      value.position.copy(
        new THREE.Vector3()
          .copy(value.userData.oldPs)
          .add(new THREE.Vector3().copy(value.worldDir).multiplyScalar(scalar)),
      );
    });
  };

  document.querySelector('#myRange').addEventListener('input', function (evt) {
    applyScalar(this.value * 100);
  });
};
onMounted(() => {
  init();
  load();
});
</script>

<style>
#markContainer {
  width: 100%;
  height: 100%;
  position: relative;
}
.slider {
  position: absolute;
  left: 10px;
  top: 30px;
}
</style>
