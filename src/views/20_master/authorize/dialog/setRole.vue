<template>
  <el-dialog
    v-if="listenVisible"
    v-el-drag-dialog
    :title="settings.position_title"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="false"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="740px"
  >
    <el-form
      ref="dataSubmitForm"
      :model="dataJson.tempJson"
      label-position="rigth"
      label-width="120px"
      status-icon
    >
      <el-row>
        <el-col
          :span="24"
          class="transferCenter"
        >
          <el-transfer
            v-model="settings.transfer.position_roles"
            filterable
            :filter-method="transferFilterMethod"
            filter-placeholder="请输入角色名称"
            :data="settings.transfer.role_all"
            :titles="['未选择角色', '已选择角色']"
            :button-texts="['角色反选', '选择角色']"
            :render-content="renderTransfer"
          />
        </el-col>
      </el-row>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <div class="floatLeft" />
      <el-button
        plain
        :disabled="settings.loading"
        @click="handleCancel()"
      >取消</el-button>
      <el-button
        v-show="settings.btnShowStatus.showInsert && !isViewModel"
        plain
        type="primary"
        :disabled="settings.loading || settings.btnDisabledStatus.disabledInsert "
        @click="doInsert()"
      >确定</el-button>
    </div>
  </el-dialog>
</template>

<style scoped>
.floatRight {
  float: right;
}
.floatLeft {
  float: left;
}
.el-form-item .el-select {
  width: 100%;
}
</style>

<script>

import { getAllRolesApi } from '@/api/10_system/role/role'
import { getPositionAssignedRoleIdsApi, savePositionRolesApi } from '@/api/20_master/position/position'
import constants_para from '@/common/constants/constants_para'
import deepcopy from 'deep-copy'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  // name: '', // 页面id，和router中的name需要一致，作为缓存
  components: {},
  directives: { elDragDialog },
  mixins: [],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    id: {
      type: Number,
      default: null
    },
    data: {
      type: Object,
      default: null
    },
    model: {
      type: String,
      default: constants_para.MODEL_VIEW
    }
  },
  data () {
    return {
      dataJson: {},
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        duration: 4000,

        // 按钮状态
        btnShowStatus: {
          showInsert: false,
          showUpdate: false,
          showCopyInsert: false
        },
        // 按钮状态：是否可用
        btnDisabledStatus: {
          disabledInsert: false,
          disabledUpdate: false,
          disabledCopyInsert: false
        },
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: '',
        // 穿梭框
        transfer: {
          position_id: null,
          // 所有staff
          role_all: [],
          position_roles: [],
          old_position_roles: [],
          current_row: null
        },
        // 弹出框title，岗位名称
        position_title: ''
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    },
    isViewModel () {
      if (this.model === constants_para.MODEL_VIEW) {
        return true
      } else {
        return false
      }
    }
  },
  // 监听器
  watch: {
    // 穿梭框的数据变动，设置重置和确定
    'settings.transfer.position_roles': {
      handler (newVal, oldVal) {
        const listA = newVal
        const listB = this.settings.transfer.old_position_roles
        // 如果新值，旧值为undefined 则return
        if (listA === undefined || listB === undefined) {
          return
        }
        const result = listA.length === listB.length && listA.every(a => listB.some(b => a === b)) && listB.every(_b => listA.some(_a => _a === _b))
        if (result) {
          // 未改变值
          this.settings.btnDisabledStatus.disabledInsert = true
        } else {
          // 有改变值
          this.settings.btnDisabledStatus.disabledInsert = false
        }
      },
      deep: true
    }
  },
  created () {
    this.init()
  },
  mounted () { },
  methods: {
    init () {
      if (this.isViewModel) {
        this.initView()
      } else {
        this.initEdit()
      }
    },

    // 加载岗位角色数据
    loadPositionRoles (isViewMode = false) {
      this.settings.loading = true

      // 并行查询所有角色和已分配角色ID
      const roleQueryData = { is_del: false }
      const positionQueryData = { position_id: this.settings.transfer.position_id }

      Promise.all([
        getAllRolesApi(roleQueryData),
        getPositionAssignedRoleIdsApi(positionQueryData)
      ]).then(([rolesResponse, assignedResponse]) => {
        // 处理所有角色数据
        const allRoles = rolesResponse.data || []
        this.settings.transfer.role_all = allRoles.map(role => ({
          key: role.id,
          label: role.name,
          disabled: isViewMode // 查看模式下禁用所有选项
        }))

        // 处理已分配角色ID
        const assignedRoleIds = assignedResponse.data || []
        this.settings.transfer.position_roles = [...assignedRoleIds]
        this.settings.transfer.old_position_roles = deepcopy(assignedRoleIds)

        console.log('角色数据加载成功:', {
          allRoles: this.settings.transfer.role_all.length,
          assignedRoles: assignedRoleIds.length
        })
      }).catch(error => {
        console.error('加载岗位角色数据失败:', error)
        this.$notify({
          title: '数据加载失败',
          message: error.message || '无法加载角色数据，请稍后重试',
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 初始化
    initEdit () {
      this.settings.position_title = '维护岗位【' + this.data.name + '】角色'
      // 初始化数据
      this.settings.transfer = {
        position_id: null,
        // 所有role
        role_all: [],
        position_roles: [],
        old_position_roles: [],
        current_row: this.data
      }
      this.settings.btnShowStatus.showInsert = true
      this.settings.transfer.position_id = this.id

      // 加载岗位角色数据
      this.loadPositionRoles()
    },
    // 查看角色岗位
    initView () {
      this.settings.position_title = '查看岗位【' + this.data.name + '】角色'
      // 初始化数据
      this.settings.transfer = {
        position_id: null,
        // 所有role
        role_all: [],
        position_roles: [],
        old_position_roles: [],
        current_row: this.data
      }
      this.settings.btnShowStatus.showInsert = true
      this.settings.transfer.position_id = this.id

      // 加载岗位角色数据
      this.loadPositionRoles(true)
    },
    // 穿梭框的过滤方法
    transferFilterMethod (query, item) {
      return item.label.indexOf(query) > -1
    },
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 插入逻辑：岗位角色维护，点击确定按钮
    doInsert () {
      this.settings.loading = true

      const saveData = {
        positionId: this.settings.transfer.position_id,
        roleIds: this.settings.transfer.position_roles
      }

      savePositionRolesApi(saveData).then((_data) => {
        // 更新当前行的角色数量
        this.settings.transfer.current_row.role_count = this.settings.transfer.position_roles.length

        this.$notify({
          title: '更新处理成功',
          message: _data.message,
          type: 'success',
          duration: this.settings.duration
        })
        this.$emit('closeMeOk', _data)
      }, (_error) => {
        this.$notify({
          title: '更新处理失败',
          message: _error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 点击跳转到组织机构页面，并关闭本页面
    handleForward (val) {
      this.$confirm('查看该角色详情，需要关闭当前页面，请注意保存！', '确认信息', {
      }).then(() => {
        // 通知路由，打开组织机构页面
        this.$router.push({
          name: this.PROGRAMS.P_STAFF, params: { name: val }
        })
        this.handleCancel()
      }).catch(action => {
      })
    },
    // 穿梭框增加按钮
    renderTransfer (h, option) {
      return (
        <span>
          {option.label}

        </span>
      )
    }
  }
}
</script>
