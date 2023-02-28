import { createApp } from 'vue'
import { ipcRenderer } from 'electron';
import store from './store'
import './assets/tailwind.css'
import './assets/style.css'
import 'drawflow/dist/drawflow.min.css'

import VueSimpleAlert from "vue3-simple-alert-next";
import App from './App.vue';
import router from './router';

createApp(App)
.use(store)
.use(router)
.use(VueSimpleAlert)
.provide('ipcRenderer', ipcRenderer)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
