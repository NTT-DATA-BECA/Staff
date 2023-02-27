import { createApp } from 'vue'
import { ipcRenderer } from 'electron';
import store from './store'
import './assets/tailwind.css'
import VueSimpleAlert from "vue3-simple-alert-next";

createApp(App)
// .use(router)
.use(store)
.use(VueSimpleAlert)
.provide('ipcRenderer', ipcRenderer)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
