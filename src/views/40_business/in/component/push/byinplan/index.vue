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
            {{ dataJson.tempJson.code == null || dataJson.tempJson.code === ''?'系统自动生成':dataJson.tempJson.code }}
          </el-descriptions-item>

          <el-descriptions-item span="2">
            <div
              slot="label"
              class="required-mark"
            >
              入库类型
            </div>
            <el-form-item
              prop="type"
              label-width="0"
            >
              <radio-dict
                v-model="dataJson.tempJson.type"
                :value="dataJson.tempJson.type"
                :para="CONSTANTS.DICT_B_IN_TYPE"
                :disabled="true"
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

        <!-- 入库计划信息 -->
        <el-alert
          title="入库计划信息"
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
          <el-descriptions-item label="计划编号">
            {{ dataJson.planData.plan_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="计划入库时间">
            {{ dataJson.planData.plan_time || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="超收比例(%)">
            {{ dataJson.planData.over_receipt_rate == null ? '-' : formatNumber(dataJson.planData.over_receipt_rate, true, 2) }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" span="3">
            {{ dataJson.planData.remark || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="附件材料" span="3">
            <preview-description
              v-if="dataJson.planData.doc_att_files && dataJson.planData.doc_att_files.length > 0"
              :attachment-files="dataJson.planData.doc_att_files"
            />
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 合同订单信息 -->
        <el-alert
          title="合同订单信息"
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
            {{ dataJson.contractData.contract_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单编号">
            {{ dataJson.orderData.order_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="合同状态">
            {{ dataJson.contractData.status_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            {{ dataJson.orderData.status_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="交货日期">
            {{ dataJson.contractData.delivery_date || dataJson.orderData.delivery_date || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="交货地点">
            {{ dataJson.contractData.delivery_location || dataJson.orderData.delivery_location || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="合同金额">
            {{ dataJson.contractData.amount_total == null ? '-' : formatCurrency(dataJson.contractData.amount_total, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="订单金额">
            {{ dataJson.orderData.amount_total == null ? '-' : formatCurrency(dataJson.orderData.amount_total, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="合同签订日期">
            {{ dataJson.contractData.sign_date || '-' }}
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
          <el-descriptions-item label="商品规格编号">
            {{ dataJson.tempJson.sku_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="商品名称">
            {{ dataJson.tempJson.goods_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="规格">
            {{ dataJson.tempJson.sku_name || '-' }}
          </el-descriptions-item>

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
                ref="warehouseLocationBinRef"
                :placeholder="'请选择仓库/库区/库位'"
                :disabled="false"
                :placement="'bottom'"
                @onReturnData="handleWLBReturnData"
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
                :positive-percentage="true"
                :decimal-places="4"
                :minimum-value="0"
                :maximum-value="10000000000"
                style="width: 100%"
                @change.native="handleOriginalQtyChange"
              />
            </el-form-item>
          </el-descriptions-item>

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
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              入库数量
            </div>
            <el-form-item
              prop="qty"
              label-width="0"
            >
              <numeric
                v-model="dataJson.tempJson.qty"
                :positive-percentage="true"
                :decimal-places="4"
                :minimum-value="0"
                :maximum-value="10000000000"
                style="width: 100%"
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
                :positive-percentage="true"
                :decimal-places="4"
                :minimum-value="0"
                :maximum-value="10000000000"
                style="width: 100%"
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
              <span class="fontWeight">{{ formatCurrency(dataJson.tempJson.amount, true) }}</span>
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
          :label-style="{ width: '2.3%', textAlign: 'right' }"
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
                v-for="(item, i) in dataJson.one_file"
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
                v-for="(item, i) in dataJson.two_file"
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
                v-for="(item, i) in dataJson.three_file"
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
                v-for="(item, i) in dataJson.four_file"
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
import deepCopy from 'deep-copy'
import constants_dict from '@/common/constants/constants_dict'
import constants_para from '@/common/constants/constants_para'
import { insertApi, validateApi } from '@/api/40_business/in/in'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import { EventBus } from '@/common/eventbus/eventbus'

// 导入组件
import numeric from '@/components/40_input/numeric'
import RadioDict from '@/components/00_dict/redio'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import PreviewDescription from '@/components/51_preview_description/index.vue'
import SelectWarehouseLocationBin from '@/views/30_wms/warehouse/selectgrid/selectWarehouseLocationBin.vue'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'

export default {
  name: 'InPushByInPlan',
  components: {
    numeric,
    RadioDict,
    SimpleUploadMutilFile,
    PreviewCard,
    PreviewDescription,
    SelectWarehouseLocationBin,
    BpmDialog
  },
  props: {
    // 从入库计划传入的数据
    data: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data () {
    return {
      // 样式设置
      contentStyle: {
        width: '15%'
      },
      labelStyle: {
        width: '10%',
        textAlign: 'right'
      },
      // 弹出窗口设置
      popSettingsData: {
        // 审批流程设置
        sponsorDialog: {
          visible: false,
          serial_type: 'b_in',
          form_data: {},
          initial_process: null,
          process_users: []
        }
      },
      dataJson: {
        // 入库计划数据
        planData: {
          plan_id: null,
          plan_code: '',
          plan_time: '',
          over_receipt_rate: null,
          remark: '',
          doc_att_files: []
        },
        // 合同数据
        contractData: {
          contract_id: null,
          contract_code: '',
          status_name: '',
          delivery_date: '',
          delivery_location: '',
          amount_total: null,
          sign_date: ''
        },
        // 订单数据
        orderData: {
          order_id: null,
          order_code: '',
          status_name: '',
          delivery_date: '',
          delivery_location: '',
          amount_total: null
        },
        // 单条数据
        tempJson: {
          code: '',
          type: '',
          type_name: '',
          owner_id: null,
          owner_name: '',
          owner_code: '',
          supplier_id: null,
          supplier_name: '',
          supplier_code: '',
          plan_id: null,
          plan_code: '',
          contract_id: null,
          contract_code: '',
          order_id: null,
          order_code: '',
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
          inbound_time: null,
          remark: '',
          one_file: [],
          two_file: [],
          three_file: [],
          four_file: []
        },
        inputSettings: {
          maxLength: {
            remark: 200
          }
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
        rules: {
          type: [
            { required: true, message: '请选择入库类型', trigger: 'change' }
          ],
          wlb_data: [
            { required: true, validator: this.wlb_data_validator, trigger: 'blur' }
          ],
          original_qty: [
            { required: true, message: '请输入原发数量', trigger: 'blur' }
          ],
          inbound_time: [
            { required: true, message: '请选择入库时间', trigger: 'change' }
          ],
          qty: [
            { required: true, message: '请输入入库数量', trigger: 'blur' }
          ],
          price: [
            { required: true, message: '请输入入库单价', trigger: 'blur' }
          ]
        }
      }
    }
  },
  computed: {
    /**
     * 字典常量
     */
    CONSTANTS () {
      return constants_dict
    },
    /**
     * 常量参数
     */
    CONSTANTS_PARA () {
      return constants_para
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
    },
    // 监听传入的数据变化
    data: {
      handler (newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.initDataFromProps()
        }
      },
      immediate: true,
      deep: true
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
     * 初始化数据
     */
    initData () {
      // 如果有传入数据，则填充
      if (this.data && Object.keys(this.data).length > 0) {
        this.initDataFromProps()
      }
    },

    /**
     * 从Props数据初始化表单
     */
    initDataFromProps () {
      try {
        console.log('=== 开始填充入库单数据 ===')
        console.log('传入的数据:', this.data)

        const data = this.data

        // 填充入库计划数据
        this.dataJson.planData = {
          plan_id: data.plan_id || null,
          plan_code: data.plan_code || '',
          plan_time: data.plan_time || '',
          over_receipt_rate: data.over_receipt_rate || null,
          remark: data.plan_remark || '',
          doc_att_files: data.plan_doc_att_files || []
        }

        // 填充合同数据
        this.dataJson.contractData = {
          contract_id: data.contract_id || null,
          contract_code: data.contract_code || '',
          status_name: data.contract_status_name || '',
          delivery_date: data.contract_delivery_date || '',
          delivery_location: data.contract_delivery_location || '',
          amount_total: data.contract_amount_total || null,
          sign_date: data.contract_sign_date || ''
        }

        // 填充订单数据
        this.dataJson.orderData = {
          order_id: data.order_id || null,
          order_code: data.order_code || '',
          status_name: data.order_status_name || '',
          delivery_date: data.order_delivery_date || '',
          delivery_location: data.order_delivery_location || '',
          amount_total: data.order_amount_total || null
        }

        // 填充入库单数据
        this.dataJson.tempJson.plan_id = data.plan_id
        this.dataJson.tempJson.plan_code = data.plan_code
        this.dataJson.tempJson.contract_id = data.contract_id
        this.dataJson.tempJson.contract_code = data.contract_code
        this.dataJson.tempJson.order_id = data.order_id
        this.dataJson.tempJson.order_code = data.order_code
        this.dataJson.tempJson.owner_id = data.owner_id
        this.dataJson.tempJson.owner_name = data.owner_name
        this.dataJson.tempJson.owner_code = data.owner_code || ''
        this.dataJson.tempJson.supplier_id = data.supplier_id
        this.dataJson.tempJson.supplier_name = data.supplier_name
        this.dataJson.tempJson.supplier_code = data.supplier_code || ''
        this.dataJson.tempJson.sku_id = data.sku_id
        this.dataJson.tempJson.sku_code = data.sku_code
        this.dataJson.tempJson.goods_name = data.goods_name
        this.dataJson.tempJson.sku_name = data.sku_name

        // 设置数量和价格
        this.dataJson.tempJson.original_qty = data.qty || null
        this.dataJson.tempJson.qty = data.qty || null
        this.dataJson.tempJson.price = data.price || null

        // 计算金额
        this.calculateAmount()

        // 设置入库类型为采购入库
        this.dataJson.tempJson.type = constants_dict.DICT_B_IN_TYPE_CG

        // 设置默认入库时间为当前时间
        this.dataJson.tempJson.inbound_time = new Date().toISOString().slice(0, 19).replace('T', ' ')

        console.log('=== 入库单数据填充完成 ===')
        console.log('当前入库单数据:', this.dataJson.tempJson)
        console.log('入库计划数据:', this.dataJson.planData)
        console.log('合同数据:', this.dataJson.contractData)
        console.log('订单数据:', this.dataJson.orderData)
      } catch (error) {
        console.error('=== 处理数据失败 ===')
        console.error('错误信息:', error)
        this.$message.error('处理数据失败，请重试')
      }
    },

    /**
     * 入库类型变更处理
     */
    handleTypeChange (val) {
      this.dataJson.tempJson.type = val
    },

    /**
     * 原发数量变更处理
     */
    handleOriginalQtyChange () {
      // 原发数量变更时，可以设置入库数量为相同值
      if (this.dataJson.tempJson.original_qty && !this.dataJson.tempJson.qty) {
        this.dataJson.tempJson.qty = this.dataJson.tempJson.original_qty
      }
      this.calculateAmount()
    },

    /**
     * 入库数量变更处理
     */
    handleQtyChange () {
      this.calculateAmount()
    },

    /**
     * 入库单价变更处理
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
     * 取消
     */
    handleCancel () {
      this.$emit('closeMeCancel')
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
     * 初始化组件 - 重置所有数据到初始状态
     */
    initComponent () {
      // 重置文件相关数组
      this.dataJson.one_file = []
      this.dataJson.one_file_url = []
      this.dataJson.two_file = []
      this.dataJson.two_file_url = []
      this.dataJson.three_file = []
      this.dataJson.three_file_url = []
      this.dataJson.four_file = []
      this.dataJson.four_file_url = []

      // 重置入库单数据，但保留从入库计划传入的基础数据
      this.dataJson.tempJson.warehouse_id = null
      this.dataJson.tempJson.warehouse_code = ''
      this.dataJson.tempJson.warehouse_name = ''
      this.dataJson.tempJson.location_id = null
      this.dataJson.tempJson.location_code = ''
      this.dataJson.tempJson.location_name = ''
      this.dataJson.tempJson.bin_id = null
      this.dataJson.tempJson.bin_code = ''
      this.dataJson.tempJson.bin_name = ''
      this.dataJson.tempJson.warehouse_location_bin_display = ''
      this.dataJson.tempJson.wlb_data = null
      this.dataJson.tempJson.original_qty = null
      this.dataJson.tempJson.qty = null
      this.dataJson.tempJson.price = null
      this.dataJson.tempJson.amount = null
      this.dataJson.tempJson.inbound_time = null
      this.dataJson.tempJson.remark = ''
      this.dataJson.tempJson.one_file = []
      this.dataJson.tempJson.two_file = []
      this.dataJson.tempJson.three_file = []
      this.dataJson.tempJson.four_file = []

      // 重新设置入库类型为采购入库
      this.dataJson.tempJson.type = constants_dict.DICT_B_IN_TYPE_CG

      // 重新设置默认入库时间为当前时间
      this.dataJson.tempJson.inbound_time = new Date().toISOString().slice(0, 19).replace('T', ' ')

      // 清除表单验证状态
      this.$nextTick(() => {
        if (this.$refs.dataSubmitForm) {
          this.$refs.dataSubmitForm.clearValidate()
        }
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
          // 基本业务逻辑校验
          if (!tempData.type) {
            this.closeLoading()
            this.showErrorMsg('请选择入库类型')
            return
          }
          if (!tempData.warehouse_id) {
            this.closeLoading()
            this.showErrorMsg('请选择仓库/库区/库位')
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
              this.showErrorMsg(_data.errorMessage)
            }
          }).catch(err => {
            this.closeLoading()
            this.showErrorMsg(err)
          })
        } else {
          this.closeLoading()
          this.showErrorMsg('请检查输入信息')
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
     * 审批流确定
     */
    handleBpmDialogOk (data) {
      this.popSettingsData.sponsorDialog.initial_process = data.processData
      this.popSettingsData.sponsorDialog.process_users = data.process_users
      this.popSettingsData.sponsorDialog.visible = false
      this.doInsert()
    },

    /**
     * 执行提交
     */
    doInsert () {
      const tempData = deepCopy(this.dataJson.tempJson)

      // 设置审批流程数据
      if (this.popSettingsData.sponsorDialog.initial_process) {
        tempData.initial_process = this.popSettingsData.sponsorDialog.initial_process
      }
      if (this.popSettingsData.sponsorDialog.process_users && this.popSettingsData.sponsorDialog.process_users.length > 0) {
        tempData.process_users = this.popSettingsData.sponsorDialog.process_users
      }

      // 设置附件文件
      tempData.one_file = this.dataJson.one_file
      tempData.two_file = this.dataJson.two_file
      tempData.three_file = this.dataJson.three_file
      tempData.four_file = this.dataJson.four_file

      console.log('=== 提交入库单数据 ===')
      console.log('提交数据:', tempData)

      insertApi(tempData).then(_data => {
        if (_data.success) {
          this.closeLoading()
          this.$emit('closeMeOk', _data.data)
          // 通知兄弟组件，新增数据更新
          setTimeout(() => {
            EventBus.$emit('EMIT_MST_B_IN_NEW_OK', _data.data)
          }, 1000)
          this.$notify({
            title: '入库单提交成功',
            message: _data.data.message || '入库单已提交审批并保存',
            type: 'success',
            duration: this.settings.duration
          })
        } else {
          this.closeLoading()
          this.showErrorMsg(_data.errorMessage || _data.data?.message || '提交失败')
        }
      }).catch(err => {
        this.closeLoading()
        this.showErrorMsg(err.error?.message || err.message || '提交失败，请重试')
      })
    },

    /**
     * 磅单文件上传成功处理
     */
    handleOneFileUploadSuccess (data) {
      this.dataJson.one_file.push({
        fileName: data.file.name,
        url: data.response.data.url,
        timestamp: new Date().getTime()
      })
      this.dataJson.one_file_url.push(data.response.data.url)
    },

    /**
     * 入库附件明细上传成功处理
     */
    handleTwoFileUploadSuccess (data) {
      this.dataJson.two_file.push({
        fileName: data.file.name,
        url: data.response.data.url,
        timestamp: new Date().getTime()
      })
      this.dataJson.two_file_url.push(data.response.data.url)
    },

    /**
     * 检验单上传成功处理
     */
    handleThreeFileUploadSuccess (data) {
      this.dataJson.three_file.push({
        fileName: data.file.name,
        url: data.response.data.url,
        timestamp: new Date().getTime()
      })
      this.dataJson.three_file_url.push(data.response.data.url)
    },

    /**
     * 货物照片上传成功处理
     */
    handleFourFileUploadSuccess (data) {
      this.dataJson.four_file.push({
        fileName: data.file.name,
        url: data.response.data.url,
        timestamp: new Date().getTime()
      })
      this.dataJson.four_file_url.push(data.response.data.url)
    },

    /**
     * 文件上传失败处理
     */
    handleFileError (err, file, fileList) {
      console.error('文件上传失败:', err)
      this.$message.error('文件上传失败，请重试')
    },

    /**
     * 删除磅单文件
     */
    removeOneFile (data) {
      const index = this.dataJson.one_file.findIndex(item => item.url === data)
      if (index !== -1) {
        this.dataJson.one_file.splice(index, 1)
      }
      const index2 = this.dataJson.one_file_url.findIndex(item => item === data)
      if (index2 !== -1) {
        this.dataJson.one_file_url.splice(index2, 1)
      }
    },

    /**
     * 删除入库附件明细
     */
    removeTwoFile (data) {
      const index = this.dataJson.two_file.findIndex(item => item.url === data)
      if (index !== -1) {
        this.dataJson.two_file.splice(index, 1)
      }
      const index2 = this.dataJson.two_file_url.findIndex(item => item === data)
      if (index2 !== -1) {
        this.dataJson.two_file_url.splice(index2, 1)
      }
    },

    /**
     * 删除检验单
     */
    removeThreeFile (data) {
      const index = this.dataJson.three_file.findIndex(item => item.url === data)
      if (index !== -1) {
        this.dataJson.three_file.splice(index, 1)
      }
      const index2 = this.dataJson.three_file_url.findIndex(item => item === data)
      if (index2 !== -1) {
        this.dataJson.three_file_url.splice(index2, 1)
      }
    },

    /**
     * 删除货物照片
     */
    removeFourFile (data) {
      const index = this.dataJson.four_file.findIndex(item => item.url === data)
      if (index !== -1) {
        this.dataJson.four_file.splice(index, 1)
      }
      const index2 = this.dataJson.four_file_url.findIndex(item => item === data)
      if (index2 !== -1) {
        this.dataJson.four_file_url.splice(index2, 1)
      }
    },

    /**
     * 格式化货币
     */
    formatCurrency (value, showSymbol = false) {
      return this.formatNumber(value, true, 2, showSymbol ? '¥' : '')
    },

    /**
     * 仓库选择控件返回数据事件
     */
    handleWLBReturnData (val) {
      const { isNotEmpty } = require('@/utils')

      if (!isNotEmpty(val)) {
        this.dataJson.tempJson.wlb_data = null
        this.dataJson.tempJson.warehouse_id = null
        this.dataJson.tempJson.warehouse_name = ''
        this.dataJson.tempJson.warehouse_code = ''
        this.dataJson.tempJson.location_id = null
        this.dataJson.tempJson.location_name = ''
        this.dataJson.tempJson.location_code = ''
        this.dataJson.tempJson.bin_id = null
        this.dataJson.tempJson.bin_name = ''
        this.dataJson.tempJson.bin_code = ''
        this.dataJson.tempJson.warehouse_location_bin_display = ''
      } else {
        this.dataJson.tempJson.wlb_data = val
        this.dataJson.tempJson.warehouse_id = val.warehouse_id
        this.dataJson.tempJson.warehouse_name = val.warehouse_name
        this.dataJson.tempJson.warehouse_code = val.warehouse_code
        this.dataJson.tempJson.location_id = val.location_id
        this.dataJson.tempJson.location_name = val.location_name
        this.dataJson.tempJson.location_code = val.location_code
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
     */
    formatNumber (value, useComma = false, decimalPlaces = 2, prefix = '') {
      if (value === null || value === undefined || value === '') {
        return prefix + '0' + (decimalPlaces > 0 ? '.' + '0'.repeat(decimalPlaces) : '')
      }
      const num = parseFloat(value)
      if (isNaN(num)) {
        return prefix + '0' + (decimalPlaces > 0 ? '.' + '0'.repeat(decimalPlaces) : '')
      }
      if (useComma) {
        return prefix + num.toLocaleString('zh-CN', {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces
        })
      } else {
        return prefix + num.toFixed(decimalPlaces)
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
