import { createApp } from 'vue';
import { ipcRenderer } from 'electron';
import 'drawflow/dist/drawflow.min.css';
import 'vue-select/dist/vue-select.css';
import App from './App.vue';
import router from './router';
import vSelect from 'vue-select';
import store from './store';
import Vue3EasyDataTable from 'vue3-easy-data-table';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components'; 
import * as directives from 'vuetify/directives'; 

const vuetify = createVuetify({
  components,
  directives,
});

import './assets/tailwind.css';
import './assets/style.css';
import 'vue3-easy-data-table/dist/style.css';

createApp(App)
  .use(router)
  .use(store)
  .use(vuetify)
  .component('v-select', vSelect)
  .component('EasyDataTable', Vue3EasyDataTable)
  .provide('ipcRenderer', ipcRenderer)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*');
  });
