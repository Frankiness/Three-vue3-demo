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

const indexDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;

export class IndexDBCache {
  constructor(callback) {
    this._db = null;
    this._transaction = null;
    this._request = null;
    this._cacheTableName = 'modelcache';
    this._dbversion = 1;
    this.initDB(callback);
  }
  /**
   * 初始化数据库
   * @param {Function} callback 创建数据库后的回调
   */
  initDB(callback) {
    this._request = indexDB.open('cacheModel', this._dbversion);
    this._request.onsuccess = (event) => {
      this._db = this._request.result;
      if (typeof callback === 'function') callback();
    };
    this._request.onerror = (event) => {
      console.log('indexdb初始化失败');
      if (typeof callback === 'function') callback();
    };
    this._request.onupgradeneeded = (event) => {
      console.log('upgradeneeded');
      let db = this._request.result;
      let store = db.createObjectStore(this._cacheTableName, { keyPath: 'id' });
      store.createIndex('INDEX_ID', 'id', { unique: true });
    };
  }
  /**
   * 读取模型二进制数据流
   * @param {String} url 模型地址
   * @returns Promise
   */
  loadNetSource(url) {
    return new Promise((resolve, reject) => {
      fetch(url).then((res) => {
        if (res.status === 200) {
          res.blob().then((blob) => {
            let transaction = this._db.transaction(this._cacheTableName, 'readwrite');
            let store = transaction.objectStore(this._cacheTableName);
            let storeReq = store.add({ id: url, blob });
            storeReq.onerror = (event) => {
              console.log('缓存失败');
              reject(url);
            };
            storeReq.onsuccess = (event) => {
              console.log(`创建${url}缓存成功`);
              resolve(blob);
            };
          });
        } else {
          console.log('未找到缓存资源');
          reject(url);
        }
      });
    });
  }
  /**
   * 缓存模型到数据库中
   * @param {String} url 模型地址
   * @returns Promise
   */
  cacheModel(url) {
    return new Promise((resolve, reject) => {
      let transaction = this._db.transaction(this._cacheTableName, 'readwrite');
      let store = transaction.objectStore(this._cacheTableName);
      // 判断模型是否存在
      let response = store.get(url);
      response.onsuccess = (e) => {
        if (!response.result) {
          this.loadNetSource(url)
            .then((blob) => {
              let _url = URL.createObjectURL(blob);
              resolve(_url);
            })
            .catch((err) => {
              resolve(url);
            });
          return;
        }
        let _url = URL.createObjectURL(response.result.blob);
        reject(response.result.blob);
      };
      response.onerror = () => {
        resolve(url);
      };
    });
  }
  /**
   * 删除缓存
   * @param {String} url
   * @returns
   */
  deleteModel(url) {
    return new Promise((resolve, reject) => {
      let transaction = this._db.transaction(this._cacheTableName, 'readwrite');
      let store = transaction.objectStore(this._cacheTableName);
      let response = store.get(url);
      response.onsuccess = () => {
        console.log('删除成功');
        resolve('删除成功');
      };
      response.onerror = (event) => {
        console.log('删除失败');
        reject(event);
      };
    });
  }

  loadModel(scene, modelUrl) {
    let t = new Date().getTime() / 1000;
    let gltfloader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      let transaction = this._db.transaction(this._cacheTableName, 'readwrite');
      let store = transaction.objectStore(this._cacheTableName);
      // 判断模型是否存在
      let response = store.get(modelUrl);
      console.log(response);
      response.onsuccess = () => {
        // 模型如果已经存在缓存
        if (response.result) {
          let gltfJson = JSON.parse(response.result['json']);
          console.log('缓存的模型：', gltfJson);
          const loader = new THREE.ObjectLoader();
          loader.parse(gltfJson, (e) => {
            console.log('object::', e.children[e.children.length - 1]);
            scene.add(e.children[e.children.length - 1]);
            // console.log(scene);
            resolve(t);
          });
        } else {
          let dracoLoader = new DRACOLoader();
          dracoLoader.setDecoderPath('draco/gltf/'); //设置解压库文件路径
          dracoLoader.setDecoderConfig({ type: 'js' });
          dracoLoader.preload();
          gltfloader.setDRACOLoader(dracoLoader);
          gltfloader.load('model/Audi/scene.gltf', async (gltf) => {
            const object = gltf.scene;

            scene.add(object);
            let json = JSON.stringify(scene.toJSON());
            await this.cache(modelUrl, json);
            resolve(t);
          });
        }
      };
    });
  }

  cache(url, json) {
    return new Promise((resolve, reject) => {
      let transaction = this._db.transaction(this._cacheTableName, 'readwrite');
      let store = transaction.objectStore(this._cacheTableName);
      let storeReq = store.add({ id: url, json });
      storeReq.onerror = (event) => {
        console.log('缓存失败');
        reject();
      };
      storeReq.onsuccess = (event) => {
        console.log(`缓存成功`);
        resolve();
      };
    });
  }
}
