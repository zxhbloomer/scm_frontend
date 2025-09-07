<template>
  <div class="app-container">
    <div class="edit-container">
      <el-form
        ref="dataSubmitForm"
        v-loading="settings.loading"
        :rules="settings.rules"
        :model="dataJson.tempJson"
        label-position="right"
        label-width="150px"
        element-loading-text="正在处理，请稍后..."
        element-loading-background="rgba(255, 255, 255, 0.7)"
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

          <el-descriptions-item label="出库单编号">
            {{ dataJson.tempJson.code == null || dataJson.tempJson.code === ''?'系统自动生成':dataJson.tempJson.code }}
          </el-descriptions-item>

          <el-descriptions-item span="2">
            <div
              slot="label"
              class="required-mark"
            >
              出库类型
            </div>
            <el-form-item
              prop="type"
              label-width="0"
            >
              <radio-dict
                v-model="dataJson.tempJson.type"
                :value="dataJson.tempJson.type"
                :para="CONSTANTS.DICT_B_OUT_TYPE"
                :disabled="settings.inputDisabledStatus.disabledOutType"
                @change="handleTypeChange"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
            >
              货主
            </div>
            <el-form-item
              label-width="0"
            >
              {{ dataJson.tempJson.owner_name || '-' }}
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
            >
              客户
            </div>
            <el-form-item
              label-width="0"
            >
              {{ dataJson.tempJson.customer_name || '-' }}
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item />

          <el-descriptions-item label="备注" span="3">
            <el-form-item
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.remark"
                clearable
                placeholder="请输入备注"
                :maxlength="dataJson.inputSettings.maxLength.remark"
              />
            </el-form-item>
          </el-descriptions-item>

        </el-descriptions>

        <el-alert
          v-if="dataJson.contractOrderData.contract_info.contract_code"
          title="合同、订单信息"
          type="info"
          :closable="false"
          style="margin-top:10px;"
        />
        <el-descriptions
          v-if="dataJson.contractOrderData.contract_info.contract_code"
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >

          <el-descriptions-item label="项目编号">
            {{ dataJson.contractOrderData.project_info.project_code || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="项目名称">
            {{ dataJson.contractOrderData.project_info.project_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item />

          <el-descriptions-item label="合同编号">
            {{ dataJson.contractOrderData.contract_info.contract_code || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="合同类型">
            {{ dataJson.contractOrderData.contract_info.type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item />

          <el-descriptions-item label="客户">
            {{ dataJson.contractOrderData.contract_info.customer_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="销售方">
            {{ dataJson.contractOrderData.contract_info.seller_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item />

          <el-descriptions-item label="结算方式">
            {{ dataJson.contractOrderData.contract_info.settle_type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="付款方式">
            {{ dataJson.contractOrderData.contract_info.payment_type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="发票类型">
            {{ dataJson.contractOrderData.contract_info.bill_type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="合同有效期">
            {{ dataJson.contractOrderData.contract_info.expiry_date || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="发货日期">
            {{ dataJson.contractOrderData.contract_info.delivery_date || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="签约日期">
            {{ dataJson.contractOrderData.contract_info.sign_date || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="发货方式">
            {{ dataJson.contractOrderData.contract_info.delivery_type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="发货地点">
            {{ dataJson.contractOrderData.contract_info.delivery_location || '-' }}
          </el-descriptions-item>

          <el-descriptions-item />

          <el-descriptions-item label="销售订单编号">
            {{ dataJson.contractOrderData.order_info.order_code || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="订单状态">
            {{ dataJson.contractOrderData.order_info.status_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item />

          <el-descriptions-item label="发货方式">
            {{ dataJson.contractOrderData.order_info.delivery_type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="发货日期">
            {{ dataJson.contractOrderData.order_info.delivery_date || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="发货地点">
            {{ dataJson.contractOrderData.order_info.delivery_location || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="订单总金额">
            {{ formatCurrency(dataJson.contractOrderData.order_info.amount_total, true) || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="订单总数量">
            {{ formatNumber(dataJson.contractOrderData.order_info.qty_total) || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="税额">
            {{ formatCurrency(dataJson.contractOrderData.order_info.tax_amount_total, true) || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="创建时间">
            {{ dataJson.contractOrderData.order_info.c_time || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="创建人">
            {{ dataJson.contractOrderData.order_info.c_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="修改时间">
            {{ dataJson.contractOrderData.order_info.u_time || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="商品规格编码" span="1">
            {{ dataJson.contractOrderData.goods_info.sku_code || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="商品名称" span="2">
            {{ dataJson.contractOrderData.goods_info.goods_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="规格" span="1">
            {{ dataJson.contractOrderData.goods_info.sku_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="数量" span="1">
            {{ formatNumber(dataJson.contractOrderData.goods_info.qty) || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="单价" span="1">
            {{ formatCurrency(dataJson.contractOrderData.goods_info.price, true) || '-' }}
          </el-descriptions-item>

        </el-descriptions>

        <el-alert
          title="出库单信息"
          type="info"
          :closable="false"
          style="margin-top:10px;"
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

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              仓库/库区/库位
            </div>
            <el-form-item
              prop="wlb_data"
              label-width="0"
            >
              <select-warehouse-location-bin
                v-model="dataJson.tempJson.wlb_data"
                :value="dataJson.tempJson.wlb_data"
                :placeholder="dataJson.tempJson.warehouse_location_bin_display || '请选择仓库/库区/库位'"
                :disabled="settings.inputDisabledStatus.disabledWarehouseSelect"
                @closeMeOk="handleWLBReturnData"
                @closeMeCancel="handleWLBDialogClose"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
            >
              商品规格编码
            </div>
            <el-form-item
              label-width="0"
            >
              <el-input
                v-model="dataJson.tempJson.sku_code"
                clearable
                placeholder="商品规格编码"
                :disabled="settings.inputDisabledStatus.disabledSkuCode"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
            >
              商品名称
            </div>
            <el-form-item
              label-width="0"
            >
              <el-input
                v-model="dataJson.tempJson.goods_name"
                clearable
                placeholder="商品名称"
                :disabled="settings.inputDisabledStatus.disabledGoodsName"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
            >
              规格
            </div>
            <el-form-item
              label-width="0"
            >
              <el-input
                v-model="dataJson.tempJson.sku_name"
                clearable
                placeholder="规格"
                :disabled="settings.inputDisabledStatus.disabledSkuName"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              原发数量
            </div>
            <el-form-item
              prop="original_qty"
              label-width="0"
            >
              <numeric
                v-model="dataJson.tempJson.original_qty"
                :decimal-places="4"
                :currency-symbol="''"
                :disabled="settings.inputDisabledStatus.disabledOriginalQty"
                @change="handleOriginalQtyChange"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              出库时间
            </div>
            <el-form-item
              prop="outbound_time"
              label-width="0"
            >
              <el-date-picker
                v-model="dataJson.tempJson.outbound_time"
                type="datetime"
                placeholder="选择出库时间"
                :disabled="settings.inputDisabledStatus.disabledOutboundTime"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              出库数量
            </div>
            <el-form-item
              prop="qty"
              label-width="0"
            >
              <numeric
                v-model="dataJson.tempJson.qty"
                :decimal-places="4"
                :currency-symbol="''"
                :disabled="settings.inputDisabledStatus.disabledQty"
                @change="handleQtyChange"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              出库单价
            </div>
            <el-form-item
              prop="price"
              label-width="0"
            >
              <numeric
                v-model="dataJson.tempJson.price"
                :decimal-places="2"
                :currency-symbol="'¥'"
                :disabled="settings.inputDisabledStatus.disabledPrice"
                @change="handlePriceChange"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
            >
              出库金额
            </div>
            <el-form-item
              label-width="0"
            >
              <span class="fontWeight">{{ formatCurrency(dataJson.tempJson.amount, true) }}</span>
            </el-form-item>
          </el-descriptions-item>

        </el-descriptions>

        <el-alert
          title="磅单文件"
          type="info"
          :closable="false"
          style="margin-top:10px;"
        />
        <el-descriptions
          title=""
          :column="1"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item>
            <div
              slot="label"
            >
              磅单
            </div>
            <el-form-item
              label-width="0"
            >
              <simple-upload-mutil-file
                ref="oneFileUpload"
                :limit="5"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
                @on-success="handleOneFileUploadSuccess"
                @on-error="handleFileError"
              />
              <div v-if="dataJson.one_file_url.length > 0" style="margin-top: 10px;">
                <preview-card
                  v-for="(url, index) in dataJson.one_file_url"
                  :key="index"
                  :url="url"
                  @remove="removeOneFile"
                />
              </div>
            </el-form-item>
          </el-descriptions-item>
        </el-descriptions>

        <el-alert
          title="出库附件明细"
          type="info"
          :closable="false"
          style="margin-top:10px;"
        />
        <el-descriptions
          title=""
          :column="1"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item>
            <div
              slot="label"
            >
              附件明细
            </div>
            <el-form-item
              label-width="0"
            >
              <simple-upload-mutil-file
                ref="twoFileUpload"
                :limit="5"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
                @on-success="handleTwoFileUploadSuccess"
                @on-error="handleFileError"
              />
              <div v-if="dataJson.two_file_url.length > 0" style="margin-top: 10px;">
                <preview-card
                  v-for="(url, index) in dataJson.two_file_url"
                  :key="index"
                  :url="url"
                  @remove="removeTwoFile"
                />
              </div>
            </el-form-item>
          </el-descriptions-item>
        </el-descriptions>

        <el-alert
          title="检验单"
          type="info"
          :closable="false"
          style="margin-top:10px;"
        />
        <el-descriptions
          title=""
          :column="1"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item>
            <div
              slot="label"
            >
              检验单
            </div>
            <el-form-item
              label-width="0"
            >
              <simple-upload-mutil-file
                ref="threeFileUpload"
                :limit="5"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
                @on-success="handleThreeFileUploadSuccess"
                @on-error="handleFileError"
              />
              <div v-if="dataJson.three_file_url.length > 0" style="margin-top: 10px;">
                <preview-card
                  v-for="(url, index) in dataJson.three_file_url"
                  :key="index"
                  :url="url"
                  @remove="removeThreeFile"
                />
              </div>
            </el-form-item>
          </el-descriptions-item>
        </el-descriptions>

        <el-alert
          title="货物照片"
          type="info"
          :closable="false"
          style="margin-top:10px;"
        />
        <el-descriptions
          title=""
          :column="1"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item>
            <div
              slot="label"
            >
              货物照片
            </div>
            <el-form-item
              label-width="0"
            >
              <simple-upload-mutil-file
                ref="fourFileUpload"
                :limit="5"
                accept=".jpg,.jpeg,.png,.gif"
                @on-success="handleFourFileUploadSuccess"
                @on-error="handleFileError"
              />
              <div v-if="dataJson.four_file_url.length > 0" style="margin-top: 10px;">
                <preview-card
                  v-for="(url, index) in dataJson.four_file_url"
                  :key="index"
                  :url="url"
                  @remove="removeFourFile"
                />
              </div>
            </el-form-item>
          </el-descriptions-item>
        </el-descriptions>

        <div class="dialog-footer">
          <el-button size="small" @click="handleReset">
            重置
          </el-button>
          <el-button size="small" @click="handleCancel">
            取消
          </el-button>
          <el-button type="primary" size="small" @click="startProcess">
            提交
          </el-button>
        </div>

      </el-form>
    </div>

    <!-- 审批流程弹窗 -->
    <bpm-dialog
      :visible="popSettingsData.sponsorDialog.visible"
      :serial-type="popSettingsData.sponsorDialog.serial_type"
      :form-data="popSettingsData.sponsorDialog.form_data"
      :initial-process="popSettingsData.sponsorDialog.initial_process"
      :process-users="popSettingsData.sponsorDialog.process_users"
      @closeMeCancel="handleBpmDialogCancel"
      @closeMeOk="handleBpmDialogOk"
    />

    <!-- 销售订单关联单号弹窗 -->
    <so-order-list-dialog
      v-if="popSettingsData.soOrderDialog.visible"
      :visible="popSettingsData.soOrderDialog.visible"
      :data="popSettingsData.soOrderDialog.data"
      title="添加关联单-销售订单"
      @closeMeOk="handleSoOrderCloseOk"
      @closeMeCancel="handleSoOrderCloseCancel"
    />

    <!-- 销售订单详情弹窗 -->
    <so-order-detail-dialog
      v-if="popSettingsData.soOrderDetailDialog.visible"
      :visible="popSettingsData.soOrderDetailDialog.visible"
      :data="popSettingsData.soOrderDetailDialog.data"
      @closeMeCancel="handleSoOrderDetailCloseCancel"
      @generateOutStock="handleGenerateOutStockFromOrder"
    />
  </div>
</template>

<script>
import deepCopy from 'deep-copy'
import constants_dict from '@/common/constants/constants_dict'
import constants_bpm from '@/common/constants/constants_bpm'
import constants_para from '@/common/constants/constants_para'
import { insertApi, validateApi } from '@/api/40_business/40_out/out/out'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import { EventBus } from '@/common/eventbus/eventbus'

// 导入组件
import numeric from '@/components/40_input/numeric/index.vue'
import RadioDict from '@/components/00_dict/redio/index.vue'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import SelectWarehouseLocationBin from '@/views/30_wms/warehouse/components/selectgrid/selectWarehouseLocationBin.vue'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'
import SoOrderListDialog from '@/views/40_business/20_so/soorder/dialog/listfor/outplan/index.vue'
import SoOrderDetailDialog from '@/views/40_business/40_out/out/dialog/soorder/detail/index.vue'

export default {
  name: 'OutNew',
  components: {
    numeric,
    RadioDict,
    SimpleUploadMutilFile,
    PreviewCard,
    SelectWarehouseLocationBin,
    BpmDialog,
    SoOrderListDialog,
    SoOrderDetailDialog
  },
  data () {
    return {
      // 样式设置
      contentStyle: {
        width: '15%'
      },
      labelStyle: {
        width: '10%',
        'text-align': 'right'
      },
      // 弹出窗口设置
      popSettingsData: {
        // 审批流程设置
        sponsorDialog: {
          visible: false,
          serial_type: constants_bpm.BPM_B_OUT,
          form_data: {},
          initial_process: null,
          process_users: []
        },
        // 销售订单关联单号弹窗
        soOrderDialog: {
          visible: false,
          data: {}
        },
        // 销售订单详情弹窗
        soOrderDetailDialog: {
          visible: false,
          data: {}
        }
      },
      dataJson: {
        // 合同订单数据
        contractOrderData: {
          // 项目信息
          project_info: {
            project_id: null,
            project_code: '',
            project_name: ''
          },
          // 合同信息
          contract_info: {
            contract_id: null,
            contract_code: '',
            type_name: '',
            customer_id: null,
            customer_name: '',
            seller_id: null,
            seller_name: '',
            payment_type_name: '',
            settle_type_name: '',
            bill_type_name: '',
            delivery_type_name: '',
            expiry_date: '',
            delivery_date: '',
            sign_date: '',
            delivery_location: '',
            remark: ''
          },
          // 订单信息
          order_info: {
            order_id: null,
            order_code: '',
            status_name: '',
            delivery_type_name: '',
            delivery_date: '',
            delivery_location: '',
            amount_total: null,
            qty_total: null,
            tax_amount_total: null,
            c_time: '',
            c_name: '',
            u_time: ''
          },
          // 选中的商品信息
          goods_info: {
            goods_id: null,
            goods_code: '',
            goods_name: '',
            sku_id: null,
            sku_code: '',
            sku_name: '',
            qty: null,
            price: null,
            amount: null,
            tax_rate: null,
            tax_amount: null
          }
        },
        // 单条数据 json
        tempJson: {
          code: '',
          type: '',
          type_name: '',
          owner_id: null,
          owner_name: '',
          owner_code: '',
          customer_id: null,
          customer_name: '',
          customer_code: '',
          order_id: null,
          order_code: '',
          contract_code: '',
          sku_id: null,
          sku_code: '',
          goods_name: '',
          sku_name: '',
          warehouse_id: null,
          warehouse_code: '',
          warehouse_name: '',
          location_id: null,
          location_code: '',
          location_name: '',
          bin_id: null,
          bin_code: '',
          bin_name: '',
          warehouse_location_bin_display: '',
          wlb_data: null,
          original_qty: null,
          qty: null,
          price: null,
          amount: null,
          outbound_time: null,
          remark: '',
          one_file: [],
          two_file: [],
          three_file: [],
          four_file: [],
          detailListData: [] // 出库单明细数据
        },
        inputSettings: {
          maxLength: {
            remark: 200
          }
        },
        searchForm: {
          reset: false
        },
        // 文件相关数组
        one_file: [],
        one_file_url: [],
        two_file: [],
        two_file_url: [],
        three_file: [],
        three_file_url: [],
        four_file: [],
        four_file_url: []
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: false,
        duration: 4000,
        // 输入框禁用状态
        inputDisabledStatus: {
          disabledOutType: false, // 出库类型控件
          disabledWarehouseSelect: true, // 仓库库区库位选择控件
          disabledSkuCode: true, // 商品规格编号
          disabledGoodsName: true, // 商品名称
          disabledSkuName: true, // 规格
          disabledOriginalQty: true, // 原发数量
          disabledOutboundTime: true, // 出库时间
          disabledQty: true, // 出库数量
          disabledPrice: true // 出库单价
        },
        rules: {
          type: [
            { required: true, message: '请选择出库类型', trigger: 'change' }
          ],
          wlb_data: [
            { required: true, validator: this.wlb_data_validator, trigger: 'change' }
          ],
          original_qty: [
            { required: true, message: '请输入原发数量', trigger: 'blur' }
          ],
          outbound_time: [
            { required: true, message: '请选择出库时间', trigger: 'change' }
          ],
          qty: [
            { required: true, message: '请输入出库数量', trigger: 'blur' }
          ],
          price: [
            { required: true, message: '请输入出库单价', trigger: 'blur' }
          ]
        }
      }
    }
  },
  computed: {
    /**
     * 当前的用户信息
     */
    currentUser () {
      return this.$store.getters.userInfo
    },
    /**
     * 字典常量
     */
    CONSTANTS () {
      return constants_dict
    }
  },
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
    this.initData()
  },
  methods: {
    /**
     * 重置数据
     */
    resetDataJson () {
      // 获取组件的初始数据状态
      const initialData = this.$options.data.call(this)
      // 重置tempJson
      this.dataJson.tempJson = deepCopy(this.$options.data.call(this).dataJson.tempJson)
      // 重置合同订单数据
      this.dataJson.contractOrderData = deepCopy(initialData.dataJson.contractOrderData)
      // 重置文件相关数组
      this.dataJson.one_file = []
      this.dataJson.one_file_url = []
      this.dataJson.two_file = []
      this.dataJson.two_file_url = []
      this.dataJson.three_file = []
      this.dataJson.three_file_url = []
      this.dataJson.four_file = []
      this.dataJson.four_file_url = []
    },
    /**
     * 重置数据
     */
    initData () {
      // 获取组件的初始数据状态
      const initialData = this.$options.data.call(this)
      // 重置tempJson
      this.dataJson.tempJson = deepCopy(this.$options.data.call(this).dataJson.tempJson)
      // 重置合同订单数据
      this.dataJson.contractOrderData = deepCopy(initialData.dataJson.contractOrderData)
      // 重置文件相关数组
      this.dataJson.one_file = []
      this.dataJson.one_file_url = []
      this.dataJson.two_file = []
      this.dataJson.two_file_url = []
      this.dataJson.three_file = []
      this.dataJson.three_file_url = []
      this.dataJson.four_file = []
      this.dataJson.four_file_url = []
      // 初始化时出库类型控件可用，"出库单信息"所有控件都不可用
      this.settings.inputDisabledStatus = deepCopy(initialData.settings.inputDisabledStatus)
    },
    /**
     * 取消
     */
    handleCancel () {
      this.$emit('closeMeCancel')
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
          // 基本业务逻辑校验
          if (!tempData.type) {
            this.closeLoading()
            this.showErrorMsg('请选择出库类型')
            return
          }
          if (!tempData.warehouse_id) {
            this.closeLoading()
            this.showErrorMsg('请选择仓库/库区/库位')
            return
          }
          if (!tempData.qty || tempData.qty <= 0) {
            this.closeLoading()
            this.showErrorMsg('请输入有效的出库数量')
            return
          }
          if (!tempData.price || tempData.price <= 0) {
            this.closeLoading()
            this.showErrorMsg('请输入有效的出库单价')
            return
          }

          validateApi(tempData).then(_data => {
            if (_data.success) {
              // 获取审批流程
              this.getFlow()
            } else {
              this.closeLoading()
              this.showErrorMsg(_data.data.message)
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
     * 新增数据
     */
    doInsert () {
      this.showLoading('正在保存，请稍后...')

      // 构建符合BOutVo结构的提交数据
      const tempData = this.buildSubmissionData()

      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          // 调用新增接口
          insertApi(tempData)
            .then(
              _data => {
                this.closeLoading()
                this.$emit('closeMeOk', _data.data)
                // 通知兄弟组件，新增数据更新 - 将完整数据传递给列表页面
                setTimeout(() => {
                  EventBus.$emit(this.EMITS.EMIT_MST_B_OUT_NEW_OK, _data.data)
                }, 1000)
                this.$notify({
                  title: '新增成功',
                  message: _data.data.message,
                  type: 'success',
                  duration: this.settings.duration
                })
                this.resetDataJson()
              },
              _error => {
                this.closeLoading()
                this.showErrorMsg(_error.error.message)
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
    /**
     * 构建提交数据 - 按照BOutVo结构组织数据
     */
    buildSubmissionData () {
      const formData = this.dataJson.tempJson
      const contractData = this.dataJson.contractOrderData

      // 构建符合BOutVo结构的数据
      const submissionData = {
        // 基本信息
        code: formData.code || null, // 出库单号 - 后端自动生成
        type: formData.type, // 出库类型
        type_name: formData.type_name || '', // 类型名称

        // 合同订单信息
        contract_id: contractData.contract_info?.contract_id || '', // 合同编号
        contract_code: contractData.contract_info?.contract_code, // 合同编号
        order_id: contractData.order_info?.order_id, // 订单编号
        order_code: contractData.order_info?.order_code || '', // 订单编号
        // 货主信息
        owner_id: formData.owner_id, // 货主id
        owner_code: formData.owner_code || '', // 货主编码
        owner_name: formData.owner_name || '', // 货主名称

        // 客户信息
        customer_id: formData.customer_id, // 客户id
        customer_code: formData.customer_code || '', // 客户编码
        customer_name: formData.customer_name || '', // 客户名称

        // 商品信息
        sku_id: formData.sku_id, // 商品规格ID
        sku_code: formData.sku_code || '', // 物料编码
        goods_name: formData.goods_name || '', // 商品名称
        sku_name: formData.sku_name || '', // 规格

        // 仓库信息
        warehouse_id: formData.warehouse_id, // 出库仓库id
        warehouse_name: formData.warehouse_name || '', // 仓库名称
        location_id: formData.location_id, // 出库库区id
        location_name: formData.location_name || '', // 库区名称
        bin_id: formData.bin_id, // 出库库位id
        bin_name: formData.bin_name || '', // 库位名称

        // 数量和金额信息
        original_qty: formData.original_qty, // 原发数量
        qty: formData.qty, // 出库数量
        price: formData.price, // 单价
        amount: formData.amount, // 出库金额

        // 时间信息
        outbound_time: formData.outbound_time, // 出库时间

        // 备注
        remark: formData.remark || '', // 备注

        // 校验类型
        check_type: constants_para.INSERT_CHECK_TYPE,

        // 审批流程数据
        initial_process: this.popSettingsData.sponsorDialog.initial_process, // 流程
        form_data: this.popSettingsData.sponsorDialog.form_data, // 表单参数
        process_users: this.popSettingsData.sponsorDialog.process_users, // 自选用户

        // 附件信息
        one_file: formData.one_file || [], // 磅单文件
        two_file: formData.two_file || [], // 出库附件明细
        three_file: formData.three_file || [], // 检验单
        four_file: formData.four_file || [] // 货物照片
      }

      // 添加销售订单相关信息（如果是销售出库类型）
      // if (formData.type === constants_dict.DICT_B_OUT_TYPE_XS) {
      //   submissionData.order_id = formData.order_id
      //   submissionData.order_code = formData.order_code
      //   submissionData.contract_id = formData.contract_id
      //   submissionData.contract_code = formData.contract_code
      // }

      console.log('=== 构建的提交数据 ===')
      console.log('提交数据结构:', submissionData)

      return submissionData
    },
    /**
     * 获取审批流程
     */
    getFlow () {
      // 校验是否存在审批流程
      getFlowProcessApi({ 'serial_type': this.popSettingsData.sponsorDialog.serial_type })
        .then((rsp) => {
          if (rsp.data === null) {
            this.showErrorMsg('未找到审批流程，请联系管理员')
            this.closeLoading()
          } else {
            // 流程参数
            this.popSettingsData.sponsorDialog.form_data = { }
            // 启动审批流弹窗
            this.popSettingsData.sponsorDialog.visible = true
          }
        }).catch((err) => {
          this.closeLoading()
          this.showErrorMsg(err)
        })
    },
    /**
     * 审批流弹窗取消
     */
    handleBpmDialogCancel () {
      console.log('关闭审批组件')
      this.popSettingsData.sponsorDialog.visible = false
      this.closeLoading()
    },
    /**
     * 审批流确定
     */
    handleBpmDialogOk (data) {
      this.popSettingsData.sponsorDialog.initial_process = data.processData
      this.popSettingsData.sponsorDialog.process_users = data.process_users
      this.popSettingsData.sponsorDialog.visible = false
      this.doInsert()
    },
    /**
     * 出库类型选择处理
     */
    handleTypeChange (val) {
      this.dataJson.tempJson.type = val
      // 如果选择的是销售出库，弹出销售订单选择弹窗
      if (val === constants_dict.DICT_B_OUT_TYPE_XS) {
        this.popSettingsData.soOrderDialog.visible = true
        this.popSettingsData.soOrderDialog.data = {}
      } else {
        // 其他类型出库，启用所有输入控件
        this.settings.inputDisabledStatus.disabledWarehouseSelect = false
        this.settings.inputDisabledStatus.disabledSkuCode = false
        this.settings.inputDisabledStatus.disabledGoodsName = false
        this.settings.inputDisabledStatus.disabledSkuName = false
        this.settings.inputDisabledStatus.disabledOriginalQty = false
        this.settings.inputDisabledStatus.disabledOutboundTime = false
        this.settings.inputDisabledStatus.disabledQty = false
        this.settings.inputDisabledStatus.disabledPrice = false
      }
    },
    /**
     * 原发数量变更处理
     */
    handleOriginalQtyChange (val) {
      // 原发数量变更时的逻辑处理
    },
    /**
     * 出库数量变更处理
     */
    handleQtyChange (val) {
      // 出库数量变更时自动计算金额
      this.calculateAmount()
    },
    /**
     * 出库单价变更处理
     */
    handlePriceChange (val) {
      // 出库单价变更时自动计算金额
      this.calculateAmount()
    },
    /**
     * 计算金额
     */
    calculateAmount () {
      if (this.dataJson.tempJson.qty && this.dataJson.tempJson.price) {
        this.dataJson.tempJson.amount = this.dataJson.tempJson.qty * this.dataJson.tempJson.price
      } else {
        this.dataJson.tempJson.amount = null
      }
    },
    /**
     * 磅单文件上传成功处理
     */
    handleOneFileUploadSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.one_file.push(res.response.data)
      this.dataJson.one_file_url.push(res.response.data.url)
      this.dataJson.tempJson.one_file = this.dataJson.one_file
    },
    /**
     * 出库附件明细上传成功处理
     */
    handleTwoFileUploadSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.two_file.push(res.response.data)
      this.dataJson.two_file_url.push(res.response.data.url)
      this.dataJson.tempJson.two_file = this.dataJson.two_file
    },
    /**
     * 检验单上传成功处理
     */
    handleThreeFileUploadSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.three_file.push(res.response.data)
      this.dataJson.three_file_url.push(res.response.data.url)
      this.dataJson.tempJson.three_file = this.dataJson.three_file
    },
    /**
     * 货物照片上传成功处理
     */
    handleFourFileUploadSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.four_file.push(res.response.data)
      this.dataJson.four_file_url.push(res.response.data.url)
      this.dataJson.tempJson.four_file = this.dataJson.four_file
    },
    /**
     * 文件上传失败处理
     */
    handleFileError (error) {
      this.showErrorMsg('文件上传失败：' + error.message)
    },
    /**
     * 删除磅单文件
     */
    removeOneFile (url) {
      // 获取下标
      const _index = this.dataJson.one_file_url.lastIndexOf(url)
      // 从数组中移除
      this.dataJson.one_file.splice(_index, 1)
      this.dataJson.one_file_url.splice(_index, 1)
      this.dataJson.tempJson.one_file = this.dataJson.one_file
    },
    /**
     * 删除出库附件明细
     */
    removeTwoFile (url) {
      // 获取下标
      const _index = this.dataJson.two_file_url.lastIndexOf(url)
      // 从数组中移除
      this.dataJson.two_file.splice(_index, 1)
      this.dataJson.two_file_url.splice(_index, 1)
      this.dataJson.tempJson.two_file = this.dataJson.two_file
    },
    /**
     * 删除检验单
     */
    removeThreeFile (url) {
      // 获取下标
      const _index = this.dataJson.three_file_url.lastIndexOf(url)
      // 从数组中移除
      this.dataJson.three_file.splice(_index, 1)
      this.dataJson.three_file_url.splice(_index, 1)
      this.dataJson.tempJson.three_file = this.dataJson.three_file
    },
    /**
     * 删除货物照片
     */
    removeFourFile (url) {
      // 获取下标
      const _index = this.dataJson.four_file_url.lastIndexOf(url)
      // 从数组中移除
      this.dataJson.four_file.splice(_index, 1)
      this.dataJson.four_file_url.splice(_index, 1)
      this.dataJson.tempJson.four_file = this.dataJson.four_file
    },
    initComponent () {
      this.closeLoading()
      this.initData()
    },

    /**
     * 重置表单
     */
    handleReset () {
      // 确认重置操作
      this.$confirm('确定要重置页面数据吗？重置后所有输入的数据将丢失。', '确认重置', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认重置',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 执行重置操作 - 调用初始化组件方法
        this.initComponent()
        this.$notify({
          title: '重置成功',
          message: '页面数据已重置到初始状态',
          type: 'success',
          duration: this.settings.duration
        })
      }).catch(() => {
        // 用户取消重置
      })
    },
    /**
     * 销售订单弹窗确定
     */
    handleSoOrderCloseOk (val) {
      // 数据验证
      if (!val || !val.id) {
        this.$notify({
          title: '错误',
          message: '销售订单数据无效',
          type: 'error',
          duration: this.settings.duration
        })
        return
      }

      this.popSettingsData.soOrderDialog.visible = false

      // 设置销售订单相关信息
      this.dataJson.tempJson.order_id = val.id
      this.dataJson.tempJson.order_code = val.code
      this.dataJson.tempJson.contract_code = val.contract_code

      // 设置货主信息（使用销售订单中的主体企业作为货主）
      this.dataJson.tempJson.owner_id = val.seller_id
      this.dataJson.tempJson.owner_name = val.seller_name
      this.dataJson.tempJson.owner_code = val.seller_code

      // 设置客户信息
      this.dataJson.tempJson.customer_id = val.customer_id
      this.dataJson.tempJson.customer_name = val.customer_name
      this.dataJson.tempJson.customer_code = val.customer_code

      // 补充1：弹窗返回后，备注不需要设置值（保持为空）
      // 不对备注字段进行任何设置，保持用户之前输入的值或空值

      // 补充2：当有数据返回后，出库类型控件为不可用
      this.settings.inputDisabledStatus.disabledOutType = true

      // 启用出库单信息区域的控件，但商品信息字段保持不可用（从弹窗数据填充）
      this.settings.inputDisabledStatus.disabledWarehouseSelect = false
      this.settings.inputDisabledStatus.disabledSkuCode = true // 保持不可用，从弹窗数据填充
      this.settings.inputDisabledStatus.disabledGoodsName = true // 保持不可用，从弹窗数据填充
      this.settings.inputDisabledStatus.disabledSkuName = true // 保持不可用，从弹窗数据填充
      this.settings.inputDisabledStatus.disabledOriginalQty = false
      this.settings.inputDisabledStatus.disabledOutboundTime = false
      this.settings.inputDisabledStatus.disabledQty = false
      this.settings.inputDisabledStatus.disabledPrice = false

      // 打开销售订单详情弹窗
      // 使用 $nextTick 确保前一个弹窗完全关闭后再打开详情弹窗
      this.$nextTick(() => {
        this.popSettingsData.soOrderDetailDialog.data = val
        this.popSettingsData.soOrderDetailDialog.visible = true
      })

      this.$notify({
        title: '关联成功',
        message: '已关联销售订单：' + val.code,
        type: 'success',
        duration: this.settings.duration
      })
    },

    /**
     * 销售订单弹窗取消
     */
    handleSoOrderCloseCancel () {
      this.popSettingsData.soOrderDialog.visible = false
      // 清空出库类型选择
      this.dataJson.tempJson.type = ''
      // 启用出库类型控件，使其可点击
      this.settings.inputDisabledStatus.disabledOutType = false
      this.$notify({
        title: '操作提示',
        message: '已取消选择，请重新选择出库类型',
        type: 'info',
        duration: this.settings.duration
      })
    },

    /**
     * 销售订单详情弹窗关闭
     */
    handleSoOrderDetailCloseCancel () {
      this.popSettingsData.soOrderDetailDialog.visible = false
    },

    /**
     * 处理从销售订单生成出库单
     * @param {Object} data 从销售订单传来的数据
     */
    handleGenerateOutStockFromOrder (data) {
      try {
        console.log('=== 接收到生成出库单数据 ===')
        console.log('接收的数据:', data)
        // 设置合同订单数据
        if (data.project_info) {
          this.dataJson.contractOrderData.project_info = { ...data.project_info }
        }

        if (data.contract_info) {
          this.dataJson.contractOrderData.contract_info = { ...data.contract_info }
        }

        if (data.order_info) {
          this.dataJson.contractOrderData.order_info = { ...data.order_info }
        }

        if (data.goods_info) {
          this.dataJson.contractOrderData.goods_info = { ...data.goods_info }
        }

        // 自动填充出库单信息
        if (data.contract_info) {
          // 设置客户信息
          this.dataJson.tempJson.customer_id = data.contract_info.customer_id
          this.dataJson.tempJson.customer_name = data.contract_info.customer_name
          this.dataJson.tempJson.customer_code = data.contract_info.customer_code || ''

          // 设置货主信息（使用销售主体企业作为货主）
          this.dataJson.tempJson.owner_id = data.contract_info.seller_id
          this.dataJson.tempJson.owner_name = data.contract_info.seller_name
          this.dataJson.tempJson.owner_code = data.contract_info.seller_code || ''
        }

        // 填充商品相关信息
        if (data.goods_info) {
          // 填充商品信息字段
          this.dataJson.tempJson.sku_id = data.goods_info.sku_id || null
          this.dataJson.tempJson.sku_code = data.goods_info.sku_code || ''
          this.dataJson.tempJson.goods_name = data.goods_info.goods_name || ''
          this.dataJson.tempJson.sku_name = data.goods_info.sku_name || ''
          // 不再设置原发数量、出库数量和出库单价
          // this.dataJson.tempJson.original_qty = data.goods_info.qty
          // this.dataJson.tempJson.qty = data.goods_info.qty
          // this.dataJson.tempJson.price = data.goods_info.price
          // this.calculateAmount()
        }

        // 补充1：不设置备注信息，保持用户之前输入的值或空值
        // 注释掉备注设置逻辑
        // if (data.generate_remark) {
        //   this.dataJson.tempJson.remark = data.generate_remark
        // }

        // 设置出库类型为销售出库
        this.dataJson.tempJson.type = constants_dict.DICT_B_OUT_TYPE_XS

        // 补充2：当有数据返回后，出库类型控件为不可用
        this.settings.inputDisabledStatus.disabledOutType = true

        // 启用出库单信息区域的控件，但商品信息字段保持不可用（从弹窗数据填充）
        this.settings.inputDisabledStatus.disabledWarehouseSelect = false
        this.settings.inputDisabledStatus.disabledSkuCode = true // 保持不可用，从弹窗数据填充
        this.settings.inputDisabledStatus.disabledGoodsName = true // 保持不可用，从弹窗数据填充
        this.settings.inputDisabledStatus.disabledSkuName = true // 保持不可用，从弹窗数据填充
        this.settings.inputDisabledStatus.disabledOriginalQty = false
        this.settings.inputDisabledStatus.disabledOutboundTime = false
        this.settings.inputDisabledStatus.disabledQty = false
        this.settings.inputDisabledStatus.disabledPrice = false

        // 显示成功提示
        this.$notify({
          title: '生成成功',
          message: '已成功从销售订单生成出库单信息，请完善其他必要信息后提交',
          type: 'success',
          duration: this.settings.duration
        })

        console.log('=== 出库单数据填充完成 ===')
        console.log('当前出库单数据:', this.dataJson.tempJson)
        console.log('合同订单数据:', this.dataJson.contractOrderData)
      } catch (error) {
        console.error('=== 处理生成出库单数据失败 ===')
        console.error('错误信息:', error)

        this.$message.error('生成出库单失败，请重试')
      }
    },

    /**
     * 格式化货币
     * @param {Number} value 数值
     * @param {Boolean} showSymbol 是否显示货币符号
     * @returns {String} 格式化后的货币字符串
     */
    formatCurrency (value, showSymbol = false) {
      if (value === null || value === undefined || value === '') {
        return showSymbol ? '¥0.00' : '0.00'
      }
      const num = parseFloat(value)
      if (isNaN(num)) {
        return showSymbol ? '¥0.00' : '0.00'
      }
      const formatted = num.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      return showSymbol ? `¥${formatted}` : formatted
    },

    /**
     * 仓库选择控件关闭事件
     */
    handleWLBDialogClose () {
      // 仓库选择控件关闭时的处理
    },

    /**
     * 仓库选择控件返回数据事件
     */
    handleWLBReturnData (val) {
      const { isNotEmpty } = require('@/utils')

      if (!isNotEmpty(val)) {
        this.dataJson.tempJson.wlb_data = null
        // 仓库
        this.dataJson.tempJson.warehouse_id = null
        this.dataJson.tempJson.warehouse_name = ''
        this.dataJson.tempJson.warehouse_code = ''
        // 库区
        this.dataJson.tempJson.location_id = null
        this.dataJson.tempJson.location_name = ''
        this.dataJson.tempJson.location_code = ''
        // 库位
        this.dataJson.tempJson.bin_id = null
        this.dataJson.tempJson.bin_name = ''
        this.dataJson.tempJson.bin_code = ''
        // 清空显示字段
        this.dataJson.tempJson.warehouse_location_bin_display = ''
      } else {
        this.dataJson.tempJson.wlb_data = val
        // 仓库
        this.dataJson.tempJson.warehouse_id = val.warehouse_id
        this.dataJson.tempJson.warehouse_name = val.warehouse_name
        this.dataJson.tempJson.warehouse_code = val.warehouse_code
        // 库区
        this.dataJson.tempJson.location_id = val.location_id
        this.dataJson.tempJson.location_name = val.location_name
        this.dataJson.tempJson.location_code = val.location_code
        // 库位
        this.dataJson.tempJson.bin_id = val.id
        this.dataJson.tempJson.bin_name = val.name
        this.dataJson.tempJson.bin_code = val.code

        // 构建显示文本
        let displayText = ''
        if (val.warehouse_name) {
          displayText += val.warehouse_name
        }
        if (val.location_name) {
          displayText += ' / ' + val.location_name
        }
        if (val.name) {
          displayText += ' / ' + val.name
        }
        this.dataJson.tempJson.warehouse_location_bin_display = displayText
      }
    },

    /**
     * 仓库数据校验
     */
    wlb_data_validator (rule, value, callback) {
      if (this.dataJson.tempJson.warehouse_id) {
        callback()
      } else {
        callback(new Error('请选择仓库/库区/库位'))
      }
    },

    /**
     * 格式化数字
     * @param {Number} value 数值
     * @param {Boolean} useComma 是否使用千分位分隔符
     * @param {Number} decimalPlaces 小数位数
     * @returns {String} 格式化后的数字字符串
     */
    formatNumber (value, useComma = false, decimalPlaces = 2) {
      if (value === null || value === undefined || value === '') {
        return '0'
      }
      const num = parseFloat(value)
      if (isNaN(num)) {
        return '0'
      }
      if (useComma) {
        return num.toLocaleString('zh-CN', {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces
        })
      } else {
        return num.toFixed(decimalPlaces)
      }
    }
  }
}
</script>

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

.fontWeight {
  font-weight: bold;
  color: #1890ff;
}
</style>
