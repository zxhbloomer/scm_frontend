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
        <div v-if="dataJson.tempJson.po_contract_code">
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
              <el-link
                v-if="dataJson.pocontract.contract_code"
                type="primary"
                @click="handleContractCodeClick(dataJson.pocontract.contract_code)"
              >
                {{ dataJson.pocontract.contract_code }}
              </el-link>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="系统编号">
              {{ dataJson.tempJson.code }}
            </el-descriptions-item>
            <el-descriptions-item label="类型">
              {{ dataJson.pocontract.type_name }}
            </el-descriptions-item>

            <el-descriptions-item label="供应商">
              {{ dataJson.pocontract.supplier_name }}
            </el-descriptions-item>

            <el-descriptions-item label="主体企业">
              {{ dataJson.pocontract.purchaser_name }}
            </el-descriptions-item>

            <el-descriptions-item label="付款方式">
              {{ dataJson.pocontract.payment_type_name }}
            </el-descriptions-item>

            <el-descriptions-item label="结算方式">
              {{ dataJson.pocontract.settle_type_name }}
            </el-descriptions-item>

            <el-descriptions-item label="结算单据类型">
              {{ dataJson.pocontract.bill_type_name }}
            </el-descriptions-item>

            <el-descriptions-item label="运输方式">
              {{ dataJson.pocontract.delivery_type_name }}
            </el-descriptions-item>

            <el-descriptions-item label="到期日期">
              {{ dataJson.pocontract.expiry_date }}
            </el-descriptions-item>

            <el-descriptions-item label="交货日期">
              {{ dataJson.pocontract.delivery_date }}
            </el-descriptions-item>

            <el-descriptions-item label="签约日期">
              {{ dataJson.pocontract.sign_date }}
            </el-descriptions-item>
            <!--          <el-descriptions-item label="审批后自动生成订单">-->
            <!--            {{ dataJson.pocontract.auto_create_name }}-->
            <!--          </el-descriptions-item>-->
            <el-descriptions-item label="交货地点">
              {{ dataJson.pocontract.delivery_location }}
            </el-descriptions-item>

            <el-descriptions-item label="备注">
              {{ dataJson.pocontract.remark }}
            </el-descriptions-item>

            <el-descriptions-item label="合同总金额">
              <span class="fontWeight">
                {{ dataJson.pocontract.contract_amount_sum == null || dataJson.pocontract.contract_amount_sum === ''?'-':formatCurrency(dataJson.pocontract.contract_amount_sum,true,4) }}
              </span>
            </el-descriptions-item>

            <el-descriptions-item label="总采购数量（吨）">
              <span class="fontWeight">
                {{ dataJson.pocontract.contract_total == null || dataJson.pocontract.contract_total === '' ?'-':formatNumber(dataJson.pocontract.contract_total,true,4) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="已结算数量（吨）">
              <span class="fontWeight">
                {{ dataJson.pocontract.settle_qty == null || dataJson.pocontract.settle_qty === '' ? '-' : formatNumber(dataJson.pocontract.settle_qty,true,4) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="总税额">
              <span class="fontWeight">
                {{ dataJson.pocontract.tax_amount_sum == null || dataJson.pocontract.tax_amount_sum === ''?'-':formatCurrency(dataJson.pocontract.tax_amount_sum,true,4) }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
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

          <el-descriptions-item label="订单编号">
            {{ dataJson.tempJson.code == null || dataJson.tempJson.code === ''?'系统自动生成':dataJson.tempJson.code }}
          </el-descriptions-item>

          <el-descriptions-item v-if="dataJson.tempJson.contract_code" label="合同编号">
            {{ dataJson.tempJson.contract_code }}
          </el-descriptions-item>

          <el-descriptions-item label="运输方式">
            <radio-dict
              v-model="dataJson.tempJson.delivery_type"
              :value="dataJson.tempJson.delivery_type"
              :para="CONSTANTS.DICT_B_PO_ORDER_DELIVERY_TYPE"
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

          <el-descriptions-item label="交货地点">
            <el-input
              v-model.trim="dataJson.tempJson.delivery_location"
              clearable
              placeholder="请输入"
              :maxlength="dataJson.inputSettings.maxLength.delivery_location"
            />
          </el-descriptions-item>

          <el-descriptions-item label="订单备注" :span="2">
            <el-input
              v-model.trim="dataJson.tempJson.remark"
              clearable
              placeholder="请输入"
              :maxlength="dataJson.inputSettings.maxLength.remark"
            />
          </el-descriptions-item>

          <el-descriptions-item label="订单总金额">
            <span class="fontWeight">
              {{ dataJson.tempJson.order_amount_sum == null || dataJson.tempJson.order_amount_sum === 0 ? '-' : formatCurrency(dataJson.tempJson.order_amount_sum, true, 4) }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="订单总采购数量（吨）">
            <span class="fontWeight">
              {{ dataJson.tempJson.qty_total == null || dataJson.tempJson.qty_total === 0 ? '-' : formatNumber(dataJson.tempJson.qty_total, true, 4) }}
            </span>
          </el-descriptions-item>
          <!-- <el-descriptions-item v-if="isViewModel" label="已结算数量（吨）">
            {{ dataJson.tempJson.settle_qty == null || dataJson.tempJson.settle_qty === '' ? '-' : dataJson.tempJson.settle_qty }}
          </el-descriptions-item>-->
          <el-descriptions-item label="订单总税额">
            <span class="fontWeight">
              {{ dataJson.tempJson.tax_amount_sum == null || dataJson.tempJson.tax_amount_sum === 0 ? '-' : formatCurrency(dataJson.tempJson.tax_amount_sum, true, 4) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="订单附件材料">
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
              {{ scope.row.amount == null? '': formatCurrency(scope.row.amount,true) }}
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
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        size="medium"
        type="primary"
        :disabled="settings.loading "
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
import { getApi, updateApi, validateApi } from '@/api/40_business/poorder/poorder'
import constants_dict from '@/common/constants/constants_dict'
import GoodsDialog from '@/views/00_platform/dialog/sku/new/goodsdialog.vue'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'
import { EventBus } from '@/common/eventbus/eventbus'
import RadioDict from '@/components/00_dict/redio/index.vue'
import PreviewDescription from '@/components/51_preview_description/index.vue'
export default {
  directives: { ElDragDialog },
  components: { BpmDialog, PreviewCard, PreviewDescription, SimpleUploadMutilFile, GoodsDialog, RadioDict },
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
          // 弹出框传入参数
          serial_type: constants_dict.DICT_B_PO_ORDER,
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
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          detailListData: [],
          supplier_name: '',
          purchaser_name: ''
        },
        // 单条数据 json
        tempJson: {
          detailListData: [],
          project: {
            code: null,
            name: null,
            remark: null,
            // 附件
            doc_att: [],
            doc_att_file: [],
            doc_att_files: []
          }
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
        // 按钮状态：是否可用，false:可用，true不可用
        btnTableDisabledStatus: {
          disabledInsert: true,
          disabledDelete: true
        },
        // pop的check内容
        rules: {
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
      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.data)
      this.dataJson.tempJsonOriginal = deepCopy(this.data)
      this.getData()
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
    doUpdate () {
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

          tempData.po_contract = null
          tempData.project = null

          updateApi(tempData)
            .then(
              _data => {
                this.closeLoading()
                this.$emit('closeMeOk', _data.data)
                // 通知兄弟组件，新增数据更新
                setTimeout(() => {
                  EventBus.$emit(this.EMITS.EMIT_MST_POORDER_UPDATE_OK, _data.data)
                }, 1000)
                this.$notify({
                  title: '修改处理成功',
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
              this.closeLoading()
            })
        } else {
          this.closeLoading()
        }
      })
    },
    handleTabsClick (tab, event) { },
    getData () {
      // 查询逻辑
      this.settings.loading = true
      getApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.pocontract = deepCopy(response.data.po_contract)
        this.dataJson.tempJsonOriginal = deepCopy(response.data)
        this.dataJson.tempJson.detailListData = [...response.data.detailListData]

        // 其他附件
        this.dataJson.doc_att = this.dataJson.tempJson.doc_att_files
        if (this.dataJson.doc_att != null && this.dataJson.doc_att.length > 0) {
          this.dataJson.tempJson.doc_att_files.forEach(item => {
            this.dataJson.doc_att_file.push(item.url)
          })
        } else {
          this.dataJson.doc_att = []
          this.dataJson.doc_att_file = []
          this.dataJson.doc_att_files = []
        }

        // 项目管理的附件信息
        if (this.dataJson.tempJson.project && this.dataJson.tempJson.project.doc_att_files) {
          this.dataJson.tempJson.project.doc_att = this.dataJson.tempJson.project.doc_att_files
          if (this.dataJson.tempJson.project.doc_att != null && this.dataJson.tempJson.project.doc_att.length > 0) {
            this.dataJson.tempJson.project.doc_att_file = []
            this.dataJson.tempJson.project.doc_att_files.forEach(item => {
              this.dataJson.tempJson.project.doc_att_file.push(item.url)
            })
          } else {
            this.dataJson.tempJson.project.doc_att = []
            this.dataJson.tempJson.project.doc_att_file = []
            this.dataJson.tempJson.project.doc_att_files = []
          }
        }
      }).finally(() => {
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

        this.dataJson.tempJson.order_amount_sum = 0
        this.dataJson.tempJson.qty_total = 0
        this.dataJson.tempJson.tax_amount_sum = 0
        this.dataJson.tempJson.detailListData.forEach(element => {
          this.dataJson.tempJson.order_amount_sum += element.qty * element.price
          this.dataJson.tempJson.qty_total += element.qty
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
      this.dataJson.tempJson.order_amount_sum = 0
      this.dataJson.tempJson.qty_total = 0
      this.dataJson.tempJson.tax_amount_sum = 0
      this.dataJson.tempJson.detailListData.forEach(element => {
        this.dataJson.tempJson.order_amount_sum += element.qty * element.price
        this.dataJson.tempJson.qty_total += element.qty
        this.dataJson.tempJson.tax_amount_sum += element.tax_amount
      })
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
      tempData.check_type = constants_para.UPDATE_CHECK_TYPE
      tempData.po_contract = null
      tempData.project = null
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
      this.doUpdate()
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
    },
    // 处理合同编号点击事件
    handleContractCodeClick (contractCode) {
      // 跳转到采购合同页面，传递合同编号作为参数p1
      this.$router.push({
        path: constants_para.URL_PO_CONTRACT_LIST,
        query: {
          p1: contractCode
        }
      })
    }
  }

}
</script>
