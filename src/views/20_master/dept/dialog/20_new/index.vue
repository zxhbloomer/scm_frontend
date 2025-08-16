<template>
  <div>
    <!-- pop窗口 数据编辑:新增-->
    <el-dialog
      v-if="visible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      title="新增部门"
      :visible="visible"
      :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
      :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
      :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="700px"
      destroy-on-close
    >
      <el-form
        ref="dataSubmitForm"
        :rules="settings.rules"
        :model="dataJson.tempJson"
        label-position="right"
        label-width="120px"
        status-icon
      >
        <el-alert
          title="基本信息"
          type="info"
          :closable="false"
        />
        <br>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="部门编号："
              prop="code"
            >
              <el-input
                ref="refFocusOne"
                v-model.trim="dataJson.tempJson.code"
                clearable
                show-word-limit
                :maxlength="20"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="部门名称："
              prop="name"
            >
              <el-input
                v-model.trim="dataJson.tempJson.name"
                clearable
                show-word-limit
                :maxlength="20"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="部门简称："
              prop="simple_name"
            >
              <el-input
                v-model.trim="dataJson.tempJson.simple_name"
                clearable
                show-word-limit
                :maxlength="20"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="部门主管："
              prop="handler_id"
            >
              <input-search
                v-model.trim="popSettings.one.selectedDataJson.name"
                @onInputSearch="handleStaffDialogClickOne"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item
              label="部门副主管："
              prop="sub_handler_id"
            >
              <input-search
                v-model.trim="popSettings.two.selectedDataJson.name"
                @onInputSearch="handleStaffDialogClickTwo"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="上级主管领导："
              prop="leader_id"
            >
              <input-search
                v-model.trim="popSettings.three.selectedDataJson.name"
                @onInputSearch="handleStaffDialogClickThree"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item
              label="上级分管领导："
              prop="response_leader_id"
            >
              <input-search
                v-model.trim="popSettings.four.selectedDataJson.name"
                @onInputSearch="handleStaffDialogClickFour"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item
          label="备注："
          prop="descr"
        >
          <el-input
            v-model.trim="dataJson.tempJson.descr"
            clearable
            type="textarea"
            show-word-limit
            :maxlength="200"
            placeholder="请输入"
          />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-divider />
        <div class="floatLeft">
          <el-button
            type="danger"
            :disabled="settings.loading || settings.btnDisabledStatus.disabledReset"
            @click="doReset()"
          >重置</el-button>
        </div>
        <el-button
          plain
          type="primary"
          :disabled="settings.loading || settings.btnDisabledStatus.disabledInsert"
          @click="doInsert()"
        >确定</el-button>
        <el-button
          plain
          :disabled="settings.loading"
          @click="handleCancel()"
        >取消</el-button>
      </div>
    </el-dialog>

    <staff-dialog
      :visible="popSettings.one.visible"
      @closeMeOk="handleStaffCloseOkOne"
      @closeMeCancel="handleStaffCloseCancelOne"
    />

    <staff-dialog
      :visible="popSettings.two.visible"
      @closeMeOk="handleStaffCloseOkTwo"
      @closeMeCancel="handleStaffCloseCancelTwo"
    />

    <staff-dialog
      :visible="popSettings.three.visible"
      @closeMeOk="handleStaffCloseOkThree"
      @closeMeCancel="handleStaffCloseCancelThree"
    />

    <staff-dialog
      :visible="popSettings.four.visible"
      @closeMeOk="handleStaffCloseOkFour"
      @closeMeCancel="handleStaffCloseCancelFour"
    />
  </div>
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
import elDragDialog from '@/directive/el-drag-dialog'
import { insertApi } from '@/api/20_master/dept/dept'
import deepCopy from 'deep-copy'
import staffDialog from '@/views/20_master/staff/dialog/dialog'
import InputSearch from '@/components/40_input/inputSearch'

export default {
  name: 'DeptNewDialog',
  components: { staffDialog, InputSearch },
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      // 监听器
      watch: {
        unwatch_tempJson: null,
        unwatch_staff_one: null,
        unwatch_staff_two: null,
        unwatch_staff_three: null,
        unwatch_staff_four: null
      },
      dataJson: {
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          name: '',
          code: '',
          simple_name: '',
          descr: '',
          handler_id: null,
          sub_handler_id: null,
          leader_id: null,
          response_leader_id: null,
          dbversion: 0
        },
        // 单条数据 json
        tempJson: null
      },
      settings: {
        // loading 状态
        loading: false,
        // 按钮状态：是否可用，false:可用，true不可用
        btnDisabledStatus: {
          disabledReset: true,
          disabledInsert: true
        },
        // pop的check内容
        rules: {
          name: [{ required: true, message: '请输入部门名称', trigger: 'change' }],
          simple_name: [{ required: true, message: '请输入部门简称', trigger: 'change' }]
        }
      },
      popSettings: {
        one: {
          visible: false,
          // 点击确定以后返回的值
          selectedDataJson: {}
        },
        two: {
          visible: false,
          // 点击确定以后返回的值
          selectedDataJson: {}
        },
        three: {
          visible: false,
          // 点击确定以后返回的值
          selectedDataJson: {}
        },
        four: {
          visible: false,
          // 点击确定以后返回的值
          selectedDataJson: {}
        }
      },
      // 复制新增时的数据
      copyData: null
    }
  },
  computed: {},
  // 监听器
  watch: {
    visible: {
      handler (newVal) {
        if (newVal) {
          this.init()
        }
      },
      immediate: true
    }
  },
  destroyed () {
    this.unWatch()
  },
  methods: {
    // 初始化处理
    init () {
      if (this.copyData) {
        this.initCopyInsertModel()
      } else {
        this.initInsertModel()
      }
      // 初始化watch
      this.setWatch()
    },
    initInsertModel () {
      // 数据初始化
      this.dataJson.tempJsonOriginal = this.$options.data.call(this).dataJson.tempJsonOriginal
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)
      // 初始化按钮
      this.settings.btnDisabledStatus = this.$options.data.call(this).settings.btnDisabledStatus
      // 控件focus
      this.$nextTick(() => {
        this.$refs['refFocusOne'] && this.$refs['refFocusOne'].focus()
      })
    },
    initCopyInsertModel () {
      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.copyData)
      this.dataJson.tempJson.code = ''
      this.dataJson.tempJson.id = undefined
      this.dataJson.tempJsonOriginal = deepCopy(this.copyData)
      this.initStaffData()
      // 控件focus
      this.$nextTick(() => {
        this.$refs['refFocusOne'] && this.$refs['refFocusOne'].focus()
      })
    },
    // 初始化各个主管人员数据
    initStaffData () {
      if (this.dataJson.tempJson) {
        this.popSettings.one.selectedDataJson = {
          id: this.dataJson.tempJson.handler_id,
          name: this.dataJson.tempJson.handler_id_name
        }
        this.popSettings.two.selectedDataJson = {
          id: this.dataJson.tempJson.sub_handler_id,
          name: this.dataJson.tempJson.sub_handler_id_name
        }
        this.popSettings.three.selectedDataJson = {
          id: this.dataJson.tempJson.leader_id,
          name: this.dataJson.tempJson.leader_id_name
        }
        this.popSettings.four.selectedDataJson = {
          id: this.dataJson.tempJson.response_leader_id,
          name: this.dataJson.tempJson.response_leader_id_name
        }
      }
    },
    // 设置复制数据（用于复制新增）
    setCopyData (data) {
      this.copyData = deepCopy(data)
      this.init()
    },
    // 设置监听器
    setWatch () {
      this.unWatch()
      // 监听页面上面是否有修改，有修改按钮高亮
      this.watch.unwatch_tempJson = this.$watch('dataJson.tempJson', (newVal, oldVal) => {
        this.settings.btnDisabledStatus.disabledReset = false
        this.settings.btnDisabledStatus.disabledInsert = false
      }, { deep: true }
      )
      // 监听页面上员工staff是否有修改，one
      this.watch.unwatch_staff_one = this.$watch('popSettings.one.selectedDataJson', (newVal, oldVal) => {
        if (newVal && newVal.id) {
          this.dataJson.tempJson.handler_id = this.popSettings.one.selectedDataJson.id
        } else {
          this.dataJson.tempJson.handler_id = null
        }
      })
      // 监听页面上员工staff是否有修改，two
      this.watch.unwatch_staff_two = this.$watch('popSettings.two.selectedDataJson', (newVal, oldVal) => {
        if (newVal && newVal.id) {
          this.dataJson.tempJson.sub_handler_id = this.popSettings.two.selectedDataJson.id
        } else {
          this.dataJson.tempJson.sub_handler_id = null
        }
      })
      // 监听页面上员工staff是否有修改，three
      this.watch.unwatch_staff_three = this.$watch('popSettings.three.selectedDataJson', (newVal, oldVal) => {
        if (newVal && newVal.id) {
          this.dataJson.tempJson.leader_id = this.popSettings.three.selectedDataJson.id
        } else {
          this.dataJson.tempJson.leader_id = null
        }
      })
      // 监听页面上员工staff是否有修改，four
      this.watch.unwatch_staff_four = this.$watch('popSettings.four.selectedDataJson', (newVal, oldVal) => {
        if (newVal && newVal.id) {
          this.dataJson.tempJson.response_leader_id = this.popSettings.four.selectedDataJson.id
        } else {
          this.dataJson.tempJson.response_leader_id = null
        }
      })
    },
    unWatch () {
      if (this.watch.unwatch_tempJson) {
        this.watch.unwatch_tempJson()
      }
      if (this.watch.unwatch_staff_one) {
        this.watch.unwatch_staff_one()
      }
      if (this.watch.unwatch_staff_two) {
        this.watch.unwatch_staff_two()
      }
      if (this.watch.unwatch_staff_three) {
        this.watch.unwatch_staff_three()
      }
      if (this.watch.unwatch_staff_four) {
        this.watch.unwatch_staff_four()
      }
    },
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 重置按钮
    doReset () {
      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)
      if (this.copyData) {
        this.dataJson.tempJson.code = ''
      }
      // 设置控件焦点focus
      this.$nextTick(() => {
        this.$refs['refFocusOne'] && this.$refs['refFocusOne'].focus()
      })
      // 初始化按钮
      this.settings.btnDisabledStatus = this.$options.data.call(this).settings.btnDisabledStatus
      // 初始化watch
      this.setWatch()
      // 去除validate信息
      this.$nextTick(() => {
        this.$refs['dataSubmitForm'].clearValidate()
      })
    },
    // 插入逻辑
    doInsert () {
      this.$refs['dataSubmitForm'].validate((valid) => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)
          this.settings.loading = true
          insertApi(tempData).then((_data) => {
            this.$emit('closeMeOk', { return_flag: true, data: _data })
          }, (_error) => {
            this.$emit('closeMeOk', { return_flag: false, error: _error })
          }).finally(() => {
            this.settings.loading = false
          })
        }
      })
    },
    // --------------弹出查询框：--------------
    // 1
    handleStaffDialogClickOne () {
      // 选择按钮
      this.popSettings.one.visible = true
    },
    // 关闭对话框：确定
    handleStaffCloseOkOne (val) {
      this.popSettings.one.selectedDataJson = val
      this.popSettings.one.visible = false
    },
    // 关闭对话框：取消
    handleStaffCloseCancelOne () {
      this.popSettings.one.visible = false
    },
    // 2
    handleStaffDialogClickTwo () {
      // 选择按钮
      this.popSettings.two.visible = true
    },
    // 关闭对话框：确定
    handleStaffCloseOkTwo (val) {
      this.popSettings.two.selectedDataJson = val
      this.popSettings.two.visible = false
    },
    // 关闭对话框：取消
    handleStaffCloseCancelTwo () {
      this.popSettings.two.visible = false
    },
    // 3
    handleStaffDialogClickThree () {
      // 选择按钮
      this.popSettings.three.visible = true
    },
    // 关闭对话框：确定
    handleStaffCloseOkThree (val) {
      this.popSettings.three.selectedDataJson = val
      this.popSettings.three.visible = false
    },
    // 关闭对话框：取消
    handleStaffCloseCancelThree () {
      this.popSettings.three.visible = false
    },
    // 4
    handleStaffDialogClickFour () {
      // 选择按钮
      this.popSettings.four.visible = true
    },
    // 关闭对话框：确定
    handleStaffCloseOkFour (val) {
      this.popSettings.four.selectedDataJson = val
      this.popSettings.four.visible = false
    },
    // 关闭对话框：取消
    handleStaffCloseCancelFour () {
      this.popSettings.four.visible = false
    }
  }
}
</script>
