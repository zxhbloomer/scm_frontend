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

          <el-descriptions-item label="应收账款编号">
            {{ dataJson.tempJson.code }}
          </el-descriptions-item>

          <el-descriptions-item />
          <el-descriptions-item />

          <el-descriptions-item label="主体企业（收款方）">
            <el-form-item
              prop="seller_name"
              label-width="0"
            >
              {{ dataJson.tempJson.seller_name }}

              <!--              <input-search-->
              <!--                v-model.trim="dataJson.tempJson.seller_name"-->
              <!--                @onInputSearch="handleSellerDialog"-->
              <!--              />-->
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="客户（付款方）">
            <el-form-item
              prop="customer_name"
              label-width="0"
            >
              {{ dataJson.tempJson.customer_name }}

              <!--              <input-search-->
              <!--                v-model.trim="dataJson.tempJson.customer_name"-->
              <!--                @onInputSearch="handleCustomerDialog"-->
              <!--              />-->
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="收款状态">
            {{ dataJson.tempJson.receive_status_name == null ? '-': dataJson.tempJson.receive_status_name }}
          </el-descriptions-item>

          <el-descriptions-item label="备注" span="3">
            <el-input
              v-model.trim="dataJson.tempJson.remark"
              clearable
              :maxlength="dataJson.inputSettings.maxLength.remark"
            />
          </el-descriptions-item>

          <el-descriptions-item label="收款附件材料" span="3">
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col :span="1">
                <Simple-upload-mutil-file
                  :accept="'*'"
                  @upload-success="handleReceiveUploadFileSuccess"
                  @upload-error="handleFileError"
                />
              </el-col>
              <el-col
                v-for="(item, i) in dataJson.receive_doc_att"
                :key="i"
                :offset="1"
                :span="3"
              >
                <PreviewCard
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeReceiveFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>

        </el-descriptions>
        <el-alert
          title="业务单据信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          title=""
          :column="2"
          :label-style="twoLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="申请收款总金额">
            {{ dataJson.tempJson.receivable_amount == null ? '-': formatCurrency(dataJson.tempJson.receivable_amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="已收款总金额">
            {{ dataJson.tempJson.received_amount == null? '-': formatCurrency(dataJson.tempJson.received_amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="未收款总金额">
            {{ dataJson.tempJson.unreceive_amount == null? '-': formatCurrency(dataJson.tempJson.unreceive_amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="收款中金额">
            {{ dataJson.tempJson.receiving_amount == null? '-': formatCurrency(dataJson.tempJson.receiving_amount, true) }}
          </el-descriptions-item>
        </el-descriptions>
        <el-table
          ref="multipleTable"
          v-loading="settings.loading"
          :data="dataJson.tempJson.soOrderListData"
          :element-loading-text="'正在拼命加载中...'"
          element-loading-background="rgba(255, 255, 255, 0.5)"
          stripe
          border
          fit
          highlight-current-row
          :default-sort="{prop: 'u_time', order: 'descending'}"
          style="width: calc(100% - 20px )"
          height="200px"
          @row-click="handleSoOrderRowClick"
          @current-change="handleSoOrderCurrentChange"
        >
          <el-table-column
            type="index"
            width="45"
            label="No"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="140"
            label="合同编号｜订单编号"
            align="left"
          >
            <template v-slot="scope">
              <div style="line-height: 1.2;">
                <div>{{ scope.row.so_contract_code || '-' }}</div>
                <div>{{ scope.row.so_order_code || '-' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="so_goods"
            label="商品"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="qty_total"
            label="总销售数量"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="amount_total"
            label="订单总金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.amount_total == null? '-' : formatCurrency(scope.row.amount_total,true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="so_advance_receive_amount"
            label="预收款金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.so_advance_receive_amount == null? '': formatCurrency(scope.row.so_advance_receive_amount, true) }}
            </template>
          </el-table-column>

          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="so_can_advance_receive_amount"
            label="可申请预收款金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.so_can_advance_receive_amount == null? '': formatCurrency(scope.row.so_can_advance_receive_amount, true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="200"
            prop="order_amount"
            label="本次申请金额"
            align="right"
          >
            <template v-slot="scope">
              <div style="display: flex; align-items: center;">
                <numeric
                  v-model="scope.row.order_amount"
                  :decimal-places="2"
                  :currency-symbol="'¥'"
                  style="flex: 1; margin-right: 8px;"
                  @change.native="handleSoOrderCheck(scope.row)"
                />
                <el-button
                  size="mini"
                  type="primary"
                  @click="handleFullAmountApply(scope.row)"
                >
                  全额申请
                </el-button>
              </div>
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

        <el-alert
          title="收款信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          title=""
          :column="1"
          :label-style="threeLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="收款总金额">
            {{ dataJson.tempJson.detail_receivable_amount == null ? '-': formatCurrency(dataJson.tempJson.detail_receivable_amount, true) }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="tour-three">
          <el-button-group>
            <el-button
              :disabled="true"
              type="primary"
              icon="el-icon-circle-plus-outline"
              :loading="settings.loading"
              @click="handleBankInsert"
            >添加</el-button>
            <el-button
              :disabled="true"
              type="primary"
              icon="el-icon-circle-close"
              :loading="settings.loading"
              @click="handleBankDelete"
            >删除</el-button>
          </el-button-group>
        </div>
        <el-table
          ref="multipleTable"
          v-loading="settings.loading"
          :data="dataJson.tempJson.bankListData"
          :element-loading-text="'正在拼命加载中...'"
          element-loading-background="rgba(255, 255, 255, 0.5)"
          stripe
          border
          fit
          highlight-current-row
          :default-sort="{prop: 'u_time', order: 'descending'}"
          style="width: calc(100% - 20px )"
          height="200px"
          @row-click="handleBankRowClick"
          @current-change="handleBankCurrentChange"
        >
          <el-table-column
            type="index"
            width="45"
            label="No"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="name"
            label="收款账户名"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="bank_name"
            label="开户行"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="account_number"
            label="银行账号"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="bank_type_name"
            label="类型"
            align="left"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="200"
            prop="receivable_amount"
            label="收款金额"
            align="right"
          >
            <template v-slot="scope">
              <div style="display: flex; align-items: center;">
                <numeric
                  v-model="scope.row.receivable_amount"
                  :decimal-places="2"
                  :currency-symbol="'¥'"
                  style="flex: 1; margin-right: 8px;"
                  @input="handleReceivableAmountChange"
                />
                <el-button
                  size="mini"
                  type="primary"
                  @click="handleFullReceiveApply(scope.row)"
                >
                  全额收款
                </el-button>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="remark"
            label="备注"
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

      <!-- 隐藏跳过指引按钮 -->
      <!--
      <el-checkbox
        v-model="skipTourGuide"
        class="skip-tour-checkbox"
        @change="handleSkipTourGuideChange"
      >跳过指引</el-checkbox>
      -->
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

    <!--客户-->
    <customer-dialog
      v-if="popSettingsData.customerDialogData.visible"
      :visible="popSettingsData.customerDialogData.visible"
      :data="popSettingsData.customerDialogData.data"
      :title="'客户选择'"
      @closeMeOk="handleCustomerCloseOk"
      @closeMeCancel="handleCustomerCloseCancel"
    />

    <!--主体企业-->
    <seller-dialog
      v-if="popSettingsData.sellerDialogData.visible"
      :visible="popSettingsData.sellerDialogData.visible"
      :data="popSettingsData.sellerDialogData.data"
      :title="'主体企业选择'"
      @closeMeOk="handleSellerCloseOk"
      @closeMeCancel="handleSellerCloseCancel"
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

    <!--销售订单-列表弹窗-->
    <soorder_list_template
      v-if="popSettingsData.soOrderDialog.visible"
      :visible="popSettingsData.soOrderDialog.visible"
      :data="popSettingsData.soOrderDialog.data"
      title="添加关联单-销售订单"
      @closeMeOk="handleSoOrderCloseOk"
      @closeMeCancel="handleSoOrderCloseCancel"
    />

    <!--(关联单号)销售订单-列表弹窗-->
    <soorder_list_template
      v-if="popSettingsData.soOrderFountDialog.visible"
      :visible="popSettingsData.soOrderFountDialog.visible"
      :data="popSettingsData.soOrderFountDialog.data"
      title="添加关联单-销售订单"
      @closeMeOk="handleSoOrderFountCloseOk"
      @closeMeCancel="handleSoOrderFountCloseCancel"
    />

    <!--企业银行账户-弹窗-->
    <bank_list_template
      v-if="popSettingsData.bankDialog.visible"
      :visible="popSettingsData.bankDialog.visible"
      :data="popSettingsData.bankDialog.data"
      title="申请收款-收款信息"
      @closeMeOk="handleBankCloseOk"
      @closeMeCancel="handleBankCloseCancel"
    />
    <!--    vue-tour组件-->
    <v-tour name="myTour" :steps="steps" :options="tourOption" />
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
.el-form-item .el-select {
  width: 100%;
}

.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}
.el-descriptions {
  margin-top: 10px;
  margin-bottom: 10px;
}
.el-button-group {
  margin-left: 10px;
}
.el-table {
  margin: 10px;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
.skip-tour-checkbox {
  font-size: 12px;
  margin-right: 10px;
  width:80px;
}
</style>

<script>
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import CustomerDialog from '@/views/20_master/enterprise/dialog/list/index.vue'
import constants_dict from '@/common/constants/constants_dict'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'
import { EventBus } from '@/common/eventbus/eventbus'
import { selectListDataApi } from '@/api/10_system/dictdata/dictdata'
import { getTypeApi, getApi, validateApi, updateApi } from '@/api/40_business/20_so/ar/ar'
import constants_bpm from '@/common/constants/constants_bpm'
import soorder_list_template from '@/views/40_business/20_so/soorder/dialog/listfor/outplan/index.vue'
import bank_list_template from '@/views/20_master/bankaccounts/dialog/list/index.vue'
import numeric from '@/components/40_input/numeric/index.vue'
import { getSellerApi } from '@/api/20_master/bankaccounts/bankaccounts'

import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
export default {
  directives: { elDragDialog },
  components: { numeric, soorder_list_template, bank_list_template, BpmDialog, CustomerDialog, SimpleUploadMutilFile, PreviewCard },
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
      twoLabelStyle: {
        width: '5.5%',
        'text-align': 'right'
      },
      threeLabelStyle: {
        width: '2.3%',
        'text-align': 'right'
      },
      popSettingsData: {
        // 客户
        customerDialogData: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 主体企业
        sellerDialogData: {
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
          serial_type: constants_bpm.BPM_B_AR,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          },
          // 审批流程
          initial_process: null,
          // 自选用户
          process_users: {}
        },
        // 销售订单弹窗
        soOrderDialog: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 销售订单弹窗(添加关联单号)
        soOrderFountDialog: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 企业银行账户弹窗
        bankDialog: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        }
      },
      dataJson: {
        typeListDate: [],
        bankTypeListDate: [],
        // 用于监听
        actual_count: 0,
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          customer_id: null,
          customer_name: '',
          customer_code: '',
          so_order_code: null,
          so_contract_code: null,
          project_code: null,
          seller_id: null,
          seller_name: '',
          seller_code: '',
          // 销售订单
          soOrderListData: [],
          // 银行账户
          bankListData: [],
          // 类型
          type: null,
          detailListData: [],
          // 申请收款总金额
          receivable_amount: null,
          // 未收款总金额
          unreceive_amount: null,
          // 已收款总金额
          received_amount: null,
          // 收款中金额
          receiving_amount: null,
          // 收款信息收款总额
          detail_receivable_amount: null,
          // 收款附件材料
          receive_doc_att_files: []
        },
        // 单条数据 json
        tempJson: {
          bankListData: [],
          soOrderListData: [],
          // 收款附件材料
          receive_doc_att: [],
          receive_doc_att_file: [],
          receive_doc_att_files: []
        },
        searchForm: {
          reset: false
        },
        inputSettings: {
          maxLength: {
            remark: 100
          }
        },
        // 收款附件材料
        receive_doc_att: [],
        receive_doc_att_file: [],
        receive_doc_att_files: []
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        // 销售订单状态：是否可用，false:可用，true不可用
        btnSoOrderDisabledStatus: {
          disabledInsert: true,
          disabledDelete: true
        },
        // 企业银行账户按钮状态：是否可用，false:可用，true不可用
        btnBankDisabledStatus: {
          disabledInsert: true,
          disabledDelete: true
        },
        // pop的check内容
        rules: {
          type: [
            { required: true, message: '请选择业务类型', trigger: 'change' }
          ],
          so_order_code: [
            { required: true, message: '请添加关联单号', trigger: 'change' }
          ],
          order_amount: [
            { required: true, message: '请添加申请金额', trigger: 'change' }
          ],
          received_amount: [
            { required: true, message: '请添加收款金额', trigger: 'change' }
          ]
        }
      },
      // 跳过指引控制
      skipTourGuide: false,
      // vue-tour组件
      tourOption: {
        useKeyboardNavigation: false, // 是否通过键盘的←, → 和 ESC 控制指引
        labels: { // 指引项的按钮文案
          buttonSkip: '跳过指引', // 跳过文案
          buttonPrevious: '上一步', // 上一步文案
          buttonNext: '下一步', // 下一步文案
          buttonStop: '结束' // 结束文案
        },
        highlight: false // 是否高亮显示激活的的target项
      },
      steps: [
        {
          target: '.tour-one', // 当前项的id或class或data-v-step属性
          content: '第一步，选择业务类型！', // 当前项指引内容
          params: {
            placement: 'left', // 指引在target的位置，支持上、下、左、右
            highlight: false, // 当前项激活时是否高亮显示
            enableScrolling: true // 指引到当前项时是否滚动轴滚动到改项位置
          },
          // 在进行下一步时处理UI渲染或异步操作，例如打开弹窗，调用api等。当执行reject时，指引不会执行下一步
          before: type => new Promise((resolve, reject) => {
            // 耗时的UI渲染或异步操作
            resolve('foo')
          })
        },
        {
          target: '.tour-two', // 当前项的id或class或data-v-step属性
          content: '第二步，添加关联单号！', // 当前项指引内容
          params: {
            placement: 'left', // 指引在target的位置，支持上、下、左、右
            highlight: false, // 当前项激活时是否高亮显示
            enableScrolling: true // 指引到当前项时是否滚动轴滚动到改项位置
          },
          // 在进行下一步时处理UI渲染或异步操作，例如打开弹窗，调用api等。当执行reject时，指引不会执行下一步
          before: type => new Promise((resolve, reject) => {
            // 耗时的UI渲染或异步操作
            resolve('foo')
          })
        },
        {
          target: '.tour-three', // 当前项的id或class或data-v-step属性
          content: '第三步，添加收款方账户信息！', // 当前项指引内容
          params: {
            placement: 'top', // 指引在target的位置，支持上、下、左、右
            highlight: false, // 当前项激活时是否高亮显示
            enableScrolling: true // 指引到当前项时是否滚动轴滚动到改项位置
          },
          // 在进行下一步时处理UI渲染或异步操作，例如打开弹窗，调用api等。当执行reject时，指引不会执行下一步
          before: type => new Promise((resolve, reject) => {
            // 耗时的UI渲染或异步操作
            resolve('foo')
          })
        }
      ]
    }
  },
  computed: {
    CONSTANTS () {
      return constants_dict
    },
    // 计算添加关联单号按钮是否禁用
    isAddRelatedOrderDisabled () {
      // 1、当业务类型数据没有选择时，添加关联单号按钮组都不可用
      if (!this.dataJson.tempJson.type) {
        return true
      }

      // 3、当主体企业（收款方）中有数据时，添加关联单号按钮不可用
      if (this.dataJson.tempJson.seller_id && this.dataJson.tempJson.seller_name) {
        return true
      }

      // 当业务单据信息区域的el-table中有数据时，添加关联单号按钮组都不可用
      if (this.dataJson.tempJson.soOrderListData && this.dataJson.tempJson.soOrderListData.length > 0) {
        return true
      }

      return false
    },
    // 计算业务类型是否禁用
    isBusinessTypeDisabled () {
      // 3、当主体企业（收款方）中有数据时,业务类型这个控件都不可用
      if (this.dataJson.tempJson.seller_id && this.dataJson.tempJson.seller_name) {
        return true
      }

      return false
    },
    // 计算重置清空页面按钮是否禁用
    isResetPageDisabled () {
      // 3、当主体企业（收款方）中有数据时,重置清空页面可用
      if (this.dataJson.tempJson.seller_id && this.dataJson.tempJson.seller_name) {
        return false
      }

      // 其他情况下重置按钮不可用
      return true
    }
  },

  // 监听器
  watch: {
    'dataJson.tempJson.soOrderListData': {
      handler (newVal, oldVal) {
        // 当销售订单列表数据发生变化时，重新计算申请收款金额
        this.calculateReceivableAmounts()
        console.log('销售订单列表数据发生变化，重新计算金额')

        // 业务单据信息区域的el-table的数据为空时，删除按钮不可用
        if (!newVal || newVal.length === 0) {
          this.settings.btnSoOrderDisabledStatus.disabledDelete = true
        }
      },
      deep: true,
      immediate: true
    },
    'dataJson.tempJson.bankListData': {
      handler: 'handleBankListDataChange',
      deep: true,
      immediate: true
    },
    'dataJson.tempJson.seller_id': {
      handler: 'updateButtonStatusBySeller',
      deep: true,
      immediate: true
    }
  },
  created () {
  },
  mounted () {
    // 描绘完成
    this.init()
  },
  destroyed () {
  },
  methods: {
    // 初始化处理
    async init () {
      // 初始化跳过指引状态
      this.initSkipTourGuide()
      // 根据跳过指引状态决定是否启动tour
      if (!this.skipTourGuide) {
        this.$tours['myTour'].start()
      }
      this.getData()
      // 初始化业务类型
      this.initTypeList()
      // 初始化款项类型
      this.initBankTypeList()
      this.settings.loading = false
    },
    initTempJsonOriginal () {
      // 单条数据 json的，初始化原始数据
      this.dataJson.tempJsonOriginal = this.$options.data.call(this).dataJson.tempJsonOriginal
    },
    getData () {
      // 查询逻辑
      this.settings.loading = true
      getApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.tempJsonOriginal = deepCopy(response.data)
        this.dataJson.tempJson.soOrderListData = [...response.data.soOrderListData]
        this.dataJson.tempJson.bankListData = [...response.data.bankListData]

        // 初始化收款附件数据
        if (response.data.doc_att_files && response.data.doc_att_files.length > 0) {
          this.dataJson.receive_doc_att = [...response.data.doc_att_files]
          this.dataJson.receive_doc_att_file = response.data.doc_att_files.map(item => item.url)
          this.dataJson.tempJson.receive_doc_att_files = [...response.data.doc_att_files]
        } else {
          this.dataJson.receive_doc_att = []
          this.dataJson.receive_doc_att_file = []
          this.dataJson.tempJson.receive_doc_att_files = []
        }

        // 触发金额计算
        this.calculateReceivableAmounts()
        this.calculateDetailReceivableAmount()
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 修改
    doUpdate () {
      // 开始综合验证
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)
          // 审批流程启动数据
          tempData.initial_process = this.popSettingsData.sponsorDialog.initial_process // 流程
          tempData.form_data = this.popSettingsData.sponsorDialog.form_data // 表单参数
          tempData.process_users = this.popSettingsData.sponsorDialog.process_users // 自选用户

          // 确保收款附件材料数据被包含
          tempData.doc_att_files = this.dataJson.receive_doc_att

          if (tempData.soOrderListData == null || tempData.soOrderListData.length === 0) {
            this.showErrorMsg('至少选择一个销售订单')
            return
          }

          if (tempData.bankListData == null || tempData.bankListData.length === 0) {
            this.showErrorMsg('请选择银行账户')
            return
          }

          // 1. 重新计算申请收款总金额：业务单据信息表格合计本次申请金额
          let totalReceivableAmount = 0
          if (tempData.soOrderListData && tempData.soOrderListData.length > 0) {
            totalReceivableAmount = tempData.soOrderListData.reduce((sum, item) => {
              const orderAmount = parseFloat(item.order_amount) || 0
              return sum + orderAmount
            }, 0)
          }
          tempData.receivable_amount = totalReceivableAmount
          this.dataJson.tempJson.receivable_amount = totalReceivableAmount

          // 2. 重新计算收款总金额：收款账户信息表格合计收款金额
          let totalDetailReceivableAmount = 0
          if (tempData.bankListData && tempData.bankListData.length > 0) {
            totalDetailReceivableAmount = tempData.bankListData.reduce((sum, item) => {
              const receivableAmount = parseFloat(item.receivable_amount) || 0
              return sum + receivableAmount
            }, 0)
          }
          tempData.detail_receivable_amount = totalDetailReceivableAmount
          this.dataJson.tempJson.detail_receivable_amount = totalDetailReceivableAmount

          // 3. 校验收款总金额与申请收款总金额
          console.log('校验金额 - 申请收款总金额:', totalReceivableAmount)
          console.log('校验金额 - 收款总金额:', totalDetailReceivableAmount)
          console.log('校验金额 - 差异:', Math.abs(totalDetailReceivableAmount - totalReceivableAmount))

          if ((totalDetailReceivableAmount - totalReceivableAmount) !== 0) {
            const errorMsg = `收款数据校验失败：请确保各账户收款金额之和与申请收款金额完全一致。申请收款总金额：${this.formatCurrency(totalReceivableAmount, true)}，收款总金额：${this.formatCurrency(totalDetailReceivableAmount, true)}`
            this.showErrorMsg(errorMsg)
            return
          }

          this.settings.loading = true
          this.showLoading('正在保存，请稍后...')
          updateApi(tempData)
            .then(
              _data => {
                this.closeLoading()
                this.$emit('closeMeOk', _data.data)
                // 通知兄弟组件，新增数据更新
                setTimeout(() => {
                  EventBus.$emit(this.EMITS.EMIT_MST_B_AR_UPDATE_OK, _data.data)
                }, 1000)
                this.$notify({
                  title: '修改成功',
                  message: _data.data.message,
                  type: 'success',
                  duration: this.settings.duration
                })
              },
              _error => {
                this.closeLoading()
                this.$notify({
                  title: '修改失败',
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
    // 销售订单弹窗
    handleSoOrderInsert () {
      this.popSettingsData.soOrderDialog.data = {
        customer_id: this.dataJson.tempJson.customer_id,
        customer_name: this.dataJson.tempJson.customer_name,
        customer_code: this.dataJson.tempJson.customer_code,
        seller_id: this.dataJson.tempJson.seller_id,
        seller_name: this.dataJson.tempJson.seller_name,
        seller_code: this.dataJson.tempJson.customer_code
      }
      this.popSettingsData.soOrderDialog.visible = true
    },
    // 销售订单选中
    handleSoOrderRowClick (row) {
      this.popSettingsData.soOrderDialog.rowIndex = this.getSoOrderRowIndex(row)
    },
    // 销售订单获取行索引
    getSoOrderRowIndex (row) {
      const _index = this.dataJson.tempJson.soOrderListData.lastIndexOf(row)
      return _index
    },
    // 销售订单按钮
    handleSoOrderCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getSoOrderRowIndex(row)
      this.settings.btnSoOrderDisabledStatus.disabledDelete = false
    },
    // 销售订单选择完成
    handleSoOrderCloseOk (val) {
      this.popSettingsData.soOrderDialog.visible = false

      // 设置到table中绑定的业务单据信息
      const tempData = {}
      tempData.so_order_code = val.code
      tempData.so_order_id = val.id
      tempData.project_code = val.project_code
      tempData.so_contract_code = val.so_contract_code
      tempData.so_goods = val.goods_name
      tempData.qty_total = val.order_total
      tempData.amount_total = val.order_amount_sum
      tempData.so_advance_receive_amount = val.advance_receive_price
      tempData.so_can_advance_receive_amount = val.advance_amount_total
      tempData.order_amount = 0
      tempData.remark = null

      if (this.dataJson.tempJson.soOrderListData.find(item => item.so_order_code === tempData.so_order_code)) {
        this.showErrorMsg('您选择的数据已经在表格中，添加失败！')
        return false
      }

      this.dataJson.tempJson.soOrderListData.push(tempData)

      // 添加后重新计算申请收款总金额
      this.calculateReceivableAmounts()

      this.$notify({
        title: '新增处理成功',
        message: '新增处理成功',
        type: 'success',
        duration: this.settings.duration
      })
    },
    // 销售订单选择关闭
    handleSoOrderCloseCancel () {
      this.popSettingsData.soOrderDialog.visible = false
    },
    // 销售订单选择删除
    handleSoOrderDelete () {
      if (this.popSettingsData.soOrderDialog.rowIndex === null) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 删除
      this.$confirm('是否确认删除该条数据', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        this.$nextTick(() => {
          this.settings.btnSoOrderDisabledStatus.disabledDelete = true
          // this.settings.btnSoOrderDisabledStatus.disabledInsert = false // 注释掉：保持按钮不可用
          // 设置到table中绑定的json数据源
          this.dataJson.tempJson.soOrderListData.splice(this.popSettingsData.soOrderDialog.rowIndex, 1)

          // 删除后重新计算申请收款总金额
          this.calculateReceivableAmounts()
        })
      }).catch(action => {
        this.settings.btnSoOrderDisabledStatus.disabledDelete = false
      })
    },
    // 添加关联单选择弹窗
    handleSoOrderFountInsert () {
      this.popSettingsData.soOrderFountDialog.data = {
        customer_id: this.dataJson.tempJson.customer_id,
        customer_name: this.dataJson.tempJson.customer_name,
        customer_code: this.dataJson.tempJson.customer_code,
        seller_id: this.dataJson.tempJson.seller_id,
        seller_name: this.dataJson.tempJson.seller_name,
        seller_code: this.dataJson.tempJson.customer_code
      }
      this.popSettingsData.soOrderFountDialog.visible = true
    },
    // 重置
    handleSoOrderFountRest () {
      // 数据重新初始化
      this.initTempJsonOriginal()
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)
      // 清空收款附件数据
      this.dataJson.receive_doc_att = []
      this.dataJson.receive_doc_att_file = []
      // 控制按钮
      this.initButtonShowStatus()
    },
    // 添加关联单选择完成
    handleSoOrderFountCloseOk (val) {
      this.popSettingsData.soOrderFountDialog.visible = false

      // 基本信息（添加关联单号）
      this.dataJson.tempJson.so_order_code = val.code
      this.dataJson.tempJson.so_order_id = val.id
      this.dataJson.tempJson.project_code = val.project_code
      this.dataJson.tempJson.so_contract_code = val.so_contract_code
      this.dataJson.tempJson.customer_id = val.customer_id
      this.dataJson.tempJson.customer_name = val.customer_name
      this.dataJson.tempJson.customer_code = val.customer_code
      this.dataJson.tempJson.seller_id = val.seller_id
      this.dataJson.tempJson.seller_name = val.seller_name
      this.dataJson.tempJson.seller_code = val.seller_code

      // 设置到table中绑定的业务单据信息
      const tempData = {}
      tempData.so_order_code = val.code
      tempData.so_order_id = val.id
      tempData.project_code = val.project_code
      tempData.so_contract_code = val.so_contract_code
      tempData.so_goods = val.goods_name
      tempData.qty_total = val.order_total
      tempData.amount_total = val.order_amount_sum
      tempData.so_advance_receive_amount = val.advance_receive_price
      tempData.so_can_advance_receive_amount = val.advance_amount_total
      tempData.order_amount = 0
      tempData.remark = null

      if (this.dataJson.tempJson.soOrderListData.find(item => item.so_order_code === tempData.so_order_code)) {
        this.showErrorMsg('您选择的数据已经在表格中，添加失败！')
        return false
      }

      if (this.dataJson.tempJson.soOrderListData.length > 0) {
        this.showErrorMsg('只能选择一条数据！')
        return false
      }

      this.dataJson.tempJson.soOrderListData.push(tempData)

      // 查询主体企业是否有默认账户
      this.querySellerBankAccount(val.seller_id)

      // 添加关联单后重新计算申请收款总金额
      this.calculateReceivableAmounts()

      this.$notify({
        title: '添加关联单处理成功',
        message: '添加关联单处理成功',
        type: 'success',
        duration: this.settings.duration
      })
    },
    // 查询主体企业是否有默认账户
    querySellerBankAccount (id) {
      getSellerApi({ enterprise_id: id })
        .then(_data => {
          if (_data.data != null) {
            // 检查是否已经存在相同的银行账户
            if (this.dataJson.tempJson.bankListData.find(item => item.bank_accounts_id === _data.data.id)) {
              console.log('默认银行账户已存在，跳过添加')
              return
            }

            const tempData = {}
            tempData.name = _data.data.name
            tempData.bank_name = _data.data.bank_name
            tempData.account_number = _data.data.account_number
            tempData.bank_accounts_id = _data.data.id
            tempData.bank_accounts_code = _data.data.code
            tempData.receivable_amount = 0

            // 款项类型
            for (let i = 0; i < this.dataJson.bankTypeListDate.length; i++) {
              const element = this.dataJson.bankTypeListDate[i]
              if (this.dataJson.tempJson.type === constants_dict.DICT_B_AR_TYPE_ONE &&
                element.code === constants_dict.DICT_M_BANK_TYPE_THREE) {
                tempData.bank_accounts_type_id = element.id
                tempData.bank_accounts_type_code = element.code
                tempData.accounts_purpose_type_name = element.name
                break
              } else if (this.dataJson.tempJson.type === constants_dict.DICT_B_AR_TYPE_TWO &&
                element.code === constants_dict.DICT_M_BANK_TYPE_ONE) {
                tempData.bank_accounts_type_id = element.id
                tempData.bank_accounts_type_code = element.code
                tempData.accounts_purpose_type_name = element.name
                break
              } else {
                tempData.bank_accounts_type_id = element.id
                tempData.bank_accounts_type_code = element.code
                tempData.accounts_purpose_type_name = element.name
                break
              }
            }

            tempData.remark = null
            this.dataJson.tempJson.bankListData = []
            this.dataJson.tempJson.bankListData.push(tempData)

            // 添加后重新计算收款总金额
            this.calculateDetailReceivableAmount()
          } else {
            // 控制按钮
            // this.settings.btnBankDisabledStatus.disabledInsert = false // 注释掉：保持按钮不可用
          }
        }).catch(_error => {
          this.showErrorMsg(_error.error.message)
        })
    },
    // 添加关联单选择关闭
    handleSoOrderFountCloseCancel () {
      this.popSettingsData.soOrderFountDialog.visible = false
    },
    // 企业银行账户弹窗
    handleBankInsert () {
      this.popSettingsData.bankDialog.data = {
        accounts_purpose_type: constants_dict.DICT_M_BANK_TYPE_ONE,
        enterprise_code: this.dataJson.tempJson.seller_code,
        enterprise_name: this.dataJson.tempJson.seller_name }

      this.popSettingsData.bankDialog.visible = true
    },
    // 企业银行账户选中
    handleBankRowClick (row) {
      this.popSettingsData.bankDialog.rowIndex = this.getBankRowIndex(row)
    },
    // 企业银行账户获取行索引
    getBankRowIndex (row) {
      const _index = this.dataJson.tempJson.bankListData.lastIndexOf(row)
      return _index
    },
    // 企业银行按钮
    handleBankCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getBankRowIndex(row)
      // this.settings.btnBankDisabledStatus.disabledDelete = false // 注释掉：保持按钮不可用
    },
    // 企业银行选择完成
    handleBankCloseOk (val) {
      // 检查是否已经存在相同的银行账户（根据bank_accounts_id判断）
      if (this.dataJson.tempJson.bankListData.find(item => item.bank_accounts_id === val.id)) {
        this.showErrorMsg('收款账户添加失败：该收款账户在表格中已经存在，不能添加重复的收款账户！')
        return false
      }

      const tempData = {}
      tempData.name = val.name
      tempData.bank_name = val.bank_name
      tempData.account_number = val.account_number
      tempData.bank_accounts_id = val.id
      tempData.bank_accounts_code = val.code

      // todo 款项类型
      for (let i = 0; i < this.dataJson.bankTypeListDate.length; i++) {
        const element = this.dataJson.bankTypeListDate[i]
        if (this.dataJson.tempJson.type === constants_dict.DICT_B_AR_TYPE_ONE &&
          element.code === constants_dict.DICT_M_BANK_TYPE_THREE) {
          tempData.bank_accounts_type_id = element.id
          tempData.bank_accounts_type_code = element.code
          tempData.accounts_purpose_type_name = element.name
          break
        } else if (this.dataJson.tempJson.type === constants_dict.DICT_B_AR_TYPE_TWO &&
          element.code === constants_dict.DICT_M_BANK_TYPE_ONE) {
          tempData.bank_accounts_type_id = element.id
          tempData.bank_accounts_type_code = element.code
          tempData.accounts_purpose_type_name = element.name
          break
        } else {
          tempData.bank_accounts_type_id = element.id
          tempData.bank_accounts_type_code = element.code
          tempData.accounts_purpose_type_name = element.name
          break
        }
      }

      tempData.receivable_amount = 0
      tempData.remark = null
      this.dataJson.tempJson.bankListData.push(tempData)
      this.popSettingsData.bankDialog.visible = false

      // 添加后重新计算收款总金额
      this.calculateDetailReceivableAmount()

      this.$notify({
        title: '新增收款信息处理成功',
        message: '新增收款信息处理成功',
        type: 'success',
        duration: this.settings.duration
      })
    },
    // 企业银行选择关闭
    handleBankCloseCancel () {
      this.popSettingsData.bankDialog.visible = false
    },
    // 企业银行选择删除
    handleBankDelete () {
      if (this.popSettingsData.bankDialog.rowIndex === null) {
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
        this.dataJson.tempJson.bankListData.splice(this.popSettingsData.bankDialog.rowIndex, 1)

        this.settings.btnBankDisabledStatus.disabledDelete = true
        // this.settings.btnBankDisabledStatus.disabledInsert = false // 注释掉：保持按钮不可用

        // 删除后重新计算收款总金额
        this.calculateDetailReceivableAmount()
      }).catch(action => {

      })
    },
    // 客户
    handleCustomerDialog () {
      this.popSettingsData.customerDialogData.visible = true
      this.popSettingsData.customerDialogData.data.status = constants_dict.DICT_M_ENTERPRISE_STATUS_TWO
    },
    // 客户：关闭对话框：确定
    handleCustomerCloseOk (val) {
      this.popSettingsData.customerDialogData.selectedDataJson = val
      this.dataJson.tempJson.customer_id = val.id
      this.dataJson.tempJson.customer_code = val.code
      this.dataJson.tempJson.customer_name = val.name
      this.popSettingsData.customerDialogData.visible = false
    },
    // 客户：关闭对话框：取消
    handleCustomerCloseCancel () {
      this.popSettingsData.customerDialogData.visible = false
    },
    // 主体企业
    handleSellerDialog () {
      this.popSettingsData.sellerDialogData.visible = true
      this.popSettingsData.sellerDialogData.data.status = constants_dict.DICT_M_ENTERPRISE_STATUS_TWO
    },
    // 主体企业：关闭对话框：确定
    handleSellerCloseOk (val) {
      this.popSettingsData.sellerDialogData.selectedDataJson = val
      this.dataJson.tempJson.seller_id = val.id
      this.dataJson.tempJson.seller_code = val.code
      this.dataJson.tempJson.seller_name = val.name
      this.popSettingsData.sellerDialogData.visible = false
    },
    // 主体企业：关闭对话框：取消
    handleSellerCloseCancel () {
      this.popSettingsData.sellerDialogData.visible = false
    },
    // 校验数据 获取审批流程
    startProcess () {
      this.showLoading('正在保存，请稍后...')
      // 校验业务数据
      const tempData = deepCopy(this.dataJson.tempJson)
      tempData.check_type = constants_para.UPDATE_CHECK_TYPE

      // 确保收款附件材料数据被包含
      tempData.receive_doc_att_files = this.dataJson.receive_doc_att

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
            this.popSettingsData.sponsorDialog.form_data = { }
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
      this.closeLoading()
    },
    // 审批流确定
    handleBpmDialogOk (data) {
      this.popSettingsData.sponsorDialog.initial_process = data.processData
      this.popSettingsData.sponsorDialog.process_users = data.process_users
      this.popSettingsData.sponsorDialog.visible = false
      this.doUpdate()
    },
    // 初始化业务类型
    initTypeList () {
      const _this = this
      getTypeApi().then(response => {
        if (response.data.length !== 0) {
          _this.dataJson.typeListDate = _this.dataJson.typeListDate.concat(response.data)
          _this.dataJson.typeListDate.forEach(item => {
            item.checked = false
          })
        } else {
          this.showErrorMsg('业务类型数据为空,请联系管理员')
        }
      })
    },
    // 初始化款项类型
    initBankTypeList () {
      const _this = this
      const params = {
        dictTypeCode: constants_dict.DICT_M_BANK_TYPE,
        is_del: 0
      }
      selectListDataApi(params).then(response => {
        if (response.data.length !== 0) {
          _this.dataJson.bankTypeListDate = _this.dataJson.bankTypeListDate.concat(response.data)
        } else {
          this.showErrorMsg('款项类型数据为空,请联系管理员')
        }
      })
    },
    // 处理类型变化
    handleTypeChange (val) {
      this.dataJson.tempJson.type = val
    },
    // 收款附件上传成功
    handleReceiveUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.receive_doc_att.push(res.response.data)
      this.dataJson.receive_doc_att_file.push(res.response.data.url)
      this.dataJson.tempJson.receive_doc_att_files = this.dataJson.receive_doc_att
    },
    // 收款附件文件移除
    removeReceiveFile (val) {
      // 获取下标
      const _index = this.dataJson.receive_doc_att_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.receive_doc_att.splice(_index, 1)
      this.dataJson.receive_doc_att_file.splice(_index, 1)
      this.dataJson.tempJson.receive_doc_att_files = this.dataJson.receive_doc_att
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
     * 处理全额申请：本次申请金额=可申请预收款金额
     * @param val
     */
    handleFullAmountApply (val) {
      val.order_amount = val.so_can_advance_receive_amount
      // 触发金额重新计算
      this.calculateReceivableAmounts()
    },
    /**
     * 处理全额收款：收款金额=申请收款总金额，其他行收款金额设为0
     * @param val 当前行数据
     */
    handleFullReceiveApply (val) {
      console.log('全额收款按钮点击事件触发', val)

      // 1. 把其他行的收款金额设置为0
      if (this.dataJson.tempJson.bankListData && this.dataJson.tempJson.bankListData.length > 0) {
        this.dataJson.tempJson.bankListData.forEach(item => {
          if (item !== val) {
            item.receivable_amount = 0
          }
        })
      }

      // 2. 当前行的收款金额设置为申请收款总金额
      val.receivable_amount = this.dataJson.tempJson.receivable_amount || 0

      // 3. 触发收款总金额重新计算
      this.calculateDetailReceivableAmount()
    },
    /**
     * 销售订单金额填写处理
     * 当业务单据信息表中的本次申请金额发生变化时触发
     * @param val 当前行数据
     */
    handleSoOrderCheck (val) {
      console.log('销售订单金额填写处理', val)

      // 申请金额不能大于可申请预收款金额
      if (val.so_can_advance_receive_amount && val.order_amount > val.so_can_advance_receive_amount) {
        val.order_amount = null
        this.showErrorMsg('申请金额不能大于可申请预收款金额')
        return
      }

      // 触发金额重新计算
      this.calculateReceivableAmounts()
    },
    // 初始化跳过指引状态
    initSkipTourGuide () {
      const SKIP_TOUR_KEY = 'ar_edit_skip_tour_guide'
      const savedSkipTour = localStorage.getItem(SKIP_TOUR_KEY)

      if (savedSkipTour) {
        try {
          const skipTourData = JSON.parse(savedSkipTour)
          const now = Date.now()

          // 检查是否过期（1年 = 365 * 24 * 60 * 60 * 1000 毫秒）
          if (now < skipTourData.expiry) {
            this.skipTourGuide = skipTourData.value
          } else {
            // 过期了，删除localStorage中的数据
            localStorage.removeItem(SKIP_TOUR_KEY)
            this.skipTourGuide = false
          }
        } catch (error) {
          // localStorage数据格式错误，删除并重置
          localStorage.removeItem(SKIP_TOUR_KEY)
          this.skipTourGuide = false
        }
      } else {
        this.skipTourGuide = false
      }
    },
    // 处理跳过指引勾选框变化
    handleSkipTourGuideChange (value) {
      const SKIP_TOUR_KEY = 'ar_edit_skip_tour_guide'
      const now = Date.now()
      // 设置过期时间为1年后
      const expiry = now + (365 * 24 * 60 * 60 * 1000)

      const skipTourData = {
        value: value,
        expiry: expiry
      }

      localStorage.setItem(SKIP_TOUR_KEY, JSON.stringify(skipTourData))

      // 如果取消勾选跳过指引，立即启动tour
      if (!value) {
        this.$tours['myTour'].start()
      }
    },
    // 处理收款金额变化
    handleReceivableAmountChange (value) {
      console.log('收款金额变化', value)
      // 触发收款总金额重新计算
      this.calculateDetailReceivableAmount()
    },
    // 计算收款金额
    calculateReceivableAmounts () {
      // 1. 申请收款总金额：业务单据信息表的所有本次申请金额的汇总值
      let totalReceivableAmount = 0
      if (this.dataJson.tempJson.soOrderListData && this.dataJson.tempJson.soOrderListData.length > 0) {
        totalReceivableAmount = this.dataJson.tempJson.soOrderListData.reduce((sum, item) => {
          const orderAmount = parseFloat(item.order_amount) || 0
          return sum + orderAmount
        }, 0)
      }

      // 设置申请收款总金额
      this.dataJson.tempJson.receivable_amount = totalReceivableAmount

      // 2. 已收款总金额：设置为null（显示为"-"）
      this.dataJson.tempJson.received_amount = null

      // 3. 未收款总金额：等于申请收款总金额
      this.dataJson.tempJson.unreceive_amount = totalReceivableAmount

      // 4. 收款中金额：设置为null（显示为"-"）
      this.dataJson.tempJson.receiving_amount = null

      console.log('计算金额 - 申请收款总金额:', totalReceivableAmount)
    },
    // 计算收款账户信息的收款总金额
    calculateDetailReceivableAmount () {
      // 收款总金额：收款账户信息表格所有行的收款金额的合计
      let totalDetailReceivableAmount = 0
      if (this.dataJson.tempJson.bankListData && this.dataJson.tempJson.bankListData.length > 0) {
        totalDetailReceivableAmount = this.dataJson.tempJson.bankListData.reduce((sum, item) => {
          const receivableAmount = parseFloat(item.receivable_amount) || 0
          return sum + receivableAmount
        }, 0)
      }

      // 设置收款总金额
      this.dataJson.tempJson.detail_receivable_amount = totalDetailReceivableAmount

      console.log('计算金额 - 收款总金额:', totalDetailReceivableAmount)
    },
    handleBankListDataChange (newVal, oldVal) {
      // 当银行账户列表数据发生变化时的处理逻辑
      console.log('银行账户列表数据发生变化', newVal)

      // 重新计算收款总金额
      this.calculateDetailReceivableAmount()

      // 可以在这里添加银行账户数据变化时的业务逻辑
      if (newVal && newVal.length > 0) {
        console.log('可用银行账户数量:', newVal.length)
      }

      // 收款账户信息区域的el-table的数据为空时，删除按钮不可用
      if (!newVal || newVal.length === 0) {
        this.settings.btnBankDisabledStatus.disabledDelete = true
      }
    },
    // 根据主体企业状态更新按钮状态
    updateButtonStatusBySeller () {
      const hasSeller = this.dataJson.tempJson.seller_id && this.dataJson.tempJson.seller_name

      if (hasSeller) {
        // 5、业务单据信息的按钮逻辑：当基本信息的主体企业（收款方）有数据时，添加按钮可点击
        // this.settings.btnSoOrderDisabledStatus.disabledInsert = false // 注释掉：保持按钮不可用

        // 6、收款账户信息的按钮逻辑：当基本信息的主体企业（收款方）有数据时，添加按钮可点击
        // this.settings.btnBankDisabledStatus.disabledInsert = false // 注释掉：保持按钮不可用
      } else {
        // 如果没有主体企业数据，按钮不可用
        this.settings.btnSoOrderDisabledStatus.disabledInsert = true
        this.settings.btnBankDisabledStatus.disabledInsert = true
      }
    },
    // 初始化按钮状态
    initButtonShowStatus () {
      // 初始化按钮状态：重置为默认值
      this.settings.btnSoOrderDisabledStatus.disabledInsert = true
      this.settings.btnSoOrderDisabledStatus.disabledDelete = true
      this.settings.btnBankDisabledStatus.disabledInsert = true
      this.settings.btnBankDisabledStatus.disabledDelete = true
    }
  }

}
</script>
