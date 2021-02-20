import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css'// Progress 进度条样式
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth' // 验权

const whiteList = ['/login'] // 不重定向白名单
router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      if (store.getters.name.length === 0) {
        // 加载数据字典
        store.dispatch('GetDicts').then(() => {
          console.log('数据字典加载成功...')
        })
        store.dispatch('GetInfo').then(() => { // 拉取用户信息
          router.addRoutes(store.getters.routers)// 添加后台路由表
          next({ ...to, replace: true })
        }).catch(e => {
          console.error(e)
          store.dispatch('FedLogOut').then(() => {
            Message.error('验证失败，请重新登录')
            next({ path: '/login' })
          })
        })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next('/login')
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // 结束Progress
})
