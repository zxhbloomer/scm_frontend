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

          <el-descriptions-item label="合同编号">
            {{ dataJson.socontract.contract_code }}
          </el-descriptions-item>
          <el-descriptions-item label="系统编号">
            {{ dataJson.tempJson.code }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            {{ dataJson.socontract.type_name }}
          </el-descriptions-item>
          <el-descriptions-item label="客户">
            {{ dataJson.socontract.customer_name }}
          </el-descriptions-item>

          <el-descriptions-item label="主体企业">
            {{ dataJson.socontract.seller_name }}
          </el-descriptions-item>

          <el-descriptions-item label="收款方式">
            {{ dataJson.socontract.payment_type_name }}
          </el-descriptions-item>

          <el-descriptions-item label="结算方式">
            {{ dataJson.socontract.settle_type_name }}
          </el-descriptions-item>

          <el-descriptions-item label="结算单据类型">
            {{ dataJson.socontract.bill_type_name }}
          </el-descriptions-item>

          <el-descriptions-item label="运输方式">
            {{ dataJson.socontract.delivery_type_name }}
          </el-descriptions-item>

          <el-descriptions-item label="到期日期">
            {{ dataJson.socontract.expiry_date }}
          </el-descriptions-item>

          <el-descriptions-item label="交货日期">
            {{ dataJson.socontract.delivery_date }}
          </el-descriptions-item>

          <el-descriptions-item label="签约日期">
            {{ dataJson.socontract.sign_date }}
          </el-descriptions-item>
          <!--          <el-descriptions-item label="审批后自动生成订单">-->
          <!--            {{ dataJson.socontract.auto_create_name }}-->
          <!--          </el-descriptions-item>-->
          <el-descriptions-item label="交货地点" :span="3">
            {{ dataJson.socontract.delivery_location }}
          </el-descriptions-item>

          <el-descriptions-item label="备注" :span="3">
            {{ dataJson.socontract.remark }}
          </el-descriptions-item>

          <el-descriptions-item label="合同总金额">
            <span class="fontWeight">
              {{ dataJson.socontract.contract_amount_sum == null || dataJson.socontract.contract_amount_sum === ''?'-':formatCurrency(dataJson.socontract.contract_amount_sum,true,4) }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="总销售数量（吨）">
            <span class="fontWeight">
              {{ dataJson.socontract.contract_total == null || dataJson.socontract.contract_total === '' ?'-':formatNumber(dataJson.socontract.contract_total,true,4) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="已结算数量（吨）">
            <span class="fontWeight">
              {{ dataJson.socontract.settle_qty == null || dataJson.socontract.settle_qty === '' ? '-' : formatNumber(dataJson.socontract.settle_qty,true,4) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="总税额">
            <span class="fontWeight">
              {{ dataJson.socontract.tax_amount_sum == null || dataJson.socontract.tax_amount_sum === ''?'-':formatCurrency(dataJson.socontract.tax_amount_sum,true,4) }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="项目附件材料" :span="3">
            <preview-description :attachment-files="dataJson.socontract.doc_att_files" />
          </el-descriptions-item>
        </el-descriptions>
        <el-alert
          title="订单信息"
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
          <el-descriptions-item label="订单编号">系统自动生成</el-descriptions-item>
          <!--          运输方式-->
          <el-descriptions-item label="运输方式">
            <!--            <select-dict-->
            <!--              v-model="dataJson.tempJson.delivery_type"-->
            <!--              :value="dataJson.tempJson.delivery_type"-->
            <!--              :para="CONSTANTS.DICT_B_SO_CONTRACT_DELIVERY_TYPE"-->
            <!--              init-placeholder="请选择"-->
            <!--              style="width:100%"-->
            <!--            />-->
            <radio-dict
              v-model="dataJson.tempJson.delivery_type"
              :value="dataJson.tempJson.delivery_type"
              :para="CONSTANTS.DICT_B_SO_CONTRACT_DELIVERY_TYPE"
              @change="handleDeliveryTypeChange"
            />
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
          <el-descriptions-item label="交货地点" :span="3">
            <el-input
              v-model.trim="dataJson.tempJson.delivery_location"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.delivery_location"
            />
          </el-descriptions-item>
          <el-descriptions-item label="订单备注" :span="3">
            <el-input
              v-model.trim="dataJson.tempJson.remark"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.remark"
            />
          </el-descriptions-item>
          <el-descriptions-item label="订单总金额">
            <span class="fontWeight">
              {{ calculatedOrderAmount == null || calculatedOrderAmount === 0 ? '-' : formatCurrency(calculatedOrderAmount, true, 4) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="订单总销售数量（吨）">
            <span class="fontWeight">
              {{ calculatedOrderTotal == null || calculatedOrderTotal === 0 ? '-' : formatNumber(calculatedOrderTotal, true, 4) }}
            </span>
          </el-descriptions-item>
          <!-- <el-descriptions-item v-if="isViewModel" label="已结算数量（吨）">
            {{ dataJson.tempJson.settle_qty == null || dataJson.tempJson.settle_qty === '' ? '-' : dataJson.tempJson.settle_qty }}
          </el-descriptions-item>-->
          <el-descriptions-item label="订单总税额">
            <span class="fontWeight">
              {{ calculatedTaxAmount == null || calculatedTaxAmount === 0 ? '-' : formatCurrency(calculatedTaxAmount, true, 4) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="订单附件材料">
            <el-row>
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
                :span="4"
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
              {{ scope.row.price == null? '': formatCurrency(scope.row.price,true) }}
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
              {{ scope.row.amount == null?formatNumber(scope.row.qty*scope.row.price,true,4): formatCurrency(scope.row.amount,true) }}
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
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.origin == null ? '': scope.row.origin }}
            </template>
          </el-table-column>
        </el-table>

      </el-form>
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

    <!--主体企业-->
    <seller-dialog
      v-if="popSettingsData.sellerDialogData.visible"
      :visible="popSettingsData.sellerDialogData.visible"
      :data="popSettingsData.sellerDialogData.data"
      :title="'主体企业选择'"
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
.form-items-container {
  display: flex;
  align-items: center;
}
.fontWeight {
  font-weight: bold;
  color: #1890ff;
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
import constants_para from '@/common/constants/constants_para'
import ElDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getApi } from '@/api/40_business/20_so/socontract/socontract'
import { insertApi, validateApi } from '@/api/40_business/20_so/soorder/soorder'
import CustomerDialog from '@/views/20_master/enterprise/dialog/list/index.vue'
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
  directives: { ElDragDialog },
  components: { RadioDict, BpmDialog, PreviewCard, PreviewDescription, SimpleUploadMutilFile, GoodsDialog, CustomerDialog, SellerDialog: CustomerDialog },
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
        // 主体企业
        sellerDialogData: {
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
          form_data: {},
          // 弹出框传入参数
          serial_type: constants_bpm.BPM_B_SO_ORDER,
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
        // 单条数据 json
        tempJson: {
          detailListData: [],
          delivery_type: undefined
        },
        socontract: null,
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
        // 合同附件
        contract_doc_att: [],
        contract_doc_att_file: [],
        contract_doc_att_files: [],
        // 订单附件
        doc_att: [],
        doc_att_file: [],
        doc_att_files: []

      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        // 按钮状态：是否可用，false:可用，true不可用
        btnTableDisabledStatus: {
          disabledInsert: true,
          disabledDelete: true
        },
        // pop的check内容
        rules: {
          customer_name: [
            { required: true, message: '请选择客户', trigger: 'change' }
          ],
          seller_name: [
            { required: true, message: '请选择主体企业', trigger: 'change' }
          ]
        }
      }
    }
  },
  computed: {
    // 计算订单总金额
    calculatedOrderAmount () {
      if (!this.dataJson.tempJson.detailListData || this.dataJson.tempJson.detailListData.length === 0) {
        return 0
      }
      return this.dataJson.tempJson.detailListData.reduce((sum, item) => {
        const qty = parseFloat(item.qty) || 0
        const price = parseFloat(item.price) || 0
        return sum + (qty * price)
      }, 0)
    },
    // 计算订单总销售数量
    calculatedOrderTotal () {
      if (!this.dataJson.tempJson.detailListData || this.dataJson.tempJson.detailListData.length === 0) {
        return 0
      }
      return this.dataJson.tempJson.detailListData.reduce((sum, item) => {
        const qty = parseFloat(item.qty) || 0
        return sum + qty
      }, 0)
    },
    // 计算订单总税额
    calculatedTaxAmount () {
      if (!this.dataJson.tempJson.detailListData || this.dataJson.tempJson.detailListData.length === 0) {
        return 0
      }
      return this.dataJson.tempJson.detailListData.reduce((sum, item) => {
        const taxAmount = parseFloat(item.tax_amount) || 0
        return sum + taxAmount
      }, 0)
    }
  },
  // 监听器
  watch: {},
  created () {
  },
  mounted () {
    // 描绘完成
    this.init()
  },
  destroyed () {
    this.unWatch()
  },
  methods: {
    // 初始化处理
    init () {
      this.dataJson.tempJson = this.data
      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.data)
      this.getData()
      // 初始化watch
      this.setWatch()
      this.settings.loading = false
    },
    // 设置监听器
    setWatch () {
      this.unWatch()
    },
    unWatch () {
    },

    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 更新逻辑
    doInsert () {
      this.showLoading('正在保持，请稍后...')
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)

          // 审批流程启动数据
          tempData.initial_process = this.popSettingsData.sponsorDialog.initial_process // 流程
          tempData.form_data = this.popSettingsData.sponsorDialog.form_data // 表单参数
          tempData.process_users = this.popSettingsData.sponsorDialog.process_users // 自选用户
          tempData.so_contract_code = this.dataJson.socontract.contract_code
          tempData.so_contract_id = this.dataJson.socontract.id

          tempData.id = null
          this.settings.loading = true
          insertApi(tempData)
            .then(
              _data => {
                this.closeLoading()
                this.$emit('closeMeOk', _data.data)
                // 通知兄弟组件，新增数据更新
                EventBus.$emit(this.EMITS.EMIT_MST_SOCONTRACT_UPDATE_OK, _data.data)
                this.$notify({
                  title: '新增处理成功',
                  message: _data.message,
                  type: 'success',
                  duration: this.settings.duration
                })
              },
              _error => {
                this.closeLoading()
                this.$notify({
                  title: '修改处理失败',
                  message: _error.message,
                  type: 'error',
                  duration: this.settings.duration
                })
              }
            )
            .finally(() => {
              this.settings.loading = false
              this.closeLoading()
            })
        } else {
          this.closeLoading()
        }
      })
    },
    handleTabsClick (tab, event) {
    },
    getData () {
      // 查询逻辑
      this.settings.loading = true
      getApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.socontract = deepCopy(response.data)
        this.dataJson.tempJson.detailListData = [...response.data.detailListData]
        // 合同附件
        this.dataJson.contract_doc_att = this.dataJson.tempJson.doc_att_files
        if (this.dataJson.contract_doc_att != null && this.dataJson.contract_doc_att.length > 0) {
          this.dataJson.tempJson.contract_doc_att_files.forEach(item => {
            this.dataJson.contract_doc_att_file.push(item.url)
          })
        } else {
          this.dataJson.contract_doc_att = []
          this.dataJson.contract_doc_att_file = []
          this.dataJson.contract_doc_att_files = []
        }
        // 计算总金额
        this.sumData()
      }).finally(() => {
        // 清除附件，因为以下字典是为订单附件服务
        this.dataJson.doc_att = []
        this.dataJson.doc_att_file = []
        this.dataJson.doc_att_files = []
        this.settings.loading = false
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
      }).catch(action => {

      })
    },
    // 商品数据编辑
    handleGoodsEdit () {
      if (this.dataJson.rowIndex === null) {
        this.showErrorMsg('请选择一条数据')
        return
      }
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
      this.$notify({
        title: '新增处理成功',
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
      this.popSettingsData.customerDialogData.data.type_ids = [constants_dict.DICT_M_ENTERPRISE_TYPE_TWO]
    },
    // 客户：关闭对话框：确定
    handleCustomerCloseOk (val) {
      this.popSettingsData.customerDialogData.selectedDataJson = val
      this.dataJson.tempJson.customer_id = val.id
      this.dataJson.tempJson.customer_code = val.code
      this.dataJson.tempJson.customer_name = val.name
      this.popSettingsData.customerDialogData.visible = false
    },
    // 客户：关闭对话框：取消
    handleCustomerCloseCancel () {
      this.popSettingsData.customerDialogData.visible = false
    },
    // 主体企业
    handleSellerDialog () {
      this.popSettingsData.sellerDialogData.visible = true
      this.popSettingsData.sellerDialogData.data.status = constants_dict.DICT_M_ENTERPRISE_STATUS_TWO
      // this.popSettingsData.customerDialogData.data.type_ids = [constants_dict.DICT_M_ENTERPRISE_TYPE_TWO]
    },
    // 主体企业：关闭对话框：确定
    handleSellerCloseOk (val) {
      this.popSettingsData.sellerDialogData.selectedDataJson = val
      this.dataJson.tempJson.seller_id = val.id
      this.dataJson.tempJson.seller_code = val.code
      this.dataJson.tempJson.seller_name = val.name
      this.popSettingsData.sellerDialogData.visible = false
    },
    // 主体企业：关闭对话框：取消
    handleSellerCloseCancel () {
      this.popSettingsData.sellerDialogData.visible = false
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
    },
    /**
     * 运输方式
     * @param val
     */
    handleDeliveryTypeChange (val) {
      this.dataJson.tempJson.delivery_type = val
    },
    // 处理项目编号点击事件
    handleProjectCodeClick (projectCode) {
      // 跳转到项目管理页面，传递项目编号作为参数p1
      this.$router.push({
        path: constants_para.URL_PROJECT_LIST,
        query: {
          p1: projectCode
        }
      })
    }
  }

}
</script>
