<template>
  <!-- 新增权限弹窗 -->
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
        prop="menu_id"
      >
        <radio-menu
          v-model="dataJson.tempJson.menu_id"
          :value="dataJson.tempJson.menu_id"
          :api-method="getRootMenuListApi"
          @change="handleMenuChange"
        />
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

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import { insertApi } from '@/api/20_master/permission/permission'
import { getRootMenuListApi } from '@/api/20_master/menus/menu'
import deepCopy from 'deep-copy'
import RadioMenu from '@/components/00_dict/radio_menu/index.vue'

export default {
  name: 'PermissionNewDialog',
  directives: { elDragDialog },
  components: { RadioMenu },
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
      dataJson: {
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          name: '',
          descr: '',
          menu_id: null,
          dbversion: 0
        },
        // 单条数据 json
        tempJson: {
          id: undefined,
          name: '',
          descr: '',
          menu_id: null,
          dbversion: 0
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
          disabledInsert: true
        },
        // pop的check内容
        rules: {
          name: [{ required: true, message: '请输入权限名称', trigger: 'change' }],
          menu_id: [{ required: true, message: '请选择关联菜单', trigger: 'change' }]
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
    },
    'dataJson.tempJson.name' () {
      this.checkFormValid()
    },
    'dataJson.tempJson.menu_id' () {
      this.checkFormValid()
    },
    'dataJson.tempJson.descr' () {
      this.checkFormValid()
    }
  },
  created () {},
  mounted () {},
  methods: {
    /**
     * 获取弹窗标题
     */
    getDialogTitle () {
      return '新增权限'
    },

    /**
     * 检查表单是否有效并控制按钮状态
     */
    checkFormValid () {
      const { name, menu_id } = this.dataJson.tempJson
      // 检查必填字段
      const isValid = name && name.trim() !== '' && menu_id
      this.settings.btnDisabledStatus.disabledInsert = !isValid
    },

    /**
     * 初始化弹窗
     */
    initDialog () {
      this.initTempJsonOriginal()
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)

      // 控件focus
      this.$nextTick(() => {
        this.$refs['refFocus'].focus()
      })
    },

    /**
     * 获取根菜单列表API方法
     */
    getRootMenuListApi,

    /**
     * 菜单选择变化处理
     */
    handleMenuChange (val) {
      this.dataJson.tempJson.menu_id = val
    },

    /**
     * 初始化原始数据
     */
    initTempJsonOriginal () {
      this.dataJson.tempJsonOriginal = this.$options.data.call(this).dataJson.tempJsonOriginal
    },

    /**
     * 取消按钮
     */
    handleCancel () {
      this.$emit('update:visible', false)
      this.$emit('onCancel')
    },

    /**
     * 插入逻辑
     */
    doInsert () {
      this.$refs['dataSubmitForm'].validate((valid) => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)
          tempData.type = this.CONSTANTS.DICT_MSTR_PERMISSION_TYPE_ROLE
          // 设置默认值
          tempData.is_enable = true
          tempData.is_del = false
          tempData.is_admin = false

          this.settings.loading = true

          insertApi(tempData).then((_data) => {
            this.$emit('update:visible', false)
            this.$emit('onSuccess', {
              return_flag: true,
              data: _data,
              message: '新增权限成功'
            })
            this.$notify({
              title: '新增处理成功',
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
              title: '新增处理失败',
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
