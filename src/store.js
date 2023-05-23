import { createStore } from 'vuex';

const store = createStore({
  state: {
    headers: [],
    variable1: [],
  },
  mutations: {
    setHeaders(state, headers) {
      state.headers = headers;
    },
    setVariable1(state, variable1) {
      state.variable1 = variable1;
    },
  },
  actions: {
    setHeaders({ commit }, headers) {
      commit('setHeaders', headers);
    },
    setVariable1({ commit }, variable1) {
      commit('setVariable1', variable1);
    },
  },
  getters: {
    getHeaders(state) {
      return state.headers;
    },
    getVariable1(state) {
      return state.variable1;
    },
  },
});

export default store;
