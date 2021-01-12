import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/wxshop/order/refund/page',
    method: 'get',
    params
  })
}

export function refund(params) {
  return request({
    url: '/wxshop/order/refund/confirm',
    method: 'put',
    params
  })
}
