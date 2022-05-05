import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export default class RendererTemplate {
  constructor() {
    //各种默认选项
    this.el = document.body;
    this.PCamera = {
      fov: 45,
      aspect: window.innerWidth / window.innerHeight,
      near: 1,
      far: 1000,
    };
    this.cameraPostion = new THREE.Vector3(10, 10, 10);
    this.cameraLookAt = new THREE.Vector3(0, 0, 0);
    this.rendererColor = new THREE.Color(0xF0F8FF);
    this.rendererWidth = window.innerWidth;
    this.rendererHeight = window.innerHeight;
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
    this.el.appendChild(renderer.domElement);
    this.renderer = renderer;
    const controls = new OrbitControls(this.camera, renderer.domElement)//轨迹控制
  }

  init() {
    this.initScene();
    this.initPerspectiveCamera();
    this.initRenderer();
    const animate = () => {
      requestAnimationFrame(animate);
      this.renderer.render( this.scene, this.camera );
    }
    animate()
    this.initFloor()
    this.addAxes()
  }
  initFloor(){
    const floorGeometry = new THREE.PlaneGeometry(10,10,1)
    const floorMaterial = new THREE.MeshBasicMaterial({color:0x696969})
    const floor = new THREE.Mesh(floorGeometry,floorMaterial)
    floor.rotation.x = -Math.PI/2
    this.scene.add(floor)
  }
  addAxes(){
    const axes = new THREE.AxisHelper(100);
    this.scene.add(axes);
  }
}
