import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/wxshop/user/page',
    method: 'get',
    params
  })
}

export function updateStatus(id, status) {
  return request({
    url: `/wxshop/user/${id}/${status}`,
    method: 'patch'
  })
}
