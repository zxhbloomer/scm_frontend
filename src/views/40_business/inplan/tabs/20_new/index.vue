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

          <el-descriptions-item span="2">
            <div
              slot="label"
              class="required-mark"
            >
              入库类型
            </div>
            <el-form-item
              prop="type_name"
              label-width="0"
            >
              <radio-dict
                v-model="dataJson.tempJson.type_name"
                :value="dataJson.tempJson.type_name"
                :para="CONSTANTS.DICT_B_IN_PLAN_TYPE"
                :disabled="settings.inputDisabledStatus.disabledTypeSelect"
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
              <el-col :span="1">
                <Simple-upload-mutil-file
                  :accept="'*'"
                  @upload-success="handleOtherUploadFileSuccess"
                  @upload-error="handleFileError"
                />
              </el-col>
              <el-col
                v-for="(item, i) in dataJson.doc_att"
                :key="i"
                :offset="1"
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
        <el-button-group>
          <el-button
            type="primary"
            icon="el-icon-circle-plus-outline"
            :disabled="settings.btnTableDisabledStatus.disabledInsert"
            :loading="settings.loading"
            @click="handleGoodsInsert"
          >新增</el-button>
          <el-button
            :disabled="settings.btnTableDisabledStatus.disabledDelete"
            type="primary"
            icon="el-icon-circle-close"
            :loading="settings.loading"
            @click="handleGoodsDelete"
          >删除</el-button>
        </el-button-group>

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
              align="center"
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
              align="center"
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
            />
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
              align="center"
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
            label="操作"
            width="120"
            align="center"
            fixed="right"
          >
            <template v-slot="scope">
              <el-button
                type="text"
                size="small"
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
        @click="handleReset()"
      >重置</el-button>
      <el-button
        size="medium"
        :disabled="settings.loading"
        @click="handleCancel()"
      >返回</el-button>
    </div>

    <!--货主选择对话框-->
    <owner-dialog
      v-if="popSettingsData.ownerDialogData.visible"
      :visible="popSettingsData.ownerDialogData.visible"
      :data="popSettingsData.ownerDialogData.data"
      :title="'货主选择'"
      @closeMeOk="handleOwnerCloseOk"
      @closeMeCancel="handleOwnerCloseCancel"
    />

    <!--入库商品对话框-->
    <goods-dialog
      v-if="popSettingsData.goodsDialog.visible"
      :visible="popSettingsData.goodsDialog.visible"
      :data="popSettingsData.goodsDialog.data"
      @closeMeOk="handleGoodsCloseOk"
      @closeMeCancel="handleGoodsCloseCancel"
    />

    <!-- 审批流程设置：选择人 -->
    <bpm-dialog
      v-if="popSettingsData.sponsorDialog.visible"
      :visible="popSettingsData.sponsorDialog.visible"
      :form-data="popSettingsData.sponsorDialog.form_data"
      :serial-type="popSettingsData.sponsorDialog.serial_type"
      @closeMeCancel="handleBpmDialogCancel"
      @closeMeOk="handleBpmDialogOk"
    />

    <!--采购订单关联单号弹窗-->
    <po-order-list-dialog
      v-if="popSettingsData.poContractDialog.visible"
      :visible="popSettingsData.poContractDialog.visible"
      :data="popSettingsData.poContractDialog.data"
      title="添加关联单-采购订单"
      @closeMeOk="handlePoContractCloseOk"
      @closeMeCancel="handlePoContractCloseCancel"
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
import RadioDict from '@/components/00_dict/redio'
import numeric from '@/components/40_input/numeric'
import constants_para from '@/common/constants/constants_para'
import constants_dict from '@/common/constants/constants_dict'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { insertApi, validateApi } from '@/api/40_business/inplan/inplan'
import OwnerDialog from '@/views/20_master/enterprise/dialog/customer/system_enterprise/index.vue'
import GoodsDialog from '@/views/00_platform/dialog/sku/new/goodsdialog.vue'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'
import { EventBus } from '@/common/eventbus/eventbus'
import permission from '@/directive/permission/index.js' // 权限判断指令
import PoOrderListDialog from '@/views/40_business/poorder/dialog/list/index.vue'

export default {
  directives: { elDragDialog, permission },
  components: {
    OwnerDialog,
    BpmDialog,
    PreviewCard,
    SimpleUploadMutilFile,
    GoodsDialog,
    RadioDict,
    numeric,
    PoOrderListDialog
  },
  mixins: [],
  props: {
    data: {
      type: Object,
      default: null
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
      popSettingsData: {
        // 弹出的商品查询框参数设置
        goodsDialog: {
          // 弹出框显示参数
          visible: false,
          data: {},
          rowIndex: null,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 货主选择对话框
        ownerDialogData: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 审批流程
        sponsorDialog: {
          // 弹出框显示参数
          visible: false,
          form_data: { },
          serial_type: 'b_in_plan',
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          },
          // 审批流程
          initial_process: null,
          // 自选用户
          process_users: {}
        },
        // 采购合同关联单号弹窗
        poContractDialog: {
          visible: false,
          data: {}
        }
      },
      dataJson: {
        // 用于监听
        actual_count: 0,
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          detailListData: [],
          type_name: '',
          owner_id: null,
          owner_name: '',
          owner_code: '',
          plan_time: null,
          over_receipt_rate: null,
          remark: '',
          plan_total: 0,
          po_order_id: null,
          po_order_code: '',
          po_contract_code: '',
          project_code: ''
        },
        // 单条数据 json
        tempJson: {
          detailListData: [],
          type_name: '',
          owner_id: null,
          owner_name: '',
          owner_code: '',
          plan_time: null,
          over_receipt_rate: null,
          remark: '',
          plan_total: 0,
          po_order_id: null,
          po_order_code: '',
          po_contract_code: '',
          project_code: ''
        },
        currentJson: {},
        rowIndex: null,
        inputSettings: {
          maxLength: {
            remark: 200
          }
        },
        // 其他文件附件
        doc_att: [],
        doc_att_file: [],
        doc_att_files: []
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: false,
        duration: 4000,
        // 按钮状态：是否可用，false:可用，true不可用
        btnTableDisabledStatus: {
          disabledInsert: true,
          disabledDelete: true
        },
        // 输入框禁用状态
        inputDisabledStatus: {
          disabledTypeSelect: false
        },
        rules: {
          type_name: [
            { required: true, message: '请选择入库类型', trigger: 'change' }
          ],
          plan_time: [
            { required: true, message: '请选择计划入库时间', trigger: 'change' }
          ]
        }
      }
    }
  },
  computed: {
    /**
     * 当前的用户信息
     */
    currentUser () {
      return this.$store.getters.userInfo
    },
    /**
     * 字典常量
     */
    CONSTANTS () {
      return constants_dict
    }
  },
  watch: {},
  created () {
    this.initComponent()
  },
  activated () {
  },
  methods: {
    initComponent () {
      this.closeLoading()
      this.initData()
    },
    // 重置
    initData () {
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)
      this.dataJson.doc_att = []
      this.dataJson.doc_att_file = []
    },
    // 打开loading
    showLoading (loadingText) {
      this.settings.loading = true
      this.settings.loadingText = loadingText
    },
    // 关闭loading
    closeLoading () {
      this.settings.loading = false
    },
    // 取消
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 显示错误信息
    showErrorMsg (msg) {
      this.$notify({
        title: '操作提示',
        message: msg,
        type: 'error',
        duration: this.settings.duration
      })
    },
    /**
     * 新增数据
     */
    doInsert () {
      this.showLoading('正在保存，请稍后...')
      // 校验业务数据
      const tempData = deepCopy(this.dataJson.tempJson)
      tempData.check_type = constants_para.INSERT_CHECK_TYPE
      tempData.initial_process = this.popSettingsData.sponsorDialog.initial_process
      tempData.process_users = this.popSettingsData.sponsorDialog.process_users

      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          // 调用新增接口
          insertApi(tempData)
            .then(
              _data => {
                this.closeLoading()
                this.$emit('closeMeOk', _data.data)
                // 通知兄弟组件，新增数据更新
                EventBus.$emit(this.EMITS.EMIT_MST_INPLAN_NEW_OK, _data.data)
                this.$notify({
                  title: '新增成功',
                  message: _data.data.message,
                  type: 'success',
                  duration: this.settings.duration
                })
                // 触发事件通知页面刷新
                EventBus.$emit('global:mst:inplan:new:ok')
                this.dataSubmitLoading = false
                this.closeLoading()
                this.resetDataJson()
                // 发送事件通知， 表示新增成功
                EventBus.$emit('global:notice:bpm')
              },
              _error => {
                this.closeLoading()
                this.$notify({
                  title: '新增失败',
                  message: _error.error.message,
                  type: 'error',
                  duration: this.settings.duration
                })
              }
            )
            .finally(() => {
              this.closeLoading()
            })
        } else {
          this.closeLoading()
        }
      })
    },
    handleRowClick (row) {
      this.popSettingsData.goodsDialog.rowIndex = this.getRowIndex(row)
    },
    // 获取行索引
    getRowIndex (row) {
      const _index = this.dataJson.tempJson.detailListData.lastIndexOf(row)
      return _index
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
      this.dataJson.rowIndex = this.getRowIndex(row)
      this.settings.btnTableDisabledStatus.disabledInsert = false
      this.settings.btnTableDisabledStatus.disabledDelete = false
    },
    // 商品数据选择
    handleGoodsInsert () {
      // 验证货主是否已选择
      if (!this.dataJson.tempJson.owner_id) {
        this.showErrorMsg('请先选择货主')
        return
      }
      // 新增
      this.popSettingsData.goodsDialog.visible = true
      this.popSettingsData.goodsDialog.data = {
        owner_id: this.dataJson.tempJson.owner_id
      }
    },
    // 商品数据删除
    handleGoodsDelete () {
      if (this.dataJson.rowIndex === null) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 删除
      this.$confirm('是否确认删除该条数据', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        // 设置到table中绑定的json数据源
        this.dataJson.tempJson.detailListData.splice(this.dataJson.rowIndex, 1)
        // 重新计算总数量
        this.calculateTotal()
        // 重置选择状态
        this.dataJson.rowIndex = null
        this.settings.btnTableDisabledStatus.disabledDelete = true
      }).catch(action => {

      })
    },
    // 商品选择完成
    handleGoodsCloseOk (val) {
      this.doGoodsInsert(val)
    },
    doGoodsInsert (val) {
      this.popSettingsData.goodsDialog.visible = false
      // 设置到table中绑定的json数据源
      this.dataJson.tempJson.detailListData.push(val.data)
      // 重新计算总数量
      this.calculateTotal()
      this.$notify({
        title: '新增商品信息处理成功',
        message: '商品信息已添加',
        type: 'success',
        duration: this.settings.duration
      })
    },
    // 商品取消
    handleGoodsCloseCancel () {
      this.popSettingsData.goodsDialog.visible = false
    },
    // 计算总数量
    calculateTotal () {
      this.dataJson.tempJson.plan_total = 0
      this.dataJson.tempJson.detailListData.forEach(element => {
        this.dataJson.tempJson.plan_total += element.plan_qty || 0
      })
    },
    // 货主选择
    handleOwnerDialog () {
      this.popSettingsData.ownerDialogData.visible = true
    },
    // 货主：关闭对话框：确定
    handleOwnerCloseOk (val) {
      this.popSettingsData.ownerDialogData.selectedDataJson = val
      this.dataJson.tempJson.owner_id = val.id
      this.dataJson.tempJson.owner_code = val.code
      this.dataJson.tempJson.owner_name = val.name
      this.popSettingsData.ownerDialogData.visible = false

      // 清空现有的商品明细，因为货主变更了
      if (this.dataJson.tempJson.detailListData.length > 0) {
        this.$confirm('更换货主会清空已选择的商品明细，是否继续？', '确认信息', {
          distinguishCancelAndClose: true,
          confirmButtonText: '确认',
          cancelButtonText: '取消'
        }).then(() => {
          this.dataJson.tempJson.detailListData = []
          this.calculateTotal()
        }).catch(() => {
          // 恢复之前的货主选择
          this.popSettingsData.ownerDialogData.selectedDataJson = {
            id: this.dataJson.tempJson.owner_id,
            code: this.dataJson.tempJson.owner_code,
            name: this.dataJson.tempJson.owner_name
          }
        })
      }
    },
    // 货主：关闭对话框：取消
    handleOwnerCloseCancel () {
      this.popSettingsData.ownerDialogData.visible = false
    },
    // 其他附件上传成功
    handleOtherUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.doc_att.push(res.response.data)
      this.dataJson.doc_att_file.push(res.response.data.url)
      this.dataJson.tempJson.doc_att_files = this.dataJson.doc_att
    },
    // 其他附件文件移除
    removeOtherFile (val) {
      // 获取下标
      const _index = this.dataJson.doc_att_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.doc_att.splice(_index, 1)
      this.dataJson.doc_att_file.splice(_index, 1)
      this.dataJson.tempJson.doc_att_files = this.dataJson.doc_att
    },
    // 上传失败
    handleFileError () {
      console.debug('文件上传失败')
      this.$notify({
        title: '上传错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
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
          if (this.dataJson.tempJson.detailListData.length === 0) {
            this.closeLoading()
            this.$notify({
              title: '校验失败',
              message: '请至少添加一条入库商品明细',
              type: 'error',
              duration: this.settings.duration
            })
            return
          }
          validateApi(tempData).then(_data => {
            if (_data.success) {
              // 获取审批流程
              this.getFlow()
            } else {
              this.closeLoading()
              this.$notify({
                title: '校验失败',
                message: _data.data.message,
                type: 'error',
                duration: this.settings.duration
              })
            }
          }).catch(error => {
            console.log('校验出错', error)
            this.closeLoading()
          })
        } else {
          this.closeLoading()
        }
      })
    },
    /**
     * 获取审批流程
     */
    getFlow () {
      // 校验是否存在审批流程
      getFlowProcessApi({ 'serial_type': this.popSettingsData.sponsorDialog.serial_type })
        .then((rsp) => {
          if (rsp.data === null) {
            this.$message.error('未找到审批流程，请联系管理员')
            this.closeLoading()
          } else {
            // 流程参数
            this.popSettingsData.sponsorDialog.form_data = { }
            // 启动审批流弹窗
            this.popSettingsData.sponsorDialog.visible = true
          }
        }).catch((err) => {
          this.closeLoading()
          this.$message.error(err)
        })
    },
    // 取消
    handleBpmDialogCancel () {
      console.log('关闭审批组件')
      this.dataSubmitLoading = false
      this.popSettingsData.sponsorDialog.visible = false
      this.closeLoading()
    },
    // 审批流确定
    handleBpmDialogOk (data) {
      this.popSettingsData.sponsorDialog.initial_process = data.processData
      this.popSettingsData.sponsorDialog.process_users = data.process_users
      this.popSettingsData.sponsorDialog.visible = false
      this.doInsert()
    },
    /**
     * 入库类型选择
     * @param val
     */
    handleTypeChange (val) {
      this.dataJson.tempJson.type_name = val
      // 如果选择采购入库，打开关联单号弹窗
      if (val === this.CONSTANTS.DICT_B_IN_PLAN_TYPE_CG) {
        this.popSettingsData.poContractDialog.visible = true
        this.popSettingsData.poContractDialog.data = {}
      }
    },
    resetDataJson () {
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)
      this.dataJson.doc_att = []
      this.dataJson.doc_att_file = []
      this.dataJson.doc_att_files = []
      // 重置按钮状态
      this.settings.btnTableDisabledStatus.disabledInsert = true
      this.settings.btnTableDisabledStatus.disabledDelete = true
      this.settings.inputDisabledStatus.disabledTypeSelect = false
      // 重置当前选择状态
      this.dataJson.currentJson = {}
      this.dataJson.rowIndex = null
    },
    handleOverReceiptRateChange (value) {
      // this.dataJson.tempJson.over_receipt_rate = value
    },
    // 入库计划按钮点击处理
    handlePlanDetail (index, row) {
      // 处理入库计划详情设置
      console.log('入库计划详情设置:', index, row)
      // 这里可以打开一个对话框来设置仓库、库区、库位信息
      // 或者直接在行内编辑
      this.$message.info('入库计划详情设置功能待实现')
    },
    // 采购合同关联单号弹窗：确定
    handlePoContractCloseOk (val) {
      this.popSettingsData.poContractDialog.visible = false

      // 设置采购订单相关信息
      this.dataJson.tempJson.po_order_id = val.id
      this.dataJson.tempJson.po_order_code = val.code
      this.dataJson.tempJson.po_contract_code = val.po_contract_code
      this.dataJson.tempJson.project_code = val.project_code

      // 设置货主信息（使用采购订单中的主体企业作为货主）
      this.dataJson.tempJson.owner_id = val.purchaser_id
      this.dataJson.tempJson.owner_name = val.purchaser_name
      this.dataJson.tempJson.owner_code = val.purchaser_code

      // 禁用入库类型选择
      this.settings.inputDisabledStatus.disabledTypeSelect = true

      // 启用新增按钮（选择采购订单后可以添加商品明细）
      this.settings.btnTableDisabledStatus.disabledInsert = false

      this.$notify({
        title: '关联成功',
        message: '已关联采购订单：' + val.code,
        type: 'success',
        duration: this.settings.duration
      })
    },
    // 采购合同关联单号弹窗：取消
    handlePoContractCloseCancel () {
      this.popSettingsData.poContractDialog.visible = false
      // 清空入库类型选择
      this.dataJson.tempJson.type_name = ''
      this.settings.inputDisabledStatus.disabledTypeSelect = false
      this.$notify({
        title: '操作提示',
        message: '已取消选择，请重新选择入库类型',
        type: 'info',
        duration: this.settings.duration
      })
    },
    handleReset () {
      // 确认重置操作
      this.$confirm('确定要重置页面数据吗？重置后所有输入的数据将丢失。', '确认重置', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认重置',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 执行重置操作
        this.resetDataJson()
        this.$notify({
          title: '重置成功',
          message: '页面数据已重置到初始状态',
          type: 'success',
          duration: this.settings.duration
        })
      }).catch(() => {
        // 用户取消重置
      })
    }
  }
}
</script>
