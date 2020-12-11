import request from '@/utils/request'

export function list(params) {
  return request({
    url: '/admin/area/list',
    method: 'get',
    params
  })
}
