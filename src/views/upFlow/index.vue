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
let height = ref(0.0);

const init = () => {
  web3d = new Web3DRenderer(container.value);
  web3d.setCameraPosition({ x: 50, y: 50, z: 50 });
  const render = () => {
    height.value += 0.5;
    if (height.value > 50) {
      height.value = 5;
    }

    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};

// 创建结合体
function createBuilding() {
  const loader = new GLTFLoader()
  loader.load('city/day.glb',(gltf)=>{
    console.log(gltf);
    const shader = new THREE.ShaderMaterial({
    // uniforms 是将自己声明的变量传递到着色器中，必须是.value的形式
    uniforms: {
      height: height,
      // 上升线颜色
      uFlowColor: {
        value: new THREE.Color('#5588aa'),
      },
      // 物体表面颜色
      uCityColor: {
        value: new THREE.Color('#FFFFDC'),
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
      uniform float height;
      uniform vec3 uFlowColor;
      uniform vec3 uCityColor;
      void main()
      {
        //模型的基础颜色
        vec3 distColor=uCityColor;
        // 定义流动线的范围
        float topY = vPosition.y +2.0;
        if (height > vPosition.y && height < topY) {
          // 在这个范围内的颜色是蓝色，不然就是白色
          distColor = uFlowColor; 
        }
        gl_FragColor = vec4(distColor, 0.6); // vec4最后一个变量调整透明度
      }`,
    transparent: true,
  });
    gltf.scene.children[0].material = shader
    gltf.scene.children[0].material.needsUpdate  = true;
    web3d.scene.add(gltf.scene);
  })
  
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
