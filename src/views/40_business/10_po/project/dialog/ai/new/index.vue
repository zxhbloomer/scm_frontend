<template>
  <div>
    <el-dialog
      v-if="listenVisible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      title="项目管理-AI新增"
      :visible="visible"
      :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
      :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
      :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="1200px"
      destroy-on-close
      top="5vh"
    >
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
            :content-style="contentStyle"
            :label-style="labelStyle"
            direction="horizontal"
            border
            style="padding-right: 10px;padding-left: 10px;"
          >
            <el-descriptions-item label="项目编号">
              系统自动生成
            </el-descriptions-item>

            <el-descriptions-item>
              <div
                slot="label"
                class="required-mark"
              >
                项目名称
              </div>
              <el-form-item
                prop="name"
                label-width="0"
              >
                <el-input
                  v-model.trim="dataJson.tempJson.name"
                  :maxlength="50"
                  show-word-limit
                  clearable
                  placeholder="请输入"
                />
              </el-form-item>
            </el-descriptions-item>

            <el-descriptions-item label="类型">
              采购业务
            </el-descriptions-item>

            <el-descriptions-item>
              <div
                slot="label"
                class="required-mark"
              >
                上游供应商
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

            <el-descriptions-item>
              <div
                slot="label"
                class="required-mark"
              >
                下游客户（主体企业）
              </div>
              <el-form-item
                prop="purchaser_id"
                label-width="0"
              >
                <input-search
                  v-model.trim="dataJson.tempJson.purchaser_name"
                  @onInputSearch="handleCustomerDialog"
                />
              </el-form-item>
            </el-descriptions-item>

            <el-descriptions-item label="融资主体">
              {{ dataJson.tempJson.financier_name }}
            </el-descriptions-item>

            <el-descriptions-item>
              <div
                slot="label"
              >
                运输方式
              </div>
              <el-form-item
                prop="delivery_type"
                label-width="0"
              >
                <radio-dict
                  v-model="dataJson.tempJson.delivery_type"
                  :value="dataJson.tempJson.delivery_type"
                  :para="CONSTANTS.DICT_B_PROJECT_DELIVERY_TYPE"
                  @change="handleTransportTypeChange"
                />
              </el-form-item>
            </el-descriptions-item>

            <el-descriptions-item label="交货地点" span="2">
              <el-input
                v-model.trim="dataJson.tempJson.delivery_location"
                :maxlength="200"
                show-word-limit
                clearable
                placeholder="请输入"
              />
            </el-descriptions-item>

            <el-descriptions-item label="备注" span="3">
              <el-input
                v-model.trim="dataJson.tempJson.remark"
                type="textarea"
                :rows="3"
                :maxlength="500"
                show-word-limit
                clearable
                placeholder="请输入"
              />
            </el-descriptions-item>

          </el-descriptions>
          <el-alert
            title="商品明细"
            type="info"
            :closable="false"
          />
          <el-button-group>
            <el-button
              type="primary"
              icon="el-icon-circle-plus-outline"
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
            height="200px"
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
            />
            <el-table-column
              show-overflow-tooltip
              min-width="150"
              prop="sku_code"
              label="商品编号"
            />
            <el-table-column
              show-overflow-tooltip
              min-width="130"
              prop="goods_name"
              label="商品名称"
            />
            <el-table-column
              show-overflow-tooltip
              min-width="130"
              prop="sku_name"
              label="规格"
            />
            <el-table-column
              show-overflow-tooltip
              min-width="150"
              prop="qty"
              label="合同数量"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.qty == null? '-' : formatNumber(scope.row.qty,true,4) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="150"
              prop="price"
              label="单价（含税）"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.price == null? '': formatCurrency(scope.row.price, true) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="150"
              prop="amount"
              label="金额"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.amount == null?'': formatCurrency(scope.row.amount,true) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="90"
              prop="tax_rate"
              label="税率（%）"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.tax_rate == null? '': scope.row.tax_rate }}%
              </template>
            </el-table-column>

            <el-table-column
              show-overflow-tooltip
              min-width="150"
              prop="tax_amount"
              label="税额"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.tax_amount == null? '': formatCurrency(scope.row.tax_amount,true) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="150"
              prop="origin"
              label="产地"
            >
              <template v-slot="scope">
                {{ scope.row.origin == null ? '': scope.row.origin }}
              </template>
            </el-table-column>
          </el-table>
          <el-alert
            title="财务信息"
            type="info"
            :closable="false"
          />
          <el-descriptions
            title=""
            :column="3"
            :content-style="contentStyle"
            :label-style="labelStyle"
            direction="horizontal"
            border
            style="padding-right: 10px;padding-left: 10px;"
          >
            <el-descriptions-item label="付款方式">
              {{ dataJson.tempJson.payment_method_name == null?'-':dataJson.tempJson.payment_method_name }}
            </el-descriptions-item>

            <el-descriptions-item label="是否有账期/天数">
              <numeric
                v-model.trim="dataJson.tempJson.payment_days"
                :decimal-places="0"
                :currency-symbol="''"
                placeholder="请输入"
              />
            </el-descriptions-item>

            <el-descriptions-item label="项目周期">
              <numeric
                v-model.trim="dataJson.tempJson.project_cycle"
                :decimal-places="0"
                :currency-symbol="''"
                placeholder="请输入"
              />
            </el-descriptions-item>

            <el-descriptions-item label="融资额度">
              <numeric
                v-model.trim="dataJson.tempJson.amount"
                :decimal-places="2"
                :currency-symbol="'¥'"
                placeholder="请输入"
              />
            </el-descriptions-item>

            <el-descriptions-item label="费率">
              <numeric
                v-model.trim="dataJson.tempJson.rate"
                :decimal-places="2"
                :currency-symbol="''"
                placeholder="请输入"
              />
            </el-descriptions-item>

            <el-descriptions-item />
          </el-descriptions>

          <el-alert
            title="项目说明"
            type="info"
            :closable="false"
          />
          <el-descriptions
            title=""
            :column="1"
            :content-style="contentStyle2"
            :label-style="labelStyle2"
            direction="horizontal"
            border
            style="padding-right: 10px;padding-left: 10px;"
          >

            <el-descriptions-item label="项目说明">
              <el-input
                v-model.trim="dataJson.tempJson.project_remark"
                :maxlength="500"
                show-word-limit
                clearable
                placeholder="请输入"
                type="textarea"
              />
            </el-descriptions-item>

          </el-descriptions>

          <el-alert
            title="项目附件材料"
            type="info"
            :closable="false"
          />
          <el-descriptions
            title=""
            :column="1"
            :label-style="fileLabelStyle"
            :content-style="contentStyle"
            direction="horizontal"
            border
            style="padding-right: 10px;padding-left: 10px;"
          >
            <el-descriptions-item label="附件材料">
              <el-row>
                <Simple-upload-mutil-file
                  :accept="'*'"
                  @upload-success="handleUploadFileSuccess"
                  @upload-error="handleUploadFileError"
                />
              </el-row>
              <el-row style="display: flex;flex-wrap: wrap;">
                <el-col
                  v-for="(item, i) in dataJson.doc_att"
                  :key="i"
                  :offset="0"
                  :span="4"
                >
                  <previewCard
                    :file-name="item.fileName"
                    :url="item.url"
                    :time="item.timestamp"
                    @removeFile="removeFile"
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
          plain
          :disabled="settings.loading"
          @click="handleCancel()"
        >取消</el-button>
        <el-button
          type="primary"
          :disabled="settings.loading"
          @click="startProcess()"
        >提交审批并保存</el-button>
      </div>
    </el-dialog>

    <!--供应商-->
    <supplier-dialog
      v-if="popSettingsData.supplierDialogData.visible"
      :visible="popSettingsData.supplierDialogData.visible"
      :data="popSettingsData.supplierDialogData.data"
      :title="'供应商选择'"
      @closeMeOk="handleSupplierCloseOk"
      @closeMeCancel="handleSupplierCloseCancel"
    />
    <!--下游客户-->
    <customer-dialog
      v-if="popSettingsData.purchaserDialogData.visible"
      :visible="popSettingsData.purchaserDialogData.visible"
      :data="popSettingsData.purchaserDialogData.data"
      :title="'客户选择'"
      @closeMeOk="handleCustomerCloseOk"
      @closeMeCancel="handleCustomerCloseCancel"
    />

    <goods-dialog
      v-if="popSettingsData.goodsDialog.visible"
      :visible="popSettingsData.goodsDialog.visible"
      :data="popSettingsData.goodsDialog.data"
      @closeMeOk="handleGoodsCloseOk"
      @closeMeCancel="handleGoodsCloseCancel"
    />

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
  height: calc(80vh - 160px);
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
import InputSearch from '@/components/40_input/inputSearch/index.vue'
import RadioDict from '@/components/00_dict/redio/index.vue'
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { insertApi, validateApi } from '@/api/40_business/project/project'
import SupplierDialog from '@/views/20_master/enterprise/dialog/selecttablelist/supplier/counterparty/index.vue'
import CustomerDialog from '@/views/20_master/enterprise/dialog/selecttablelist/customer/system_enterprise/index.vue'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import previewCard from '@/components/50_preview_card/preview_card.vue'
import numeric from '@/components/40_input/numeric/index.vue'
import constants_dict from '@/common/constants/constants_dict'

import goodsDialog from '@/views/00_platform/dialog/sku/new/goodsdialog.vue'

import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  components: { BpmDialog, goodsDialog, InputSearch, RadioDict, CustomerDialog, SupplierDialog, previewCard, SimpleUploadMutilFile, numeric },
  directives: { elDragDialog },
  mixins: [],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    aiData: {
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
      labelStyle2: {
        width: '10.7%',
        'text-align': 'right'
      },
      contentStyle2: {
        width: '70%'
      },
      fileLabelStyle: {
        width: '2.3%',
        'text-align': 'right'
      },

      popSettingsData: {
        // 供应商
        supplierDialogData: {
          visible: false,
          data: {},
          selectedDataJson: {
            id: null
          }
        },
        // 客户
        purchaserDialogData: {
          visible: false,
          data: {},
          selectedDataJson: {
            id: null
          }
        },
        // 商品查询框
        goodsDialog: {
          visible: false,
          data: {},
          selectedDataJson: {
            id: null
          }
        },
        // 审批流程（serial_type不硬编码，init时从aiData赋值）
        sponsorDialog: {
          visible: false,
          form_data: { },
          serial_type: '',
          selectedDataJson: {
            id: null
          },
          initial_process: null,
          process_users: {}
        }
      },
      dataJson: {
        detailListData: [],
        doc_att: [],
        doc_att_file: [],
        doc_att_files: [],

        searchForm: {
          reset: null
        },
        tempJson: {
          id: null,
          type: '1',
          name: '',
          unit_id: null,
          unit_name: null,
          supplier_id: null,
          supplier_code: null,
          supplier_name: null,
          purchaser_id: null,
          purchaser_code: null,
          purchaser_name: null,
          financier_name: '-',
          detailListData: [],
          delivery_type: null
        },
        inputSettings: {
          maxLength: {
            remark: 100
          }
        }
      },
      settings: {
        loading: true,
        duration: 4000,
        btnTableDisabledStatus: {
          disabledInsert: true,
          disabledDelete: true
        },
        rules: {
          name: [
            { required: true, message: '请输入项目名称', trigger: 'change' },
            { max: 50, message: '项目名称长度不能超过50个字符', trigger: 'blur' }
          ],
          supplier_name: [
            { required: true, message: '请选择上游供应商', trigger: 'change' }
          ],
          purchaser_name: [
            { required: true, message: '请选择下游客户（主体企业）', trigger: 'change' }
          ],
          delivery_location: [
            { max: 200, message: '交货地点长度不能超过200个字符', trigger: 'blur' }
          ],
          remark: [
            { max: 500, message: '备注长度不能超过500个字符', trigger: 'blur' }
          ],
          project_remark: [
            { max: 500, message: '项目说明长度不能超过500个字符', trigger: 'blur' }
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
  watch: {},
  created () {
    this.init()
  },
  mounted () {
  },
  destroyed () {
  },
  methods: {
    init () {
      if (this.aiData) {
        // 1. 读取控制参数：审批流类型
        if (this.aiData._bpm_serial_type) {
          this.popSettingsData.sponsorDialog.serial_type = this.aiData._bpm_serial_type
        }
        // 2. 自动预填业务字段（非_开头的字段映射到tempJson同名字段）
        Object.keys(this.aiData).forEach(key => {
          if (!key.startsWith('_') && this.dataJson.tempJson.hasOwnProperty(key)) {
            this.dataJson.tempJson[key] = this.aiData[key]
          }
        })
      }
      this.settings.loading = false
    },
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    doInsert () {
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)
          tempData.initial_process = this.popSettingsData.sponsorDialog.initial_process
          tempData.form_data = this.popSettingsData.sponsorDialog.form_data
          tempData.process_users = this.popSettingsData.sponsorDialog.process_users

          this.settings.loading = true
          insertApi(tempData)
            .then(
              _data => {
                this.closeLoading()
                this.$emit('closeMeOk', _data.data)
                setTimeout(() => {
                  EventBus.$emit(this.EMITS.EMIT_BUS_PROJECT_NEW_OK, _data.data)
                }, 1000)
                this.$notify({
                  title: '新增成功',
                  message: _data.data.message,
                  type: 'success',
                  duration: this.settings.duration
                })
              },
              _error => {
                this.settings.loading = false
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
        } else {
          this.settings.loading = false
        }
      })
    },
    // 供应商
    handleSupplierDialog () {
      this.popSettingsData.supplierDialogData.visible = true
      this.popSettingsData.supplierDialogData.data.status = constants_dict.DICT_M_ENTERPRISE_STATUS_TWO
      this.popSettingsData.supplierDialogData.data.type_ids = [constants_dict.DICT_M_ENTERPRISE_TYPE_TWO]
    },
    handleSupplierCloseOk (val) {
      this.popSettingsData.supplierDialogData.selectedDataJson = val
      this.dataJson.tempJson.supplier_id = val.id
      this.dataJson.tempJson.supplier_code = val.code
      this.dataJson.tempJson.supplier_name = val.name
      this.popSettingsData.supplierDialogData.visible = false
    },
    handleSupplierCloseCancel () {
      this.popSettingsData.supplierDialogData.visible = false
    },
    // 下游客户（主体企业）
    handleCustomerDialog () {
      this.popSettingsData.purchaserDialogData.visible = true
      this.popSettingsData.purchaserDialogData.data.status = constants_dict.DICT_M_ENTERPRISE_STATUS_TWO
      this.popSettingsData.purchaserDialogData.data.type_ids = [constants_dict.DICT_M_ENTERPRISE_TYPE_ONE]
    },
    handleCustomerCloseOk (val) {
      this.popSettingsData.purchaserDialogData.selectedDataJson = val
      this.dataJson.tempJson.purchaser_id = val.id
      this.dataJson.tempJson.purchaser_code = val.code
      this.dataJson.tempJson.purchaser_name = val.name
      this.popSettingsData.purchaserDialogData.visible = false
    },
    handleCustomerCloseCancel () {
      this.popSettingsData.purchaserDialogData.visible = false
    },

    handleUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.doc_att.push(res.response.data)
      this.dataJson.doc_att_file.push(res.response.data.url)
      this.dataJson.tempJson.doc_att_files = this.dataJson.doc_att
    },
    handleUploadFileError () {
      console.debug('文件上传失败')
      this.$notify({
        title: '上传错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
      })
    },
    removeFile (val) {
      const _index = this.dataJson.doc_att_file.lastIndexOf(val)
      this.dataJson.doc_att.splice(_index, 1)
      this.dataJson.doc_att_file.splice(_index, 1)
      this.dataJson.tempJson.doc_att_files = this.dataJson.doc_att
    },

    // 商品新增
    handleGoodsInsert () {
      this.popSettingsData.goodsDialog.visible = true
      this.popSettingsData.goodsDialog.data = {}
    },
    // 商品删除
    handleGoodsDelete () {
      if (this.dataJson.rowIndex === null) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.$confirm('是否确认删除该条数据', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        this.dataJson.tempJson.detailListData.splice(this.popSettingsData.goodsDialog.rowIndex, 1)
      }).catch(action => {
      })
    },
    handleGoodsCloseOk (val) {
      this.popSettingsData.goodsDialog.visible = false
      this.dataJson.tempJson.detailListData.push(val.data)
    },
    handleGoodsCloseCancel () {
      this.popSettingsData.goodsDialog.visible = false
    },
    handleRowClick (row) {
      this.popSettingsData.goodsDialog.rowIndex = this.getRowIndex(row)
    },
    getRowIndex (row) {
      const _index = this.dataJson.tempJson.detailListData.lastIndexOf(row)
      return _index
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row)
      this.dataJson.currentJson.index = this.getRowIndex(row)
      this.settings.btnTableDisabledStatus.disabledInsert = false
      this.settings.btnTableDisabledStatus.disabledDelete = false
    },

    // 审批流取消
    handleBpmDialogCancel () {
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
     * 校验数据 获取审批流程
     */
    startProcess () {
      this.showLoading('正在保存，请稍后...')
      const tempData = deepCopy(this.dataJson.tempJson)
      tempData.check_type = constants_para.INSERT_CHECK_TYPE

      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          validateApi(tempData).then(_data => {
            if (_data.success) {
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
      getFlowProcessApi({ 'serial_type': this.popSettingsData.sponsorDialog.serial_type })
        .then((rsp) => {
          if (rsp.data === null) {
            this.$message.error('未找到审批流程，请联系管理员')
          } else {
            this.popSettingsData.sponsorDialog.form_data = { }
            this.popSettingsData.sponsorDialog.visible = true
          }
        }).catch((err) => {
          this.closeLoading()
          this.$message.error(err)
        })
    },

    handleTransportTypeChange (val) {
      this.dataJson.tempJson.delivery_type = val
    }
  }
}
</script>
