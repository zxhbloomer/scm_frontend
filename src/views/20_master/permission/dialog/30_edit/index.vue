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
      <el-row>
        <el-col :span="12">
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
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="启用状态："
            prop="is_enable"
          >
            <el-switch
              v-model="dataJson.tempJson.is_enable"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="true"
              :inactive-value="false"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="删除状态："
            prop="is_del"
          >
            <div class="switch">
              <el-switch
                v-model="dataJson.tempJson.is_del"
                active-color="#ff4949"
                inactive-color="#13ce66"
                :active-value="true"
                :inactive-value="false"
                active-text="是"
                inactive-text="否"
              />
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="数据权限："
            prop="is_admin"
          >
            <el-switch
              v-model="dataJson.tempJson.is_admin"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="true"
              :inactive-value="false"
              active-text="所有仓库"
              inactive-text="按仓库"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        label="说明："
        prop="descr"
      >
        <el-input
          v-model.trim="dataJson.tempJson.descr"
          clearable
          type="textarea"
          show-word-limit
          :maxlength="dataJson.inputSettings.maxLength.descr"
          placeholder="请输入权限说明"
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
      // 监听器
      watch: {
        unwatch_tempJson: null
      },
      dataJson: {
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          name: '',
          descr: '',
          dbversion: 0,
          is_enable: true,
          is_del: false,
          is_admin: false,
          u_name: '',
          u_time: ''
        },
        // 单条数据 json
        tempJson: null,
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
        this.initDialog()
      }
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
      this.dataJson.tempJson = deepCopy(this.data)
      this.dataJson.tempJsonOriginal = deepCopy(this.data)

      // 设置监听器
      this.setWatch()

      // 控件focus
      this.$nextTick(() => {
        this.$refs['refFocus'].focus()
      })
    },

    /**
     * 设置监听器
     */
    setWatch () {
      this.unWatch()
      // 监听页面上面是否有修改，有修改按钮高亮
      this.watch.unwatch_tempJson = this.$watch('dataJson.tempJson', (newVal, oldVal) => {
        this.settings.btnDisabledStatus.disabledUpdate = false
      }, { deep: true })
    },

    /**
     * 取消监听器
     */
    unWatch () {
      if (this.watch.unwatch_tempJson) {
        this.watch.unwatch_tempJson()
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
.switch ::v-deep .el-switch__label {
  position: absolute;
  display: none;
  color: #fff;
}

/*打开时文字位置设置*/
.switch ::v-deep .el-switch__label--right {
  z-index: 1;
  right: 19px;
}
/*关闭时文字位置设置*/
.switch ::v-deep .el-switch__label--left {
  z-index: 1;
  left: 19px;
}
/*显示文字*/
.switch ::v-deep .el-switch__label.is-active {
  display: block;
}
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
