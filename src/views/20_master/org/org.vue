<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col
        :xs="6"
        :sm="6"
        :md="6"
        :lg="6"
        :xl="6"
      >
        <el-card
          shadow="always"
          :body-style="{ padding: '10px' }"
        >
          <left :height="settings.leftHeight" />
        </el-card>
      </el-col>
      <el-col
        :xs="18"
        :sm="18"
        :md="18"
        :lg="18"
        :xl="18"
      >
        <el-card
          shadow="always"
          :body-style="{ padding: '10px' }"
        >
          <right :height="settings.rightHeight" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
// import constants_program from '@/common/constants/constants_program'
import resizeMixin from './orgResizeHandlerMixin'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  // name: constants_program.P_ORG, // 页面id，和router中的name需要一致，作为缓存
  components: {
    left: () => import('./left/left'), // 左侧tree
    right: () => import('./right/right') // 右侧list
    // UserList: () => import('./userList') // 右侧list
  },
  mixins: [resizeMixin],
  props: {
  },
  data () {
    return {

      // 数据类
      dataJson: {
        // 当前选中的组织节点上下文
        organizationContext: {
          selectedNode: null, // 当前选中的树节点
          companyInfo: null, // 提取的公司信息
          departmentInfo: null // 提取的部门信息
        }
      },
      // 页面设置json
      settings: {
        leftHeight: this.setUIheight(),
        rightHeight: this.setUIheight()
      }
    }
  },
  computed: {
    // leftHeight() {
    //   return this.setUIheight() - 60
    // },
    // rightHeight() {
    //   return this.setUIheight() - 50
    // }
  },
  // 监听器
  watch: {
  },
  created () {
  },
  mounted () {
    // 监听树节点选择变化事件
    EventBus.$on(this.EMITS.EMIT_ORG_CHANGE, this.handleOrganizationChange)
  },
  beforeDestroy () {
    // 清理事件监听
    EventBus.$off(this.EMITS.EMIT_ORG_CHANGE, this.handleOrganizationChange)
  },
  methods: {
    // 处理组织节点选择变化
    handleOrganizationChange (selectedNode) {
      this.dataJson.organizationContext.selectedNode = selectedNode

      // 根据选中的节点类型提取组织上下文
      this.extractOrganizationContext(selectedNode)
    },

    // 提取组织上下文信息
    extractOrganizationContext (node) {
      if (!node) {
        this.dataJson.organizationContext.companyInfo = null
        this.dataJson.organizationContext.departmentInfo = null
        return
      }

      // 根据节点类型提取相应信息
      switch (node.type) {
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
          // 企业节点：设置公司信息，清空部门信息
          this.dataJson.organizationContext.companyInfo = {
            id: node.serial_id,
            name: node.simple_name,
            code: node.code
          }
          this.dataJson.organizationContext.departmentInfo = null
          break

        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
          // 部门节点：设置部门信息，同时查找父级企业信息
          this.dataJson.organizationContext.departmentInfo = {
            id: node.serial_id,
            name: node.simple_name,
            code: node.code
          }

          // 查找父级企业信息
          this.findParentCompany(node)
          break

        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
          // 岗位节点：查找父级部门和企业信息
          this.findParentDepartmentAndCompany(node)
          break

        default:
          // 其他类型节点：清空上下文信息
          this.dataJson.organizationContext.companyInfo = null
          this.dataJson.organizationContext.departmentInfo = null
          break
      }
    },

    // 递归查找父级企业信息
    findParentCompany (node) {
      // 从left组件获取完整的树数据
      const leftComponent = this.$children.find(child => child.$options.name !== 'right')
      if (!leftComponent || !leftComponent.dataJson || !leftComponent.dataJson.treeData) return

      const parentId = node.parent_id
      const parentNode = this.findNodeInTree(leftComponent.dataJson.treeData, parentId)

      if (parentNode) {
        if (parentNode.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY) {
          // 找到企业节点
          this.dataJson.organizationContext.companyInfo = {
            id: parentNode.serial_id,
            name: parentNode.simple_name,
            code: parentNode.code
          }
        } else {
          // 继续向上查找
          this.findParentCompany(parentNode)
        }
      }
    },

    // 查找父级部门和企业信息（用于岗位节点）
    findParentDepartmentAndCompany (node) {
      const leftComponent = this.$children.find(child => child.$options.name !== 'right')
      if (!leftComponent || !leftComponent.dataJson || !leftComponent.dataJson.treeData) return

      const parentId = node.parent_id
      const parentNode = this.findNodeInTree(leftComponent.dataJson.treeData, parentId)

      if (parentNode) {
        if (parentNode.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT) {
          // 找到部门节点
          this.dataJson.organizationContext.departmentInfo = {
            id: parentNode.serial_id,
            name: parentNode.simple_name,
            code: parentNode.code
          }
          // 继续查找父级企业
          this.findParentCompany(parentNode)
        } else if (parentNode.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY) {
          // 直接找到企业节点
          this.dataJson.organizationContext.companyInfo = {
            id: parentNode.serial_id,
            name: parentNode.simple_name,
            code: parentNode.code
          }
        }
      }
    },

    // 在树数据中递归查找指定ID的节点
    findNodeInTree (treeData, nodeId) {
      if (!treeData || !Array.isArray(treeData)) return null

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
  }
}
</script>
