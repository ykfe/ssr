import  React from 'react'
import { useContext, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { FC } from 'ssr-types'

let _fetch: any = null
let routerChanged = false

const popStateFn = () => {
  // historyPop的时候需要调用fetch
  routerChanged = true
  // 使用popStateFn保存函数防止addEventListener重复注册,排除hashchange的情况
  if (!location.hash && _fetch) {
    _fetch()
  }
}

function wrapComponent (WrappedComponent: FC) {
  return withRouter(props => {
    const { state, dispatch } = useContext(window.STORE_CONTEXT)
    if (!routerChanged) {
      // routerChanged 为 true 代表已经进行过切换路由的操作，不需要再将 window.__INITIAL_DATA__ 作为 data dispatch
      routerChanged = !window.__USE_SSR__ || props.history.action === 'PUSH'
    }
    window.addEventListener('popstate', popStateFn)
    useEffect(() => {
      didMount()
    }, [])
    const didMount = async () => {
      if (props.history.action !== 'POP' || !window.__USE_SSR__) {
        await fetch()
      }
    }
    const fetch = async () => {
      // csr首次进入页面以及csr/ssr切换路由时才调用fetch
      const asyncData = WrappedComponent.fetch ? await WrappedComponent.fetch(props) : {}
      const data = Object.assign({}, routerChanged ? {} : state, asyncData)
      await dispatch({
        type: 'updateContext',
        payload: data
      })
    }
    _fetch = fetch
    return <WrappedComponent {...props}></WrappedComponent>
  })
}

export {
  wrapComponent
}
