<template>
  <div id="container" ref="container">
    <a-input @change="selectColor" type="color" class="color-select"/>
  </div>
  <Mask :show="maskShow" :percent="progress"/>
</template>
<!--suppress JSVoidFunctionReturnValueUsed -->
<script setup>
import * as THREE from "three";
import {CubeTextureLoader, LightProbe} from "three";
import RendererTemplate from "../utils/RendererTemplate";
import {onMounted, ref} from "vue";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {LightProbeGenerator} from "three/examples/jsm/lights/LightProbeGenerator";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";

import Mask from './Mask.vue'

let maskShow = ref(true)
let progress = ref(0)
let template, pointLight;
const container = ref(null);
const loader = new GLTFLoader();
//使用draco压缩
let dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./draco/gltf/"); // 设置public下的解码路径，注意最后面的/
dracoLoader.setDecoderConfig({type: "js"});
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
        ({loaded, total}) => {
          progress.value = Math.abs((loaded / total) * 100)
        },
        (err) => {
          reject(err);
        }
    );
  });
};
/**
 * 初始化Scene
 */
const initScene = async () => {
  template = new RendererTemplate(container._value);
  template.init();
  // const house = await loadFile("model/Scene/scene.gltf");
  // house.scene.scale.set(10, 10, 10);
  // house.scene.position.set(0, 28, 0);

  // template.scene.add(house.scene)
  addLightProbe();
  // initLight()
};
//颜色选择
const selectColor = (e) => {
  setCarColor(e.target._value);
};

//设置车身颜色
const setCarColor = (color) => {
  const currentColor = color;
  template.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name.includes("Body_Paint")) {
        child.material.color.set(currentColor);
      }
    }
  });
};
//拆解模型
const dismantleModel = () => {
  let r = 60;
  template.scene.traverse((child) => {
    if (child.isMesh) {
      child.fromPosition = [
        child.position.x,
        child.position.y,
        child.position.z,
      ];
      child.toPosition = [
        Math.random() * r,
        Math.random() * r,
        Math.random() * r,
      ];
    }
  });
};

// envmap
const genCubeUrls = function (prefix, postfix) {
  return [
    prefix + "px1" + postfix,
    prefix + "nx1" + postfix,
    prefix + "py1" + postfix,
    prefix + "ny1" + postfix,
    prefix + "pz1" + postfix,
    prefix + "nz1" + postfix,
  ];
};
const urls = genCubeUrls("texture/pisa/", ".png");
// 光探针
const addLightProbe = () => {
  let lightProbe = new LightProbe();
  template.scene.add(lightProbe);
  new CubeTextureLoader().load(urls, async function (cubeTexture) {
    cubeTexture.encoding = THREE.sRGBEncoding;

    // template.scene.background = cubeTexture; // 添加至场景中
    lightProbe.copy(LightProbeGenerator.fromCubeTexture(cubeTexture));

    // const gltf = await loadFile('model/Audi/scene.gltf')

    new RGBELoader()
        .setPath("texture/hdr/")
        .load("royal_esplanade_4k.hdr", async function (texture) {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          template.scene.background = texture;
          template.scene.environment = texture;
          template.render();

          // model
          const gltf = await loadFile("model/Audi/scene.gltf");
          maskShow.value = false //关闭遮罩层
          gltf.scene.scale.set(0.1, 0.1, 0.1);
          template.scene.add(gltf.scene);
          template.render();
        });
    // const gltf = await loadFile('model/Audi/scene.gltf')
    // let trex = gltf.scene
    // trex.scale.set(0.05, 0.05, 0.05);
    // trex.position.set(-10, 9, -50);
    // trex.rotation.set(0, Math.PI / 1.2, 0);
    // trex.traverse((node) => {
    //   if (node.isMesh) {
    //     node.castShadow = true;
    //     node.receiveShadow = true
    //   }
    // });
    //
    // const material = new THREE.MeshStandardMaterial({
    //   color: 0xffffff,
    //   metalness: 0,
    //   roughness: 0,
    //   envMap: cubeTexture,
    //   envMapIntensity: 1,
    // });
    //
    // // mesh
    // trex.traverse(function (child) {
    //   if (child.name.includes('Body_Paint')) {
    //     child.material = material;
    //     child.material.emissiveMap = child.material.map;
    //   }
    // });
    // template.scene.add(gltf.scene);
  });
};
const initLight = () => {
  pointLight = new THREE.PointLight(0xffffff, 0.2);
  pointLight.position.set(-21, 50, -20);
  pointLight.castShadow = true;
  pointLight.shadow.mapSize.width = 2048; //阴影贴图宽度设置为2048像素
  pointLight.shadow.mapSize.height = 2048; //阴影贴图高度设置为2048像素
  const pointLightHelper = new THREE.PointLightHelper(
      pointLight,
      500,
      0xff0000
  );
  template.scene.add(pointLightHelper);
  template.scene.add(pointLight);
};

onMounted(() => {
  initScene();
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
