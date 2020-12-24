import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/wxshop/order/page',
    method: 'get',
    params
  })
}
