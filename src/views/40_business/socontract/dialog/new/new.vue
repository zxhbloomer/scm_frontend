<template>
  <div class="app-container">
    <div class="edit-container">
      <el-form
        ref="dataSubmitForm"
        :rules="settings.rules"
        :model="dataJson.tempJson"
        label-position="right"
        label-width="150px"
        status-icon
      >
        <el-alert
          title="基本信息"
          type="info"
          :closable="false"
        />
        <br>
        <el-descriptions
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >

          <el-descriptions-item label="编号">
            {{ dataJson.tempJson.code == null || dataJson.tempJson.code === ''?'系统自动生成':dataJson.tempJson.code }}
          </el-descriptions-item>

          <!--          <el-descriptions-item label="项目编号">-->
          <!--            {{ dataJson.tempJson.project_code == null || dataJson.tempJson.code == ''?'系统自动生成':dataJson.tempJson.code }}-->
          <!--          </el-descriptions-item>-->

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              合同编号
            </div>
            <el-form-item
              prop="contract_code"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.contract_code"
                clearable
                :maxlength="dataJson.inputSettings.maxLength.contract_code"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              类型
            </div>
            <select-dict
              v-model="dataJson.tempJson.type"
              :value="dataJson.tempJson.type"
              :para="CONSTANTS.DICT_B_PO_CONTRACT_TYPE"
              init-placeholder="请选择"
              style="width:100%"
            />
          </el-descriptions-item>
          <!--          <el-descriptions-item label="订单量">-->
          <!--            <el-form-item-->
          <!--              prop="owner_name"-->
          <!--              label-width="0"-->
          <!--            >-->
          <!--              <el-input-->
          <!--                v-model.trim="dataJson.tempJson.vehicle_no"-->
          <!--                clearable-->
          <!--                :maxlength="dataJson.inputSettings.maxLength.vehicle_no"-->
          <!--              />-->
          <!--            </el-form-item>-->
          <!--          </el-descriptions-item>-->
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              供应商
            </div>
            <el-form-item
              prop="supplier_name"
              label-width="0"
            >
              <input-search
                v-model.trim="dataJson.tempJson.supplier_name"
                @onInputSearch="handleSupplierDialog"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              主体企业
            </div>
            <el-form-item
              prop="purchaser_name"
              label-width="0"
            >
              <input-search
                v-model.trim="dataJson.tempJson.purchaser_name"
                @onInputSearch="handlePurchaserDialog"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="签约日期">
            <el-form-item
              prop="sign_date"
              label-width="0"
            >
              <el-date-picker
                v-model="dataJson.tempJson.sign_date"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                clearable
                :placeholder="'选择日期'"
                style="width: 100%"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="到期日期">
            <el-form-item
              prop="expiry_date"
              label-width="0"
            >
              <el-date-picker
                v-model="dataJson.tempJson.expiry_date"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                clearable
                :placeholder="'选择日期'"
                style="width: 100%"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="交货日期">
            <el-form-item
              prop="delivery_date"
              label-width="0"
            >
              <el-date-picker
                v-model="dataJson.tempJson.delivery_date"
                value-format="yyyy-MM-dd"
                type="date"
                clearable
                :placeholder="'选择日期'"
                style="width: 100%"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="运输方式">
            <select-dict
              v-model="dataJson.tempJson.delivery_type"
              :value="dataJson.tempJson.delivery_type"
              :para="CONSTANTS.DICT_B_PO_CONTRACT_DELIVERY_TYPE"
              init-placeholder="请选择"
              style="width:100%"
            />
          </el-descriptions-item>

          <el-descriptions-item label="结算方式">
            <select-dict
              v-model="dataJson.tempJson.settle_type"
              :value="dataJson.tempJson.settle_type"
              :para="CONSTANTS.DICT_B_PO_CONTRACT_SETTLE_TYPE"
              init-placeholder="请选择"
              style="width:100%"
            />
          </el-descriptions-item>

          <el-descriptions-item label="结算单据类型">
            <select-dict
              v-model="dataJson.tempJson.bill_type"
              :value="dataJson.tempJson.bill_type"
              :para="CONSTANTS.DICT_B_PO_CONTRACT_BILL_TYPE"
              init-placeholder="请选择"
              style="width:100%"
            />
          </el-descriptions-item>

          <el-descriptions-item label="付款方式">
            <select-dict
              v-model="dataJson.tempJson.payment_type"
              :value="dataJson.tempJson.payment_type"
              :para="CONSTANTS.DICT_B_PO_CONTRACT_PAYMENT_TYPE"
              init-placeholder="请选择"
              style="width:100%"
            />
          </el-descriptions-item>

          <el-descriptions-item label="交货地点">
            <el-input
              v-model.trim="dataJson.tempJson.delivery_location"
              clearable
              :maxlength="dataJson.inputSettings.maxLength.delivery_location"
            />
          </el-descriptions-item>

          <el-descriptions-item label="合同总金额">
            {{ dataJson.tempJson.contract_amount_sum == null || dataJson.tempJson.contract_amount_sum === ''?'-':formatNumber(dataJson.tempJson.contract_amount_sum,true,4) }}
          </el-descriptions-item>

          <el-descriptions-item label="总采购数量（吨）">
            {{ dataJson.tempJson.contract_total == null || dataJson.tempJson.contract_total === '' ?'-':formatNumber(dataJson.tempJson.contract_total,true,4) }}
          </el-descriptions-item>
          <!-- <el-descriptions-item v-if="isViewModel" label="已结算数量（吨）">
            {{ dataJson.tempJson.settle_qty == null || dataJson.tempJson.settle_qty === '' ? '-' : dataJson.tempJson.settle_qty }}
          </el-descriptions-item>-->
          <el-descriptions-item label="总税额">
            {{ dataJson.tempJson.tax_amount_sum == null || dataJson.tempJson.tax_amount_sum === ''?'-':formatNumber(dataJson.tempJson.tax_amount_sum,true,4) }}
          </el-descriptions-item>

          <el-descriptions-item label="审批后自动生成订单">
            <select-dict
              v-model="dataJson.tempJson.auto_create_order"
              :value="dataJson.tempJson.auto_create_order"
              :para="CONSTANTS.DICT_B_PO_CONTRACT_AUTO_CREATE_ORDER"
              init-placeholder="请选择"
              style="width:100%"
            />
          </el-descriptions-item>

          <el-descriptions-item label="备注">
            <el-input
              v-model.trim="dataJson.tempJson.remark"
              clearable
              :maxlength="dataJson.inputSettings.maxLength.remark"
            />
          </el-descriptions-item>

        </el-descriptions>
        <br>
        <el-alert
          title="合同附件"
          type="info"
          :closable="false"
        />
        <br>

        <el-descriptions
          title=""
          :column="1"
          :label-style="fileLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="其他材料">
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col :span="1">
                <Simple-upload-mutil-file
                  :accept="'*'"
                  @upload-success="handleOtherUploadFileSuccess"
                  @upload-error="handleFileError"
                />
              </el-col>
              <el-col
                v-for="(item, i) in dataJson.doc_att"
                :key="i"
                :offset="1"
                :span="3"
              >
                <previewCard
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeOtherFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>
        </el-descriptions>
        <br>

        <br>
        <el-alert
          title="商品信息"
          type="info"
          :closable="false"
        />
        <br>
        <el-button-group>
          <el-button
            type="primary"
            icon="el-icon-circle-plus-outline"
            :loading="settings.loading"
            @click="handleGoodsInsert"
          >新增</el-button>

          <el-button
            :disabled="settings.btnTableDisabledStatus.disabledUpdate"
            type="primary"
            icon="el-icon-edit-outline"
            :loading="settings.loading"
            @click="handleGoodsEdit"
          >编辑</el-button>

          <el-button
            :disabled="settings.btnTableDisabledStatus.disabledDelete"
            type="primary"
            icon="el-icon-circle-close"
            :loading="settings.loading"
            @click="handleGoodsDelete"
          >删除</el-button>
        </el-button-group>

        <br>
        <el-table
          ref="multipleTable"
          v-loading="settings.loading"
          :data="dataJson.tempJson.detailListData"
          :element-loading-text="'正在拼命加载中...'"
          element-loading-background="rgba(255, 255, 255, 0.5)"
          :height="settings.tableHeight"
          stripe
          border
          fit
          highlight-current-row
          :default-sort="{prop: 'u_time', order: 'descending'}"
          style="width: 100%"
          @row-click="handleRowClick"
          @current-change="handleCurrentChange"
        >
          <el-table-column
            type="index"
            width="45"
            label="No"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="sku_code"
            label="物料编码"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="sku_name"
            label="物料名称"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="pm"
            label="品名"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="spec"
            label="规格"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="qty"
            label="合同数量"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.qty == null? '-' : formatNumber(scope.row.qty,true,4) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="price"
            label="单价（含税）"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.price == null? '': formatNumber(scope.row.price, true,4) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="amount"
            label="金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.amount == null?formatNumber(scope.row.qty*scope.row.price,true,4): formatNumber(scope.row.amount,true,4) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="tax_rate"
            label="税率（%）"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.tax_rate == null? '': scope.row.tax_rate }}%
            </template>
          </el-table-column>

          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="tax_amount"
            label="税额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.tax_amount == null? '': formatNumber(scope.row.tax_amount,true,4) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="origin"
            label="产地"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.origin == null ? '': scope.row.origin }}
            </template>
          </el-table-column>
        </el-table>

      </el-form>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />

      <el-button
        v-show="settings.btnShowStatus.showInsert"
        size="medium"
        type="primary"
        :disabled="settings.loading"
        @click="startProcess()"
      >提交审批并保存</el-button>
      <el-button
        size="medium"
        :disabled="settings.loading"
        @click="handleCancel()"
      >返回</el-button>
    </div>

    <!--供应商-->
    <supplier-dialog
      v-if="popSettingsData.supplierDialogData.visible"
      :visible="popSettingsData.supplierDialogData.visible"
      :data="popSettingsData.supplierDialogData.data"
      :title="'供应商选择'"
      @closeMeOk="handleSupplierCloseOk"
      @closeMeCancel="handleSupplierCloseCancel"
    />

    <!--主体企业-->
    <supplier-dialog
      v-if="popSettingsData.purchaserDialogData.visible"
      :visible="popSettingsData.purchaserDialogData.visible"
      :data="popSettingsData.purchaserDialogData.data"
      :title="'主体企业选择'"
      @closeMeOk="handlePurchaserCloseOk"
      @closeMeCancel="handlePurchaserCloseCancel"
    />

    <goods-dialog
      v-if="popSettingsData.goodsDialog.visible"
      :dialog-status="popSettingsData.goodsDialog.dialogStatus"
      :visible="popSettingsData.goodsDialog.visible"
      :data="popSettingsData.goodsDialog.data"
      @closeMeOk="handleGoodsCloseOk"
      @closeMeCancel="handleGoodsCloseCancel"
    />

    <!-- 审批流程设置：选择人 -->
    <bpm-dialog
      v-if="popSettingsData.sponsorDialog.visible"
      :visible="popSettingsData.sponsorDialog.visible"
      :form-data="popSettingsData.sponsorDialog.form_data"
      :serial-type="popSettingsData.sponsorDialog.serial_type"
      @closeMeCancel="handleBpmDialogCancel"
      @closeMeOk="handleBpmDialogOk"
    />

  </div>
</template>

<style scoped>
.edit-container {
  height: calc(100vh - 160px);
  overflow-x: auto;
}
.dialog-footer {
  text-align: center;
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
.el-input-group__append_select,
.el-input-group__append {
  color: #ffffff;
  background-color: #1890ff;
  border-color: #1890ff;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}
br {
  display: block;
  margin: 10px;
  content: ' ';
}
.form-items-container {
  display: flex;
  align-items: center;
}

.left-side {
  flex: 9; /* 或者你想要的更高的值，表示左边占据较多的空间 */
}

.right-side {
  flex: 1; /* 或者你想要的更低的值，表示右边占据较少的空间 */
  margin-left: 5px;
}
</style>

<script>
import SelectDict from '@/components/00_dict/select/SelectDict'
import InputSearch from '@/components/40_input/inputSearch'
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { insertApi, validateApi } from '@/api/40_business/10_po/pocontract/pocontract'
import SupplierDialog from '@/views/20_master/enterprise/dialog/list/index.vue'
import constants_dict from '@/common/constants/constants_dict'
import GoodsDialog from '@/views/00_platform/dialog/sku/new/goodsdialog.vue'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'
import { EventBus } from '@/common/eventbus/eventbus'
export default {
  directives: { elDragDialog },
  components: { BpmDialog, PreviewCard, SimpleUploadMutilFile, GoodsDialog, SupplierDialog, InputSearch, SelectDict },
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
    editStatus: {
      type: String,
      default: constants_para.STATUS_INSERT
    }
  },
  data () {
    return {
      contentStyle: {
        width: '15%'
      },
      labelStyle: {
        width: '10%',
        'text-align': 'right'
      },
      fileLabelStyle: {
        width: '2.3%',
        'text-align': 'right'
      },
      // 监听器
      watch: {
        unwatch_tempJson: null,
        unwatch_actual_count: null,
        unwatch_actual_price: null,
        'dataJson.tempJson.unit_id': {
          handler (newVal, oldVal) {
            console.log(newVal)
          }
        }
      },
      popSettingsData: {
        // 弹出窗口状态名称
        dialogStatus: '',
        dialogFormVisible: false,
        btnDisabledStatus: {
          disabledOK: false
        },
        // 弹出的商品查询框参数设置
        goodsDialog: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 供应商
        supplierDialogData: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 主体企业
        purchaserDialogData: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 审批流程
        sponsorDialog: {
          // 弹出框显示参数
          visible: false,
          form_data: { },
          serial_type: constants_dict.DICT_B_PO_CONTRACT,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          },
          // 审批流程
          initial_process: null,
          // 自选用户
          process_users: {}
        }
      },
      dataJson: {
        unitConvertList: [],
        // 用于监听
        actual_count: 0,
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          detailListData: [],
          contract_code: '',
          type: '',
          supplier_name: '',
          purchaser_name: ''
        },
        // 单条数据 json
        tempJson: {
          detailListData: []
        },
        searchForm: {
          reset: false,
          owner_id: undefined,
          owner_name: ''
        },
        inputSettings: {
          maxLength: {
            contract_code: 20,
            delivery_location: 100,
            remark: 100
          }
        },
        // 其他文件附件
        doc_att: [],
        doc_att_file: [],
        doc_att_files: []
      },
      // 页面设置json
      settings: {
        // 皮重毛重开关控制
        weight_control_config: false,
        // loading 状态
        loading: true,
        btnUnitStatus: {
          // 关于单位的按钮显示
          showUnit: false,
          showInsert: false
        },
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
        // 按钮状态：是否可用，false:可用，true不可用
        btnTableDisabledStatus: {
          disabledInsert: true,
          disabledUpdate: true,
          disabledDelete: true
        },
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: this.editStatus,
        // pop的check内容
        rules: {
          contract_code: [
            { required: true, message: '请填写合同编号', trigger: 'change' }
          ],
          type: [
            { required: true, message: '请选择合同类型', trigger: 'change' }
          ],
          supplier_name: [
            { required: true, message: '请选择供应商', trigger: 'change' }
          ],
          purchaser_name: [
            { required: true, message: '请选择主体企业', trigger: 'change' }
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
      this.dataJson.tempJson = this.data

      this.initButtonShowStatus()
      this.initButtonDisabledStatus()
      this.initInsertModel()

      // 初始化watch
      this.setWatch()
      this.settings.loading = false
    },
    initTempJsonOriginal () {
      // 单条数据 json的，初始化原始数据
      this.dataJson.tempJsonOriginal = this.$options.data.call(this).dataJson.tempJsonOriginal
    },
    initButtonShowStatus () {
      // 初始化按钮状态：默认都隐藏
      this.settings.btnShowStatus = this.$options.data.call(this).settings.btnShowStatus
    },
    initButtonDisabledStatus () {
      // 按钮状态初始化：默认不可用
      this.settings.btnDisabledStatus = this.$options.data.call(this).settings.btnDisabledStatus
    },
    // 新增时的初始化
    initInsertModel () {
      // 数据初始化
      this.initTempJsonOriginal()
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)

      // 设置按钮
      this.settings.btnShowStatus.showInsert = true
      // 控件focus
      this.$nextTick(() => {
        // this.$refs['refFocusOne'].focus()
      })
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
      if (this.watch.unwatch_actual_count) {
        this.watch.unwatch_actual_count()
      }
      if (this.watch.unwatch_actual_price) {
        this.watch.unwatch_actual_price()
      }
    },
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 新增
    doInsert () {
      // 开始综合验证
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)
          // 审批流程启动数据
          tempData.initial_process = this.popSettingsData.sponsorDialog.initial_process // 流程
          tempData.form_data = this.popSettingsData.sponsorDialog.form_data // 表单参数
          tempData.process_users = this.popSettingsData.sponsorDialog.process_users // 自选用户

          if (tempData.detailListData == null || tempData.detailListData.length === 0) {
            this.showErrorMsg('至少选择一个商品')
            this.closeLoading()
            return
          }

          this.settings.loading = true
          insertApi(tempData)
            .then(
              _data => {
                this.closeLoading()
                this.$emit('closeMeOk', _data.data)
                // 通知兄弟组件，新增数据更新
                EventBus.$emit(this.EMITS.EMIT_MST_POCONTRACT_NEW_OK, _data.data)
                this.$notify({
                  title: '新增成功',
                  message: _data.data.message,
                  type: 'success',
                  duration: this.settings.duration
                })
              },
              _error => {
                this.closeLoading()
                this.$notify({
                  title: '新增失败',
                  message: _error.error.message,
                  type: 'error',
                  duration: this.settings.duration
                })
              }
            )
            .finally(() => {
              this.closeLoading()
            })
        } else {
          this.closeLoading()
        }
      })
    },
    handleRowClick (row) {
      this.popSettingsData.goodsDialog.rowIndex = this.getRowIndex(row)
    },
    // 获取行索引
    getRowIndex (row) {
      const _index = this.dataJson.tempJson.detailListData.lastIndexOf(row)
      return _index
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
      this.settings.btnTableDisabledStatus.disabledInsert = false
      this.settings.btnTableDisabledStatus.disabledUpdate = false
      this.settings.btnTableDisabledStatus.disabledDelete = false
    },
    // 商品数据选择
    handleGoodsInsert () {
      // 新增
      this.popSettingsData.goodsDialog.dialogStatus = this.PARAMETERS.STATUS_INSERT
      this.popSettingsData.goodsDialog.visible = true
    },
    // 商品数据删除
    handleGoodsDelete () {
      if (this.dataJson.rowIndex === null) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 删除
      this.$confirm('是否确认删除该条数据', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        // 设置到table中绑定的json数据源
        this.dataJson.tempJson.detailListData.splice(this.popSettingsData.goodsDialog.rowIndex, 1)

        this.dataJson.tempJson.contract_amount_sum = 0
        this.dataJson.tempJson.contract_total = 0
        this.dataJson.tempJson.tax_amount_sum = 0
        this.dataJson.tempJson.detailListData.forEach(element => {
          this.dataJson.tempJson.contract_amount_sum += element.qty * element.price
          this.dataJson.tempJson.contract_total += element.qty
          this.dataJson.tempJson.tax_amount_sum += element.tax_amount
        })
      }).catch(action => {

      })
    },
    // 商品数据编辑
    handleGoodsEdit () {
      if (this.dataJson.rowIndex === null) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 编辑
      this.popSettingsData.goodsDialog.data = deepCopy(this.dataJson.currentJson)

      this.popSettingsData.goodsDialog.dialogStatus = this.PARAMETERS.STATUS_UPDATE
      this.popSettingsData.goodsDialog.visible = true
    },
    // 商品选择完成
    handleGoodsCloseOk (val) {
      if (val.edit_status === this.PARAMETERS.STATUS_INSERT) {
        this.doGoodsInsert(val)
      } else if (val.edit_status === this.PARAMETERS.STATUS_UPDATE) {
        this.doGoodsUpdate(val)
      }
    },
    doGoodsInsert (val) {
      if (val.return_flag) {
        this.popSettingsData.goodsDialog.visible = false
        // 设置到table中绑定的json数据源
        this.dataJson.tempJson.detailListData.push(val.data)
        this.dataJson.tempJson.contract_amount_sum = 0
        this.dataJson.tempJson.contract_total = 0
        this.dataJson.tempJson.tax_amount_sum = 0
        this.dataJson.tempJson.detailListData.forEach(element => {
          this.dataJson.tempJson.contract_amount_sum += element.qty * element.price
          this.dataJson.tempJson.contract_total += element.qty
          this.dataJson.tempJson.tax_amount_sum += element.tax_amount
        })
        this.$notify({
          title: '新增处理成功',
          message: val.data.message,
          type: 'success',
          duration: this.settings.duration
        })
      } else {
        this.$notify({
          title: '新增处理失败',
          message: val.error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }
    },
    doGoodsUpdate (val) {
      if (val.return_flag) {
        this.popSettingsData.goodsDialog.visible = false
        // 设置到table中绑定的json数据源
        this.dataJson.tempJson.detailListData.splice(val.data.index, 1, val.data)
        this.dataJson.tempJson.contract_amount_sum = 0
        this.dataJson.tempJson.contract_total = 0
        this.dataJson.tempJson.tax_amount_sum = 0
        this.dataJson.tempJson.detailListData.forEach(element => {
          this.dataJson.tempJson.contract_amount_sum += element.qty * element.price
          this.dataJson.tempJson.contract_total += element.qty
          this.dataJson.tempJson.tax_amount_sum += element.tax_amount
        })
        this.$notify({
          title: '更新处理成功',
          message: val.data.message,
          type: 'success',
          duration: this.settings.duration
        })
      } else {
        this.$notify({
          title: '更新处理失败',
          message: val.error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }
    },
    // 商品取消
    handleGoodsCloseCancel () {
      this.popSettingsData.goodsDialog.visible = false
    },
    // 供应商
    handleSupplierDialog () {
      this.popSettingsData.supplierDialogData.visible = true
      this.popSettingsData.supplierDialogData.data.status = constants_dict.DICT_M_ENTERPRISE_STATUS_TWO
      this.popSettingsData.supplierDialogData.data.type_ids = [constants_dict.DICT_M_ENTERPRISE_TYPE_TWO]
    },
    // 供应商：关闭对话框：确定
    handleSupplierCloseOk (val) {
      this.popSettingsData.supplierDialogData.selectedDataJson = val
      this.dataJson.tempJson.supplier_id = val.id
      this.dataJson.tempJson.supplier_code = val.code
      this.dataJson.tempJson.supplier_name = val.name
      this.popSettingsData.supplierDialogData.visible = false
    },
    // 供应商：关闭对话框：取消
    handleSupplierCloseCancel () {
      this.popSettingsData.supplierDialogData.visible = false
    },
    // 主体企业
    handlePurchaserDialog () {
      this.popSettingsData.purchaserDialogData.visible = true
      this.popSettingsData.purchaserDialogData.data.status = constants_dict.DICT_M_ENTERPRISE_STATUS_TWO
      // this.popSettingsData.supplierDialogData.data.type_ids = [constants_dict.DICT_M_ENTERPRISE_TYPE_TWO]
    },
    // 主体企业：关闭对话框：确定
    handlePurchaserCloseOk (val) {
      this.popSettingsData.purchaserDialogData.selectedDataJson = val
      this.dataJson.tempJson.purchaser_id = val.id
      this.dataJson.tempJson.purchaser_code = val.code
      this.dataJson.tempJson.purchaser_name = val.name
      this.popSettingsData.purchaserDialogData.visible = false
    },
    // 主体企业：关闭对话框：取消
    handlePurchaserCloseCancel () {
      this.popSettingsData.purchaserDialogData.visible = false
    },
    // 其他附件上传成功
    handleOtherUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.doc_att.push(res.response.data)
      this.dataJson.doc_att_file.push(res.response.data.url)
      this.dataJson.tempJson.doc_att_files = this.dataJson.doc_att
    },
    // 其他附件附件文件
    removeOtherFile (val) {
      // 获取下标
      const _index = this.dataJson.doc_att_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.doc_att.splice(_index, 1)
      this.dataJson.doc_att_file.splice(_index, 1)
      this.dataJson.tempJson.doc_att_files = this.dataJson.doc_att
    },
    // 上传失败
    handleFileError () {
      console.debug('文件上传失败')
      this.$notify({
        title: '上传错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
      })
    },
    /**
     * 校验数据 获取审批流程
     */
    startProcess () {
      this.showLoading('正在查询，请稍后...')
      // 校验业务数据
      const tempData = deepCopy(this.dataJson.tempJson)
      tempData.check_type = constants_para.INSERT_CHECK_TYPE

      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          validateApi(tempData).then(_data => {
            if (_data.success) {
              // 获取审批流程
              this.getFlow()
            } else {
              this.closeLoading()
              this.$notify({
                title: '校验失败',
                message: _data.data.message,
                type: 'error',
                duration: this.settings.duration
              })
            }
          }).catch(error => {
            console.log('校验出错', error)
            this.closeLoading()
          })
        } else {
          this.closeLoading()
        }
      })
    },
    /**
     * 获取审批流程
     */
    getFlow () {
      // 校验是否存在审批流程
      getFlowProcessApi({ 'serial_type': this.popSettingsData.sponsorDialog.serial_type })
        .then((rsp) => {
          if (rsp.data === null) {
            this.$message.error('未找到审批流程，请联系管理员')
          } else {
            // 流程参数
            this.popSettingsData.sponsorDialog.form_data = {}
            // 启动审批流弹窗
            this.popSettingsData.sponsorDialog.visible = true
          }
        }).catch((err) => {
          this.closeLoading()
          this.$message.error(err)
        }).finally(() => {
          this.closeLoading()
        })
    },
    // 取消
    handleBpmDialogCancel () {
      this.popSettingsData.sponsorDialog.visible = false
      this.closeLoading()
    },
    // 审批流确定
    handleBpmDialogOk (data) {
      this.popSettingsData.sponsorDialog.initial_process = data.processData
      this.popSettingsData.sponsorDialog.process_users = data.process_users
      this.popSettingsData.sponsorDialog.visible = false
      this.doInsert()
    }
  }

}
</script>
