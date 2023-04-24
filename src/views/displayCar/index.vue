<template>
  <div id="container" ref="container"></div>
  <Mask :show="maskShow" :percent="progress" />
</template>

<script setup>
import * as THREE from 'three';
import { Web3DRenderer } from '../../utils/Web3DRenderer';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import * as dat from 'dat.gui';
import Mask from '../../components/Mask.vue';

let maskShow = ref(true);
let progress = ref(0);
let web3d;
const container = ref(null);
const loader = new GLTFLoader();
const gui = new dat.GUI();

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
      ({ loaded, total }) => {
        progress.value = Math.abs((loaded / total) * 100);
      },
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
  createHDR();
  const render = () => {
    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};

const createGUI = () => {
  const control = {
    color: 0x000000,
  };
  gui.addColor(control, 'color').onChange((v) => {
    setCarColor(v);
  });
};

//设置车身颜色
const setCarColor = (color) => {
  const currentColor = color;
  web3d.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name.includes('Body_Paint')) {
        child.material.color.set(currentColor);
      }
    }
  });
};

// 创建HDR环境贴图
const createHDR = () => {
  new RGBELoader().setPath('texture/hdr/').load('evening_road_01_puresky_4k.hdr', async function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    web3d.scene.background = texture;
    web3d.scene.environment = texture;
    web3d.scene.environment.encoding = THREE.sRGBEncoding;
    console.log(web3d.scene.environment);

    // model
    const gltf = await loadFile('model/Audi/scene.gltf');
    maskShow.value = false; //关闭遮罩层
    gltf.scene.scale.set(0.1, 0.1, 0.1);
    gltf.scene.position.y = 16;
    gltf.scene.traverse((child) => {
      console.log(child);
      if (child.name === '地面') {
        console.log('地面：', child);
      }

      // child.material.emissive = child.material.color;
      // child.material.emissiveMap = child.material.map;
    });
    web3d.scene.add(gltf.scene);
  });
};

onMounted(() => {
  initScene();
  // createGUI();
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

.color-select {
  width: 32px;
  height: 32px;
  padding: 0;
  position: absolute;
  top: 0;
  right: 0;
}
</style>
