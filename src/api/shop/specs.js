import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/wxshop/specs/page',
    method: 'get',
    params
  })
}

export function list() {
  return request({
    url: '/wxshop/specs/list',
    method: 'get'
  })
}

export function saveOrUpdate(params) {
  return request({
    url: '/wxshop/specs',
    method: 'post',
    data: params
  })
}

export function get(id) {
  return request({
    url: `/wxshop/specs/${id}`,
    method: 'get'
  })
}
