<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { onMounted, ref } from 'vue';
import { Web3DRenderer } from '../../utils/Web3DRenderer';
// import h337 from 'heatmap.js';
import { data } from '/public/data/heatdata.js';

let web3d = ref(null);
let container = ref(null);

function generateMaterial() {
  let wrap = document.createElement('div');
  wrap.style.width = '600px';
  wrap.style.height = '300px';
  document.body.appendChild(wrap);

  const heatmapInstance = h337.create({
    container: wrap,
    backgroundColor: '#000',
    radius: 10, // [0,+∞)
    opacity: 0.6,
  });

  const mapData = {
    max: 100,
    data,
  };

  heatmapInstance.setData(mapData); //数据绑定还可以使用
  const canvas = wrap.childNodes[0];
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.MeshLambertMaterial({
    map: texture,
    // depthTest: false,
    // depthWrite: false,
    // side: THREE.DoubleSide,
    transparent: true,
  });
  document.body.removeChild(wrap);
  wrap = null;
  return material;
}

function generateGeometry() {
  const geometry = new THREE.PlaneGeometry(120, 60, 599, 299);
  computedHeight(geometry);
  return geometry;
}

function computedHeight(geometry) {
  let wrap = document.createElement('div');
  wrap.style.width = '600px';
  wrap.style.height = '300px';
  document.body.appendChild(wrap);

  const heatmapInstance = h337.create({
    container: wrap,
    backgroundColor: '#000',
    radius: 10, // [0,+∞) 热力图像素大小
    opacity: 0.8,
    gradient: {
      0: '#000000', //value为0的颜色
      1: '#ffffff', //value为100的颜色
    },
  });

  const mapData = {
    max: 100,
    data,
  };

  heatmapInstance.setData(mapData); //数据绑定还可以使用
  const canvas = wrap.childNodes[0];
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, 600, 300); //获取所有像素点

  // 遍历计算高度
  let n = 2;
  for (let i = 0; i < imgData.data.length; i = i + 4) {
    const r = imgData.data[i] / 255;
    const g = imgData.data[i + 1] / 200;
    const b = imgData.data[i + 2] / 255;
    const a = imgData.data[i + 3];
    const h = ((r * 9 + g * 4 + b * 1) * a) / 500;

    const index = n + i;
    if (geometry.attributes.position.array[index] !== undefined) {
      geometry.attributes.position.array[index] = h; //顶点数组的第三个是高度
    }
    n -= 1;
  }
  document.body.removeChild(wrap);
  wrap = null;
}

const init = () => {
  web3d = new Web3DRenderer(container.value);
  web3d.setCameraPosition({ x: 50, y: 50, z: 50 });

  // 添加 heatmap
  const mat = generateMaterial();
  const geometry = generateGeometry();
  geometry.computeVertexNormals(); // 用于保证正确渲染纹理 光照 阴影
  const plane = new THREE.Mesh(geometry, mat);
  plane.rotation.x = -Math.PI / 2;
  web3d.scene.add(plane);

  const render = () => {
    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};

onMounted(() => {
  init();
});
</script>

<style>
#container {
  width: 100%;
  height: 100%;
}
</style>
