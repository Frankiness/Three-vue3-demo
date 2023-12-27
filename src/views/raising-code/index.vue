<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { onMounted, ref } from 'vue';
import { Web3DRenderer } from '../../utils/Web3DRenderer';

let web3d = null;
let container = ref(null);
let cloud,
  plane,
  range = 100;

const vertexShader = `
  varying vec2 vUv;
  void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  }
`;
const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D texture1;
  uniform sampler2D texture2;
  uniform sampler2D texture3;
  uniform sampler2D texture4;
  uniform sampler2D texture5;
  uniform sampler2D texture6;
  uniform sampler2D texture7;
  uniform sampler2D texture8;
  uniform sampler2D texture9;
  
  uniform float random;
  void main() {
    float selfRandom = vUv.y - fract(vUv.y);
    float k = abs(sin(selfRandom * random))*10.0;

    if(k < 1.0) {

      gl_FragColor = texture2D( texture1, vec2(fract(vUv.x), fract(vUv.y)));

    }else if(k < 2.0) {

      gl_FragColor = texture2D( texture2, vec2(fract(vUv.x), fract(vUv.y)));

    }else if(k < 3.0) {

      gl_FragColor = texture2D( texture3, vec2(fract(vUv.x), fract(vUv.y)));

    }else if(k < 4.0) {

      gl_FragColor = texture2D( texture4, vec2(fract(vUv.x), fract(vUv.y)));

    }else if(k < 5.0) {

      gl_FragColor = texture2D( texture5, vec2(fract(vUv.x), fract(vUv.y)));

    }else if(k < 6.0) {

      gl_FragColor = texture2D( texture6, vec2(fract(vUv.x), fract(vUv.y)));

    }else if(k < 7.0) {

      gl_FragColor = texture2D( texture7, vec2(fract(vUv.x), fract(vUv.y)));

    }else if(k < 8.0) {

      gl_FragColor = texture2D( texture8, vec2(fract(vUv.x), fract(vUv.y)));
    }
    else {
      gl_FragColor = texture2D( texture9, vec2(fract(vUv.x), fract(vUv.y)));
    }
  }
`;

function initMaterial() {
  let loader = new THREE.TextureLoader();
  return new THREE.ShaderMaterial({
    uniforms: {
      texture1: {
        value: loader.load('code-images/1.png'),
      },
      texture2: {
        value: loader.load('code-images/2.png'),
      },
      texture3: {
        value: loader.load('code-images/3.png'),
      },
      texture4: {
        value: loader.load('code-images/4.png'),
      },
      texture5: {
        value: loader.load('code-images/5.png'),
      },
      texture6: {
        value: loader.load('code-images/6.png'),
      },
      texture7: {
        value: loader.load('code-images/7.png'),
      },
      texture8: {
        value: loader.load('code-images/8.png'),
      },
      texture9: {
        value: loader.load('code-images/9.png'),
      },
      random: {
        value: Math.random(),
      },
    },

    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    // vertexColors: THREE.VertexColors,   // 以顶点颜色为准进行渲染
    side: THREE.DoubleSide, // 双面可见
    depthWrite: false,
    transparent: true,
  });
}

function createCode() {
  cloud = new THREE.Group();
  web3d.scene.add(cloud);
  const shader_material = initMaterial();

  for (let i = 0; i < 50; i++) {
    let pos = new THREE.Vector3(
      Math.random() * range - range / 2,
      Math.random() * range - range / 2,
      Math.random() * range - range / 2,
    );

    pos.vX = (Math.random() - 0.5) / 3 / 10;
    pos.vY = (0.05 + Math.random() * 0.1) / 5;

    let geometry = new THREE.PlaneGeometry(10, 10);
    let s = Math.floor(Math.random() * 1000) + 1;
    geometry.attributes.uv.array = geometry.attributes.uv.array.map((e) => (e += s));

    plane = new THREE.Mesh(geometry, shader_material);

    plane.position.copy(pos);
    plane.userData.pos = pos;
    cloud.add(plane);
  }
  setInterval(() => {
    shader_material && (shader_material.uniforms.random.value = Math.random());
  }, 100);
}

const init = () => {
  web3d = new Web3DRenderer(container.value);
  web3d.setCameraPosition({ x: 50, y: 50, z: 50 });

  const render = () => {
    if (cloud) {
      cloud.children.map((plane) => {
        plane.rotation.y = web3d.camera.rotation.y;
        let pos = plane.userData.pos;
        plane.position.y += pos.vY;
        pos.vX *= -1;
        if (plane.position.y >= range / 2) plane.position.y = -range / 2;
      });
    }
    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};

onMounted(() => {
  init();
  createCode();
});
</script>

<style>
#container {
  width: 100%;
  height: 100%;
}
</style>
