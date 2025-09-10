<template>
  <!-- 编辑类别弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="编辑类别"
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
          <span>{{ dataJson.tempJson.code || '暂无' }}</span>
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

    <business-dialog
      v-if="popSettingsData.searchDialogDataOne.visible"
      :visible="popSettingsData.searchDialogDataOne.visible"
      @closeMeOk="handleCompanyCloseOk"
      @closeMeCancel="handleCompanyCloseCancel"
    />
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import InputSearch from '@/components/40_input/inputSearch'
import deepCopy from 'deep-copy'
import { updateApi } from '@/api/30_wms/category/category'
import BusinessDialog from '@/views/20_master/business/dialog/dialog'

export default {
  components: { BusinessDialog, InputSearch },
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
        // 弹出的查询框参数设置
        searchDialogDataOne: {
          // 弹出框显示参数
          visible: false,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        }
      },
      dataJson: {
        // 单条数据 json
        tempJson: {
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
        // 按钮状态：是否可用，false:可用，true不可用
        btnDisabledStatus: {
          disabledUpdate: true
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
    // 监听页面上面是否有修改，有修改按钮高亮
    'dataJson.tempJson': {
      handler (newVal, oldVal) {
        this.settings.btnDisabledStatus.disabledUpdate = false
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
      this.initUpdateModel()
    },
    // 修改时的初始化
    initUpdateModel () {
      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.data)
      this.popSettingsData.searchDialogDataOne.selectedDataJson.id = this.data.business_id
    },
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 更新逻辑
    doUpdate () {
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)
          if (this.popSettingsData.searchDialogDataOne.selectedDataJson != null) {
            tempData.business_id = this.popSettingsData.searchDialogDataOne.selectedDataJson.id
          }
          this.settings.loading = true
          updateApi(tempData)
            .then(
              _data => {
                this.dataJson.tempJson = deepCopy(_data.data)
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
    },
    // 板块
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
