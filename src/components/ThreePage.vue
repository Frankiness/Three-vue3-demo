<template></template>
<!--suppress JSVoidFunctionReturnValueUsed -->
<script setup>
import RendererTemplate from "../utils/RendererTemplate";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import * as d3 from "d3";

const template = new RendererTemplate();
template.init();

const loadBuildingModel = () => {
  const GLTF = new GLTFLoader().load(
    "model/leishen.glb",
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(0.1, 0.1, 0.1);
      model.position.set(1, 1, 0);
      model.rotation.x = new THREE.Euler(0, 1, 1.57, "XYZ");
      console.log(model);
      template.scene.add(gltf.scene);
    },
    // 加载过程中的回调函数
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // 加载出错的回调
    (err) => {
      console.error("An error happened", err);
    }
  );
};

function loadJSON() {
  // 加载json文件
  let loader = new THREE.FileLoader();
  loader.load("js/China2.json", (data) => {
    let jsonData = JSON.parse(data);
    initMap(jsonData);
  });
}

function initMap(chinaJson) {
  const positions = [];
  // 墨卡托投影转换
  const projection = d3
    .geoMercator()
    .center([104.0, 37.5])
    .scale(80)
    .translate([0, 0]);
  chinaJson.features.forEach((elem) => {
    // 每个的 坐标 数组
    const coordinates = elem.geometry.coordinates;
    coordinates.forEach((multiPolygon) => {
      multiPolygon.forEach((polygon) => {
        const shape = new THREE.Shape();
        const lineMaterial = new THREE.LineBasicMaterial({
          color: "red",
        });
        const lineGeometry = new THREE.BufferGeometry();

        for (let i = 0; i < polygon.length; i++) {
          const [x, y] = projection(polygon[i]);
          if (i === 0) {
            shape.moveTo(x, -y + 30);
          }
          shape.lineTo(x, -y + 30);
          positions.push(Number(x), Number(-y) + 30, 4);
        }
        const vertices = new Float32Array(positions);
        lineGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(vertices, 3)
        );
        lineGeometry.computeBoundingSphere();
        const extrudeSettings = {
          depth: 1,
          bevelEnabled: false,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const material = new THREE.MeshBasicMaterial({
          color: "#02A1E2",
          transparent: true,
          opacity: 0.6,
        });
        const material1 = new THREE.MeshBasicMaterial({
          color: "#3480C4",
          transparent: true,
          opacity: 0.5,
        });
        const mesh = new THREE.Mesh(geometry, [material, material1]);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        template.scene.add(mesh);
        // template.scene.add(line)
      });
    });
  });
}

loadBuildingModel();
// loadJSON()
</script>

<style scoped></style>
