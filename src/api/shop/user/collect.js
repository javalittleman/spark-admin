import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/wxshop/user/collect/page',
    method: 'get',
    params
  })
}
