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
            所属行业
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
              placeholder="请输入物料编码"
            />
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item />
      </el-descriptions>

      <!-- 系统信息显示 -->
      <el-descriptions
        v-if="dataJson.tempJson.id"
        title=""
        :column="2"
        :content-style="contentStyle"
        :label-style="labelStyle"
        direction="horizontal"
        border
        style="padding-right: 10px;padding-left: 10px;margin-top: 20px;"
      >
        <el-descriptions-item>
          <div slot="label">创建人</div>
          <span>{{ dataJson.tempJson.c_name }}</span>
        </el-descriptions-item>
        <el-descriptions-item>
          <div slot="label">创建时间</div>
          <span>{{ formatDateTime(dataJson.tempJson.c_time) }}</span>
        </el-descriptions-item>
        <el-descriptions-item>
          <div slot="label">更新人</div>
          <span>{{ dataJson.tempJson.u_name }}</span>
        </el-descriptions-item>
        <el-descriptions-item>
          <div slot="label">更新时间</div>
          <span>{{ formatDateTime(dataJson.tempJson.u_time) }}</span>
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
      @closeMeOk="handleBusinessCloseOk"
      @closeMeCancel="handleBusinessCloseCancel"
    />
    <industry-dialog
      v-if="popSettingsData.searchDialogDataTwo.visible"
      :visible="popSettingsData.searchDialogDataTwo.visible"
      :data="popSettingsData.searchDialogDataOne.selectedDataJson"
      @closeMeOk="handleIndustryCloseOk"
      @closeMeCancel="handleIndustryCloseCancel"
    />
    <category-dialog
      v-if="popSettingsData.searchDialogDataThree.visible"
      :visible="popSettingsData.searchDialogDataThree.visible"
      :data="popSettingsData.searchDialogDataTwo.selectedDataJson"
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
import IndustryDialog from '@/views/20_master/industry/dialog/dialog'
import CategoryDialog from '@/views/30_wms/category/dialog/10_list/index'

export default {
  name: 'GoodsEditDialog',
  directives: { elDragDialog },
  components: {
    InputSearch,
    BusinessDialog,
    IndustryDialog,
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
          business_id: '',
          business_code: '',
          business_name: '',
          industry_id: '',
          industry_code: '',
          industry_name: '',
          category_id: '',
          category_code: '',
          category_name: '',
          name: '',
          code: '',
          c_name: '',
          c_time: '',
          u_name: '',
          u_time: '',
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
        btnShowStatus: {
          showUpdate: true
        },
        btnDisabledStatus: {
          disabledUpdate: false
        },
        rules: {
          business_name: [
            { required: true, message: '请选择所属板块', trigger: 'blur' }
          ],
          industry_name: [
            { required: true, message: '请选择所属行业', trigger: 'blur' }
          ],
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
        searchDialogDataOne: {
          visible: false,
          selectedDataJson: {}
        },
        searchDialogDataTwo: {
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
        'background-color': '#f0f0f0',
        'padding': '10px'
      },
      labelStyle: {
        'font-weight': 'bold',
        'width': '120px'
      },
      // 原始数据（用于检测变更）
      originalData: {}
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
      // 初始化数据
      if (this.data) {
        this.dataJson.tempJson = deepCopy(this.data)
        this.originalData = deepCopy(this.data)
      }

      // 设置焦点
      this.$nextTick(() => {
        if (this.$refs.refFocusOne) {
          this.$refs.refFocusOne.focus()
        }
      })
    },

    // 板块选择对话框
    handleBusinessDialog () {
      this.popSettingsData.searchDialogDataOne.visible = true
    },
    handleBusinessCloseOk (data) {
      this.popSettingsData.searchDialogDataOne.visible = false
      this.popSettingsData.searchDialogDataOne.selectedDataJson = data

      // 设置板块信息
      this.dataJson.tempJson.business_id = data.id
      this.dataJson.tempJson.business_code = data.code
      this.dataJson.tempJson.business_name = data.name

      // 清空下级选择
      this.dataJson.tempJson.industry_id = ''
      this.dataJson.tempJson.industry_code = ''
      this.dataJson.tempJson.industry_name = ''
      this.dataJson.tempJson.category_id = ''
      this.dataJson.tempJson.category_code = ''
      this.dataJson.tempJson.category_name = ''
    },
    handleBusinessCloseCancel () {
      this.popSettingsData.searchDialogDataOne.visible = false
    },

    // 行业选择对话框
    handleIndustryDialog () {
      if (!this.dataJson.tempJson.business_id) {
        this.showErrorMsg('请先选择所属板块')
        return
      }
      this.popSettingsData.searchDialogDataTwo.visible = true
    },
    handleIndustryCloseOk (data) {
      this.popSettingsData.searchDialogDataTwo.visible = false
      this.popSettingsData.searchDialogDataTwo.selectedDataJson = data

      // 设置行业信息
      this.dataJson.tempJson.industry_id = data.id
      this.dataJson.tempJson.industry_code = data.code
      this.dataJson.tempJson.industry_name = data.name

      // 清空下级选择
      this.dataJson.tempJson.category_id = ''
      this.dataJson.tempJson.category_code = ''
      this.dataJson.tempJson.category_name = ''
    },
    handleIndustryCloseCancel () {
      this.popSettingsData.searchDialogDataTwo.visible = false
    },

    // 类别选择对话框
    handleCategoryDialog () {
      if (!this.dataJson.tempJson.industry_id) {
        this.showErrorMsg('请先选择所属行业')
        return
      }
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

    // 检测数据是否有变更
    hasDataChanged () {
      const currentData = JSON.stringify(this.dataJson.tempJson)
      const originalData = JSON.stringify(this.originalData)
      return currentData !== originalData
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

    // 取消
    handleCancel () {
      // 如果数据有变更，提示用户
      if (this.hasDataChanged()) {
        this.$confirm('数据已修改，确定要取消吗？', '确认信息', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$emit('closeMeCancel')
        })
      } else {
        this.$emit('closeMeCancel')
      }
    }
  }
}
</script>
