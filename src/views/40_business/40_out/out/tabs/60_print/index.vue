<template>
  <div class="print-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading"><i class="el-icon-loading"></i></el-icon>
      <span>正在加载打印数据...</span>
    </div>
    
    <!-- 打印内容 -->
    <div v-else>
      <!-- 打印页面标题 -->
      <div class="print-header">
        <h1>出库单</h1>
      </div>
      
      <!-- 基本信息区域 -->
      <div class="info-section">
        <table class="info-table">
          <tr>
            <td class="label">出库单编号：</td>
            <td class="value">{{ printData.code || '--' }}</td>
            <td class="label">出库时间：</td>
            <td class="value">{{ formatDateTime(printData.plan_time) || '--' }}</td>
          </tr>
          <tr>
            <td class="label">出库类型：</td>
            <td class="value">{{ printData.type_name || '--' }}</td>
            <td class="label">出库状态：</td>
            <td class="value">{{ printData.status_name || '--' }}</td>
          </tr>
          <tr>
            <td class="label">货主：</td>
            <td class="value">{{ printData.owner_name || '--' }}</td>
            <td class="label">委托方：</td>
            <td class="value">{{ printData.consignor_name || '--' }}</td>
          </tr>
          <tr>
            <td class="label">仓库：</td>
            <td class="value">{{ printData.warehouse_name || '--' }}</td>
            <td class="label">供应商：</td>
            <td class="value">{{ printData.supplier_name || '--' }}</td>
          </tr>
          <tr>
            <td class="label">项目编码：</td>
            <td class="value">{{ printData.project_code || '--' }}</td>
            <td class="label">备注：</td>
            <td class="value">{{ printData.remark || '--' }}</td>
          </tr>
        </table>
      </div>
      
      <!-- 明细信息区域 -->
      <div class="detail-section" v-if="printData.detailListData && printData.detailListData.length > 0">
        <h3>出库明细</h3>
        <table class="detail-table">
          <thead>
            <tr>
              <th style="width: 60px;">序号</th>
              <th style="width: 120px;">商品编码</th>
              <th style="width: 150px;">商品名称</th>
              <th style="width: 100px;">SKU编码</th>
              <th style="width: 80px;">出库数量</th>
              <th style="width: 80px;">单价</th>
              <th style="width: 100px;">金额</th>
              <th style="width: 100px;">仓库</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in printData.detailListData" :key="index">
              <td class="center">{{ index + 1 }}</td>
              <td>{{ item.goods_code || '--' }}</td>
              <td>{{ item.goods_name || '--' }}</td>
              <td>{{ item.sku_code || '--' }}</td>
              <td class="right">{{ formatNumber(item.qty, true, 4) }}</td>
              <td class="right">{{ formatCurrency(item.price, true) }}</td>
              <td class="right">{{ formatCurrency(item.order_amount, true) }}</td>
              <td>{{ item.warehouse_name || '--' }}</td>
              <td>{{ item.remark || '--' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 汇总信息 -->
      <div class="summary-section" v-if="printData.detailListData && printData.detailListData.length > 0">
        <table class="summary-table">
          <tr>
            <td class="label">总数量：</td>
            <td class="value">{{ getTotalQty() }}</td>
            <td class="label">总金额：</td>
            <td class="value">{{ getTotalAmount() }}</td>
          </tr>
        </table>
      </div>
      
      <!-- 签字区域 -->
      <div class="signature-section">
        <table class="signature-table">
          <tr>
            <td class="signature-item">制单人：{{ printData.c_name || '_________' }}</td>
            <td class="signature-item">审批人：_________</td>
            <td class="signature-item">出库人：_________</td>
            <td class="signature-item">收货人：_________</td>
          </tr>
        </table>
      </div>
      
      <!-- 打印时间 -->
      <div class="print-time">
        <p>打印时间：{{ formatDateTime(new Date()) }}</p>
      </div>
    </div>
    
    <!-- 操作按钮区域 -->
    <div class="print-actions">
      <el-button type="primary" icon="el-icon-printer" @click="handlePrint">打印</el-button>
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </div>
</template>

<script>
import { printApi } from '@/api/40_business/40_out/out/out'

export default {
  name: 'OutPrint',
  props: {
    data: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      printData: {},
      loading: false
    }
  },
  mounted() {
    this.loadPrintData()
  },
  methods: {
    // 加载打印数据
    async loadPrintData() {
      if (!this.data.id) {
        this.$message.error('缺少出库单ID')
        return
      }
      
      this.loading = true
      try {
        const response = await printApi({ id: this.data.id })
        if (response.code === 200) {
          this.printData = response.data || {}
        } else {
          this.$message.error(response.message || '获取打印数据失败')
        }
      } catch (error) {
        console.error('加载打印数据失败:', error)
        this.$message.error('加载打印数据失败')
      } finally {
        this.loading = false
      }
    },
    
    // 计算总数量
    getTotalQty() {
      if (!this.printData.detailListData || this.printData.detailListData.length === 0) {
        return '0'
      }
      
      const total = this.printData.detailListData.reduce((sum, item) => {
        return sum + (parseFloat(item.qty) || 0)
      }, 0)
      
      return formatNumber(total, true, 4)
    },
    
    // 计算总金额
    getTotalAmount() {
      if (!this.printData.detailListData || this.printData.detailListData.length === 0) {
        return '¥0.00'
      }
      
      const total = this.printData.detailListData.reduce((sum, item) => {
        return sum + (parseFloat(item.order_amount) || 0)
      }, 0)
      
      return formatCurrency(total, true)
    },
    
    // 执行打印
    handlePrint() {
      // 隐藏操作按钮
      const printActions = document.querySelector('.print-actions')
      if (printActions) {
        printActions.style.display = 'none'
      }
      
      // 执行打印
      window.print()
      
      // 恢复操作按钮显示
      if (printActions) {
        printActions.style.display = 'block'
      }
    },
    
    // 关闭打印页面
    handleClose() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.print-container {
  padding: 20px;
  background: white;
  font-family: Arial, '微软雅黑', sans-serif;
  min-height: 500px;
  
  .loading-container {
    text-align: center;
    padding: 50px;
    color: #666;
    
    .el-icon {
      font-size: 24px;
      margin-right: 8px;
    }
  }
  
  .print-header {
    text-align: center;
    margin-bottom: 30px;
    
    h1 {
      font-size: 28px;
      font-weight: bold;
      margin: 0;
      color: #333;
    }
  }
  
  .info-section {
    margin-bottom: 25px;
    
    .info-table {
      width: 100%;
      border-collapse: collapse;
      
      td {
        padding: 10px;
        border: 1px solid #ddd;
        font-size: 14px;
        
        &.label {
          background-color: #f8f9fa;
          font-weight: bold;
          width: 120px;
          color: #333;
        }
        
        &.value {
          width: 180px;
          color: #666;
        }
      }
    }
  }
  
  .detail-section {
    margin-bottom: 25px;
    
    h3 {
      margin: 0 0 15px 0;
      font-size: 18px;
      color: #333;
      font-weight: bold;
    }
    
    .detail-table {
      width: 100%;
      border-collapse: collapse;
      
      th, td {
        padding: 10px 8px;
        border: 1px solid #ddd;
        text-align: left;
        font-size: 13px;
        
        &.center {
          text-align: center;
        }
        
        &.right {
          text-align: right;
        }
      }
      
      th {
        background-color: #f8f9fa;
        font-weight: bold;
        color: #333;
        text-align: center;
      }
      
      tbody tr:nth-child(even) {
        background-color: #fafafa;
      }
    }
  }
  
  .summary-section {
    margin-bottom: 25px;
    
    .summary-table {
      width: 100%;
      border-collapse: collapse;
      
      td {
        padding: 12px;
        border: 1px solid #ddd;
        font-size: 15px;
        font-weight: bold;
        
        &.label {
          background-color: #f0f8ff;
          width: 120px;
          color: #333;
        }
        
        &.value {
          width: 180px;
          color: #e74c3c;
        }
      }
    }
  }
  
  .signature-section {
    margin-bottom: 25px;
    
    .signature-table {
      width: 100%;
      border-collapse: collapse;
      
      td {
        padding: 20px 10px;
        border: 1px solid #ddd;
        text-align: center;
        font-size: 14px;
        
        &.signature-item {
          width: 25%;
          color: #333;
        }
      }
    }
  }
  
  .print-time {
    text-align: right;
    margin-bottom: 20px;
    color: #999;
    font-size: 12px;
  }
  
  .print-actions {
    text-align: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 2px solid #eee;
    
    .el-button {
      margin: 0 10px;
    }
  }
}

// 打印专用样式
@media print {
  body * {
    visibility: hidden;
  }
  
  .print-container, .print-container * {
    visibility: visible;
  }
  
  .print-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 0;
    font-size: 12px;
    
    .print-actions {
      display: none !important;
    }
    
    .info-section .info-table td {
      padding: 6px;
    }
    
    .detail-section .detail-table th,
    .detail-section .detail-table td {
      padding: 6px 4px;
      font-size: 11px;
    }
    
    .summary-section .summary-table td {
      padding: 8px;
    }
    
    .signature-section .signature-table td {
      padding: 15px 8px;
    }
  }
  
  @page {
    margin: 1cm;
    size: A4;
  }
}
</style>