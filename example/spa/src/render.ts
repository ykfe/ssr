import { Provide, Func } from '@midwayjs/decorator'

@Provide()
export class RenderService {

  @Func('render.handler', { middleware: [ 'fmw:staticFile' ] })
  async render () {
    return 'Please refresh this page later.'
  }
}
