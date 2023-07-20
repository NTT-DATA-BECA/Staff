import { createRouter, createWebHistory ,RouterView } from 'vue-router';

const routes = [
  {path: "/:locale?",
  component: RouterView,
  children: [
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
  },]}
];

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL), routes
});

export default router;
