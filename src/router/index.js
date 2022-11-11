import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/display-car',
  },
  {
    path: '/display-car',
    name: 'display-car',
    component: () => import('../views/displayCar/index.vue'),
  },
  {
    path: '/shadow',
    name: 'shadow',
    component: () => import('../views/shadow/index.vue'),
  },
  {
    path: '/geojson',
    name: 'geojson',
    component: () => import('../views/geojson/index.vue'),
  },
  {
    path: '/radar',
    name: 'radar',
    component: () => import('../views/radar/index.vue'),
  },
  {
    path: '/wave',
    name: 'wave',
    component: () => import('../views/waves/index.vue'),
  },
  {
    path: '/fly-line',
    name: 'fly-line',
    component: () => import('../views/line/index.vue'),
  },
  {
    path: '/exploder',
    name: 'exploder',
    component: () => import('../views/exploder/index.vue'),
  },
  {
    path: '/indexedDB',
    name: 'indexedDB',
    component: () => import('../views/indexedDB/index.vue'),
  },
  {
    path: '/clipping',
    name: 'clipping',
    component: () => import('../views/clipping/index.vue'),
  },
  {
    path: '/flowTexture',
    name: 'flowTexture',
    component: () => import('../views/flowTexture/index.vue'),
  },
  {
    path: '/school',
    name: 'school',
    component: () => import('../views/school/index.vue'),
  },
  {
    path: '/upFlow',
    name: 'upFlow',
    component: () => import('../views/upFlow/index.vue'),
  },
  {
    path: '/sweep',
    name: 'sweep',
    component: () => import('../views/sweep/index.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
