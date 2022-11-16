<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { onMounted, ref } from 'vue';
import { Web3DRenderer } from '../../utils/Web3DRenderer';

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

// 创建结合体
function createBuilding() {
  const loader = new GLTFLoader();
  loader.load('city/day.glb', (gltf) => {
    const shader = new THREE.ShaderMaterial({
      // uniforms 是将自己声明的变量传递到着色器中，必须是.value的形式
      uniforms: {
        // 物体表面颜色
        uCityColor: {
          value: new THREE.Color('#4eacdf'),
        },
      },
      vertexShader: `
      varying vec3 vPosition;
      void main()
      {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }`,
      fragmentShader: `
      varying vec3 vPosition; // varying 声明的变量可以共用
      uniform vec3 uCityColor;
      void main()
      {
        //模型的基础颜色
        vec3 distColor=uCityColor;
        gl_FragColor = vec4(distColor, 0.4); // vec4最后一个变量调整透明度
      }`,
      transparent: true,
    });
    gltf.scene.children[0].material = shader;
    gltf.scene.children[0].material.wireframe = true; //线框模式
    gltf.scene.children[0].material.needsUpdate = true;
    web3d.scene.add(gltf.scene);
  });
}

onMounted(() => {
  init();
  createBuilding();
});
</script>

<style>
#container {
  width: 100%;
  height: 100%;
}
</style>
