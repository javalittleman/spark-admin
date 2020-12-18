import axios from 'axios'
import {
  Message
} from 'element-ui'
import store from '@/store'
import {
  getToken
} from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // api的base_url
  timeout: 15000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(config => {
  if (store.getters.token) {
    config.headers['Authorization'] = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

// respone拦截器
service.interceptors.response.use(
  response => {
    /**
     * code为非401权限不足，非20001 表示登录错误,50000以上全是错误代码
     */
    const res = response.data
    if (response.status === 401 || res.code === 5555 || res.code === -1 || res.code === 400 || res.code > 500) {
      Message({
        message: res.msg,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  (error) => {
    let msg = '请求失败，请联系管理员!'
    if (error.response.data.error_description) {
      msg = error.response.data.error_description
    } else if (error.response.data.msg) {
      msg = error.response.data.msg
    }
    Message.error(msg)
    return Promise.reject(error)
  }
)

export default service
