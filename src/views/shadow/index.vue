<template>
  <div id="chart" ref="shadowContainer"></div>
</template>

<script setup>
import * as THREE from "three";
import { onMounted } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ref } from "vue";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

let shadowContainer = ref(null);
const init = () => {
  const scene = new THREE.Scene();
  scene.background = 0xffffff
  const camera = new THREE.PerspectiveCamera(45, 16 / 9, 1, 1000, 1);
  const geometry = new THREE.BoxGeometry(1, 1, 1); //代表x,y,z三个方向的值
  const material = new THREE.MeshBasicMaterial({ color: 0xdddddd }); //指定立方体的材质、颜色...
  const cube = new THREE.Mesh(geometry, material); //通过Mesh（网格）将立方体与材质融合
  cube.position.set(0, 5, 0);
  cube.castShadow = true;
  scene.add(cube); //添加立方体到scene中

  camera.position.set(10, 10, 10);
  const renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  shadowContainer.value.appendChild(renderer.domElement);
  let controls = new OrbitControls(camera, renderer.domElement); //轨迹控制

  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });
  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.rotation.x = Math.PI * -0.5;
  groundMesh.receiveShadow = true; // 接受阴影
  scene.add(groundMesh);

  let spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(100, 80, 10);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 2048 * 2; //阴影贴图宽度设置为2048像素（数值过大会卡顿）
  spotLight.shadow.mapSize.height = 2048 * 2; //阴影贴图高度设置为2048像素
  const spotLightHelper = new THREE.SpotLightHelper(spotLight, 50, 0xfff000);
  scene.add(spotLightHelper);
  scene.add(spotLight);

  const gltfLoader = new GLTFLoader()
  gltfLoader.load('model/Audi/scene.gltf',(gltf)=>{
    gltf.scene.scale.set(0.01, 0.01, 0.01);
    gltf.scene.position.y = 1;
    gltf.scene.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true
      }
    });
    scene.add(gltf.scene)
  })

  function animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera); //重新渲染scene与camera
    requestAnimationFrame(animate); //循环执行
  }

  animate();
};
onMounted(() => {
  init();
});
</script>

<style scoped>
#chart {
  width: 100%;
  height: 80%;
  position: relative;
}
</style>
