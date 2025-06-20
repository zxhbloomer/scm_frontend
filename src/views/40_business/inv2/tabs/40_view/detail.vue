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
          :content-style="contentStyle"
          :label-style="labelStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >

          <el-descriptions-item label="入库单号">
            {{
              dataJson.tempJson.code == null || dataJson.tempJson.code == '' ? '系统自动生成' : dataJson.tempJson.code
            }}
          </el-descriptions-item>

          <el-descriptions-item label="委托方">
            {{ dataJson.tempJson.consignor_name == null ? '-' : dataJson.tempJson.consignor_name }}
          </el-descriptions-item>

          <el-descriptions-item label="货主">
            {{ dataJson.tempJson.owner_name == null ? '-' : dataJson.tempJson.owner_name }}
          </el-descriptions-item>

          <el-descriptions-item label="物料编码">
            {{ dataJson.tempJson.spec_code == null ? '-' : dataJson.tempJson.spec_code }}
          </el-descriptions-item>

          <el-descriptions-item label="物料名称">
            {{ dataJson.tempJson.goods_name == null ? '-' : dataJson.tempJson.goods_name }}
          </el-descriptions-item>

          <el-descriptions-item label="品名">
            {{ dataJson.tempJson.pm == null ? '-' : dataJson.tempJson.pm }}
          </el-descriptions-item>
          <el-descriptions-item label="规格">
            {{ dataJson.tempJson.spec == null ? '-' : dataJson.tempJson.spec }}
          </el-descriptions-item>

          <el-descriptions-item label="入库类型">
            {{ dataJson.tempJson.type_name == null ? '-' : dataJson.tempJson.type_name }}
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
          <el-descriptions-item label="合同编号">
            {{ dataJson.tempJson.contract_no == null ? '-' : dataJson.tempJson.contract_no }}
          </el-descriptions-item>

          <el-descriptions-item label="单据类型">
            {{ dataJson.tempJson.bill_type_name == null ? '-' : dataJson.tempJson.bill_type_name }}
          </el-descriptions-item>

          <el-descriptions-item label="合同日期">
            {{ dataJson.tempJson.contract_dt == null ? '-' : formatDate(dataJson.tempJson.contract_dt) }}
          </el-descriptions-item>

          <el-descriptions-item label="船名">
            {{ dataJson.tempJson.ship_name == null ? '-' : dataJson.tempJson.ship_name }}
          </el-descriptions-item>

          <el-descriptions-item label="供应商">
            {{ dataJson.tempJson.customer_name == null ? '-' : dataJson.tempJson.customer_name }}
          </el-descriptions-item>

          <el-descriptions-item label="合同量">
            {{ dataJson.tempJson.contract_num == null ? '-' : dataJson.tempJson.contract_num }}
          </el-descriptions-item>

        </el-descriptions>

        <br>
        <el-alert
          title="入库单信息"
          type="info"
          :closable="false"
        />
        <br>

        <el-descriptions
          v-if="settings.weight_control_config"
          title=""
          :column="3"
          :content-style="contentStyle"
          :label-style="labelStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="入库仓库 / 库区 / 库位">
            <el-form-item
              prop="wlb_data"
              label-width="0"
            >
              <Select-Warehouse-Location-Bin
                v-model.trim="dataJson.tempJson.wlb_data"
                :disabled="isViewModel"
                :reset="dataJson.searchForm.reset"
                :warehouse="dataJson.tempJson.warehouse_id"
                placement="left"
                @closeParentDialog="handleWLBDialogClose"
                @onReturnData="handleWLBReturnData"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="车牌号">
            {{ dataJson.tempJson.vehicle_no == null ? '-' : dataJson.tempJson.vehicle_no }}
          </el-descriptions-item>

          <el-descriptions-item label="实收车数">
            {{ dataJson.tempJson.car_count == null ? '-' : dataJson.tempJson.car_count }}
          </el-descriptions-item>
          <el-descriptions-item label="原发数量">
            {{ formatNumber(dataJson.tempJson.primary_quantity, true, 4) }}
          </el-descriptions-item>

          <el-descriptions-item label="毛重">
            {{ formatNumber(dataJson.tempJson.gross_weight, true, 4) }} &nbsp;{{ dataJson.tempJson.unit_name }}
          </el-descriptions-item>
          <!-- 皮重， 开关控制是否显示 -->
          <el-descriptions-item v-if="settings.weight_control_config" label="皮重">
            {{ formatNumber(dataJson.tempJson.tare_weight, true, 4) }} &nbsp;{{ dataJson.tempJson.unit_name }}
          </el-descriptions-item>

          <el-descriptions-item label="入库数量">
            {{ formatNumber(dataJson.tempJson.actual_count, true, 4) }}
          </el-descriptions-item>

          <el-descriptions-item label="入库单位">
            {{ dataJson.tempJson.unit_name == null ? '-' : dataJson.tempJson.unit_name }}
          </el-descriptions-item>
          <el-descriptions-item />

          <el-descriptions-item label="入库时间">
            {{ dataJson.tempJson.inbound_time == null ? '-' : formatDate(dataJson.tempJson.inbound_time) }}
          </el-descriptions-item>

          <el-descriptions-item label="入库数量换算">
            {{ formatNumber(dataJson.tempJson.actual_weight, true, 4) }}
          </el-descriptions-item>

          <el-descriptions-item label="库存计量单位">
            <span>吨</span>
            <!-- 若入库单位不等于吨 -->
            <span
              v-if="settings.btnUnitStatus.showUnit"
              class="floatRight"
              style="padding-left: 5px;"
            >注：单位转换，{{ dataJson.tempJson.unitData.content }}
            </span>
            <span
              v-if="settings.btnUnitStatus.showInsert"
              class="floatRight"
              style="padding-left: 5px;"
            >注：点击单位按钮维护单位数据
              <el-button
                type="primary"
                @click="handleUnitInsert"
              >
                单位
              </el-button>
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="入库单价">
            {{ formatCurrency(dataJson.tempJson.price, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="入库金额">
            {{ formatCurrency(dataJson.tempJson.amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="备注">
            {{ dataJson.tempJson.remark == null ? '-' : dataJson.tempJson.remark }}
          </el-descriptions-item>

        </el-descriptions>

        <el-descriptions
          v-if="!settings.weight_control_config"
          title=""
          :column="3"
          :content-style="contentStyle"
          :label-style="labelStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              入库仓库 / 库区 / 库位
            </div>
            <el-form-item
              prop="wlb_data"
              label-width="0"
            >
              <Select-Warehouse-Location-Bin
                v-model.trim="dataJson.tempJson.wlb_data"
                :disabled="isViewModel"
                :reset="dataJson.searchForm.reset"
                :warehouse="dataJson.tempJson.warehouse_id"
                placement="left"
                @closeParentDialog="handleWLBDialogClose"
                @onReturnData="handleWLBReturnData"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="车牌号">
            {{ dataJson.tempJson.vehicle_no == null ? '-' : dataJson.tempJson.vehicle_no }}
          </el-descriptions-item>
          <el-descriptions-item label="实收车数">
            {{ dataJson.tempJson.car_count == null ? '-' : dataJson.tempJson.car_count }}
          </el-descriptions-item>

          <el-descriptions-item label="原发数量">
            {{ formatNumber(dataJson.tempJson.primary_quantity, true, 4) }}
          </el-descriptions-item>

          <el-descriptions-item label="入库数量">
            {{ formatNumber(dataJson.tempJson.actual_count, true, 4) }}
          </el-descriptions-item>
          <el-descriptions-item label="入库单位">
            {{ dataJson.tempJson.unit_name }}
          </el-descriptions-item>
          <el-descriptions-item label="入库时间">
            {{ dataJson.tempJson.inbound_time == null ? '-' : formatDate(dataJson.tempJson.inbound_time) }}
          </el-descriptions-item>

          <el-descriptions-item label="入库数量换算">
            {{ formatNumber(dataJson.tempJson.actual_weight, true, 4) }}
          </el-descriptions-item>

          <el-descriptions-item label="库存计量单位">
            <span>吨</span>
            <!-- 若入库单位不等于吨 -->
            <span
              v-if="settings.btnUnitStatus.showUnit"
              class="floatRight"
              style="padding-left: 5px;"
            >注：单位转换，{{ dataJson.tempJson.unitData.content }}
            </span>
            <span
              v-if="settings.btnUnitStatus.showInsert"
              class="floatRight"
              style="padding-left: 5px;"
            >注：点击单位按钮维护单位数据
              <el-button
                type="primary"
                @click="handleUnitInsert"
              >
                单位
              </el-button>
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="入库单价">
            {{ formatCurrency(dataJson.tempJson.price, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="入库金额">
            {{ formatCurrency(dataJson.tempJson.amount, true) }}
          </el-descriptions-item>

          <el-descriptions-item label="备注">
            {{ dataJson.tempJson.remark == null ? '-' : dataJson.tempJson.remark }}
          </el-descriptions-item>

        </el-descriptions>

        <br>
        <el-alert
          title="附件信息"
          type="info"
          :closable="false"
        />
        <br>
        <el-descriptions
          title=""
          :column="1"
          :label-style="fileLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="磅单文件">
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.pounds"
                :key="i"
                :offset="1"
                :span="4"
              >
                <previewCard
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removePoundFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>
          <el-descriptions-item label="入库附件明细">
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.goods"
                :key="i"
                :offset="1"
                :span="4"
              >
                <previewCard
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeGoodsFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>

          <el-descriptions-item label="检验单">
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.inspections"
                :key="i"
                :offset="1"
                :span="4"
              >
                <previewCard
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeInspectionFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>
          <el-descriptions-item label="货物照片">
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.photos"
                :key="i"
                :offset="1"
                :span="4"
              >
                <previewCard
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removePhotoFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>
        </el-descriptions>
        <br>

      </el-form>
    </div>

    <unit-calculator-dialog
      v-if="popSettingsData.unitCalculatorDialog.visible"
      :id="dataJson.tempJson.sku_id"
      :unit-id="dataJson.tempJson.unit_id"
      :visible="popSettingsData.unitCalculatorDialog.visible"
      :dialog-status="popSettingsData.unitCalculatorDialog.dialogStatus"
      @closeMeCancel="handleCloseDialogUnitCalculatorCancel"
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

.floatRight {
  float: right;
}

.floatLeft {
  float: left;
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

br {
  display: block;
  margin: 10px;
  content: ' ';
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
</style>

<script>
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getApi } from '@/api/40_business/inv2/inv2'
import { isNotEmpty } from '@/utils'
import { getDetailApi, getCountApi, getOnlyOneUnitCalcApi } from '@/api/30_wms/spec/unit/unitCalc'
import unitCalculatorDialog from '@/views/30_wms/spec/unit/unitCalculator/unitCalculator'
import SelectWarehouseLocationBin from '@/views/30_wms/warehouse/selectgrid/selectWarehouseLocationBin.vue'
import { getWeightControlConfigApi } from '@/api/40_business/inplanv2/inplanv2'
import constants_dict from '@/common/constants/constants_dict'
import previewCard from '@/components/50_preview_card/preview_card'

export default {
  components: { previewCard, unitCalculatorDialog, SelectWarehouseLocationBin },
  directives: { elDragDialog },
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
      // 监听器
      watch: {
        unwatch_tempJson: null,
        unwatch_actual_count: null,
        unwatch_actual_price: null
      },
      contentStyle: {
        width: '15%'
      },
      labelStyle: {
        width: '10%',
        'text-align': 'right'
      },
      fileLabelStyle: {
        width: '2.3%',
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
        // 弹出的仓库查询框参数设置
        searchDialogDataFour: {
          // 弹出框显示参数
          visible: false,
          data: null,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 弹出的规格查询框参数设置
        searchDialogDataFive: {
          // 弹出框显示参数
          visible: false,
          data: null,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 弹出的合同订单查询框参数设置
        searchDialogDataEight: {
          // 弹出框显示参数
          visible: false,
          data: null,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 单位换算弹出框 unitCalculatorDialog
        unitCalculatorDialog: {
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
          form_data: {},
          serial_type: constants_dict.DICT_B_IN_V2,
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
        // 磅单文件
        pounds: [],
        pound_file: [],
        // 入库明细
        photos: [],
        photo_file: [],
        // 检验单
        inspections: [],
        inspection_file: [],
        // 货物照片
        goods: [],
        goods_file: [],

        // 级联选择器数据
        cascader: {
          data: null,
          value: ''
        },
        unitList: null,
        searchForm: {
          reset: null
        },
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: null,
          name: '',
          config_key: '',
          value: '',
          descr: '',
          warehouse_name: '',
          // unit_data: null,
          unit_id: null,
          unit_name: null,
          consignor_name: null,
          owner_name: null,
          goods_name: null,
          sku_id: null,
          wlb_data: null,
          actual_count: 0,
          gross_weight: 0,
          tare_weight: 0,
          contract_no: null
        },
        // 单条数据 json
        tempJson: {
          id: null,
          name: '',
          config_key: '',
          value: '',
          descr: '',
          warehouse_name: '',
          // unit_data: null,
          unit_id: null,
          unit_name: null,
          consignor_name: null,
          owner_name: null,
          goods_name: null,
          sku_id: null,
          wlb_data: null,
          actual_count: 0,
          gross_weight: 0,
          tare_weight: 0,
          contract_no: null
        },
        inputSettings: {
          maxLength: {
            contract_num: 20,
            ship_name: 20,
            contract_no: 20,
            primary_quantity: 10,
            car_count: 20,
            actual_count: 20,
            price: 10,
            // 车牌号
            vehicle_no: 20,
            remark: 100
          }
        }
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        // 皮重, 毛重控制开关
        weight_control_config: false,
        btnUnitStatus: {
          // 关于单位的按钮显示
          showUnit: false,
          showInsert: false
        },
        duration: 4000,
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
        dialogStatus: this.editStatus,
        // pop的check内容
        rules: {
          owner_name: [
            { required: true, message: '请选择货主', trigger: 'change' }
          ],
          consignor_name: [
            { required: true, message: '请选择委托方', trigger: 'change' }
          ],
          type: [
            { required: true, message: '请选择入库类型', trigger: 'change' }
          ],
          wlb_data: [
            // { required: true, message: '请输入入库仓库/库区/库位', trigger: 'change' }
            { validator: this.wlb_data_validator, trigger: 'blur' }
          ],
          inbound_time: [
            { required: true, message: '请输入入库时间', trigger: 'change' }
          ],
          goods_name: [
            { required: true, message: '请选择物料', trigger: 'change' }
          ],
          actual_count: [
            { required: true, message: '请输入入库数量', trigger: 'change' },
            { validator: this.in_qty_validator, trigger: 'blur' }
          ],
          unit_id: [
            { validator: this.unit_id_validator, trigger: 'blur' }
          ],
          primary_quantity: [
            { required: true, message: '请输入原发数量', trigger: 'change' },
            { validator: this.original_qty_validator, trigger: 'blur' }
          ],
          gross_weight: [
            { validator: this.gross_weight_validator, trigger: 'change' }
          ],
          tare_weight: [
            { validator: this.tare_weight_validator, trigger: 'change' }
          ]
        }
      }
    }
  },
  computed: {
    // 是否为更新模式
    isUpdateModel () {
      if (
        this.settings.dialogStatus === this.PARAMETERS.STATUS_INSERT ||
        this.settings.dialogStatus === this.PARAMETERS.STATUS_COPY_INSERT
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
      if (this.settings.dialogStatus === this.PARAMETERS.STATUS_VIEW) {
        return true
      } else {
        return false
      }
    }
  },
  // 监听器
  watch: {
    // 监听毛重
    'dataJson.tempJson.gross_weight': {
      handler (newVal) {
        var number = (newVal === undefined ? 0 : newVal) - (this.dataJson.tempJson.tare_weight === undefined ? 0 : this.dataJson.tempJson.tare_weight)
        if (number < 0) {
          this.dataJson.tempJson.actual_count = 0
        } else {
          this.dataJson.tempJson.actual_count = number
        }
      }
    },
    // 监听 皮重
    'dataJson.tempJson.tare_weight': {
      handler (newVal) {
        var number = (this.dataJson.tempJson.gross_weight === undefined ? 0 : this.dataJson.tempJson.gross_weight) - (newVal === undefined ? 0 : newVal)
        if (number < 0) {
          this.dataJson.tempJson.actual_count = 0
        } else {
          this.dataJson.tempJson.actual_count = number
        }
      }
    }
  },
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
    init () {
      this.initButtonShowStatus()
      this.initButtonDisabledStatus()
      this.getWeightControlConfig()

      this.initViewModel()

      // 初始化watch
      this.setWatch()
      this.settings.loading = false
    },
    // 皮重, 毛重控制开关
    getWeightControlConfig () {
      this.settings.loading = true
      getWeightControlConfigApi().then((_data) => {
        const data = _data.data
        this.settings.weight_control_config = data.weight_control_config === '1'
      }).finally(() => {
        this.settings.loading = false
      })
    },
    initTempJsonOriginal () {
      // 单条数据 json的，初始化原始数据
      this.dataJson.tempJsonOriginal = this.$options.data.call(this).dataJson.tempJsonOriginal
    },
    initButtonShowStatus () {
      // 初始化按钮状态：默认都隐藏
      this.settings.btnShowStatus = this.$options.data.call(
        this
      ).settings.btnShowStatus
    },
    initButtonDisabledStatus () {
      // 按钮状态初始化：默认不可用
      this.settings.btnDisabledStatus = this.$options.data.call(
        this
      ).settings.btnDisabledStatus
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
    initViewModel () {
      this.getData()
      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.data)
      this.dataJson.pounds = this.dataJson.tempJson.pound_files
      this.dataJson.photos = this.dataJson.tempJson.photo_files
      this.dataJson.goods = this.dataJson.tempJson.goods_files
      this.dataJson.inspections = this.dataJson.tempJson.inspection_files
    },
    // 设置监听器
    setWatch () {
      // this.unWatch()
      // // 监听页面上面是否有修改，有修改按钮高亮
      // this.watch.unwatch_tempJson = this.$watch(
      //   'dataJson.tempJson',
      //   (newVal, oldVal) => {
      //     this.settings.btnDisabledStatus.disabledInsert = false
      //     this.settings.btnDisabledStatus.disabledUpdate = false
      //   },
      //   { deep: true }
      // )
      // this.watch.unwatch_actual_count = this.$watch(
      //   'dataJson.tempJson.actual_count',
      //   (newVal, oldVal) => {
      //     this.reCalcCountByUnit()
      //     this.reCalcTotalPrice()
      //   },
      // )
      // // 监听入库单位,是否有变化，判断是否要显示单位换算按钮
      // this.watch.unwatch_actual_price = this.$watch(
      //   'dataJson.tempJson.price',
      //   (newVal, oldVal) => {
      //     this.reCalcTotalPrice()
      //   },
      // )
    },
    unWatch () {
      if (this.watch.unwatch_tempJson) {
        this.watch.unwatch_tempJson()
      }
      if (this.watch.unwatch_actual_count) {
        this.watch.unwatch_actual_count()
      }
      if (this.watch.unwatch_actual_price) {
        this.watch.unwatch_actual_price()
      }
    },
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    handleTabsClick (tab, event) {
    },
    // 委托方
    handleConsignorDialog () {
      this.popSettingsData.searchDialogDataOne.visible = true
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
    // 仓库：关闭对话框：确定
    handleWarehouseCloseOk (val) {
      this.popSettingsData.searchDialogDataFour.selectedDataJson = val
      this.popSettingsData.searchDialogDataFour.visible = false
      this.settings.btnDisabledStatus.disabledUpdate = false
      this.dataJson.tempJson.warehouse_name = val.name
      this.dataJson.tempJson.warehouse_id = val.id
    },
    // 仓库：关闭对话框：取消
    handleWarehouseCloseCancel () {
      this.popSettingsData.searchDialogDataFour.visible = false
    },
    // 规格
    handleSpecDialog () {
      this.popSettingsData.searchDialogDataFive.visible = true
    },
    // 规格：关闭对话框：确定
    handleSpecCloseOk (val) {
      this.popSettingsData.searchDialogDataFive.selectedDataJson = val
      this.popSettingsData.searchDialogDataFive.visible = false
      this.settings.btnDisabledStatus.disabledUpdate = false
      this.dataJson.tempJson.spec = val.spec
      this.dataJson.tempJson.spec_code = val.code
      this.dataJson.tempJson.pm = val.pm
      this.dataJson.tempJson.goods_name = val.goods_name
      this.dataJson.tempJson.sku_id = val.id
      // 判断所选择的商品规格，单位是否需要换算
      this.showUnitHelpButton()
    },
    // 规格：关闭对话框：取消
    handleSpecCloseCancel () {
      this.popSettingsData.searchDialogDataFive.visible = false
    },
    // 库区
    handleLocationDialog () {
      if (this.dataJson.tempJson.warehouse_id === null || this.dataJson.tempJson.warehouse_id === undefined) {
        this.showErrorMsg('请先选择仓库')
        return
      }
      this.popSettingsData.searchDialogDataSix.visible = true
    },
    // 库区：关闭对话框：确定
    handleLocationCloseOk (val) {
      this.popSettingsData.searchDialogDataSix.selectedDataJson = val
      this.popSettingsData.searchDialogDataSix.visible = false
      this.settings.btnDisabledStatus.disabledUpdate = false
      this.dataJson.tempJson.location_name = val.name
      this.dataJson.tempJson.location_id = val.id
    },
    // 库区：关闭对话框：取消
    handleLocationCloseCancel () {
      this.popSettingsData.searchDialogDataSix.visible = false
    },
    // 库位
    handleBinDialog () {
      if (this.dataJson.tempJson.location_id === null || this.dataJson.tempJson.location_id === undefined) {
        this.showErrorMsg('请先选择库区')
        return
      }
      this.popSettingsData.searchDialogDataSeven.visible = true
    },
    // 库位：关闭对话框：确定
    handleBinCloseOk (val) {
      this.popSettingsData.searchDialogDataSeven.selectedDataJson = val
      this.popSettingsData.searchDialogDataSeven.visible = false
      this.settings.btnDisabledStatus.disabledUpdate = false
      this.dataJson.tempJson.bin_name = val.name
      this.dataJson.tempJson.bin_id = val.id
    },
    // 库位：关闭对话框：取消
    handleBinCloseCancel () {
      this.popSettingsData.searchDialogDataSeven.visible = false
    },
    // 订单
    handleOrderDialog () {
      this.popSettingsData.searchDialogDataThree.title = '订单选择页面'
      this.popSettingsData.searchDialogDataThree.visible = true
    },
    // 订单：关闭对话框：确定
    handleOrderCloseOk (val) {
      this.popSettingsData.searchDialogDataThree.selectedDataJson = val
      this.dataJson.tempJson.contract_no = val.po_contract_code
      // this.dataJson.tempJson.bill_type = val.bill_type
      // this.dataJson.tempJson.bill_type_name = val.bill_type_name
      this.dataJson.tempJson.contract_dt = val.sign_date // 合同日期
      this.dataJson.tempJson.contract_num = val.order_total

      // 供应商信息
      this.dataJson.tempJson.customer_id = val.supplier_id
      this.dataJson.tempJson.customer_name = val.supplier_name
      this.dataJson.tempJson.customer_code = val.supplier_code

      // this.dataJson.tempJson.ship_name = val.ship_name
      this.dataJson.tempJson.order_id = val.id // 订单id
      this.dataJson.tempJson.order_type = constants_dict.DICT_B_PO_ORDER // 订单类型
      this.popSettingsData.searchDialogDataThree.visible = false
      this.settings.btnDisabledStatus.disabledUpdate = false
    },
    // 订单：关闭对话框：取消
    handleOrderCloseCancel () {
      this.popSettingsData.searchDialogDataThree.visible = false
    },
    // 磅单上传成功
    handlePoundUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.pounds.push(res.response.data)
      this.dataJson.pound_file.push(res.response.data.url)
      this.dataJson.tempJson.pound_files = this.dataJson.pounds
    },
    // 磅单上传失败
    handlePoundUploadFileError () {
      console.debug('文件上传失败')
      this.$notify({
        title: '上传错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
      })
    },
    // 删除磅单文件
    removePoundFile (val) {
      // 获取下标
      const _index = this.dataJson.pound_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.pounds.splice(_index, 1)
      this.dataJson.pound_file.splice(_index, 1)
      // this.dataJson.tempJson.splice(_index, 1)
    },

    // 入库明细附件上传成功
    handlePhotoUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.photos.push(res.response.data)
      this.dataJson.photo_file.push(res.response.data.url)
      this.dataJson.tempJson.photo_files = this.dataJson.photos
    },
    // 入库明细附件上传失败
    handlePhotoUploadFileError () {
      console.debug('文件上传失败')
      this.$notify({
        title: '上传错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
      })
    },
    // 删除入库明细附件文件
    removePhotoFile (val) {
      // 获取下标
      const _index = this.dataJson.photo_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.photos.splice(_index, 1)
      this.dataJson.photo_file.splice(_index, 1)
      // this.dataJson.photo_files.splice(_index, 1)
    },

    // 检验单上传成功
    handleInspectionUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.inspections.push(res.response.data)
      this.dataJson.inspection_file.push(res.response.data.url)
      this.dataJson.tempJson.inspection_files = this.dataJson.inspections
    },
    // 检验单上传失败
    handleInspectionUploadFileError () {
      console.debug('文件上传失败')
      this.$notify({
        title: '上传错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
      })
    },
    // 删除检验单文件
    removeInspectionFile (val) {
      // 获取下标
      const _index = this.dataJson.inspection_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.inspections.splice(_index, 1)
      this.dataJson.inspection_file.splice(_index, 1)
      // this.dataJson.inspection_files.splice(_index, 1)
    },

    // 货物照片上传成功
    handleGoodsUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.goods.push(res.response.data)
      this.dataJson.goods_file.push(res.response.data.url)
      this.dataJson.tempJson.goods_files = this.dataJson.goods
    },
    // 货物照片上传失败
    handleGoodsUploadFileError () {
      console.debug('文件上传失败')
      this.$notify({
        title: '上传错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
      })
    },
    // 删除货物照片
    removeGoodsFile (val) {
      // 获取下标
      const _index = this.dataJson.goods_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.goods.splice(_index, 1)
      this.dataJson.goods_file.splice(_index, 1)
      // this.dataJson.goods_files.splice(_index, 1)
    },
    // 弹出框关闭
    handleDialogClose () {
      this.settings.visible = false
    },
    // 单位换算帮助按钮
    showUnitHelpButton () {
      // 获取单位
      // 判断是否存在单位换算
      getCountApi({ 'sku_id': this.dataJson.tempJson.sku_id }).then(response => {
        if (response.data >= 0) {
          this.settings.btnUnitStatus.showInsert = true
          this.settings.btnUnitStatus.showUnit = false
        } else {
          this.settings.btnUnitStatus.showInsert = false
          this.settings.btnUnitStatus.showUnit = true
        }
        if (response.data === 1) {
          // 获取单位
          getOnlyOneUnitCalcApi({
            'sku_id': this.dataJson.tempJson.sku_id,
            'src_unit_id': this.dataJson.tempJson.unit_id
          }).then(response => {
            if (isNotEmpty(response.data)) {
              this.dataJson.tempJson.unitData = deepCopy(response.data)
              this.settings.btnUnitStatus.showInsert = false
              this.settings.btnUnitStatus.showUnit = true
            } else {
              // 判断是否存在单位换算
              getCountApi({ 'sku_id': this.dataJson.tempJson.sku_id }).then(response => {
                if (response.data >= 0) {
                  this.settings.btnUnitStatus.showInsert = true
                  this.settings.btnUnitStatus.showUnit = false
                } else {
                  this.settings.btnUnitStatus.showInsert = false
                  this.settings.btnUnitStatus.showUnit = true
                }
              }).finally(() => {
                this.reCalcCountByUnit()
              })
            }
          }).finally(() => {
            this.reCalcCountByUnit()
          })
        }
      }).finally(() => {
      })
    },
    handleUnitInsert () {
      // 修改
      this.popSettingsData.unitCalculatorDialog.visible = true
    },
    handleUnitCalculator () {
      // 修改
      this.popSettingsData.unitCalculatorDialog.visible = true
    },
    handleCloseDialogUnitCalculatorCancel () {
      this.popSettingsData.unitCalculatorDialog.visible = false
      this.settings.loading = true
      if (isNotEmpty(this.dataJson.tempJson.unitData) && isNotEmpty(this.dataJson.tempJson.unitData.id)) {
        getDetailApi({ 'id': this.dataJson.tempJson.unitData.id }).then(response => {
          // 增加对象属性，columnTypeShowIcon，columnNameShowIcon
          this.dataJson.tempJson.unitData = response.data
        }).finally(() => {
          this.settings.loading = false
        })
      }
      // 调用子组件刷新，此处是子组件的方法
      this.$refs.ref_select_unit.initCreated()
      this.settings.loading = false
    },
    handleWLBDialogClose () {
      this.settings.visible = false
    },
    handleWLBReturnData (val) {
      if (!isNotEmpty(val)) {
        this.dataJson.tempJson.wlb_data = undefined
        // 仓库
        this.dataJson.tempJson.warehouse_id = undefined
        this.dataJson.tempJson.warehouse_name = undefined
        // 库区
        this.dataJson.tempJson.location_id = undefined
        this.dataJson.tempJson.location_name = undefined

        // 库位
        this.dataJson.tempJson.bin_id = undefined
        this.dataJson.tempJson.bin_name = undefined
      } else {
        this.dataJson.tempJson.wlb_data = val
        // 仓库
        this.dataJson.tempJson.warehouse_id = val.warehouse_id
        this.dataJson.tempJson.warehouse_name = val.warehouse_name
        this.dataJson.tempJson.warehouse_code = val.warehouse_code

        // 库区
        this.dataJson.tempJson.location_id = val.location_id
        this.dataJson.tempJson.location_name = val.location_name
        this.dataJson.tempJson.location_code = val.location_code

        // 库位
        this.dataJson.tempJson.bin_id = val.id
        this.dataJson.tempJson.bin_name = val.name
        this.dataJson.tempJson.bin_code = val.code
      }
    },
    /**
     * 入库数量check
     */
    in_qty_validator (rule, value, callback) {
      if (value <= 0) {
        callback(new Error('入库数量需大于0'))
      } else {
        callback()
      }
    },
    // 入库仓库验证
    wlb_data_validator (rule, value, callback) {
      if (this.dataJson.tempJson.warehouse_id) {
        callback()
      } else {
        callback(new Error('请输入入库仓库/库区/库位'))
      }
    },
    /**
     * 原发数量check
     */
    original_qty_validator (rule, value, callback) {
      if (value <= 0) {
        callback(new Error('请输入原发数量'))
      } else {
        callback()
      }
    },
    /**
     * 原发数量check
     */
    vehicle_qty_validator (rule, value, callback) {
      if (value <= 0) {
        callback(new Error('请输入实收车数'))
      } else {
        callback()
      }
    },
    /**
     * 入库单价check
     */
    price_validator (rule, value, callback) {
      if (value <= 0) {
        callback(new Error('请输入入库单价'))
      } else {
        callback()
      }
    },
    /**
     * 入库单位check
     */
    unit_id_validator (rule, value, callback) {
      if (!isNotEmpty(value)) {
        callback(new Error('请输入入库单位'))
      } else {
        callback()
      }
    },
    // 皮重校验, 当开关开启时, 且需小于毛重
    tare_weight_validator (rule, value, callback) {
      if (this.settings.weight_control_config) {
        if (this.dataJson.tempJson.tare_weight === null || this.dataJson.tempJson.tare_weight === undefined || this.dataJson.tempJson.tare_weight === '') {
          callback(new Error('请输入皮重'))
        } else {
          callback()
        }
      }
    },
    // 毛重不能为空
    gross_weight_validator (rule, value, callback) {
      if (this.settings.weight_control_config) {
        if (this.dataJson.tempJson.gross_weight === null || this.dataJson.tempJson.gross_weight === undefined || this.dataJson.tempJson.gross_weight === '') {
          callback(new Error('请输入毛重'))
        } else {
          callback()
        }
      }
    },
    getData () {
      // 查询逻辑
      this.settings.loading = true
      getApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.tempJsonOriginal = deepCopy(response.data)
        this.dataJson.tempJson.idx = this.data.idx

        this.dataJson.pounds = (this.dataJson.tempJson.pound_files && this.dataJson.tempJson.pound_files.length) ? this.dataJson.tempJson.pound_files : []
        this.dataJson.photos = (this.dataJson.tempJson.photo_files && this.dataJson.tempJson.photo_files.length) ? this.dataJson.tempJson.photo_files : []
        this.dataJson.goods = (this.dataJson.tempJson.goods_files && this.dataJson.tempJson.goods_files.length) ? this.dataJson.tempJson.goods_files : []
        this.dataJson.inspections = (this.dataJson.tempJson.inspection_files && this.dataJson.tempJson.inspection_files.length) ? this.dataJson.tempJson.inspection_files : []

        if (this.dataJson.tempJson.pound_files) {
          this.dataJson.pound_file = this.dataJson.tempJson.pound_files.map(item => item.url)
        }
        if (this.dataJson.tempJson.photo_files) {
          this.dataJson.photo_file = this.dataJson.tempJson.photo_files.map(item => item.url)
        }
        if (this.dataJson.tempJson.goods_files) {
          this.dataJson.goods_file = this.dataJson.tempJson.goods_files.map(item => item.url)
        }
        if (this.dataJson.tempJson.inspection_files) {
          this.dataJson.inspection_file = this.dataJson.tempJson.inspection_files.map(item => item.url)
        }

        if (this.dataJson.tempJson.gross_weight === null || this.dataJson.tempJson.gross_weight === undefined) {
          this.dataJson.tempJson.gross_weight = this.dataJson.tempJson.actual_count
        }
        if (this.dataJson.tempJson.tare_weight === null || this.dataJson.tempJson.tare_weight === undefined) {
          this.dataJson.tempJson.tare_weight = 0
        }
      }).finally(() => {
        this.settings.loading = false
      })
    }

  }
}
</script>
