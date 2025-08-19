<template>
  <!-- 编辑岗位弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="岗位修改"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="1000px"
    destroy-on-close
    custom-class="edit-dialog-priority"
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
              disabled
              placeholder="岗位编号"
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
</style>

<style>
.edit-dialog-priority {
  z-index: 3000 !important;
}
.edit-dialog-priority .el-dialog {
  z-index: 3000 !important;
}
</style>

<script>
import { updateApi } from '@/api/20_master/position/position'
import deepcopy from 'deep-copy'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      dataJson: {
        // 原始数据备份
        tempJsonOriginal: null,
        // 编辑数据
        tempJson: null,
        inputSettings: {
          maxLength: {
            code: 20,
            name: 100,
            simple_name: 20,
            descr: 200
          }
        }
      },
      settings: {
        loading: false,
        duration: 4000,
        btnDisabledStatus: {
          disabledUpdate: true
        },
        rules: {
          name: [
            { required: true, message: '请输入岗位名称', trigger: 'blur' },
            { max: 100, message: '岗位名称不能超过100个字符', trigger: 'blur' }
          ],
          simple_name: [
            { required: true, message: '请输入岗位简称', trigger: 'blur' },
            { max: 20, message: '岗位简称不能超过20个字符', trigger: 'blur' }
          ]
        }
      },
      watch: {
        unwatch_tempJson: null
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
  beforeDestroy () {
    this.unWatch()
  },
  methods: {
    init () {
      // 初始化数据
      this.dataJson.tempJson = deepcopy(this.data)
      this.dataJson.tempJsonOriginal = deepcopy(this.data)

      // 设置焦点
      this.$nextTick(() => {
        if (this.$refs.refFocusOne) {
          this.$refs.refFocusOne.focus()
        }
      })

      // 设置监听器
      this.setWatch()
    },
    setWatch () {
      this.unWatch()
      // 监听页面上面是否有修改
      this.watch.unwatch_tempJson = this.$watch('dataJson.tempJson', (newVal, oldVal) => {
        // 比较是否有改变
        const hasChanged = JSON.stringify(newVal) !== JSON.stringify(this.dataJson.tempJsonOriginal)
        this.settings.btnDisabledStatus.disabledUpdate = !hasChanged
      }, { deep: true })
    },
    unWatch () {
      if (this.watch.unwatch_tempJson) {
        this.watch.unwatch_tempJson()
        this.watch.unwatch_tempJson = null
      }
    },
    doUpdate () {
      this.$refs.dataSubmitForm.validate((valid) => {
        if (valid) {
          this.settings.loading = true
          const tempData = deepcopy(this.dataJson.tempJson)
          updateApi(tempData).then((response) => {
            // 更新本地数据
            this.dataJson.tempJson = deepcopy(response.data)
            this.dataJson.tempJsonOriginal = deepcopy(response.data)

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
