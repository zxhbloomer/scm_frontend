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
          v-if="dataJson.tempJson.project != null"
          title="项目信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          v-if="dataJson.tempJson.project != null"
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item label="项目编号">
            <el-link
              v-if="dataJson.tempJson.project.code"
              type="primary"
              @click="handleProjectCodeClick(dataJson.tempJson.project.code)"
            >
              {{ dataJson.tempJson.project.code }}
            </el-link>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="项目名称">
            {{ dataJson.tempJson.project.name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="" />
          <el-descriptions-item label="备注" :span="3">
            {{ dataJson.tempJson.project.remark || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="项目附件材料" :span="3">
            <preview-description :attachment-files="dataJson.tempJson.project.doc_att_files" />
          </el-descriptions-item>
        </el-descriptions>
        <el-alert
          title="合同信息"
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

          <el-descriptions-item label="系统编号">
            {{ dataJson.tempJson.code == null || dataJson.tempJson.code === ''?'系统自动生成':dataJson.tempJson.code }}
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
              类型
            </div>
            <el-form-item
              prop="type"
              label-width="0"
            >
              <radio-dict
                v-model="dataJson.tempJson.type"
                :value="dataJson.tempJson.type"
                :para="CONSTANTS.DICT_B_SO_CONTRACT_TYPE"
                @change="handleTypeChange"
              />
            </el-form-item>
          </el-descriptions-item>
          <!--          客户-->
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              客户
            </div>
            <el-form-item
              prop="supplier_name"
              label-width="0"
            >
              <input-search
                v-model.trim="dataJson.tempJson.supplier_name"
                :disabled="dataJson.tempJson.project != null"
                @onInputSearch="handleCustomerDialog"
              />
            </el-form-item>
          </el-descriptions-item>
          <!--销售方-->
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              销售方
            </div>
            <el-form-item
              prop="purchaser_name"
              label-width="0"
            >
              <input-search
                v-model.trim="dataJson.tempJson.purchaser_name"
                :disabled="dataJson.tempJson.project != null"
                @onInputSearch="handleSellerDialog"
              />
            </el-form-item>
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
                :para="CONSTANTS.DICT_B_SO_CONTRACT_PAYMENT_TYPE"
                @change="handlePaymentTypeChange"
              />
            </el-form-item>
          </el-descriptions-item>
          <!--          结算方式-->
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
                :para="CONSTANTS.DICT_B_SO_CONTRACT_SETTLE_TYPE"
                @change="handleSettleTypeChange"
              />
            </el-form-item>
          </el-descriptions-item>
          <!--          结算单据类型-->
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
                :para="CONSTANTS.DICT_B_SO_CONTRACT_BILL_TYPE"
                @change="handleBillTypeChange"
              />
            </el-form-item>
          </el-descriptions-item>
          <!--          运输方式-->
          <el-descriptions-item label="运输方式">
            <radio-dict
              v-model="dataJson.tempJson.delivery_type"
              :value="dataJson.tempJson.delivery_type"
              :para="CONSTANTS.DICT_B_SO_CONTRACT_DELIVERY_TYPE"
              @change="handleDeliveryTypeChange"
            />
          </el-descriptions-item>
          <!--          到期日期-->
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
              :para="CONSTANTS.DICT_B_SO_CONTRACT_AUTO_CREATE_ORDER"
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
          <el-descriptions-item label="总销售数量（吨）">
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
              <Simple-upload-mutil-file
                :accept="'*'"
                @upload-success="handleOtherUploadFileSuccess"
                @upload-error="handleFileError"
              />
            </el-row>
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.doc_att"
                :key="i"
                :offset="0"
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
            label="商品编号"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="goods_name"
            label="商品名称"
          />

          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="sku_name"
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
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />

      <el-button
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
    <!--客户-->
    <customer-dialog
      v-if="popSettingsData.customerDialogData.visible"
      :visible="popSettingsData.customerDialogData.visible"
      :data="popSettingsData.customerDialogData.data"
      :title="'客户选择'"
      @closeMeOk="handleCustomerCloseOk"
      @closeMeCancel="handleCustomerCloseCancel"
    />
    <!--销售方-->
    <customer-dialog
      v-if="popSettingsData.purchaserDialogData.visible"
      :visible="popSettingsData.purchaserDialogData.visible"
      :data="popSettingsData.purchaserDialogData.data"
      :title="'销售方选择'"
      @closeMeOk="handleSellerCloseOk"
      @closeMeCancel="handleSellerCloseCancel"
    />
    <goods-dialog
      v-if="popSettingsData.goodsDialog.visible"
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
import SelectDict from '@/components/00_dict/select/SelectDict.vue'
import InputSearch from '@/components/40_input/inputSearch/index.vue'
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getApi, updateApi, validateApi } from '@/api/40_business/20_so/socontract/socontract'
import CustomerDialog from '@/views/20_master/enterprise/dialog/selecttablelist/customer/system_enterprise/index.vue'
import constants_dict from '@/common/constants/constants_dict'
import constants_bpm from '@/common/constants/constants_bpm'
import GoodsDialog from '@/views/00_platform/dialog/sku/new/goodsdialog.vue'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import PreviewDescription from '@/components/51_preview_description/index.vue'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'
import { EventBus } from '@/common/eventbus/eventbus'
import RadioDict from '@/components/00_dict/redio/index.vue'
export default {
  directives: { elDragDialog },
  components: { RadioDict, CustomerDialog, BpmDialog, PreviewCard, PreviewDescription, SimpleUploadMutilFile, GoodsDialog, InputSearch, SelectDict },
  mixins: [],
  props: {
    data: {
      type: Object,
      default: null
    },
    editStatus: {
      type: String,
      default: 'update'
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
        // 客户
        customerDialogData: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 销售方
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
          serial_type: constants_bpm.BPM_B_SO_CONTRACT,
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
          supplier_id: null,
          supplier_name: '',
          supplier_code: '',
          type: '',
          purchaser_id: null,
          purchaser_name: '',
          purchaser_code: '',
          settle_type: undefined,
          bill_type: undefined,
          payment_type: '1', // 银行转账
          delivery_type: undefined,
          auto_create_order: constants_dict.DICT_B_SO_CONTRACT_AUTO_CREATE_ORDER_ONE // 默认自动生成订单
        },
        // 单条数据 json
        tempJson: {
          detailListData: [],
          contract_code: '',
          supplier_id: null,
          supplier_name: '',
          supplier_code: '',
          type: '',
          purchaser_id: null,
          purchaser_name: '',
          purchaser_code: '',
          settle_type: undefined,
          bill_type: undefined,
          payment_type: '1', // 银行转账
          delivery_type: undefined,
          auto_create_order: constants_dict.DICT_B_SO_CONTRACT_AUTO_CREATE_ORDER_ONE // 默认自动生成订单
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
        // loading 状态
        loading: true,
        duration: 4000,
        // 按钮状态：是否可用，false:可用，true不可用
        btnTableDisabledStatus: {
          disabledInsert: true,
          disabledDelete: true
        },
        rules: {
          contract_code: [
            { required: true, message: '请填写合同编号', trigger: 'change' }
          ],
          type: [
            { required: true, message: '请选择合同类型', trigger: 'change' }
          ],
          supplier_name: [
            { required: true, message: '请选择客户', trigger: 'change' }
          ],
          purchaser_name: [
            { required: true, message: '请选择销售方', trigger: 'change' }
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
  watch: {
    // 全屏loading监听
    'settings.loading': {
      handler (newVal, oldVal) {
        switch (newVal) {
          case true:
            this.showLoading('正在处理，请稍后...')
            break
          case false:
            this.closeLoading()
            break
        }
      }
    }
  },
  created () {
  },
  mounted () {
    // 描绘完成
    this.init()
  },
  destroyed () {
  },
  methods: {
    // 初始化处理
    init () {
      // 初始化数据
      this.initData()
      this.settings.loading = false
    },
    // 初始化数据
    initData () {
      if (this.data && this.data.id) {
        // 加载已有数据
        this.settings.loading = true
        getApi({ id: this.data.id }).then(response => {
          this.dataJson.tempJson = Object.assign({}, response.data)
          // 处理附件数据
          if (this.dataJson.tempJson.doc_att_files && this.dataJson.tempJson.doc_att_files.length > 0) {
            this.dataJson.doc_att = [...this.dataJson.tempJson.doc_att_files]
            this.dataJson.doc_att_file = this.dataJson.tempJson.doc_att_files.map(item => item.url)
          }
        }).finally(() => {
          this.settings.loading = false
        })
      }
    },
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 修改
    doUpdate () {
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
          updateApi(tempData)
            .then(
              _data => {
                this.closeLoading()
                this.$emit('closeMeOk', _data.data)
                // 通知兄弟组件，修改数据更新
                setTimeout(() => {
                  EventBus.$emit(this.EMITS.EMIT_MST_SOCONTRACT_UPDATE_OK, _data.data)
                }, 1000)
                this.$notify({
                  title: '修改成功',
                  message: _data.data.message,
                  type: 'success',
                  duration: this.settings.duration
                })
              },
              _error => {
                this.closeLoading()
                this.$notify({
                  title: '修改失败',
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
      this.settings.btnTableDisabledStatus.disabledDelete = false
    },
    // 商品数据选择
    handleGoodsInsert () {
      // 新增
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

      this.popSettingsData.goodsDialog.visible = true
    },
    // 商品选择完成
    handleGoodsCloseOk (val) {
      this.doGoodsInsert(val)
    },
    doGoodsInsert (val) {
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
        title: '新增商品信息处理成功',
        message: val.data.message,
        type: 'success',
        duration: this.settings.duration
      })
    },
    // 商品取消
    handleGoodsCloseCancel () {
      this.popSettingsData.goodsDialog.visible = false
    },
    // 客户
    handleCustomerDialog () {
      this.popSettingsData.customerDialogData.visible = true
      this.popSettingsData.customerDialogData.data.status = constants_dict.DICT_M_ENTERPRISE_STATUS_TWO
      this.popSettingsData.customerDialogData.data.type_ids = [constants_dict.DICT_M_ENTERPRISE_TYPE_ONE]
    },
    // 客户：关闭对话框：确定
    handleCustomerCloseOk (val) {
      this.popSettingsData.customerDialogData.selectedDataJson = val
      this.dataJson.tempJson.supplier_id = val.id
      this.dataJson.tempJson.supplier_code = val.code
      this.dataJson.tempJson.supplier_name = val.name
      this.popSettingsData.customerDialogData.visible = false
    },
    // 客户：关闭对话框：取消
    handleCustomerCloseCancel () {
      this.popSettingsData.customerDialogData.visible = false
    },
    // 销售方
    handleSellerDialog () {
      this.popSettingsData.purchaserDialogData.visible = true
      this.popSettingsData.purchaserDialogData.data.status = constants_dict.DICT_M_ENTERPRISE_STATUS_TWO
      // this.popSettingsData.purchaserDialogData.data.type_ids = [constants_dict.DICT_M_ENTERPRISE_TYPE_TWO]
    },
    // 销售方：关闭对话框：确定
    handleSellerCloseOk (val) {
      this.popSettingsData.purchaserDialogData.selectedDataJson = val
      this.dataJson.tempJson.purchaser_id = val.id
      this.dataJson.tempJson.purchaser_code = val.code
      this.dataJson.tempJson.purchaser_name = val.name
      this.popSettingsData.purchaserDialogData.visible = false
    },
    // 销售方：关闭对话框：取消
    handleSellerCloseCancel () {
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
      this.showLoading('正在保存，请稍后...')
      // 校验业务数据
      const tempData = deepCopy(this.dataJson.tempJson)
      tempData.check_type = constants_para.UPDATE_CHECK_TYPE

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
            this.popSettingsData.sponsorDialog.form_data = { }
            // 启动审批流弹窗
            this.popSettingsData.sponsorDialog.visible = true
          }
        }).catch((err) => {
          this.closeLoading()
          this.$message.error(err)
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
      this.doUpdate()
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
     * 付款方式选择
     * @param val
     */
    handlePaymentTypeChange (val) {
      this.dataJson.tempJson.payment_type = val
    },
    /**
     * 运输方式
     * @param val
     */
    handleDeliveryTypeChange (val) {
      this.dataJson.tempJson.delivery_type = val
    },
    /**
     * 类型
     * @param val
     */
    handleTypeChange (val) {
      this.dataJson.tempJson.type = val
    },
    // 项目编号点击
    handleProjectCodeClick (code) {
      // 这里可以添加点击项目编号的逻辑，比如跳转到项目详情页
      console.log('项目编号点击:', code)
    }
  }
}
</script>
