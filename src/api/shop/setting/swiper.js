import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/wxshop/setting/swiper/page',
    method: 'get',
    params
  })
}

export function saveOrUpdate(params) {
  return request({
    url: '/wxshop/setting/swiper',
    method: 'post',
    data: params
  })
}

export function del(id) {
  return request({
    url: `/wxshop/setting/swiper/${id}`,
    method: 'delete'
  })
}
