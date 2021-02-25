import  React from 'react'
import { useReducer } from 'react'
import { IProps, Action, IWindow } from 'ssr-types'
import { clientContext as Context } from './create-context'

// 客户端的 context  只需要创建一次，在页面整个生命周期内共享
declare const window: IWindow

window.STORE_CONTEXT = Context

function reducer (state: any, action: Action) {
  switch (action.type) {
    case 'updateContext':
      return { ...state, ...action.payload }
    default:
      throw new Error(`Action type ${action.type} is incorrect Please use type updateContext `)
  }
}

export function App (props: IProps) {
  const [state, dispatch] = useReducer(reducer, window.__INITIAL_DATA__)
  return (
    <Context.Provider value={{ state, dispatch }}>
      {props.children}
    </Context.Provider>
  )
}
