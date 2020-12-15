import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/wxshop/goods/page',
    method: 'get',
    params
  })
}
