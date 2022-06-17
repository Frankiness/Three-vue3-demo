import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {TWEEN} from "three/examples/jsm/libs/tween.module.min";
import Stats from "three/examples/jsm/libs/stats.module";

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
    const animate = () => {
      requestAnimationFrame(animate);
      this.renderer.render(this.scene, this.camera);
      this.stats.update()
      // this.texture.offset.x += 0.01;

      // 放在 TWEEN.js未加载完成导致报错
      try {
        TWEEN.update();
      } catch (error) {
        console.log(error)
      }
    }

    this.initScene();
    this.initPerspectiveCamera();
    this.initRenderer();
    this.initFloor()
    this.addAxes()
    this.initLight()
    this.addStats()
    this.flyTo()
    this.randomGenerationGeometry()
    // this.flowTexture()
    animate()
    let _this = this


    const addRaycaster = (event) => {
      let mouse = new THREE.Vector2();
      let x, y;
      if (event.changedTouches) {
        x = event.changedTouches[0].pageX;
        y = event.changedTouches[0].pageY;
      } else {
        x = event.clientX;
        y = event.clientY;
      }
      mouse.x = (x / window.innerWidth) * 2 - 1;
      mouse.y = -(y / window.innerHeight) * 2 + 1;
      let raycaster = new THREE.Raycaster();//拾取射线
      raycaster.setFromCamera(mouse, _this.camera);
      const intersection = raycaster.intersectObject(_this.mesh);
      if (intersection.length > 0) {
        const instanceId = intersection[0].instanceId;
        _this.mesh.setColorAt(instanceId, new THREE.Color(255, 255, 255));
        _this.mesh.instanceColor.needsUpdate = true;
      }
    }

    document.addEventListener('click', addRaycaster);
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

  //性能监控插件
  addStats() {
    this.stats = new Stats();
    document.body.appendChild(this.stats.domElement);
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

  randomGenerationGeometry() {
    let count = 10000;
    const geometry = new THREE.IcosahedronGeometry(3, 0);
    const material = new THREE.MeshPhongMaterial({
      wireframe: true
    });
    geometry.computeVertexNormals();

    this.mesh = new THREE.InstancedMesh(geometry, material, count);
    const color = new THREE.Color()
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      matrix.setPosition(Math.random() * 1000, Math.random() * 1000, Math.random() * 1000)
      this.mesh.setMatrixAt(i, matrix);//这里的i即instanceId
      this.mesh.setColorAt(i, color.setHex(Math.random() * 10 * 0xf00000));

    }
    this.scene.add(this.mesh);
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
