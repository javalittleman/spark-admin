import request from '@/utils/request'

export function list(params) {
  return request({
    url: '/wxshop/goods/category/list',
    method: 'get',
    params
  })
}

export function saveOrUpdate(params) {
  return request({
    url: '/wxshop/goods/category/',
    method: 'post',
    data: params
  })
}

export function del(id) {
  return request({
    url: `/wxshop/goods/category/${id}`,
    method: 'delete'
  })
}

