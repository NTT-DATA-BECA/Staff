import { createApp } from 'vue'
import { ipcRenderer } from 'electron';
import store from './store'
import './assets/tailwind.css'
import './assets/style.css'
import 'drawflow/dist/drawflow.min.css'

import VueSimpleAlert from "vue3-simple-alert-next";
import App from './App.vue';

createApp(App)
.use(store)
.use(VueSimpleAlert)
.provide('ipcRenderer', ipcRenderer)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
