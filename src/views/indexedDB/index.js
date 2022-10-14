import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';

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

  /**
   * 加载模型
   * @param {object} scene scene对象
   * @param {String} modelUrl 模型url地址
   * @returns
   */
  loadModel(scene, modelUrl) {
    let gltfloader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      let transaction = this._db.transaction(this._cacheTableName, 'readwrite');
      let store = transaction.objectStore(this._cacheTableName);
      // 判断模型是否存在
      let response = store.get(modelUrl);

      response.onsuccess = () => {
        // 模型如果已经存在缓存
        if (response.result) {
          let gltfJson = JSON.parse(response.result['json']);
          const loader = new THREE.ObjectLoader();

          loader.parse(gltfJson, (e) => {
            scene.add(e.children[e.children.length - 1]);
          });
          resolve();
        } else {
          let dracoLoader = new DRACOLoader();
          dracoLoader.setDecoderPath('draco/gltf/'); //设置解压库文件路径
          dracoLoader.setDecoderConfig({ type: 'js' });
          dracoLoader.preload();

          gltfloader.setDRACOLoader(dracoLoader);
          gltfloader.load('model/Audi/scene.gltf', (gltf) => {
            const object = gltf.scene;

            scene.add(object);
            let json = JSON.stringify(scene.toJSON());
            this.cache(modelUrl, json)
              .then(() => resolve())
              .catch(() => reject());
          });
        }
      };
    });
  }
  /**
   * 缓存模型到IndexedDB
   * @param {String} url 模型地址
   * @param {JSON} json 场景的json
   * @returns
   */
  cache(url, json) {
    return new Promise((resolve, reject) => {
      let transaction = this._db.transaction(this._cacheTableName, 'readwrite');
      let store = transaction.objectStore(this._cacheTableName);
      let storeReq = store.add({ id: url, json });
      storeReq.onerror = () => {
        console.log('缓存失败');
        reject();
      };
      storeReq.onsuccess = () => {
        console.log(`缓存成功`);
        resolve();
      };
    });
  }
}
