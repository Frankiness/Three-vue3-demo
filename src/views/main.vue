<template>
  <!--  <router-view></router-view>-->
  <a-layout style="width: 100vw; height: 100vh">
    <a-layout-sider>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="inline"
        @click="handleMuneClick"
      >
        <a-menu-item key="display-car">
          <span>改变模型材质颜色</span>
        </a-menu-item>
        <a-menu-item key="shadow">
          <span>投影</span>
        </a-menu-item>
        <a-menu-item key="geojson">
          <span>Geojson转三维</span>
        </a-menu-item>
        <a-menu-item key="radar">
          <span>雷达波</span>
        </a-menu-item>
        <a-menu-item key="wave">
          <span>扩散波</span>
        </a-menu-item>
        <a-menu-item key="fly-line">
          <span>飞线</span>
        </a-menu-item>
        <a-menu-item key="exploder">
          <span>模型爆炸拆解</span>
        </a-menu-item>
        <a-menu-item key="indexedDB">
          <span>IndexedDB缓存模型</span>
        </a-menu-item>
        <a-menu-item key="clipping">
          <span>物体剪裁</span>
        </a-menu-item>
        <a-menu-item key="flowTexture">
          <span>流动纹理</span>
        </a-menu-item>
        <a-menu-item key="school">
          <span>昼夜切换</span>
        </a-menu-item>
        <a-menu-item key="upFlow">
          <span>建筑上升光圈</span>
        </a-menu-item>
        <a-menu-item key="sweep">
          <span>城市扫光</span>
        </a-menu-item>
        <a-menu-item key="bloom">
          <span>点击物体边缘泛光</span>
        </a-menu-item>
        <a-menu-item key="gltf-wire-frame">
          <span>GLTF模型线框模式</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content
        :style="{ margin: '12px', background: '#fff', minHeight: '280px' }"
      >
        <router-view></router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
let selectedKeys = ref(['display-car']);
const handleMuneClick = (e) => {
  router.push(e.key);
};
</script>
<style>
#components-layout-demo-custom-trigger .trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

#components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}

#components-layout-demo-custom-trigger .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.3);
  margin: 16px;
}

.site-layout .site-layout-background {
  background: #fff;
}
</style>
