import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/wxshop/auth/page',
    method: 'get',
    params
  })
}

export function saveOrUpdate(params) {
  return request({
    url: '/wxshop/auth',
    method: 'post',
    data: params
  })
}
