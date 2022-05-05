import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {TWEEN} from "three/examples/jsm/libs/tween.module.min";

export default class RendererTemplate {
  constructor() {
    //各种默认选项
    this.el = document.body;
    this.PCamera = {
      fov: 45,
      aspect: window.innerWidth / window.innerHeight,
      near: 1,
      far: 100000,
    };
    this.cameraPostion = new THREE.Vector3(10, 10, 10);
    this.cameraLookAt = new THREE.Vector3(0, 0, 0);
    this.rendererColor = new THREE.Color(0xF0F8FF);
    this.rendererWidth = window.innerWidth;
    this.rendererHeight = window.innerHeight;

    this.p1 = {x: 10, y: 20, z: 100}
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
    this.controls = new OrbitControls(this.camera, renderer.domElement)//轨迹控制
  }

  init() {
    this.initScene();
    this.initPerspectiveCamera();
    this.initRenderer();
    this.initFloor()
    this.addAxes()
    this.initLight()
    const animate = () => {
      requestAnimationFrame(animate);
      this.renderer.render(this.scene, this.camera);
      try {　// 放在 TWEEN.js未加载完成导致报错
        TWEEN.update();
      } catch (error) {
        console.log(error)
      }
    }
    animate()
    this.flyTo()
    this.randomBoxGeometry()

  }

  initFloor() {
    const floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1)
    const floorMaterial = new THREE.ShadowMaterial({color: 0x000000, opacity: 0.2});
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.01
    this.scene.add(floor)
  }

  initLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff); // soft white light
    this.scene.add(ambientLight);
    const hemisphere = new THREE.HemisphereLight(0xffffbb, 0xffffff, 1);
    this.scene.add(hemisphere);
  }

  addAxes() {
    const axes = new THREE.AxisHelper(100);
    this.scene.add(axes);

    const helper = new THREE.GridHelper(2000, 100);
    helper.material.opacity = 0.25;
    helper.material.transparent = true;
    this.scene.add(helper);
  }

  flyTo() {
    let tweenA = this.cameraCon({x: 10, y: 50, z: 50}, 3000)
    let tweenB = this.cameraCon({x: 50, y: 25, z: -50}, 4000)
    tweenA.chain(tweenB)
    tweenB.start()
  }

  cameraCon(p2, time) {
    let tween = new TWEEN.Tween(this.p1).to(p2, time).easing(TWEEN.Easing.Quadratic.InOut)
    tween.onUpdate(() => {
      this.camera.position.set(this.p1.x, this.p1.y, this.p1.z)
      this.camera.lookAt(0, 0, 0)
      this.controls.target.set(0, 0, 0) // 确保镜头移动后，视觉中心还在圆点处
      this.controls.update()
    })
    return tween
  }

  randomBoxGeometry() {
    for (let i = 0; i < 30; i++) {
      let g = new THREE.BoxGeometry(1, 1, 1)
      let m = new THREE.MeshBasicMaterial({color: 0x000fff})
      let box = new THREE.Mesh(g, m)
      box.position.set(Math.random() * 10, Math.random() * 10, Math.random() * 10)
      this.scene.add(box)
    }

    const container = document.querySelector("body")
    container.addEventListener('click', (e) => {
      this.addRaycaster(e)
    })
  }


  addRaycaster(event) {
    let vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window
        .innerHeight) * 2 + 1, 0.5);
    vector = vector.unproject(this.camera); // 将屏幕的坐标转换成三维场景中的坐标
    const meshArray = this.scene.children.filter(item => item.isMesh)
    const raycaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());
    const intersects = raycaster.intersectObjects(meshArray, true);
    if (intersects.length > 0) {
      intersects[0].object.material.color.set("#ff0000");
    }
  }


}
