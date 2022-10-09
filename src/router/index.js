import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/display-car",
  },
  {
    path: "/display-car",
    name: "display-car",
    component: () => import("../components/Tesla.vue"),
  },
  {
    path: "/shadow",
    name: "shadow",
    component: () => import("../components/Shadow.vue"),
  },
  // {
  //   path: "/",
  //   name: "test",
  //   component: () => import("../components/Test.vue"),
  // },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
