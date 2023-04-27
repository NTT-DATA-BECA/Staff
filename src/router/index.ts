import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Flow',
    component: () => import('../views/Flow.vue'),
  },
  {
    path: '/Editor',
    name: 'Editor',
    component: () => import('../views/Editor.vue'),
  },
  {
    path: '/generator',
    name: 'generator',
    component: () => import('../views/Generator.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(), routes
});

export default router;
