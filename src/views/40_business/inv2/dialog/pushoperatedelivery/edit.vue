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
        <br>
        <el-descriptions
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >

          <el-descriptions-item label="编号">
            {{ dataJson.tempJson.code == null || dataJson.tempJson.code === ''?'系统自动生成':dataJson.tempJson.code }}
          </el-descriptions-item>

          <!--此处为采购订单的买方企业-->
          <el-descriptions-item label="委托方">
            {{ dataJson.tempJson.consignor_name }}
          </el-descriptions-item>

          <!--此处为采购订单的买方企业-->
          <el-descriptions-item label="货主">
            {{ dataJson.tempJson.owner_name }}
          </el-descriptions-item>

          <el-descriptions-item label="入库类型">
            采购入库
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              入库时间
            </div>
            <el-form-item
              prop="plan_time"
              label-width="0"
            >
              <el-date-picker
                v-model="dataJson.tempJson.plan_time"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                clearable
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item />

          <el-descriptions-item label="备注">
            <el-input
              v-model.trim="dataJson.tempJson.remark"
              clearable
              :maxlength="dataJson.inputSettings.maxLength.remark"
            />
          </el-descriptions-item>

        </el-descriptions>
        <br>
        <el-alert
          title="合同信息"
          type="info"
          :closable="false"
        />
        <br>

        <el-descriptions
          title=""
          :column="3"
          :label-style="twoLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="合同编号">
            {{ dataJson.tempJson.contract_no }}
          </el-descriptions-item>
          <el-descriptions-item label="订单编号">
            {{ dataJson.tempJson.po_code }}
          </el-descriptions-item>

          <el-descriptions-item label="单据类型">
            供应链业务
          </el-descriptions-item>
          <el-descriptions-item label="合同日期">
            {{ dataJson.tempJson.contract_dt == null? '-':dataJson.tempJson.contract_dt }}
          </el-descriptions-item>
          <el-descriptions-item label="供应商">
            {{ dataJson.tempJson.supplier_name }}
          </el-descriptions-item>
          <el-descriptions-item label="合同量">
            {{ dataJson.tempJson.contract_num == null? '-': formatNumber(dataJson.tempJson.contract_num, true,4) }}
          </el-descriptions-item>
          <el-descriptions-item label="物流合同">
            <el-input
              v-model.trim="dataJson.tempJson.logistics_contracts"
              clearable
              :maxlength="dataJson.inputSettings.maxLength.logistics_contracts"
            />
          </el-descriptions-item>
          <el-descriptions-item label="启用超收">
            <el-switch
              v-model="dataJson.tempJson.over_charged_btn"
              active-text="关"
              inactive-text="开"
              active-color="#3979FC"
              active-value="1"
              inactive-value="0"
              inactive-color="rgba(0, 0, 0, 0.2)"
            />
          </el-descriptions-item>
          <el-descriptions-item label="超收百分比">
            <numeric
              v-model="dataJson.tempJson.over_inventory_upper"
              :decimal-places="2"
              :currency-symbol="''"
              style="width: 80%"
            />%
          </el-descriptions-item>
        </el-descriptions>
        <br>

        <el-alert
          title="付款信息"
          type="info"
          :closable="false"
        />

        <br>
        <el-table
          ref="multipleTable"
          v-loading="settings.loading"
          :data="dataJson.tempJson.detailList"
          :element-loading-text="'正在拼命加载中...'"
          element-loading-background="rgba(255, 255, 255, 0.5)"
          stripe
          border
          fit
          highlight-current-row
          :default-sort="{prop: 'u_time', order: 'descending'}"
          style="width: 100%"
        >
          <el-table-column
            type="index"
            width="45"
            label="No"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="sku_code"
            label="物料编码"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="sku_name"
            label="物料名称"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="spec"
            label="规格"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="qty"
            label="合同数量"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="warehouse_name"
            label="入库仓库"
            align="right"
          >
            <template v-slot="scope">
              <select-warehouse
                v-model.trim="scope.row.warehouse_name"
                placement="left"
                :subscript="scope.$index"
                :warehouse1="scope.row.warehouse_id"
                @onReturnData="handleWarehouseReturnData"
              />
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="price"
            label="入库单价"
            align="right"
          >
            <template v-slot="scope">
              <numeric
                v-model="scope.row.price"
                :decimal-places="2"
                :currency-symbol="'￥'"
              />
            </template>
          </el-table-column>

          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="count"
            label="入库数量（顿）"
            align="right"
          >
            <template v-slot="scope">
              <numeric
                v-model="scope.row.count"
                :decimal-places="2"
                :currency-symbol="''"
              />
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="remark"
            label="备注"
            align="right"
          >
            <template v-slot="scope">
              <el-input
                v-model="scope.row.remark"
                clearable
                :maxlength="dataJson.inputSettings.maxLength.remark"
              />
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
        @click="handleCancel()"
      >返回</el-button>
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

  </div>
</template>

<style scoped>
.edit-container {
  height: calc(100vh - 220px);
  overflow-x: auto;
}
.dialog-footer {
  text-align: center;
}
.el-form-item .el-select {
  width: 100%;
}

.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}
br {
  display: block;
  margin: 10px;
  content: ' ';
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
::v-deep .el-switch__core {
  width: 50px;
  height: 24px;
  border-radius: 100px;
  border: none;
}
::v-deep .el-switch__core::after {
  width: 20px;
  height: 20px;
  top: 2px;
}
::v-deep .el-switch.is-checked .el-switch__core::after {
  margin-left: -21px;
}
/*关闭时文字位置设置*/
::v-deep .el-switch__label--right {
  position: absolute;
  z-index: 1;
  right: 6px;
  margin-left: 0px;
  color: rgba(255, 255, 255, 0.9019607843137255);
  span {
    font-size: 12px;
  }
}
/* 激活时另一个文字消失 */
::v-deep .el-switch__label.is-active {
  display: none;
}
/*开启时文字位置设置*/
::v-deep .el-switch__label--left {
  position: absolute;
  z-index: 1;
  left: 5px;
  margin-right: 0px;
  color: rgba(255, 255, 255, 0.9019607843137255);
  span {
    font-size: 12px;
  }
}
</style>

<script>
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import constants_dict from '@/common/constants/constants_dict'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'
import { EventBus } from '@/common/eventbus/eventbus'
import { insertApi, validateApi } from '@/api/40_business/inplanv2/inplanv2'
import { getApi } from '@/api/40_business/10_po/poorder/poorder'
import numeric from '@/components/40_input/numeric/index.vue'
import SelectWarehouse from '@/views/30_wms/warehouse/selectgrid/selectWarehouseLocationBin.vue'
export default {
  directives: { elDragDialog },
  components: { SelectWarehouse, numeric, BpmDialog },
  mixins: [],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    id: {
      type: Number,
      default: null
    },
    data: {
      type: Object,
      default: null
    },
    editStatus: {
      type: String,
      default: constants_para.STATUS_INSERT
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
      twoLabelStyle: {
        width: '5.5%',
        'text-align': 'right'
      },
      threeLabelStyle: {
        width: '2.3%',
        'text-align': 'right'
      },
      // 监听器
      watch: {},
      popSettingsData: {
        // 审批流程
        sponsorDialog: {
          // 弹出框显示参数
          visible: false,
          form_data: { },
          serial_type: constants_dict.DICT_B_IN_PLAN_V2,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          },
          // 审批流程
          initial_process: null,
          // 自选用户
          process_users: {}
        }
      },
      dataJson: {
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          consignor_id: null, // 委托方
          consignor_name: null, // 委托方名称
          consignor_code: null, // 委托方code
          owner_id: null, // 货主
          owner_name: null, // 货主名称
          owner_code: null, // 货主code
          contract_no: null, // 合同编号
          po_code: null, // 订单编号
          bill_type: constants_dict.DICT_B_IN_PLAN_BUSINESS_TYPE_GYL, // 单据类型 (供应链业务)
          supplier_id: null, // 供应商id
          supplier_name: null, // 供应商名称
          supplier_code: null, // 供应商code
          contract_dt: null, // 合同日期
          contract_num: null, // 合同量
          logistics_contracts: null, // 物流合同
          over_charged_btn: null, // 启用超收
          over_inventory_upper: null, // 超收百分比
          detailList: []
        },
        // 单条数据 json
        tempJson: {},
        searchForm: {
          reset: false
        },
        inputSettings: {
          maxLength: {
            remark: 100,
            logistics_contracts: 50
          }
        }
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        // 按钮是否显示，默认不显示，false：不显示，true：显示
        btnShowStatus: {
          showInsert: false,
          showUpdate: false
        },
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: this.editStatus,
        // pop的check内容
        rules: {
          po_code: [
            { required: true, message: '请添加关联单号', trigger: 'change' }
          ],
          order_amount: [
            { required: true, message: '请添加申请金额', trigger: 'change' }
          ],
          paid_amount: [
            { required: true, message: '请添加付款金额', trigger: 'change' }
          ]
        }
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    }
  },
  // 监听器
  watch: {},
  created () {
    this.init()
  },
  mounted () {
    // 描绘完成
  },
  destroyed () {

  },
  methods: {
    // 初始化处理
    async init () {
      // 初始化按钮
      this.initButtonShowStatus()
      this.initInsertModel()

      // 初始化页面数据
      this.initData()
      this.settings.loading = false
    },
    initTempJsonOriginal () {
      // 单条数据 json的，初始化原始数据
      this.dataJson.tempJsonOriginal = this.$options.data.call(this).dataJson.tempJsonOriginal
    },
    initButtonShowStatus () {
      // 初始化按钮状态：默认都隐藏
      this.settings.btnPoOrderDisabledStatus = this.$options.data.call(this).settings.btnPoOrderDisabledStatus
      this.settings.btnBankDisabledStatus = this.$options.data.call(this).settings.btnBankDisabledStatus
    },
    // 新增时的初始化
    initInsertModel () {
      // 数据初始化
      this.initTempJsonOriginal()
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)
    },
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 新增
    doInsert () {
      // 开始综合验证
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)
          // 审批流程启动数据
          tempData.initial_process = this.popSettingsData.sponsorDialog.initial_process // 流程
          tempData.form_data = this.popSettingsData.sponsorDialog.form_data // 表单参数
          tempData.process_users = this.popSettingsData.sponsorDialog.process_users // 自选用户

          // 百分比换算
          tempData.over_inventory_upper = tempData.over_inventory_upper / 100

          this.settings.loading = true
          insertApi(tempData)
            .then(
              _data => {
                this.closeLoading()
                this.$emit('closeMeOk', _data.data)
                // 通知兄弟组件，新增数据更新
                EventBus.$emit(this.EMITS.EMIT_MST_B_AP_NEW_OK, _data.data)
                this.$notify({
                  title: '新增成功',
                  message: _data.data.message,
                  type: 'success',
                  duration: this.settings.duration
                })
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
    // 校验数据 获取审批流程
    startProcess () {
      this.showLoading('正在查询，请稍后...')
      // 校验业务数据
      const tempData = deepCopy(this.dataJson.tempJson)
      tempData.check_type = constants_para.INSERT_CHECK_TYPE

      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
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
    // 获取审批流程
    getFlow () {
      // 校验是否存在审批流程
      getFlowProcessApi({ 'serial_type': this.popSettingsData.sponsorDialog.serial_type })
        .then((rsp) => {
          if (rsp.data === null) {
            this.$message.error('未找到审批流程，请联系管理员')
          } else {
            // 流程参数
            this.popSettingsData.sponsorDialog.form_data = {}
            // 启动审批流弹窗
            this.popSettingsData.sponsorDialog.visible = true
          }
        }).catch((err) => {
          this.closeLoading()
          this.$message.error(err)
        }).finally(() => {
          this.closeLoading()
        })
    },
    // 取消
    handleBpmDialogCancel () {
      this.popSettingsData.sponsorDialog.visible = false
    },
    // 审批流确定
    handleBpmDialogOk (data) {
      this.popSettingsData.sponsorDialog.initial_process = data.processData
      this.popSettingsData.sponsorDialog.process_users = data.process_users
      this.popSettingsData.sponsorDialog.visible = false
      this.doInsert()
    },
    // 初始化页面数据
    initData () {
      getApi({ id: this.data.id }).then(response => {
        if (response.data.length !== 0) {
          // 基本信息
          this.dataJson.tempJson.consignor_id = response.data.purchaser_id // 委托方
          this.dataJson.tempJson.consignor_name = response.data.purchaser_name // 委托方名称
          this.dataJson.tempJson.consignor_code = response.data.purchaser_code // 委托方code
          this.dataJson.tempJson.owner_id = response.data.purchaser_id // 货主
          this.dataJson.tempJson.owner_name = response.data.purchaser_name // 货主名称
          this.dataJson.tempJson.owner_code = response.data.purchaser_code // 货主code

          // 合同信息
          this.dataJson.tempJson.contract_no = response.data.po_contract_code // 合同编号
          this.dataJson.tempJson.po_code = response.data.code // 订单编号
          this.dataJson.tempJson.bill_type = constants_dict.DICT_B_IN_PLAN_BUSINESS_TYPE_GYL // 单据类型 (供应链业务)

          this.dataJson.tempJson.supplier_id = response.data.supplier_id // 供应商id
          this.dataJson.tempJson.supplier_name = response.data.supplier_name // 供应商名称
          this.dataJson.tempJson.supplier_code = response.data.supplier_code // 供应商code

          this.dataJson.tempJson.contract_dt = response.data.sign_date // 合同日期
          this.dataJson.tempJson.contract_num = response.data.order_total // 合同量
          this.dataJson.tempJson.logistics_contracts = null // 物流合同
          // this.dataJson.tempJson.over_charged_btn = null // 启用超收
          // this.dataJson.tempJson.over_inventory_upper = null // 超收百分比

          this.dataJson.tempJson.type = constants_dict.DICT_B_IN_TYPE_CG // 入库类型：（采购入库）
          this.dataJson.tempJson.order_id = response.data.id // 订单id
          this.dataJson.tempJson.order_type = constants_dict.DICT_B_PO_ORDER // 订单类型

          // 设置到table中绑定的业务单据信息
          response.data.detailListData.forEach((k) => {
            const tempData = {}
            tempData.sku_id = k.sku_id
            tempData.sku_code = k.sku_code // 物料编码
            tempData.sku_name = k.sku_name // 物料名称
            tempData.spec = k.spec // 物料规格
            tempData.price = k.price // 物料单价
            tempData.count = 0 // 入库数量
            tempData.qty = k.qty // 合同数量
            tempData.unit_id = k.unit_id
            tempData.remark = null
            tempData.supplier_id = response.data.supplier_id // 供应商id
            tempData.supplier_name = response.data.supplier_name // 供应商名称
            tempData.supplier_code = response.data.supplier_code // 供应商code
            tempData.warehouse_id = null
            tempData.warehouse_name = null
            this.dataJson.tempJson.detailList.push(tempData)
          })
        } else {
          this.showErrorMsg('款项类型数据为空,请联系管理员')
        }
      })
    },
    // 仓库选择
    handleWarehouseReturnData (val) {
      if (val === null) {
        // 仓库
        this.dataJson.tempJson.detailList[val.subscript].warehouse_id = null
        this.dataJson.tempJson.detailList[val.subscript].warehouse_name = null
      } else {
        // 仓库
        this.dataJson.tempJson.detailList[val.subscript].warehouse_id = val.warehouse_id
        this.dataJson.tempJson.detailList[val.subscript].warehouse_name = val.warehouse_name
      }
    }
  }
}
</script>
