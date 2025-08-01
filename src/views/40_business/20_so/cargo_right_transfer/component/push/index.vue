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
        <el-descriptions
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >

          <el-descriptions-item label="货权转移编号">
            {{ dataJson.tempJson.code == null || dataJson.tempJson.code === ''?'系统自动生成':dataJson.tempJson.code }}
          </el-descriptions-item>
          <el-descriptions-item />
          <el-descriptions-item />
          <el-descriptions-item label="关联销售订单">
            <span class="fontWeight">{{ dataJson.tempJson.so_order_code || '-' }}</span>
          </el-descriptions-item>

          <el-descriptions-item label="关联销售合同">
            {{ dataJson.tempJson.so_contract_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="项目编号">
            {{ dataJson.tempJson.project_code || '-' }}
          </el-descriptions-item>
          <!--客户-->
          <el-descriptions-item label="客户">
            {{ dataJson.tempJson.customer_name || '-' }}
          </el-descriptions-item>

          <!--主体企业-->
          <el-descriptions-item label="主体企业">
            {{ dataJson.tempJson.seller_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item />
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              货转日期
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
                style="width: 100%"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="货转地点" span="2">
            <el-input
              v-model.trim="dataJson.tempJson.transfer_location"
              clearable
              placeholder="请输入"
              :maxlength="dataJson.inputSettings.maxLength.transfer_location"
            />
          </el-descriptions-item>
          <el-descriptions-item label="备注" span="3">
            <el-input
              v-model.trim="dataJson.tempJson.remark"
              clearable
              placeholder="请输入"
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
          <el-descriptions-item />
          <el-descriptions-item label="附件材料">
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
            prop="qty"
            label="订单数量"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.qty == null? '-' : formatNumber(scope.row.qty,true,4) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="120"
            prop="price"
            label="订单单价"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.price == null? '': formatCurrency(scope.row.price, true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="120"
            prop="amount"
            label="订单金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.amount == null? '' : formatCurrency(scope.row.amount,true) }}
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
            min-width="160"
            prop="remark"
            label="备注"
          >
            <template v-slot="scope">
              {{ scope.row.remark == null ? '': scope.row.remark }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="180"
            align="center"
            fixed="right"
          >
            <template v-slot="scope">
              <el-button
                type="primary"
                size="mini"
                @click="handleCargoRightTransfer(scope.row, scope.$index)"
              >
                货权转移
              </el-button>
              <el-button
                type="danger"
                size="mini"
                @click="handleDeleteRow(scope.row, scope.$index)"
              >
                删除
              </el-button>
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
        @click="handleReset()"
      >重置</el-button>
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

    <!--货权转移操作-->
    <cargo-right-transfer-do-dialog
      v-if="popSettingsData.cargoRightTransferDoDialog.visible"
      :visible="popSettingsData.cargoRightTransferDoDialog.visible"
      :data="popSettingsData.cargoRightTransferDoDialog.data"
      :title="'货权转移'"
      @closeMeOk="handleCargoRightTransferDoCloseOk"
      @closeMeCancel="handleCargoRightTransferDoCloseCancel"
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
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { insertApi, validateApi } from '@/api/40_business/20_so/cargo_right_transfer/cargorighttransfer'
import { setSodetailListDataApi } from '@/api/40_business/20_so/soorder/soorder'
import CustomerDialog from '@/views/20_master/enterprise/dialog/selecttablelist/customer/counterparty/index.vue'
import SellerDialog from '@/views/20_master/enterprise/dialog/selecttablelist/seller/system_enterprise/index.vue'
import constants_dict from '@/common/constants/constants_dict'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import bpmDialog from '@/components/60_bpm/submitBpmDialog.vue'
import { EventBus } from '@/common/eventbus/eventbus'
import CargoRightTransferDoDialog from '@/views/40_business/20_so/cargo_right_transfer/dialog/opera/do/index.vue'

export default {
  directives: { elDragDialog },
  components: {
    SellerDialog,
    bpmDialog,
    PreviewCard,
    SimpleUploadMutilFile,
    CustomerDialog,
    CargoRightTransferDoDialog
  },
  mixins: [],
  props: {
    soId: {
      type: [String, Number],
      default: null
    },
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
        // 货权转移操作
        cargoRightTransferDoDialog: {
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
          serial_type: constants_dict.DICT_B_SO_CARGO_RIGHT_TRANSFER,
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
        loading: false,
        duration: 4000,
        // 按钮状态：是否可用，false:可用，true不可用
        btnTableDisabledStatus: {
          disabledInsert: true,
          disabledDelete: true
        },
        rules: {
          transfer_date: [
            { required: true, message: '请选择货转日期', trigger: 'change' }
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
      // 初始化watch
      this.setWatch()

      // 如果传入了销售订单数据，自动填充并查询
      if (this.data) {
        this.loadSoOrderData(this.data)
      }

      this.settings.loading = false
    },

    // 加载销售订单数据
    loadSoOrderData (soOrderData) {
      // 设置销售订单信息
      this.dataJson.tempJson.so_order_id = soOrderData.id
      this.dataJson.tempJson.so_order_code = soOrderData.code
      this.dataJson.tempJson.so_contract_code = soOrderData.so_contract_code
      this.dataJson.tempJson.project_code = soOrderData.project_code

      // 设置客户信息
      if (soOrderData.customer_id) {
        this.dataJson.tempJson.customer_id = soOrderData.customer_id
        this.dataJson.tempJson.customer_code = soOrderData.customer_code
        this.dataJson.tempJson.customer_name = soOrderData.customer_name
      }

      // 设置销售方信息
      if (soOrderData.seller_id) {
        this.dataJson.tempJson.seller_id = soOrderData.seller_id
        this.dataJson.tempJson.seller_code = soOrderData.seller_code
        this.dataJson.tempJson.seller_name = soOrderData.seller_name
      }

      // 自动触发获取订单明细数据
      this.setSodetailListData(soOrderData)
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
            this.showErrorMsg('至少选择一个转移商品')
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
                setTimeout(() => {
                  EventBus.$emit(this.EMITS.EMIT_MST_CARGO_RIGHT_TRANSFER_NEW_OK, _data.data)
                }, 1000)
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
     * 获取销售订单明细数据
     */
    setSodetailListData (val) {
      // 调用API获取明细数据
      this.settings.loading = true
      setSodetailListDataApi({ id: val.id }).then(response => {
        this.dataJson.tempJson.detailListData = deepCopy(response.data)
        this.settings.loading = false
      }).catch(error => {
        console.error('获取销售订单明细失败:', error)
        this.$notify({
          title: '获取数据失败',
          message: '无法获取销售订单明细数据，请重试',
          type: 'error',
          duration: 3000
        })
        this.settings.loading = false
      })
    },

    /**
     * 计算总数量和总金额
     */
    calculateTotals () {
      let totalQty = 0
      let totalAmount = 0

      if (this.dataJson.tempJson.detailListData && this.dataJson.tempJson.detailListData.length > 0) {
        this.dataJson.tempJson.detailListData.forEach(item => {
          totalQty += parseFloat(item.transfer_qty || 0)
          totalAmount += parseFloat(item.transfer_amount || 0)
        })
      }

      this.dataJson.tempJson.total_qty = totalQty
      this.dataJson.tempJson.total_amount = totalAmount
    },

    /**
     * 货权转移业务校验
     */
    validateCargoRightTransfer () {
      // 1、校验货权转移-商品信息数据是否为空
      if (!this.dataJson.tempJson.detailListData || this.dataJson.tempJson.detailListData.length === 0) {
        return {
          isValid: false,
          message: '校验出错：货权转移-商品信息数据不能为空。'
        }
      }

      // 2、校验货权转移-商品信息数据中商品的转移数量是否>0
      for (let i = 0; i < this.dataJson.tempJson.detailListData.length; i++) {
        const item = this.dataJson.tempJson.detailListData[i]
        const transferQty = parseFloat(item.transfer_qty || 0)

        if (transferQty <= 0) {
          return {
            isValid: false,
            message: `校验出错：货权转移-商品信息数据"商品编号：${item.sku_code || ''}"的转移数量需要填写正确的额值。`
          }
        }
      }

      // 校验通过
      return {
        isValid: true,
        message: ''
      }
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
          // 增加货权转移业务校验
          const validationResult = this.validateCargoRightTransfer()
          if (!validationResult.isValid) {
            this.closeLoading()
            this.showErrorMsg(validationResult.message)
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
      this.doInsert()
    },
    // 货权转移按钮点击
    handleCargoRightTransfer (row, index) {
      this.popSettingsData.cargoRightTransferDoDialog.data = deepCopy(row)
      this.popSettingsData.cargoRightTransferDoDialog.data.index = index
      this.popSettingsData.cargoRightTransferDoDialog.visible = true
    },
    // 货权转移操作：关闭对话框：确定
    handleCargoRightTransferDoCloseOk (val) {
      this.popSettingsData.cargoRightTransferDoDialog.selectedDataJson = val
      // 更新表格中的数据
      const index = this.popSettingsData.cargoRightTransferDoDialog.data.index
      if (index !== undefined && this.dataJson.tempJson.detailListData[index]) {
        // 更新行数据
        this.dataJson.tempJson.detailListData[index] = Object.assign(
          this.dataJson.tempJson.detailListData[index],
          val
        )
        // 重新计算总量和总金额
        this.calculateTotals()
      }
      this.popSettingsData.cargoRightTransferDoDialog.visible = false
    },
    // 货权转移操作：关闭对话框：取消
    handleCargoRightTransferDoCloseCancel () {
      this.popSettingsData.cargoRightTransferDoDialog.visible = false
    },

    // 重置按钮
    handleReset () {
      this.$confirm('确定要重置所有数据吗？此操作无法撤销。', '确认重置', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 重置表单数据
        this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)

        // 如果传入了销售订单数据，重新加载
        if (this.data) {
          this.loadSoOrderData(this.data)
        }

        // 清空附件
        this.dataJson.doc_att = []
        this.dataJson.doc_att_file = []
        this.dataJson.doc_att_files = []

        // 重新计算总数量和总金额
        this.calculateTotals()

        // 清除表单验证错误
        this.$nextTick(() => {
          this.$refs.dataSubmitForm.clearValidate()
        })

        this.$message({
          type: 'success',
          message: '数据已重置'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消重置'
        })
      })
    },

    // 删除行数据
    handleDeleteRow (row, index) {
      this.$confirm('您确定要移除这行数据吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 从数组中删除指定行
        this.dataJson.tempJson.detailListData.splice(index, 1)

        // 重新计算总数量和总金额
        this.calculateTotals()

        this.$message({
          type: 'success',
          message: '数据已删除'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>
