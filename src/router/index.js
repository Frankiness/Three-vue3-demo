import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/display-car',
  },
  {
    path: '/display-car',
    name: '车辆展示',
    component: () => import('../views/displayCar/index.vue'),
  },
  {
    path: '/shadow',
    name: '阴影',
    component: () => import('../views/shadow/index.vue'),
  },
  {
    path: '/geojson',
    name: '读取geojson',
    component: () => import('../views/geojson/index.vue'),
  },
  {
    path: '/radar',
    name: '雷达',
    component: () => import('../views/radar/index.vue'),
  },
  {
    path: '/wave',
    name: '扩散波',
    component: () => import('../views/waves/index.vue'),
  },
  {
    path: '/fly-line',
    name: '飞线',
    component: () => import('../views/line/index.vue'),
  },
  {
    path: '/exploder',
    name: '模型拆解',
    component: () => import('../views/exploder/index.vue'),
  },
  {
    path: '/indexedDB',
    name: 'indexedDB存储模型',
    component: () => import('../views/indexedDB/index.vue'),
  },
  {
    path: '/clipping',
    name: '模型剪裁',
    component: () => import('../views/clipping/index.vue'),
  },
  {
    path: '/flowTexture',
    name: '流动纹理',
    component: () => import('../views/flowTexture/index.vue'),
  },
  {
    path: '/school',
    name: '昼夜切换',
    component: () => import('../views/school/index.vue'),
  },
  {
    path: '/upFlow',
    name: '向上流动纹理',
    component: () => import('../views/upFlow/index.vue'),
  },
  {
    path: '/sweep',
    name: '扫光',
    component: () => import('../views/sweep/index.vue'),
  },
  {
    path: '/bloom',
    name: '后处理bloom选中效果',
    component: () => import('../views/unreal-bloom/index.vue'),
  },
  {
    path: '/gltf-wire-frame',
    name: 'gltf模型线框',
    component: () => import('../views/gltfWireFrame/index.vue'),
  },
  {
    path: '/3d-heatmap',
    name: '3d热力图',
    component: () => import('../views/3d-heatmap/index.vue'),
  },
  {
    path: '/water-ball',
    name: '水球',
    component: () => import('../views/water-ball/index.vue'),
  },
  {
    path: '/raising-code',
    name: '上升数字',
    component: () => import('../views/raising-code/index.vue'),
  },
  {
    path: '/auto-scale-sprite',
    name: '缩放精灵图',
    component: () => import('../views/autoScaleSprite/index.vue'),
  },
  {
    path: '/sea',
    name: 'sea',
    component: () => import('../views/sea/index.vue'),
  },
  {
    path: '/cartoon',
    name: '卡通渲染',
    component: () => import('../views/cartoon/index.vue'),
  },
  {
    path: '/rain',
    name: '雨',
    component: () => import('../views/rain/index.vue'),
  },
  {
    path: '/svg',
    name: '根据svg生成几何体',
    component: () => import('../views/svgShape/index.vue'),
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../views/test/index.vue'),
  },
  {
    path: '/adjustLight',
    name: '调节灯光',
    component: () => import('../views/adjustLight/index.vue'),
  },
  {
    path: '/path-finding',
    name: '寻路',
    component: () => import('../views/path-finding/index.vue'),
  },
  // {
  //   path: '/galaxy',
  //   name: '银河',
  //   component: () => import('../views/galaxy/index.vue'),
  // },
  {
    path: '/turbine',
    name: '涡轮',
    component: () => import('../views/turbine/index.vue'),
  },
  {
    path: '/moveAnimation',
    name: '轨迹移动',
    component: () => import('../views/moveAnimation/index.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export { routes, router };
