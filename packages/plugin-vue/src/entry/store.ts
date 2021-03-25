
// @ts-nocheck
import * as Vue from 'vue'
import * as Vuex from 'vuex'
import * as store from '@/store/index.ts'

const realVue: Vue = Vue.default || Vue
const RealVuex: Vuex = Vuex.default || Vuex

realVue.use(RealVuex)

function createStore () {
  return new Vuex.Store(store)
}

export {
  createStore
}
