import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/wxshop/user/cart/page',
    method: 'get',
    params
  })
}
