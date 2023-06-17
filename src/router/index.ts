import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/flow',
    name: 'Flow',
    component: () => import('../views/Flow.vue'),
  },
  {
    path: '/',
    name: 'Editor',
    component: () => import('../views/Editor.vue'),
  },
  {
    path: '/generator',
    name: 'generator',
    component: () => import('../views/Generator.vue'),
  },
  {
    path: '/managers',
    name: 'Managers',
    component: () => import('../views/Managers.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(), routes
});

export default router;
