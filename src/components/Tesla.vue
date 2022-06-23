<template>
  <div id="container" ref="container"></div>
</template>
<!--suppress JSVoidFunctionReturnValueUsed -->
<script setup>
import RendererTemplate from "../utils/RendererTemplate";
import {onMounted, ref} from "vue";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

let template
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
  template = new RendererTemplate(container._value);
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
  setCarColor()
}
//车身颜色数组
const colorAry = [
  "rgb(216, 27, 67)", "rgb(142, 36, 170)", "rgb(81, 45, 168)", "rgb(48, 63, 159)", "rgb(30, 136, 229)", "rgb(0, 137, 123)",
  "rgb(67, 160, 71)", "rgb(251, 192, 45)", "rgb(245, 124, 0)", "rgb(230, 74, 25)", "rgb(233, 30, 78)", "rgb(156, 39, 176)",
  "rgb(0, 0, 0)"] // 车身颜色数组

//设置车身颜色
const setCarColor = (index) => {
  // const currentColor = new Color(colorAry[index])
  const currentColor = "rgb(216, 27, 67)"
  template.scene.traverse(child => {
    if (child.isMesh) {
      // if (child.name.includes('Wheel')) {
      child.material.color.set(currentColor)
      // }
    }
  })
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
