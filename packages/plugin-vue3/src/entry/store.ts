import { createStore as createVuexStore } from 'vuex' // define by webpack define plugin

// @ts-expect-error
import * as store from '@/store/index.ts'

function createStore () {
  return createVuexStore(store)
}

export {
  createStore
}
