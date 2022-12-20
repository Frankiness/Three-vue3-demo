<template>
  <div id="markContainer" ref="markContainer"></div>
</template>

<script setup>
import * as THREE from 'three';
import { onMounted, ref } from 'vue';
import { Web3DRenderer } from '../../utils/Web3DRenderer';

let web3d = ref(null);
let markContainer = ref(null);
let spriteArr = [];

const init = () => {
  web3d = new Web3DRenderer(markContainer.value);
  web3d.setCameraPosition({ x: 500, y: 500, z: 500 });
  const render = () => {
    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};

// 创建sprite
const createSprite = (url) => {
  const textureLoader = new THREE.TextureLoader();
  const spriteMaterial = new THREE.SpriteMaterial({
    map: textureLoader.load(url),
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(4, 4, 1);
  return sprite;
};

const initSpriteScene = () => {
  for (let i = 0; i < 20; i++) {
    const sprite = createSprite('up.png');
    sprite.position.set(10 - Math.random() * 20, 2, 10 - Math.random() * 20);
    web3d.scene.add(sprite);
    spriteArr.push(sprite);
  }

  web3d.orbitControls.addEventListener('change', () => {
    const poiRect = { w: 50, h: 50 };
    const scale = getPoiScale(spriteArr[0].position, poiRect);
    spriteArr.forEach((s) => {
      s.scale.set(Math.min(scale[0], 2), Math.min(scale[1], 2), 1.0);
    });
  });
};

const getPoiScale = (position, poiRect) => {
  if (!position) return;
  const distance = web3d.camera.position.distanceTo(position);
  const top = Math.tan(((web3d.camera.fov / 2) * Math.PI) / 180) * distance; //camera.fov 相机的拍摄角度
  const meterPerPixel = (2 * top) / window.innerHeight;
  const scaleX = poiRect.w * meterPerPixel;
  const scaleY = poiRect.h * meterPerPixel;
  return [scaleX, scaleY, 1.0];
};

onMounted(() => {
  init();
  initSpriteScene();
});
</script>

<style>
#markContainer {
  width: 100%;
  height: 100%;
}
</style>
