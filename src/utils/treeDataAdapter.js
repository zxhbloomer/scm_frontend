/**
 * El-tree 到 He-tree 数据适配器
 * 用于处理组织架构树组件的数据格式转换
 */

class TreeDataAdapter {
  /**
   * 将 el-tree 数据格式转换为 he-tree 格式
   * @param {Array} elTreeData - el-tree 的数据格式
   * @param {Object} elTreeProps - el-tree 的 props 配置
   * @param {string|null} currentSelectedId - 当前选中的节点ID
   * @returns {Array} he-tree 格式的数据
   */
  static convertToHeTree (elTreeData, elTreeProps = {}, currentSelectedId = null) {
    if (!Array.isArray(elTreeData)) {
      return []
    }

    const {
      children: childrenField = 'children',
      label: labelField = 'label'
    } = elTreeProps

    return elTreeData.map(node => {
      const convertedNode = {
        // he-tree 基础字段
        text: node[labelField] || node.simple_name || node.label || '未命名节点',

        // 保留所有原有业务数据
        ...node,

        // 递归处理子节点
        children: node[childrenField] && node[childrenField].length > 0
          ? this.convertToHeTree(node[childrenField], elTreeProps, currentSelectedId)
          : undefined,

        // he-tree 状态管理（可选）
        $expanded: node.expanded !== false, // 默认展开，除非明确设置为 false
        $selected: node.id === currentSelectedId,
        $checked: node.checked || false
      }

      return convertedNode
    })
  }

  /**
   * 将 he-tree 数据格式转换回 el-tree 格式
   * @param {Array} heTreeData - he-tree 的数据格式
   * @param {Object} elTreeProps - 原始的 el-tree props 配置
   * @returns {Array} el-tree 格式的数据
   */
  static convertFromHeTree (heTreeData, elTreeProps = {}) {
    if (!Array.isArray(heTreeData)) {
      return []
    }

    const {
      children: childrenField = 'children',
      label: labelField = 'label'
    } = elTreeProps

    return heTreeData.map(node => {
      // 创建新对象，移除 he-tree 特有的字段
      const { text, $expanded, $selected, $checked, ...businessData } = node

      const convertedNode = {
        ...businessData,
        // 恢复 el-tree 的字段映射
        [labelField]: text || node.simple_name || node.label,

        // 递归处理子节点
        [childrenField]: node.children && node.children.length > 0
          ? this.convertFromHeTree(node.children, elTreeProps)
          : node[childrenField] // 保留原有的 children，可能为 undefined 或空数组
      }

      // 保存状态信息
      if ($expanded !== undefined) convertedNode.expanded = $expanded
      if ($selected !== undefined) convertedNode.selected = $selected
      if ($checked !== undefined) convertedNode.checked = $checked

      return convertedNode
    })
  }

  /**
   * 创建 he-tree 过滤函数
   * @param {Function} originalFilterMethod - 原始的 el-tree 过滤方法
   * @returns {Function} he-tree 兼容的过滤函数
   */
  static createHeTreeFilter (originalFilterMethod) {
    if (typeof originalFilterMethod !== 'function') {
      // 默认过滤逻辑：根据 text 字段进行简单匹配
      return (keyword, node) => {
        if (!keyword || keyword.trim() === '') return true
        const text = node.text || node.simple_name || node.label || ''
        return text.toLowerCase().includes(keyword.toLowerCase())
      }
    }

    return (keyword, node) => {
      // 将 he-tree 的 node 格式转换为 el-tree 期望的格式
      const elTreeNodeFormat = {
        data: node,
        label: node.text || node.simple_name || node.label
      }
      return originalFilterMethod(keyword, elTreeNodeFormat)
    }
  }

  /**
   * 获取节点在树中的路径
   * @param {Array} treeData - 树数据
   * @param {string} nodeId - 节点ID
   * @param {Array} path - 当前路径（内部使用）
   * @returns {Array|null} 节点路径数组，找不到则返回 null
   */
  static getNodePath (treeData, nodeId, path = []) {
    for (const node of treeData) {
      const currentPath = [...path, node]

      if (node.id === nodeId) {
        return currentPath
      }

      if (node.children && node.children.length > 0) {
        const result = this.getNodePath(node.children, nodeId, currentPath)
        if (result) return result
      }
    }

    return null
  }

  /**
   * 在树数据中查找指定节点
   * @param {Array} treeData - 树数据
   * @param {string} nodeId - 节点ID
   * @returns {Object|null} 找到的节点对象，找不到则返回 null
   */
  static findNodeInTree (treeData, nodeId) {
    if (!Array.isArray(treeData)) return null

    for (const node of treeData) {
      if (node.id === nodeId) {
        return node
      }

      if (node.children && node.children.length > 0) {
        const found = this.findNodeInTree(node.children, nodeId)
        if (found) return found
      }
    }

    return null
  }

  /**
   * 更新树中指定节点的数据
   * @param {Array} treeData - 树数据
   * @param {string} nodeId - 节点ID
   * @param {Object} updatedData - 要更新的数据
   * @returns {boolean} 是否成功更新
   */
  static updateTreeNodeData (treeData, nodeId, updatedData) {
    for (let i = 0; i < treeData.length; i++) {
      if (treeData[i].id === nodeId) {
        // 保持树结构相关属性，只更新业务数据
        const originalChildren = treeData[i].children
        Object.assign(treeData[i], updatedData)
        if (originalChildren) {
          treeData[i].children = originalChildren
        }
        return true
      }

      if (treeData[i].children && treeData[i].children.length > 0) {
        if (this.updateTreeNodeData(treeData[i].children, nodeId, updatedData)) {
          return true
        }
      }
    }
    return false
  }

  /**
   * 验证树数据格式是否正确
   * @param {Array} treeData - 要验证的树数据
   * @returns {Object} 验证结果 { valid: boolean, errors: Array }
   */
  static validateTreeData (treeData) {
    const errors = []

    if (!Array.isArray(treeData)) {
      return { valid: false, errors: ['树数据必须是数组格式'] }
    }

    const validateNode = (node, path = '') => {
      if (!node || typeof node !== 'object') {
        errors.push(`节点数据无效: ${path}`)
        return
      }

      if (!node.id) {
        errors.push(`节点缺少ID字段: ${path}`)
      }

      if (!node.text && !node.simple_name && !node.label) {
        errors.push(`节点缺少显示文本: ${path} (需要 text, simple_name 或 label 字段)`)
      }

      if (node.children) {
        if (!Array.isArray(node.children)) {
          errors.push(`节点的children必须是数组: ${path}`)
        } else {
          node.children.forEach((child, index) => {
            validateNode(child, `${path}/children[${index}]`)
          })
        }
      }
    }

    treeData.forEach((node, index) => {
      validateNode(node, `root[${index}]`)
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

export default TreeDataAdapter
