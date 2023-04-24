<template>
  <div id="markContainer" ref="markContainer"></div>
</template>

<script setup>
import * as THREE from 'three';
import { onMounted, ref } from 'vue';
import { Web3DRenderer } from '../../utils/Web3DRenderer';
import { deepMerge, random } from '../../utils/utils';
import { vertexShader, fragmentShader } from './shader';
import useFloor from '../../hooks/useFloor';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

let web3d = ref(null);
let markContainer = ref(null);
const textureLoader = new THREE.TextureLoader();

const init = () => {
  web3d = new Web3DRenderer(markContainer.value);
  web3d.setCameraPosition({ x: 500, y: 500, z: 500 });
  const render = () => {
    web3d.renderer.render(web3d.scene, web3d.camera);
    tick();
    requestAnimationFrame(render);
  };
  render();
};

const extrudeSVG = () => {
  initLoadData();
  useFloor(web3d);
  initParticle();
};

const createSequenceFrame = (opt) => {
  // 默认参数
  let options = deepMerge(
    {
      image: '',
      width: 200, // 显示的宽度
      height: 200, // 显示的高度
      frame: 60, //总共的帧数
      column: 10, // 序列图的列
      row: 6, // 序列图的行
      speed: 0.5, // 速度
    },
    opt,
  );
  let geometry = new THREE.PlaneBufferGeometry(options.width, options.height); //矩形平面
  let texture = textureLoader.load(options.image); // 加载图片
  texture.repeat.set(1 / options.column, 1 / options.row); // 从图像上截图第一帧
  let material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
    depthWrite: false, //是否对深度缓冲区有任何的影响
  });
  let mesh = new THREE.Mesh(geometry, material);

  let r = 0; // 当前行
  let c = 0; // 当前列
  let t = 0; // 时间
  mesh.updateSequenceFrame = (time) => {
    t += options.speed;
    if (t > options.frame) t = 0;
    c = options.column - Math.floor(t % options.column) - 1;
    r = Math.floor((t / options.column) % options.row);
    texture.offset.x = c / options.column; // 动态更新纹理偏移 播放关键帧动画
    texture.offset.y = r / options.row; // 动态更新纹理偏移 播放关键帧动画
  };

  return mesh;
};

let particleArr = [];

/**
 * 上升数字
 **/
const initParticle = () => {
  //设置范围
  let minX = -300;
  let maxX = 300;
  let minY = -10;
  let maxY = 200;
  let minZ = -300;
  let maxZ = 300;

  for (let i = 0; i < 15; i++) {
    const particle = createSequenceFrame({
      image: 'imgs/dizuo/上升粒子1.png',
      width: 180,
      height: 189,
      frame: 9,
      column: 9,
      row: 1,
      speed: 0.5,
    });
    let particleScale = random(25, 50) / 100;
    particle.scale.set(particleScale, particleScale, particleScale);
    let x = random(minX, maxX);
    let y = random(minY, maxY);
    let z = random(minZ, maxZ);
    particle.position.set(x, y, z);
    particleArr.push(particle);
  }
  web3d.scene.add(...particleArr);
  return particleArr;
};

function initLoadData() {
  let dataArrs = [
    {
      glbUrl: 'model/dizuo/模型底座.glb',
      glbScale: 1,
      glbPosition: new THREE.Vector3(-100, 0, -100),
      svgUrl: 'svg/铃铛.svg',
      svgFlag: false,
      svgScale: 0.05,
      svgPosition: new THREE.Vector3(-100, 1, -100),
      color: '#0565f3', //035094
      roadPositon: new THREE.Vector3(0, 0, -100),
      rotationType: 'y',
      rotation: 180,
    },
    {
      glbUrl: 'model/dizuo/模型底座.glb',
      glbScale: 1,
      glbPosition: new THREE.Vector3(100, 0, -100),
      svgUrl: 'svg/大拇指.svg',
      svgFlag: true,
      svgScale: 0.05,
      svgPosition: new THREE.Vector3(100, 1, -100),
      color: '#11CD6E',
      roadPositon: new THREE.Vector3(100, 0, 0),
      rotationType: 'z',
      rotation: 90,
    },
    {
      glbUrl: 'model/dizuo/模型底座.glb',
      glbScale: 1,
      glbPosition: new THREE.Vector3(-100, 0, 100),
      svgUrl: 'svg/人.svg',
      svgFlag: false,
      svgScale: 0.05,
      svgPosition: new THREE.Vector3(-100, 1, 100),
      color: '#FB821F',
      roadPositon: new THREE.Vector3(0, 0, 100),
      rotationType: 'z',
      rotation: 0,
    },
    {
      glbUrl: 'model/dizuo/模型底座.glb',
      glbScale: 1,
      glbPosition: new THREE.Vector3(100, 0, 100),
      svgUrl: 'svg/箭头.svg',
      svgFlag: false,
      svgScale: 0.05,
      svgPosition: new THREE.Vector3(100, 1, 100),
      color: '#e51ffb',
      roadPositon: new THREE.Vector3(-100, 0, 0),
      rotationType: 'z',
      rotation: -90,
    },
  ];

  dataArrs.forEach(function (data) {
    initMeshGlb(data);
  });
}

var uniformsArrs = [];
var uniformsArrs2 = [];
let objArrs = [];

//加载glb
function initMeshGlb(data) {
  var uniforms = {
    time: {
      value: 0.0,
    },
    repeat: {
      value: new THREE.Vector2(3, 1),
    },
    colorTexture: { value: new THREE.TextureLoader().load('./imgs/dizuo/线圈动画2.png') },
    colorTexture1: { value: new THREE.TextureLoader().load('./imgs/dizuo/渐变2.png') },
    color: { value: new THREE.Color(data.color) },
  };

  uniforms['colorTexture'].value.wrapS = uniforms['colorTexture'].value.wrapT = THREE.RepeatWrapping;
  uniforms['colorTexture1'].value.wrapS = uniforms['colorTexture1'].value.wrapT = THREE.RepeatWrapping;
  uniformsArrs.push(uniforms);

  var customMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader,
    fragmentShader,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthTest: false,
    side: THREE.DoubleSide,
  });
  // model
  var loader = new GLTFLoader();
  var texture = new THREE.TextureLoader().load('./imgs/dizuo/Base_Technology_LightEffect_Alpha.png');
  texture.center.set(0.5, 0.5);
  texture.rotation = -Math.PI;
  loader.load(
    data.glbUrl,
    function (gltf) {
      gltf.scene.scale.multiplyScalar(50);
      gltf.scene.position.copy(data.glbPosition);
      gltf.scene.renderOrder = 1;
      web3d.scene.add(gltf.scene);
      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
          //上面一圈
          if (child.name == 'opacity') {
            child.material = customMaterial;
            child.rotateX(Math.PI);
            child.position.y += 1.1;
          }

          //底部4个发射光
          if (child.name == 'opacity-s') {
            let material = new THREE.MeshStandardMaterial({
              map: texture,
              color: new THREE.Color(data.color).multiplyScalar(0.5),
              emissive: new THREE.Color(data.color).multiplyScalar(0.5),
              roughness: 0.438,
              metalness: 0,
              depthWrite: false,
              transparent: true,
              opacity: 0.2,
              side: THREE.DoubleSide,
            });
            child.material = material;
          }
          if (child.name == 'deepColor') {
            let material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(data.color).multiplyScalar(0.8),
              emissive: new THREE.Color(data.color).multiplyScalar(0.8),
              roughness: 0.438,
              metalness: 0,
            });
            child.material = material;
          }
          if (child.name == 'lowColor') {
            let material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(data.color).multiplyScalar(0.5),
              emissive: new THREE.Color(data.color).multiplyScalar(0.5),
              roughness: 0.438,
              metalness: 0,
            });
            child.material = material;
          }

          if (child.name == 'black') {
            var material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(data.color).multiplyScalar(0.2),
              // emissive:new THREE.Color(data.color).multiplyScalar(0.2),
              roughness: 0.438,
              metalness: 0,
              // envMap:envMap,
            });
            child.material = material;
          }
        }
      });
      loadSvgByUrl(data.svgUrl, data.svgScale, data.svgFlag, data.svgPosition, data.color);
      initRoad(data.roadPositon, data.rotationType, data.rotation);
    },
    undefined,
    function (e) {
      console.error(e);
    },
  );
}

/**
 *
 * @param svgUrl svg地址
 * @param scale  此尺寸大小
 * @param flag  是否翻转
 */
function loadSvgByUrl(svgUrl, scale, flag, position, color) {
  const loader = new SVGLoader();
  loader.load(svgUrl, function (data) {
    var paths = data.paths;
    var group = new THREE.Group();
    group.position.copy(position);
    var options = {
      depth: 100,
      bevelThinkness: 1,
      bevelSize: 1,
      bevelSegments: 1,
      bevelEnabled: false,
      curveSegments: 50,
      steps: 1,
    };

    for (var i = 0; i < paths.length; i++) {
      var path = paths[i];
      var shapes = path.toShapes(flag);
      let svgGeometry = new THREE.ExtrudeGeometry(shapes, options);
      let svgMaterial = new THREE.MeshPhongMaterial({ color: color, shininess: 6 });
      let svg = new THREE.Mesh(svgGeometry, svgMaterial);
      svg.scale.multiplyScalar(scale);
      svg.position.x = -512 * scale;
      svg.position.y = 1024 * scale;
      svg.scale.y *= -1;
      group.add(svg);
    }
    web3d.scene.add(group);
    objArrs.push(group);
  });
}

/**
 * 底部道路流光
 */
function initRoad(roadPositon, rotationType, rotation) {
  var width = 100;
  var height = 15;
  var scale = width / height;
  var uniforms = {
    time: {
      value: 0.0,
    },
    time2: {
      value: 0.0,
    },
    repeat: {
      value: new THREE.Vector2(scale / 5, 1),
    },
    colorTexture: { value: new THREE.TextureLoader().load('./imgs/dizuo/水平光束.png') },

    colorTexture1: { value: new THREE.TextureLoader().load('./imgs/dizuo/水平冲击波.png') },
  };
  uniformsArrs2.push(uniforms);
  var customMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: `
				varying vec2 vUv;
				varying vec3 fNormal;
				varying vec3 vPosition;
				void main()
				{
				  vUv = uv;
				  fNormal=normal;
				  vPosition=position;
				  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				  gl_Position = projectionMatrix * mvPosition;
				}
			`,
    fragmentShader: `
				uniform float time;
				uniform float time2;
				varying vec2 vUv;
				uniform vec2 repeat;
				uniform sampler2D colorTexture;
				uniform sampler2D colorTexture1;
				varying vec3 fNormal;
				varying vec3 vPosition;
				void main( void ) {
				  vec2 position = vUv;
				  vec4 colorb = texture2D(colorTexture1,vec2(fract((vUv).x+time2),(vUv).y));
				  vec4 colora = texture2D(colorTexture,vec2(fract((vUv*repeat).x+time),(vUv*repeat).y));
				  gl_FragColor = vec4( (colorb).r*1., (colorb).g*1., (colorb).b*1., (colora+colorb).a );
				}
			`,
    blending: THREE.AdditiveBlending,
    transparent: true,
    side: THREE.DoubleSide,
  });

  var geometry = new THREE.PlaneGeometry(width, height, 1, 1);
  let mesh = new THREE.Mesh(geometry, customMaterial);
  mesh.renderOrder = 1;
  mesh.rotation.x -= Math.PI / 2;
  mesh.position.copy(roadPositon);
  if (rotationType == 'y') {
    mesh.rotation.y += (Math.PI / 180) * rotation;
  }
  if (rotationType == 'z') {
    mesh.rotation.z += (Math.PI / 180) * rotation;
  }
  web3d.scene.add(mesh);
}

let rotatingApertureMesh, rotatingPointMesh;
const clock = new THREE.Clock();
let step = 0;

const tick = () => {
  let deltaTime = clock.getDelta();
  step += 0.03;
  if (objArrs.length > 0) {
    objArrs.forEach(function (obj) {
      obj.position.y = 25 + 5 * Math.cos(step);
      // obj.position.y = 25+(10*Math.abs(Math.cos(step)))
      obj.rotateY(deltaTime);
    });
  }
  if (uniformsArrs.length > 0) {
    uniformsArrs.forEach(function (uniforms) {
      uniforms.time.value += 0.005;
    });
  }

  if (uniformsArrs2.length > 0) {
    uniformsArrs2.forEach(function (uniforms) {
      uniforms.time.value += 0.02; //粒子速度
      uniforms.time2.value += 0.005; //冲击波速度
    });
  }

  if (rotatingApertureMesh) {
    rotatingApertureMesh.rotation.z += 0.0005;
  }
  if (rotatingPointMesh) {
    rotatingPointMesh.rotation.z -= 0.0005;
  }

  // 粒子上升
  if (particleArr.length) {
    for (let i = 0; i < particleArr.length; i++) {
      particleArr[i].updateSequenceFrame();
      particleArr[i].position.y += 0.15;
      if (particleArr[i].position.y >= 200) {
        particleArr[i].position.y = -10;
      }
    }
  }
};

onMounted(() => {
  init();
  extrudeSVG();
});
</script>

<style>
#markContainer {
  width: 100%;
  height: 100%;
}
</style>
