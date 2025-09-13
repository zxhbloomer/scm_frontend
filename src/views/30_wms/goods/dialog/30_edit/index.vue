<template>
  <!-- 编辑物料弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="物料编辑"
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
      label-width="150px"
      status-icon
    >
      <el-alert
        title="基本信息"
        type="info"
        :closable="false"
      />
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
          <div
            slot="label"
            class="required-mark"
          >
            所属类别：
          </div>
          <el-form-item
            prop="category_name"
            label-width="0"
          >
            <input-search
              v-model.trim="dataJson.tempJson.category_name"
              @onInputSearch="handleCategoryDialog"
            />
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item>
          <div
            slot="label"
            class="required-mark"
          >
            物料名称：
          </div>
          <el-form-item
            prop="name"
            label-width="0"
          >
            <el-input
              ref="refFocusOne"
              v-model.trim="dataJson.tempJson.name"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.name"
              placeholder="请输入物料名称"
            />
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item>
          <div
            slot="label"
          >
            物料编码：
          </div>
          <el-form-item
            prop="code"
            label-width="0"
          >
            <el-input
              v-model.trim="dataJson.tempJson.code"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.code"
              placeholder="请输入物料编码"
            />
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item>
          <div
            slot="label"
          >
            状态：
          </div>
          <el-form-item
            prop="enable"
            label-width="0"
          >
            <el-switch
              v-model="dataJson.tempJson.enable"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="启用"
              inactive-text="停用"
              :active-value="true"
              :inactive-value="false"
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
        :disabled="settings.loading || settings.btnDisabledStatus.disabledUpdate"
        @click="doUpdate()"
      >确定</el-button>
      <el-button
        plain
        :disabled="settings.loading"
        @click="handleCancel()"
      >取消</el-button>
    </div>

    <!-- 级联选择对话框 -->
    <business-dialog
      v-if="popSettingsData.searchDialogDataOne.visible"
      :visible="popSettingsData.searchDialogDataOne.visible"
    />
    <category-dialog
      v-if="popSettingsData.searchDialogDataThree.visible"
      :visible="popSettingsData.searchDialogDataThree.visible"
      :data="popSettingsData.searchDialogDataOne.selectedDataJson"
      @closeMeOk="handleCategoryCloseOk"
      @closeMeCancel="handleCategoryCloseCancel"
    />
  </el-dialog>
</template>

<style scoped>
.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}
.dialog-footer {
  text-align: center;
}
.el-form-item .el-select {
  width: 100%;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
</style>

<script>
import { updateApi } from '@/api/30_wms/goods/goods'
import deepCopy from 'deep-copy'
import elDragDialog from '@/directive/el-drag-dialog'
import InputSearch from '@/components/40_input/inputSearch'
import BusinessDialog from '@/views/20_master/business/dialog/dialog'
import CategoryDialog from '@/views/30_wms/category/dialog/10_list/index'

export default {
  name: 'GoodsEditDialog',
  directives: { elDragDialog },
  components: {
    InputSearch,
    BusinessDialog,
    CategoryDialog
  },
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
      dataJson: {
        tempJson: {
          id: null,
          category_id: '',
          category_code: '',
          category_name: '',
          name: '',
          code: '',
          enable: true,
          dbversion: 0
        },
        inputSettings: {
          maxLength: {
            name: 100,
            code: 50
          }
        }
      },
      settings: {
        loading: false,
        duration: 4000,
        // 初始化完成标志
        initialized: false,
        btnShowStatus: {
          showUpdate: true
        },
        btnDisabledStatus: {
          disabledUpdate: true
        },
        rules: {
          category_name: [
            { required: true, message: '请选择所属类别', trigger: 'blur' }
          ],
          name: [
            { required: true, message: '请输入物料名称', trigger: 'blur' },
            { max: 100, message: '物料名称不能超过100个字符', trigger: 'blur' }
          ],
          code: [
            { max: 50, message: '物料编码不能超过50个字符', trigger: 'blur' }
          ],
          enable: [
            { required: true, message: '请选择启用状态', trigger: 'change' },
            { type: 'boolean', message: '启用状态必须是有效的布尔值', trigger: 'change' }
          ]
        }
      },
      // 级联选择对话框状态
      popSettingsData: {
        searchDialogDataOne: {
          visible: false,
          selectedDataJson: {}
        },
        searchDialogDataThree: {
          visible: false,
          selectedDataJson: {}
        }
      },
      // 样式设置
      contentStyle: {
        width: '15%'
      },
      labelStyle: {
        width: '10%',
        'text-align': 'right'
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
    // 监听弹窗显示状态，显示时自动设置焦点
    visible (newVal) {
      if (newVal) {
        // 弹窗显示时，设置焦点到物料名称输入框
        this.$nextTick(() => {
          if (this.$refs.refFocusOne) {
            this.$refs.refFocusOne.focus()
          }
        })
      } else {
        // 弹窗关闭时，重置初始化状态
        this.settings.initialized = false
        this.settings.btnDisabledStatus.disabledUpdate = true
      }
    },
    // 监听表单数据变化，有变化时启用确定按钮
    'dataJson.tempJson': {
      handler (newVal, oldVal) {
        // 只有在初始化完成后才响应用户变化
        if (this.settings.initialized) {
          this.settings.btnDisabledStatus.disabledUpdate = false
        }
      },
      deep: true
    }
  },
  methods: {
    init () {
      // 初始化数据
      if (this.data) {
        this.dataJson.tempJson = deepCopy(this.data)
      }

      // 确保enable字段存在，如果不存在则设置默认值
      if (this.dataJson.tempJson.enable === undefined || this.dataJson.tempJson.enable === null) {
        this.dataJson.tempJson.enable = true
      }

      // 确保按钮初始状态为禁用，并标记初始化完成
      this.$nextTick(() => {
        this.settings.btnDisabledStatus.disabledUpdate = true
        this.settings.initialized = true

        // 设置焦点
        if (this.$refs.refFocusOne) {
          this.$refs.refFocusOne.focus()
        }
      })
    },

    // 类别选择对话框
    handleCategoryDialog () {
      this.popSettingsData.searchDialogDataThree.visible = true
    },
    handleCategoryCloseOk (data) {
      this.popSettingsData.searchDialogDataThree.visible = false
      this.popSettingsData.searchDialogDataThree.selectedDataJson = data

      // 设置类别信息
      this.dataJson.tempJson.category_id = data.id
      this.dataJson.tempJson.category_code = data.code
      this.dataJson.tempJson.category_name = data.name
    },
    handleCategoryCloseCancel () {
      this.popSettingsData.searchDialogDataThree.visible = false
    },

    // 提交更新
    doUpdate () {
      this.$refs.dataSubmitForm.validate((valid) => {
        if (valid) {
          // 检查乐观锁版本
          if (!this.dataJson.tempJson.dbversion) {
            this.showErrorMsg('数据版本号异常，请刷新页面后重试')
            return
          }

          this.settings.loading = true
          updateApi(this.dataJson.tempJson).then((response) => {
            this.$emit('closeMeOk', {
              return_flag: true,
              data: response
            })
          }).catch((error) => {
            // 处理乐观锁冲突
            if (error.message && error.message.includes('乐观锁')) {
              this.showErrorMsg('数据已被他人修改，请刷新页面后重试')
            }
            this.$emit('closeMeOk', {
              return_flag: false,
              error: error
            })
          }).finally(() => {
            this.settings.loading = false
          })
        }
      })
    },

    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>
