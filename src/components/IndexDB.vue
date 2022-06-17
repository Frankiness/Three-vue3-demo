<template>
  INDEX
</template>

<script setup>
//打开数据库
import {onMounted} from "vue";

let db
const request = window.indexedDB.open('model', 1);
request.onerror = (e) => {
  console.log('数据库打开失败')
}
request.onsuccess = (e) => {
  db = request.result
  console.log('数据库打开成功')
  add(db)
}
//建立数据库
request.onupgradeneeded = function (event) {
  console.log('创建成功')
  db = event.target.result;
  let objectStore;
  if (!db.objectStoreNames.contains('person')) {
    objectStore = db.createObjectStore('person', {keyPath: 'id'}); //建表
    objectStore.createIndex('name', 'name', {unique: false}); //建立字段
    objectStore.createIndex('email', 'email', {unique: true});
  }
}
//写入数据库
const add = (db) => {
  const request = db.transaction(['person'], 'readwrite')
      .objectStore('person')
      .add({id: 1, name: '张三', age: 24, email: 'zhangsan@example.com'});

  request.onsuccess = function (event) {
    console.log('数据写入成功');
  };

  request.onerror = function (event) {
    console.log('数据写入失败');
  }
}
onMounted(() => {
  // console.log(db)
  // add()
})
</script>

<style scoped>

</style>
