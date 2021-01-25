import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/wxshop/marketing/coupon/page',
    method: 'get',
    params
  })
}

export function pageUser(params) {
  return request({
    url: '/wxshop/marketing/coupon/user/page',
    method: 'get',
    params
  })
}

export function saveOrUpdate(params) {
  return request({
    url: '/wxshop/marketing/coupon',
    method: 'post',
    data: params
  })
}

export function del(id) {
  return request({
    url: `/wxshop/marketing/coupon/${id}`,
    method: 'delete'
  })
}
