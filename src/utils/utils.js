import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

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
