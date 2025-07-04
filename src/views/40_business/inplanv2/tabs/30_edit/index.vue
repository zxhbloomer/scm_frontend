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
          title="入库计划单基本信息"
          type="info"
          :closable="false"
        />
        <br>

        <el-descriptions
          title=""
          :column="3"
          :content-style="contentStyle"
          :label-style="labelStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="计划单号">
            {{ dataJson.tempJson.plan_code == null || dataJson.tempJson.plan_code == ''?'系统自动生成':dataJson.tempJson.plan_code }}
          </el-descriptions-item>
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              委托方
            </div>
            <el-form-item
              prop="consignor_name"
              label-width="0"
            >
              <input-search
                v-model.trim="dataJson.tempJson.consignor_name"
                :disabled="settings.isContract"
                @onInputSearch="handleConsignorDialog"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              货主
            </div>
            <el-form-item
              prop="owner_name"
              label-width="0"
            >
              <input-search
                v-model.trim="dataJson.tempJson.owner_name"
                :disabled="settings.isContract"
                @onInputSearch="handleOwnerDialog"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              入库类型
            </div>
            <el-form-item
              prop="type"
              label-width="0"
            >
              <select-dict
                v-model="dataJson.tempJson.type"
                :value="dataJson.tempJson.type"
                :para="CONSTANTS.DICT_B_IN_PLAN_TYPE"
                init-placeholder="请选择"
                :disabled="isViewModel|| settings.isContract"
                style="width:100%"
              />
            </el-form-item>
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
                value-format="yyyy-MM-dd"
                :disabled="isViewModel"
                type="date"
                clearable
                :placeholder="isPlaceholderShow('选择日期')"
                style="width: 100%"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="单据状态">
            {{ dataJson.tempJson.status_name }}
          </el-descriptions-item>
          <el-descriptions-item label="备注">
            <el-form-item
              prop="remark"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.remark"
                show-word-limit
                :maxlength="dataJson.inputSettings.maxLength.remark"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item />

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
          :content-style="contentStyle"
          :label-style="labelStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item>
            <div slot="label">
              合同编号
            </div>
            <el-form-item
              prop="contract_no"
              label-width="0"
            >
              <input-search
                v-model.trim="dataJson.tempJson.contract_no"
                :disabled="isUpdateModel && isViewModel"
                @onInputSearch="handleOrderDialog"
              />
            </el-form-item>
          </el-descriptions-item>

          <!--          <el-descriptions-item label="外部关联单号">-->
          <!--            {{ dataJson.tempJson.extra_code == null?'-':dataJson.tempJson.extra_code }}-->
          <!--          </el-descriptions-item>-->

          <!--          <el-descriptions-item label="单据类型">-->
          <!--            {{ dataJson.tempJson.bill_type_name == null?'-':dataJson.tempJson.bill_type_name }}-->
          <!--          </el-descriptions-item>-->

          <el-descriptions-item label="合同日期">
            {{ dataJson.tempJson.contract_dt == null?'-':formatDate(dataJson.tempJson.contract_dt) }}
          </el-descriptions-item>

          <!--          <el-descriptions-item label="船名">-->
          <!--            {{ dataJson.tempJson.ship_name == null?'-':dataJson.tempJson.ship_name }}-->
          <!--          </el-descriptions-item>-->

          <el-descriptions-item label="供应商">
            {{ dataJson.tempJson.supplier_name == null?'-':dataJson.tempJson.supplier_name }}
          </el-descriptions-item>

          <el-descriptions-item label="合同量">
            {{ dataJson.tempJson.contract_num == null?'-':dataJson.tempJson.contract_num }}
          </el-descriptions-item>

          <el-descriptions-item>
            <div slot="label">
              物流合同
            </div>
            <el-form-item
              prop="waybill_code "
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.waybill_code "
                clearable
                show-word-limit
                :maxlength="dataJson.inputSettings.maxLength.waybill_code"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item
            v-if="settings.over_receive"
            label="上浮百分比"
          >
            <el-form-item
              prop="over_inventory_upper"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.over_inventory_upper"
                class="slotColor"
                type="text"
                clearable
                show-word-limit
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              >
                <template slot="append">%</template>
              </el-input>
            </el-form-item>
          </el-descriptions-item>
        </el-descriptions>

        <br>
        <el-alert
          title="入库物料明细"
          type="info"
          :closable="false"
        />
        <br>
        <el-button-group>
          <el-button
            v-show="!isViewModel"
            type="primary"
            icon="el-icon-circle-plus-outline"
            :disabled="settings.btnTableDisabledStatus.disabledInsert|| settings.isContract"
            :loading="settings.loading"
            @click="handleGoodsInsert"
          >新增</el-button>

          <el-button
            v-show="!isViewModel"
            :disabled="settings.btnTableDisabledStatus.disabledUpdate"
            type="primary"
            icon="el-icon-edit-outline"
            :loading="settings.loading"
            @click="handleGoodsEdit"
          >编辑</el-button>

          <el-button
            v-show="!isViewModel"
            :disabled="settings.btnTableDisabledStatus.disabledDelete|| settings.isContract"
            type="primary"
            icon="el-icon-circle-close"
            :loading="settings.loading"
            @click="handleGoodsDelete"
          >删除</el-button>
        </el-button-group>

        <el-table
          ref="multipleTable"
          v-loading="settings.loading"
          :data="dataJson.detailListData"
          :element-loading-text="'正在拼命加载中...'"
          element-loading-background="rgba(255, 255, 255, 0.5)"
          stripe
          border
          fit
          highlight-current-row
          :default-sort="{prop: 'u_time', order: 'descending'}"
          style="width: 100%"
          @row-click="handleRowClick"
          @current-change="handleCurrentChange"
        >
          <el-table-column
            type="index"
            width="45"
            label="No"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="spec_code"
            label="物料编码"
          />

          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="goods_name"
            label="物料名称"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="pm"
            label="品名"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="spec"
            label="规格"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="100"
            prop="warehouse_name"
            label="入库仓库"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="count"
            label="计划入库数量"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.count == null? '': formatNumber(scope.row.count,true,4) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="unit_name"
            label="入库单位"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="weight"
            label="入库数量换算"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.weight == null? '': formatNumber(scope.row.weight,true,4) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="unit"
            label="库存计量单位"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="has_handle_count"
            label="已入库数量"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.has_handle_count == null? '': formatNumber(scope.row.has_handle_count,true,4) }}
            </template>
          </el-table-column>

          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="pending_count"
            label="待入库数量"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.pending_count > 0?formatNumber(scope.row.pending_count,true,4) : '0' }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="remark"
            label="备注"
          />
        </el-table>
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
        size="medium"
        @click="startProcess"
      >提交审批并保存</el-button>
      <el-button
        :disabled="settings.loading"
        size="medium"
        @click="handleCancel()"
      >返回</el-button>
    </div>

    <!--委托方-->
    <enterprise_list
      v-if="popSettingsData.searchDialogDataOne.visible"
      :visible="popSettingsData.searchDialogDataOne.visible"
      :title="popSettingsData.searchDialogDataOne.title"
      @closeMeOk="handleConsignorCloseOk"
      @closeMeCancel="handleConsignorCloseCancel"
    />

    <!--货主-->
    <enterprise_list
      v-if="popSettingsData.searchDialogDataTwo.visible"
      :visible="popSettingsData.searchDialogDataTwo.visible"
      :title="popSettingsData.searchDialogDataTwo.title"
      @closeMeOk="handleOwnerCloseOk"
      @closeMeCancel="handleOwnerCloseCancel"
    />

    <!--采购订单-->
    <order-dialog
      v-if="popSettingsData.searchDialogDataThree.visible"
      :title="popSettingsData.searchDialogDataThree.title"
      :visible="popSettingsData.searchDialogDataThree.visible"
      @closeMeOk="handleOrderCloseOk"
      @closeMeCancel="handleOrderCloseCancel"
    />

    <goods-dialog
      v-if="popSettingsData.goodsDialog.visible"
      :dialog-status="popSettingsData.goodsDialog.dialogStatus"
      :title="popSettingsData.goodsDialog.title"
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
.slotColor
/deep/.el-input-group__append, .el-input-group__prepend {
  background-color: #f5f7fa;
  color: #909399;
  vertical-align: middle;
  display: table-cell;
  position: relative;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 20px;
  width: 1px;
  white-space: nowrap;
}
br {
  display: block;
  margin: 10px;
  content: ' ';
}
</style>

<script>
import SelectDict from '@/components/00_dict/select/SelectDict'
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getApi, getOverReceiveConfigApi, validateApi, updateApi } from '@/api/40_business/inplanv2/inplanv2'
import InputSearch from '@/components/40_input/inputSearch'
import orderDialog from '@/views/40_business/poorder/dialog/listfor/inplan/index.vue'
import goodsDialog from '@/views/40_business/inplan/index.vue'
import constants_program from '@/common/constants/constants_program'
import enterprise_list from '@/views/20_master/enterprise/dialog/list/index.vue'
import constants_dict from '@/common/constants/constants_dict'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'
import { EventBus } from '@/common/eventbus/eventbus'
export default {
  components: { BpmDialog, enterprise_list, InputSearch, SelectDict, orderDialog, goodsDialog },
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
    },
    editStatus: {
      type: String,
      default: constants_para.STATUS_INSERT
    },
    canEdit: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      constants_program: constants_program,
      id: '',
      // 监听器
      watch: {
        unwatch_tempJson: null
      },
      contentStyle: {
        width: '15%'
      },
      labelStyle: {
        width: '10%',
        'text-align': 'right'
      },
      popSettingsData: {
        // 弹出窗口状态名称
        dialogStatus: '',
        dialogFormVisible: false,
        btnDisabledStatus: {
          disabledOK: false
        },
        // 弹出的查询框参数设置
        searchDialogDataOne: {
          // 弹出框显示参数
          visible: false,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 弹出的行业查询框参数设置
        searchDialogDataTwo: {
          // 弹出框显示参数
          visible: false,
          data: null,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 弹出的查询框参数设置
        searchDialogDataThree: {
          // 弹出框显示参数
          visible: false,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 弹出的行业查询框参数设置
        searchDialogDataFour: {
          // 弹出框显示参数
          visible: false,
          data: null,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 弹出的行业查询框参数设置
        searchDialogDataFive: {
          // 弹出框显示参数
          visible: false,
          data: null,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 弹出的行业查询框参数设置
        searchDialogDataSix: {
          // 弹出框显示参数
          visible: false,
          data: null,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 弹出的行业查询框参数设置
        searchDialogDataSeven: {
          // 弹出框显示参数
          visible: false,
          data: null,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }

        },

        // 弹出的商品查询框参数设置
        goodsDialog: {
          // 弹出框显示参数
          visible: false,
          data: null,
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
        // 来源数据
        // app_data_list: null,
        // 级联选择器数据
        cascader: {
          data: null,
          value: ''
        },
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          plan_code: '',
          consignor_name: '',
          contract_no: '',
          owner_name: '',
          type: '',
          plan_time: '',
          over_inventory_upper: 0
        },
        // 单条数据 json
        tempJson: null,
        inputSettings: {
          maxLength: {
            contract_num: 20,
            ship_name: 20,
            contract_no: 20,
            price: 10,
            waybill_code: 30,
            remark: 100
          }
        },
        detailListData: []
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        // 是否选择合同
        isContract: false,
        // 是否开启超收配置
        over_receive: false,
        duration: 4000,
        // 按钮状态：是否可用，false:可用，true不可用
        btnTableDisabledStatus: {
          disabledInsert: false,
          disabledUpdate: false,
          disabledDelete: false
        },
        // 按钮是否显示，默认不显示，false：不显示，true：显示
        btnShowStatus: {
          showInsert: false,
          showUpdate: false
        },
        // 按钮状态：是否可用，false:可用，true不可用
        btnDisabledStatus: {
          disabledInsert: true,
          disabledUpdate: true
        },
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: this.dialogStatus,
        // pop的check内容
        rules: {
          consignor_name: [
            { required: true, message: '请选择委托方', trigger: 'change' }
          ],
          owner_name: [
            { required: true, message: '请选择货主', trigger: 'change' }
          ],
          plan_time: [
            { required: true, message: '请选择委托日期', trigger: 'change' }
          ],
          type: [
            { required: true, message: '请选择入库类型', trigger: 'change' }
          ],
          inbound_time: [
            { required: true, message: '请输入入库时间', trigger: 'change' }
          ],
          over_inventory_upper: [
            { validator: this.over_inventory_upper_validator, trigger: 'blur' }
          ]

        },
        // 错误数目
        badge: {
          countOne: 0,
          countTwo: 0
        }
      }
    }
  },
  computed: {
    // 是否为更新模式
    isUpdateModel () {
      if (
        this.editStatus === this.PARAMETERS.STATUS_INSERT ||
        this.editStatus === this.PARAMETERS.STATUS_COPY_INSERT
      ) {
        return false
      } else {
        return true
      }
    },
    listenVisible () {
      return this.visible
    },
    isViewModel () {
      if (this.editStatus === this.PARAMETERS.STATUS_VIEW) {
        return true
      } else {
        return false
      }
    }
  },
  // 监听器
  watch: {},
  created () {
    this.getOverConfig()
    this.init()
  },
  mounted () {
    // 描绘完成
  },
  destroyed () {
    this.unWatch()
  },
  methods: {
    // 初始化处理
    init () {
      this.settings.loading = false
      this.initButtonShowStatus()
      this.initButtonDisabledStatus()
      this.initUpdateModel()

      // 初始化watch
      this.setWatch()
    },
    initTempJsonOriginal () {
      // 单条数据 json的，初始化原始数据
      this.dataJson.tempJsonOriginal = this.$options.data.call(this).dataJson.tempJsonOriginal
    },
    initButtonShowStatus () {
      // 初始化按钮状态：默认都隐藏
      this.settings.btnShowStatus = this.$options.data.call(this).settings.btnShowStatus
    },
    initButtonDisabledStatus () {
      // 按钮状态初始化：默认不可用
      this.settings.btnDisabledStatus = this.$options.data.call(this).settings.btnDisabledStatus
    },
    // 新增时的初始化
    initInsertModel () {
      // 数据初始化
      this.initTempJsonOriginal()
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)
      this.dataJson.tempJson.unit = '吨'
      // 设置按钮
      this.settings.btnShowStatus.showInsert = true
      this.settings.btnDisabledStatus.disabledInsert = true

      this.settings.btnTableDisabledStatus.disabledInsert = false
      this.settings.btnTableDisabledStatus.disabledUpdate = true
      this.settings.btnTableDisabledStatus.disabledDelete = true

      if (this.data !== null && this.data.order_id !== null) {
        this.getOrderDetail(this.data.order_id)
      }
    },
    // Placeholder设置
    isPlaceholderShow (val) {
      if (this.isViewModel) {
        return ''
      } else {
        return val
      }
    },
    // 修改时的初始化
    async initUpdateModel () {
      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.data)
      this.dataJson.tempJsonOriginal = deepCopy(this.data)
      this.getData()

      // 设置按钮
      this.settings.btnShowStatus.showUpdate = true
      this.settings.btnDisabledStatus.disabledUpdate = true

      this.settings.btnTableDisabledStatus.disabledInsert = false
      this.settings.btnTableDisabledStatus.disabledUpdate = true
      this.settings.btnTableDisabledStatus.disabledDelete = true
    },
    // 设置监听器
    setWatch () {
      this.unWatch()
      // 监听页面上面是否有修改，有修改按钮高亮
      this.watch.unwatch_tempJson = this.$watch('dataJson.tempJson', (newVal, oldVal) => {
        this.settings.btnDisabledStatus.disabledInsert = false
        this.settings.btnDisabledStatus.disabledUpdate = false
      }, { deep: true }
      )
    },
    unWatch () {
      if (this.watch.unwatch_tempJson) {
        this.watch.unwatch_tempJson()
      }
    },

    // 返回按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 插入逻辑
    doInsert () {
      // 开始综合验证
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)

          // 审批流程启动数据
          tempData.initial_process = this.popSettingsData.sponsorDialog.initial_process // 流程
          tempData.form_data = this.popSettingsData.sponsorDialog.form_data // 表单参数
          tempData.process_users = this.popSettingsData.sponsorDialog.process_users // 自选用户

          tempData.over_inventory_upper = tempData.over_inventory_upper === null ? 0 : tempData.over_inventory_upper / 100
          tempData.detailList = this.dataJson.detailListData
          if (tempData.detailList === null || tempData.detailList.length === 0) {
            this.showErrorMsg('请添加入库物料明细')
            return
          }

          if (this.settings.isContract) {
            let is = false
            tempData.detailList.forEach((k) => { if (k.warehouse_id == null || k.warehouse_id === '' || k.count === 0) { is = true } })
            if (is) {
              this.showErrorMsg('入库物料明细未完善')
              return
            }
          }
          this.settings.loading = true
          updateApi(tempData)
            .then(
              _data => {
                this.$emit('closeMeOk', _data.data)
                // 通知兄弟组件，新增数据更新
                EventBus.$emit(this.EMITS.EMIT_MST_B_IN_PLAN_DETAIL_V2_NEW_OK, _data.data)
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
              this.settings.loading = false
            })
        }
      })
    },
    handleTabsClick (tab, event) { },
    // 委托方
    handleConsignorDialog () {
      this.popSettingsData.searchDialogDataOne.visible = true
      this.popSettingsData.searchDialogDataOne.title = '委托方选择页面'
    },
    // 委托方：关闭对话框：确定
    handleConsignorCloseOk (val) {
      if (val.enable === false) {
        this.showErrorMsg('该委托方已禁用，请重新选择')
        return
      }
      this.popSettingsData.searchDialogDataOne.selectedDataJson = val
      this.dataJson.tempJson.consignor_id = val.id
      this.dataJson.tempJson.consignor_name = val.name
      this.popSettingsData.searchDialogDataOne.visible = false
    },
    // 委托方：关闭对话框：取消
    handleConsignorCloseCancel () {
      this.popSettingsData.searchDialogDataOne.visible = false
    },
    // 货主
    handleOwnerDialog () {
      this.popSettingsData.searchDialogDataTwo.visible = true
      this.popSettingsData.searchDialogDataTwo.title = '货主选择页面'
    },
    // 货主：关闭对话框：确定
    handleOwnerCloseOk (val) {
      if (val.enable === false) {
        this.showErrorMsg('该货主已禁用，请重新选择')
        return
      }
      this.popSettingsData.searchDialogDataTwo.selectedDataJson = val
      this.dataJson.tempJson.owner_id = val.id
      this.dataJson.tempJson.owner_name = val.name
      this.popSettingsData.searchDialogDataTwo.visible = false
    },
    // 货主：关闭对话框：取消
    handleOwnerCloseCancel () {
      this.popSettingsData.searchDialogDataTwo.visible = false
    },
    // 订单
    handleOrderDialog () {
      this.popSettingsData.searchDialogDataThree.title = '订单选择页面'
      this.popSettingsData.searchDialogDataThree.visible = true
    },
    // 订单：关闭对话框：确定
    handleOrderCloseOk (val) {
      this.popSettingsData.searchDialogDataThree.visible = false
      this.popSettingsData.searchDialogDataThree.selectedDataJson = val

      this.settings.isContract = true

      // 基本信息
      this.dataJson.tempJson.consignor_id = val.purchaser_id // 委托方
      this.dataJson.tempJson.consignor_name = val.purchaser_name // 委托方名称
      this.dataJson.tempJson.consignor_code = val.purchaser_code // 委托方code
      this.dataJson.tempJson.owner_id = val.purchaser_id // 货主
      this.dataJson.tempJson.owner_name = val.purchaser_name // 货主名称
      this.dataJson.tempJson.owner_code = val.purchaser_code // 货主code

      // 合同信息
      this.dataJson.tempJson.contract_no = val.po_contract_code // 合同编号
      this.dataJson.tempJson.po_code = val.code // 订单编号
      this.dataJson.tempJson.bill_type = constants_dict.DICT_B_IN_PLAN_BUSINESS_TYPE_GYL // 单据类型 (供应链业务)

      this.dataJson.tempJson.supplier_id = val.supplier_id // 供应商id
      this.dataJson.tempJson.supplier_name = val.supplier_name // 供应商名称
      this.dataJson.tempJson.supplier_code = val.supplier_code // 供应商code

      this.dataJson.tempJson.contract_dt = val.sign_date // 合同日期
      this.dataJson.tempJson.contract_num = val.order_total // 合同量
      this.dataJson.tempJson.logistics_contracts = null // 物流合同
      // this.dataJson.tempJson.over_charged_btn = null // 启用超收
      // this.dataJson.tempJson.over_inventory_upper = null // 超收百分比

      this.dataJson.tempJson.type = constants_dict.DICT_B_IN_TYPE_CG // 入库类型：（采购入库）
      this.dataJson.tempJson.order_id = val.id // 订单id
      this.dataJson.tempJson.order_type = constants_dict.DICT_B_PO_ORDER // 订单类型

      // 设置到table中绑定的业务单据信息
      this.dataJson.detailListData = []
      val.detailListData.forEach((k) => {
        const tempData = {}
        tempData.sku_id = k.sku_id
        tempData.sku_code = k.sku_code // 物料编码

        tempData.spec_code = k.sku_code // 物料编码
        tempData.goods_name = k.sku_name // 物料名称

        tempData.spec = k.spec // 物料规格
        tempData.price = k.price // 物料单价
        tempData.count = 0 // 入库数量
        tempData.qty = k.qty // 合同数量
        tempData.unit_id = k.unit_id
        tempData.unit_name = '吨'
        tempData.remark = null
        tempData.supplier_id = val.supplier_id // 供应商id
        tempData.supplier_name = val.supplier_name // 供应商名称
        tempData.supplier_code = val.supplier_code // 供应商code
        this.dataJson.detailListData.push(tempData)
      })
    },
    // 订单：关闭对话框：取消
    handleOrderCloseCancel () {
      this.popSettingsData.searchDialogDataThree.visible = false
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
        this.dataJson.detailListData.splice(this.dataJson.rowIndex, 1)
      }).catch(action => {

      })
    },
    // 商品数据编辑
    handleGoodsEdit () {
      if (this.dataJson.rowIndex === null) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 编辑
      this.popSettingsData.goodsDialog.data = deepCopy(this.dataJson.currentJson)
      if (this.dataJson.tempJson.contract_no !== null && this.dataJson.tempJson.contract_no !== undefined && this.dataJson.tempJson.contract_no !== '') {
        this.popSettingsData.goodsDialog.data.contract_no = deepCopy(this.dataJson.tempJson.contract_no)
      }
      this.popSettingsData.goodsDialog.dialogStatus = this.PARAMETERS.STATUS_UPDATE
      this.popSettingsData.goodsDialog.visible = true
    },

    // 商品数据选择
    handleGoodsInsert () {
      // 新增
      this.popSettingsData.goodsDialog.dialogStatus = this.PARAMETERS.STATUS_INSERT
      this.popSettingsData.goodsDialog.visible = true
      // 如果选择了合同, 只能选择合同中的商品
      if (this.dataJson.tempJson.contract_no !== null && this.dataJson.tempJson.contract_no !== undefined && this.dataJson.tempJson.contract_no !== '') {
        this.popSettingsData.goodsDialog.data = { sku_code: this.dataJson.tempJson.sku_code, sku_price: this.dataJson.tempJson.sku_price, contract_no: this.dataJson.tempJson.contract_no }
      }
    },

    // 商品：关闭对话框：确定
    handleGoodsCloseOk (val) {
      val.data.id = null
      // val.data.spec_code = val.data.code

      switch (this.popSettingsData.goodsDialog.dialogStatus) {
        case this.PARAMETERS.STATUS_INSERT:
          this.doInsertModelCallBack(val)
          break
        case this.PARAMETERS.STATUS_UPDATE:
          this.doUpdateModelCallBack(val)
          break
      }
    },
    // 新增回调
    doInsertModelCallBack (val) {
      if (val.return_flag) {
        // 设置到table中绑定的json数据源
        var result = this.dataJson.detailListData.some(item => {
          if (item.warehouse_id === val.data.warehouse_id && item.sku_id === val.data.sku_id) {
            return true
          }
          return false
        })

        if (result) {
          this.showErrorMsg('已存在物料，不能添加相同物料！')
          return
        }

        this.popSettingsData.goodsDialog.visible = false
        // 设置到table中绑定的json数据源
        this.dataJson.detailListData.push(val.data)
        this.$notify({
          title: '新增处理成功',
          message: val.data.message,
          type: 'success',
          duration: this.settings.duration
        })
      } else {
        this.$notify({
          title: '新增处理失败',
          message: val.error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }
    },
    // 编辑回调
    doUpdateModelCallBack (val) {
      if (val.return_flag) {
        // 设置到table中绑定的json数据源
        var result = this.dataJson.detailListData.some(item => {
          if (item.warehouse_id === val.data.warehouse_id && item.sku_id === val.data.sku_id && this.dataJson.detailListData[val.data.index].sku_id !== item.sku_id) {
            return true
          }
          return false
        })

        if (result) {
          this.showErrorMsg('已存在物料，不能添加相同物料！')
          return
        }

        this.popSettingsData.goodsDialog.visible = false
        val.data.code = this.dataJson.detailListData[this.popSettingsData.goodsDialog.rowIndex].code
        // 设置到table中绑定的json数据源
        this.dataJson.detailListData.splice(this.popSettingsData.goodsDialog.rowIndex, 1, val.data)
        // 设置到currentjson中
        this.dataJson.currentJson = Object.assign({}, val.data.data)
        this.$notify({
          title: '更新处理成功',
          message: val.data.message,
          type: 'success',
          duration: this.settings.duration
        })
      } else {
        this.$notify({
          title: '更新处理失败',
          message: val.error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }
    },
    // 商品：关闭对话框：取消
    handleGoodsCloseCancel () {
      this.popSettingsData.goodsDialog.visible = false
    },
    handleRowClick (row) {
      this.popSettingsData.goodsDialog.rowIndex = this.getRowIndex(row)
    },
    // 获取行索引
    getRowIndex (row) {
      const _index = this.dataJson.detailListData.lastIndexOf(row)
      return _index
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
      this.settings.btnTableDisabledStatus.disabledInsert = false
      this.settings.btnTableDisabledStatus.disabledUpdate = false
      this.settings.btnTableDisabledStatus.disabledDelete = false
    },
    getData () {
      // 查询逻辑
      this.settings.loading = true
      getApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.tempJson.over_inventory_upper = this.dataJson.tempJson.over_inventory_upper * 100
        this.dataJson.tempJsonOriginal = deepCopy(response.data)
        this.dataJson.detailListData = this.dataJson.tempJson.detailList

        if (this.dataJson.tempJson.detailList !== null && this.dataJson.tempJson.detailList !== undefined && this.dataJson.tempJson.detailList.length) {
          this.dataJson.tempJson.sku_price = this.dataJson.tempJson.detailList[0].contract_price
        }

        this.popSettingsData.searchDialogDataOne.selectedDataJson.id = this.dataJson.tempJson.consignor_id
        this.popSettingsData.searchDialogDataTwo.selectedDataJson.id = this.dataJson.tempJson.owner_id
        this.popSettingsData.searchDialogDataThree.selectedDataJson.id = this.dataJson.tempJson.order_id

        if (this.dataJson.tempJson.contract_no !== null) {
          this.settings.isContract = true
        }
      }).finally(() => {
        this.settings.loading = false
      })
    },
    getOverConfig () {
      getOverReceiveConfigApi().then((_data) => {
        if (_data.data.config_value === '1') {
          this.settings.over_receive = true
        } else {
          this.settings.over_receive = false
        }
      }, (_error) => {
      })
    },
    // 上浮百分比校验
    over_inventory_upper_validator (rule, value, callback) {
      if (this.dataJson.tempJson.over_inventory_upper !== undefined && this.dataJson.tempJson.over_inventory_upper !== null) {
        if (isNaN(this.dataJson.tempJson.over_inventory_upper)) {
          callback(new Error('请输入数字'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    },
    // 校验数据 获取审批流程
    startProcess () {
      this.showLoading('正在查询，请稍后...')
      // 校验业务数据
      const tempData = deepCopy(this.dataJson.tempJson)
      tempData.check_type = constants_para.UPDATE_CHECK_TYPE

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
    }
  }
}
</script>
