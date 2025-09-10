<template>
  <!-- 新增类别弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="新增类别"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="850px"
    destroy-on-close
  >
    <el-form
      ref="dataSubmitForm"
      :rules="settings.rules"
      :model="dataJson.tempJson"
      label-position="right"
      label-width="0px"
      status-icon
    >
      <br>
      <el-descriptions
        title=""
        :column="2"
        :content-style="contentStyle"
        :label-style="labelStyle"
        direction="horizontal"
        border
        style="padding-right: 10px;padding-left: 10px;"
      >
        <el-descriptions-item>
          <div slot="label">
            类别编号：
          </div>
          <el-form-item prop="code">
            <el-input
              v-model.trim="dataJson.tempJson.code"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.code"
              placeholder="请输入（可选）"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item>
          <div
            slot="label"
            class="required-mark"
          >
            类别名称：
          </div>
          <el-form-item prop="name">
            <el-input
              ref="categoryNameInput"
              v-model.trim="dataJson.tempJson.name"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.name"
              placeholder="请输入"
            />
          </el-form-item>
        </el-descriptions-item>
      </el-descriptions>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
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
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import InputSearch from '@/components/40_input/inputSearch'
import deepCopy from 'deep-copy'
import { insertApi } from '@/api/30_wms/category/category'

export default {
  components: { InputSearch },
  directives: { elDragDialog },
  mixins: [],
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      contentStyle: {
        width: '15%'
      },
      labelStyle: {
        width: '10%',
        'text-align': 'right'
      },
      popSettingsData: {
      },
      dataJson: {
        // 单条数据 json
        tempJson: {
          code: '',
          name: ''
        },
        inputSettings: {
          maxLength: {
            name: 20,
            code: 20
          }
        }
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: false,
        // 初始化完成标志
        initialized: false,
        // 按钮状态：是否可用，false:可用，true不可用
        btnDisabledStatus: {
          disabledInsert: true
        },
        // pop的check内容
        rules: {
          name: [
            { required: true, message: '请输入类别名称', trigger: 'change' }
          ],
        }
      }
    }
  },
  // 监听器
  watch: {
    // 监听弹窗显示状态，显示时自动设置焦点
    visible (newVal) {
      if (newVal) {
        // 弹窗显示时，设置焦点到类别名称输入框
        this.$nextTick(() => {
          if (this.$refs.categoryNameInput) {
            this.$refs.categoryNameInput.focus()
          }
        })
      }
    },
    // 监听表单数据变化，有变化时启用确定按钮
    'dataJson.tempJson': {
      handler (newVal, oldVal) {
        // 只有在初始化完成后才响应用户变化
        if (this.settings.initialized) {
          this.settings.btnDisabledStatus.disabledInsert = false
        }
      },
      deep: true
    }
  },
  created () {
    this.init()
  },
  methods: {
    // 初始化处理
    init () {
      this.initInsertModel()
    },
    // 新增时的初始化
    initInsertModel () {
      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.$options.data.call(this).dataJson.tempJson)
      
      // 确保按钮初始状态为禁用，并标记初始化完成
      this.$nextTick(() => {
        this.settings.btnDisabledStatus.disabledInsert = true
        this.settings.initialized = true
      })
    },
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 插入逻辑
    doInsert () {
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)
          this.settings.loading = true
          insertApi(tempData)
            .then(
              _data => {
                this.$emit('closeMeOk', { return_flag: true, data: _data })
              },
              _error => {
                this.$emit('closeMeOk', { return_flag: false, error: _error })
              }
            )
            .finally(() => {
              this.settings.loading = false
            })
        }
      })
    }
  }
}
</script>

<style scoped>
.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}
.dialog-footer {
  text-align: center;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
.el-form-item .el-select {
  width: 100%;
}
.el-button-group {
  margin-bottom: 15px;
}
</style>
