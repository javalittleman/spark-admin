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

export function send(params) {
  return request({
    url: '/wxshop/order/send',
    method: 'put',
    params
  })
}

export function cancel(id) {
  return request({
    url: `/wxshop/order/${id}/cancel`,
    method: 'put'
  })
}

export function count(orderType) {
  return request({
    url: '/wxshop/order/count',
    method: 'get',
    params: { orderType }
  })
}

export function trace(id) {
  return request({
    url: `/wxshop/order/express/trace/${id}`,
    method: 'get'
  })
}
