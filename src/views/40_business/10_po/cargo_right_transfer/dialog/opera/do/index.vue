<template>
  <el-dialog
    v-el-drag-dialog
    :title="title"
    :visible="visible"
    :modal="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="1000px"
    destroy-on-close
    top="10vh"
  >
    <div class="dialog-container">
      <el-form
        ref="dataForm"
        :rules="settings.rules"
        :model="dataJson.tempJson"
        label-position="right"
        label-width="120px"
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
          <el-descriptions-item label="商品名称">
            {{ dataJson.tempJson.goods_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="规格">
            {{ dataJson.tempJson.sku_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="订单数量">
            {{ dataJson.tempJson.qty == null ? '-' : formatNumber(dataJson.tempJson.qty, true, 4) }}
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              货权转移数量
            </div>
            <el-form-item
              prop="transfer_qty"
              label-width="0"
            >
              <div class="form-items-container">
                <div class="left-side">
                  <numeric
                    v-model="dataJson.tempJson.transfer_qty"
                    :decimal-places="4"
                  />
                </div>
                <div class="right-side">
                  <el-button
                    type="primary"
                    size="mini"
                    @click="handleFullAmount"
                  >全额</el-button>
                </div>
              </div>
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="货权转移单价">
            <span class="amount-display">{{ dataJson.tempJson.transfer_price == null ? '-' : formatCurrency(dataJson.tempJson.transfer_price, true) }}</span>
          </el-descriptions-item>

          <el-descriptions-item label="货权转移金额">
            <span class="amount-display">{{ dataJson.tempJson.transfer_amount == null ? '-' : formatCurrency(dataJson.tempJson.transfer_amount, true) }}</span>
          </el-descriptions-item>

          <el-descriptions-item label="批次号">
            <el-input
              v-model.trim="dataJson.tempJson.batch_no"
              clearable
              placeholder="请输入批次号"
              :maxlength="50"
            />
          </el-descriptions-item>

          <el-descriptions-item label="生产日期">
            <el-date-picker
              v-model="dataJson.tempJson.production_date"
              value-format="yyyy-MM-dd"
              type="date"
              clearable
              placeholder="请选择生产日期"
              style="width: 100%"
            />
          </el-descriptions-item>

          <el-descriptions-item label="有效期（天）">
            <numeric
              v-model="dataJson.tempJson.expiry_date"
              :decimal-places="0"
              :currency-symbol="''"
              style="width: 100%"
            />
          </el-descriptions-item>

          <el-descriptions-item label="备注" span="3">
            <el-input
              v-model.trim="dataJson.tempJson.remark"
              type="textarea"
              :rows="3"
              clearable
              placeholder="请输入备注"
              :maxlength="500"
              show-word-limit
            />
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
        :disabled="settings.loading"
        @click="handleConfirm"
      >确定</el-button>
      <el-button
        plain
        @click="handleCancel"
      >取消</el-button>
    </div>
  </el-dialog>
</template>

<style scoped>
.dialog-container {
  padding: 0 20px;
}

.dialog-footer {
  text-align: center;
}

.amount-display {
  font-weight: bold;
  color: #1890ff;
  font-size: 14px;
}

.el-form-item {
  margin-bottom: 18px;
}

.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}

.el-descriptions {
  margin-top: 10px;
  margin-bottom: 10px;
}

.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}

.el-input-number {
  width: 100%;
}

.form-items-container {
  display: flex;
  align-items: center;
}

.left-side {
  flex: 9;
}

.right-side {
  flex: 1;
  margin-left: 5px;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import numeric from '@/components/40_input/numeric/index.vue'

export default {
  directives: { elDragDialog },
  components: {
    numeric
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
    },
    title: {
      type: String,
      default: '货权转移'
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
      dataJson: {
        tempJson: {
          sku_code: '',
          goods_name: '',
          sku_name: '',
          qty: 0,
          price: 0,
          transfer_qty: 0,
          transfer_price: 0,
          transfer_amount: 0,
          batch_no: '',
          production_date: '',
          expiry_date: null,
          remark: ''
        }
      },
      settings: {
        loading: false,
        rules: {
          transfer_qty: [
            { required: true, message: '请输入货权转移数量', trigger: 'blur' },
            {
              validator: (rule, value, callback) => {
                if (value <= 0) {
                  callback(new Error('转移数量必须大于0'))
                } else if (value > this.dataJson.tempJson.qty) {
                  callback(new Error('转移数量不能超过订单数量'))
                } else {
                  callback()
                }
              },
              trigger: 'blur'
            }
          ]
        }
      }
    }
  },
  // 监听器
  watch: {
    // 监听转移数量变化，自动计算转移金额
    'dataJson.tempJson.transfer_qty': {
      handler (newVal) {
        this.calculateTransferAmount()
      }
    }
  },
  mounted () {
    // 初始化数据
    this.init()
  },
  methods: {
    // 初始化数据
    init () {
      if (this.data) {
        // 逐个属性赋值，不能直接深拷贝
        this.dataJson.tempJson.sku_code = this.data.sku_code || ''
        this.dataJson.tempJson.goods_name = this.data.goods_name || ''
        this.dataJson.tempJson.sku_name = this.data.sku_name || ''
        this.dataJson.tempJson.qty = this.data.qty || 0
        this.dataJson.tempJson.price = this.data.price || 0
        this.dataJson.tempJson.amount = this.data.amount || 0
        this.dataJson.tempJson.origin = this.data.origin || ''
        this.dataJson.tempJson.quality_status = this.data.quality_status || ''

        // 设置转移相关字段
        this.dataJson.tempJson.transfer_qty = this.data.transfer_qty || 0
        this.dataJson.tempJson.transfer_price = this.data.price || 0 // 转移单价默认等于订单单价
        this.dataJson.tempJson.transfer_amount = 0
        this.dataJson.tempJson.batch_no = this.data.batch_no || ''
        this.dataJson.tempJson.production_date = this.data.production_date || ''
        this.dataJson.tempJson.expiry_date = this.data.expiry_date || null
        this.dataJson.tempJson.remark = this.data.remark || ''

        // 计算转移金额
        this.calculateTransferAmount()
      }
    },

    // 计算转移金额
    calculateTransferAmount () {
      const qty = parseFloat(this.dataJson.tempJson.transfer_qty) || 0
      const price = parseFloat(this.dataJson.tempJson.transfer_price) || 0
      this.dataJson.tempJson.transfer_amount = qty * price
    },

    // 确定按钮
    handleConfirm () {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          // 验证转移数量
          if (!this.dataJson.tempJson.transfer_qty || this.dataJson.tempJson.transfer_qty <= 0) {
            this.$message.error('请输入有效的转移数量')
            return
          }

          if (this.dataJson.tempJson.transfer_qty > this.dataJson.tempJson.qty) {
            this.$message.error('转移数量不能超过订单数量')
            return
          }

          // 返回更新后的数据
          const result = deepCopy(this.dataJson.tempJson)
          this.$emit('closeMeOk', result)
        }
      })
    },

    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },

    // 全额按钮
    handleFullAmount () {
      this.dataJson.tempJson.transfer_qty = this.dataJson.tempJson.qty
    }
  }
}
</script>
