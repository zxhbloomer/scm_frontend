<template>
  <div>
    <!-- pop窗口 仓库设置 -->
    <el-dialog
      v-if="listenVisible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      title="设置入库仓库"
      :visible="visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="900px"
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
        <el-descriptions
          title=""
          :column="2"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="合同编号">
            {{ dataJson.tempJson.contract_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单编号">
            {{ dataJson.tempJson.order_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="商品名称">
            {{ dataJson.tempJson.goods_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="规格">
            {{ dataJson.tempJson.sku_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单数量">
            {{ dataJson.tempJson.order_qty == null ? '-' : formatNumber(dataJson.tempJson.order_qty, true, 4) }}
          </el-descriptions-item>
          <el-descriptions-item>
            <!-- 预留空位置 -->
          </el-descriptions-item>
          <el-descriptions-item label="已入库数量">
            {{ dataJson.tempJson.processed_qty == null ? '-' : formatNumber(dataJson.tempJson.processed_qty, true, 4) }}
          </el-descriptions-item>
          <el-descriptions-item label="待入库数量">
            {{ dataJson.tempJson.unprocessed_qty == null ? '-' : formatNumber(dataJson.tempJson.unprocessed_qty, true, 4) }}
          </el-descriptions-item>
          <el-descriptions-item label="订单单价">
            {{ dataJson.tempJson.order_price == null ? '-' : formatCurrency(dataJson.tempJson.order_price, true) }}
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
                :currency-symbol="''"
                style="width: 100%"
                placeholder="请输入入库单价"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              本次计划入库数量（吨）
            </div>
            <el-form-item
              prop="qty"
              label-width="0"
            >
              <el-row :gutter="10">
                <el-col :span="18">
                  <numeric
                    v-model="dataJson.tempJson.qty"
                    :decimal-places="4"
                    :currency-symbol="''"
                    style="width: 100%"
                    placeholder="请输入入库数量"
                  />
                </el-col>
                <el-col :span="6">
                  <el-button
                    type="primary"
                    @click="handleSetFullQuantity"
                  >全部</el-button>
                </el-col>
              </el-row>
            </el-form-item>
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
              <Select-Warehouse-Location-Bin
                v-model.trim="dataJson.tempJson.wlb_data"
                :reset="dataJson.searchForm.reset"
                placement="left"
                @closeParentDialog="handleWLBDialogClose"
                @onReturnData="handleWLBReturnData"
              />
            </el-form-item>
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
          :disabled="settings.loading"
          @click="handleOk()"
        >确定</el-button>
        <el-button
          plain
          :disabled="settings.loading"
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
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import SelectWarehouseLocationBin from '@/views/30_wms/warehouse/selectgrid/selectWarehouseLocationBin.vue'
import constants_para from '@/common/constants/constants_para'
import { isNotEmpty } from '@/utils'
import numeric from '@/components/40_input/numeric/index.vue'

export default {
  components: { SelectWarehouseLocationBin, numeric },
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
        width: '20%',
        'text-align': 'right'
      },
      contentStyle: {
        width: '30%'
      },
      // 参数设置
      PARAMETERS: constants_para.PARAMETERS,
      // 设置信息
      settings: {
        loading: false,
        duration: constants_para.DURATION,
        // 校验规则
        rules: {
          qty: [
            { required: true, message: '请输入本次计划入库数量', trigger: 'blur' },
            { validator: this.qty_validator, trigger: 'blur' }
          ],
          price: [
            { required: true, message: '请输入入库单价', trigger: 'blur' },
            { validator: this.price_validator, trigger: 'blur' }
          ],
          wlb_data: [
            { required: true, validator: this.wlb_data_validator, trigger: 'blur' }
          ]
        }
      },
      // 数据信息
      dataJson: {
        searchForm: {
          reset: false
        },
        tempJson: {
          contract_code: '',
          order_code: '',
          goods_name: '',
          sku_name: '',
          qty: null,
          wlb_data: null,
          warehouse_id: null,
          warehouse_code: '',
          warehouse_name: '',
          location_id: null,
          location_code: '',
          location_name: '',
          bin_id: null,
          bin_code: '',
          bin_name: '',
          // 新增字段
          order_qty: 0, // 订单数量
          order_price: 0, // 订单单价
          processed_qty: 0, // 已入库数量
          unprocessed_qty: 0, // 待入库数量
          price: null // 入库单价
        }
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
    }
  },
  created () {
    this.initDataJson()
  },
  mounted () {
  },
  methods: {
    // 初始化数据
    initDataJson () {
      if (this.data) {
        // 设置传入的数据
        this.dataJson.tempJson.contract_code = this.data.contract_code || ''
        this.dataJson.tempJson.order_code = this.data.order_code || ''
        this.dataJson.tempJson.goods_name = this.data.goods_name || ''
        this.dataJson.tempJson.sku_name = this.data.sku_name || ''
        this.dataJson.tempJson.qty = this.data.qty || null
        // 新增字段初始化
        this.dataJson.tempJson.order_qty = this.data.order_qty || 0
        this.dataJson.tempJson.order_price = this.data.order_price || 0
        this.dataJson.tempJson.processed_qty = this.data.processed_qty || 0
        this.dataJson.tempJson.unprocessed_qty = this.data.unprocessed_qty || 0
        // 入库单价默认等于订单单价，如果已经有设置过的价格则使用设置的价格
        this.dataJson.tempJson.price = this.data.price || this.data.order_price || null
        // 如果有已设置的仓库信息，则回填
        if (this.data.warehouse_id) {
          this.dataJson.tempJson.warehouse_id = this.data.warehouse_id
          this.dataJson.tempJson.warehouse_code = this.data.warehouse_code
          this.dataJson.tempJson.warehouse_name = this.data.warehouse_name
          this.dataJson.tempJson.location_id = this.data.location_id
          this.dataJson.tempJson.location_code = this.data.location_code
          this.dataJson.tempJson.location_name = this.data.location_name
          this.dataJson.tempJson.bin_id = this.data.bin_id
          this.dataJson.tempJson.bin_code = this.data.bin_code
          this.dataJson.tempJson.bin_name = this.data.bin_name
          // 构建wlb_data用于回显
          this.dataJson.tempJson.wlb_data = {
            warehouse_id: this.data.warehouse_id,
            warehouse_code: this.data.warehouse_code,
            warehouse_name: this.data.warehouse_name,
            location_id: this.data.location_id,
            location_code: this.data.location_code,
            location_name: this.data.location_name,
            id: this.data.bin_id,
            code: this.data.bin_code,
            name: this.data.bin_name
          }
        }
      }
    },
    // 取消
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 确定
    handleOk () {
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          // 构建返回数据
          const resultData = {
            qty: this.dataJson.tempJson.qty,
            price: this.dataJson.tempJson.price,
            warehouse_id: this.dataJson.tempJson.warehouse_id,
            warehouse_code: this.dataJson.tempJson.warehouse_code,
            warehouse_name: this.dataJson.tempJson.warehouse_name,
            location_id: this.dataJson.tempJson.location_id,
            location_code: this.dataJson.tempJson.location_code,
            location_name: this.dataJson.tempJson.location_name,
            bin_id: this.dataJson.tempJson.bin_id,
            bin_code: this.dataJson.tempJson.bin_code,
            bin_name: this.dataJson.tempJson.bin_name
          }
          this.$emit('closeMeOk', resultData)
        }
      })
    },
    // 仓库选择控件关闭事件
    handleWLBDialogClose () {
      // 仓库选择控件关闭时的处理
    },
    // 仓库选择控件返回数据事件
    handleWLBReturnData (val) {
      if (!isNotEmpty(val)) {
        this.dataJson.tempJson.wlb_data = undefined
        // 仓库
        this.dataJson.tempJson.warehouse_id = undefined
        this.dataJson.tempJson.warehouse_name = undefined
        this.dataJson.tempJson.warehouse_code = undefined
        // 库区
        this.dataJson.tempJson.location_id = undefined
        this.dataJson.tempJson.location_name = undefined
        this.dataJson.tempJson.location_code = undefined
        // 库位
        this.dataJson.tempJson.bin_id = undefined
        this.dataJson.tempJson.bin_name = undefined
        this.dataJson.tempJson.bin_code = undefined
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
      }
    },
    // 入库数量校验
    qty_validator (rule, value, callback) {
      if (value <= 0) {
        callback(new Error('本次计划入库数量必须大于0'))
      } else {
        callback()
      }
    },
    // 入库单价校验
    price_validator (rule, value, callback) {
      if (value == null || value === '' || value === undefined) {
        callback(new Error('请输入入库单价'))
      } else if (value <= 0) {
        callback(new Error('入库单价必须大于0'))
      } else {
        callback()
      }
    },
    // 仓库校验
    wlb_data_validator (rule, value, callback) {
      if (this.dataJson.tempJson.warehouse_id) {
        callback()
      } else {
        callback(new Error('请选择仓库/库区/库位'))
      }
    },

    /**
     * 全部按钮点击处理
     * 设置入库数量 = 订单数量 - 已入库数量 - 待入库数量
     */
    handleSetFullQuantity () {
      const orderQty = this.dataJson.tempJson.order_qty || 0
      const processedQty = this.dataJson.tempJson.processed_qty || 0
      const unprocessedQty = this.dataJson.tempJson.unprocessed_qty || 0

      // 计算可入库数量
      const availableQty = orderQty - processedQty - unprocessedQty

      // 设置入库数量
      this.dataJson.tempJson.qty = availableQty > 0 ? availableQty : 0

      if (availableQty <= 0) {
        this.$message.warning('无可入库数量')
      }
    }
  }
}
</script>
