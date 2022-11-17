<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { onMounted, ref } from 'vue';
import { Web3DRenderer } from '../../utils/Web3DRenderer';
import Water from './Water';

let web3d = null;
let container = ref(null);
let water,
  time = 0.0;

const vertexShader = `
  varying vec3 vNormal;
      varying vec3 vPositionNormal;
      varying vec2 vUv;
      void main()
      {
          vUv = uv;
          vNormal = normalize( normalMatrix * normal ); // 转换到视图空间
          vPositionNormal = normalize(( modelViewMatrix * vec4(position, 1.0) ).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
`;
const fragmentShader = `
  uniform vec3 glowColor;
  uniform float b;
  uniform float p;
  uniform float s;
  varying vec3 vNormal;
  varying vec3 vPositionNormal;
  varying vec2 vUv;
  void main()
  {
    // 菲涅尔反射等式
    // bias  (b) 值决定了颜色最亮值的位置
    // power (p) 决定了透明度变化速度及方向
    // scale (s) 决定变化方向
    float a = pow( b + s * abs(dot(vNormal, vPositionNormal)), p );
    //gl_FragColor = vec4( glowColor, 1 );
    if(vUv.y < 0.5) {
      gl_FragColor = vec4( glowColor * 0.8, 0.3  );
    }else {
      gl_FragColor = vec4( glowColor, a * (1.0 - vUv.y) );
    }

  }
`;

const createWaterBall = () => {
  const waterGeometry = new THREE.CircleBufferGeometry(20, 32);
  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      './waternormals.jpg',
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      },
    ),
    alpha: 1.0,
    // sunDirection: light.position.clone().normalize(),
    sunColor: 0xffffff,
    // waterColor: 0x001e0f,
    waterColor: new THREE.Color('#20B2AA'),
    distortionScale: 3.7,
    fog: true,
  });
  water.rotation.x = -Math.PI / 2;
  web3d.scene.add(water);

  const shadermaterial = new THREE.ShaderMaterial({
    uniforms: {
      s: { value: -1.0 },
      b: { value: 1.0 },
      p: { value: 2.0 },
      glowColor: { value: new THREE.Color('#20B2AA') },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    // side: THREE.FrontSide,
    // blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.5,
  });

  const geometry = new THREE.SphereBufferGeometry(20, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0.3,
  });
  const sphere = new THREE.Mesh(geometry, shadermaterial);
  web3d.scene.add(sphere);
};

const init = () => {
  web3d = new Web3DRenderer(container.value);
  web3d.setCameraPosition({ x: 50, y: 50, z: 50 });

  // time = performance.now() * 0.001;
  // water.material.uniforms['time'].value += 1.0 / 60.0;

  const render = () => {
    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};

onMounted(() => {
  // createWaterBall();
  init();
});
</script>

<style>
#container {
  width: 100%;
  height: 100%;
}
</style>
