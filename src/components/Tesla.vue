<template>
  <div id="container" ref="container"></div>
</template>
<!--suppress JSVoidFunctionReturnValueUsed -->
<script setup>
import RendererTemplate from "../utils/RendererTemplate";
import {onMounted, ref} from "vue";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

const container = ref(null)
const loader = new GLTFLoader()
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
  const template = new RendererTemplate(container._value);
  template.init();
  const gltf = await loadFile('model/Audi/scene.gltf')
  gltf.scene.scale.set(0.05, 0.05, 0.05);
  gltf.scene.position.set(10, 8, 5);
  //颜色处理
  gltf.scene.traverse(function (child) {
    if (child.isMesh) {
      child.material.emissive = child.material.color;
      child.material.emissiveMap = child.material.map;
    }
  });
  template.scene.add(gltf.scene)
}

onMounted(() => {
  initScene()
})
</script>

<style scoped>
#container {
  width: 100%;
  height: 100%;
}
</style>
