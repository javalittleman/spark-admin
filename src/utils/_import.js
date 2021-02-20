
export default function(component) {
  try {
    switch (component) {
      case 'Layout':
        return require('@/layout').default
      case 'ParentView':
        // 嵌套路由
        return require('@/components/ParentView').default
      default:
        return require('@/views/' + component + '.vue').default
    }
  } catch (e) {
    return import('@/views/404')
  }
}
