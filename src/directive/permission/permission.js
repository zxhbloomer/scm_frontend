import store from '@/store'

export default {
  // inserted(el, binding, vnode) {
  //   const { value } = binding
  //   const roles = store.getters && store.getters.roles

  //   if (value && value instanceof Array && value.length > 0) {
  //     const permissionRoles = value

  //     const hasPermission = roles.some(role => {
  //       return permissionRoles.includes(role)
  //     })

  //     if (!hasPermission) {
  //       el.parentNode && el.parentNode.removeChild(el)
  //     }
  //   } else {
  //     throw new Error(`need roles! Like v-permission="['admin','editor']"`)
  //   }
  // }
  /**
   * 自定义权限
   * @param {*} el
   * @param {*} binding
   * @param {*} vnode
   */
  inserted (el, binding, vnode) {
    const { value } = binding

    const userPermissionDataOperations = store.getters && store.getters.userPermissionData && store.getters.userPermissionData.permission_operation
    // 检查权限数据是否存在且为数组
    if (!userPermissionDataOperations || !Array.isArray(userPermissionDataOperations)) {
      // 如果权限数据不存在，隐藏元素（安全的默认行为）
      el.parentNode && el.parentNode.removeChild(el)
      return
    }

    const hasPermission = userPermissionDataOperations.find(item => item.operation_perms === value)
    // 查找权限是否在操作数据中存在
    if (!hasPermission) {
      el.parentNode && el.parentNode.removeChild(el)
    }

    // const roles = store.getters && store.getters.roles

    // if (value && value instanceof Array && value.length > 0) {
    //   const permissionRoles = value

    //   const hasPermission = roles.some(role => {
    //     return permissionRoles.includes(role)
    //   })

    //   if (!hasPermission) {
    //     el.parentNode && el.parentNode.removeChild(el)
    //   }
    // } else {
    //   throw new Error(`need roles! Like v-permission="['admin','editor']"`)
    // }
  }
}
