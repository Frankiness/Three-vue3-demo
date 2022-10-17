<template>
  <div id="container" ref="container">
    <input
      type="range"
      min="-100"
      max="100"
      step="1"
      value="0"
      class="slider"
      id="myRange"
      style="position: absolute; top: 0; width: 350px"
    />
  </div>
</template>

<script setup>
//打开数据库
import { onMounted, ref } from 'vue';
import { Web3DRenderer } from '../../utils/Web3DRenderer';
import * as THREE from 'three';

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

const initGeometry = () => {
  const geometry = new THREE.TorusKnotGeometry(50, 20, 95, 20);
  const localPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.1);
  const material = new THREE.MeshPhongMaterial({
    color: 0x80ee10,
    shininess: 100,
    side: THREE.DoubleSide,

    // ***** Clipping setup (material): *****
    clippingPlanes: [localPlane],
    clipShadows: true,
  });
  const object = new THREE.Mesh(geometry, material);
  web3d.scene.add(object);

  document.querySelector('#myRange').addEventListener('input', function (evt) {
    localPlane.constant = this.value; // constant是原点到平面的距离
  });
};

onMounted(() => {
  initScene();
  initGeometry();
});
</script>

<style scoped>
#container {
  width: 100%;
  height: 100%;
  position: relative;
}
.slider {
  position: absolute;
  left: 100px;
  top: 30px;
}
</style>
