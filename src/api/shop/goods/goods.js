import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/wxshop/goods/page',
    method: 'get',
    params
  })
}

export function save(params) {
  return request({
    url: '/wxshop/goods',
    method: 'post',
    data: params
  })
}

export function get(id) {
  return request({
    url: `/wxshop/goods/${id}`,
    method: 'get'
  })
}
