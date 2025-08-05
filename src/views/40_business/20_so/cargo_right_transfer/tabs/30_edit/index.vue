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
          title="货权转移信息"
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

          <el-descriptions-item label="转移编号">
            {{ dataJson.tempJson.code == null || dataJson.tempJson.code === ''?'系统自动生成':dataJson.tempJson.code }}
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              关联销售订单
            </div>
            <el-form-item
              prop="so_order_code"
              label-width="0"
            >
              <input-search
                v-model.trim="dataJson.tempJson.so_order_code"
                :readonly="true"
                :disabled="dataJson.tempJson.bpm_status && dataJson.tempJson.bpm_status !== '0'"
                @onInputSearch="handleSoOrderDialog"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="关联销售合同">
            {{ dataJson.tempJson.so_contract_code || '-' }}
          </el-descriptions-item>

          <!--客户-->
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              客户
            </div>
            <el-form-item
              prop="customer_name"
              label-width="0"
            >
              <input-search
                v-model.trim="dataJson.tempJson.customer_name"
                :disabled="dataJson.tempJson.bpm_status && dataJson.tempJson.bpm_status !== '0'"
                @onInputSearch="handleCustomerDialog"
              />
            </el-form-item>
          </el-descriptions-item>

          <!--主体企业-->
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              主体企业
            </div>
            <el-form-item
              prop="seller_name"
              label-width="0"
            >
              <input-search
                v-model.trim="dataJson.tempJson.seller_name"
                :disabled="dataJson.tempJson.bpm_status && dataJson.tempJson.bpm_status !== '0'"
                @onInputSearch="handleSellerDialog"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              转移日期
            </div>
            <el-form-item
              prop="transfer_date"
              label-width="0"
            >
              <el-date-picker
                v-model="dataJson.tempJson.transfer_date"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                clearable
                :placeholder="'选择日期'"
                :disabled="dataJson.tempJson.bpm_status && dataJson.tempJson.bpm_status !== '0'"
                style="width: 100%"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="转移地点">
            <el-input
              v-model.trim="dataJson.tempJson.transfer_location"
              clearable
              placeholder="请输入"
              :disabled="dataJson.tempJson.bpm_status && dataJson.tempJson.bpm_status !== '0'"
              :maxlength="dataJson.inputSettings.maxLength.transfer_location"
            />
          </el-descriptions-item>

          <el-descriptions-item label="项目编号">
            <el-input
              v-model.trim="dataJson.tempJson.project_code"
              clearable
              placeholder="请输入"
              :disabled="dataJson.tempJson.bpm_status && dataJson.tempJson.bpm_status !== '0'"
              :maxlength="dataJson.inputSettings.maxLength.project_code"
            />
          </el-descriptions-item>

          <el-descriptions-item label="备注">
            <el-input
              v-model.trim="dataJson.tempJson.remark"
              clearable
              placeholder="请输入"
              :disabled="dataJson.tempJson.bpm_status && dataJson.tempJson.bpm_status !== '0'"
              :maxlength="dataJson.inputSettings.maxLength.remark"
            />
          </el-descriptions-item>

          <el-descriptions-item label="转移总金额">
            <span class="fontWeight">
              {{ dataJson.tempJson.total_amount == null || dataJson.tempJson.total_amount === ''?'-':formatCurrency(dataJson.tempJson.total_amount,true) }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="转移总数量（吨）">
            <span class="fontWeight">
              {{ dataJson.tempJson.total_qty == null || dataJson.tempJson.total_qty === '' ?'-':formatNumber(dataJson.tempJson.total_qty,true,4) }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="货权转移附件材料">
            <el-row>
              <Simple-upload-mutil-file
                v-if="!(dataJson.tempJson.bpm_status && dataJson.tempJson.bpm_status !== '0')"
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
                  :readonly="dataJson.tempJson.bpm_status && dataJson.tempJson.bpm_status !== '0'"
                  @removeFile="removeOtherFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>
        </el-descriptions>

        <el-alert
          title="货权转移-商品信息"
          type="info"
          :closable="false"
        />

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
            min-width="120"
            prop="order_qty"
            label="订单数量"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.order_qty == null? '-' : formatNumber(scope.row.order_qty,true,4) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="120"
            prop="order_price"
            label="订单单价"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.order_price == null? '': formatCurrency(scope.row.order_price, true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="120"
            prop="order_amount"
            label="订单金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.order_amount == null? '' : formatCurrency(scope.row.order_amount,true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="120"
            prop="transfer_qty"
            label="转移数量"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.transfer_qty == null? '-' : formatNumber(scope.row.transfer_qty,true,4) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="120"
            prop="transfer_price"
            label="转移单价"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.transfer_price == null? '': formatCurrency(scope.row.transfer_price, true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="120"
            prop="transfer_amount"
            label="转移金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.transfer_amount == null? '' : formatCurrency(scope.row.transfer_amount,true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="100"
            prop="quality_status"
            label="质量状态"
          >
            <template v-slot="scope">
              <span v-if="scope.row.quality_status === '1'">合格</span>
              <span v-else-if="scope.row.quality_status === '2'">不合格</span>
              <span v-else-if="scope.row.quality_status === '3'">待检</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="120"
            prop="batch_no"
            label="批次号"
          >
            <template v-slot="scope">
              {{ scope.row.batch_no == null ? '': scope.row.batch_no }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="120"
            prop="production_date"
            label="生产日期"
          >
            <template v-slot="scope">
              {{ scope.row.production_date == null ? '': scope.row.production_date }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="120"
            prop="expiry_date"
            label="有效期"
          >
            <template v-slot="scope">
              {{ scope.row.expiry_date == null ? '': scope.row.expiry_date }}
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
        v-if="!(dataJson.tempJson.bpm_status && dataJson.tempJson.bpm_status !== '0')"
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

    <!--主体企业-->
    <seller-dialog
      v-if="popSettingsData.sellerDialogData.visible"
      :visible="popSettingsData.sellerDialogData.visible"
      :data="popSettingsData.sellerDialogData.data"
      :title="'主体企业选择'"
      @closeMeOk="handleSellerCloseOk"
      @closeMeCancel="handleSellerCloseCancel"
    />

    <!--销售订单选择-->
    <so-order-dialog
      v-if="popSettingsData.soOrderDialog.visible"
      :visible="popSettingsData.soOrderDialog.visible"
      :data="popSettingsData.soOrderDialog.data"
      :title="'销售订单选择'"
      @closeMeOk="handleSoOrderCloseOk"
      @closeMeCancel="handleSoOrderCloseCancel"
    />

    <!-- 审批流程设置：选择人 -->
    <bpm-dialog
      v-if="popSettingsData.sponsorDialog.visible"
      :visible="popSettingsData.sponsorDialog.visible"
      :form-data="popSettingsData.sponsorDialog.form_data"
      :serial-type="popSettingsData.sponsorDialog.serial_type"
      @closeMeCancel="handlebpmDialogCancel"
      @closeMeOk="handlebpmDialogOk"
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
import InputSearch from '@/components/40_input/inputSearch/index.vue'
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getApi, updateApi, validateApi } from '@/api/40_business/20_so/cargo_right_transfer/cargorighttransfer'
import CustomerDialog from '@/views/20_master/enterprise/dialog/selecttablelist/customer/counterparty/index.vue'
import SellerDialog from '@/views/20_master/enterprise/dialog/selecttablelist/seller/system_enterprise/index.vue'
import constants_dict from '@/common/constants/constants_dict'
import constants_bpm from '@/common/constants/constants_bpm'
import SoOrderDialog from '@/views/40_business/20_so/soorder/dialog/listfor/cargorighttransfer/index.vue'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import bpmDialog from '@/components/60_bpm/submitBpmDialog.vue'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  directives: { elDragDialog },
  components: {
    SellerDialog,
    bpmDialog,
    PreviewCard,
    SimpleUploadMutilFile,
    SoOrderDialog,
    CustomerDialog,
    InputSearch
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
      // 监听器
      watch: {
      },
      popSettingsData: {
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
        // 销售订单选择
        soOrderDialog: {
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
          serial_type: constants_bpm.BPM_B_SO_CARGO_RIGHT_TRANSFER,
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
        // 单条数据 json
        tempJson: {
          detailListData: [],
          so_order_id: null,
          so_order_code: '',
          so_contract_id: null,
          so_contract_code: '',
          customer_id: null,
          customer_name: '',
          customer_code: '',
          seller_id: null,
          seller_name: '',
          seller_code: '',
          transfer_date: '',
          transfer_location: '',
          project_code: '',
          remark: '',
          total_amount: 0,
          total_qty: 0
        },
        searchForm: {
          reset: false,
          owner_id: undefined,
          owner_name: ''
        },
        inputSettings: {
          maxLength: {
            transfer_location: 100,
            project_code: 20,
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
          so_order_code: [
            { required: true, message: '请选择关联销售订单', trigger: 'change' }
          ],
          customer_name: [
            { required: true, message: '请选择客户', trigger: 'change' }
          ],
          seller_name: [
            { required: true, message: '请选择主体企业', trigger: 'change' }
          ],
          transfer_date: [
            { required: true, message: '请选择转移日期', trigger: 'change' }
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
    this.unWatch()
  },
  methods: {
    // 初始化处理
    init () {
      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.data)
      this.getDataInit()
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
    // 获取数据初始化
    getDataInit () {
      this.settings.loading = true
      getApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.tempJson.detailListData = [...response.data.detailListData]

        // 其他附件
        this.dataJson.doc_att = this.dataJson.tempJson.doc_att_files || []
        if (this.dataJson.doc_att != null && this.dataJson.doc_att.length > 0) {
          this.dataJson.tempJson.doc_att_files.forEach(item => {
            this.dataJson.doc_att_file.push(item.url)
          })
        } else {
          this.dataJson.doc_att = []
          this.dataJson.doc_att_file = []
          this.dataJson.doc_att_files = []
        }
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 更新逻辑
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
            this.showErrorMsg('至少选择一个转移商品')
            this.closeLoading()
            return
          }

          this.settings.loading = true
          updateApi(tempData)
            .then(
              _data => {
                this.closeLoading()
                this.$emit('closeMeOk', _data.data)
                // 通知兄弟组件，更新数据
                setTimeout(() => {
                  EventBus.$emit(this.EMITS.EMIT_MST_CARGO_RIGHT_TRANSFER_UPDATE_OK, _data.data)
                }, 1000)
                this.$notify({
                  title: '修改处理成功',
                  message: _data.data.message,
                  type: 'success',
                  duration: this.settings.duration
                })
              },
              _error => {
                this.closeLoading()
                this.$notify({
                  title: '修改处理失败',
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
    // 客户
    handleCustomerDialog () {
      this.popSettingsData.customerDialogData.visible = true
      this.popSettingsData.customerDialogData.data.status = constants_dict.DICT_M_ENTERPRISE_STATUS_TWO
      this.popSettingsData.customerDialogData.data.type_ids = [constants_dict.DICT_M_ENTERPRISE_TYPE_ONE]
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
    // 销售订单选择
    handleSoOrderDialog () {
      this.popSettingsData.soOrderDialog.visible = true
    },
    // 销售订单：关闭对话框：确定
    handleSoOrderCloseOk (val) {
      this.popSettingsData.soOrderDialog.selectedDataJson = val
      this.dataJson.tempJson.so_order_id = val.id
      this.dataJson.tempJson.so_order_code = val.code
      // 同步客户和销售方信息
      if (val.customer_id) {
        this.dataJson.tempJson.customer_id = val.customer_id
        this.dataJson.tempJson.customer_code = val.customer_code
        this.dataJson.tempJson.customer_name = val.customer_name
      }
      if (val.seller_id) {
        this.dataJson.tempJson.seller_id = val.seller_id
        this.dataJson.tempJson.seller_code = val.seller_code
        this.dataJson.tempJson.seller_name = val.seller_name
      }
      if (val.project_code) {
        this.dataJson.tempJson.project_code = val.project_code
      }
      // 清空已选择的商品明细
      this.dataJson.tempJson.detailListData = []
      this.calculateTotal()
      this.popSettingsData.soOrderDialog.visible = false
    },
    // 销售订单：关闭对话框：取消
    handleSoOrderCloseCancel () {
      this.popSettingsData.soOrderDialog.visible = false
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
    handlebpmDialogCancel () {
      this.popSettingsData.sponsorDialog.visible = false
      this.closeLoading()
    },
    // 审批流确定
    handlebpmDialogOk (data) {
      this.popSettingsData.sponsorDialog.initial_process = data.processData
      this.popSettingsData.sponsorDialog.process_users = data.process_users
      this.popSettingsData.sponsorDialog.visible = false
      this.doUpdate()
    }
  }
}
</script>
