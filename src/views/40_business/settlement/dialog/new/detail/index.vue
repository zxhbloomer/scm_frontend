<template>
  <div>
    <!-- pop窗口 设置结算数量、金额 -->
    <el-dialog
      v-if="listenVisible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      title="设置结算数量、金额"
      :visible="visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="1200px"
      destroy-on-close
    >
      <el-form
        ref="dataSubmitForm"
        :rules="settings.rules"
        :model="dataJson.tempJson"
        label-position="right"
        label-width="0px"
        status-icon
      >
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
          border
          style="padding-right: 10px;padding-left: 10px;margin-bottom: 20px;"
        >
          <el-descriptions-item label="合同编号">
            {{ dataJson.tempJson.po_contract_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单编号">
            {{ dataJson.tempJson.po_order_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item>
            <!-- 空白 -->
          </el-descriptions-item>
          <el-descriptions-item label="商品名称">
            {{ dataJson.tempJson.goods_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="规格">
            {{ dataJson.tempJson.sku_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item>
            <!-- 空白 -->
          </el-descriptions-item>
          <el-descriptions-item label="订单数量">
            {{ dataJson.tempJson.order_qty == null ? '-' : formatNumber(dataJson.tempJson.order_qty, true, 4) }}
          </el-descriptions-item>
          <el-descriptions-item label="订单单价">
            {{ dataJson.tempJson.order_price == null ? '-' : formatCurrency(dataJson.tempJson.order_price, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="订单金额">
            {{ dataJson.tempJson.order_amount == null ? '-' : formatCurrency(dataJson.tempJson.order_amount, true) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 本次结算计划 -->
        <el-alert
          title="本次结算计划"
          type="info"
          :closable="false"
        />
        <el-descriptions
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="待结算数量（吨）">
            {{ dataJson.tempJson.unprocessed_qty == null ? '-' : formatNumber(dataJson.tempJson.unprocessed_qty, true, 4) }}
          </el-descriptions-item>
          <el-descriptions-item>
            <!-- 空白 -->
          </el-descriptions-item>
          <el-descriptions-item>
            <!-- 空白 -->
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              结算数量
            </div>
            <el-form-item
              prop="planned_qty"
              label-width="0"
            >
              <el-row :gutter="10">
                <el-col :span="18">
                  <numeric
                    v-model="dataJson.tempJson.planned_qty"
                    :decimal-places="4"
                    :currency-symbol="''"
                    style="width: 100%"
                    placeholder="请输入结算数量"
                    @change.native="handlePlannedQtyChange"
                  />
                </el-col>
                <el-col :span="6">
                  <el-button
                    type="primary"
                    size="mini"
                    :loading="settings.loading"
                    @click="handleSetFullPlannedQuantity"
                  >全额</el-button>
                </el-col>
              </el-row>
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              结算单价
            </div>
            <el-form-item
              prop="planned_price"
              label-width="0"
            >
              <numeric
                v-model="dataJson.tempJson.planned_price"
                :decimal-places="2"
                :currency-symbol="'¥'"
                style="width: 100%"
                placeholder="请输入结算单价"
                @change.native="handlePlannedPriceChange"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="结算金额">
            {{ dataJson.tempJson.planned_amount == null ? '-' : formatCurrency(dataJson.tempJson.planned_amount, true) }}
          </el-descriptions-item>
        </el-descriptions>
        <br>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-divider />
        <el-button
          plain
          type="primary"
          :disabled="settings.loading || settings.buttonDisabled.confirmBtn"
          :loading="settings.loading"
          @click="handleOk()"
        >确定</el-button>
        <el-button
          plain
          :loading="settings.loading"
          @click="handleCancel()"
        >关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.edit-container {
  height: calc(100vh - 160px);
  overflow-x: auto;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
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
.el-button-group {
  margin-bottom: 15px;
}
.el-popup-border-color >>> .el-input__inner {
  border-color: #1890ff;
}
.section-title {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
  margin-bottom: 10px;
  padding-left: 10px;
  border-left: 4px solid #1890ff;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import constants_para from '@/common/constants/constants_para'
import numeric from '@/components/40_input/numeric'

export default {
  name: 'SettlementDetailDialog',
  components: { numeric },
  directives: { elDragDialog },
  mixins: [],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
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
      // 参数设置
      PARAMETERS: constants_para.PARAMETERS,
      // 设置信息
      settings: {
        loading: false,
        duration: constants_para.DURATION,
        // 按钮状态控制
        buttonDisabled: {
          confirmBtn: true // 确定按钮状态，默认禁用
        },
        // 校验规则
        rules: {
          planned_qty: [
            { required: true, message: '请输入应结算数量', trigger: 'blur' },
            { validator: this.planned_qty_validator, trigger: 'blur' }
          ],
          planned_price: [
            { required: true, message: '请输入应结算单价', trigger: 'blur' },
            { validator: this.planned_price_validator, trigger: 'blur' }
          ],
          planned_amount: [
            { required: true, message: '请输入应结算金额', trigger: 'blur' },
            { validator: this.planned_amount_validator, trigger: 'blur' }
          ],
          settled_qty: [
            { required: true, message: '请输入实结算数量', trigger: 'blur' },
            { validator: this.settled_qty_validator, trigger: 'blur' }
          ],
          settled_price: [
            { required: true, message: '请输入实结算单价', trigger: 'blur' },
            { validator: this.settled_price_validator, trigger: 'blur' }
          ],
          settled_amount: [
            { required: true, message: '请输入实结算金额', trigger: 'blur' },
            { validator: this.settled_amount_validator, trigger: 'blur' }
          ]
        }
      },
      // 数据信息
      dataJson: {
        tempJson: {
          // 合同订单信息
          po_contract_code: '',
          po_contract_id: null,
          po_order_code: '',
          po_order_id: null,
          goods_name: '',
          sku_name: '',

          // 订单数据
          order_qty: null, // 订单数量
          order_price: null, // 订单单价
          order_amount: null, // 订单金额

          // 待结算数据
          unprocessed_qty: null, // 待结算数量

          // 应结算数据（计划数据）
          planned_qty: null, // 应结算数量
          planned_price: null, // 应结算单价
          planned_amount: null, // 应结算金额

          // 实结算数据
          settled_qty: null, // 实结算数量
          settled_price: null, // 实结算单价
          settled_amount: null // 实结算金额
        },
        tempJsonOriginal: {}
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.initDataJson()
      }
    },
    // 监听 dataJson.tempJson 的变化，有变更时启用确定按钮
    'dataJson.tempJson': {
      handler (newVal, oldVal) {
        // 启用确定按钮
        this.settings.buttonDisabled.confirmBtn = false
      },
      deep: true // 深度监听对象内部属性的变化
    },
    // 全屏loading
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
    this.initDataJson()
  },
  mounted () {
  },
  destroyed () {
  },
  methods: {
    /**
     * 初始化数据
     */
    initDataJson () {
      this.dataJson.tempJsonOriginal = deepCopy(this.dataJson.tempJson)
      if (this.data) {
        // 设置传入的数据 - 合同订单信息
        this.dataJson.tempJson.po_contract_code = this.data.po_contract_code || ''
        this.dataJson.tempJson.po_contract_id = this.data.po_contract_id || null
        this.dataJson.tempJson.po_order_code = this.data.po_order_code || ''
        this.dataJson.tempJson.po_order_id = this.data.po_order_id || null
        this.dataJson.tempJson.goods_name = this.data.goods_name || ''
        this.dataJson.tempJson.sku_name = this.data.sku_name || ''

        // 订单数据初始化
        this.dataJson.tempJson.order_qty = this.data.order_qty || null
        this.dataJson.tempJson.order_price = this.data.order_price || null
        this.dataJson.tempJson.order_amount = this.data.order_amount || null

        // 计算待结算数量
        const orderQty = this.data.order_qty || 0
        const alreadySettledQty = this.data.already_settled_qty || 0
        this.dataJson.tempJson.unprocessed_qty = orderQty - alreadySettledQty

        // 应结算数据初始化（计划数据）
        this.dataJson.tempJson.planned_qty = this.data.planned_qty || null
        this.dataJson.tempJson.planned_price = this.data.planned_price || this.data.order_price || null
        this.dataJson.tempJson.planned_amount = this.data.planned_amount || null

        // 实结算数据初始化（如果是编辑状态）
        this.dataJson.tempJson.settled_qty = this.data.settled_qty || null
        this.dataJson.tempJson.settled_price = this.data.settled_price || this.data.order_price || null
        this.dataJson.tempJson.settled_amount = this.data.settled_amount || null

        // 如果应结算数量和单价都有值，自动计算应结算金额
        if (this.dataJson.tempJson.planned_qty && this.dataJson.tempJson.planned_price) {
          this.calculatePlannedAmount()
        }

        // 如果实结算数量和单价都有值，自动计算实结算金额
        if (this.dataJson.tempJson.settled_qty && this.dataJson.tempJson.settled_price) {
          this.calculateSettledAmount()
        }
      }

      // 数据初始化完成后，重置按钮状态为禁用
      this.$nextTick(() => {
        this.settings.buttonDisabled.confirmBtn = true
      })
    },

    /**
     * 取消
     */
    handleCancel () {
      this.$emit('closeMeCancel')
    },

    /**
     * 确定
     */
    handleOk () {
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          // 构建返回数据 - 设置到detailListData中去
          const resultData = {
            qty: this.dataJson.tempJson.planned_qty, // 结算数量
            price: this.dataJson.tempJson.planned_price, // 结算单价
            amount: this.dataJson.tempJson.planned_amount // 结算金额
          }
          this.$emit('closeMeOk', resultData)
        }
      })
    },

    /**
     * 应结算数量变更事件 - 自动计算应结算金额
     */
    handlePlannedQtyChange () {
      this.calculatePlannedAmount()
    },

    /**
     * 应结算单价变更事件 - 自动计算应结算金额
     */
    handlePlannedPriceChange () {
      this.calculatePlannedAmount()
    },

    /**
     * 应结算金额变更事件 - 手动修改金额时触发
     */
    handlePlannedAmountChange () {
      // 应结算金额手动修改时，保持金额不变，用户手动输入优先
    },

    /**
     * 实结算数量变更事件 - 自动计算实结算金额
     */
    handleSettledQtyChange () {
      this.calculateSettledAmount()
    },

    /**
     * 实结算单价变更事件 - 自动计算实结算金额
     */
    handleSettledPriceChange () {
      this.calculateSettledAmount()
    },

    /**
     * 实结算金额变更事件 - 手动修改金额时触发
     */
    handleSettledAmountChange () {
      // 实结算金额手动修改时，保持金额不变，用户手动输入优先
    },

    /**
     * 计算应结算金额
     */
    calculatePlannedAmount () {
      const qty = this.dataJson.tempJson.planned_qty
      const price = this.dataJson.tempJson.planned_price

      if (qty && price && qty > 0 && price > 0) {
        this.dataJson.tempJson.planned_amount = qty * price
      }
    },

    /**
     * 计算实结算金额
     */
    calculateSettledAmount () {
      const qty = this.dataJson.tempJson.settled_qty
      const price = this.dataJson.tempJson.settled_price

      if (qty && price && qty > 0 && price > 0) {
        this.dataJson.tempJson.settled_amount = qty * price
      }
    },

    /**
     * 全额按钮点击处理（实际结算数量）
     * 设置实际结算数量 = 待结算数量
     */
    handleSetFullQuantity () {
      const unprocessedQty = this.dataJson.tempJson.unprocessed_qty || 0

      // 设置实际结算数量
      this.dataJson.tempJson.settled_qty = unprocessedQty > 0 ? unprocessedQty : 0

      if (unprocessedQty <= 0) {
        this.$message.warning('无可结算数量')
      } else {
        // 自动计算实际结算金额
        this.calculateSettledAmount()
      }
    },

    /**
     * 全额按钮点击处理（应结算数量）
     * 设置应结算数量 = 待结算数量
     */
    handleSetFullPlannedQuantity () {
      const unprocessedQty = this.dataJson.tempJson.unprocessed_qty || 0

      // 设置应结算数量
      this.dataJson.tempJson.planned_qty = unprocessedQty > 0 ? unprocessedQty : 0

      if (unprocessedQty <= 0) {
        this.$message.warning('无可结算数量')
      } else {
        // 自动计算应结算金额
        this.calculatePlannedAmount()
      }
    },

    /**
     * 应结算数量校验
     */
    planned_qty_validator (rule, value, callback) {
      if (value == null || value === '' || value === undefined) {
        callback(new Error('请输入应结算数量'))
      } else if (value <= 0) {
        callback(new Error('应结算数量必须大于0'))
      } else {
        // 检查是否超过可结算数量
        const unprocessedQty = this.dataJson.tempJson.unprocessed_qty || 0

        if (value > unprocessedQty) {
          callback(new Error(`应结算数量不能超过待结算数量(${this.formatNumber(unprocessedQty, true, 4)})`))
        } else {
          callback()
        }
      }
    },

    /**
     * 应结算单价校验
     */
    planned_price_validator (rule, value, callback) {
      if (value == null || value === '' || value === undefined) {
        callback(new Error('请输入应结算单价'))
      } else if (value <= 0) {
        callback(new Error('应结算单价必须大于0'))
      } else {
        callback()
      }
    },

    /**
     * 应结算金额校验
     */
    planned_amount_validator (rule, value, callback) {
      if (value == null || value === '' || value === undefined) {
        callback(new Error('请输入应结算金额'))
      } else if (value <= 0) {
        callback(new Error('应结算金额必须大于0'))
      } else {
        callback()
      }
    },

    /**
     * 实结算数量校验
     */
    settled_qty_validator (rule, value, callback) {
      if (value == null || value === '' || value === undefined) {
        callback(new Error('请输入实结算数量'))
      } else if (value <= 0) {
        callback(new Error('实结算数量必须大于0'))
      } else {
        // 检查是否超过应结算数量
        const plannedQty = this.dataJson.tempJson.planned_qty || 0

        if (plannedQty > 0 && value > plannedQty) {
          callback(new Error(`实结算数量不能超过应结算数量(${this.formatNumber(plannedQty, true, 4)})`))
        } else {
          callback()
        }
      }
    },

    /**
     * 实结算单价校验
     */
    settled_price_validator (rule, value, callback) {
      if (value == null || value === '' || value === undefined) {
        callback(new Error('请输入实结算单价'))
      } else if (value <= 0) {
        callback(new Error('实结算单价必须大于0'))
      } else {
        callback()
      }
    },

    /**
     * 实结算金额校验
     */
    settled_amount_validator (rule, value, callback) {
      if (value == null || value === '' || value === undefined) {
        callback(new Error('请输入实结算金额'))
      } else if (value <= 0) {
        callback(new Error('实结算金额必须大于0'))
      } else {
        callback()
      }
    }
  }
}
</script>
