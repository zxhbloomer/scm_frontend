<template>
  <div>
    <!-- 新增库位弹窗 -->
    <el-dialog
      v-if="visible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      title="库位新增"
      :visible="visible"
      :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
      :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
      :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
      :append-to-body="true"
      :modal-append-to-body="true"
      :width="dialogConfig.width"
      destroy-on-close
    >
      <el-form
        ref="dataSubmitForm"
        :rules="settings.rules"
        :model="dataJson.tempJson"
        label-position="right"
        :label-width="dialogConfig.labelWidth"
        status-icon
      >
        <br>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="仓库名称："
              prop="warehouse_name"
            >
              <el-input
                v-model.trim="dataJson.tempJson.warehouse_name"
                disabled
              >
                <el-button
                  slot="append"
                  ref="selectOne"
                  icon="el-icon-search"
                  @click="handleWarehouseDialog()"
                >
                  选择
                </el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="库区名称："
              prop="location_name"
            >
              <el-input
                v-model.trim="dataJson.tempJson.location_name"
                disabled
              >
                <el-button
                  slot="append"
                  ref="selectTwo"
                  icon="el-icon-search"
                  @click="handleLocationDialog()"
                >
                  选择
                </el-button>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="库位名称："
              prop="name"
            >
              <el-input
                ref="refFocusOne"
                v-model.trim="dataJson.tempJson.name"
                clearable
                show-word-limit
                :maxlength="dataJson.inputSettings.maxLength.name"
                placeholder="请输入库位名称"
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

    <warehouse-dialog
      v-if="popSettingsData.searchDialogDataOne.visible"
      :visible="popSettingsData.searchDialogDataOne.visible"
      @closeMeOk="handleWarehouseCloseOk"
      @closeMeCancel="handleWarehouseCloseCancel"
    />
    <location-dialog
      v-if="popSettingsData.searchDialogDataTwo.visible"
      :visible="popSettingsData.searchDialogDataTwo.visible"
      :data="popSettingsData.searchDialogDataOne.selectedDataJson"
      @closeMeOk="handleLocationCloseOk"
      @closeMeCancel="handleLocationCloseCancel"
    />
  </div>
</template>

<style scoped>
.el-form-item .el-select {
  width: 100%;
}
.dialog-footer {
  text-align: center;
}
</style>
<style >
.el-input-group__append_select,
.el-input-group__append {
  color: #ffffff;
  background-color: #1890ff;
  border-color: #1890ff;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { insertApi } from '@/api/30_wms/bin/bin'
import warehouseDialog from '@/views/30_wms/warehouse/dialog/10_list/index.vue'
import locationDialog from '@/views/30_wms/location/dialog/10_list/index'

export default {
  name: 'BinNewDialog',
  components: { warehouseDialog, locationDialog },
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      // 对话框配置常量
      dialogConfig: {
        width: '850px',
        labelWidth: '150px'
      },
      popSettingsData: {
        // 弹出的查询框参数设置
        searchDialogDataOne: {
          // 弹出框显示参数
          visible: false,
          data: null,
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
        // 单条数据 json
        tempJson: {
          name: '',
          warehouse_name: '',
          location_name: ''
        },
        inputSettings: {
          maxLength: {
            name: 20
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
          warehouse_name: [
            { required: true, message: '请选择仓库', trigger: 'change' }
          ],
          location_name: [
            { required: true, message: '请选择库区', trigger: 'change' }
          ],
          name: [
            { required: true, message: '请输入库位名称', trigger: 'change' }
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
    // 监听表单数据变化
    'dataJson.tempJson': {
      handler (newVal, oldVal) {
        // 检查是否有实际的表单内容变化（相对于初始状态）
        if (newVal) {
          const original = this.$options.data.call(this).dataJson.tempJson
          const hasChanged = newVal.warehouse_name !== original.warehouse_name ||
                           newVal.location_name !== original.location_name ||
                           newVal.name !== original.name
          // 有变化时启用按钮，无变化时禁用按钮
          this.settings.btnDisabledStatus.disabledInsert = !hasChanged
        } else {
          // 初始化时保持按钮禁用
          this.settings.btnDisabledStatus.disabledInsert = true
        }
      },
      deep: true
    },
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
    // 初始化处理
    init () {
      // 数据初始化 - 重置为组件初始状态
      this.dataJson.tempJson = deepCopy(this.$options.data.call(this).dataJson.tempJson)

      // 如果有复制数据，使用复制数据
      if (this.data) {
        this.dataJson.tempJson = deepCopy(this.data)
        this.popSettingsData.searchDialogDataOne.selectedDataJson.id = this.data.warehouse_id
        this.popSettingsData.searchDialogDataTwo.selectedDataJson.id = this.data.location_id
      }
      // 重置按钮状态
      this.settings.btnDisabledStatus.disabledInsert = true

      // 控件focus
      this.$nextTick(() => {
        if (this.$refs.refFocusOne) {
          this.$refs.refFocusOne.focus()
        }
      })
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
          tempData.warehouse_id = this.popSettingsData.searchDialogDataOne.selectedDataJson.id
          tempData.location_id = this.popSettingsData.searchDialogDataTwo.selectedDataJson.id
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
    // 仓库选择
    handleWarehouseDialog () {
      this.popSettingsData.searchDialogDataOne.visible = true
    },
    // 仓库：关闭对话框：确定
    handleWarehouseCloseOk (val) {
      this.popSettingsData.searchDialogDataOne.selectedDataJson = val
      this.dataJson.tempJson.warehouse_name = val.name
      this.popSettingsData.searchDialogDataTwo.data = val
      this.popSettingsData.searchDialogDataOne.visible = false
    },
    // 仓库：关闭对话框：取消
    handleWarehouseCloseCancel () {
      this.popSettingsData.searchDialogDataOne.visible = false
    },
    // 库区选择
    handleLocationDialog () {
      if (this.popSettingsData.searchDialogDataOne.selectedDataJson.id == null) {
        this.showErrorMsg('请先选择仓库')
        return
      }
      this.popSettingsData.searchDialogDataTwo.visible = true
    },
    // 库区：关闭对话框：确定
    handleLocationCloseOk (val) {
      this.popSettingsData.searchDialogDataTwo.selectedDataJson = val
      this.popSettingsData.searchDialogDataTwo.visible = false
      this.dataJson.tempJson.location_name = val.name
    },
    // 库区：关闭对话框：取消
    handleLocationCloseCancel () {
      this.popSettingsData.searchDialogDataTwo.visible = false
    }
  }
}
</script>
