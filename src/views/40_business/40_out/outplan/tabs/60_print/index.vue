<template>
  <div class="print-container">
    <div class="print-header">
      <div class="company-info">
        <h2>{{ companyInfo.name }}</h2>
        <p>{{ companyInfo.address }}</p>
        <p>电话：{{ companyInfo.phone }} 传真：{{ companyInfo.fax }}</p>
      </div>

      <div class="document-title">
        <h1>出库计划单</h1>
      </div>
    </div>

    <div class="print-content">
      <!-- 基本信息 -->
      <div class="info-section">
        <table class="info-table">
          <tr>
            <td class="label">出库计划编号：</td>
            <td class="value">{{ printData.code }}</td>
            <td class="label">类型：</td>
            <td class="value">{{ printData.type_name }}</td>
            <td class="label">状态：</td>
            <td class="value">{{ printData.status_name }}</td>
          </tr>
          <tr>
            <td class="label">计划时间：</td>
            <td class="value">{{ printData.plan_time }}</td>
            <td class="label">超发比例：</td>
            <td class="value">{{ formatNumber(printData.over_delivery_rate, true, 2) }}%</td>
            <td class="label">创建时间：</td>
            <td class="value">{{ printData.c_time }}</td>
          </tr>
          <tr>
            <td class="label">货主：</td>
            <td class="value">{{ printData.owner_name }} ({{ printData.owner_code }})</td>
            <td class="label">委托方：</td>
            <td class="value">{{ printData.consignor_name }} ({{ printData.consignor_code }})</td>
            <td class="label">创建人：</td>
            <td class="value">{{ printData.c_name }}</td>
          </tr>
          <tr>
            <td class="label">备注：</td>
            <td class="value" colspan="5">{{ printData.remark || '无' }}</td>
          </tr>
        </table>
      </div>

      <!-- 明细信息 -->
      <div class="detail-section">
        <h3>明细信息</h3>
        <table class="detail-table">
          <thead>
            <tr>
              <th width="40">序号</th>
              <th width="120">商品编码</th>
              <th width="200">商品名称</th>
              <th width="100">SKU编码</th>
              <th width="80">计划数量</th>
              <th width="80">价格</th>
              <th width="80">重量</th>
              <th width="80">体积</th>
              <th width="120">仓库</th>
              <th width="120">供应商</th>
              <th width="100">项目编码</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in printData.detailListData" :key="index">
              <td class="center">{{ index + 1 }}</td>
              <td>{{ item.goods_code }}</td>
              <td>{{ item.goods_name }}</td>
              <td>{{ item.sku_code }}</td>
              <td class="right">{{ formatNumber(item.qty, true, 4) }}</td>
              <td class="right">{{ formatCurrency(item.price, true) }}</td>
              <td class="right">{{ formatNumber(item.weight, true, 4) }}</td>
              <td class="right">{{ formatNumber(item.volume, true, 4) }}</td>
              <td>{{ item.warehouse_name }}</td>
              <td>{{ item.supplier_name }}</td>
              <td>{{ item.project_code }}</td>
              <td>{{ item.remark }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 汇总信息 -->
      <div class="summary-section">
        <table class="summary-table">
          <tr>
            <td class="label">总数量：</td>
            <td class="value">{{ formatNumber(totalSummary.qty, true, 4) }}</td>
            <td class="label">总重量：</td>
            <td class="value">{{ formatNumber(totalSummary.weight, true, 4) }}</td>
            <td class="label">总体积：</td>
            <td class="value">{{ formatNumber(totalSummary.volume, true, 4) }}</td>
            <td class="label">总金额：</td>
            <td class="value">{{ formatCurrency(totalSummary.amount, true) }}</td>
          </tr>
        </table>
      </div>
    </div>

    <div class="print-footer">
      <div class="signature-section">
        <table class="signature-table">
          <tr>
            <td class="signature-item">
              <div class="signature-title">制单人：</div>
              <div class="signature-name">{{ printData.c_name }}</div>
              <div class="signature-date">{{ printData.c_time }}</div>
            </td>
            <td class="signature-item">
              <div class="signature-title">审核人：</div>
              <div class="signature-name">__________</div>
              <div class="signature-date">____年____月____日</div>
            </td>
            <td class="signature-item">
              <div class="signature-title">批准人：</div>
              <div class="signature-name">__________</div>
              <div class="signature-date">____年____月____日</div>
            </td>
            <td class="signature-item">
              <div class="signature-title">仓库确认：</div>
              <div class="signature-name">__________</div>
              <div class="signature-date">____年____月____日</div>
            </td>
          </tr>
        </table>
      </div>

      <div class="print-info">
        <p>打印时间：{{ new Date().toLocaleString() }}</p>
        <p>第1页 共1页</p>
      </div>
    </div>

    <!-- 打印按钮 -->
    <div class="print-actions" style="margin-top: 20px;">
      <el-button type="primary" @click="handlePrint">打印</el-button>
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </div>
</template>

<script>
import { printApi } from '@/api/40_business/40_out/outplan/outplan'

export default {
  name: 'OutPlanPrint',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      printData: {
        code: '',
        type_name: '',
        status_name: '',
        plan_time: '',
        over_delivery_rate: 0,
        owner_name: '',
        owner_code: '',
        consignor_name: '',
        consignor_code: '',
        c_name: '',
        c_time: '',
        remark: '',
        detailListData: []
      },
      companyInfo: {
        name: '供应链管理系统',
        address: '公司地址',
        phone: '联系电话',
        fax: '传真号码'
      }
    }
  },
  computed: {
    /**
     * 汇总信息
     */
    totalSummary () {
      const details = this.printData.detailListData || []

      return details.reduce((total, item) => {
        return {
          qty: total.qty + (item.qty || 0),
          weight: total.weight + (item.weight || 0),
          volume: total.volume + (item.volume || 0),
          amount: total.amount + ((item.qty || 0) * (item.price || 0))
        }
      }, { qty: 0, weight: 0, volume: 0, amount: 0 })
    }
  },
  mounted () {
    this.loadPrintData()
  },
  methods: {
    /**
     * 加载打印数据
     */
    async loadPrintData () {
      if (this.data && this.data.id) {
        try {
          const response = await printApi({ id: this.data.id })
          this.printData = response.data
        } catch (error) {
          console.error('加载打印数据失败:', error)
          this.$message.error('加载打印数据失败')
        }
      }
    },

    /**
     * 打印
     */
    handlePrint () {
      // 隐藏打印按钮
      const printActions = document.querySelector('.print-actions')
      if (printActions) {
        printActions.style.display = 'none'
      }

      // 执行打印
      window.print()

      // 显示打印按钮
      if (printActions) {
        printActions.style.display = 'block'
      }
    },

    /**
     * 关闭
     */
    handleClose () {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.print-container {
  padding: 20px;
  background: white;
  min-height: 100vh;
}

.print-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #333;
  padding-bottom: 20px;

  .company-info {
    margin-bottom: 20px;

    h2 {
      margin: 0 0 10px 0;
      font-size: 24px;
      font-weight: bold;
    }

    p {
      margin: 5px 0;
      font-size: 14px;
      color: #666;
    }
  }

  .document-title {
    h1 {
      margin: 0;
      font-size: 32px;
      font-weight: bold;
      color: #333;
    }
  }
}

.print-content {
  .info-section {
    margin-bottom: 30px;

    .info-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #333;

      td {
        padding: 8px;
        border: 1px solid #333;
        font-size: 14px;

        &.label {
          background-color: #f5f5f5;
          font-weight: bold;
          width: 15%;
        }

        &.value {
          width: 20%;
        }
      }
    }
  }

  .detail-section {
    margin-bottom: 30px;

    h3 {
      margin: 0 0 15px 0;
      font-size: 16px;
      font-weight: bold;
    }

    .detail-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #333;
      font-size: 12px;

      th, td {
        padding: 6px;
        border: 1px solid #333;
        text-align: left;

        &.center {
          text-align: center;
        }

        &.right {
          text-align: right;
        }
      }

      th {
        background-color: #f5f5f5;
        font-weight: bold;
        text-align: center;
      }
    }
  }

  .summary-section {
    margin-bottom: 30px;

    .summary-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #333;

      td {
        padding: 8px;
        border: 1px solid #333;
        font-size: 14px;

        &.label {
          background-color: #f5f5f5;
          font-weight: bold;
          width: 12.5%;
          text-align: right;
        }

        &.value {
          width: 12.5%;
          text-align: right;
          font-weight: bold;
        }
      }
    }
  }
}

.print-footer {
  margin-top: 50px;

  .signature-section {
    margin-bottom: 30px;

    .signature-table {
      width: 100%;
      border-collapse: collapse;

      .signature-item {
        text-align: center;
        padding: 20px;
        border: 1px solid #333;
        width: 25%;

        .signature-title {
          font-weight: bold;
          margin-bottom: 20px;
        }

        .signature-name {
          margin-bottom: 20px;
          min-height: 24px;
          border-bottom: 1px solid #333;
        }

        .signature-date {
          font-size: 12px;
          color: #666;
        }
      }
    }
  }

  .print-info {
    text-align: right;
    font-size: 12px;
    color: #666;

    p {
      margin: 5px 0;
    }
  }
}

// 打印样式
@media print {
  .print-actions {
    display: none !important;
  }

  .print-container {
    padding: 0;
    background: white;
  }

  // 确保打印时的字体和边距
  * {
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
}
</style>
