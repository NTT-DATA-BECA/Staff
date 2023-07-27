import { createStore } from 'vuex';

const store = createStore({
  state: {
    headers: [],
    excelData: [],
    TranslateYears:"",
    TranslateTitleFlowHistory:"",
    TranslateTitleEditorHistory:"",
  },
  mutations: {
    setHeaders(state, headers) {
      state.headers = headers;
    },
    setExcelData(state, excelData) {
      state.excelData = excelData;
    },
    setTranslateYears(state, TranslateYears) {
      state.TranslateYears = TranslateYears;
  },
  setTranslateTitleFlowHistory(state, TranslateTitleFlowHistory) {
    state.TranslateTitleFlowHistory = TranslateTitleFlowHistory;
},
setTranslateTitleEditorHistory(state, TranslateTitleEditorHistory) {
  state.TranslateTitleEditorHistory = TranslateTitleEditorHistory;
}
},
  actions: {
    setHeaders({ commit }, headers) {
      commit('setHeaders', headers);
    },
    setExcelData({ commit }, excelData) {
      commit('setExcelData', excelData);
    },
    setTranslateYears({ commit }, TranslateYears) {
      commit('setTranslateYears', TranslateYears);
    },
    setTranslateTitleFlowHistory({ commit }, TranslateTitleFlowHistory) {
      commit('setTranslateTitleFlowHistory', TranslateTitleFlowHistory);
    }
    ,    setTranslateTitleEditorHistory({ commit }, TranslateTitleEditorHistory) {
      commit('setTranslateTitleEditorHistory', TranslateTitleEditorHistory);
    }
  },
  getters: {
    getHeaders(state) {
      return state.headers;
    },
    getExcelData(state) {
      return state.excelData;
    },
    getTranslateYears(state) {
      return state.TranslateYears;
    },
    getTranslateTitleEditorHistory(state) {
      return state.TranslateTitleEditorHistory;
    },
    getTranslateTitleFlowHistory(state) {
      return state.TranslateTitleFlowHistory;
    }
  },
});

export default store;
