<template>
  <div>
    <!-- pop窗口 数据编辑:新增、修改 -->
    <el-dialog
      v-if="listenVisible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      :title="PARAMETERS.STATUS_TEXT_MAP[dialogStatus]"
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
        <br>
        <el-descriptions
          title=""
          :column="2"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
        >
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              物料编码
            </div>
            <el-form-item prop="spec_code">
              <input-search
                v-model.trim="dataJson.tempJson.spec_code"
                :disabled="isUpdateModel && isViewModel"
                @onInputSearch="handleSpecDialog"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="物料名称">
            {{ dataJson.tempJson.goods_name }}
          </el-descriptions-item>
          <el-descriptions-item label="品名">
            {{ dataJson.tempJson.pm }}
          </el-descriptions-item>
          <el-descriptions-item label="规格">
            {{ dataJson.tempJson.spec }}
          </el-descriptions-item>
          <el-descriptions-item label="合同数量">
            <el-input
              v-model.trim="dataJson.tempJson.contract_num"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.num"
              :placeholder="isPlaceholderShow('请输入')"
              :disabled="isViewModel"
            />
          </el-descriptions-item>
          <el-descriptions-item label="单位">
            <el-input
              v-model.trim="dataJson.tempJson.contract_num"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.num"
              :placeholder="isPlaceholderShow('请输入')"
              :disabled="isViewModel"
            />
          </el-descriptions-item>
          <el-descriptions-item label="合同价格">
            <el-input
              v-model.trim="dataJson.tempJson.contract_num"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.num"
              :placeholder="isPlaceholderShow('请输入')"
              :disabled="isViewModel"
            />
          </el-descriptions-item>
          <el-descriptions-item label="金额">
            {{ dataJson.tempJson.spec }}
          </el-descriptions-item>
          <el-descriptions-item label="税率">
            <el-input
              v-model.trim="dataJson.tempJson.contract_num"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.num"
              :placeholder="isPlaceholderShow('请输入')"
              :disabled="isViewModel"
            />
          </el-descriptions-item>

          <el-descriptions-item label="交货日期">
            <el-date-picker
              v-model="dataJson.tempJson.contract_dt"
              value-format="yyyy-MM-dd"
              type="date"
              clearable
              :disabled="isViewModel"
              :placeholder="isPlaceholderShow('选择日期')"
              style="width: 100%"
            />
          </el-descriptions-item>

          <el-descriptions-item label="交货方式">
            <el-date-picker
              v-model="dataJson.tempJson.contract_dt"
              value-format="yyyy-MM-dd"
              type="date"
              clearable
              :disabled="isViewModel"
              :placeholder="isPlaceholderShow('选择日期')"
              style="width: 100%"
            />
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
          v-show="settings.btnShowStatus.showInsert"
          plain
          type="primary"
          :disabled="settings.loading || settings.btnDisabledStatus.disabledInsert "
          @click="doInsert()"
        >确定</el-button>
        <el-button
          v-show="settings.btnShowStatus.showUpdate && !isViewModel"
          plain
          type="primary"
          :disabled="settings.loading || settings.btnDisabledStatus.disabledUpdate "
          @click="doUpdate()"
        >确定</el-button>
      </div>
    </el-dialog>

    <supplier-dialog
      v-if="popSettingsData.searchDialogDataOne.visible"
      :visible="popSettingsData.searchDialogDataOne.visible"
      @closeMeOk="handleSupplierCloseOk"
      @closeMeCancel="handleSupplierCloseCancel"
    />
  </div>

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
<style >
.el-input-group__append_select,
.el-input-group__append {
  color: #ffffff;
  background-color: #1890ff;
  border-color: #1890ff;
}
</style>

<script>
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { updateApi, insertApi } from '@/api/40_business/30_in/inorder/inorder'
import supplierDialog from '@/views/30_wms/customer/dialog/dialog'

export default {
  components: { supplierDialog },
  directives: { elDragDialog },
  mixins: [],
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
    },
    dialogStatus: {
      type: String,
      default: constants_para.STATUS_VIEW
    }
  },
  data () {
    return {
      // 监听器
      watch: {
        unwatch_tempJson: null
      },
      popSettingsData: {
        // 弹出窗口状态名称
        dialogStatus: '',
        textMap: {
          update: '请选择要修改结点的类型',
          insert: '请选择添加下级结点类型'
        },
        dialogFormVisible: false,
        btnDisabledStatus: {
          disabledOK: false
        },
        // 弹出的查询框参数设置
        searchDialogDataOne: {
          // 弹出框显示参数
          visible: false,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        }
      },
      dataJson: {

        searchForm: {
          pageCondition: {}
        },
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          name: '',
          config_key: '',
          value: '',
          descr: ''
        },
        // 单条数据 json
        tempJson: {
          business_name: ''
        },
        inputSettings: {
          maxLength: {
            name: 20,
            code: 20
          }
        }
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        // 按钮是否显示，默认不显示，false：不显示，true：显示
        btnShowStatus: {
          showInsert: false,
          showUpdate: false
        },
        // 按钮状态：是否可用，false:可用，true不可用
        btnDisabledStatus: {
          disabledInsert: true,
          disabledUpdate: true
        },
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: this.dialogStatus,
        // pop的check内容
        rules: {
          name: [
            { required: true, message: '请输入类别名称', trigger: 'change' }
          ],
          business_name: [
            { required: true, message: '请选择板块', trigger: 'change' }
          ],
          industry_name: [
            { required: true, message: '请选择行业', trigger: 'change' }
          ]
        },
        // 错误数目
        badge: {
          countOne: 0,
          countTwo: 0
        }
      }
    }
  },
  computed: {
    // 是否为更新模式
    isUpdateModel () {
      if (
        this.settings.dialogStatus === this.PARAMETERS.STATUS_INSERT ||
        this.settings.dialogStatus === this.PARAMETERS.STATUS_COPY_INSERT
      ) {
        return false
      } else {
        return true
      }
    },
    listenVisible () {
      return this.visible
    },
    isViewModel () {
      if (this.settings.dialogStatus === this.PARAMETERS.STATUS_VIEW) {
        return true
      } else {
        return false
      }
    }
  },
  // 监听器
  watch: {},
  created () {
    this.init()
  },
  mounted () {
    // 描绘完成
  },
  destroyed () {
    this.unWatch()
  },
  methods: {
    // 初始化处理
    init () {
      this.initButtonShowStatus()
      this.initButtonDisabledStatus()
      switch (this.dialogStatus) {
        case this.PARAMETERS.STATUS_INSERT:
          this.initInsertModel()
          break
        case this.PARAMETERS.STATUS_UPDATE:
          this.initUpdateModel()
          break
        case this.PARAMETERS.STATUS_VIEW:
          this.initViewModel()
          break
      }
      // 初始化watch
      this.setWatch()
      this.settings.loading = false
    },
    initTempJsonOriginal () {
      // 单条数据 json的，初始化原始数据
      this.dataJson.tempJsonOriginal = this.$options.data.call(
        this
      ).dataJson.tempJsonOriginal
    },
    initButtonShowStatus () {
      // 初始化按钮状态：默认都隐藏
      this.settings.btnShowStatus = this.$options.data.call(
        this
      ).settings.btnShowStatus
    },
    initButtonDisabledStatus () {
      // 按钮状态初始化：默认不可用
      this.settings.btnDisabledStatus = this.$options.data.call(
        this
      ).settings.btnDisabledStatus
    },
    // 新增时的初始化
    initInsertModel () {
      // 数据初始化
      this.initTempJsonOriginal()
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)

      // 设置按钮
      this.settings.btnShowStatus.showInsert = true
      // 控件focus
      // this.$nextTick(() => {
      //   this.$refs['refFocusOne'].focus()
      // })
    },
    // Placeholder设置
    isPlaceholderShow (val) {
      if (this.isViewModel) {
        return ''
      } else {
        return val
      }
    },
    // 修改时的初始化
    initUpdateModel () {
      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.data)
      this.dataJson.tempJsonOriginal = deepCopy(this.data)
      this.popSettingsData.searchDialogDataOne.selectedDataJson.id = this.data.supplier_id
      // 设置按钮
      this.settings.btnShowStatus.showUpdate = true
      // 控件focus
      // this.$nextTick(() => {
      //   this.$refs['refFocusOne'].focus()
      // })
    },
    // 查看时的初始化
    initViewModel () {
      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.data)
    },
    // 设置监听器
    setWatch () {
      this.unWatch()
      // 监听页面上面是否有修改，有修改按钮高亮
      this.watch.unwatch_tempJson = this.$watch(
        'dataJson.tempJson',
        (newVal, oldVal) => {
          this.settings.btnDisabledStatus.disabledInsert = false
          this.settings.btnDisabledStatus.disabledUpdate = false
        },
        { deep: true }
      )
    },
    unWatch () {
      if (this.watch.unwatch_tempJson) {
        this.watch.unwatch_tempJson()
      }
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
          tempData.supplier_id = this.popSettingsData.searchDialogDataOne.selectedDataJson.id
          tempData.supplier_code = this.popSettingsData.searchDialogDataOne.selectedDataJson.code
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
    // 更新逻辑
    doUpdate () {
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)
          if (this.popSettingsData.searchDialogDataOne.selectedDataJson != null) {
            tempData.supplier_id = this.popSettingsData.searchDialogDataOne.selectedDataJson.id
            tempData.supplier_code = this.popSettingsData.searchDialogDataOne.selectedDataJson.code
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
    handleTabsClick (tab, event) { },
    // 供应商
    handleSupplierDialog () {
      this.popSettingsData.searchDialogDataOne.visible = true
    },
    // 供应商：关闭对话框：确定
    handleSupplierCloseOk (val) {
      this.popSettingsData.searchDialogDataOne.selectedDataJson = val
      this.dataJson.tempJson.supplier_name = val.name
      this.popSettingsData.searchDialogDataOne.visible = false
      this.settings.btnDisabledStatus.disabledUpdate = false
    },
    // 供应商：关闭对话框：取消
    handleSupplierCloseCancel () {
      this.popSettingsData.searchDialogDataOne.visible = false
    }
  }
}
</script>
