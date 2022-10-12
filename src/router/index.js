import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/display-car",
  },
  {
    path: "/display-car",
    name: "display-car",
    component: () => import("../views/Car.vue"),
  },
  {
    path: "/shadow",
    name: "shadow",
    component: () => import("../views/Shadow.vue"),
  },
  {
    path: "/map",
    name: "map",
    component: () => import("../views/loadGeojson.vue"),
  },
  {
    path: "/radar",
    name: "radar",
    component: () => import("../views/radar/index.vue"),
  },
  {
    path: "/wave",
    name: "wave",
    component: () => import("../views/waves/index.vue"),
  },
  {
    path: "/fly-line",
    name: "fly-line",
    component: () => import("../views/line/index.vue"),
  },
  {
    path: "/exploder",
    name: "exploder",
    component: () => import("../views/exploder/index.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
