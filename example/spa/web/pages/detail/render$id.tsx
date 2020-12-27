import React, { useContext } from 'react'
import { IContext, SProps } from 'ssr-types'
import Player from '@/components/player'
import Brief from '@/components/brief'
import Recommend from '@/components/recommend'
import Search from '@/components/search'
import { Ddata } from '@/interface'

export default (props: SProps) => {
  const { state, dispatch } = useContext<IContext<Ddata>>(window.STORE_CONTEXT)
  return (
    <div>
      <Search></Search>
      {
        state.detailData?.data[0].dataNode ? <div>
          <Player data={state.detailData.data[0].dataNode} />
          <Brief data={state.detailData.data[1].dataNode} />
          <Recommend data={state.detailData.data[2].dataNode} />
        </div> : <img src='https://gw.alicdn.com/tfs/TB1v.zIE7T2gK0jSZPcXXcKkpXa-128-128.gif' className='loading' />
      }
    </div>
  )
}
