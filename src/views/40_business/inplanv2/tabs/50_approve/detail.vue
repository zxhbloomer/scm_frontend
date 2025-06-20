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
          <el-descriptions-item label="委托方">
            {{ dataJson.tempJson.consignor_name }}
          </el-descriptions-item>
          <el-descriptions-item label="货主">
            {{ dataJson.tempJson.owner_name }}
          </el-descriptions-item>
          <el-descriptions-item label="入库类型">
            {{ dataJson.tempJson.type_name }}
          </el-descriptions-item>
          <el-descriptions-item label="入库时间">
            {{ formatDate(dataJson.tempJson.plan_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="单据状态">
            {{ dataJson.tempJson.status_name }}
          </el-descriptions-item>
          <el-descriptions-item label="备注">
            {{ dataJson.tempJson.remark }}
          </el-descriptions-item>
          <el-descriptions-item />
          <el-descriptions-item
            v-if="dataJson.tempJson.status =='4'"
            label="作废理由"
          >
            {{ dataJson.tempJson.cancel_remark }}
          </el-descriptions-item>
          <el-descriptions-item v-else />

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
          <el-descriptions-item label="合同编号">
            {{ dataJson.tempJson.contract_no }}
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
            {{ dataJson.tempJson.customer_name == null?'-':dataJson.tempJson.customer_name }}
          </el-descriptions-item>

          <el-descriptions-item label="合同量">
            {{ dataJson.tempJson.contract_num == null?'-':dataJson.tempJson.contract_num }}
          </el-descriptions-item>

          <el-descriptions-item label="物流合同">
            {{ dataJson.tempJson.waybill_code }}
          </el-descriptions-item>
          <el-descriptions-item label="上浮百分比">
            <el-form-item
              prop="over_inventory_upper"
              label-width="0"
            >
              {{
                dataJson.tempJson.over_inventory_upper == null || dataJson.tempJson.over_inventory_upper === 0 ? '-' : dataJson.tempJson.over_inventory_upper
              }}
              <template slot="append">%</template>
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
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getApi } from '@/api/40_business/inplanv2/inplanv2'
import constants_program from '@/common/constants/constants_program'
export default {
  components: { },
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
    async init () {
      this.settings.loading = false
      this.initButtonShowStatus()
      this.initButtonDisabledStatus()
      await this.initViewModel()
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
    async initInsertModel () {
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
      // 控件focus
      this.$nextTick(() => {
        // this.$refs['refFocusOne'].focus()
      })
    },
    // Placeholder设置
    isPlaceholderShow (val) {
      if (this.isViewModel) {
        return ''
      } else {
        return val
      }
    },
    // 查看时的初始化
    async initViewModel () {
      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.data)
      this.dataJson.detailListData = this.data.detailVo
      this.getData()
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
      }).finally(() => {
        this.settings.loading = false
      })
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
    handleTabsClick (tab, event) {
    }
  }

}
</script>
