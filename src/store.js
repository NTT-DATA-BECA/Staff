import { createStore } from 'vuex';

const store = createStore({
  state: {
    headers: [],
    excelData: [],
    traYears:""
  },
  mutations: {
    setHeaders(state, headers) {
      state.headers = headers;
    },
    setExcelData(state, excelData) {
      state.excelData = excelData;
    },
    setTraYears(state, traYears) {
      state.traYears = traYears;
    
  }},
  actions: {
    setHeaders({ commit }, headers) {
      commit('setHeaders', headers);
    },
    setExcelData({ commit }, excelData) {
      commit('setExcelData', excelData);
    },
    setTraYears({ commit }, traYears) {
      commit('setTraYears', traYears);
    }
  },
  getters: {
    getHeaders(state) {
      return state.headers;
    },
    getExcelData(state) {
      return state.excelData;
    },
    getTraYears(state) {
      return state.traYears;
    }
  },
});

export default store;
