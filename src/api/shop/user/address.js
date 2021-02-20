import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/wxshop/user/address/page',
    method: 'get',
    params
  })
}
