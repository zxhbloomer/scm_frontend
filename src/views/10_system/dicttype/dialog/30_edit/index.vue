<template>
  <!-- 编辑字典类型弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="字典类型修改"
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
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="字典类型："
            prop="code"
          >
            <el-input
              ref="refCode"
              v-model.trim="dataJson.tempJson.code"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.code"
              placeholder="请输入字典类型"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="字典名称："
            prop="name"
          >
            <el-input
              ref="refName"
              v-model.trim="dataJson.tempJson.name"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.name"
              placeholder="请输入字典名称"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        label="说明："
        prop="descr"
      >
        <el-input
          v-model.trim="dataJson.tempJson.descr"
          clearable
          type="textarea"
          show-word-limit
          :maxlength="dataJson.inputSettings.maxLength.descr"
          placeholder="请输入说明"
        />
      </el-form-item>
      <!-- 系统信息显示区域 -->
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="更新人："
            prop="u_name"
          >
            <el-input
              v-model.trim="dataJson.tempJson.u_name"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="更新时间："
            prop="u_time"
          >
            <el-input
              v-model.trim="dataJson.tempJson.u_time"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
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
        :disabled="settings.loading"
        @click="handleCancel()"
      >取消</el-button>
      <el-button
        plain
        type="primary"
        :disabled="settings.loading || settings.btnDisabledStatus.disabledUpdate"
        @click="doUpdate()"
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
.dialog-footer {
  text-align: center;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
</style>

<script>
import { updateApi } from '@/api/10_system/dicttype/dicttype'
import deepCopy from 'deep-copy'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'DicttypeEditDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      dataJson: {
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {},
        // 单条数据 json
        tempJson: {},
        inputSettings: {
          maxLength: {
            name: 20,
            code: 20,
            descr: 200
          }
        }
      },
      settings: {
        loading: false,
        duration: 4000,
        // 按钮状态：是否可用
        btnDisabledStatus: {
          disabledReset: false,
          disabledUpdate: false
        },
        // 重置按钮点击后
        btnResetStatus: false,
        // 表单验证规则
        rules: {
          name: [
            { required: true, message: '请输入字典名称', trigger: 'change' },
            { max: 20, message: '字典名称不能超过20个字符', trigger: 'blur' }
          ],
          code: [
            { required: true, message: '请输入字典类型', trigger: 'change' },
            { max: 20, message: '字典类型不能超过20个字符', trigger: 'blur' }
          ],
          descr: [
            { max: 200, message: '说明不能超过200个字符', trigger: 'blur' }
          ]
        }
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    }
  },
  watch: {
    listenVisible: {
      handler (newVal) {
        if (newVal) {
          this.init()
        }
      },
      immediate: true
    },
    // 监听页面上面是否有修改，有修改按钮高亮
    'dataJson.tempJson': {
      handler (newVal, oldVal) {
        if (this.settings.btnResetStatus === true) {
          // 点击了重置按钮
          this.settings.btnDisabledStatus.disabledReset = true
          this.settings.btnDisabledStatus.disabledUpdate = true
          this.settings.btnResetStatus = false
        } else if (this.visible) {
          // 有修改按钮高亮
          this.settings.btnDisabledStatus.disabledReset = false
          this.settings.btnDisabledStatus.disabledUpdate = false
        }
      },
      deep: true
    },
    // 弹出窗口初始化，按钮不可用
    visible: {
      handler (newVal, oldVal) {
        if (newVal) {
          this.settings.btnDisabledStatus.disabledReset = true
          this.settings.btnDisabledStatus.disabledUpdate = true
        }
      }
    }
  },
  methods: {
    init () {
      // 如果传入了数据，使用传入的数据初始化
      if (this.data && Object.keys(this.data).length > 0) {
        this.dataJson.tempJson = deepCopy(this.data)
        this.dataJson.tempJsonOriginal = deepCopy(this.data)
      }

      // 设置焦点
      this.$nextTick(() => {
        if (this.$refs.refName) {
          this.$refs.refName.focus()
        }
      })
    },

    // 重置按钮
    doReset () {
      this.settings.btnResetStatus = true
      // 部分数据重置，保留系统字段
      this.dataJson.tempJson.name = this.dataJson.tempJsonOriginal.name || ''
      this.dataJson.tempJson.descr = this.dataJson.tempJsonOriginal.descr || ''
      // 设置控件焦点focus
      this.$nextTick(() => {
        if (this.$refs.refName) {
          this.$refs.refName.focus()
        }
      })
      // 去除validate信息
      this.$nextTick(() => {
        if (this.$refs.dataSubmitForm) {
          this.$refs.dataSubmitForm.clearValidate()
        }
      })
    },

    // 更新逻辑
    doUpdate () {
      this.$refs.dataSubmitForm.validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.dataJson.tempJson)
          this.settings.loading = true
          updateApi(tempData).then((_data) => {
            this.$emit('closeMeOk', {
              return_flag: true,
              data: _data
            })
          }).catch((_error) => {
            this.$emit('closeMeOk', {
              return_flag: false,
              error: _error
            })
          }).finally(() => {
            this.settings.loading = false
          })
        }
      })
    },

    // 取消
    handleCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>
