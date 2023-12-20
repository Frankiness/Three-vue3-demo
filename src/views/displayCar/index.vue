<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Clock,
  Color,
  CubeCamera,
  DoubleSide,
  EquirectangularReflectionMapping,
  Group,
  HalfFloatType,
  Mesh,
  MeshPhongMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SphereGeometry,
  SpotLight,
  sRGBEncoding,
  Vector3,
  WebGLCubeRenderTarget,
  WebGLRenderer,
} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

import {
  createContactShadow,
  createCustomMaterial,
  floatMesh,
  generateVirtualLight,
  getMaterials,
  setMovingSpot,
} from "../../utils/utils";
import {onMounted, onUnmounted, ref} from "vue";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";

//屏幕长比
const RADIO = window.innerWidth / window.innerHeight;
// 当前显示设备的物理像素分辨率与CSS像素分辨率之比
const DPR = window.devicePixelRatio;

// canvas 容器
const container = ref(null);

// 场景对象
let scene;

// 虚拟场景对象
let virtualScene = new Scene();
// 虚拟背景
let virtualBackgroundMesh;
/**
 * 透视摄像机
 * @param fov 第一个参数是视野角度（FOV）。视野角度就是无论在什么时候，你所能在显示器上看到的场景的范围，它的单位是角度(与弧度区分开)
 * @param ratio 第二个参数是长宽比（aspect ratio）。 也就是你用一个物体的宽除以它的高的值。比如说，当你在一个宽屏电视上播放老电影时，可以看到图像仿佛是被压扁的。
 * @param near 近截面（near）。
 * @param far 远截面（far）。
 * @type {PerspectiveCamera}
 */
let camera = new PerspectiveCamera(30, RADIO);

// 聚光灯对象
const spotLight = new SpotLight();

// 环境光
const ambientLight = new AmbientLight(0x404040);

/**
 * 渲染器，用WebGL渲染出你精心制作的场景
 * 高性能
 * 抗锯齿
 * 开启alpha通道
 * @type {WebGLRenderer}
 */
const renderer = new WebGLRenderer({
  powerPreference: "high-performance",
  antialias: true,
  alpha: true,
});

// 3D 模型对象
let model;
const modelZ = 0;

// 模型的接触阴影对象
const shadowGroup = new Group();

// 车身颜色
let carCoatColor = ref("#a9a9a9");

// 背景光源颜色
let backLightColor = ref("#dfe7e5");

// 相机控制对象
let controls;

// 相机运动锁
let cameraMoveClock = false;
/**
 * @description 设置相机
 */

const setCamera = () => {
  camera.position.set(0, 4.8, 19);
  camera.castShadow = true;

  scene.add(camera);
};

/**
 * @description 设置聚光灯
 */

const setSpotLight = () => {
  spotLight.position.set(0, 15, 0);
  //intensity - (可选参数) 光照强度。 缺省值 1。
  spotLight.intensity = 2;
  //聚光锥的半影衰减百分比。在0和1之间的值。默认为0。
  spotLight.penumbra = 1;
  //从聚光灯的位置以弧度表示聚光灯的最大范围。应该不超过 Math.PI/2。默认值为 Math.PI/3。
  spotLight.angle = 0.3;
  spotLight.shadow.bias = -0.0001;
  spotLight.castShadow = true;
  spotLight.target.position.set(0, 0, 6);
  scene.add(spotLight.target);

  scene.add(spotLight);
};

/**
 * @description 设置环境光，环境光会均匀的照亮场景中的所有物体。
 */

const setAmbientLight = () => {
  //intensity - (参数可选)光照的强度。缺省值为 1。
  ambientLight.intensity = 0.2;
  scene.add(ambientLight);
};

/**
 * @description 设置渲染器
 */

const setRender = () => {
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(DPR);

  // GLTFLoader 将自动配置从 .gltf 或 .glb 文件引用的纹理。
  renderer.outputEncoding = sRGBEncoding;

  //是否使用物理上正确的光照模式。默认为false。
  // renderer.physicallyCorrectLights = true;

  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  // BakeShadows
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
};

/**
 * @description 加载 3D 模型
 * @returns {Promise<void>}
 */

const load3DModel = async () => {
  // glb 是压缩的gltf，需要使用 dracoLoader 解压缩
  const dracoLoader = new DRACOLoader().setDecoderPath("/draco/");
  // gltf 加载器
  const gltfLoader = new GLTFLoader().setDRACOLoader(dracoLoader);

  // 加载模型获取，模型对象信息
  model = await gltfLoader.loadAsync("/model/Benz/draco-benz.glb");

  // 从模型中获取材料和节点对象，并添加至模型对象上
  if (model.scene) {
    const {materials, nodes} = getMaterials(model.scene);

    Object.values(nodes).forEach((node) => {
      node.receiveShadow = false;
      node.castShadow = false;
    });
    Object.assign(model, {materials, nodes});
  }
  // model.scene.scale.set(1, 1, 1);
  model.scene.position.set(0, -1, modelZ);
  model.scene.rotation.set(0, Math.PI, 0);
  scene.add(model.scene);
};


/**
 * @description 设置接触阴影,显得更真实
 */

const setContactShadow = () => {
  shadowGroup.position.set(0, -1.01, modelZ);
  shadowGroup.rotation.set(0, Math.PI / 2, 0);
  scene.add(shadowGroup);
  createContactShadow(scene, renderer, shadowGroup);
};

/**
 * @description 添加控制操作
 */

const addControls = () => {
  controls = new OrbitControls(camera, renderer.domElement);

  controls.addEventListener("start", () => (cameraMoveClock = true));
  controls.addEventListener("end", () => {
    cameraMoveClock = false;
  });
};

/**
 * @description 虚拟HDR环境，设置场景的环境
 * @param scene
 * @param resolution
 * @param frames
 * @param near
 * @param far
 * @param background
 */

const setEnvironment = (
    scene,
    resolution = 256,
    frames = 1,
    near = 1,
    far = 1000,
    background = false
) => {
  const fbo = new WebGLCubeRenderTarget(resolution);
  fbo.texture.type = HalfFloatType;
  const cubeCamera = new CubeCamera(near, far, fbo);

  virtualScene.add(cubeCamera);

  // 天花板灯
  const topLight = generateVirtualLight({
    intensity: 0.75,
    scale: [10, 10, 1],
    position: [0, 5, -9],
    rotation: [Math.PI / 2, 0, 0],
  });

  // 四周灯光
  const leftTopLight = generateVirtualLight({
    intensity: 4,
    scale: [20, 0.1, 1],
    position: [-5, 1, -1],
    rotation: [0, Math.PI / 2, 0],
  });
  const leftBottomLight = generateVirtualLight({
    intensity: 1,
    scale: [20, 0.5, 1],
    position: [-5, -1, -1],
    rotation: [0, Math.PI / 2, 0],
  });
  const rightTopLight = generateVirtualLight({
    intensity: 1,
    scale: [20, 1, 1],
    position: [10, 1, 0],
    rotation: [0, -Math.PI / 2, 0],
  });

  const floatLight = generateVirtualLight({
    form: "ring",
    color: "red",
    intensity: "1",
    scale: 10,
    position: [-15, 4, -18],
    target: [0, 0, 0],
  });

  virtualScene.add(topLight);
  virtualScene.add(leftTopLight);
  virtualScene.add(leftBottomLight);
  virtualScene.add(rightTopLight);
  virtualScene.add(floatLight);

  if (background !== "only") {
    scene.environment = fbo.texture;
  }
  if (background) {
    scene.background = fbo.texture;
  }

  // 模拟 MeshDepthMaterial 设置背景颜色，颜色不受光照影响

  const geometry = new SphereGeometry(1, 64, 64);
  const material = createCustomMaterial(backLightColor.value);

  virtualBackgroundMesh = new Mesh(geometry, material);
  virtualBackgroundMesh.scale.set(100, 100, 100);
  virtualScene.add(virtualBackgroundMesh);

  // 让环形网格运动起来
  floatMesh({
    group: floatLight,
    speed: 5,
    rotationIntensity: 2,
    floatIntensity: 2,
  });

  // 更新相机内容
  let count = 1;
  const virtualRender = () => {
    if (frames === Infinity || count < frames) {
      cubeCamera.update(renderer, virtualScene);
      count++;
    }
    requestAnimationFrame(virtualRender);
  };
  virtualRender();
};

/**
 * 设置相机的运动轨迹
 * @param camera
 * @param v
 */
let stopID;
const clock = new Clock();
let cameraX, cameraZ;
const setCameraAnimate = () => {
  const vector = new Vector3();

  if (cameraMoveClock) {
    cancelAnimationFrame(stopID);
  } else {
    const t = clock.getElapsedTime();

    const theta = t / 6;

    const newx = 14 * Math.sin(theta) - 6;
    const newy = 14 * Math.cos(theta) - 6;
    cameraX = newx < -10 ? cameraX : newx;
    cameraZ = newy < -10 ? cameraZ : newy;

    camera.position.lerp(vector.set(cameraX, 0.5, cameraZ), 0.05);
    camera.lookAt(model.scene.position);
  }

  stopID = requestAnimationFrame(setCameraAnimate);
};

/**
 * 设置相机的运动轨迹
 * @param camera
 * @param v
 */

/**
 * @description 为车设置聚光灯
 */

const setBigSpotLight = () => {
  model.scene.receiveShadow = false;
  scene.background = new Color("#dcdbd1");
  renderer.shadowMap.type = PCFSoftShadowMap;

  const material = new MeshPhongMaterial({
    side: DoubleSide,
    color: "#00ff1a",
    emissive: "#ac8f3e",
  });
  const FloorGeometry = new PlaneGeometry(200, 200);

  const floorMesh = new Mesh(FloorGeometry, material);

  floorMesh.rotation.x = Math.PI / 2;
  floorMesh.receiveShadow = true;

  floorMesh.position.set(0, -1.02, 0);

  // scene.add(floorMesh);

  const bigSpotLight = new SpotLight("#ffffff", 2);

  bigSpotLight.angle = Math.PI / 8;
  bigSpotLight.penumbra = 0.2;
  bigSpotLight.decay = 2;
  bigSpotLight.distance = 30;

  bigSpotLight.position.set(0, 10, 0);
  bigSpotLight.target.position.set(0, 0, modelZ);

  scene.add(bigSpotLight.target);
  scene.add(bigSpotLight);
};

const setHDR = () => {
  const loader = new RGBELoader();
  loader
      .setPath("texture/hdr/")
      .load("royal_esplanade_4k.hdr", async function (texture) {
        texture.mapping = EquirectangularReflectionMapping;
        // scene.background = texture;
        scene.environment = texture;
        autoRender();

        // 如果不需要背景贴图
        scene.environment = getEnvmapFromHDRTexture(renderer, texture);
      });

  const getEnvmapFromHDRTexture = (renderer, texture) => {
    const pmremGenerator = new PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envmap = pmremGenerator.fromEquirectangular(texture).texture;
    pmremGenerator.dispose();
    return envmap;
  };
};

/**
 * @description 自动渲染，避免更改场景后，手动调用 renderer.render
 */

const autoRender = () => {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(autoRender);
};
/**
 * @description 初始化场景
 * @returns {Promise<void>}
 */
const initScene = async () => {
  // 创建场景
  scene = new Scene();
  // 设置渲染器
  setRender();
  // 设置环境光
  setAmbientLight();
  // 设置相机
  setCamera();
  // 加载3d 模型
  await load3DModel();
  // 自动以3d模型
  // customModel();
  // 设置聚光灯
  setSpotLight();

  const t = 600;
  setTimeout(() => {
    // 设置 HDR环境（模拟HDR贴图）
    setEnvironment(scene, 256, Infinity);
    // 设置运动光源，获得打光效果
    setMovingSpot(virtualScene);
  }, t * 2);
  setTimeout(() => {
    spotLight.visible = false;
    // 设置舞台聚光灯
    setBigSpotLight();
    // 设置接触阴影
    setContactShadow();
    // 设置真实HDR
    setHDR();
  }, 3 * t);

  setTimeout(() => {
    // 设置相机运动动画
    setCameraAnimate();
  }, t * 5);

  // 添加控制效果
  addControls();

  // 将渲染结果写入html dom中
  container.value.appendChild(renderer.domElement);
  // 开启实时渲染，无需手动渲染
  autoRender();

  // 监听页面变化重新渲染画布
  listenPageSizeChange();
};

/**
 * @description 重新设置渲染窗口大小
 */
const changeRenderSize = () => {
  requestAnimationFrame(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};

/**
 * 添加页面变化监听
 */
const listenPageSizeChange = () => {
  window.addEventListener("resize", changeRenderSize);
};

onMounted(() => {
  initScene();
});

onUnmounted(() => {
  window.removeEventListener("resize", changeRenderSize);
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
