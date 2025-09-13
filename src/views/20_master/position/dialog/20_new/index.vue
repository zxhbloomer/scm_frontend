<template>
  <!-- 新增岗位弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="岗位新增"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="1000px"
    destroy-on-close
  >
    <el-form
      ref="dataSubmitForm"
      :rules="settings.rules"
      :model="dataJson.tempJson"
      label-position="rigth"
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
            label="岗位编号："
            prop="code"
          >
            <el-input
              v-model.trim="dataJson.tempJson.code"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.code"
              placeholder="请输入（可选）"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="岗位名称："
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
            label="岗位简称："
            prop="simple_name"
          >
            <el-input
              v-model.trim="dataJson.tempJson.simple_name"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.code"
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

<style scoped>
.el-form-item .el-select {
  width: 100%;
}
.dialog-footer {
  text-align: center;
}
</style>

<script>
import { insertApi } from '@/api/20_master/position/position'
import deepcopy from 'deep-copy'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  directives: { elDragDialog },
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
          code: '',
          name: '',
          simple_name: '',
          descr: ''
        },
        inputSettings: {
          maxLength: {
            code: 20,
            name: 100,
            descr: 200
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
          code: [
            { max: 20, message: '岗位编号不能超过20个字符', trigger: 'blur' }
          ],
          name: [
            { required: true, message: '请输入岗位名称', trigger: 'blur' },
            { max: 100, message: '岗位名称不能超过100个字符', trigger: 'blur' }
          ],
          simple_name: [
            { required: true, message: '请输入岗位简称', trigger: 'blur' },
            { max: 100, message: '岗位简称不能超过100个字符', trigger: 'blur' }
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
    }
  },
  methods: {
    init () {
      // 如果有复制数据，使用复制数据
      if (this.copyData) {
        this.dataJson.tempJson = deepcopy(this.copyData)
        // 清空编号，因为编号必须唯一
        this.dataJson.tempJson.code = ''
        // 清空ID和系统字段
        delete this.dataJson.tempJson.id
        delete this.dataJson.tempJson.u_time
        delete this.dataJson.tempJson.u_name
        delete this.dataJson.tempJson.c_time
        delete this.dataJson.tempJson.c_name
      } else {
        // 否则使用默认空数据
        this.dataJson.tempJson = deepcopy(this.$options.data.call(this).dataJson.tempJson)
      }

      // 设置焦点
      this.$nextTick(() => {
        if (this.$refs.refFocusOne) {
          this.$refs.refFocusOne.focus()
        }
      })
    },
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
    handleCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>
