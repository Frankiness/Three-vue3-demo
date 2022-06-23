import {createRouter, createWebHistory} from "vue-router";

const routes = [
  {
    path: "/",
    name: "Tesla",
    component: () => import("../components/Tesla.vue"),
  },
  {
    path: "/three",
    name: "three",
    component: () => import("../components/ThreePage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
