<template>
  <!-- 编辑弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="企业修改"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="800px"
    destroy-on-close
  >
    <el-form
      ref="dataSubmitForm"
      :rules="settings.rules"
      :model="dataJson.tempJson"
      label-position="right"
      label-width="140px"
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
            label="企业编号："
            prop="code"
          >
            <el-input
              v-model.trim="dataJson.tempJson.code"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.code"
              disabled
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="社会信用代码："
            prop="company_no"
          >
            <el-input
              v-model.trim="dataJson.tempJson.company_no"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.company_no"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="企业名称："
            prop="name"
          >
            <el-input
              ref="refFocusOne"
              v-model.trim="dataJson.tempJson.name"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.name"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="企业简称："
            prop="simple_name"
          >
            <el-input
              v-model.trim="dataJson.tempJson.simple_name"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.simple_name"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="法定代表人："
            prop="juridical_name"
          >
            <el-input
              v-model.trim="dataJson.tempJson.juridical_name"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.juridical_name"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="注册资本（万）："
            prop="register_capital"
          >
            <numeric
              v-model="dataJson.tempJson.register_capital"
              :decimal-places="2"
              :currency-symbol="''"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="成立日期："
            prop="setup_date"
          >
            <el-date-picker
              v-model="dataJson.tempJson.setup_date"
              type="date"
              placeholder="选择日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="企业类型："
            prop="type_id"
          >
            <select-dict
              v-model="dataJson.tempJson.type_id"
              :para="CONSTANTS.DICT_COMPANY_TYPE"
              init-placeholder="请选择"
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
          :maxlength="dataJson.inputSettings.maxLength.descr"
          placeholder="请输入"
        />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="更新人："
            prop="u_name"
          >
            <el-input
              v-model="dataJson.tempJson.u_name"
              disabled
              placeholder=""
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="更新时间："
            prop="u_time"
          >
            <el-input
              :value="dataJson.tempJson.u_time ? formatDateTime(dataJson.tempJson.u_time) : ''"
              disabled
              placeholder=""
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
      <el-button
        type="primary"
        :loading="settings.loading"
        @click="handleDialogSubmit"
      >确定</el-button>
      <el-button
        @click="handleDialogCancel"
      >取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import { updateApi } from '@/api/20_master/company/company'
import numeric from '@/components/40_input/numeric/index.vue'
import SelectDict from '@/components/00_dict/select/SelectDict'
import deepCopy from 'deep-copy'

export default {
  name: 'CompanyEditDialog',
  components: {
    numeric,
    SelectDict
  },
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
    const validateName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入企业名称'))
      } else {
        callback()
      }
    }
    const validateSimpleName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入企业简称'))
      } else {
        callback()
      }
    }
    const validateCompanyNo = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入社会信用代码'))
      } else if (value.length !== 18) {
        callback(new Error('社会信用代码应为18位'))
      } else {
        callback()
      }
    }
    return {
      dataJson: {
        // 表单数据
        tempJson: {},
        // 输入控件设置
        inputSettings: {
          maxLength: {
            code: 30,
            company_no: 18,
            name: 100,
            simple_name: 20,
            juridical_name: 20,
            descr: 200
          }
        }
      },
      settings: {
        loading: false,
        // 表单校验规则
        rules: {
          name: [
            { required: true, validator: validateName, trigger: 'blur' }
          ],
          simple_name: [
            { required: true, validator: validateSimpleName, trigger: 'blur' }
          ],
          company_no: [
            { required: true, validator: validateCompanyNo, trigger: 'blur' }
          ]
        }
      }
    }
  },
  watch: {
    visible: {
      handler (newVal) {
        if (newVal && this.data) {
          // 深拷贝传入的数据
          this.dataJson.tempJson = deepCopy(this.data)
          this.$nextTick(() => {
            this.$refs.refFocusOne && this.$refs.refFocusOne.focus()
          })
        }
      },
      immediate: true
    }
  },
  methods: {
    // 提交
    handleDialogSubmit () {
      this.$refs['dataSubmitForm'].validate((valid) => {
        if (valid) {
          this.settings.loading = true
          updateApi(this.dataJson.tempJson).then(response => {
            this.$emit('closeMeOk', {
              return_flag: true,
              data: response
            })
          }).catch(error => {
            this.$emit('closeMeOk', {
              return_flag: false,
              error: error
            })
          }).finally(() => {
            this.settings.loading = false
          })
        } else {
          this.showErrorMsg('请检查输入项')
          return false
        }
      })
    },
    // 取消
    handleDialogCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: center;
}
</style>
