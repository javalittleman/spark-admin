import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/wxshop/user/footprint/page',
    method: 'get',
    params
  })
}
