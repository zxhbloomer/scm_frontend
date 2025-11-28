<template>
  <div>
    <!-- 编辑库位弹窗 -->
    <el-dialog
      v-if="visible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      title="库位编辑"
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
          <el-descriptions-item label="仓库名称：" class="required-mark">
            <el-form-item
              prop="warehouse_name"
              style="margin-bottom: 0"
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
          </el-descriptions-item>
          <el-descriptions-item label="库区名称：" class="required-mark">
            <el-form-item
              prop="location_name"
              style="margin-bottom: 0"
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
          </el-descriptions-item>
          <el-descriptions-item label="库位名称：" class="required-mark">
            <el-form-item
              prop="name"
              style="margin-bottom: 0"
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
          </el-descriptions-item>
          <el-descriptions-item label="是否启用：">
            <el-form-item
              prop="enable"
              style="margin-bottom: 0"
            >
              <el-switch
                v-model="dataJson.tempJson.enable"
                active-text="启用"
                inactive-text="停用"
                active-color="#13ce66"
                inactive-color="#ff4949"
              />
            </el-form-item>
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
          :disabled="settings.loading"
          @click="handleCancel()"
        >取消</el-button>
        <el-button
          plain
          type="primary"
          :disabled="settings.loading || settings.btnDisabledStatus.disabledUpdate"
          @click="doUpdate()"
        >确定</el-button>
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

.required-mark {
  position: relative;
}

.required-mark::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
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
import { updateApi } from '@/api/30_wms/bin/bin'
import warehouseDialog from '@/views/30_wms/warehouse/dialog/10_list/index.vue'
import locationDialog from '@/views/30_wms/location/dialog/10_list/index'

export default {
  name: 'BinEditDialog',
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

      // 描述列表样式配置
      contentStyle: {
        width: '15%'
      },
      labelStyle: {
        width: '12%',
        'text-align': 'right'
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
          location_name: '',
          enable: true
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
          disabledUpdate: true
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
        this.settings.btnDisabledStatus.disabledUpdate = false
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
      // 数据初始化 - 编辑模式使用传入的data
      if (this.data) {
        this.dataJson.tempJson = deepCopy(this.data)
        this.popSettingsData.searchDialogDataOne.selectedDataJson.id = this.data.warehouse_id
        this.popSettingsData.searchDialogDataTwo.selectedDataJson.id = this.data.location_id
      }

      // 重置按钮状态
      this.settings.btnDisabledStatus.disabledUpdate = true

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
    // 更新逻辑
    doUpdate () {
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)
          if (this.popSettingsData.searchDialogDataOne.selectedDataJson != null) {
            tempData.warehouse_id = this.popSettingsData.searchDialogDataOne.selectedDataJson.id
          }
          if (this.popSettingsData.searchDialogDataTwo.selectedDataJson != null) {
            tempData.location_id = this.popSettingsData.searchDialogDataTwo.selectedDataJson.id
          }
          this.settings.loading = true
          updateApi(tempData)
            .then(
              _data => {
                this.dataJson.tempJson = deepCopy(_data.data)
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
      this.settings.btnDisabledStatus.disabledUpdate = false
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
      this.settings.btnDisabledStatus.disabledUpdate = false
      this.dataJson.tempJson.location_name = val.name
    },
    // 库区：关闭对话框：取消
    handleLocationCloseCancel () {
      this.popSettingsData.searchDialogDataTwo.visible = false
    }
  }
}
</script>
