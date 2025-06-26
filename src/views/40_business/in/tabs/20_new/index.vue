<template>
  <div class="app-container">
    <div class="edit-container">
      <el-form
        ref="dataSubmitForm"
        v-loading="settings.loading"
        :rules="settings.rules"
        :model="dataJson.tempJson"
        label-position="right"
        label-width="150px"
        element-loading-text="正在处理，请稍后..."
        element-loading-background="rgba(255, 255, 255, 0.7)"
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

          <el-descriptions-item label="入库单编号">
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
              prop="type"
              label-width="0"
            >
              <radio-dict
                v-model="dataJson.tempJson.type"
                :value="dataJson.tempJson.type"
                :para="CONSTANTS.DICT_B_IN_TYPE"
                :disabled="false"
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
            >
              供应商
            </div>
            <el-form-item
              label-width="0"
            >
              {{ dataJson.tempJson.supplier_name || '-' }}
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item />

          <el-descriptions-item label="备注" span="3">
            <el-form-item
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.remark"
                clearable
                placeholder="请输入备注"
                :maxlength="dataJson.inputSettings.maxLength.remark"
              />
            </el-form-item>
          </el-descriptions-item>

        </el-descriptions>

        <el-alert
          title="入库单信息"
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

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              仓库 / 库区 / 库位
            </div>
            <el-form-item
              prop="warehouse_info"
              label-width="0"
            >
              <input-search
                v-model.trim="dataJson.tempJson.warehouse_location_bin_display"
                :disabled="settings.inputDisabledStatus.disabledWarehouseSelect"
                @onInputSearch="handleWarehouseDialog"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              原发数量
            </div>
            <el-form-item
              prop="original_qty"
              label-width="0"
            >
              <numeric
                v-model="dataJson.tempJson.original_qty"
                :decimal-places="4"
                :currency-symbol="''"
                :disabled="settings.inputDisabledStatus.disabledOriginalQty"
                style="width: 100%"
                placeholder="请输入原发数量"
                @change.native="handleOriginalQtyChange"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="">
            <!-- 空白控件 -->
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              入库时间
            </div>
            <el-form-item
              prop="inbound_time"
              label-width="0"
            >
              <el-date-picker
                v-model="dataJson.tempJson.inbound_time"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                clearable
                :disabled="settings.inputDisabledStatus.disabledInboundTime"
                placeholder="选择入库时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              入库数量
            </div>
            <el-form-item
              prop="qty"
              label-width="0"
            >
              <numeric
                v-model="dataJson.tempJson.qty"
                :decimal-places="4"
                :currency-symbol="''"
                :disabled="settings.inputDisabledStatus.disabledQty"
                style="width: 100%"
                placeholder="请输入入库数量"
                @change.native="handleQtyChange"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              入库单价
            </div>
            <el-form-item
              prop="price"
              label-width="0"
            >
              <numeric
                v-model="dataJson.tempJson.price"
                :decimal-places="4"
                :disabled="settings.inputDisabledStatus.disabledPrice"
                style="width: 100%"
                placeholder="请输入入库单价"
                @change.native="handlePriceChange"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
            >
              入库金额
            </div>
            <el-form-item
              label-width="0"
            >
              {{ dataJson.tempJson.amount == null? '-' : formatCurrency(dataJson.tempJson.amount,true) }}
            </el-form-item>
          </el-descriptions-item>

        </el-descriptions>

        <el-alert
          title="附件信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          title=""
          :column="1"
          :label-style=" { width: '2.3%', 'text-align': 'right' }"
          :content-style="{ width: '15%'}"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >

          <el-descriptions-item label="磅单文件" span="3">
            <el-row style="display: flex;flex-wrap: wrap;">
              <simple-upload-mutil-file
                :accept="'*'"
                @upload-success="handleOneFileUploadSuccess"
                @upload-error="handleFileError"
              />
            </el-row>
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.tempJson.one_file"
                :key="i"
                :offset="0"
                :span="3"
              >
                <preview-card
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeOneFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>

          <el-descriptions-item label="入库附件明细" span="3">
            <el-row style="display: flex;flex-wrap: wrap;">            <simple-upload-mutil-file
              :accept="'*'"
              @upload-success="handleTwoFileUploadSuccess"
              @upload-error="handleFileError"
            />
            </el-row>
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.tempJson.two_file"
                :key="i"
                :offset="0"
                :span="3"
              >
                <preview-card
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeTwoFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>

          <el-descriptions-item label="检验单" span="3">
            <el-row style="display: flex;flex-wrap: wrap;">
              <simple-upload-mutil-file
                :accept="'*'"
                @upload-success="handleThreeFileUploadSuccess"
                @upload-error="handleFileError"
              />
            </el-row>
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.tempJson.three_file"
                :key="i"
                :offset="0"
                :span="3"
              >
                <preview-card
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeThreeFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>

          <el-descriptions-item label="货物照片" span="3">
            <el-row style="display: flex;flex-wrap: wrap;">
              <simple-upload-mutil-file
                :accept="'*'"
                @upload-success="handleFourFileUploadSuccess"
                @upload-error="handleFileError"
              />
            </el-row>
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.tempJson.four_file"
                :key="i"
                :offset="0"
                :span="3"
              >
                <preview-card
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeFourFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>

        </el-descriptions>

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

    <!-- 仓库库区库位选择对话框 -->
    <warehouse-location-bin-dialog
      v-if="popSettingsData.warehouseLocationBinDialog.visible"
      :visible="popSettingsData.warehouseLocationBinDialog.visible"
      :data="popSettingsData.warehouseLocationBinDialog.data"
      :title="'仓库库区库位选择'"
      @closeMeOk="handleWarehouseLocationBinCloseOk"
      @closeMeCancel="handleWarehouseLocationBinCloseCancel"
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

<script>
import deepCopy from 'deep-copy'
import constants_dict from '@/common/constants/constants_dict'
import constants_para from '@/common/constants/constants_para'
import { insertApi, validateApi } from '@/api/40_business/in/in'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import { EventBus } from '@/common/eventbus/eventbus'

// 导入组件
import InputSearch from '@/components/40_input/inputSearch'
import numeric from '@/components/40_input/numeric'
import RadioDict from '@/components/00_dict/redio'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import WarehouseLocationBinDialog from '@/views/30_wms/warehouse/selectgrid/selectWarehouseLocationBin.vue'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'

export default {
  name: 'InNew',
  components: {
    InputSearch,
    numeric,
    RadioDict,
    SimpleUploadMutilFile,
    PreviewCard,
    WarehouseLocationBinDialog,
    BpmDialog
  },
  data () {
    return {
      // 样式设置
      contentStyle: {
        width: '15%'
      },
      labelStyle: {
        width: '10%',
        'text-align': 'right'
      },
      EMITS: {
        EMIT_MST_IN_NEW_OK: 'emit_mst_in_new_ok'
      },
      // 弹出窗口设置
      popSettingsData: {
        // 仓库库区库位选择弹窗
        warehouseLocationBinDialog: {
          visible: false,
          data: {}
        },
        // 审批流程设置
        sponsorDialog: {
          visible: false,
          serial_type: 'in_new',
          form_data: {},
          initial_process: null,
          process_users: []
        }
      },
      dataJson: {
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          code: '',
          type: '',
          type_name: '',
          owner_id: null,
          owner_name: '',
          owner_code: '',
          supplier_id: null,
          supplier_name: '',
          supplier_code: '',
          warehouse_id: null,
          warehouse_code: '',
          warehouse_name: '',
          location_id: null,
          location_code: '',
          location_name: '',
          bin_id: null,
          bin_code: '',
          bin_name: '',
          warehouse_location_bin_display: '',
          original_qty: null,
          qty: null,
          price: null,
          amount: null,
          inbound_time: null,
          remark: '',
          one_file: [],
          two_file: [],
          three_file: [],
          four_file: []
        },
        // 单条数据 json
        tempJson: {
          code: '',
          type: '',
          type_name: '',
          owner_id: null,
          owner_name: '',
          owner_code: '',
          supplier_id: null,
          supplier_name: '',
          supplier_code: '',
          warehouse_id: null,
          warehouse_code: '',
          warehouse_name: '',
          location_id: null,
          location_code: '',
          location_name: '',
          bin_id: null,
          bin_code: '',
          bin_name: '',
          warehouse_location_bin_display: '',
          original_qty: null,
          qty: null,
          price: null,
          amount: null,
          inbound_time: null,
          remark: '',
          one_file: [],
          two_file: [],
          three_file: [],
          four_file: [],
          detailListData: [] // 入库单明细数据
        },
        inputSettings: {
          maxLength: {
            remark: 200
          }
        }
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: false,
        duration: 4000,
        // 输入框禁用状态
        inputDisabledStatus: {
          disabledWarehouseSelect: true, // 仓库库区库位选择控件
          disabledOriginalQty: true, // 原发数量
          disabledInboundTime: true, // 入库时间
          disabledQty: true, // 入库数量
          disabledPrice: true // 入库单价
        },
        rules: {
          type: [
            { required: true, message: '请选择入库类型', trigger: 'change' }
          ],
          warehouse_info: [
            { required: true, message: '请选择仓库库区库位', trigger: 'blur' }
          ],
          original_qty: [
            { required: true, message: '请输入原发数量', trigger: 'blur' }
          ],
          inbound_time: [
            { required: true, message: '请选择入库时间', trigger: 'change' }
          ],
          qty: [
            { required: true, message: '请输入入库数量', trigger: 'blur' }
          ],
          price: [
            { required: true, message: '请输入入库单价', trigger: 'blur' }
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
  watch: {
    // 全屏loading监听
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
    this.initComponent()
  },
  activated () {
  },
  methods: {
    /**
     * 初始化组件
     */
    initComponent () {
      this.closeLoading()
      this.initData()
    },
    /**
     * 重置数据
     */
    initData () {
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)
      // 初始化时"入库单信息"所有控件都不可用
      this.settings.inputDisabledStatus.disabledWarehouseSelect = true
      this.settings.inputDisabledStatus.disabledOriginalQty = true
      this.settings.inputDisabledStatus.disabledInboundTime = true
      this.settings.inputDisabledStatus.disabledQty = true
      this.settings.inputDisabledStatus.disabledPrice = true
    },
    /**
     * 取消
     */
    handleCancel () {
      this.$emit('closeMeCancel')
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
            this.showErrorMsg('请至少添加一条入库商品明细')
            return
          }
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
        }
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
      // 审批流程启动数据
      tempData.initial_process = this.popSettingsData.sponsorDialog.initial_process // 流程
      tempData.form_data = this.popSettingsData.sponsorDialog.form_data // 表单参数
      tempData.process_users = this.popSettingsData.sponsorDialog.process_users // 自选用户

      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          // 调用新增接口
          insertApi(tempData)
            .then(
              _data => {
                this.closeLoading()
                this.$emit('closeMeOk', _data.data)
                // 通知兄弟组件，新增数据更新 - 将完整数据传递给列表页面
                EventBus.$emit(this.EMITS.EMIT_MST_IN_NEW_OK, _data.data)
                this.$notify({
                  title: '新增成功',
                  message: _data.data.message,
                  type: 'success',
                  duration: this.settings.duration
                })
                // 触发事件通知页面刷新
                EventBus.$emit('global:mst:in:new:ok')
                this.resetDataJson()
                // 发送事件通知， 表示新增成功
                EventBus.$emit('global:notice:bpm')
              },
              _error => {
                this.closeLoading()
                this.showErrorMsg(_error.error.message)
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
    /**
     * 获取审批流程
     */
    getFlow () {
      // 设置审批流程类型
      this.popSettingsData.sponsorDialog.serial_type = 'in_new'
      // 校验是否存在审批流程
      getFlowProcessApi({ 'serial_type': this.popSettingsData.sponsorDialog.serial_type })
        .then((rsp) => {
          if (rsp.data === null) {
            this.showErrorMsg('未找到审批流程，请联系管理员')
            this.closeLoading()
          } else {
            // 流程参数
            this.popSettingsData.sponsorDialog.form_data = { }
            // 启动审批流弹窗
            this.popSettingsData.sponsorDialog.visible = true
          }
        }).catch((err) => {
          this.closeLoading()
          this.showErrorMsg(err)
        })
    },
    /**
     * 审批流弹窗取消
     */
    handleBpmDialogCancel () {
      console.log('关闭审批组件')
      this.popSettingsData.sponsorDialog.visible = false
      this.closeLoading()
    },
    /**
     * 审批流确定
     */
    handleBpmDialogOk (data) {
      this.popSettingsData.sponsorDialog.initial_process = data.processData
      this.popSettingsData.sponsorDialog.process_users = data.process_users
      this.popSettingsData.sponsorDialog.visible = false
      this.doInsert()
    },
    /**
     * 入库类型选择处理
     */
    handleTypeChange (val) {
      this.dataJson.tempJson.type = val
      // 根据入库类型启用不同的输入控件
      switch (val) {
        case 'normal': // 正常入库
          this.settings.inputDisabledStatus.disabledWarehouseSelect = false
          this.settings.inputDisabledStatus.disabledOriginalQty = false
          this.settings.inputDisabledStatus.disabledInboundTime = false
          this.settings.inputDisabledStatus.disabledQty = false
          this.settings.inputDisabledStatus.disabledPrice = false
          break
        case 'return': // 退货入库
          this.settings.inputDisabledStatus.disabledWarehouseSelect = false
          this.settings.inputDisabledStatus.disabledOriginalQty = false
          this.settings.inputDisabledStatus.disabledInboundTime = false
          this.settings.inputDisabledStatus.disabledQty = false
          this.settings.inputDisabledStatus.disabledPrice = false
          break
        case 'transfer': // 调拨入库
          this.settings.inputDisabledStatus.disabledWarehouseSelect = false
          this.settings.inputDisabledStatus.disabledOriginalQty = false
          this.settings.inputDisabledStatus.disabledInboundTime = false
          this.settings.inputDisabledStatus.disabledQty = false
          this.settings.inputDisabledStatus.disabledPrice = false
          break
        default:
          // 默认情况下禁用所有控件
          this.settings.inputDisabledStatus.disabledWarehouseSelect = true
          this.settings.inputDisabledStatus.disabledOriginalQty = true
          this.settings.inputDisabledStatus.disabledInboundTime = true
          this.settings.inputDisabledStatus.disabledQty = true
          this.settings.inputDisabledStatus.disabledPrice = true
          break
      }
    },
    /**
     * 仓库库区库位选择
     */
    handleWarehouseDialog () {
      this.popSettingsData.warehouseLocationBinDialog.visible = true
      this.popSettingsData.warehouseLocationBinDialog.data = {}
    },
    /**
     * 仓库库区库位选择确定
     */
    handleWarehouseLocationBinCloseOk (data) {
      this.popSettingsData.warehouseLocationBinDialog.visible = false
      // 设置仓库信息
      this.dataJson.tempJson.warehouse_id = data.warehouse_id
      this.dataJson.tempJson.warehouse_code = data.warehouse_code
      this.dataJson.tempJson.warehouse_name = data.warehouse_name
      this.dataJson.tempJson.location_id = data.location_id
      this.dataJson.tempJson.location_code = data.location_code
      this.dataJson.tempJson.location_name = data.location_name
      this.dataJson.tempJson.bin_id = data.bin_id
      this.dataJson.tempJson.bin_code = data.bin_code
      this.dataJson.tempJson.bin_name = data.bin_name
      // 构建显示文本
      let displayText = ''
      if (data.warehouse_name) {
        displayText += data.warehouse_name
      }
      if (data.location_name) {
        displayText += ' / ' + data.location_name
      }
      if (data.bin_name) {
        displayText += ' / ' + data.bin_name
      }
      this.dataJson.tempJson.warehouse_location_bin_display = displayText
    },
    /**
     * 仓库库区库位选择取消
     */
    handleWarehouseLocationBinCloseCancel () {
      this.popSettingsData.warehouseLocationBinDialog.visible = false
    },
    /**
     * 原发数量变更处理
     */
    handleOriginalQtyChange (val) {
      // 原发数量变更时的逻辑处理
    },
    /**
     * 入库数量变更处理
     */
    handleQtyChange (val) {
      // 入库数量变更时自动计算金额
      this.calculateAmount()
    },
    /**
     * 入库单价变更处理
     */
    handlePriceChange (val) {
      // 入库单价变更时自动计算金额
      this.calculateAmount()
    },
    /**
     * 计算金额
     */
    calculateAmount () {
      if (this.dataJson.tempJson.qty && this.dataJson.tempJson.price) {
        this.dataJson.tempJson.amount = this.dataJson.tempJson.qty * this.dataJson.tempJson.price
      } else {
        this.dataJson.tempJson.amount = null
      }
    },
    /**
     * 磅单文件上传成功处理
     */
    handleOneFileUploadSuccess (data) {
      this.dataJson.tempJson.one_file.push({
        fileName: data.file.name,
        url: data.response.data.url,
        timestamp: new Date().getTime()
      })
    },
    /**
     * 入库附件明细上传成功处理
     */
    handleTwoFileUploadSuccess (data) {
      this.dataJson.tempJson.two_file.push({
        fileName: data.file.name,
        url: data.response.data.url,
        timestamp: new Date().getTime()
      })
    },
    /**
     * 检验单上传成功处理
     */
    handleThreeFileUploadSuccess (data) {
      this.dataJson.tempJson.three_file.push({
        fileName: data.file.name,
        url: data.response.data.url,
        timestamp: new Date().getTime()
      })
    },
    /**
     * 货物照片上传成功处理
     */
    handleFourFileUploadSuccess (data) {
      this.dataJson.tempJson.four_file.push({
        fileName: data.file.name,
        url: data.response.data.url,
        timestamp: new Date().getTime()
      })
    },
    /**
     * 文件上传失败处理
     */
    handleFileError (error) {
      this.showErrorMsg('文件上传失败：' + error.message)
    },
    /**
     * 删除磅单文件
     */
    removeOneFile (url) {
      const index = this.dataJson.tempJson.one_file.findIndex(item => item.url === url)
      if (index !== -1) {
        this.dataJson.tempJson.one_file.splice(index, 1)
      }
    },
    /**
     * 删除入库附件明细
     */
    removeTwoFile (url) {
      const index = this.dataJson.tempJson.two_file.findIndex(item => item.url === url)
      if (index !== -1) {
        this.dataJson.tempJson.two_file.splice(index, 1)
      }
    },
    /**
     * 删除检验单
     */
    removeThreeFile (url) {
      const index = this.dataJson.tempJson.three_file.findIndex(item => item.url === url)
      if (index !== -1) {
        this.dataJson.tempJson.three_file.splice(index, 1)
      }
    },
    /**
     * 删除货物照片
     */
    removeFourFile (url) {
      const index = this.dataJson.tempJson.four_file.findIndex(item => item.url === url)
      if (index !== -1) {
        this.dataJson.tempJson.four_file.splice(index, 1)
      }
    },
    /**
     * 重置数据
     */
    resetDataJson () {
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)
    },
    /**
     * 重置表单
     */
    handleReset () {
      // 确认重置操作
      this.$confirm('确定要重置页面数据吗？重置后所有输入的数据将丢失。', '确认重置', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认重置',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 执行重置操作 - 调用初始化组件方法
        this.initComponent()
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
</style>
