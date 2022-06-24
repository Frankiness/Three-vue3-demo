import {createRouter, createWebHistory} from "vue-router";

const routes = [
  {
    path: "/",
    name: "Tesla",
    component: () => import("../components/Tesla.vue"),
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
