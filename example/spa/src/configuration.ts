import { Configuration } from '@midwayjs/decorator'

@Configuration({
  imports: ['@midwayjs/faas-middleware-static-file'],
  importConfigs: [
    './config/'
  ]
})
export class ContainerConfiguration {

}
