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
          <div
            slot="label"
            class="required-mark"
          >
            所属板块
          </div>
          <el-form-item
            prop="business_name"
            label-width="0"
          >
            <input-search
              v-model.trim="dataJson.tempJson.business_name"
              @onInputSearch="handleBusinessDialog"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item>
          <div
            slot="label"
            class="required-mark"
          >
            所属行业：
          </div>
          <el-form-item
            prop="industry_name"
            label-width="0"
          >
            <input-search
              v-model.trim="dataJson.tempJson.industry_name"
              @onInputSearch="handleIndustryDialog"
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
              v-model.trim="dataJson.tempJson.name"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.name"
              placeholder="请输入"
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
        :disabled="settings.loading"
        @click="handleCancel()"
      >取消</el-button>
      <el-button
        plain
        type="primary"
        :disabled="settings.loading || settings.btnDisabledStatus.disabledInsert"
        @click="doInsert()"
      >确定</el-button>
    </div>

    <business-dialog
      v-if="popSettingsData.searchDialogDataOne.visible"
      :visible="popSettingsData.searchDialogDataOne.visible"
      @closeMeOk="handleCompanyCloseOk"
      @closeMeCancel="handleCompanyCloseCancel"
    />
    <industry-dialog
      v-if="popSettingsData.searchDialogDataTwo.visible"
      :visible="popSettingsData.searchDialogDataTwo.visible"
      :data="popSettingsData.searchDialogDataOne.selectedDataJson"
      @closeMeOk="handleIndustryCloseOk"
      @closeMeCancel="handleIndustryCloseCancel"
    />
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import InputSearch from '@/components/40_input/inputSearch'
import deepCopy from 'deep-copy'
import { insertApi } from '@/api/30_wms/category/category'
import businessDialog from '@/views/30_wms/businesstype/dialog/dialog'
import industryDialog from '@/views/30_wms/industry/dialog/dialog'

export default {
  components: { businessDialog, industryDialog, InputSearch },
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
        // 弹出的查询框参数设置
        searchDialogDataOne: {
          // 弹出框显示参数
          visible: false,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 弹出的行业查询框参数设置
        searchDialogDataTwo: {
          // 弹出框显示参数
          visible: false,
          data: null,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        }
      },
      dataJson: {
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          business_name: '',
          industry_name: ''
        },
        // 单条数据 json
        tempJson: {
          business_name: '',
          industry_name: ''
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
          disabledInsert: true
        },
        // pop的check内容
        rules: {
          name: [
            { required: true, message: '请输入类别名称', trigger: 'change' }
          ],
          business_name: [
            { required: true, message: '请选择板块', trigger: 'change' }
          ],
          industry_name: [
            { required: true, message: '请选择行业', trigger: 'change' }
          ]
        }
      }
    }
  },
  // 监听器
  watch: {
    // 监听页面上面是否有修改，有修改按钮高亮
    'dataJson.tempJson': {
      handler (newVal, oldVal) {
        this.settings.btnDisabledStatus.disabledInsert = false
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
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)
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
          tempData.business_id = this.popSettingsData.searchDialogDataOne.selectedDataJson.id
          tempData.industry_id = this.popSettingsData.searchDialogDataTwo.selectedDataJson.id
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
    },
    // 板块
    handleBusinessDialog () {
      this.popSettingsData.searchDialogDataOne.visible = true
    },
    // 板块：关闭对话框：确定
    handleCompanyCloseOk (val) {
      this.popSettingsData.searchDialogDataOne.selectedDataJson = val
      this.dataJson.tempJson.business_name = val.name
      this.popSettingsData.searchDialogDataTwo.data = val
      this.popSettingsData.searchDialogDataOne.visible = false
      this.settings.btnDisabledStatus.disabledInsert = false
    },
    // 板块：关闭对话框：取消
    handleCompanyCloseCancel () {
      this.popSettingsData.searchDialogDataOne.visible = false
    },
    // 行业
    handleIndustryDialog () {
      if (this.popSettingsData.searchDialogDataOne.selectedDataJson.id == null) {
        this.showErrorMsg('请先选择板块')
        return
      }
      this.popSettingsData.searchDialogDataTwo.visible = true
    },
    // 行业：关闭对话框：确定
    handleIndustryCloseOk (val) {
      this.popSettingsData.searchDialogDataTwo.selectedDataJson = val
      this.popSettingsData.searchDialogDataTwo.visible = false
      this.settings.btnDisabledStatus.disabledInsert = false
      this.dataJson.tempJson.industry_name = val.name
    },
    // 行业：关闭对话框：取消
    handleIndustryCloseCancel () {
      this.popSettingsData.searchDialogDataTwo.visible = false
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
