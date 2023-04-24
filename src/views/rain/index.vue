<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { Web3DRenderer } from '../../utils/Web3DRenderer';
// import { Reflector } from 'three/examples/jsm/objects/Reflector';
import { fragmentShader, fragmentShader2, vertexShader, vertexShader2 } from './rain';
import { PackedMipMapGenerator } from '../../utils/PackedMipMapGenerator';
import { Reflector } from './reflector';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

let web3d = null;
let container = ref(null);
let bloomComposer = null;

const init = () => {
  web3d = new Web3DRenderer(container.value, { addLight: false });
  web3d.camera.position.set(0, 0, 0);
  web3d.setBackgroundColor('#121212', 1);

  let floorMirror = createFloor();
  web3d.scene.add(floorMirror);
  createRain(); // 创建雨滴
  floorMirror.ignoreObjects.push(web3d.rain); // 水面反射去除雨滴

  const render = () => {
    web3d.renderer.autoClear = false;
    web3d.renderer.clear();

    web3d.renderer.render(web3d.scene, web3d.camera);

    web3d.renderer.clearDepth(); // 清除深度缓存
    // 后处理
    bloomComposer && bloomComposer.render();

    floorMirror.material.uniforms.iTime.value += 0.02;
    web3d.mipmapper && web3d.mipmapper.update(web3d.mirrorFBO.texture, web3d.rt, web3d.renderer);

    web3d?.rain && (web3d.rain.material.uniforms.iTime.value += 0.03);

    web3d.bgFBO && web3d.renderer.setRenderTarget(web3d.bgFBO);
    web3d.fboCamera && web3d.renderer.render(web3d.scene, web3d.fboCamera);
    web3d.renderer.setRenderTarget(null);

    web3d.stats && web3d.stats.update();

    requestAnimationFrame(render);
  };

  web3d.setCameraPosition({ x: 0, y: 2, z: 20 });

  render();
};

function loadModel() {
  const loader = new GLTFLoader();
  loader.load('model/gltf/street.glb', (gltf) => {
    // gltf.scene.scale.set(0.3, 0.3, 0.3);
    gltf.scene.position.set(0, -0.01, 0);
    // gltf.scene.traverse((obj) => {
    //   if (obj.isMesh) {
    //     if (obj.userData.led) {
    //       console.log('obj:', obj);
    //     }
    //   }
    // });
    web3d.scene.add(gltf.scene);
  });
}

function FBO(w = window.devicePixelRatio, h = window.devicePixelRatio) {
  let width = window.innerWidth * w;
  let height = window.innerHeight * h;
  return new THREE.WebGLRenderTarget(width, height);
}

function createFloor() {
  const floorGeometry = new THREE.PlaneGeometry(15, 15);
  const loadTexture = new THREE.TextureLoader();
  const floorMaterial = new THREE.MeshStandardMaterial({
    map: loadTexture.load('texture/groundWet/Ground_Wet_002_basecolor.jpg'), //基本纹理贴图
    roughnessMap: loadTexture.load('texture/groundWet/Ground_Wet_002_roughness.jpg'), // 表面粗糙度贴图
    normalMap: loadTexture.load('texture/groundWet/Ground_Wet_002_normal.jpg'), //法向贴图，影响光照计算，模拟凹凸不平
    alphaMap: loadTexture.load('texture/groundWet/Ground_Wet_002_mask.jpg'), // 控制材质的不透明度，黑色：透明，白色：不透明
    displacementMap: loadTexture.load('texture/groundWet/Ground_Wet_002_height.png'), //高度贴图，偏移物体表面坐标
    aoMap: loadTexture.load('texture/groundWet/Ground_Wet_002_ambientOcclusion.jpg'), //环境光遮罩贴图，让被遮住的地方更暗
  });

  const fNormalTex = floorMaterial.normalMap;
  const fOpacityTex = floorMaterial.alphaMap;
  const fRoughnessTex = floorMaterial.roughnessMap;
  // 设置纹理横向纵向重复模式
  fNormalTex.wrapS = fNormalTex.wrapT = THREE.MirroredRepeatWrapping;
  fOpacityTex.wrapS = fOpacityTex.wrapT = THREE.MirroredRepeatWrapping;
  fRoughnessTex.wrapS = fRoughnessTex.wrapT = THREE.MirroredRepeatWrapping;

  // 反射
  const groundMirror = new Reflector(floorGeometry);
  groundMirror.position.z = 5;
  groundMirror.position.x = 5;
  groundMirror.position.y = 0;
  groundMirror.rotateX(-Math.PI / 2);
  let uj = {
    iTime: { value: 0.0 },
  };
  groundMirror.material.uniforms = {
    ...groundMirror.material.uniforms,
    ...uj,
    uNormalTexture: {
      value: fNormalTex,
    },
    uOpacityTexture: {
      value: fOpacityTex,
    },
    uRoughnessTexture: {
      value: fRoughnessTex,
    },
    uRainCount: {
      value: 1000,
    },
    uTexScale: {
      value: new THREE.Vector2(1, 1), // 纹理缩放比：1:1
    },
    uTexOffset: {
      value: new THREE.Vector2(1, -0.5), // 纹理偏移
    },
    uDistortionAmount: {
      value: 0.25,
    },
    uBlurStrength: {
      value: 8,
    },
    uMipmapTextureSize: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
  };
  groundMirror.material.vertexShader = vertexShader;
  groundMirror.material.fragmentShader = fragmentShader;
  web3d.scene.add(groundMirror);

  web3d.mipmapper = new PackedMipMapGenerator();
  web3d.mirrorFBO = groundMirror.getRenderTarget();

  web3d.rt = FBO();

  groundMirror.material.uniforms.tDiffuse.value = web3d.rt.texture;

  return groundMirror;
}

// 创建雨滴
function createRain() {
  let count = 1000,
    speed = 1.5;

  // 加载法线纹理
  const loadTexture = new THREE.TextureLoader();
  const rainMaterial = new THREE.MeshStandardMaterial({
    normalMap: loadTexture.load('texture/groundWet/rain.png'), //法向贴图，影响光照计算，模拟凹凸不平
  });
  let rNormalTex = rainMaterial.normalMap;
  rNormalTex.flipY = false;

  const rainMat = new THREE.ShaderMaterial({
    vertexShader: vertexShader2,
    fragmentShader: fragmentShader2,
    uniforms: {
      iTime: { value: 0.0 },
      ...{
        uSpeed: {
          value: speed,
        },
        uHeightRange: {
          value: 20,
        },
        uNormalTexture: {
          value: rNormalTex,
        },
        uBgRt: {
          value: null,
        },
        uRefraction: {
          value: 0.1,
        },
        uBaseBrightness: {
          value: 0.1,
        },
      },
    },
  });

  web3d.rain = new THREE.InstancedMesh(new THREE.PlaneGeometry(), rainMat, count);
  web3d.rain.instanceMatrix.needsUpdate = true;
  web3d.rain.visible = false;

  const dummy = new THREE.Object3D();

  const progressArr = [];
  const speedArr = [];

  for (let i = 0; i < count; i++) {
    dummy.position.set(THREE.MathUtils.randFloat(-10, 10), 0, THREE.MathUtils.randFloat(-20, 10));
    dummy.scale.set(0.03, THREE.MathUtils.randFloat(0.3, 0.5), 0.03);
    dummy.updateMatrix();
    web3d.rain.setMatrixAt(i, dummy.matrix);

    progressArr.push(Math.random());
    speedArr.push(dummy.scale.y * 10);
  }
  web3d.rain.rotation.set(-0.1, 0, 0.1);
  web3d.rain.position.set(0, 4, 4);

  web3d.rain.geometry.setAttribute('aProgress', new THREE.InstancedBufferAttribute(new Float32Array(progressArr), 1));
  web3d.rain.geometry.setAttribute('aSpeed', new THREE.InstancedBufferAttribute(new Float32Array(speedArr), 1));

  web3d.bgFBO = FBO(0.1, 0.1);
  rainMat.uniforms.uBgRt.value = web3d.bgFBO.texture;

  web3d.fboCamera = web3d.camera.clone();

  web3d.rain.visible = true;

  web3d.scene.add(web3d.rain);
}

// 创建HDR环境贴图
const createHDR = () => {
  new RGBELoader().setPath('texture/hdr/').load('potsdamer_platz_4k.hdr', async function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    // web3d.scene.background = texture;
    // web3d.scene.environment = texture;
    // web3d.scene.environment.encoding = THREE.sRGBEncoding;
    const envMap = getEnvmapFromHDRTexture(web3d.renderer, texture);
    web3d.scene.environment = envMap;
  });
};

function createLight() {
  const pointLight1 = new THREE.PointLight('#ef77eb', 0.5, 27, 0.8);
  pointLight1.position.set(0, 2, 0);
  web3d.scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight('#81C8F2', 2, 30);
  pointLight2.position.set(0, 25, 0);
  web3d.scene.add(pointLight2);

  const rectLight1 = new THREE.RectAreaLight('#89D7FF', 66, 19.1, 0.2);
  rectLight1.position.set(0, 8, -10);
  rectLight1.rotation.set(THREE.MathUtils.degToRad(90), THREE.MathUtils.degToRad(180), 0);
  web3d.scene.add(rectLight1);
}

function createWall() {
  const loader = new THREE.TextureLoader();

  const aspTex = loader.load('texture/groundWet/asphalt-normal.jpg');
  aspTex.rotation = THREE.MathUtils.degToRad(90);
  aspTex.wrapS = aspTex.wrapT = THREE.RepeatWrapping;
  aspTex.repeat.set(5, 8);

  const wallMat = new THREE.MeshPhongMaterial({
    color: new THREE.Color('#111111'),
    normalMap: aspTex,
    normalScale: new THREE.Vector2(0.5, 0.5),
    shininess: 200,
  });

  const wall = new THREE.Mesh(new THREE.BoxGeometry(25, 20, 0.5), wallMat);
  web3d.scene.add(wall);
  wall.position.y = 10;
  wall.position.z = -10.3;

  const wall2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 20, 20), wallMat);
  web3d.scene.add(wall2);
  wall2.position.y = 10;
  wall2.position.x = -12;

  const wall3 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 20, 20), wallMat);
  web3d.scene.add(wall3);
  wall3.position.y = 10;
  wall3.position.x = 12;
}

function createProcessing() {
  let renderPass = new RenderPass(web3d.scene, web3d.camera);

  bloomComposer = new EffectComposer(web3d.renderer);
  bloomComposer.addPass(renderPass);

  // bloom
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.8, 0.5);
  bloomPass.exposure = 1;
  bloomPass.threshold = 0;
  bloomPass.strength = 1;
  bloomPass.radius = 0;
  bloomComposer.addPass(bloomPass);

  // SMAA 抗锯齿
  const smaa = new SMAAPass();
  bloomComposer.addPass(smaa);
}

const getEnvmapFromHDRTexture = (renderer, texture) => {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envmap = pmremGenerator.fromEquirectangular(texture).texture;
  pmremGenerator.dispose();
  return envmap;
};

function create3DText() {
  const loader = new FontLoader();
  loader.load('https://unpkg.com/three@0.77.0/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const geometry = new TextGeometry('Hello', {
      font: font,
      size: 3,
      height: 0.2,
      curveSegments: 120,
      bevelEnabled: false,
    });
    geometry.center();
    const tm = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color: '#ef77eb',
      }),
    );
    tm.position.y = 1.54;
    web3d.scene.add(tm);
  });
}

onMounted(() => {
  init();
  loadModel();
  createHDR();
  createLight();
  createWall();
  createProcessing();
  // create3DText();
});

onBeforeUnmount(() => {
  web3d.disposeStatus();
});
</script>

<style>
#container {
  width: 100%;
  height: 100%;
}
</style>
