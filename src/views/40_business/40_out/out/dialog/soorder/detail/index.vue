<template>
  <div>
    <!-- 销售订单详情弹窗 -->
    <el-dialog
      v-if="listenVisible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      title="选择销售订单-商品数据-生成出库单数据"
      :visible="visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="1200px"
      destroy-on-close
    >
      <div class="dialog-content">
        <!-- 项目信息 -->
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
            {{ dataJson.tempJson.project_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="项目名称">
            {{ dataJson.tempJson.project_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="" />
        </el-descriptions>

        <!-- 合同信息 -->
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
            {{ dataJson.tempJson.so_contract_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="系统编号">
            {{ dataJson.tempJson.code }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            {{ dataJson.tempJson.type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="客户">
            {{ dataJson.tempJson.customer_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="主体企业">
            {{ dataJson.tempJson.seller_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="付款方式">
            {{ dataJson.tempJson.payment_type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="结算方式">
            {{ dataJson.tempJson.settle_type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="结算单据类型">
            {{ dataJson.tempJson.bill_type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="运输方式">
            {{ dataJson.tempJson.delivery_type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="到期日期">
            {{ dataJson.tempJson.expiry_date || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="发货日期">
            {{ dataJson.tempJson.delivery_date || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="签约日期">
            {{ dataJson.tempJson.sign_date || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="发货地点">
            {{ dataJson.tempJson.delivery_location || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="备注" :span="2">
            {{ dataJson.tempJson.remark || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 订单信息 -->
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
            {{ dataJson.tempJson.code }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            {{ dataJson.tempJson.status_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="运输方式">
            {{ dataJson.tempJson.delivery_type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="发货日期">
            {{ dataJson.tempJson.delivery_date || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="发货地点" :span="2">
            {{ dataJson.tempJson.delivery_location || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="订单总金额">
            <span class="fontWeight">
              {{ formatCurrency(dataJson.tempJson.amount_total, true) }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="订单总销售数量（吨）">
            <span class="fontWeight">
              {{ formatNumber(dataJson.tempJson.qty_total, true, 4) }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="总税额">
            <span class="fontWeight">
              {{ formatCurrency(dataJson.tempJson.tax_amount_total, true) }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="创建时间">
            {{ dataJson.tempJson.c_time || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建人">
            {{ dataJson.tempJson.c_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ dataJson.tempJson.u_time || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 商品明细 -->
        <el-alert
          title="商品信息"
          type="info"
          :closable="false"
        />
        <el-table
          :data="dataJson.tempJson.detailListData"
          border
          style="width: calc(100% - 20px )"
          max-height="300"
        >
          <el-table-column
            prop="goods_code"
            label="商品编码"
            width="120"
          />
          <el-table-column
            prop="goods_name"
            label="商品名称"
            width="150"
          />
          <el-table-column
            prop="sku_code"
            label="规格编码"
            width="120"
          />
          <el-table-column
            prop="sku_name"
            label="规格名称"
            width="120"
          />
          <el-table-column
            prop="qty"
            label="数量"
            width="100"
            align="right"
          >
            <template slot-scope="scope">
              {{ formatNumber(scope.row.qty, true, 4) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="price"
            label="单价"
            width="120"
            align="right"
          >
            <template slot-scope="scope">
              {{ formatCurrency(scope.row.price, true) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="amount"
            label="金额"
            width="120"
            align="right"
          >
            <template slot-scope="scope">
              {{ formatCurrency(scope.row.amount, true) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="tax_rate"
            label="税率(%)"
            width="100"
            align="right"
          >
            <template slot-scope="scope">
              {{ formatNumber(scope.row.tax_rate, true, 2) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="tax_amount"
            label="税额"
            width="120"
            align="right"
          >
            <template slot-scope="scope">
              {{ formatCurrency(scope.row.tax_amount, true) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="120"
            align="center"
            fixed="right"
          >
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="mini"
                @click="handleGenerateOutStock(scope.row, scope.$index)"
              >
                生成出库单
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-divider />
        <el-button
          plain
          @click="handleClose()"
        >关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import constants_dict from '@/common/constants/constants_dict'
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  name: 'SoOrderDetailDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      constants_dict,
      constants_para,
      // 样式设置
      contentStyle: {
        width: '15%'
      },
      labelStyle: {
        width: '10%',
        'text-align': 'right'
      },
      // 设置
      settings: {
        loading: false
      },
      // 主要数据json
      dataJson: {
        tempJson: {}
      }
    }
  },
  computed: {
    /**
     * 监听弹窗显示状态
     */
    listenVisible () {
      return this.visible
    }
  },
  watch: {
    /**
     * 监听数据变化
     */
    data: {
      handler (newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          // 使用 $nextTick 确保数据更新的安全性
          this.$nextTick(() => {
            this.dataJson.tempJson = deepCopy(newVal)
          })
        } else {
          // 清空数据
          this.dataJson.tempJson = {}
        }
      },
      immediate: true,
      deep: true
    },
    /**
     * 监听loading状态
     */
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
  mounted () {
    // 监听事件总线
    EventBus.$on('closeSoOrderDetailDialog', () => {
      this.handleClose()
    })
  },
  beforeDestroy () {
    // 移除事件监听
    EventBus.$off('closeSoOrderDetailDialog')
  },
  methods: {
    /**
     * 关闭弹窗
     */
    handleClose () {
      this.$emit('closeMeCancel')
    },

    /**
     * 生成出库单
     * @param {Object} row 当前行数据
     * @param {Number} index 当前行索引
     */
    handleGenerateOutStock (row, index) {
      try {
        // 记录日志 - 开始生成出库单
        console.log('=== 开始生成出库单 ===')
        console.log('选中的商品数据:', row)
        console.log('商品行索引:', index)
        console.log('订单信息:', this.dataJson.tempJson)
        console.log('当前时间:', new Date().toLocaleString())

        // 准备生成出库单所需的完整数据
        const generateData = {
          // 项目信息
          project_info: {
            project_id: this.dataJson.tempJson.project_id,
            project_code: this.dataJson.tempJson.project_code,
            project_name: this.dataJson.tempJson.project_name
          },
          // 合同信息
          contract_info: {
            contract_id: this.dataJson.tempJson.so_contract_id,
            contract_code: this.dataJson.tempJson.so_contract_code,
            type_name: this.dataJson.tempJson.type_name,
            customer_id: this.dataJson.tempJson.customer_id,
            customer_name: this.dataJson.tempJson.customer_name,
            customer_code: this.dataJson.tempJson.customer_code,
            seller_id: this.dataJson.tempJson.seller_id,
            seller_name: this.dataJson.tempJson.seller_name,
            seller_code: this.dataJson.tempJson.seller_code,
            payment_type_name: this.dataJson.tempJson.payment_type_name,
            settle_type_name: this.dataJson.tempJson.settle_type_name,
            bill_type_name: this.dataJson.tempJson.bill_type_name,
            delivery_type_name: this.dataJson.tempJson.delivery_type_name,
            expiry_date: this.dataJson.tempJson.expiry_date,
            delivery_date: this.dataJson.tempJson.delivery_date,
            sign_date: this.dataJson.tempJson.sign_date,
            delivery_location: this.dataJson.tempJson.delivery_location,
            remark: this.dataJson.tempJson.remark
          },
          // 订单信息
          order_info: {
            order_id: this.dataJson.tempJson.id,
            order_code: this.dataJson.tempJson.code,
            status_name: this.dataJson.tempJson.status_name,
            delivery_type_name: this.dataJson.tempJson.delivery_type_name,
            delivery_date: this.dataJson.tempJson.delivery_date,
            delivery_location: this.dataJson.tempJson.delivery_location,
            amount_total: this.dataJson.tempJson.amount_total,
            qty_total: this.dataJson.tempJson.qty_total,
            tax_amount_total: this.dataJson.tempJson.tax_amount_total,
            c_time: this.dataJson.tempJson.c_time,
            c_name: this.dataJson.tempJson.c_name,
            u_time: this.dataJson.tempJson.u_time
          },
          // 选中的商品信息
          goods_info: {
            goods_id: row.goods_id,
            goods_code: row.goods_code,
            goods_name: row.goods_name,
            sku_id: row.sku_id,
            sku_code: row.sku_code,
            sku_name: row.sku_name,
            qty: row.qty,
            price: row.price,
            amount: row.amount,
            tax_rate: row.tax_rate,
            tax_amount: row.tax_amount
          },
          // 生成出库单的备注
          generate_remark: `来自销售订单：${this.dataJson.tempJson.code}`
        }

        // 记录生成数据日志
        console.log('生成出库单数据:', generateData)

        // 通过事件总线发送数据到父组件
        EventBus.$emit('generateOutStockFromOrder', generateData)

        // 直接向父组件发送事件
        this.$emit('generateOutStock', generateData)

        // 记录日志 - 数据发送成功
        console.log('=== 生成出库单数据发送成功 ===')

        // 关闭弹窗
        this.handleClose()
      } catch (error) {
        // 错误处理和日志记录
        console.error('=== 生成出库单失败 ===')
        console.error('错误信息:', error)
        console.error('错误堆栈:', error.stack)

        // 显示错误提示
        this.$message.error('生成出库单失败，请重试')
      }
    }
  }
}
</script>

<style scoped>
.dialog-content {
  max-height: 70vh;
  overflow-y: auto;
}
.dialog-footer {
  text-align: center;
}
.fontWeight {
  font-weight: bold;
  color: #1890ff;
}
.el-alert {
  margin: 10px 0 5px 0;
}
.el-descriptions {
  margin-bottom: 15px;
}
.el-table {
  margin: 10px;
}
</style>
