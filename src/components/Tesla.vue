<template>
  <div id="container" ref="container">
    <a-input @change="selectColor" type="color" class="color-select"/>
  </div>
</template>
<!--suppress JSVoidFunctionReturnValueUsed -->
<script setup>
import * as THREE from 'three'
import {CubeTextureLoader, LightProbe} from 'three'
import RendererTemplate from "../utils/RendererTemplate";
import {onMounted, ref} from "vue";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {LightProbeGenerator} from "three/examples/jsm/lights/LightProbeGenerator";

let template
const container = ref(null)
const loader = new GLTFLoader()
//使用draco压缩
let dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./draco/gltf/"); // 设置public下的解码路径，注意最后面的/
dracoLoader.setDecoderConfig({type: "js"});
dracoLoader.preload();
loader.setDRACOLoader(dracoLoader);

let isLoading = ref(true) //是否显示loading  这个load模型监听的进度
let loadingWidth = ref(0)// loading的进度
const loadFile = (url) => {
  return new Promise(((resolve, reject) => {
    loader.load(url,
        (gltf) => {
          resolve(gltf)
        }, ({loaded, total}) => {
          let load = Math.abs(loaded / total * 100)
          loadingWidth.value = load
          if (load >= 100) {
            setTimeout(() => {
              isLoading.value = false
            }, 1000)
          }
          console.log((loaded / total * 100) + '% loaded')
        },
        (err) => {
          reject(err)
        }
    )
  }))
}
const initScene = async () => {
  template = new RendererTemplate(container._value);
  template.init();
  const house = await loadFile('model/Scene/scene.gltf')

  house.scene.scale.set(10, 10, 10)
  house.scene.position.set(0, 30, 0)


  template.scene.add(house.scene)
  template.flyTo()
  addLightProbe()
}
//颜色选择
const selectColor = (e) => {
  setCarColor(e.target._value)
}

//设置车身颜色
const setCarColor = (color) => {
  const currentColor = color
  template.scene.traverse(child => {
    if (child.isMesh) {
      if (child.name.includes('Body_Paint')) {
        child.material.color.set(currentColor)
      }
    }
  })
}
//拆解模型
const dismantleModel = () => {
  let r = 60
  template.scene.traverse(child => {
    if (child.isMesh) {
      child.fromPosition = [child.position.x, child.position.y, child.position.z]
      child.toPosition = [Math.random() * r, Math.random() * r, Math.random() * r]
      console.log(child)
    }
  })
}


// envmap
const genCubeUrls = function (prefix, postfix) {
  return [
    prefix + 'px1' + postfix,
    prefix + 'nx1' + postfix,
    prefix + 'py1' + postfix,
    prefix + 'ny1' + postfix,
    prefix + 'pz1' + postfix,
    prefix + 'nz1' + postfix,
  ];
};
const urls = genCubeUrls('texture/pisa/', '.png');

const addLightProbe = () => {
  // light probe
  let lightProbe = new LightProbe();
  template.scene.add(lightProbe);
  new CubeTextureLoader().load(urls, async function (cubeTexture) {
    cubeTexture.encoding = THREE.sRGBEncoding;

    // template.scene.background = cubeTexture; // 添加至场景中

    lightProbe.copy(LightProbeGenerator.fromCubeTexture(cubeTexture));

    const gltf = await loadFile('model/Audi/scene.gltf')
    gltf.scene.scale.set(0.05, 0.05, 0.05);
    gltf.scene.position.set(-10, 9, -50);
    gltf.scene.rotation.set(0, Math.PI / 1.2, 0);

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0,
      envMap: cubeTexture,
      envMapIntensity: 1,
    });

    // mesh
    gltf.scene.traverse(function (child) {
      if (child.name.includes('Body_Paint')) {
        child.material = material;
      }
    });
    template.scene.add(gltf.scene);
  });
}

onMounted(() => {
  initScene()

})
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
  right: 0
}
</style>
