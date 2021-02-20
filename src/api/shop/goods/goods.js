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

export function updateStatus(op, id) {
  return request({
    url: `/wxshop/goods/${op}/${id}`,
    method: 'patch'
  })
}

export function getSkus(id) {
  return request({
    url: `/wxshop/goods/sku/${id}`,
    method: 'get'
  })
}

export function del(id) {
  return request({
    url: `/wxshop/goods/${id}`,
    method: 'delete'
  })
}
