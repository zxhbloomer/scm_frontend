<template>
  <div>
    <el-form label-position="top" label-width="90px">
      <el-form-item label="⚙ 选择审批对象" prop="text" class="user-type">
        <el-radio-group v-model="nodeProps.assignedType">
          <el-radio v-for="t in approvalTypes" :key="t.type" :label="t.type">{{ t.name }}</el-radio>
        </el-radio-group>
        <div v-if="nodeProps.assignedType === 'ASSIGN_USER'">
          <el-button size="mini" icon="el-icon-plus" type="primary" round @click="selectUser(nodeProps.assignedUser,'ASSIGN_USER')">选择人员</el-button>
          <org-items v-model="nodeProps.assignedUser" />
        </div>
        <div v-else-if="nodeProps.assignedType === 'ASSIGN_LEADER'">
          <el-button size="mini" icon="el-icon-plus" type="primary" round @click="selectOrgDept">选择部门</el-button>
          <org-items v-model="nodeProps.assignedDept" />
        </div>
        <div v-else-if="nodeProps.assignedType === 'SELF_SELECT'">
          <el-radio-group v-model="nodeProps.selfSelect.multiple" size="mini">
            <el-radio-button :label="false">自选一个人</el-radio-button>
            <el-radio-button :label="true">自选多个人</el-radio-button>
          </el-radio-group>
        </div>
        <div v-else-if="nodeProps.assignedType === 'LEADER_TOP'">
          <el-divider />
          <el-form-item label="🖐 审批终点" prop="text" class="approve-end">
            <el-radio-group v-model="nodeProps.leaderTop.endCondition">
              <el-radio label="TOP">直到最上层主管</el-radio>
              <el-radio label="LEAVE">不超过发起人的</el-radio>
            </el-radio-group>
            <div v-if="nodeProps.leaderTop.endCondition === 'LEAVE'" class="approve-end-leave">
              <span>第 </span>
              <el-input-number v-model="nodeProps.leaderTop.endLevel" :min="1" :max="20" :step="1" size="mini" />
              <span> 级主管</span>
            </div>
            <el-divider />
          </el-form-item>
          <el-form-item label="📌 提取规则" prop="text" class="approve-end">
            <el-radio-group v-model="nodeProps.leaderTop.skipEmpty">
              <el-radio :label="true">无主管时跳过，向上查找直到满足级别人数</el-radio>
              <el-radio :label="false">无主管时按空处理</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
        <div v-else-if="nodeProps.assignedType === 'LEADER'">
          <el-divider />
          <el-form-item label="👨‍💼 指定主管" prop="text">
            <span>发起人的第 </span>
            <el-input-number
              v-model="nodeProps.leader.level"
              :min="1"
              :max="20"
              :step="1"
              size="mini"
            />
            <span> 级主管</span>
            <div style="color: #409EFF; font-size: small;">👉 直接主管为 第 1 级主管</div>
          </el-form-item>
          <el-form-item label="📌 提取规则" prop="text" class="approve-end">
            <el-radio-group v-model="nodeProps.leader.skipEmpty">
              <el-radio :label="true">无主管时跳过并向上查找</el-radio>
              <el-radio :label="false">无主管时按空处理</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
        <div v-else-if="nodeProps.assignedType === 'ROLE'">
          <el-button size="mini" icon="el-icon-plus" type="primary" round @click="selectRole">选择系统角色</el-button>
          <org-items v-model="nodeProps.role" />
        </div>
        <div v-else-if="nodeProps.assignedType === 'FORM_USER'">
          <el-form-item label="选择表单联系人项" prop="text" class="approve-end">
            <el-select v-model="nodeProps.formUser" style="width: 80%;" size="small" placeholder="请选择联系人表单项">
              <el-option v-for="(op, index) in userForms" :key="index" :label="op.title" :value="op.id" />
            </el-select>
          </el-form-item>
        </div>
        <div v-else-if="nodeProps.assignedType === 'FORM_DEPT'">
          <el-form-item label="选择表单部门项" prop="text" class="approve-end">
            <el-select v-model="nodeProps.formDept" style="width: 80%;" size="small" placeholder="请选择部门选择表单项">
              <el-option v-for="(op, index) in deptForms" :key="index" :label="op.title" :value="op.id" />
            </el-select>
          </el-form-item>
        </div>
        <div v-else-if="nodeProps.assignedType === 'SELF'">
          <span class="item-desc">发起人自己作为审批人进行审批</span>
        </div>
        <div v-else>
          <i class="el-icon-error" style="color: #e04765" />
          <span class="item-desc">系统自动拒绝审批</span>
        </div>
      </el-form-item>
      <div v-show="nodeProps.assignedType !== 'REFUSE'">
        <el-divider />
        <el-form-item label="👤 审批人为空时" prop="text" class="line-mode">
          <el-radio-group v-model="nodeProps.nobody.handler">
            <el-radio label="TO_PASS">自动通过</el-radio>
            <el-radio label="TO_REFUSE">自动驳回</el-radio>
            <el-radio label="TO_ADMIN">转交审批管理员</el-radio>
            <el-radio label="TO_USER" :disabled="nodeProps.assignedType === 'ASSIGN_USER'">转交到指定人员</el-radio>
          </el-radio-group>

          <div v-if="nodeProps.nobody.handler === 'TO_USER'" style="margin-top: 10px">
            <el-button size="mini" icon="el-icon-plus" type="primary" round @click="selectNoSetUser">选择人员</el-button>
            <org-items v-model="nodeProps.nobody.assignedUser" />
          </div>

        </el-form-item>

        <div v-if="showMode">
          <el-divider />
          <el-form-item label="👩‍👦‍👦 多人审批时审批方式" prop="text" class="approve-mode">
            <el-radio-group v-model="nodeProps.mode">
              <el-radio label="NEXT">会签 （按选择顺序审批，须全部同意，不支持加签）</el-radio>
              <el-radio label="AND">会签（可同时审批，须全部同意）</el-radio>
              <el-radio label="OR">或签（有一人同意即可）</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <el-divider>高级设置</el-divider>
        <el-form-item label="✍ 审批同意时是否需要签字" prop="text">
          <el-switch v-model="nodeProps.sign" inactive-text="不用" active-text="需要" disabled />
          <el-tooltip class="item" effect="dark" content="如果全局设置了需要签字，则此处不生效" placement="top-start">
            <i class="el-icon-question" style="margin-left: 10px; font-size: medium; color: #b0b0b1" />
          </el-tooltip>
        </el-form-item>
        <el-form-item label="⏱ 审批期限（为 0 则不生效）" prop="timeLimit">
          <el-input
            v-model="nodeProps.timeLimit.timeout.value"
            style="width: 180px;"
            placeholder="时长"
            size="small"
            type="number"
          >
            <el-select slot="append" v-model="nodeProps.timeLimit.timeout.unit" style="width: 75px;" placeholder="请选择">
              <el-option label="天" value="D" />
              <el-option label="小时" value="H" />
              <el-option label="分钟" value="M" />
            </el-select>
          </el-input>
        </el-form-item>
        <el-form-item v-if="nodeProps.timeLimit.timeout.value > 0" label="审批期限超时后执行" prop="level">
          <el-radio-group v-model="nodeProps.timeLimit.handler.type">
            <el-radio label="PASS">自动通过</el-radio>
            <el-radio label="REFUSE">自动驳回</el-radio>
            <el-radio label="NOTIFY">发送提醒</el-radio>
          </el-radio-group>
          <div v-if="nodeProps.timeLimit.handler.type === 'NOTIFY'">
            <div style="color:#409EEF; font-size: small">默认提醒当前审批人</div>
            <el-switch v-model="nodeProps.timeLimit.handler.notify.once" inactive-text="循环" active-text="一次" />
            <!--            <span style="margin-left: 20px" v-if="!nodeProps.timeLimit.handler.notify.once">
							每隔
							<el-input-number :min="0" :max="10000" :step="1" size="mini"
                               v-model="nodeProps.timeLimit.handler.notify.hour"/>
							小时提醒一次
						</span>-->
          </div>
        </el-form-item>
        <el-form-item label="🙅‍ 如果审批被驳回 👇">
          <el-radio-group v-model="nodeProps.refuse.type" disabled>
            <el-radio label="TO_END">直接结束流程</el-radio>
            <!--            <el-radio label="TO_BEFORE">驳回到上级审批节点</el-radio>-->
            <el-radio label="TO_NODE">驳回到指定节点</el-radio>
          </el-radio-group>
          <div v-if="nodeProps.refuse.type === 'TO_NODE'">
            <span>指定节点:</span>
            <el-select v-model="nodeProps.refuse.target" style="margin-left: 10px; width: 150px;" placeholder="选择跳转步骤" size="small">
              <el-option v-for="(node, i) in nodeOptions" :key="i" :label="node.name" :value="node.id" />
            </el-select>
          </div>

        </el-form-item>
      </div>

    </el-form>
    <!--    <org-picker ref="orgPicker" :title="pickerTitle" multiple :type="orgPickerType" :selected="orgPickerSelected" @ok="selected" />-->

    <SelectStaff
      v-if="settings.popsettings.one.visible"
      :visible="settings.popsettings.one.visible"
      :type="settings.popsettings.one.type"
      :index="settings.popsettings.one.index"
      :cindex="settings.popsettings.one.cindex"
      :on-vuex-update="settings.popsettings.one.onVuexUpdate"
      :data="settings.popsettings.one.props.data"
      @emitInsertStaffOk="handleInsertStaffOk"
      @emitCloseCancel="handleSelectStaffCancel"
    />

  </div>
</template>

<script>
import OrgPicker from '@/components/60_bpm/common/OrgPicker'
import OrgItems from '../OrgItems'
import SelectStaff from '@/components/60_bpm/process/staffTreeDialog/index'

export default {
  name: 'ApprovalNodeConfig',
  components: { SelectStaff, OrgPicker, OrgItems },
  props: {
    config: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      showOrgSelect: false,
      orgPickerSelected: [],
      orgPickerType: 'user',
      approvalTypes: [
        { name: '指定人员', type: 'ASSIGN_USER' },
        { name: '发起人自选', type: 'SELF_SELECT' },
        { name: '发起人自己', type: 'SELF' },
        { name: '部门主管', type: 'LEADER' },
        { name: '多级部门主管', type: 'LEADER_TOP' },
        { name: '指定部门的主管', type: 'ASSIGN_LEADER' },
        { name: '系统角色', type: 'ROLE' },
        { name: '表单内联系人', type: 'FORM_USER' },
        { name: '表单内部门主管', type: 'FORM_DEPT' },
        { name: '系统(自动拒绝)', type: 'REFUSE' }
      ],
      settings: {
        popsettings: {
          // 弹出编辑页面
          one: {
            visible: false,
            // 分组下标
            index: null,
            // 条件下标
            cindex: null,
            // 是否插入vuex数据
            onVuexUpdate: false,
            type: 'user',
            props: {
              id: undefined,
              data: Array,
              dialogStatus: ''
            }
          }
        }
      }
    }
  },
  computed: {
    nodeProps () {
      return this.$store.getters.selectedNode.props
    },
    select () {
      return this.config.assignedUser || []
    },
    selectDept () {
      if (!this.config.assignedDept) {
        this.$set(this.config, 'assignedDept', [])
      }
      return this.config.assignedDept
    },
    userForms () {
      const userForm = []
      this.loadFormItemPicker(this.$store.getters.design.formItems, userForm, 'UserPicker')
      return userForm
    },
    deptForms () {
      const deptForm = []
      this.loadFormItemPicker(this.$store.getters.design.formItems, deptForm, 'DeptPicker')
      return deptForm
    },
    pickerTitle () {
      switch (this.orgPickerType) {
        case 'user':
          return '请选择人员'
        case 'role':
          return '请选择系统角色'
        default:
          return null
      }
    },
    nodeOptions () {
      const values = []
      const excType = ['EMPTY', 'CONDITION', 'CONDITIONS', 'CONCURRENT', 'CONCURRENTS']
      this.$store.getters.nodeMap.forEach((v) => {
        if (excType.indexOf(v.type) === -1 && v.id !== this.$store.getters.selectedNode.id) {
          values.push({ id: v.id, name: v.name })
        }
      })
      return values
    },
    showMode () {
      switch (this.nodeProps.assignedType) {
        case 'ASSIGN_USER':
          return this.nodeProps.assignedUser.length > 0
        case 'ASSIGN_LEADER':
          return true
        case 'SELF_SELECT':
          return this.nodeProps.selfSelect.multiple
        case 'LEADER_TOP':
          return true
        case 'FORM_USER':
          return true
        case 'ROLE':
          return true
        case 'FORM_DEPT':
          return true
        default:
          return false
      }
    }
  },
  methods: {
    loadFormItemPicker (items, result, name) {
      items.forEach(it => {
        if (it.name === 'SpanLayout') {
          this.loadFormItemPicker(it.props.items, result, name)
        } else if (it.name === name) {
          result.push(it)
        }
      })
    },
    selectUser (user, val) {
      // this.orgPickerSelected = this.select
      // this.orgPickerType = 'user'
      // console.log('选择 ' + this.orgPickerType)
      // this.$refs.orgPicker.show()
      this.settings.popsettings.one.visible = true
      this.settings.popsettings.one.onVuexUpdate = true
      this.settings.popsettings.one.props.data = user
      this.approvalType = val
    },
    // 取消选择人员
    handleSelectStaffCancel () {
      this.settings.popsettings.one.visible = false
    },
    // 选择人员成功
    handleInsertStaffOk (data) {
      switch (this.approvalType) {
        case 'ASSIGN_USER':
          this.nodeProps.assignedUser = data
          break
        case 'TO_USER':
          this.nodeProps.nobody.assignedUser = data
          break
      }

      this.handleSelectStaffCancel()
    },
    selectOrgDept () {
      this.orgPickerSelected = this.selectDept
      this.orgPickerType = 'dept'
      console.log('选择 ' + this.orgPickerType)
      this.$refs.orgPicker.show()
    },
    selectNoSetUser () {
      this.orgPickerSelected = this.config.nobody.assignedUser
      this.orgPickerType = 'user'
      this.$refs.orgPicker.show()
    },
    selectRole () {
      this.orgPickerType = 'role'
      this.orgPickerSelected = this.config.role
      console.log('选择 ' + this.orgPickerType)
      this.$refs.orgPicker.show()
    },
    selected (select) {
      this.orgPickerSelected.length = 0
      select.forEach(val => this.orgPickerSelected.push(val))
    },
    removeOrgItem (index) {
      this.select.splice(index, 1)
    }
  }
}
</script>

<style lang="less" scoped>
.user-type {
  /deep/ .el-radio {
    width: 110px;
    margin-top: 10px;
    margin-bottom: 20px;
  }
}

/deep/ .line-mode {
  .el-radio {
    width: 150px;
    margin: 5px;
  }
}

/deep/ .el-form-item__label {
  line-height: 25px;
}

/deep/ .approve-mode {
  .el-radio {
    float: left;
    width: 100%;
    display: block;
    margin-top: 15px;
  }
}

/deep/ .approve-end {
  position: relative;

  .el-radio-group {
    width: 160px;
  }

  .el-radio {
    margin-bottom: 5px;
    width: 100%;
  }

  .approve-end-leave {
    position: absolute;
    bottom: 15px;
    left: 150px;
  }
}

/deep/ .el-divider--horizontal {
  margin: 10px 0;
}
</style>
