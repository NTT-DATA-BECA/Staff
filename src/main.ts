import { createApp } from 'vue'
import { ipcRenderer } from 'electron';
import './assets/tailwind.css'
import './assets/style.css'
import 'drawflow/dist/drawflow.min.css'
import 'vue-select/dist/vue-select.css';
import App from './App.vue';
import router from './router';
import vSelect from 'vue-select'
import Select from 'element-plus'
import Options from 'element-plus'
import 'element-plus/dist/index.css'
createApp(App)
.use(router)
.use(Select)
.use(Options)
.component('v-select', vSelect)
.provide('ipcRenderer', ipcRenderer)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
