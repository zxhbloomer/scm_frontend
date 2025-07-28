<template>
  <el-dialog
    v-el-drag-dialog
    title="请选择出库货物明细"
    :visible.sync="visible"
    width="90%"
    :before-close="handleClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="select-goods-dialog"
  >
    <div class="dialog-content">
      <div class="app-container">
        <div>
          <el-form
            ref="dataSubmitForm"
            :model="dataJson.tempJson"
            label-position="right"
            label-width="150px"
            status-icon
          >
            <!-- 基本信息 -->
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
              <el-descriptions-item label="计划编号">
                {{ dataJson.tempJson.code == null || dataJson.tempJson.code === '' ? '系统自动生成' : dataJson.tempJson.code }}
              </el-descriptions-item>

              <el-descriptions-item label="出库类型" span="2">
                {{ dataJson.tempJson.type_name || '-' }}
              </el-descriptions-item>

              <el-descriptions-item label="货主">
                {{ dataJson.tempJson.owner_name || '-' }}
              </el-descriptions-item>

              <el-descriptions-item label="计划出库时间">
                {{ formatDate(dataJson.tempJson.plan_time) }}
              </el-descriptions-item>

              <el-descriptions-item label="超发比例(%)">
                {{ dataJson.tempJson.over_receipt_rate == null ? '-' : formatNumber(dataJson.tempJson.over_receipt_rate, true, 2) }}
              </el-descriptions-item>

              <el-descriptions-item label="备注" span="3">
                {{ dataJson.tempJson.remark || '-' }}
              </el-descriptions-item>
            </el-descriptions>

            <!-- 出库货物明细 -->
            <el-alert
              title="出库货物明细（请选择需要出库的货物）"
              type="info"
              :closable="false"
            />

            <el-table
              ref="multipleTable"
              v-loading="settings.loading"
              :data="dataJson.tempJson.detailListData"
              :element-loading-text="'正在拼命加载中...'"
              element-loading-background="rgba(255, 255, 255, 0.5)"
              height="400px"
              stripe
              border
              fit
              highlight-current-row
              :default-sort="{prop: 'u_time', order: 'descending'}"
              style="width: calc(100% - 20px )"
              @row-click="handleRowClick"
              @current-change="handleCurrentChange"
              @selection-change="handleSelectionChange"
            >
              <el-table-column
                type="index"
                width="45"
                label="No"
                fixed="left"
              />

              <!-- 合同订单信息 -->
              <el-table-column label="合同订单信息" align="center">
                <el-table-column
                  show-overflow-tooltip
                  min-width="120"
                  label="合同编号｜订单编号"
                  align="left"
                >
                  <template v-slot="scope">
                    <div style="line-height: 1.2;">
                      <div>{{ scope.row.contract_code || '-' }}</div>
                      <div>{{ scope.row.order_code || '-' }}</div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  show-overflow-tooltip
                  min-width="150"
                  label="商品名称｜规格"
                  align="left"
                >
                  <template v-slot="scope">
                    <div style="line-height: 1.2;">
                      <div>{{ scope.row.goods_name || '-' }}</div>
                      <div>{{ scope.row.sku_name || '-' }}</div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  show-overflow-tooltip
                  min-width="120"
                  prop="customer_name"
                  label="客户"
                  align="left"
                >
                  <template v-slot="scope">
                    {{ scope.row.customer_name || '-' }}
                  </template>
                </el-table-column>
                <el-table-column
                  show-overflow-tooltip
                  min-width="100"
                  prop="order_qty"
                  label="订单数量"
                  align="right"
                >
                  <template v-slot="scope">
                    {{ scope.row.order_qty == null? '-' : formatNumber(scope.row.order_qty,true,4) }}
                  </template>
                </el-table-column>
                <el-table-column
                  show-overflow-tooltip
                  min-width="80"
                  prop="unit"
                  label="单位"
                  align="center"
                >
                  <template v-slot="scope">
                    {{ scope.row.unit_name || scope.row.unit || '吨' }}
                  </template>
                </el-table-column>
                <el-table-column
                  show-overflow-tooltip
                  min-width="100"
                  prop="order_price"
                  label="订单单价"
                  align="right"
                >
                  <template v-slot="scope">
                    {{ scope.row.order_price == null? '-' : formatCurrency(scope.row.order_price,true) }}
                  </template>
                </el-table-column>
                <el-table-column
                  show-overflow-tooltip
                  min-width="100"
                  prop="order_amount"
                  label="订单金额"
                  align="right"
                >
                  <template v-slot="scope">
                    {{ scope.row.order_amount == null? '-' : formatCurrency(scope.row.order_amount,true) }}
                  </template>
                </el-table-column>
              </el-table-column>

              <!-- 历史出库 -->
              <el-table-column label="历史出库" align="center">
                <el-table-column
                  show-overflow-tooltip
                  min-width="100"
                  prop="processed_qty"
                  label="已出库数量"
                  align="right"
                >
                  <template v-slot="scope">
                    {{ scope.row.processed_qty == null? '-' : formatNumber(scope.row.processed_qty,true,4) }}
                  </template>
                </el-table-column>
                <el-table-column
                  show-overflow-tooltip
                  min-width="100"
                  prop="unprocessed_qty"
                  label="待出库数量"
                  align="right"
                >
                  <template v-slot="scope">
                    {{ scope.row.unprocessed_qty == null? '-' : formatNumber(scope.row.unprocessed_qty,true,4) }}
                  </template>
                </el-table-column>
              </el-table-column>

              <!-- 本次出库计划 -->
              <el-table-column label="本次出库计划" align="center">
                <el-table-column
                  show-overflow-tooltip
                  min-width="120"
                  prop="qty"
                  label="出库数量"
                  align="right"
                >
                  <template v-slot="scope">
                    {{ scope.row.qty == null? '-' : formatNumber(scope.row.qty,true,4) }}
                  </template>
                </el-table-column>
                <el-table-column
                  show-overflow-tooltip
                  min-width="100"
                  prop="price"
                  label="出库单价"
                  align="right"
                >
                  <template v-slot="scope">
                    {{ scope.row.price == null? '-' : formatCurrency(scope.row.price,true) }}
                  </template>
                </el-table-column>
                <el-table-column
                  show-overflow-tooltip
                  min-width="150"
                  label="仓库/库区/库位"
                  align="left"
                >
                  <template v-slot="scope">
                    <div style="line-height: 1.2;">
                      <div>{{ scope.row.warehouse_name || '-' }}</div>
                      <div>{{ scope.row.location_name || '-' }}</div>
                      <div>{{ scope.row.bin_name || '-' }}</div>
                    </div>
                  </template>
                </el-table-column>
              </el-table-column>

              <!-- 备注 -->
              <el-table-column
                show-overflow-tooltip
                min-width="100"
                prop="remark"
                label="备注"
                align="left"
              >
                <template v-slot="scope">
                  {{ scope.row.remark || '-' }}
                </template>
              </el-table-column>
            </el-table>

          </el-form>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        plain
        type="primary"
        :disabled="!hasSelectedRows"
        :loading="settings.loading"
        @click="handleNext"
      >下一步</el-button>
      <el-button
        plain
        :loading="settings.loading"
        @click="handleClose"
      >关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import constants_para from '@/common/constants/constants_para'
import constants_dict from '@/common/constants/constants_dict'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getApi } from '@/api/40_business/40_out/outplan/outplan'

export default {
  name: 'SelectGoodsDialog',
  directives: { elDragDialog },
  props: {
    // 弹窗显示状态
    visible: {
      type: Boolean,
      default: false
    },
    // 出库计划ID
    outPlanId: {
      type: [String, Number],
      default: null
    }
  },
  data () {
    return {
      constants_para,
      constants_dict,
      contentStyle: {
        width: '15%'
      },
      labelStyle: {
        width: '10%',
        'text-align': 'right'
      },
      settings: {
        loading: false
      },
      dataJson: {
        // 单条数据 json
        tempJson: {
          detailListData: [],
          code: '',
          type: '',
          type_name: '',
          owner_id: null,
          owner_name: '',
          owner_code: '',
          plan_time: null,
          over_receipt_rate: null,
          remark: '',
          plan_total: 0,
          so_order_id: null,
          so_order_code: '',
          so_contract_code: '',
          project_code: '',
          status: '',
          status_name: '',
          consignee_name: ''
        }
      },
      // 选中的行数据（单行选择）
      selectedRow: null
    }
  },
  computed: {
    // 是否有选中的行
    hasSelectedRows () {
      return this.selectedRow !== null
    }
  },
  watch: {
    // 监听弹窗显示状态
    visible (newVal) {
      if (newVal && this.outPlanId) {
        this.getData()
      }
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
  },
  mounted () {
  },
  methods: {
    // 获取数据
    getData () {
      if (!this.outPlanId) {
        this.showErrorMsg('出库计划ID不能为空')
        return
      }

      this.settings.loading = true
      // 调用API获取出库计划详情
      const queryData = { id: this.outPlanId }

      getApi(queryData).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.tempJson.detailListData = [...response.data.detailListData]

        // 清空之前的选择
        this.selectedRow = null
        this.$nextTick(() => {
          if (this.$refs.multipleTable) {
            this.$refs.multipleTable.setCurrentRow()
          }

          // 检查数据条数并处理相应逻辑
          this.handleDataAfterLoad()
        })
      }).catch(error => {
        console.error('获取出库计划详情失败:', error)
        this.showErrorMsg('获取出库计划详情失败，请重试')
        // 出错时关闭loading
        this.settings.loading = false
      })
      // 注意：成功时不在这里关闭loading，由handleDataAfterLoad处理
    },

    /**
     * 数据加载完成后的处理逻辑
     */
    handleDataAfterLoad () {
      const detailList = this.dataJson.tempJson.detailListData || []

      console.log('=== 出库货物明细数据加载完成 ===')
      console.log('数据条数:', detailList.length)
      console.log('详细数据:', detailList)

      if (detailList.length > 1) {
        // 多条数据，关闭loading，让用户手动选择
        console.log('多条数据，关闭loading，等待用户选择')
        this.settings.loading = false
      } else if (detailList.length === 1) {
        // 只有一条数据，自动选中并进入下一步
        console.log('只有一条数据，自动选中并进入下一步')
        this.autoSelectAndNext(detailList[0])
      } else {
        // 没有数据，关闭loading并提示
        console.log('没有可出库的货物明细')
        this.settings.loading = false
        this.showErrorMsg('没有可出库的货物明细')
      }
    },

    /**
     * 自动选中第一条数据并进入下一步
     */
    autoSelectAndNext (firstRow) {
      console.log('=== 开始自动选择流程 ===')
      console.log('自动选中的数据:', firstRow)

      // 模拟用户点击选中第一条数据
      setTimeout(() => {
        console.log('模拟点击选中第一条数据...')

        // 设置选中行
        if (this.$refs.multipleTable) {
          this.$refs.multipleTable.setCurrentRow(firstRow)
        }

        // 更新选中状态
        this.selectedRow = deepCopy(firstRow)
        console.log('已选中数据:', this.selectedRow)

        // 延时1000毫秒后自动触发下一步
        setTimeout(() => {
          console.log('延时完成，自动触发下一步...')

          // 关闭loading
          this.settings.loading = false

          // 触发下一步
          this.handleNext()
        }, 1000)
      }, 100) // 短暂延时确保DOM更新完成
    },

    /**
     * 处理行点击
     */
    handleRowClick (row, column, event) {
      // 设置当前选中行
      this.$refs.multipleTable.setCurrentRow(row)
    },

    /**
     * 处理当前行变化
     */
    handleCurrentChange (currentRow, oldCurrentRow) {
      // 更新选中的行数据
      this.selectedRow = deepCopy(currentRow)
      console.log('选中的货物明细:', this.selectedRow)
    },

    /**
     * 处理多选变化（保留但不使用）
     */
    handleSelectionChange (selection) {
      // 保留方法以防止报错，但不使用
    },

    /**
     * 处理下一步按钮点击
     */
    handleNext () {
      // 检查是否有选中的行
      if (!this.hasSelectedRows) {
        this.showErrorMsg('请选择一条出库货物明细')
        return
      }

      // 记录日志
      console.log('出库货物明细选择 - 下一步按钮被点击', {
        action: '下一步',
        outPlanId: this.outPlanId,
        selectedGoods: {
          id: this.selectedRow.id,
          goodsName: this.selectedRow.goods_name,
          skuName: this.selectedRow.sku_name,
          qty: this.selectedRow.qty,
          contractCode: this.selectedRow.contract_code,
          orderCode: this.selectedRow.order_code
        },
        timestamp: new Date().toISOString(),
        user: this.$store.getters.name || 'unknown'
      })

      // 触发下一步事件，传递选中的数据
      this.$emit('next', {
        selectedRow: this.selectedRow,
        planData: this.dataJson.tempJson
      })
    },

    /**
     * 关闭弹窗
     */
    handleClose () {
      // 清空数据
      this.selectedRow = null
      this.dataJson.tempJson = {
        detailListData: [],
        code: '',
        type: '',
        type_name: '',
        owner_id: null,
        owner_name: '',
        owner_code: '',
        plan_time: null,
        over_receipt_rate: null,
        remark: '',
        plan_total: 0,
        so_order_id: null,
        so_order_code: '',
        so_contract_code: '',
        project_code: '',
        status: '',
        status_name: '',
        consignee_name: ''
      }

      // 触发关闭事件
      this.$emit('update:visible', false)
      this.$emit('close')
    },

    /**
     * 显示错误信息
     */
    showErrorMsg (message) {
      this.$message.error(message)
    },

    /**
     * 显示成功信息
     */
    showSuccessMsg (message) {
      this.$message.success(message)
    }
  }
}
</script>

<style scoped>
.select-goods-dialog .dialog-content {
  max-height: 70vh;
  overflow-y: auto;
}

.dialog-footer {
  text-align: center;
}

.dialog-footer .el-button {
  margin: 0 8px;
}

.el-descriptions {
  margin-top: 10px;
  margin-bottom: 10px;
}

.el-table {
  margin: 10px;
}

.app-container {
  padding: 0;
}
</style>