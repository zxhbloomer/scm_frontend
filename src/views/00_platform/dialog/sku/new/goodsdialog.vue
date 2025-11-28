<template>
  <div>
    <!-- pop窗口 数据编辑:新增、修改 -->
    <el-dialog
      v-if="listenVisible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      title="新增商品信息"
      :visible="visible"
      :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
      :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
      :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="1000px"
      destroy-on-close
    >
      <el-form
        ref="dataSubmitForm"
        :rules="settings.rules"
        :model="dataJson.tempJson"
        label-position="right"
        label-width="0px"
        status-icon
      >
        <el-descriptions
          title=""
          :column="2"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
        >
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              物料编码
            </div>
            <el-form-item prop="sku_code">
              <input-search
                v-model.trim="dataJson.tempJson.sku_code"
                @onInputSearch="handleSpecDialog"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item />
          <el-descriptions-item label="商品名称">
            {{ dataJson.tempJson.goods_name }}
          </el-descriptions-item>
          <el-descriptions-item label="规格">
            {{ dataJson.tempJson.sku_name }}
          </el-descriptions-item>
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              数量
            </div>
            <el-form-item prop="qty">
              <numeric
                v-model="dataJson.tempJson.qty"
                :decimal-places="4"
                :currency-symbol="''"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item>
            <div
              slot="label"
            >
              单位
            </div>
            吨
          </el-descriptions-item>
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              单价（含税）
            </div>
            <el-form-item prop="price">
              <numeric
                v-model="dataJson.tempJson.price"
                :decimal-places="2"
                :currency-symbol="'¥'"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="金额">
            {{ dataJson.tempJson.amount == null?"":formatCurrency(dataJson.tempJson.amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              税率
            </div>
            <el-form-item prop="tax_rate">
              <radio-dict
                v-model="dataJson.tempJson.tax_rate"
                :value="dataJson.tempJson.tax_rate"
                :para="CONSTANTS.DICT_S_TAX_TYPE"
                @change="handleTaxTypeChange"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="税额">
            {{ dataJson.tempJson.tax_amount == null?"":formatCurrency(dataJson.tempJson.tax_amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="产地">
            <el-form-item prop="origin">
              <el-input
                v-model.trim="dataJson.tempJson.origin"
                class="slotColor"
                type="text"
                clearable
                show-word-limit
                :maxlength="dataJson.inputSettings.maxLength.origin"
                :placeholder="'请输入'"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item />

        </el-descriptions>

      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-divider />
        <el-button
          plain
          :disabled="settings.loading"
          @click="handleCancel()"
        >取消</el-button>
        <el-button
          plain
          type="primary"
          :disabled="settings.loading "
          @click="doInsert()"
        >确定</el-button>
      </div>
    </el-dialog>

    <spec-dialog
      v-if="popSettingsData.specDialog.visible"
      :visible="popSettingsData.specDialog.visible"
      @closeMeOk="handleSpecCloseOk"
      @closeMeCancel="handleSpecCloseCancel"
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
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}
</style>

<script>
import specDialog from '@/views/30_wms/spec/dialog/10_list'
import InputSearch from '@/components/40_input/inputSearch/index.vue'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import numeric from '@/components/40_input/numeric/index.vue'
import RadioDict from '@/components/00_dict/redio/index.vue'
export default {
  components: { RadioDict, InputSearch, specDialog, numeric },
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
      // 监听器
      watch: {
        unwatch_tempJson: null
      },
      popSettingsData: {
        specDialog: {
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
        searchForm: {
          pageCondition: {}
        },
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          amount: 0,
          sku_code: null,
          tax_amount: 0,
          tax_rate: '0'
        },
        // 单条数据 json
        tempJson: {
          amount: 0,
          sku_code: null,
          tax_amount: 0,
          tax_rate: '0'
        },
        inputSettings: {
          maxLength: {
            name: 20,
            code: 20,
            origin: 20
          }
        }
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        // pop的check内容
        rules: {
          sku_code: [
            { required: true, message: '请选择物料', trigger: 'change' }
          ],
          unit_id: [
            { required: true, message: '请选择单位', trigger: 'change' }
          ],

          qty: [
            { required: true, message: '请输入合同数量', trigger: 'change' },
            { validator: this.contract_qty_validator, trigger: 'blur' }

          ],
          price: [
            { required: true, message: '请输入合同价格', trigger: 'change' },
            { validator: this.contract_price_validator, trigger: 'blur' }
          ],
          tax_rate: [
            { required: true, message: '请输入税率', trigger: 'change' },
            { validator: this.rate_validator, trigger: 'change' }
          ],
          delivery_date: [
            { required: true, message: '请输入交货日期', trigger: 'change' }
          ],
          delivery_type: [
            { required: true, message: '请选择交货方式', trigger: 'change' }
          ],
          origin: [
            { max: 20, message: '产地长度不能超过20个字符', trigger: 'blur' }
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
  },
  mounted () {
    // 描绘完成
    this.init()
  },
  destroyed () {
    this.unWatch()
  },
  methods: {
    // 初始化处理
    init () {
      // 初始化watch
      this.setWatch()
      this.settings.loading = false
    },
    initTempJsonOriginal () {
      // 单条数据 json的，初始化原始数据
      this.dataJson.tempJsonOriginal = this.$options.data.call(
        this
      ).dataJson.tempJsonOriginal
    },
    // 设置监听器
    setWatch () {
      this.unWatch()
      // 监听页面上面是否有修改，有修改按钮高亮
      this.watch.unwatch_tempJson = this.$watch(
        'dataJson.tempJson',
        (newVal, oldVal) => {
          // 计算金额
          if (!isNaN(this.dataJson.tempJson.qty * this.dataJson.tempJson.price)) {
            this.dataJson.tempJson.amount = this.dataJson.tempJson.qty * this.dataJson.tempJson.price
          }

          // 根据需求计算税额和税率
          // 1. 当单价（含税）为0时，税额为0
          if (this.dataJson.tempJson.price === 0) {
            this.dataJson.tempJson.tax_amount = 0
          } else if (this.dataJson.tempJson.price !== 0 && this.dataJson.tempJson.tax_rate !== null) {
            // 2. 当单价（含税）不为0且税率不为空时，计算税额
            if (!isNaN(this.dataJson.tempJson.qty * this.dataJson.tempJson.price * this.dataJson.tempJson.tax_rate / 100)) {
              this.dataJson.tempJson.tax_amount = this.dataJson.tempJson.qty * this.dataJson.tempJson.price * this.dataJson.tempJson.tax_rate / 100
            }
          }

          // 3. 当税额发生变化时，重新计算税率
          // 确保除数不为零，且所有必要值都存在
          if (this.dataJson.tempJson.qty > 0 && this.dataJson.tempJson.price > 0 && this.dataJson.tempJson.tax_amount !== null) {
            // 计算税率 = 税额 / (单价 * 合同数量) * 100
            const calculatedTaxRate = (this.dataJson.tempJson.tax_amount / (this.dataJson.tempJson.price * this.dataJson.tempJson.qty)) * 100
            if (!isNaN(calculatedTaxRate)) {
              // this.dataJson.tempJson.tax_rate = calculatedTaxRate
            }
          }
        },
        { deep: true }
      )
    },
    unWatch () {
      if (this.watch.unwatch_tempJson) {
        this.watch.unwatch_tempJson()
      }
    },
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 插入逻辑
    doInsert () {
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)
          this.settings.loading = true
          this.$emit('closeMeOk', { data: tempData })
        }
      })
    },
    handleSpecDialog () {
      this.popSettingsData.specDialog.visible = true
    },
    // 规格：关闭对话框：确定
    handleSpecCloseOk (val) {
      this.popSettingsData.specDialog.selectedDataJson = val
      this.dataJson.searchForm.sku_id = val.id
      this.dataJson.tempJson.goods_name = val.goods_name
      this.dataJson.tempJson.sku_name = val.spec
      this.dataJson.tempJson.goods_id = val.goods_id
      this.dataJson.tempJson.goods_code = val.goods_code
      this.dataJson.tempJson.pm = val.pm
      this.dataJson.tempJson.sku_code = val.sku_code
      this.popSettingsData.specDialog.visible = false
      this.dataJson.tempJson.unit = '吨'
      this.dataJson.tempJson.sku_id = val.id
    },
    // 规格：关闭对话框：取消
    handleSpecCloseCancel () {
      this.popSettingsData.specDialog.visible = false
    },
    handleUnitChange (val) {
      console.log(val)
      this.dataJson.tempJson.unit_id = val.src_unit_id
      this.dataJson.tempJson.unit_name = val.src_unit
      this.dataJson.tempJson.unit_code = val.src_unit_code
      this.dataJson.tempJson.unitData = deepCopy(val)
    },
    handleDelivetyTypeChange (val, selectedData) {
      this.dataJson.tempJson.delivery_type_name = selectedData.name
    },
    /**
     * 合同数量check
     */
    contract_qty_validator (rule, value, callback) {
      if (value <= 0) {
        callback(new Error('请输入合同数量'))
      } else {
        callback()
      }
    },
    /**
     * 合同价格check
     */
    contract_price_validator (rule, value, callback) {
      if (value <= 0) {
        callback(new Error('请输入合同价格'))
      } else {
        callback()
      }
    },
    /**
     * 税率check
     */
    rate_validator (rule, value, callback) {
      // if (isNaN(value)) {
      //   callback(new Error('请输入数字'))
      // } else {
      //   callback()
      // }
      if (value <= 0) {
        callback(new Error('请输入税率'))
      } else {
        callback()
      }
    },
    /**
     * 税率变化
     */
    handleTaxTypeChange (val) {
      this.dataJson.tempJson.tax_rate = val
    }
  }
}
</script>
