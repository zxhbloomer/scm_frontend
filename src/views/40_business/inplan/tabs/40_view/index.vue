<template>
  <div class="app-container">
    <!-- 基本信息区域 -->
    <el-card shadow="never" class="card-container">
      <div slot="header" class="card-header">
        <span>基本信息</span>
      </div>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="info-item">
            <label>入库计划编号：</label>
            <span>{{ dataJson.formData.code }}</span>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="info-item">
            <label>类型：</label>
            <span>{{ dataJson.formData.type_name }}</span>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="info-item">
            <label>状态：</label>
            <el-tag :type="getStatusTagType(dataJson.formData.status)">
              {{ dataJson.formData.status_name }}
            </el-tag>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="info-item">
            <label>计划时间：</label>
            <span>{{ dataJson.formData.plan_time }}</span>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="info-item">
            <label>货主：</label>
            <span>{{ dataJson.formData.owner_name }} ({{ dataJson.formData.owner_code }})</span>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="info-item">
            <label>委托方：</label>
            <span>{{ dataJson.formData.consignor_name }} ({{ dataJson.formData.consignor_code }})</span>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="info-item">
            <label>超收比例：</label>
            <span>{{ formatNumber(dataJson.formData.over_receipt_rate, true, 2) }}%</span>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="info-item">
            <label>下一审批人：</label>
            <span>{{ dataJson.formData.next_approve_name || '无' }}</span>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="info-item">
            <label>BPM实例编码：</label>
            <span>{{ dataJson.formData.bpm_instance_code || '无' }}</span>
          </div>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <div class="info-item">
            <label>备注：</label>
            <span>{{ dataJson.formData.remark || '无' }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 系统信息区域 -->
    <el-card shadow="never" class="card-container">
      <div slot="header" class="card-header">
        <span>系统信息</span>
      </div>

      <el-row :gutter="20">
        <el-col :span="6">
          <div class="info-item">
            <label>创建人：</label>
            <span>{{ dataJson.formData.c_name }}</span>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="info-item">
            <label>创建时间：</label>
            <span>{{ dataJson.formData.c_time }}</span>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="info-item">
            <label>修改人：</label>
            <span>{{ dataJson.formData.u_name || '无' }}</span>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="info-item">
            <label>修改时间：</label>
            <span>{{ dataJson.formData.u_time || '无' }}</span>
          </div>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <div class="info-item">
            <label>BPM流程名称：</label>
            <span>{{ dataJson.formData.bpm_process_name || '无' }}</span>
          </div>
        </el-col>

        <el-col :span="12">
          <div class="info-item">
            <label>数据版本：</label>
            <span>{{ dataJson.formData.dbversion }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 明细信息区域 -->
    <el-card shadow="never" class="card-container">
      <div slot="header" class="card-header">
        <span>明细信息</span>
        <span style="float: right; color: #999;">
          共 {{ dataJson.formData.detailListData ? dataJson.formData.detailListData.length : 0 }} 条明细
        </span>
      </div>

      <el-table
        :data="dataJson.formData.detailListData"
        border
        stripe
        style="width: 100%"
        :max-height="400"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="goods_code" label="商品编码" width="120" />
        <el-table-column prop="goods_name" label="商品名称" width="200" />
        <el-table-column prop="sku_code" label="SKU编码" width="120" />
        <el-table-column prop="qty" label="计划数量" width="100" align="right">
          <template slot-scope="scope">
            {{ formatNumber(scope.row.qty, true, 4) }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100" align="right">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.price, true) }}
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="重量" width="100" align="right">
          <template slot-scope="scope">
            {{ formatNumber(scope.row.weight, true, 4) }}
          </template>
        </el-table-column>
        <el-table-column prop="volume" label="体积" width="100" align="right">
          <template slot-scope="scope">
            {{ formatNumber(scope.row.volume, true, 4) }}
          </template>
        </el-table-column>
        <el-table-column prop="warehouse_name" label="仓库" width="150" />
        <el-table-column prop="supplier_name" label="供应商" width="150" />
        <el-table-column prop="supplier_code" label="供应商编码" width="120" />
        <el-table-column prop="project_code" label="项目编码" width="120" />
        <el-table-column prop="po_contract_code" label="采购合同" width="150" />
        <el-table-column prop="po_order_code" label="采购订单" width="150" />
        <el-table-column prop="remark" label="备注" />
      </el-table>
    </el-card>

    <!-- 处理状态统计 -->
    <el-card v-if="hasProcessingData" shadow="never" class="card-container">
      <div slot="header" class="card-header">
        <span>处理状态统计</span>
      </div>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-statistic
            title="已处理数量"
            :value="totalProcessed.qty"
            :precision="4"
          />
        </el-col>
        <el-col :span="8">
          <el-statistic
            title="处理中数量"
            :value="totalProcessing.qty"
            :precision="4"
          />
        </el-col>
        <el-col :span="8">
          <el-statistic
            title="未处理数量"
            :value="totalUnprocessed.qty"
            :precision="4"
          />
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="8">
          <el-statistic
            title="已处理重量"
            :value="totalProcessed.weight"
            :precision="4"
          />
        </el-col>
        <el-col :span="8">
          <el-statistic
            title="处理中重量"
            :value="totalProcessing.weight"
            :precision="4"
          />
        </el-col>
        <el-col :span="8">
          <el-statistic
            title="未处理重量"
            :value="totalUnprocessed.weight"
            :precision="4"
          />
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="8">
          <el-statistic
            title="已处理体积"
            :value="totalProcessed.volume"
            :precision="4"
          />
        </el-col>
        <el-col :span="8">
          <el-statistic
            title="处理中体积"
            :value="totalProcessing.volume"
            :precision="4"
          />
        </el-col>
        <el-col :span="8">
          <el-statistic
            title="未处理体积"
            :value="totalUnprocessed.volume"
            :precision="4"
          />
        </el-col>
      </el-row>
    </el-card>

    <!-- 底部操作按钮 -->
    <div class="form-footer">
      <el-button @click="handleReturn">返回</el-button>
      <el-button
        v-if="canPrint"
        type="primary"
        icon="el-icon-printer"
        @click="handlePrint"
      >打印</el-button>
    </div>
  </div>
</template>

<script>
import { getApi, printApi } from '@/api/40_business/inplan/inplan'

export default {
  name: 'InPlanView',
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    editStatus: {
      type: String,
      default: 'view'
    },
    enableCancel: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      dataJson: {
        formData: {
          id: null,
          code: '',
          type: '',
          type_name: '',
          status: '',
          status_name: '',
          plan_time: '',
          over_receipt_rate: 0,
          owner_id: null,
          owner_name: '',
          owner_code: '',
          consignor_id: null,
          consignor_name: '',
          consignor_code: '',
          remark: '',
          next_approve_name: '',
          bpm_instance_code: '',
          bpm_process_name: '',
          c_name: '',
          c_time: '',
          u_name: '',
          u_time: '',
          dbversion: null,
          detailListData: []
        }
      },
      settings: {
        loading: false
      }
    }
  },
  computed: {
    /**
     * 是否有处理状态数据
     */
    hasProcessingData () {
      return this.dataJson.formData.detailListData &&
             this.dataJson.formData.detailListData.some(item =>
               item.processed_qty || item.processing_qty || item.unprocessed_qty ||
               item.processed_weight || item.processing_weight || item.unprocessed_weight ||
               item.processed_volume || item.processing_volume || item.unprocessed_volume
             )
    },

    /**
     * 已处理统计
     */
    totalProcessed () {
      return this.calculateTotal('processed')
    },

    /**
     * 处理中统计
     */
    totalProcessing () {
      return this.calculateTotal('processing')
    },

    /**
     * 未处理统计
     */
    totalUnprocessed () {
      return this.calculateTotal('unprocessed')
    },

    /**
     * 是否可以打印
     */
    canPrint () {
      return this.dataJson.formData.id && this.$permission('P_IN_PLAN:PRINT')
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    /**
     * 初始化数据
     */
    async initData () {
      if (this.data && this.data.id) {
        try {
          this.settings.loading = true
          const response = await getApi({ id: this.data.id })

          // 填充表单数据
          Object.assign(this.dataJson.formData, response.data)

          // 确保明细数据存在
          if (!this.dataJson.formData.detailListData) {
            this.dataJson.formData.detailListData = []
          }
        } catch (error) {
          console.error('加载数据失败:', error)
          this.$message.error('加载数据失败')
        } finally {
          this.settings.loading = false
        }
      }
    },

    /**
     * 计算统计数据
     */
    calculateTotal (type) {
      const details = this.dataJson.formData.detailListData || []

      return details.reduce((total, item) => {
        return {
          qty: total.qty + (item[`${type}_qty`] || 0),
          weight: total.weight + (item[`${type}_weight`] || 0),
          volume: total.volume + (item[`${type}_volume`] || 0)
        }
      }, { qty: 0, weight: 0, volume: 0 })
    },

    /**
     * 获取状态标签类型
     */
    getStatusTagType (status) {
      const statusMap = {
        'SUBMITTED': 'warning',
        'APPROVED': 'success',
        'RETURN': 'danger',
        'FINISH': 'info',
        'CANCEL': 'info',
        'CANCEL_BEING_AUDITED': 'warning'
      }
      return statusMap[status] || 'info'
    },

    /**
     * 打印
     */
    async handlePrint () {
      try {
        this.settings.loading = true
        const response = await printApi({ id: this.dataJson.formData.id })

        // 这里处理打印逻辑，比如打开打印窗口或下载PDF
        console.log('打印数据:', response.data)
        this.$message.success('打印功能开发中...')
      } catch (error) {
        console.error('获取打印数据失败:', error)
        this.$message.error('获取打印数据失败')
      } finally {
        this.settings.loading = false
      }
    },

    /**
     * 返回
     */
    handleReturn () {
      this.$emit('emitReturn')
    }
  }
}
</script>

<style lang="scss" scoped>
.card-container {
  margin-bottom: 20px;
}

.card-header {
  font-weight: bold;
}

.info-item {
  margin-bottom: 12px;
  line-height: 24px;

  label {
    font-weight: 500;
    color: #606266;
    min-width: 100px;
    display: inline-block;
  }

  span {
    color: #303133;
  }
}

.form-footer {
  text-align: center;
  padding: 20px;
  border-top: 1px solid #e6e6e6;
  margin-top: 20px;
}

.form-footer .el-button {
  margin: 0 10px;
}

.el-statistic {
  text-align: center;
}
</style>
