import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
export default function useFloor(self) {
  const geometry = new THREE.PlaneGeometry(1800, 1800);
  let texture = textureLoader.load('imgs/dizuo/地板背景.png');
  const material = new THREE.MeshPhongMaterial({
    color: '#ffffff',
    map: texture,
    // emissive:0xffffff,
    // emissiveMap:Texture,
    transparent: true,
    opacity: 1,
    depthTest: true,
    // roughness:1,
    // metalness:0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  let plane = new THREE.Mesh(geometry, material);
  plane.rotateX(-Math.PI / 2);
  plane.position.y = -8;
  self.scene.add(plane);

  let rotatingApertureTexture = textureLoader.load('imgs/dizuo/rotatingAperture.png');
  let rotatingApertureerial = new THREE.MeshBasicMaterial({
    map: rotatingApertureTexture,
    transparent: true,
    opacity: 1,
    depthTest: true,
    depthWrite: false,
  });
  let rotatingApertureGeometry = new THREE.PlaneBufferGeometry(500, 500);
  let rotatingApertureMesh = new THREE.Mesh(rotatingApertureGeometry, rotatingApertureerial);
  rotatingApertureMesh.rotateX(-Math.PI / 2);
  rotatingApertureMesh.position.y = -8.02;
  rotatingApertureMesh.scale.set(1.2, 1.2, 1.2);
  self.scene.add(rotatingApertureMesh);

  let rotatingPointTexture = textureLoader.load('imgs/dizuo/rotating-point2.png');
  let material2 = new THREE.MeshBasicMaterial({
    map: rotatingPointTexture,
    transparent: true,
    opacity: 1,
    depthTest: true,
    depthWrite: false,
  });

  let rotatingPointMesh = new THREE.Mesh(rotatingApertureGeometry, material2);
  rotatingPointMesh.rotateX(-Math.PI / 2);
  rotatingPointMesh.position.y = -8.04;
  rotatingPointMesh.scale.set(1, 1, 1);
  self.scene.add(rotatingPointMesh);

  let circlePoint = textureLoader.load('imgs/dizuo/circle-point.png');
  let material3 = new THREE.MeshPhongMaterial({
    color: 0x00ffff,
    map: circlePoint,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    // depthTest: false,
  });
  let plane3 = new THREE.PlaneBufferGeometry(600, 600);
  let mesh3 = new THREE.Mesh(plane3, material3);
  mesh3.rotateX(-Math.PI / 2);
  mesh3.position.y = -8.06;
  self.scene.add(mesh3);
}
