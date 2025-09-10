<template>
  <!-- 新增物料弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="物料新增"
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
            所属类别
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
            物料名称
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
            物料编码
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
              placeholder="请输入物料编码（可选）"
            />
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item />
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

    <!-- 级联选择对话框 -->
    <category-dialog
      v-if="popSettingsData.searchDialogDataThree.visible"
      :visible="popSettingsData.searchDialogDataThree.visible"
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
import { insertApi } from '@/api/30_wms/goods/goods'
import deepCopy from 'deep-copy'
import elDragDialog from '@/directive/el-drag-dialog'
import InputSearch from '@/components/40_input/inputSearch'
import CategoryDialog from '@/views/30_wms/category/dialog/10_list/index'

export default {
  name: 'GoodsNewDialog',
  directives: { elDragDialog },
  components: {
    InputSearch,
    CategoryDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    copyData: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      dataJson: {
        tempJson: {
          category_id: '',
          category_code: '',
          category_name: '',
          name: '',
          code: ''
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
        btnShowStatus: {
          showInsert: true
        },
        btnDisabledStatus: {
          disabledInsert: false
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
          ]
        }
      },
      // 级联选择对话框状态
      popSettingsData: {
        searchDialogDataThree: {
          visible: false,
          selectedDataJson: {}
        }
      },
      // 样式设置
      contentStyle: {
        'background-color': '#f0f0f0',
        'padding': '10px'
      },
      labelStyle: {
        'font-weight': 'bold',
        'width': '120px'
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
    }
  },
  methods: {
    init () {
      // 如果有复制数据，使用复制数据
      if (this.copyData) {
        this.dataJson.tempJson = deepCopy(this.copyData)
        // 清空ID和系统字段，但保留级联选择的数据
        delete this.dataJson.tempJson.id
        delete this.dataJson.tempJson.u_time
        delete this.dataJson.tempJson.u_name
        delete this.dataJson.tempJson.c_time
        delete this.dataJson.tempJson.c_name
        // 清空编号，因为编号必须唯一
        this.dataJson.tempJson.code = ''
      } else {
        // 否则使用默认空数据
        this.dataJson.tempJson = deepCopy(this.$options.data.call(this).dataJson.tempJson)
      }

      // 设置焦点
      this.$nextTick(() => {
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

    // 提交新增
    doInsert () {
      this.$refs.dataSubmitForm.validate((valid) => {
        if (valid) {
          this.settings.loading = true
          insertApi(this.dataJson.tempJson).then((response) => {
            this.$emit('closeMeOk', {
              return_flag: true,
              data: response
            })
          }).catch((error) => {
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

    // 取消
    handleCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>
