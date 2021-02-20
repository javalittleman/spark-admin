import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/wxshop/marketing/pink/goods/page',
    method: 'get',
    params
  })
}

export function saveOrUpdate(params) {
  return request({
    url: '/wxshop/marketing/pink/goods',
    method: 'post',
    data: params
  })
}

export function update(params) {
  return request({
    url: '/wxshop/marketing/pink/goods',
    method: 'put',
    data: params
  })
}

export function del(id) {
  return request({
    url: `/wxshop/marketing/pink/goods/${id}`,
    method: 'delete'
  })
}
