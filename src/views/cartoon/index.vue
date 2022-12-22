<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { onMounted, ref } from 'vue';
import { Web3DRenderer } from '../../utils/Web3DRenderer';
import vertexShader from './shader/vertex.glsl';
import fragmentShader from './shader/fragment.glsl';

let web3d = ref(null);
let container = ref(null);

const init = () => {
  web3d = new Web3DRenderer(container.value);
  web3d.setCameraPosition({ x: 50, y: 50, z: 50 });
  const render = () => {
    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};

const createModel = () => {
  let groupMesh = null,
    appleMesh = null,
    stemMesh = null;
  const mtlLoader = new MTLLoader();
  mtlLoader.setPath('model/Apple/');
  mtlLoader.load('apple.mtl', function (materials) {
    materials.preload();

    // model loader
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('model/Apple/');
    objLoader.load('apple.obj', function (obj) {
      obj.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          if (!appleMesh) {
            appleMesh = child;
          } else {
            stemMesh = child;
          }
        }
      });

      groupMesh = obj;
      groupMesh.position.set(-50, -50, 0);
      web3d.scene.add(groupMesh);
      setShader(appleMesh);
    });
  });
};

const setShader = (appleMesh) => {
  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      color: {
        // 苹果的基础色
        value: new THREE.Color('#60371b'),
      },
      light: {
        value: new THREE.Vector3(1000, 1000, 500),
      },
    },
  });
  appleMesh.material = material;
};

onMounted(() => {
  init();
  createModel();
});
</script>

<style>
#container {
  width: 100%;
  height: 100%;
}
</style>
