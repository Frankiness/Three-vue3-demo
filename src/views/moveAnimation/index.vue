<template>
  <div id="markContainer" ref="markContainer"></div>
</template>

<script setup>
import * as THREE from 'three';
import { onMounted, ref } from 'vue';
import { Web3DRenderer } from '../../utils/Web3DRenderer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

let web3d = ref(null);
let markContainer = ref(null);

const loopTime = 10 * 1000;

const init = () => {
  web3d = new Web3DRenderer(markContainer.value);
  web3d.setCameraPosition({ x: 30, y: 30, z: 30 });
  const render = () => {
    let time = Date.now();
    let t = (time % loopTime) / loopTime; // t取值范围[0-1]
    let position = curve?.getPoint(t); // 获取线段上点的位置
    if (position?.x && model) {
      changePosition(position);
    }
    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};

let curve;
// 创建运动轨迹
const makeCurve = () => {
  curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 10),
    new THREE.Vector3(10, 0, 0),
  ]);
  curve.curveType = 'catmullrom';
  curve.closed = true; // 设置是否闭环
  curve.tension = 1; // 设置线的张力，0为无弧度折线

  // 为曲线添加材质在场景中显示出来，不显示也不会影响运动轨迹，相当于一个helper
  const points = curve.getPoints(100); // 100等分获取曲线点数组
  const geometry = new THREE.BufferGeometry().setFromPoints(points); //把顶点坐标赋值给几何体
  const material = new THREE.LineBasicMaterial({ color: 0x000000 });
  const curveObject = new THREE.Line(geometry, material);
  web3d.scene.add(curveObject);
};

let model = null;
const loadModel = async () => {
  const dracoLoader = new DRACOLoader().setDecoderPath('/draco/');
  const gltfLoader = new GLTFLoader().setDRACOLoader(dracoLoader);

  const obj = await gltfLoader.loadAsync('/model/Benz/draco-benz.glb');
  model = obj.scene;
  model.rotation.set(0, Math.PI, 0);
  model.scale.set(0.5, 0.5, 0.5);
  web3d.scene.add(model);
};

function changePosition(position) {
  //模型的偏移量
  let offsetAngle = -Math.PI / 2;
  //创建一个4维矩阵
  let mtx = new THREE.Matrix4();
  mtx.lookAt(model.position.clone(), position, model.up);
  mtx.multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, offsetAngle, 0)));
  //计算出需要进行旋转的四元数值
  let toRot = new THREE.Quaternion().setFromRotationMatrix(mtx);
  //根据以上值调整角度
  model.quaternion.slerp(toRot, 0.2); // 如果是ArcCurve则不需要设置四元数
  model.position.set(position.x, position.y, position.z);
}

onMounted(() => {
  init();
  makeCurve();
  loadModel();
});
</script>

<style>
#markContainer {
  width: 100%;
  height: 100%;
}
</style>
