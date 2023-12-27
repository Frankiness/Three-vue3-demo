<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { Web3DRenderer } from '../../utils/Web3DRenderer';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as dat from 'dat.gui';

let web3d;
const container = ref(null);
const loader = new GLTFLoader();
const gui = new dat.GUI();
let model = null;

//使用draco压缩
let dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./draco/gltf/'); // 设置public下的解码路径，注意最后面的/
dracoLoader.setDecoderConfig({ type: 'js' });
dracoLoader.preload();
loader.setDRACOLoader(dracoLoader);

/**
 * 监听模型加载进度
 * @param {String} url 模型地址
 */
const loadFile = (url) => {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        resolve(gltf);
      },
      ({ loaded, total }) => {},
      (err) => {
        reject(err);
      },
    );
  });
};
/**
 * 初始化Scene
 */
const initScene = async () => {
  web3d = new Web3DRenderer(container.value);
  web3d.setCameraPosition({ x: 70, y: 100, z: 100 });
  const render = () => {
    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};

const params = {
  // 光照相关参数
  color: 0x709ec2, // 光源颜色
  intensity: 3.7, // 光照强度
  x: 1000, // 位置
  y: 400,
  z: 1000,

  // 阴影相关参数
  isCastShadow: true, // 是否开启阴影
  sizeCoefficient: 512, // 阴影尺寸系数
  mapSizeWidth: 4,
  mapSizeHeight: 16,
  bias: -0.0005, // 解决条纹阴影的出现

  // mesh
  metalness: 0.95, // 材质与金属的相似度。非金属材质，如木材或石材，使用0.0，金属使用1.0，是center模型默认值为1

  // model
  positionY: 28,
  rotationX: -0.6965,
  rotationY: 0,
  rotationZ: -0.4606,
};

const createGUI = () => {
  const folderLight = gui.addFolder('light');
  folderLight.addColor(params, 'color').onChange((value) => {
    web3d.directionalLight.color = new THREE.Color(value);
  });
  folderLight
    .add(params, 'intensity', 0, 30)
    .step(0.1)
    .onChange((value) => {
      web3d.directionalLight.intensity = value;
    });
  folderLight.add(params, 'x', -2000, 2000).onChange((value) => {
    web3d.directionalLight.position.x = value;
  });
  folderLight.add(params, 'y', 0, 1000).onChange((value) => {
    web3d.directionalLight.position.y = value;
  });
  folderLight.add(params, 'z', -1000, 1000).onChange((value) => {
    web3d.directionalLight.position.z = value;
  });
  folderLight.add(params, 'isCastShadow').onChange((value) => {
    web3d.directionalLight.castShadow = value;
  });
  folderLight
    .add(params, 'mapSizeWidth', 1, 10)
    .step(1)
    .onChange((value) => {
      web3d.directionalLight.shadow.mapSize.width = params.sizeCoefficient * value;
    });

  folderLight
    .add(params, 'mapSizeHeight', 1, 20)
    .step(1)
    .onChange((value) => {
      web3d.directionalLight.shadow.mapSize.height = params.sizeCoefficient * value;
    });
  folderLight
    .add(params, 'bias', -0.003, 0.001)
    .step(0.0001)
    .onChange((value) => {
      web3d.directionalLight.shadow.bias = value;
    });
  folderLight
    .add(params, 'metalness', 0, 1)
    .step(0.01)
    .onChange((value) => {
      model.traverse((child) => {
        if (!child.isMesh) return;

        child.material.metalness = value; // 0-1之间，1会影响环境光和半球光的效果
      });
    });
};

// 创建model
const createModel = async () => {
  // // model
  // const gltf = await loadFile('model/Audi/scene.gltf');
  // gltf.scene.scale.set(0.1, 0.1, 0.1);
  // gltf.scene.position.y = 16;
  // model = gltf.scene;
  // model.position.y = 40;
  // gltf.castShadow = true;
  // web3d.scene.add(gltf.scene);

  let geo = new THREE.BoxBufferGeometry(10, 10, 10);
  let mat = new THREE.MeshPhongMaterial({ color: '#111111' });
  let box = new THREE.Mesh(geo, mat);
  box.position.y = 10;
  box.castShadow = true;
  web3d.scene.add(box);
};

const createFloor = () => {
  let planeGeo = new THREE.PlaneGeometry(1000, 1000);
  let planeMaterial = new THREE.MeshPhongMaterial({ color: '#fcfcfc' });
  let plane = new THREE.Mesh(planeGeo, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 1;
  plane.receiveShadow = true;
  web3d.scene.add(plane);
};

onMounted(() => {
  initScene();
  createModel();
  createGUI();
  createFloor();
});
onBeforeUnmount(() => {
  gui.destroy();
});
</script>

<style scoped>
#container {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
