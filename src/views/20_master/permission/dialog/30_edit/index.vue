<template>
  <!-- 编辑权限弹窗 -->
  <el-dialog
    v-if="listenVisible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    :title="getDialogTitle()"
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
      label-width="120px"
      status-icon
    >
      <el-form-item
        label="权限名称："
        prop="name"
      >
        <el-input
          ref="refFocus"
          v-model.trim="dataJson.tempJson.name"
          clearable
          show-word-limit
          :maxlength="dataJson.inputSettings.maxLength.name"
          placeholder="请输入权限名称"
        />
      </el-form-item>
      <el-form-item
        label="关联菜单："
        prop="menu_name"
      >
        <span style="color: #606266;">{{ dataJson.tempJson.menu_name || '-' }}</span>
      </el-form-item>
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
          placeholder="请输入备注"
        />
      </el-form-item>
      <el-row v-if="dataJson.tempJson.id">
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
              :value="formatDateTime(dataJson.tempJson.u_time)"
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
      <div class="floatLeft" />
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

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import { updateApi } from '@/api/20_master/permission/permission'
import deepCopy from 'deep-copy'

export default {
  name: 'PermissionEditDialog',
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
    return {
      // 监听器引用
      watchRefs: {
        unwatch_tempJson: null
      },
      dataJson: {
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          name: '',
          descr: '',
          dbversion: 0,
          u_name: '',
          u_time: ''
        },
        // 单条数据 json
        tempJson: {
          id: undefined,
          name: '',
          descr: '',
          dbversion: 0,
          u_name: '',
          u_time: ''
        },
        inputSettings: {
          maxLength: {
            name: 20,
            descr: 200
          }
        }
      },
      settings: {
        // loading 状态
        loading: false,
        // 按钮状态：是否可用，false:可用，true不可用
        btnDisabledStatus: {
          disabledUpdate: true
        },
        // pop的check内容
        rules: {
          name: [{ required: true, message: '请输入权限名称', trigger: 'change' }]
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
    visible (newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.initDialog()
        })
      }
    },
    data: {
      handler (newVal) {
        if (this.visible && newVal && Object.keys(newVal).length > 0) {
          this.initDialog()
        }
      },
      deep: true,
      immediate: true
    }
  },
  created () {},
  mounted () {},
  destroyed () {
    this.unWatch()
  },
  methods: {
    /**
     * 获取弹窗标题
     */
    getDialogTitle () {
      return '编辑权限'
    },

    /**
     * 初始化弹窗
     */
    initDialog () {
      // 数据初始化
      if (this.data && Object.keys(this.data).length > 0) {
        this.dataJson.tempJson = deepCopy(this.data)
        this.dataJson.tempJsonOriginal = deepCopy(this.data)
      } else {
        // 如果没有数据，使用默认值
        this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)
      }

      // 设置监听器
      this.setWatch()

      // 控件focus
      this.$nextTick(() => {
        if (this.$refs['refFocus']) {
          this.$refs['refFocus'].focus()
        }
      })
    },

    /**
     * 设置监听器
     */
    setWatch () {
      this.unWatch()
      // 监听页面上面是否有修改，有修改按钮高亮
      this.watchRefs.unwatch_tempJson = this.$watch('dataJson.tempJson', (newVal, oldVal) => {
        this.settings.btnDisabledStatus.disabledUpdate = false
      }, { deep: true })
    },

    /**
     * 取消监听器
     */
    unWatch () {
      if (this.watchRefs.unwatch_tempJson) {
        this.watchRefs.unwatch_tempJson()
      }
    },

    /**
     * 取消按钮
     */
    handleCancel () {
      this.$emit('update:visible', false)
      this.$emit('onCancel')
    },

    /**
     * 更新逻辑
     */
    doUpdate () {
      this.$refs['dataSubmitForm'].validate((valid) => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)
          this.settings.loading = true

          updateApi(tempData).then((_data) => {
            this.dataJson.tempJson = deepCopy(_data.data)
            this.$emit('update:visible', false)
            this.$emit('onSuccess', {
              return_flag: true,
              data: _data,
              message: '更新权限成功'
            })
            this.$notify({
              title: '更新处理成功',
              message: _data.message,
              type: 'success',
              duration: 4000
            })
          }, (_error) => {
            this.$emit('onError', {
              return_flag: false,
              error: _error
            })
            this.$notify({
              title: '更新处理失败',
              message: _error.error.message,
              type: 'error',
              duration: 4000
            })
          }).finally(() => {
            this.settings.loading = false
          })
        }
      })
    }
  }
}
</script>

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
.dialog-footer {
  text-align: center;
}
</style>
