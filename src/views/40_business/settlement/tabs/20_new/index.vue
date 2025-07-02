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
          title="结算信息"
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

          <el-descriptions-item label="系统编号">
            {{ dataJson.tempJson.code == null || dataJson.tempJson.code === ''?'系统自动生成':dataJson.tempJson.code }}
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              结算编号
            </div>
            <el-form-item
              prop="settlement_code"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.settlement_code"
                clearable
                placeholder="请输入"
                :maxlength="dataJson.inputSettings.maxLength.settlement_code"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              结算类型
            </div>
            <el-form-item
              prop="settlement_type"
              label-width="0"
            >
              <radio-dict
                v-model="dataJson.tempJson.settlement_type"
                :value="dataJson.tempJson.settlement_type"
                :para="CONSTANTS.DICT_B_PO_SETTLEMENT_TYPE"
                @change="handleSettlementTypeChange"
              />
            </el-form-item>
          </el-descriptions-item>

          <!--          供应商-->
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              供应商
            </div>
            <el-form-item
              prop="supplier_name"
              label-width="0"
            >
              <input-search
                v-model.trim="dataJson.tempJson.supplier_name"
                @onInputSearch="handleSupplierDialog"
              />
            </el-form-item>
          </el-descriptions-item>

          <!--主体企业-->
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              主体企业
            </div>
            <el-form-item
              prop="purchaser_name"
              label-width="0"
            >
              <input-search
                v-model.trim="dataJson.tempJson.purchaser_name"
                @onInputSearch="handlePurchaserDialog"
              />
            </el-form-item>
          </el-descriptions-item>

          <!--          结算方式-->
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              结算方式
            </div>
            <el-form-item
              prop="settle_type"
              label-width="0"
            >
              <radio-dict
                v-model="dataJson.tempJson.settle_type"
                :value="dataJson.tempJson.settle_type"
                :para="CONSTANTS.DICT_B_PO_SETTLEMENT_SETTLE_TYPE"
                @change="handleSettleTypeChange"
              />
            </el-form-item>
          </el-descriptions-item>

          <!--          结算单据类型-->
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              结算单据类型
            </div>
            <el-form-item
              prop="bill_type"
              label-width="0"
            >
              <radio-dict
                v-model="dataJson.tempJson.bill_type"
                :value="dataJson.tempJson.bill_type"
                :para="CONSTANTS.DICT_B_PO_SETTLEMENT_BILL_TYPE"
                @change="handleBillTypeChange"
              />
            </el-form-item>
          </el-descriptions-item>

          <!--结算日期-->
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              结算日期
            </div>
            <el-form-item
              prop="settlement_date"
              label-width="0"
            >
              <el-date-picker
                v-model="dataJson.tempJson.settlement_date"
                value-format="yyyy-MM-dd"
                type="date"
                clearable
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-descriptions-item>

          <!--结算金额-->
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              结算金额
            </div>
            <el-form-item
              prop="settlement_amount"
              label-width="0"
            >
              <numeric
                v-model="dataJson.tempJson.settlement_amount"
                :positive-percentage="true"
                :decimal-places="4"
                :minimum-value="0"
                :maximum-value="10000000000"
                style="width: 100%"
                @change.native="handleAmountChange"
              />
            </el-form-item>
          </el-descriptions-item>

        </el-descriptions>

        <!--备注信息-->
        <el-alert
          title="备注信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          title=""
          :column="1"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item label="备注">
            <el-form-item
              prop="remark"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.remark"
                type="textarea"
                clearable
                show-word-limit
                placeholder="请输入"
                :maxlength="500"
              />
            </el-form-item>
          </el-descriptions-item>
        </el-descriptions>

        <!--附件信息-->
        <el-alert
          title="附件信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          title=""
          :column="1"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item label="文档附件">
            <el-form-item
              prop="doc_att_files"
              label-width="0"
            >
              <Simple-upload-mutil-file
                :accept="'*'"
                @upload-success="handleOtherUploadFileSuccess"
                @upload-error="handleFileError"
              />
              <div
                v-for="item in dataJson.doc_att"
                :key="item.fileName"
                style="display: inline-block;margin:5px 5px 5px 0;"
              >
                <previewCard
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeOtherFile"
                />
              </div>
            </el-form-item>
          </el-descriptions-item>
        </el-descriptions>

      </el-form>

      <!--页面底部操作栏-->
      <div class="btn-line">
        <el-button
          @click="handleCancel"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="settings.loading"
          @click="startProcess"
        >
          保存
        </el-button>
      </div>

    </div>

    <!-- 供应商选择对话框 -->
    <el-dialog
      :visible.sync="popSettingsData.supplierDialogData.visible"
      title="供应商选择"
      width="90%"
      append-to-body
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      center
      @close="handleSupplierCloseCancel"
    >
      <counterparty-supplier-dialog
        :data="popSettingsData.supplierDialogData.data"
        :edit-status="popSettingsData.supplierDialogData.editStatus"
        @closeMeCancel="handleSupplierCloseCancel"
        @closeMeOk="handleSupplierCloseOk"
      />
    </el-dialog>

    <!-- 主体企业选择对话框 -->
    <el-dialog
      :visible.sync="popSettingsData.purchaserDialogData.visible"
      title="主体企业选择"
      width="90%"
      append-to-body
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      center
      @close="handlePurchaserCloseCancel"
    >
      <system-enterprise-customer-dialog
        :data="popSettingsData.purchaserDialogData.data"
        :edit-status="popSettingsData.purchaserDialogData.editStatus"
        @closeMeCancel="handlePurchaserCloseCancel"
        @closeMeOk="handlePurchaserCloseOk"
      />
    </el-dialog>

    <!-- 审批流程对话框 -->
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
.required-mark {
  position: relative;
}

.required-mark::before {
  content: "*";
  color: #f56c6c;
  margin-right: 4px;
}

.edit-container {
  padding: 20px;
}

.btn-line {
  padding: 20px 0;
  text-align: center;
  border-top: 1px solid #dcdfe6;
  margin-top: 20px;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import InputSearch from '@/components/40_input/inputSearch'
import numeric from '@/components/40_input/numeric'
import RadioDict from '@/components/00_dict/redio'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'
import counterpartySupplierDialog from '@/views/20_master/enterprise/dialog/selectgrid/counterparty/supplier'
import systemEnterpriseCustomerDialog from '@/views/20_master/enterprise/dialog/selectgrid/system_enterprise/customer'
import {
  insertApi,
  validateApi
} from '@/api/40_business/settlement/settlement'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import constants_para from '@/common/constants/constants_para'
import constants_dict from '@/common/constants/constants_dict'
import { EventBus } from '@/common/eventbus/eventbus'
import deepCopy from 'deep-copy'

export default {
  components: {
    InputSearch,
    numeric,
    RadioDict,
    SimpleUploadMutilFile,
    PreviewCard,
    BpmDialog,
    counterpartySupplierDialog,
    systemEnterpriseCustomerDialog
  },
  directives: { elDragDialog },
  props: {
    data: {
      type: Object,
      default: null
    },
    editStatus: {
      type: String,
      default: null
    },
    headInfo: {
      type: String,
      default: null
    },
    canEdit: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      labelStyle: {
        'font-weight': 'bold'
      },
      contentStyle: {
        'word-break': 'break-word'
      },
      // 附件相关
      dataJson: {
        tempJson: {
          id: null,
          code: '', // 系统编号
          settlement_code: '', // 结算编号
          settlement_type: this.CONSTANTS.DICT_B_PO_SETTLEMENT_TYPE_ZERO, // 结算类型
          supplier_id: '', // 供应商ID
          supplier_code: '', // 供应商编码
          supplier_name: '', // 供应商名称
          purchaser_id: '', // 主体企业ID
          purchaser_code: '', // 主体企业编码
          purchaser_name: '', // 主体企业名称
          settle_type: '', // 结算方式
          bill_type: '', // 结算单据类型
          settlement_date: '', // 结算日期
          settlement_amount: 0, // 结算金额
          remark: '', // 备注
          doc_att_files: [] // 文档附件
        },
        inputSettings: {
          maxLength: {
            settlement_code: 100,
            remark: 500
          }
        },
        // 附件上传
        doc_att: [],
        doc_att_file: []
      },
      // 弹窗设置数据
      popSettingsData: {
        // 供应商选择
        supplierDialogData: {
          visible: false,
          editStatus: constants_para.STATUS_NEW,
          data: {},
          selectedDataJson: null
        },
        // 主体企业选择
        purchaserDialogData: {
          visible: false,
          editStatus: constants_para.STATUS_NEW,
          data: {},
          selectedDataJson: null
        },
        // 审批流程
        sponsorDialog: {
          visible: false,
          serial_type: 'settlement_new', // 审批流程类型
          form_data: {},
          initial_process: null,
          process_users: []
        }
      },
      // 页面设置
      settings: {
        // 校验规则
        rules: {
          settlement_code: [
            { required: true, message: '请输入结算编号', trigger: 'blur' }
          ],
          settlement_type: [
            { required: true, message: '请选择结算类型', trigger: 'change' }
          ],
          supplier_name: [
            { required: true, message: '请选择供应商', trigger: 'blur' }
          ],
          purchaser_name: [
            { required: true, message: '请选择主体企业', trigger: 'blur' }
          ],
          settle_type: [
            { required: true, message: '请选择结算方式', trigger: 'change' }
          ],
          bill_type: [
            { required: true, message: '请选择结算单据类型', trigger: 'change' }
          ],
          settlement_date: [
            { required: true, message: '请选择结算日期', trigger: 'change' }
          ],
          settlement_amount: [
            { required: true, message: '请输入结算金额', trigger: 'blur' },
            { type: 'number', message: '结算金额必须为数字', trigger: 'blur' }
          ]
        },
        // loading 状态
        loading: false,
        duration: 4000
      }
    }
  },
  // 监听器
  watch: {
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
    // 初始化数据
    this.initData()
  },
  methods: {
    /**
     * 初始化数据
     */
    initData () {
      // 如果有传入数据，则进行编辑
      if (this.data && this.data.id) {
        this.dataJson.tempJson = deepCopy(this.data)
        if (this.dataJson.tempJson.doc_att_files) {
          this.dataJson.doc_att = this.dataJson.tempJson.doc_att_files
        }
      }
    },

    /**
     * 结算类型变更
     */
    handleSettlementTypeChange (val) {
      this.dataJson.tempJson.settlement_type = val
    },

    /**
     * 结算方式选择
     */
    handleSettleTypeChange (val) {
      this.dataJson.tempJson.settle_type = val
    },

    /**
     * 结算单据类型选择
     */
    handleBillTypeChange (val) {
      this.dataJson.tempJson.bill_type = val
    },

    /**
     * 金额变更处理
     */
    handleAmountChange () {
      // 金额变更时的处理逻辑
    },

    /**
     * 供应商选择
     */
    handleSupplierDialog () {
      this.popSettingsData.supplierDialogData.visible = true
      this.popSettingsData.supplierDialogData.data.status = constants_dict.DICT_M_ENTERPRISE_STATUS_TWO
      this.popSettingsData.supplierDialogData.data.type_ids = [constants_dict.DICT_M_ENTERPRISE_TYPE_TWO]
    },

    /**
     * 供应商选择确定
     */
    handleSupplierCloseOk (val) {
      this.popSettingsData.supplierDialogData.selectedDataJson = val
      this.dataJson.tempJson.supplier_id = val.id
      this.dataJson.tempJson.supplier_code = val.code
      this.dataJson.tempJson.supplier_name = val.name
      this.popSettingsData.supplierDialogData.visible = false
    },

    /**
     * 供应商选择取消
     */
    handleSupplierCloseCancel () {
      this.popSettingsData.supplierDialogData.visible = false
    },

    /**
     * 主体企业选择
     */
    handlePurchaserDialog () {
      this.popSettingsData.purchaserDialogData.visible = true
      this.popSettingsData.purchaserDialogData.data.status = constants_dict.DICT_M_ENTERPRISE_STATUS_TWO
    },

    /**
     * 主体企业选择确定
     */
    handlePurchaserCloseOk (val) {
      this.popSettingsData.purchaserDialogData.selectedDataJson = val
      this.dataJson.tempJson.purchaser_id = val.id
      this.dataJson.tempJson.purchaser_code = val.code
      this.dataJson.tempJson.purchaser_name = val.name
      this.popSettingsData.purchaserDialogData.visible = false
    },

    /**
     * 主体企业选择取消
     */
    handlePurchaserCloseCancel () {
      this.popSettingsData.purchaserDialogData.visible = false
    },

    /**
     * 其他附件上传成功
     */
    handleOtherUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.doc_att.push(res.response.data)
      this.dataJson.doc_att_file.push(res.response.data.url)
      this.dataJson.tempJson.doc_att_files = this.dataJson.doc_att
    },

    /**
     * 删除其他附件
     */
    removeOtherFile (val) {
      // 获取下标
      const _index = this.dataJson.doc_att_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.doc_att.splice(_index, 1)
      this.dataJson.doc_att_file.splice(_index, 1)
      this.dataJson.tempJson.doc_att_files = this.dataJson.doc_att
    },

    /**
     * 文件上传失败
     */
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
     * 校验数据并获取审批流程
     */
    startProcess () {
      this.settings.loading = true
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
              this.settings.loading = false
              this.$notify({
                title: '校验失败',
                message: _data.data.message,
                type: 'error',
                duration: this.settings.duration
              })
            }
          }).catch(error => {
            console.log('校验出错', error)
            this.settings.loading = false
          })
        } else {
          this.settings.loading = false
        }
      })
    },

    /**
     * 获取审批流程
     */
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

    /**
     * 审批流弹窗取消
     */
    handleBpmDialogCancel () {
      this.popSettingsData.sponsorDialog.visible = false
      this.settings.loading = false
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
     * 执行新增
     */
    doInsert () {
      const tempData = deepCopy(this.dataJson.tempJson)
      // 添加审批流程数据
      tempData.initial_process = this.popSettingsData.sponsorDialog.initial_process
      tempData.process_users = this.popSettingsData.sponsorDialog.process_users

      insertApi(tempData).then(response => {
        this.settings.loading = false
        this.$notify({
          title: '成功',
          message: '采购结算新增成功',
          type: 'success',
          duration: this.settings.duration
        })
        // 发送事件通知列表页更新
        EventBus.$emit(this.EMITS.EMIT_MST_SETTLEMENT_NEW_OK, response.data)
        // 返回列表页
        this.$emit('closeMeOk')
      }).catch(error => {
        this.settings.loading = false
        this.showErrorMsg(error)
      })
    },

    /**
     * 取消
     */
    handleCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>
