/**
 * 树组件数据处理工具函数
 * 用于组织架构树的数据转换和处理
 * @author Sarah (PO)
 */

/**
 * 将员工业务数据转换为Element UI树组件需要的数据格式
 * @param {Array} staffList 员工数据列表
 * @param {string} parentCode 所属组织编码
 * @returns {Array} 转换后的树节点数据
 */
export function convertEmployeesToTreeNodes (staffList, parentCode) {
  if (!Array.isArray(staffList) || staffList.length === 0) {
    return []
  }

  return staffList.map(staff => {
    // 尝试多个可能的姓名字段
    const name = staff.name || staff.staff_name || staff.user_name || staff.real_name || staff.display_name || `员工${staff.id}`

    return {
      id: staff.id, // 使用员工的原始数字ID，通过type区分节点类型
      label: name, // 树节点显示文本
      children: null, // 员工是叶子节点，无子节点
      isLeaf: true, // 标识为叶子节点，Element UI不显示展开图标
      type: '60', // 使用统一的type字段标识员工类型（DICT_ORG_SETTING_TYPE_STAFF）
      orgCode: parentCode, // 自定义字段：记录所属组织编码
      staffData: { // 自定义字段：保存完整的员工业务数据
        id: staff.id,
        name: staff.name,
        code: staff.code,
        position_name: staff.position_name,
        dept_name: staff.dept_name,
        mobile: staff.mobile,
        email: staff.email,
        status: staff.status,
        // 保存所有员工原始数据，供后续使用
        ...staff
      }
    }
  })
}

/**
 * 检查节点是否为员工节点
 * @param {Object} nodeData 树节点数据
 * @returns {boolean} 是否为员工节点
 */
export function isStaffNode (nodeData) {
  return nodeData && nodeData.type === '60' // DICT_ORG_SETTING_TYPE_STAFF
}

/**
 * 检查节点是否为岗位节点
 * @param {Object} nodeData 树节点数据
 * @returns {boolean} 是否为岗位节点
 */
export function isPositionNode (nodeData) {
  return nodeData && nodeData.type === '50' // DICT_ORG_SETTING_TYPE_POSITION
}

/**
 * 从树节点数据中提取员工信息
 * @param {Object} nodeData 树节点数据
 * @returns {Object|null} 员工数据对象，如果不是员工节点则返回null
 */
export function extractStaffData (nodeData) {
  if (isStaffNode(nodeData) && nodeData.staffData) {
    return nodeData.staffData
  }
  return null
}

/**
 * 获取节点显示用的标题文本
 * @param {Object} nodeData 树节点数据
 * @returns {string} 显示标题
 */
export function getNodeDisplayTitle (nodeData) {
  if (isStaffNode(nodeData)) {
    const staff = nodeData.staffData
    const position = staff.position_name ? ` (${staff.position_name})` : ''
    return `${staff.name}${position}`
  }
  return nodeData.label || '未知节点'
}
