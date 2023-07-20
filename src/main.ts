import { createApp } from 'vue';
import { ipcRenderer } from 'electron';
import App from './App.vue';
import router from './router';
import vSelect from 'vue-select';
import store from './store';
import Vue3EasyDataTable from 'vue3-easy-data-table';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components'; 
import * as directives from 'vuetify/directives'; 
// import i18n from "./i18n"
import en from './assets/i18n/en.json'
import esp from './assets/i18n/esp.json'
import { createI18n } from "vue-i18n";
const vuetify = createVuetify({
  components,
  directives,
});
const i18n = createI18n({
  locale: "en",
  fallbackLocale: "en",
  messages: { esp, en },
});

import './assets/tailwind.css';
import './assets/style.css';
import 'vue3-easy-data-table/dist/style.css';
import 'drawflow/dist/drawflow.min.css';
import 'vue-select/dist/vue-select.css';

createApp(App)
  .use(router)
  .use(store)
  .use(vuetify)
  .use(i18n)
  .component('v-select', vSelect)
  .component('EasyDataTable', Vue3EasyDataTable)
  .provide('ipcRenderer', ipcRenderer)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*');
  });
