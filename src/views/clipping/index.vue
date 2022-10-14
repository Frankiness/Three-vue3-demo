<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
//打开数据库
import { onMounted, ref } from 'vue';
import { Web3DRenderer } from '../../utils/Web3DRenderer';
import * as THREE from 'three';
import * as dat from 'dat.gui';
import { func } from 'vue-types';
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
  localPlane.constant = 0;
  createGUI(localPlane);
};

const createGUI = (localPlane) => {
  const gui = new dat.GUI();
  const control = {
    平面剪裁: 0,
  };
  gui.add(control, '平面剪裁', 0, 100).onChange((v) => {
    localPlane.constant = v;
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
}
</style>
