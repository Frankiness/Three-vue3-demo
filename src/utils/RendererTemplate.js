import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

export default class RendererTemplate {
  constructor(container) {
    //各种默认选项
    this.el = container;
    this.PCamera = {
      fov: 45,
      aspect: window.innerWidth / window.innerHeight,
      near: 1,
      far: 100000,
    };
    this.cameraPostion = new THREE.Vector3(-7.5, 35, -158);
    this.cameraLookAt = new THREE.Vector3(-7, 40, -150);
    this.rendererColor = new THREE.Color(0xF0F8FF);
    this.rendererWidth = this.el.clientWidth;
    this.rendererHeight = this.el.clientHeight;
  }

  initPerspectiveCamera() {
    //初始化相机，这里是透视相机
    const camera = new THREE.PerspectiveCamera(
        this.PCamera.fov,
        this.PCamera.aspect,
        this.PCamera.near,
        this.PCamera.far
    );
    camera.position.copy(this.cameraPostion);
    camera.lookAt(this.cameraLookAt);
    this.camera = camera;
    this.scene.add(camera);
  }

  initScene() {
    //初始化场景
    this.scene = new THREE.Scene();
  }

  initRenderer() {
    //初始化渲染器
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(this.rendererColor);
    renderer.setSize(this.rendererWidth, this.rendererHeight);
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true; //阴影投射
    this.el.appendChild(renderer.domElement);
    this.renderer = renderer;
    this.controls = new OrbitControls(this.camera, renderer.domElement)//轨迹控制
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  init() {
    const animate = () => {
      requestAnimationFrame(animate);
      this.render()
      // this.stats.update()
    }

    this.initScene();
    this.initPerspectiveCamera();
    this.initRenderer();
    this.initFloor()
    this.addAxes()
    this.initLight()
    // this.addStats()
    // this.flowTexture() //地板贴图
    animate()
  }

  initFloor() {
    const floorGeometry = new THREE.PlaneGeometry(800, 800, 1);
    const textureLoader = new THREE.TextureLoader()
    // let texture = textureLoader.load("texture/pisa/ny1.png")
    // const floorMaterial = new THREE.MeshPhongMaterial({map: texture})
    // const floorMaterial = new THREE.MeshPhongMaterial({color: 0xffffff})
    // const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    // floor.receiveShadow = true; // 接受阴影
    // floor.rotation.x = -Math.PI / 2
    // floor.position.y = -0.5
    // this.scene.add(floor)
  }

  initLight() {
    // let spotLight = new THREE.SpotLight(0xffffff, 0.2);
    // spotLight.position.set(-21, 50, -20);
    // spotLight.castShadow = true;
    // spotLight.shadow.mapSize.width = 2048;	//阴影贴图宽度设置为2048像素
    // spotLight.shadow.mapSize.height = 2048;	//阴影贴图高度设置为2048像素
    // spotLight.shadow.camera.near = 0.5;    // default
    // spotLight.shadow.camera.far = 500;     // default
    // const spotLightHelper = new THREE.SpotLightHelper(spotLight, 50, 0xff0000);
    // this.scene.add(spotLightHelper);
    // this.scene.add(spotLight);
  }

  addAxes() {
    const axes = new THREE.AxisHelper(100);
    this.scene.add(axes);
    const helper = new THREE.GridHelper(2000, 100);
    helper.material.opacity = 0.25;
    helper.material.transparent = true;
    this.scene.add(helper);
  }

  //性能监控插件
  addStats() {
    this.stats = new Stats();
    document.body.appendChild(this.stats.domElement);
  }

  flowTexture() {
    this.texture = new THREE.TextureLoader().load('texture.PNG')
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.RepeatWrapping;
    this.texture.repeat.x = 10;
    this.texture.repeat.y = 1;

    const planeGeometry = new THREE.PlaneGeometry(200, 10);
    const plane = new THREE.MeshBasicMaterial();
    plane.color = new THREE.Color(0x00ff00);
    plane.map = this.texture;
    plane.transparent = true;
    plane.side = THREE.DoubleSide;

    const mesh = new THREE.Mesh(planeGeometry, plane)
    this.scene.add(mesh)
  }
}
