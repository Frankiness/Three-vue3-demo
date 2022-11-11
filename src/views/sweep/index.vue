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
let time = ref(0.0);
const textureLoader = new THREE.TextureLoader();

const init = () => {
  web3d = new Web3DRenderer(container.value);
  web3d.setCameraPosition({ x: 50, y: 50, z: 50 });
  const render = () => {
    time.value += 1.0;
    if (time.value > 120) {
      time.value = -200;
    }

    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};

// 创建结合体
function createMesh() {
  const loader = new GLTFLoader()
  loader.load('/model/glTF/city.glb',(gltf)=>{
    const shader = new THREE.ShaderMaterial({
    uniforms: {
      time: time,
      colorTexture: {
        value: textureLoader.load('texture/image/building.png'),
      },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 iPosition;
      void main() {
        vUv = uv;
        iPosition = position; // -1.0 -> 1.0
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,

    fragmentShader: `
      uniform float time;
      varying vec2 vUv;
      varying vec3 iPosition;
      uniform sampler2D colorTexture;

      void main() {
        vec4 diff = texture2D( colorTexture, vUv);
        float x = iPosition.x;
        float lighty = -x*1.2 + time;
        float alpha = abs(iPosition.y - lighty);

        if(alpha < 2.0){
          float a = 1.0 -  alpha / 0.1;
          float enda = smoothstep(1.0, 0.0,a) + 0.3;

          // 卢马换算公式光度;
          float diffA = 0.2126*diff.r + 0.7152*diff.g + 0.0722*diff.b;

          gl_FragColor = mix(vec4(diff.xyz * 0.3, 1.0), diff * enda, diffA);

        }else{
          gl_FragColor = vec4(diff.xyz * 0.3, 0.5);
        }
      }`,
    });
    gltf.scene.children[2].material = shader
    gltf.scene.children[2].material.needsUpdate  = true;
    web3d.scene.add(gltf.scene);
  })
}

onMounted(() => {
  init();
  createMesh();
});
</script>

<style>
#container {
  width: 100%;
  height: 100%;
}
</style>
