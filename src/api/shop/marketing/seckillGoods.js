import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/wxshop/marketing/seckill/goods/page',
    method: 'get',
    params
  })
}

export function saveOrUpdate(params) {
  return request({
    url: '/wxshop/marketing/seckill/goods',
    method: 'post',
    data: params
  })
}

export function del(id) {
  return request({
    url: `/wxshop/marketing/seckill/goods/${id}`,
    method: 'delete'
  })
}
