import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/wxshop/marketing/pink/user/page',
    method: 'get',
    params
  })
}
