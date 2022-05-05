<template>
</template>
<!--suppress JSVoidFunctionReturnValueUsed -->
<script setup>
import RendererTemplate from "../utils/RendererTemplate";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

const template = new RendererTemplate()
template.init()

const loadBuildingModel = () => {
  const GLTF = new GLTFLoader().load('model/leishen.glb', (gltf) => {
    const model = gltf.scene
    model.scale.set(0.1, 0.1, 0.1)
    template.scene.add(gltf.scene);
  })
}

loadBuildingModel()
</script>

<style scoped>

</style>
