<template>
  <!-- 新增弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="集团新增"
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
            label="编号："
            prop="code"
          >
            <el-input
              v-model.trim="dataJson.tempJson.code"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.code"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="集团名称："
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
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="集团简称："
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
import { insertApi } from '@/api/20_master/group/group'

export default {
  name: 'GroupNewDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    const validateName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入集团名称'))
      } else {
        callback()
      }
    }
    const validateSimpleName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入集团简称'))
      } else {
        callback()
      }
    }
    return {
      dataJson: {
        // 表单数据
        tempJson: {
          code: '',
          name: '',
          simple_name: '',
          descr: ''
        },
        // 输入控件设置
        inputSettings: {
          maxLength: {
            code: 20,
            name: 100,
            simple_name: 50,
            descr: 500
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
          ]
        }
      }
    }
  },
  watch: {
    visible: {
      handler (newVal) {
        if (newVal) {
          this.$nextTick(() => {
            this.$refs.refFocusOne && this.$refs.refFocusOne.focus()
          })
        }
      },
      immediate: true
    }
  },
  methods: {
    // 设置复制数据（用于复制新增）
    setCopyData (data) {
      if (data) {
        // 复制数据但清除ID
        this.dataJson.tempJson = {
          code: data.code + '_copy',
          name: data.name,
          simple_name: data.simple_name,
          descr: data.descr
        }
      }
    },
    // 提交
    handleDialogSubmit () {
      this.$refs['dataSubmitForm'].validate((valid) => {
        if (valid) {
          this.settings.loading = true
          insertApi(this.dataJson.tempJson).then(response => {
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
</style>
