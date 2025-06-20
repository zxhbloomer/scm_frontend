<template>
  <div>
    <!-- pop窗口 数据编辑:新增、修改 废弃-->
    <el-dialog
      v-if="listenVisible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      title="审批流程"
      :visible="true"
      :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
      :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
      :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="400px"
      destroy-on-close
    >
      <div class="el-row" style="margin-left: -10px; margin-right: -10px">
        <div
          class="el-col el-col-15"
          style="
          padding-left: 10px;
          padding-right: 10px;
          border-right: 1px solid rgb(232, 232, 232);
          height: 100%;
        "
        />
        <div class="el-col el-col-9" style="padding-left: 0px; padding-right: 10px">
          <div>
            <el-timeline>
              <el-timeline-item
                v-for="(task, indexc) in processData"
                :key="indexc"
                :icon="task.icon"
                size="large"
                class="task"
              >
                <div
                  v-if="!task.hasOwnProperty('options')"
                  class="process-node-render"
                >
                  <div>
                    <div style="font-size: 16px">{{ task.title }}</div>
                    <span style="color: rgb(168, 173, 175)">{{ task.desc }}</span>
                  </div>
                  <div style="display: flex;">
                    <div
                      v-for="(user, indexu) in task.users"
                      :key="indexu"
                      class="avatar show-y"
                    >
                      <div class="a-img">
                        <el-avatar
                          style="height: 38px; width: 38px; line-height: 38px;margin-left: 10px"
                          :src="user.avatar"
                        />
                        <i
                          v-if="task.isEdit"
                          class="close el-icon-close"
                          @click="delUser(task.users, user)"
                        />
                        <i class="status" style="display: none" />
                      </div>
                      <span class="text" >{{ user.name }}</span>
                    </div>
                    <span
                      v-if="task.isEdit &&(task.multiple || 0 === task.users.length)"
                      class="add-user"
                      @click="selectUser(task.users, task)"
                    ><i class="el-icon-plus" />
                      <div>添加</div></span>
                  </div>
                </div>
                <el-radio-group v-else v-model="task.id" size="mini">
                  <el-radio-button
                    v-for="(d, indexo) in task.options"
                    :key="indexo"
                    :label="d.title"
                    :value="d.id"
                  />
                </el-radio-group>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </div>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-divider />
        <el-button
          plain
          @click="handleCancel()"
        >取消</el-button>
        <el-button
          @click="handleOk()"
        >确定</el-button>
      </div>
    </el-dialog>

    <SelectStaff
      v-if="settings.popsettings.one.visible"
      :visible="settings.popsettings.one.visible"
      :type="settings.popsettings.one.type"
      :index="settings.popsettings.one.index"
      :cindex="settings.popsettings.one.cindex"
      :on-vuex-update="settings.popsettings.one.onVuexUpdate"
      :data="settings.popsettings.one.props.data"
      :multiple-choices="settings.popsettings.one.props.multiple"
      @emitInsertStaffOk="handleInsertStaffOk"
      @emitCloseCancel="handleSelectStaffCancel"
    />
  </div>
</template>

<script>
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import deepcopy from 'deep-copy'
import elDragDialog from '@/directive/el-drag-dialog'
import { mapGetters } from 'vuex'
import { ValueType } from '@/components/60_bpm/common/form/ComponentsConfigExport'
import SelectStaff from '@/components/60_bpm/process/staffTreeDialog/index.vue'
export default {
  name: 'SponsorProcess',
  components: { SelectStaff },
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // 条件数据分支
    formData: {
      type: Object,
      default: null
    },
    // 业务表类型,获取业务数据
    serialType: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      loading: false,
      select: [],
      selectedNode: {},
      process_users: {},
      form: {
        id: '',
        name: '',
        form_items: [],
        process: {},
        remark: '',
        process_definition_id: ''
      },
      orgUserVo: {},
      conditionFormItem: new Set(),
      processData: [],
      // 页面设置json
      settings: {
        // loading 状态
        loading: false,
        // 按钮是否显示，默认不显示，false：不显示，true：显示
        btnShowStatus: {
          showInsert: false,
          showUpdate: false
        },
        // 按钮状态：是否可用，false:可用，true不可用
        btnDisabledStatus: {
          disabledInsert: true,
          disabledUpdate: true,
          disabledEdit: true
        },
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: this.dialogStatus,
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
    forms () {
      return this.$store.getters.design.form_items
    },
    _value: {
      get: function () {
        return this.value
      },
      set: function (e) {
        this.$emit('input', e)
      }
    },
    listenVisible () {
      return this.visible
    },
    ...mapGetters([
      'name',
      'sidebar',
      'avatar',
      'device'
    ])
  },
  watch: {
    // 被侦听的变量count
    formData: {
      // 对对象进行深度监听
      handler (nv) {
        this.startProcess(nv, (this.processData = []))
      },
      immediate: true,
      deep: true
    }
  },
  mounted () {
    this.loadFormInfo()
  },
  methods: {
    loadFormInfo () {
      this.loading = true
      getFlowProcessApi({ 'serial_type': this.serialType })
        .then((rsp) => {
          this.loading = false
          const form = rsp.data
          form.settings = JSON.parse(form.settings)
          form.form_items = JSON.parse(form.form_items)
          form.process = JSON.parse(form.process)
          this.$store.commit('loadForm', form)
          this.$emit('design', form)

          this.form = form
          this.orgUserVo = rsp.data.orgUserVo

          this.startProcess(form.process, this.formData)
        })
        .catch((err) => {
          this.loading = false
          this.$message.error(err)
        })
    },
    validate (call) {
      this.$refs.form.validate(call)
    },
    delUser (users, t) {
      users.splice(users.indexOf(t), 1)
      this.process_users[this.selectedNode.id].splice(users.indexOf(t), 1)
    },
    startProcess () {
      this.processData = []
      this.getProcess(this.form.process, this.processData)
      this.processData.push({
        title: '结束',
        name: 'END',
        type: 'END',
        icon: 'el-icon-success',
        isEdit: false
      })
    },
    selected (e) {
      var t = this
      t.process_users[t.selectedNode.id] = []

      e.forEach((user) => {
        var ddd = t.selectedNode.users.findIndex((t) => {
          return t.id === user.id
        })
        if (ddd === -1) {
          t.selectedNode.users.push(user)
          t.process_users[t.selectedNode.id].push(user)
          t.$set(e, 'isEdit', true)
        }
      })
    },
    getProcess (process, processData) {
      if (process != null) {
        if (process.type === 'ROOT') {
          // 发起人节点
          this.getRootNode(processData, process)
        } else if (process.type === 'APPROVAL') {
          // 审批节点
          this.getApprovalNode(processData, process)
        } else if (process.type === 'CC') {
          this.getCcNode(processData, process)
        } else if (process.type === 'CONDITIONS') {
          // 判断是否符合条件符合走条件分支,否则继续递归子分支
          if (process.branchs != null) {
            this.getConditionNode(processData, process)
          }
        } else if (process.type === 'CONCURRENT') {
          this.getConcurrentNode(processData, process)
        } else if (process.type === 'TASK') {
          this.getTaskNode(processData, process)
        }
        if (process.children != null) {
          this.getProcess(process.children, processData)
        }
      }
    },
    // 封装开始节点
    getRootNode (processData, process) {
      processData.push({
        id: process.id,
        title: process.name,
        name: '发起人',
        icon: 'el-icon-user-solid',
        type: 'ROOT',
        isEdit: false,
        users: [this.orgUserVo]
      })
    },
    // 封装审批节点
    getApprovalNode (processData, process) {
      var data = {
        id: process.id,
        title: process.name,
        name: '审批人',
        icon: 'el-icon-s-check',
        isEdit: false,
        multiple: false,
        type: 'APPROVAL',
        approval_mode: process.props.mode,
        users: [],
        desc: ''
      }
      // 判断审批人类型
      switch (process.props.assignedType) {
        case 'ASSIGN_USER':
          data.users = deepcopy(process.props.assignedUser)
          data.desc = '指定审批人'
          break
        case 'ASSIGN_LEADER':
          data.desc = '指定部门的领导'
          break
        case 'SELF':
          data.users = [this.orgUserVo]
          data.desc = '发起人自己审批'
          break
        case 'SELF_SELECT':
          data.isEdit = true
          data.multiple = process.props.selfSelect.multiple || false
          data.desc = '自选审批人'
          break
        case 'LEADER_TOP':
          data.desc = '连续多级主管审批'
          break
        case 'LEADER':
          data.desc =
            process.props.leader.level === 1
              ? '直接主管审批'
              : '第'.concat(process.props.leader.level, '级主管审批')
          break
        case 'ROLE':
          data.desc = '由角色['.concat(
            (process.props.role || []).map(function (e) {
              return e.name
            }),
            ']审批'
          )
          break
        case 'REFUSE':
          data.desc = '流程此处将被自动驳回'
          break
      }
      processData.push(data)
    },
    // 封装办理人节点
    getTaskNode (processData, process) {
      var data = {
        id: process.id,
        title: process.name,
        name: '办理人',
        icon: 'el-icon-s-check',
        isEdit: false,
        multiple: false,
        type: 'TASK',
        approval_mode: process.props.mode,
        users: [],
        desc: ''
      }
      // 判断审批人类型
      switch (process.props.assignedType) {
        case 'ASSIGN_USER':
          data.users = deepcopy(process.props.assignedUser)
          data.desc = '指定办理人'
          break
        case 'ASSIGN_LEADER':
          data.desc = '指定部门的领导'
          break
        case 'SELF':
          data.users = [this.orgUserVo]
          data.desc = '发起人自己办理'
          break
        case 'SELF_SELECT':
          data.isEdit = true
          data.multiple = process.props.selfSelect.multiple || false
          data.desc = '自选办理人'
          break
        case 'LEADER_TOP':
          data.desc = '连续多级主管审批'
          break
        case 'LEADER':
          data.desc =
            process.props.leader.level === 1
              ? '直接主管审批'
              : '第'.concat(process.props.leader.level, '级主管审批')
          break
        case 'ROLE':
          data.desc = '由角色['.concat(
            (process.props.role || []).map(function (e) {
              return e.name
            }),
            ']审批'
          )
          break
        case 'REFUSE':
          data.desc = '流程此处将被自动驳回'
          break
      }
      processData.push(data)
    },
    getCcNode (processData, process) {
      var data = {
        id: process.id,
        title: process.name,
        icon: 'el-icon-s-promotion',
        name: '抄送人',
        isEdit: process.props.shouldAdd,
        type: 'CC',
        multiple: true,
        desc: process.props.shouldAdd ? '可添加抄送人' : '',
        users: deepcopy(process.props.assignedUser)
      }
      processData.push(data)
    },
    getConditionNode (processData, process) {
      for (var r = null, s = 0; s < process.branchs.length; s++) {
        for (
          var a = process.branchs[s], n = false, o = 0, i = 0;
          i < a.props.groups.length;
          i++
        ) {
          if (
            ((n = this.getConditionResultByGroup(a.props.groups[i])),
            a.props.groupsType === 'OR' && n)
          ) {
            r = a
            break
          }
          a.props.groupsType === 'AND' && n && o++
        }

        if (r) {
          break
        }
        if (o === a.props.groups.length) {
          r = a
          break
        }
      }
      console.log(
        '符合分支条件,继续执行递归,获取符合条件下节点下的子节点!' +
          JSON.stringify(r)
      )
      r
        ? this.getProcess(r, processData)
        : console.log(
          '条件节点 '
            .concat(process.id, ' => ')
            .concat(process.name, ' 均不满足，无法继续'),
          process
        )
    },

    getConcurrentNode (processData, process) {
      var data = {
        id: process.id,
        title: process.name,
        name: '并行分支',
        icon: 'el-icon-s-operation',
        isEdit: false,
        active: process.branchs[0].id,
        options: [],
        desc: '切换分支可显示对应执行流程',
        branchs: {}
      }
      processData.push(data)
      process.branchs.forEach((b) => {
        data.options.push({ id: b.id, title: b.name })
        this.$set(data.branchs, b.id, [])
        var d = []
        this.getProcess(b.children, d, data.branchs[b.id])
      })
    },
    getConditionResultByGroup: function (subCd) {
      let result = false; let success = 0
      subCd.conditions.forEach(cd => this.conditionFormItem.add(cd.id))
      for (let i = 0; i < subCd.conditions.length; i++) {
        const cd = subCd.conditions[i] // 组内子条件
        switch (cd.valueType) {
          case ValueType.number:
            result = this.numberCompare(cd)
            break
          case ValueType.string:
            result = this.stringCompare(cd)
            break
          // case ValueType.date:
          //   result = this.dateCompare(cd)
          //   break
          // case ValueType.user:
          //   result = this.userCompare(cd)
          //   break
          // case ValueType.dept:
          //   result = this.deptCompare(cd)
          //   break
          case ValueType.array:
            result = this.arrayCompare(cd)
            break
        }
        if (result && subCd.groupType === 'OR') {
          break
        } else if (result && subCd.groupType === 'AND') {
          success++
        }
      }
      if (subCd.groupType === 'AND') {
        result = success === subCd.conditions.length
      }
      return result
    },
    arrayCompare: function (explain) {
      const val = this.formData[explain.id]
      switch (explain.compare) {
        case '=':
          return val === explain.value[0]
        case 'IN':
          return explain.value.indexOf(val) > -1
        default:
          return false
      }
    },
    stringCompare: function (explain) {
      const val = this.formData[explain.id]
      switch (explain.compare) {
        case '=':
          return val === explain.value[0]
        case 'IN':
          return explain.value.indexOf(val) > -1
        default:
          return false
      }
    },
    numberCompare: function (e) {
      var t = this.formData[e.id]
      switch (e.compare) {
        case '>':
          return t > parseFloat(e.value[0])
        case '<':
          return t < parseFloat(e.value[0])
        case '=':
          return t === parseFloat(e.value[0])
        case '>=':
          return t >= parseFloat(e.value[0])
        case '<=':
          return t <= parseFloat(e.value[0])
        case 'B':
          return t > parseFloat(e.value[0]) && t < parseFloat(e.value[1])
        case 'AB':
          return t >= parseFloat(e.value[0]) && t < parseFloat(e.value[1])
        case 'BA':
          return t > parseFloat(e.value[0]) && t <= parseFloat(e.value[1])
        case 'ABA':
          return t >= parseFloat(e.value[0]) && t <= parseFloat(e.value[1])
        case 'IN':
          return e.value.indexOf(String(t)) > -1
        default:
          return !1
      }
    },
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    handleOk () {
      const ifEnd = this.processData.some((task) => task.type !== 'END' && task.users.length === 0)
      if (ifEnd) {
        this.$message.warning('请完善表单/流程选项😥')
      } else {
        this.$emit('closeMeOk', { processData: this.processData, process_users: this.process_users })
      }
    },
    // 取消选择人员
    handleSelectStaffCancel () {
      this.settings.popsettings.one.visible = false
    },
    // 选择人员成功
    handleInsertStaffOk (data) {
      // 初始化 process_users 数组
      this.process_users[this.selectedNode.id] = this.process_users[this.selectedNode.id] || []
      this.selectedNode.users = []
      // 遍历 data 中的每个用户
      data.forEach((user) => {
        this.selectedNode.users.push(user)
        this.process_users[this.selectedNode.id].push(user)
        // 为 user 添加 isEdit 属性
        this.$set(user, 'isEdit', true)
      })

      this.handleSelectStaffCancel()
    },
    selectUser (user, task) {
      this.selectedNode = task
      this.settings.popsettings.one.visible = true
      this.settings.popsettings.one.onVuexUpdate = true
      this.settings.popsettings.one.props.data = user
      this.settings.popsettings.one.props.multiple = task.multiple
    }
  }
}
</script>

<style lang="less" scoped>
.process-form {
  /deep/ .el-form-item__label {
    padding: 0 0;
  }
}

.task {
  height: 60px;
  width: 300px;
}

.el-timeline-item .el-timeline-item__content .process-node-render > div {
  position: absolute;
  display: inline-block;
}

.el-timeline-item
  .el-timeline-item__content
  .process-node-render
  > div:last-child {
  right: 0;
  top: -10px;
}

.avatar {
  display: flex;
  flex-direction: row;
  position: relative;
  align-items: center;
}

.show-y {
  justify-content: center;
  flex-direction: column !important;
}

.show-y,
.w-h-center {
  display: flex;
  align-items: center;
}

.avatar .a-img {
  display: flex;
  border-radius: 50%;
  flex-direction: column;
  justify-content: center;
  background: #fff;
  position: relative;
}

.close {
  position: absolute;
  top: 0;
  right: 0;
  color: #fff;
  cursor: pointer;
  border-radius: 50%;
  background: #000;
}

.status {
  position: absolute;
  bottom: -4px;
  right: -8px;
  border-radius: 50%;
  font-size: 15px;
  background: #fff;
  border: 2px solid #fff;
}

.avatar .name {
  text-align: center;
  color: #19191a;
  font-size: 14px;
  margin-left: 10px;
}

.show-y .name {
  margin-left: 0 !important;
}

.line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-user {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.add-user i {
  padding: 10px;
  font-size: 1.1rem;
  border-radius: 50%;
  border: 1px dashed #8c8c8c;
  cursor: pointer;
}

.el-timeline-item .el-timeline-item__icon {
  color: #babcc1;
  font-size: 16px;
}

.border .el-dialog__header {
  border-bottom: 1px solid #e8e8e8;
}
.text {
  width: 60px;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  text-align: center;
}
</style>
