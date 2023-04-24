import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';
/**
 * 监听模型加载进度
 * @param {String} url 模型地址
 * @return {Promise}
 */
export const loadModel = (url) => {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        resolve(gltf);
      },
      ({ loaded, total }) => {
        console.log(Math.abs((loaded / total) * 100));
      },
      (err) => {
        reject(err);
      },
    );
  });
};

export function FBO() {
  let width = window.innerWidth * window.devicePixelRatio;
  let height = window.innerHeight * window.devicePixelRatio;

  return new THREE.WebGLRenderTarget(width, height);
}

export function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isType(type, value) {
  return Object.prototype.toString.call(value) === `[object ${type}]`;
}

function isObject(value) {
  return isType('Object', value);
}

// 合并对象
export function deepMerge(target, source) {
  target = deepClone(target);
  for (let key in source) {
    if (key in target) {
      // 对象的处理
      if (isObject(source[key])) {
        if (!isObject(target[key])) {
          target[key] = source[key];
        } else {
          target[key] = deepMerge(target[key], source[key]);
        }
      } else {
        target[key] = source[key];
      }
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// 深拷贝
export function deepClone(target, map = new Map()) {
  // target 不能为空，并且是一个对象
  if (target != null && isObject(target)) {
    // 在克隆数据前，进行判断是否克隆过,已克隆就返回克隆的值
    let cache = map.get(target);
    if (cache) {
      return cache;
    }
    // 判断是否为数组
    const isArray = Array.isArray(target);
    let result = isArray ? [] : {};
    // 将新结果存入缓存中
    cache = map.set(target, result);
    // 如果是数组
    if (isArray) {
      // 循环数组，
      target.forEach((item, index) => {
        // 如果item是对象，再次递归
        result[index] = deepClone(item, cache);
      });
    } else {
      // 如果是对象
      Object.keys(target).forEach((key) => {
        if (isObject(result[key])) {
          result[key] = deepClone(target[key], cache);
        } else {
          result[key] = target[key];
        }
      });
    }
    return result;
  } else {
    return target;
  }
}
