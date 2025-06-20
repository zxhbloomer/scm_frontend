<template>
  <div class="app-container">
    <div>
      <el-form
        ref="dataSubmitForm"
        :rules="settings.rules"
        :model="dataJson.tempJson"
        label-position="right"
        label-width="150px"
        status-icon
      >
        <el-alert
          title="项目信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item label="项目编号">
            {{ data && data.code ? data.code : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="项目名称">
            {{ data && data.name ? data.name : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="业务类型">
            {{ data && data.type_name ? data.type_name : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="附件材料">
            <PreviewDescription
              v-if="dataJson.project_doc_att_files && dataJson.project_doc_att_files.length > 0"
              :attachment-files="dataJson.project_doc_att_files"
            />
          </el-descriptions-item>
        </el-descriptions>
        <el-alert
          title="采购合同信息"
          type="info"
          :closable="false"
        />
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
            系统自动生成
          </el-descriptions-item>

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
                placeholder="请输入"
                :maxlength="dataJson.inputSettings.maxLength.contract_code"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              合同类型
            </div>
            <el-form-item
              prop="type"
              label-width="0"
            >
              <radio-dict
                v-model="dataJson.tempJson.type"
                :value="dataJson.tempJson.type"
                :para="CONSTANTS.DICT_B_PO_CONTRACT_TYPE"
                @change="handleTypeChange"
              />
            </el-form-item>
          </el-descriptions-item>

          <!--供应商-->
          <el-descriptions-item label="供应商">
            {{ dataJson.tempJson.supplier_name }}
          </el-descriptions-item>

          <!--主体企业-->
          <el-descriptions-item label="主体企业">
            {{ dataJson.tempJson.purchaser_name }}
          </el-descriptions-item>

          <!--付款方式-->
          <el-descriptions-item>
            <div
              slot="label"
            >
              付款方式
            </div>
            <el-form-item
              prop="payment_type"
              label-width="0"
            >
              <radio-dict
                v-model="dataJson.tempJson.payment_type"
                :value="dataJson.tempJson.payment_type"
                :para="CONSTANTS.DICT_B_PO_CONTRACT_PAYMENT_TYPE"
                @change="handlePaymentTypeChange"
              />
            </el-form-item>
          </el-descriptions-item>

          <!--结算方式-->
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              结算方式
            </div>
            <el-form-item
              prop="settle_type"
              label-width="0"
            >
              <radio-dict
                v-model="dataJson.tempJson.settle_type"
                :value="dataJson.tempJson.settle_type"
                :para="CONSTANTS.DICT_B_PO_CONTRACT_SETTLE_TYPE"
                @change="handleSettleTypeChange"
              />
            </el-form-item>
          </el-descriptions-item>

          <!--结算单据类型-->
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              结算单据类型
            </div>
            <el-form-item
              prop="bill_type"
              label-width="0"
            >
              <radio-dict
                v-model="dataJson.tempJson.bill_type"
                :value="dataJson.tempJson.bill_type"
                :para="CONSTANTS.DICT_B_PO_CONTRACT_BILL_TYPE"
                @change="handleBillTypeChange"
              />
            </el-form-item>
          </el-descriptions-item>

          <!--运输方式-->
          <el-descriptions-item label="运输方式">
            <radio-dict
              v-model="dataJson.tempJson.delivery_type"
              :value="dataJson.tempJson.delivery_type"
              :para="CONSTANTS.DICT_B_PO_CONTRACT_DELIVERY_TYPE"
              @change="handleDeliveryTypeChange"
            />
          </el-descriptions-item>

          <!--到期日期-->
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

          <el-descriptions-item label="审批后自动生成订单">
            <select-dict
              v-model="dataJson.tempJson.auto_create_order"
              :value="dataJson.tempJson.auto_create_order"
              :para="CONSTANTS.DICT_B_PO_CONTRACT_AUTO_CREATE_ORDER"
              init-placeholder="请选择"
              style="width:100%"
              :disabled="true"
            />
          </el-descriptions-item>

          <el-descriptions-item label="交货地点">
            <el-input
              v-model.trim="dataJson.tempJson.delivery_location"
              clearable
              placeholder="请输入"
              :maxlength="dataJson.inputSettings.maxLength.delivery_location"
            />
          </el-descriptions-item>

          <el-descriptions-item label="备注">
            <el-input
              v-model.trim="dataJson.tempJson.remark"
              clearable
              placeholder="请输入"
              :maxlength="dataJson.inputSettings.maxLength.remark"
            />
          </el-descriptions-item>

          <el-descriptions-item label="合同总金额">
            <span class="fontWeight">
              {{ dataJson.tempJson.contract_amount_sum == null || dataJson.tempJson.contract_amount_sum === ''?'-':formatCurrency(dataJson.tempJson.contract_amount_sum,true) }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="总采购数量（吨）">
            <span class="fontWeight">
              {{ dataJson.tempJson.contract_total == null || dataJson.tempJson.contract_total === '' ?'-':formatNumber(dataJson.tempJson.contract_total,true,4) }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="总税额">
            <span class="fontWeight">
              {{ dataJson.tempJson.tax_amount_sum == null || dataJson.tempJson.tax_amount_sum === ''?'-':formatCurrency(dataJson.tempJson.tax_amount_sum,true) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="合同附件材料">
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
                :span="4"
              >
                <preview-card
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeOtherFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>
        </el-descriptions>

        <el-alert
          title="商品信息"
          type="info"
          :closable="false"
        />
        <el-button-group>
          <el-button
            type="primary"
            icon="el-icon-circle-plus-outline"
            :loading="settings.loading"
            @click="handleGoodsInsert"
          >新增</el-button>
          <el-button
            :disabled="settings.btnTableDisabledStatus.disabledDelete"
            type="primary"
            icon="el-icon-circle-close"
            :loading="settings.loading"
            @click="handleGoodsDelete"
          >删除</el-button>
        </el-button-group>

        <el-table
          ref="multipleTable"
          v-loading="settings.loading"
          :data="dataJson.tempJson.detailListData"
          :element-loading-text="'正在拼命加载中...'"
          element-loading-background="rgba(255, 255, 255, 0.5)"
          height="200px"
          stripe
          border
          fit
          highlight-current-row
          :default-sort="{prop: 'u_time', order: 'descending'}"
          style="width: calc(100% - 20px )"
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
            min-width="150"
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
            min-width="50"
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
              {{ scope.row.price == null? '': formatCurrency(scope.row.price, true) }}
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
              {{ scope.row.amount == null? '' : formatCurrency(scope.row.amount,true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="90"
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
              {{ scope.row.tax_amount == null? '': formatCurrency(scope.row.tax_amount,true) }}
            </template>
          </el-table-column>

          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="origin"
            label="产地"
          >
            <template v-slot="scope">
              {{ scope.row.origin == null ? '': scope.row.origin }}
            </template>
          </el-table-column>
        </el-table>
      </el-form>

      <!--商品-->
      <goods-dialog
        v-if="popSettingsData.goodsDialog.visible"
        :visible="popSettingsData.goodsDialog.visible"
        :data="popSettingsData.goodsDialog.data"
        :title="'商品选择'"
        @closeMeOk="handleGoodsCloseOk"
        @closeMeCancel="handleGoodsCloseCancel"
      />

      <!--bpm流程弹窗-->
      <bpm-dialog
        v-if="popSettingsData.sponsorDialog.visible"
        :visible="popSettingsData.sponsorDialog.visible"
        :form-data="popSettingsData.sponsorDialog.form_data"
        :serial-type="popSettingsData.sponsorDialog.serial_type"
        @closeMeOk="handleBpmDialogOk"
        @closeMeCancel="handleBpmDialogCancel"
      />

    </div>
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
.el-descriptions {
  margin-top: 10px;
  margin-bottom: 10px;
}
.el-button-group {
  margin-top: 10px;
  margin-left: 10px;
}
.el-table {
  margin: 10px;
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
.fontWeight {
  font-weight: bold;
  color: #1890ff;
}
</style>

<script>
import SelectDict from '@/components/00_dict/select/SelectDict'
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { insertApi, validateApi } from '@/api/40_business/pocontract/pocontract'
import { getApi } from '@/api/40_business/project/project'

import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import constants_dict from '@/common/constants/constants_dict'
import GoodsDialog from '@/views/00_platform/dialog/sku/new/goodsdialog.vue'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import PreviewDescription from '@/components/51_preview_description/index.vue'
import RadioDict from '@/components/00_dict/redio'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'

export default {
  directives: { elDragDialog }, components: {
    RadioDict,
    PreviewCard,
    PreviewDescription,
    SimpleUploadMutilFile,
    GoodsDialog,
    SelectDict,
    BpmDialog
  },
  mixins: [],
  props: {
    data: {
      type: Object,
      default: null
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
        unwatch_detail_qty: null
      },
      popSettingsData: {
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
        // bpm对话框
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
        // 当前表格中的索引，第几条
        rowIndex: 0,
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          code: '',
          contract_code: '',
          type: '',
          supplier_id: null,
          supplier_name: '',
          supplier_code: '',
          purchaser_id: null,
          purchaser_name: '',
          purchaser_code: '',
          payment_type: '1',
          expiry_date: null,
          delivery_date: null,
          sign_date: null,
          auto_create_order: '1',
          delivery_location: '',
          remark: '',
          project_id: null,
          project_code: '',
          detailListData: [],
          contract_amount_sum: 0,
          contract_total: 0,
          tax_amount_sum: 0,
          settle_type: undefined,
          bill_type: undefined,
          delivery_type: undefined,
          project: null
        },
        // 单条数据 json
        tempJson: {
          id: undefined,
          code: '',
          contract_code: '',
          type: '',
          supplier_id: null,
          supplier_name: '',
          supplier_code: '',
          purchaser_id: null,
          purchaser_name: '',
          purchaser_code: '',
          payment_type: '1',
          expiry_date: null,
          delivery_date: null,
          sign_date: null,
          auto_create_order: '1',
          delivery_location: '',
          remark: '',
          project_id: null,
          project_code: '',
          detailListData: [],
          contract_amount_sum: 0,
          contract_total: 0,
          tax_amount_sum: 0,
          settle_type: undefined,
          bill_type: undefined,
          delivery_type: undefined,
          project: null
        },
        // 附件
        doc_att: [],
        project_doc_att: [],
        project_doc_att_file: [],
        project_doc_att_files: [],
        inputSettings: {
          maxLength: {
            contract_code: 50,
            delivery_location: 200,
            remark: 500
          }
        }
      }, // 页面设置json
      settings: {
        // loading 状态
        loading: false,
        // 消息显示时长
        duration: 2000,
        // 表格按钮状态：是否可用
        btnTableDisabledStatus: {
          disabledUpdate: true,
          disabledDelete: true
        },
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
          ],
          settle_type: [
            { required: true, message: '请选择结算方式', trigger: 'change' }
          ],
          bill_type: [
            { required: true, message: '请选择结算单据类型', trigger: 'change' }
          ]
        }
      }
    }
  },
  computed: {
  },
  // 监听器
  watch: {},
  created () {
  },
  mounted () {
    // 描绘完成
    // 初始化
    this.init()
  },
  destroyed () {
    this.unWatch()
  },
  methods: {
    // 初始化处理
    init () {
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)
      this.getData()
      this.settings.loading = false
    },
    // 设置监听器
    setWatch () {
      this.unWatch()
      // 监听数量和单价变化，自动计算金额
      this.watch.unwatch_detail_qty = this.$watch(
        'dataJson.tempJson.detailListData',
        (newVal, oldVal) => {
          if (newVal && newVal.length > 0) {
            newVal.forEach((item, index) => {
              if (item.qty && item.price) {
                // 计算金额
                item.amount = (parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0)
                // 计算税额
                const taxRate = parseFloat(item.tax_rate) || 0
                item.tax_amount = item.amount * (taxRate / 100)
              }
            })
            // 重新计算总计
            this.sumData()
          }
        },
        { deep: true }
      )
    },
    // 销毁监听器
    unWatch () {
      this.watch.unwatch_detail_qty = null
    },
    getData () {
      // 查询逻辑
      this.settings.loading = true
      getApi(this.data).then(response => {
        this.dataJson.tempJson.project = deepCopy(response.data)
        this.dataJson.tempJsonOriginal.project = deepCopy(response.data)
        this.dataJson.tempJson.detailListData = [...response.data.detailListData]

        this.dataJson.tempJson.supplier_id = response.data.supplier_id
        this.dataJson.tempJson.supplier_name = response.data.supplier_name
        this.dataJson.tempJson.supplier_code = response.data.supplier_code
        this.dataJson.tempJson.purchaser_id = response.data.purchaser_id
        this.dataJson.tempJson.purchaser_name = response.data.purchaser_name
        this.dataJson.tempJson.purchaser_code = response.data.purchaser_code
        this.dataJson.tempJson.purchaser_code = response.data.purchaser_code
        this.dataJson.tempJson.delivery_type = response.data.delivery_type

        // 合同附件
        this.dataJson.project_doc_att_files = this.dataJson.tempJson.project.doc_att_files
        if (this.dataJson.project_doc_att_files != null && this.dataJson.project_doc_att_files.length > 0) {
          this.dataJson.tempJson.project_doc_att_files.forEach(item => {
            this.dataJson.project_doc_att_file.push(item.url)
          })
        } else {
          this.dataJson.project_doc_att = []
          this.dataJson.project_doc_att_file = []
          this.dataJson.project_doc_att_files = []
        }
      }).finally(() => {
        // 清除附件，因为以下字典是为订单附件服务
        this.dataJson.doc_att = []
        this.dataJson.doc_att_file = []
        this.dataJson.doc_att_files = []
        this.settings.loading = false
      })
    },
    // 计算总金额
    sumData () {
      if (!this.dataJson.tempJson.detailListData || this.dataJson.tempJson.detailListData.length === 0) {
        this.dataJson.tempJson.total_amount = 0
        this.dataJson.tempJson.total_tax_amount = 0
        this.dataJson.tempJson.total_amount_with_tax = 0
        return
      }

      let totalAmount = 0
      let totalTaxAmount = 0

      this.dataJson.tempJson.detailListData.forEach(item => {
        const amount = parseFloat(item.amount) || 0
        const taxAmount = parseFloat(item.tax_amount) || 0

        totalAmount += amount
        totalTaxAmount += taxAmount
      })

      this.dataJson.tempJson.total_amount = totalAmount.toFixed(2)
      this.dataJson.tempJson.total_tax_amount = totalTaxAmount.toFixed(2)
      this.dataJson.tempJson.total_amount_with_tax = (totalAmount + totalTaxAmount).toFixed(2)
    },
    // 供应商选择弹窗
    handleSupplierDialog () {
      this.popSettingsData.supplierDialogData.visible = true
      this.popSettingsData.supplierDialogData.data = {}
    },
    handleSupplierCloseOk (data) {
      this.popSettingsData.supplierDialogData.visible = false
      if (data && data.length > 0) {
        const supplier = data[0]
        this.dataJson.tempJson.supplier_id = supplier.id
        this.dataJson.tempJson.supplier_code = supplier.code
        this.dataJson.tempJson.supplier_name = supplier.name
      }
    },
    handleSupplierCloseCancel () {
      this.popSettingsData.supplierDialogData.visible = false
    },
    // 主体企业选择弹窗
    handlePurchaserDialog () {
      this.popSettingsData.purchaserDialogData.visible = true
      this.popSettingsData.purchaserDialogData.data = {}
    },
    handlePurchaserCloseOk (data) {
      this.popSettingsData.purchaserDialogData.visible = false
      if (data && data.length > 0) {
        const purchaser = data[0]
        this.dataJson.tempJson.purchaser_id = purchaser.id
        this.dataJson.tempJson.purchaser_code = purchaser.code
        this.dataJson.tempJson.purchaser_name = purchaser.name
      }
    },
    handlePurchaserCloseCancel () {
      this.popSettingsData.purchaserDialogData.visible = false
    },
    // 商品新增
    handleGoodsInsert () {
      this.popSettingsData.goodsDialog.visible = true
      this.popSettingsData.goodsDialog.data = {}
    },
    handleGoodsCloseOk (val) {
      this.popSettingsData.goodsDialog.visible = false
      this.dataJson.tempJson.detailListData.push(val.data)
      this.sumData()
    },
    handleGoodsCloseCancel () {
      this.popSettingsData.goodsDialog.visible = false
    },
    // 商品删除
    handleGoodsDelete () {
      this.$confirm('确认删除选中的商品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 删除选中的商品
        this.dataJson.tempJson.detailListData.splice(this.dataJson.rowIndex, 1)
        this.sumData()
      })
    },
    // 表格行点击
    handleRowClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
    },
    // 获取行索引
    getRowIndex (row) {
      const _index = this.dataJson.tempJson.detailListData.lastIndexOf(row)
      return _index
    },
    // 各种类型变化处理
    /**
     * 类型
     * @param val
     */
    handleTypeChange (val) {
      this.dataJson.tempJson.type = val
    },
    /**
     * 付款方式选择
     * @param val
     */
    handlePaymentTypeChange (val) {
      this.dataJson.tempJson.payment_type = val
    },
    /**
     * 结算方式选择
     * @param val
     */
    handleSettleTypeChange (val) {
      this.dataJson.tempJson.settle_type = val
    },
    /**
     * 结算单据类型选择
     * @param val
     */
    handleBillTypeChange (val) {
      this.dataJson.tempJson.bill_type = val
    },
    /**
     * 运输方式
     * @param val
     */
    handleDeliveryTypeChange (val) {
      this.dataJson.tempJson.delivery_type = val
    },
    // 文件上传处理
    handleOtherUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.doc_att.push(res.response.data)
      this.dataJson.doc_att_file.push(res.response.data.url)
      this.dataJson.tempJson.doc_att_files = this.dataJson.doc_att
    },
    handleFileError () {
      this.$message.error('文件上传失败')
    },
    removeOtherFile (index) {
      this.dataJson.doc_att.splice(index, 1)
    }, // bmp流程处理
    handleBpmDialogOk (data) {
      this.popSettingsData.sponsorDialog.initial_process = data.processData
      this.popSettingsData.sponsorDialog.process_users = data.process_users
      this.popSettingsData.sponsorDialog.visible = false
      this.doInsert()
    },
    handleBpmDialogCancel () {
      this.popSettingsData.sponsorDialog.visible = false
      this.closeLoading()
    }, // 提交流程
    startProcess () {
      this.showLoading('正在保存，请稍后...')
      // 校验业务数据
      const tempData = deepCopy(this.dataJson.tempJson)
      tempData.check_type = constants_para.INSERT_CHECK_TYPE

      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          if (!this.dataJson.tempJson.detailListData || this.dataJson.tempJson.detailListData.length === 0) {
            this.$message.warning('至少选择一个商品')
            this.closeLoading()
            return
          }
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
          }).finally(() => {
            this.closeLoading()
          })
        } else {
          this.closeLoading()
        }
      })
    },
    // 保存数据
    doInsert () {
      const tempData = deepCopy(this.dataJson.tempJson)
      tempData.doc_att = this.dataJson.doc_att
      // 审批流程启动数据
      tempData.initial_process = this.popSettingsData.sponsorDialog.initial_process // 流程
      tempData.form_data = this.popSettingsData.sponsorDialog.form_data // 表单参数
      tempData.process_users = this.popSettingsData.sponsorDialog.process_users // 自选用户
      tempData.id = null
      tempData.project_code = this.data.code
      tempData.doc_att_files = this.dataJson.doc_att

      this.settings.loading = true
      insertApi(tempData)
        .then(
          _data => {
            this.settings.loading = false
            this.$emit('closeMeOk', _data.data)
            this.$notify({
              title: '下推成功',
              message: _data.data.message,
              type: 'success',
              duration: 2000
            })
          },
          _error => {
            this.settings.loading = false
            this.$notify({
              title: '下推失败',
              message: _error.message,
              type: 'error',
              duration: 2000
            })
          }
        )
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
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
      this.settings.btnTableDisabledStatus.disabledUpdate = false
      this.settings.btnTableDisabledStatus.disabledDelete = false
    }
  }
}
</script>
