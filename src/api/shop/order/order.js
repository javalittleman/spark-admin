import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/wxshop/order/page',
    method: 'get',
    params
  })
}

export function update(params) {
  return request({
    url: '/wxshop/order',
    method: 'put',
    data: params
  })
}

export function get(id) {
  return request({
    url: `/wxshop/order/${id}`,
    method: 'get'
  })
}
