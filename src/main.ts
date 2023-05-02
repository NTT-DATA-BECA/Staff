import { createApp } from 'vue'
import { ipcRenderer } from 'electron';
import './assets/tailwind.css'
import './assets/style.css'
import 'drawflow/dist/drawflow.min.css'
import 'vue-select/dist/vue-select.css';
import App from './App.vue';
import router from './router';
import vSelect from 'vue-select'

createApp(App)
.use(router)

.component('v-select', vSelect)
.provide('ipcRenderer', ipcRenderer)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
