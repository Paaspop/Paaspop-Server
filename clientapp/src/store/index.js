import Vue from 'vue'
import Vuex from 'vuex'

import AuthStore from './AuthStore'

import createPersistedState from "vuex-persistedstate";
Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		AuthStore: AuthStore
	},
	plugins: [createPersistedState()]
})