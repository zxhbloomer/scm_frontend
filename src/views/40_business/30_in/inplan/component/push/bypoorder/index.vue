<template>
  <div class="app-container">
    <div class="edit-container">
      <el-form
        ref="dataSubmitForm"
        :rules="settings.rules"
        :model="dataJson.tempJson"
        label-position="right"
        label-width="150px"
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
          <el-descriptions-item label="计划编号">
            {{ dataJson.tempJson.code == null || dataJson.tempJson.code === ''?'系统自动生成':dataJson.tempJson.code }}
          </el-descriptions-item>

          <el-descriptions-item span="2" label="入库类型">
            <span>采购入库</span>
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
              class="required-mark"
            >
              计划入库时间
            </div>
            <el-form-item
              prop="plan_time"
              label-width="0"
            >
              <el-date-picker
                v-model="dataJson.tempJson.plan_time"
                value-format="yyyy-MM-dd"
                type="date"
                clearable
                :placeholder="'选择日期'"
                style="width: 100%"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="超收比例(%)">
            <el-form-item
              prop="over_receipt_rate"
              label-width="0"
            >
              <numeric
                v-model="dataJson.tempJson.over_receipt_rate"
                :positive-percentage="true"
                style="width: 100%"
                @change.native="handleOverReceiptRateChange"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="备注" span="3">
            <el-input
              v-model.trim="dataJson.tempJson.remark"
              clearable
              placeholder="请输入"
              :maxlength="dataJson.inputSettings.maxLength.remark"
            />
          </el-descriptions-item>

          <el-descriptions-item label="附件材料" span="3">
            <el-row style="display: flex;flex-wrap: wrap;">
              <Simple-upload-mutil-file
                :accept="'*'"
                @upload-success="handleOtherUploadFileSuccess"
                @upload-error="handleFileError"
              />
            </el-row>
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.doc_att"
                :key="i"
                :offset="0"
                :span="3"
              >
                <previewCard
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeOtherFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>
        </el-descriptions>

        <el-alert
          title="入库货物明细"
          type="info"
          :closable="false"
        />

        <el-table
          ref="multipleTable"
          v-loading="settings.loading"
          :data="dataJson.tempJson.detailListData"
          :element-loading-text="'正在拼命加载中...'"
          element-loading-background="rgba(255, 255, 255, 0.5)"
          height="350px"
          stripe
          border
          fit
          highlight-current-row
          :default-sort="{prop: 'u_time', order: 'descending'}"
          style="width: calc(100% - 20px )"
          :row-class-name="getRowClassName"
          @row-click="handleRowClick"
          @current-change="handleCurrentChange"
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
              prop="supplier_name"
              label="供应商"
              align="left"
            >
              <template v-slot="scope">
                {{ scope.row.supplier_name || '-' }}
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

          <!-- 历史入库 -->
          <el-table-column label="历史入库" align="center">
            <el-table-column
              show-overflow-tooltip
              min-width="100"
              prop="processed_qty"
              label="已入库数量"
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
              label="待入库数量"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.unprocessed_qty == null? '-' : formatNumber(scope.row.unprocessed_qty,true,4) }}
              </template>
            </el-table-column>
          </el-table-column>

          <!-- 本次入库计划 -->
          <el-table-column label="本次入库计划" align="center">
            <el-table-column
              show-overflow-tooltip
              min-width="120"
              prop="qty"
              label="入库数量"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.qty == null? '-' : formatNumber(scope.row.qty,true,4) }}
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

          <!-- 操作 -->
          <el-table-column
            label="入库计划"
            width="120"
            align="center"
            fixed="right"
          >
            <template v-slot="scope">
              <el-button
                type="primary"
                size="mini"
                @click="handlePlanDetail(scope.$index, scope.row)"
              >
                入库计划
              </el-button>
            </template>
          </el-table-column>
        </el-table>

      </el-form>
    </div>
    <div
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :loading="settings.loading"
        @click="startProcess"
      >提交审批并保存</el-button>
      <el-button @click="handleCancel">返回</el-button>
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

    <!--仓库设置弹窗-->
    <warehouse-set-dialog
      v-if="popSettingsData.warehouseSetDialog.visible"
      :visible="popSettingsData.warehouseSetDialog.visible"
      :data="popSettingsData.warehouseSetDialog.data"
      @closeMeOk="handleWarehouseSetCloseOk"
      @closeMeCancel="handleWarehouseSetCloseCancel"
    />
  </div>
</template>

<style scoped>
.edit-container {
  height: calc(100vh - 160px);
  overflow-x: auto;
}
.dialog-footer {
  text-align: center;
}

/* 校验错误行的样式 - 使用更强的选择器覆盖Element UI默认样式 */
::v-deep .el-table__body tr.validation-error-row td {
  background-color: #fef0f0 !important;
}

::v-deep .el-table__body tr.validation-error-row:hover td {
  background-color: #fde2e2 !important;
}

/* 覆盖条纹表格的样式 */
::v-deep .el-table--striped .el-table__body tr.validation-error-row.el-table__row--striped td {
  background-color: #fef0f0 !important;
}

::v-deep .el-table--striped .el-table__body tr.validation-error-row.el-table__row--striped:hover td {
  background-color: #fde2e2 !important;
}

/* 覆盖鼠标悬停的默认样式 */
::v-deep .el-table--enable-row-hover .el-table__body tr.validation-error-row:hover td {
  background-color: #fde2e2 !important;
}
.el-descriptions {
  margin-top: 10px;
  margin-bottom: 10px;
}
.el-button-group {
  margin-top: 10px;
  margin-left: 10px;
}
.el-table {
  margin: 10px;
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
.form-items-container {
  display: flex;
  align-items: center;
}

.left-side {
  flex: 9; /* 或者你想要的更高的值，表示左边占据较多的空间 */
}

.right-side {
  flex: 1; /* 或者你想要的更低的值，表示右边占据较少的空间 */
  margin-left: 5px;
}
.fontWeight {
  font-weight: bold;
  color: #1890ff;
}
</style>

<script>
import numeric from '@/components/40_input/numeric/index.vue'
import constants_dict from '@/common/constants/constants_dict'
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { insertApi, validateApi, initPlanDataApi } from '@/api/40_business/30_in/inplan/inplan.js'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'
import permission from '@/directive/permission'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import { getApi } from '@/api/40_business/10_po/poorder/poorder.js'
import WarehouseSetDialog from '@/views/40_business/30_in/inplan/dialog/warehouse/plan/index.vue'

export default {
  directives: { elDragDialog, permission },
  components: {
    numeric,
    SimpleUploadMutilFile,
    PreviewCard,
    BpmDialog,
    WarehouseSetDialog
  },
  mixins: [],
  props: {
    poId: {
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
        loading: false,
        duration: 4000,
        rules: {
          plan_time: [
            { required: true, message: '请选择计划入库时间', trigger: 'change' }
          ]
        },
        btnSubmitDisabledStatus: {
          disabledSubmit: false,
          btnText: '提交'
        }
      },
      dataJson: {
        tempJsonOriginal: {
          detailListData: [],
          type: constants_dict.DICT_B_IN_PLAN_TYPE_CG, // 采购入库
          doc_att_files: []
        },
        tempJson: {
          detailListData: [],
          code: '',
          type: constants_dict.DICT_B_IN_PLAN_TYPE_CG, // 采购入库
          doc_att_files: []
        },
        currentJson: {},
        rowIndex: null,
        inputSettings: {
          maxLength: {
            remark: 500
          }
        },
        doc_att: [],
        doc_att_file: [],
        doc_att_files: []
      },
      popSettingsData: {
        sponsorDialog: {
          visible: false,
          serial_type: 'b_in_plan',
          form_data: {},
          initial_process: null,
          process_users: []
        },
        // 仓库设置弹窗
        warehouseSetDialog: {
          visible: false,
          data: {}
        }
      }
    }
  },
  computed: {
  },
  watch: {
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
    this.init()
  },
  destroyed () {
  },
  methods: {
    init () {
      this.getData()
    },
    getData () {
      this.settings.loading = true
      getApi({ id: this.poId }).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.tempJson.owner_name = this.dataJson.tempJson.purchaser_name
        this.dataJson.tempJson.owner_id = this.dataJson.tempJson.purchaser_id
        this.dataJson.tempJson.owner_code = this.dataJson.tempJson.purchaser_code

        // 调用初始化计划数据API
        initPlanDataApi({ id: this.poId, order_id: this.poId }).then(response => {
          // 将计划数据赋值给detailListData
          this.dataJson.tempJson.detailListData = deepCopy(response.data)
        }).catch(error => {
          console.error('获取入库计划数据失败:', error)
          this.showErrorMsg('获取入库计划数据失败，请重试')
        }).finally(() => {
          this.settings.loading = false
        })
      }).catch(error => {
        console.error('获取采购订单数据失败:', error)
        this.showErrorMsg('获取采购订单数据失败，请重试')
        this.settings.loading = false
      })
    },
    handleOverReceiptRateChange () {
      // 超收比例变更处理逻辑
    },
    // 处理入库计划按钮点击事件
    handlePlanDetail (index, row) {
      // 打开仓库设置弹窗
      this.popSettingsData.warehouseSetDialog.visible = true
      this.popSettingsData.warehouseSetDialog.data = {
        contract_code: row.contract_code || '',
        order_code: row.order_code || '',
        goods_name: row.goods_name || '',
        sku_name: row.sku_name || '',
        qty: row.qty || null,
        warehouse_id: row.warehouse_id || null,
        warehouse_code: row.warehouse_code || '',
        warehouse_name: row.warehouse_name || '',
        location_id: row.location_id || null,
        location_code: row.location_code || '',
        location_name: row.location_name || '',
        bin_id: row.bin_id || null,
        bin_code: row.bin_code || '',
        bin_name: row.bin_name || '',
        // 新增字段
        order_qty: row.order_qty || 0, // 订单数量
        order_price: row.order_price || 0, // 订单单价
        processed_qty: row.processed_qty || 0, // 已入库数量
        unprocessed_qty: row.unprocessed_qty || 0, // 待入库数量
        price: row.price || null, // 入库单价
        rowIndex: index // 传递行索引用于更新数据
      }
    },
    // 处理返回按钮点击事件
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    handleOtherUploadFileSuccess (data) {
      this.dataJson.doc_att.push({
        fileName: data.file.name,
        url: data.response.data.url,
        timestamp: new Date().getTime()
      })
      this.dataJson.tempJson.doc_att_files = this.dataJson.doc_att
    },
    handleFileError (err, file, fileList) {
      console.error('文件上传失败:', err)
      this.showErrorMsg('文件上传失败，请重试')
    },
    removeOtherFile (val) {
      const index = this.dataJson.doc_att.findIndex(item => item.url === val)
      if (index !== -1) {
        this.dataJson.doc_att.splice(index, 1)
        this.dataJson.tempJson.doc_att_files = this.dataJson.doc_att
      }
    },
    handleRowClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
    },
    // 获取行索引
    getRowIndex (row) {
      const _index = this.dataJson.tempJson.detailListData.lastIndexOf(row)
      return _index
    },
    handleCurrentChange (row) {
      if (row) {
        this.dataJson.currentJson = Object.assign({}, row) // copy obj
        this.dataJson.currentJson.index = this.getRowIndex(row)
        this.dataJson.rowIndex = this.getRowIndex(row)
      } else {
        this.dataJson.currentJson = {}
        this.dataJson.rowIndex = null
      }
    },
    /**
     * 校验入库货物明细的入库计划设置
     * 检查每一行是否都设置了入库数量
     */
    validateInPlanDetails () {
      // 重置所有行的错误状态
      this.dataJson.tempJson.detailListData.forEach(item => {
        this.$set(item, 'hasValidationError', false)
      })

      let hasError = false

      // 检查每一行的入库数量
      this.dataJson.tempJson.detailListData.forEach((item, index) => {
        // 检查入库数量是否为空
        if (item.qty == null || item.qty === '' || item.qty === undefined || item.qty <= 0) {
          // 标记该行有校验错误
          this.$set(item, 'hasValidationError', true)
          hasError = true
        }
      })

      return {
        isValid: !hasError
      }
    },

    /**
     * 获取表格行的CSS类名
     * 用于给校验失败的行添加红色背景
     */
    getRowClassName ({ row, rowIndex }) {
      if (row.hasValidationError) {
        return 'validation-error-row'
      }
      return ''
    },
    startProcess () {
      this.showLoading('正在保存，请稍后...')

      // 校验入库货物明细的入库计划设置
      const validationResult = this.validateInPlanDetails()
      if (!validationResult.isValid) {
        this.closeLoading()
        this.showErrorMsg('校验出错：入库货物明细，存在尚未完成设置的数据。')
        return
      }

      // 表单验证
      this.$refs.dataSubmitForm.validate((valid) => {
        if (valid) {
          if (!this.dataJson.tempJson.detailListData || this.dataJson.tempJson.detailListData.length === 0) {
            this.closeLoading()
            this.showErrorMsg('请添加入库货物明细')
            return
          }

          // 校验业务数据
          const tempData = deepCopy(this.dataJson.tempJson)
          tempData.check_type = constants_para.INSERT_CHECK_TYPE

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
          this.showErrorMsg('表单验证失败，请检查输入信息')
        }
      })
    },
    getFlow () {
      getFlowProcessApi({ 'serial_type': this.popSettingsData.sponsorDialog.serial_type })
        .then((rsp) => {
          if (rsp.data === null) {
            this.showErrorMsg('未找到审批流程，请联系管理员')
            this.settings.loading = false
          } else {
            this.popSettingsData.sponsorDialog.form_data = {}
            this.popSettingsData.sponsorDialog.visible = true
          }
        }).catch((err) => {
          this.settings.loading = false
          this.showErrorMsg(err)
        })
    },
    handleBpmDialogCancel () {
      console.log('关闭审批组件')
      this.popSettingsData.sponsorDialog.visible = false
      this.settings.loading = false
      this.closeLoading()
    },
    handleBpmDialogOk (data) {
      this.popSettingsData.sponsorDialog.initial_process = data.processData
      this.popSettingsData.sponsorDialog.process_users = data.process_users
      this.popSettingsData.sponsorDialog.visible = false
      this.doInsert()
    },
    doInsert () {
      const tempData = deepCopy(this.dataJson.tempJson)
      tempData.check_type = constants_para.INSERT_CHECK_TYPE
      // 审批流程启动数据
      tempData.initial_process = this.popSettingsData.sponsorDialog.initial_process // 流程
      tempData.form_data = this.popSettingsData.sponsorDialog.form_data // 表单参数
      tempData.process_users = this.popSettingsData.sponsorDialog.process_users // 自选用户

      insertApi(tempData).then(response => {
        if (response.success) {
          this.closeLoading()
          this.$notify({
            title: '提交成功',
            message: '入库计划已成功提交审批',
            type: 'success',
            duration: this.settings.duration
          })

          this.$emit('closeMeOk', tempData)
        } else {
          this.closeLoading()
          this.showErrorMsg(response.message || '提交失败，请重试')
        }
      }).catch(error => {
        this.closeLoading()
        console.error('提交入库计划失败:', error)
        this.showErrorMsg('提交失败，请重试')
      })
    },
    // 仓库设置弹窗：确定
    handleWarehouseSetCloseOk (data) {
      this.popSettingsData.warehouseSetDialog.visible = false
      const rowIndex = this.popSettingsData.warehouseSetDialog.data.rowIndex
      if (rowIndex !== undefined && this.dataJson.tempJson.detailListData[rowIndex]) {
        // 更新对应行的数据
        const targetRow = this.dataJson.tempJson.detailListData[rowIndex]
        targetRow.qty = data.qty
        targetRow.price = data.price
        targetRow.warehouse_id = data.warehouse_id
        targetRow.warehouse_code = data.warehouse_code
        targetRow.warehouse_name = data.warehouse_name
        targetRow.location_id = data.location_id
        targetRow.location_code = data.location_code
        targetRow.location_name = data.location_name
        targetRow.bin_id = data.bin_id
        targetRow.bin_code = data.bin_code
        targetRow.bin_name = data.bin_name

        this.$notify({
          title: '设置成功',
          message: '仓库信息已更新',
          type: 'success',
          duration: this.settings.duration
        })
      }
    },
    // 仓库设置弹窗：取消
    handleWarehouseSetCloseCancel () {
      this.popSettingsData.warehouseSetDialog.visible = false
    }
  }
}
</script>
