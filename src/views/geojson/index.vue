<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import { Web3DRenderer } from '../../utils/Web3DRenderer';
import * as THREE from 'three';
import * as d3 from 'd3';
import { onMounted, ref } from 'vue';

let web3d = ref(null);
const container = ref(null);
let indexBol = true;

const lines = [];
let opacitys = null;
const geometry = new THREE.BufferGeometry();
let currentPos = 0;
let pointSpeed = 20; // 线段移动速度
// 以北京为中心 修改坐标
const projection = d3
  .geoMercator()
  .center([116.412318, 39.909843])
  .scale(350)
  .translate([0, 0]);
let loader = new THREE.FileLoader();
/**
 * 边框 图形绘制
 * @param polygon 多边形 点数组
 * @param color 材质颜色
 * */
const lineDraw = (polygon, color) => {
  const lineGeometry = new THREE.BufferGeometry();
  const pointsArray = new Array();
  polygon.forEach((row) => {
    const [x, y] = projection(row);
    // 创建三维点
    pointsArray.push(new THREE.Vector3(x, -y, 0));

    if (indexBol) {
      lines.push([x, -y, 0]);
    }
  });
  indexBol = false;
  // 放入多个点
  lineGeometry.setFromPoints(pointsArray);

  const lineMaterial = new THREE.LineBasicMaterial({
    color: color,
  });
  return new THREE.Line(lineGeometry, lineMaterial);
};
// 控制 颜色和粒子大小
const params = {
  pointSize: 2.0,
  pointColor: '#4ec0e9',
};

const vertexShader = `
  attribute float aOpacity;
  uniform float uSize;
  varying float vOpacity;
  void main(){
      gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);
      gl_PointSize = uSize;
      vOpacity=aOpacity;
  }
  `;

const fragmentShader = `
  varying float vOpacity;
  uniform vec3 uColor;
  float invert(float n){
      return 1.-n;
  }
  void main(){
    if(vOpacity <=0.2){
        discard;
    }
    vec2 uv=vec2(gl_PointCoord.x,invert(gl_PointCoord.y));
    vec2 cUv=2.*uv-1.;
    vec4 color=vec4(1./length(cUv));
    color*=vOpacity;
    color.rgb*=uColor;
    gl_FragColor=color;
  }
  `;
const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  transparent: true, // 设置透明
  uniforms: {
    uSize: {
      value: params.pointSize,
    },
    uColor: {
      value: new THREE.Color(params.pointColor),
    },
  },
});
const points = new THREE.Points(geometry, material);
/**
 * 加载json文件
 */
const loadJSON = () => {
  loader.load('js/China-line.json', (data) => {
    const jsonData = JSON.parse(data);
    drawMap(jsonData);
    drawLine(jsonData);
  });

  web3d.scene.add(points);
};

/**
 * 绘制地图几何体
 */
const drawMap = (jsonData) => {
  const positions = [];
  jsonData.features.forEach((elem) => {
    // 每个的 坐标 数组
    const coordinates = elem.geometry.coordinates;
    coordinates.forEach((multiPolygon) => {
      multiPolygon.forEach((polygon) => {
        const shape = new THREE.Shape();
        const lineGeometry = new THREE.BufferGeometry();

        for (let i = 0; i < polygon.length; i++) {
          const [x, y] = projection(polygon[i]);
          if (i === 0) {
            shape.moveTo(x, -y);
          }
          shape.lineTo(x, -y);
          positions.push(Number(x), Number(-y), 4);
        }
        const vertices = new Float32Array(positions);
        lineGeometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(vertices, 3),
        );
        lineGeometry.computeBoundingSphere();
        const extrudeSettings = {
          depth: 1,
          bevelEnabled: false,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const material = new THREE.MeshBasicMaterial({
          color: '#02A1E2',
          transparent: true,
          opacity: 0.6,
        });
        const material1 = new THREE.MeshBasicMaterial({
          color: '#3480C4',
          transparent: true,
          opacity: 0.5,
        });
        const mesh = new THREE.Mesh(geometry, [material, material1]);
        web3d.scene.add(mesh);
      });
    });
  });
};
// 绘制发光线条
const drawLine = (jsonData) => {
  let positions = [];
  // 中国边界
  const feature = jsonData.features[0];
  const province = new THREE.Object3D();
  province.properties = feature.properties.name;
  // 点数据
  const coordinates = feature.geometry.coordinates;

  coordinates.forEach((coordinate) => {
    // coordinate 多边形数据
    coordinate.forEach((rows) => {
      const line = lineDraw(rows, 0xffffff);
      province.add(line);
    });
  });

  positions = new Float32Array(lines.flat(1));
  // 设置顶点
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  // 设置 粒子透明度为 0
  opacitys = new Float32Array(positions.length).map(() => 0);
  geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacitys, 1));

  web3d.scene.add(province);
};

const init = () => {
  web3d = new Web3DRenderer(container.value);
  web3d.setCameraPosition({ x: 0, y: 0, z: 600 });

  const render = () => {
    if (points && geometry.attributes.position) {
      currentPos += pointSpeed;
      for (let i = 0; i < pointSpeed; i++) {
        opacitys[(currentPos - i) % lines.length] = 0;
      }

      for (let i = 0; i < 200; i++) {
        opacitys[(currentPos + i) % lines.length] = i / 50 > 2 ? 2 : i / 50;
      }
      geometry.attributes.aOpacity.needsUpdate = true;
    }
    requestAnimationFrame(render);
    web3d.renderer.render(web3d.scene, web3d.camera);
  };
  render();
};
// loadJSON
onMounted(() => {
  init();
  loadJSON();
});
</script>

<style scoped>
#container {
  width: 100%;
  height: 100%;
}
</style>
