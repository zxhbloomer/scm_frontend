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

          <el-descriptions-item label="入库单编号">
            {{ dataJson.tempJson.code || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="入库类型" span="2">
            {{ dataJson.tempJson.type_name || '-' }}
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
              供应商
            </div>
            <el-form-item
              label-width="0"
            >
              {{ dataJson.tempJson.supplier_name || '-' }}
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
          v-if="dataJson.tempJson.contract_code"
          title="合同、订单信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          v-if="dataJson.tempJson.contract_code"
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item label="合同编号">
            {{ dataJson.tempJson.contract_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            {{ dataJson.tempJson.po_contract_type_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="供应商">
            {{ dataJson.tempJson.supplier_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="主体企业">
            {{ dataJson.tempJson.purchaser_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="付款方式">
            {{ dataJson.tempJson.payment_type_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="结算方式">
            {{ dataJson.tempJson.settle_type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="交货日期">
            {{ dataJson.tempJson.delivery_date || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="交货地点" :span="2">
            {{ dataJson.tempJson.delivery_location || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单编号">
            {{ dataJson.tempJson.order_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            {{ dataJson.tempJson.po_order_status_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="运输方式">
            {{ dataJson.tempJson.delivery_type_name || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <el-alert
          title="入库信息"
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
          <el-descriptions-item>
            <div
              slot="label"
            >
              商品规格编号
            </div>
            <el-form-item
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.sku_code"
                :disabled="settings.inputDisabledStatus.disabledSkuCode"
                clearable
                placeholder="商品规格编号"
                readonly
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
                v-model.trim="dataJson.tempJson.goods_name"
                :disabled="settings.inputDisabledStatus.disabledGoodsName"
                clearable
                placeholder="商品名称"
                readonly
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
                v-model.trim="dataJson.tempJson.sku_name"
                :disabled="settings.inputDisabledStatus.disabledSkuName"
                clearable
                placeholder="规格"
                readonly
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              选择仓库/库区/库位
            </div>
            <el-form-item
              prop="wlb_data"
              label-width="0"
            >
              <select-warehouse-location-bin
                ref="warehouseLocationBinRef"
                :placeholder="'请选择仓库/库区/库位'"
                :disabled="settings.inputDisabledStatus.disabledWarehouseSelect"
                :placement="'bottom'"
                :value="dataJson.tempJson.warehouse_location_bin_display"
                @onReturnData="handleWLBReturnData"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              原发数量（吨）
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
                style="width: 100%"
                placeholder="请输入原发数量"
                @change.native="handleOriginalQtyChange"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item />

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              入库时间
            </div>
            <el-form-item
              prop="inbound_time"
              label-width="0"
            >
              <el-date-picker
                v-model="dataJson.tempJson.inbound_time"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                clearable
                placeholder="选择入库时间"
                style="width: 100%"
                :disabled="settings.inputDisabledStatus.disabledInboundTime"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              入库数量（吨）
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
                style="width: 100%"
                placeholder="请输入入库数量"
                @change.native="handleQtyChange"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              入库单价
            </div>
            <el-form-item
              prop="price"
              label-width="0"
            >
              <numeric
                v-model="dataJson.tempJson.price"
                :decimal-places="4"
                :disabled="settings.inputDisabledStatus.disabledPrice"
                style="width: 100%"
                placeholder="请输入入库单价"
                @change.native="handlePriceChange"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
            >
              入库金额
            </div>
            <el-form-item
              label-width="0"
            >
              {{ dataJson.tempJson.amount == null ? '-': formatCurrency(dataJson.tempJson.amount, true) }}
            </el-form-item>
          </el-descriptions-item>

        </el-descriptions>

        <el-alert
          title="附件信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          title=""
          :column="1"
          :label-style=" { width: '2.3%', 'text-align': 'right' }"
          :content-style="{ width: '15%'}"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >

          <el-descriptions-item label="磅单文件" span="3">
            <el-row style="display: flex;flex-wrap: wrap;">
              <simple-upload-mutil-file
                :accept="'*'"
                @upload-success="handleOneFileUploadSuccess"
                @upload-error="handleFileError"
              />
            </el-row>
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.tempJson.one_file"
                :key="i"
                :offset="0"
                :span="3"
              >
                <preview-card
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeOneFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>

          <el-descriptions-item label="入库附件明细" span="3">
            <el-row style="display: flex;flex-wrap: wrap;">
              <simple-upload-mutil-file
                :accept="'*'"
                @upload-success="handleTwoFileUploadSuccess"
                @upload-error="handleFileError"
              />
            </el-row>
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.tempJson.two_file"
                :key="i"
                :offset="0"
                :span="3"
              >
                <preview-card
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeTwoFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>

          <el-descriptions-item label="检验单" span="3">
            <el-row style="display: flex;flex-wrap: wrap;">
              <simple-upload-mutil-file
                :accept="'*'"
                @upload-success="handleThreeFileUploadSuccess"
                @upload-error="handleFileError"
              />
            </el-row>
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.tempJson.three_file"
                :key="i"
                :offset="0"
                :span="3"
              >
                <preview-card
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeThreeFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>

          <el-descriptions-item label="货物照片" span="3">
            <el-row style="display: flex;flex-wrap: wrap;">
              <simple-upload-mutil-file
                :accept="'*'"
                @upload-success="handleFourFileUploadSuccess"
                @upload-error="handleFileError"
              />
            </el-row>
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.tempJson.four_file"
                :key="i"
                :offset="0"
                :span="3"
              >
                <preview-card
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeFourFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>

        </el-descriptions>

      </el-form>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        type="primary"
        :disabled="settings.loading || settings.buttonDisabled.submitAndSave"
        :loading="settings.loading"
        size="medium"
        @click="startProcess()"
      >提交审批并保存</el-button>
      <el-button
        :disabled="settings.loading"
        :loading="settings.loading"
        size="medium"
        @click="handleCancel()"
      >返回</el-button>
    </div>

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

<script>
import numeric from '@/components/40_input/numeric'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import SelectWarehouseLocationBin from '@/views/30_wms/warehouse/selectgrid/selectWarehouseLocationBin.vue'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'

import constants_dict from '@/common/constants/constants_dict'
import constants_para from '@/common/constants/constants_para'
import deepCopy from 'deep-copy'
import { updateApi, getApi, validateApi } from '@/api/40_business/in/in'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  name: 'InEdit',
  components: {
    numeric,
    SimpleUploadMutilFile,
    PreviewCard,
    SelectWarehouseLocationBin,
    BpmDialog
  },
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      labelStyle: {
        width: '10%',
        'text-align': 'right'
      },
      contentStyle: {
        width: '15%'
      },
      // 数据json
      dataJson: {
        tempJson: {
          // 基本信息
          id: null,
          code: '',
          type: '',
          type_name: '',
          owner_id: null,
          owner_code: '',
          owner_name: '',
          supplier_id: null,
          supplier_code: '',
          supplier_name: '',
          // 合同订单信息
          contract_id: null,
          contract_code: '',
          po_contract_type: '',
          po_contract_type_name: '',
          order_id: null,
          order_code: '',
          po_order_status: '',
          po_order_status_name: '',
          purchaser_name: '',
          payment_type_name: '',
          settle_type_name: '',
          delivery_date: '',
          delivery_location: '',
          delivery_type_name: '',
          // 入库信息
          sku_id: null,
          sku_code: '',
          goods_id: null,
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
          inbound_time: null,
          remark: '',
          one_file: [],
          two_file: [],
          three_file: [],
          four_file: [],
          detailListData: [] // 入库单明细数据
        },
        tempJsonOriginal: {},
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
        // 按钮状态控制
        buttonDisabled: {
          submitAndSave: true // 提交审批并保存按钮状态，默认禁用
        },
        // 输入框禁用状态
        inputDisabledStatus: {
          disabledWarehouseSelect: false, // 仓库库区库位选择控件
          disabledSkuCode: true, // 商品规格编号
          disabledGoodsName: true, // 商品名称
          disabledSkuName: true, // 规格
          disabledOriginalQty: false, // 原发数量
          disabledInboundTime: false, // 入库时间
          disabledQty: false, // 入库数量
          disabledPrice: false // 入库单价
        },
        rules: {
          wlb_data: [
            { required: true, validator: this.wlb_data_validator, trigger: 'change' }
          ],
          original_qty: [
            { required: true, message: '请输入原发数量', trigger: 'blur' },
            { validator: this.original_qty_validator, trigger: 'blur' }
          ],
          inbound_time: [
            { required: true, message: '请选择入库时间', trigger: 'change' }
          ],
          qty: [
            { required: true, message: '请输入入库数量', trigger: 'blur' },
            { validator: this.qty_validator, trigger: 'blur' }
          ],
          price: [
            { required: true, message: '请输入入库单价', trigger: 'blur' },
            { validator: this.price_validator, trigger: 'blur' }
          ]
        }
      },
      // 弹窗设置
      popSettingsData: {
        // 审批流程设置
        sponsorDialog: {
          visible: false,
          serial_type: 'b_in', // 入库单更新审批流程
          form_data: {},
          initial_process: null,
          process_users: []
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
    // 监听 dataJson.tempJson 的变化，有变更时启用提交审批并保存按钮
    'dataJson.tempJson': {
      handler (newVal, oldVal) {
        // 启用提交审批并保存按钮
        this.settings.buttonDisabled.submitAndSave = false
      },
      deep: true // 深度监听对象内部属性的变化
    },
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
  methods: {
    /**
     * 初始化处理
     */
    init () {
      this.settings.loading = true
      this.getData()
    },

    /**
     * 获取入库单数据
     */
    getData () {
      this.settings.loading = true
      getApi({ id: this.data.id }).then(response => {
        console.log('获取入库单数据:', response.data)

        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.tempJsonOriginal = deepCopy(response.data)
        this.dataJson.tempJson.idx = this.data.idx

        // 初始化附件数据
        if (!this.dataJson.tempJson.one_file) {
          this.dataJson.tempJson.one_file = []
        }
        if (!this.dataJson.tempJson.two_file) {
          this.dataJson.tempJson.two_file = []
        }
        if (!this.dataJson.tempJson.three_file) {
          this.dataJson.tempJson.three_file = []
        }
        if (!this.dataJson.tempJson.four_file) {
          this.dataJson.tempJson.four_file = []
        }
        // 设置仓库库区库位显示文本
        this.setWarehouseLocationBinDisplay()
        // 计算金额
        this.calculateAmount()
      }).finally(() => {
        // 数据加载完成后，将按钮设置为禁用状态
        this.settings.buttonDisabled.submitAndSave = true
        this.settings.loading = false
      })
    },

    /**
     * 设置仓库库区库位显示文本
     */
    setWarehouseLocationBinDisplay () {
      let displayText = ''
      if (this.dataJson.tempJson.warehouse_name) {
        displayText += this.dataJson.tempJson.warehouse_name
      }
      if (this.dataJson.tempJson.location_name) {
        displayText += ' / ' + this.dataJson.tempJson.location_name
      }
      if (this.dataJson.tempJson.bin_name) {
        displayText += ' / ' + this.dataJson.tempJson.bin_name
      }
      this.dataJson.tempJson.warehouse_location_bin_display = displayText

      // 确保组件能接收到正确的值
      this.$nextTick(() => {
        if (this.$refs.warehouseLocationBinRef) {
          this.$refs.warehouseLocationBinRef.dataJson.filterText = displayText
          this.$refs.warehouseLocationBinRef.dataJson.filterTextCopy = displayText
        }
      })
    },

    /**
     * 取消
     */
    handleCancel () {
      this.$emit('closeMeCancel')
    },

    /**
     * 原发数量变更
     */
    handleOriginalQtyChange () {
      this.calculateAmount()
    },

    /**
     * 入库数量变更
     */
    handleQtyChange () {
      this.calculateAmount()
    },

    /**
     * 入库单价变更
     */
    handlePriceChange () {
      this.calculateAmount()
    },

    /**
     * 计算金额
     */
    calculateAmount () {
      const qty = parseFloat(this.dataJson.tempJson.qty) || 0
      const price = parseFloat(this.dataJson.tempJson.price) || 0
      this.dataJson.tempJson.amount = qty * price
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
     * 原发数量校验
     */
    original_qty_validator (rule, value, callback) {
      if (!this.dataJson.tempJson.original_qty) {
        callback(new Error('请输入原发数量'))
        return
      }
      const qty = parseFloat(this.dataJson.tempJson.original_qty)
      if (isNaN(qty) || qty <= 0) {
        callback(new Error('原发数量必须大于0'))
        return
      }
      callback()
    },

    /**
     * 入库数量校验
     */
    qty_validator (rule, value, callback) {
      if (!this.dataJson.tempJson.qty) {
        callback(new Error('请输入入库数量'))
        return
      }
      const qty = parseFloat(this.dataJson.tempJson.qty)
      if (isNaN(qty) || qty <= 0) {
        callback(new Error('入库数量必须大于0'))
        return
      }
      callback()
    },

    /**
     * 入库单价校验
     */
    price_validator (rule, value, callback) {
      if (!this.dataJson.tempJson.price) {
        callback(new Error('请输入入库单价'))
        return
      }
      const price = parseFloat(this.dataJson.tempJson.price)
      if (isNaN(price) || price <= 0) {
        callback(new Error('入库单价必须大于0'))
        return
      }
      callback()
    },

    /**
     * 磅单文件上传成功
     */
    handleOneFileUploadSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.tempJson.one_file.push(res.response.data)
      console.log('磅单文件上传成功', res.response)
    },

    /**
     * 删除磅单文件
     */
    removeOneFile (val) {
      const _index = this.dataJson.tempJson.one_file.findIndex(item => item.url === val)
      this.dataJson.tempJson.one_file.splice(_index, 1)
    },

    /**
     * 入库附件明细上传成功
     */
    handleTwoFileUploadSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.tempJson.two_file.push(res.response.data)
      console.log('入库附件明细上传成功', res.response)
    },

    /**
     * 删除入库附件明细
     */
    removeTwoFile (val) {
      const _index = this.dataJson.tempJson.two_file.findIndex(item => item.url === val)
      this.dataJson.tempJson.two_file.splice(_index, 1)
    },

    /**
     * 检验单上传成功
     */
    handleThreeFileUploadSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.tempJson.three_file.push(res.response.data)
      console.log('检验单上传成功', res.response)
    },

    /**
     * 删除检验单
     */
    removeThreeFile (val) {
      const _index = this.dataJson.tempJson.three_file.findIndex(item => item.url === val)
      this.dataJson.tempJson.three_file.splice(_index, 1)
    },

    /**
     * 货物照片上传成功
     */
    handleFourFileUploadSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.tempJson.four_file.push(res.response.data)
      console.log('货物照片上传成功', res.response)
    },

    /**
     * 删除货物照片
     */
    removeFourFile (val) {
      const _index = this.dataJson.tempJson.four_file.findIndex(item => item.url === val)
      this.dataJson.tempJson.four_file.splice(_index, 1)
    },

    /**
     * 文件上传失败
     */
    handleFileError () {
      console.debug('文件上传失败')
      this.showErrorMsg('文件上传发生错误！')
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
          // 基本业务逻辑校验
          if (!tempData.warehouse_id) {
            this.closeLoading()
            this.showErrorMsg('请选择仓库/库区/库位')
            return
          }
          if (!tempData.original_qty || tempData.original_qty <= 0) {
            this.closeLoading()
            this.showErrorMsg('请输入有效的原发数量')
            return
          }
          if (!tempData.inbound_time) {
            this.closeLoading()
            this.showErrorMsg('请选择入库时间')
            return
          }
          if (!tempData.qty || tempData.qty <= 0) {
            this.closeLoading()
            this.showErrorMsg('请输入有效的入库数量')
            return
          }
          if (!tempData.price || tempData.price <= 0) {
            this.closeLoading()
            this.showErrorMsg('请输入有效的入库单价')
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
     * 获取审批流程
     */
    getFlow () {
      getFlowProcessApi({ 'serial_type': this.popSettingsData.sponsorDialog.serial_type })
        .then((rsp) => {
          if (rsp.data === null) {
            this.showErrorMsg('未找到审批流程，请联系管理员')
            this.closeLoading()
          } else {
            this.popSettingsData.sponsorDialog.form_data = {}
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
      this.popSettingsData.sponsorDialog.visible = false
      this.closeLoading()
    },

    /**
     * 审批流弹窗确定
     */
    handleBpmDialogOk (data) {
      this.popSettingsData.sponsorDialog.initial_process = data.processData
      this.popSettingsData.sponsorDialog.process_users = data.process_users
      this.popSettingsData.sponsorDialog.visible = false
      this.doUpdate()
    },

    /**
     * 执行更新操作
     */
    doUpdate () {
      // 开始综合验证
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)
          // 审批流程启动数据
          tempData.initial_process = this.popSettingsData.sponsorDialog.initial_process // 流程
          tempData.form_data = this.popSettingsData.sponsorDialog.form_data // 表单参数
          tempData.process_users = this.popSettingsData.sponsorDialog.process_users // 自选用户

          this.settings.loading = true
          updateApi(tempData)
            .then(
              _data => {
                this.settings.loading = false
                this.$emit('closeMeOk', _data.data)
                // 通知兄弟组件，数据更新
                setTimeout(() => {
                  EventBus.$emit(this.EMITS.EMIT_MST_B_IN_UPDATE_OK, _data.data)
                }, 1000)
                this.$notify({
                  title: '更新成功',
                  message: _data.data.message,
                  type: 'success',
                  duration: this.settings.duration
                })
              },
              _error => {
                this.settings.loading = false
                this.$notify({
                  title: '更新失败',
                  message: _error.error.message,
                  type: 'error',
                  duration: this.settings.duration
                })
              }
            )
            .finally(() => {
              this.settings.loading = false
            })
        } else {
          this.settings.loading = false
        }
      })
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
