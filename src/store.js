import { createStore } from 'vuex';

const store = createStore({
  state: {
    headers: [],
    excelData: [],
  },
  mutations: {
    setHeaders(state, headers) {
      state.headers = headers;
    },
    setExcelData(state, excelData) {
      state.excelData = excelData;
    },
  },
  actions: {
    setHeaders({ commit }, headers) {
      commit('setHeaders', headers);
    },
    setExcelData({ commit }, excelData) {
      commit('setExcelData', excelData);
    },
  },
  getters: {
    getHeaders(state) {
      return state.headers;
    },
    getExcelData(state) {
      return state.excelData;
    },
  },
});

export default store;
