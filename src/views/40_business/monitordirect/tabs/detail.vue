<template>
  <div class="app-container">
    <div
      ref="toTop"
      class="edit-container"
    >
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

          <el-descriptions-item label="任务单号">
            {{ dataJson.tempJson.code == null || dataJson.tempJson.code == ''?'系统自动生成':dataJson.tempJson.code }}
          </el-descriptions-item>

          <el-descriptions-item label="任务状态">
            {{ dataJson.tempJson.status_name == null?'制单': dataJson.tempJson.status_name }}
          </el-descriptions-item>

          <el-descriptions-item label="物流订单单号">
            {{ dataJson.tempJson.schedule_code == null?'制单': dataJson.tempJson.schedule_code }}
          </el-descriptions-item>

          <el-descriptions-item label="采购/销售合同号">
            <span class="fontWeight">
              {{ dataJson.tempJson.contract_no == null?'-':dataJson.tempJson.contract_no }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="承运商">
            {{ dataJson.tempJson.customer_name == null?'-':dataJson.tempJson.customer_name }}
          </el-descriptions-item>
          <el-descriptions-item />
          <el-descriptions-item label="司机(手机号)">
            <span class="fontWeight">
              {{ dataJson.tempJson.driver_name == null?'-':dataJson.tempJson.driver_name }} {{ '(' + dataJson.tempJson.driver_mobile_phone + ')' }}
            </span>
            <!-- <input-search
              v-model.trim="dataJson.tempJson.driver_name"
              :disabled="isUpdateModel && isViewModel"
              @onInputSearch="handleDriverDialog"
            /> -->
          </el-descriptions-item>

          <el-descriptions-item label="车牌号">
            <span class="fontWeight">
              {{ dataJson.tempJson.vehicle_no == null?'-':dataJson.tempJson.vehicle_no }}
            </span>
            <!-- <input-search
              v-model.trim="dataJson.tempJson.vehicle_no"
              :disabled="isUpdateModel && isViewModel"
              @onInputSearch="handleVehicleDialog"
            /> -->
          </el-descriptions-item>

          <el-descriptions-item />

          <el-descriptions-item label="创建人">
            {{ dataJson.tempJson.c_name == null?'-':dataJson.tempJson.c_name }}
          </el-descriptions-item>

          <el-descriptions-item label="创建时间">
            {{ dataJson.tempJson.c_time == null?'-':formatDateTime(dataJson.tempJson.c_time) }}
          </el-descriptions-item>

          <el-descriptions-item />

        </el-descriptions>

        <br>
        <div v-if="dataJson.tempJson.schedule_type==='5'">
          <el-alert
            title="发货信息"
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

            <el-descriptions-item label="类型">
              {{ dataJson.tempJson.out_type_name == null ?'-':dataJson.tempJson.out_type_name }}
            </el-descriptions-item>

            <el-descriptions-item label="发货地">
              <span class="fontWeight">
                {{ dataJson.tempJson.out_warehouse_name == null?'-': dataJson.tempJson.out_warehouse_name }}
              </span>
            </el-descriptions-item>

            <el-descriptions-item label="发货地类型">
              {{ dataJson.tempJson.out_warehouse_type_name == null?'-': dataJson.tempJson.out_warehouse_type_name }}
            </el-descriptions-item>

            <el-descriptions-item label="发货详细地址">
              {{ dataJson.tempJson.out_warehouse_address == null?'-': dataJson.tempJson.out_warehouse_address }}
            </el-descriptions-item>

            <el-descriptions-item label="出库计划单号">
              {{ dataJson.tempJson.out_plan_code == null?'-':dataJson.tempJson.out_plan_code }}
            </el-descriptions-item>

            <el-descriptions-item label="出库单号">
              {{ dataJson.tempJson.out_code == null?'-':dataJson.tempJson.out_code }}
            </el-descriptions-item>

            <el-descriptions-item label="出库时间">
              {{ dataJson.tempJson.out_time == null?'-':formatDateTime(dataJson.tempJson.out_time ) }}
            </el-descriptions-item>
            <el-descriptions-item />
            <el-descriptions-item />
          </el-descriptions>
        </div>
        <br>
        <div v-if="dataJson.tempJson.schedule_type==='4'">
          <el-alert
            title="收货信息"
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

            <el-descriptions-item label="类型">
              {{ dataJson.tempJson.in_type_name == null ?'-':dataJson.tempJson.in_type_name }}
            </el-descriptions-item>

            <el-descriptions-item label="收货地">
              <span class="fontWeight">
                {{ dataJson.tempJson.in_warehouse_name == null?'-': dataJson.tempJson.in_warehouse_name }}
              </span>
            </el-descriptions-item>

            <el-descriptions-item label="收货地类型">
              {{ dataJson.tempJson.in_warehouse_type_name == null?'-': dataJson.tempJson.in_warehouse_type_name }}
            </el-descriptions-item>

            <el-descriptions-item label="收货详细地址">
              {{ dataJson.tempJson.in_warehouse_address == null?'-': dataJson.tempJson.in_warehouse_address }}
            </el-descriptions-item>

            <el-descriptions-item label="入库计划单号">
              {{ dataJson.tempJson.in_plan_code == null?'-':dataJson.tempJson.in_plan_code }}
            </el-descriptions-item>

            <el-descriptions-item label="入库单号">
              {{ dataJson.tempJson.in_code == null?'-':dataJson.tempJson.in_code }}
            </el-descriptions-item>

            <el-descriptions-item label="入库/卸货时间">
              {{ dataJson.tempJson.in_time == null?'-':formatDateTime(dataJson.tempJson.in_time ) }}
            </el-descriptions-item>
            <el-descriptions-item />
            <el-descriptions-item />

          </el-descriptions>
        </div>
        <br>
        <br>

        <el-alert
          title="商品信息"
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

          <el-descriptions-item label="规格编号">
            {{ dataJson.tempJson.sku_code == null ?'-':dataJson.tempJson.sku_code }}
          </el-descriptions-item>

          <el-descriptions-item label="物料名称">
            {{ dataJson.tempJson.goods_name == null?'-': dataJson.tempJson.goods_name }}
          </el-descriptions-item>

          <el-descriptions-item label="品名">
            {{ dataJson.tempJson.pm == null?'-': dataJson.tempJson.pm }}
          </el-descriptions-item>

          <el-descriptions-item label="规格">
            {{ dataJson.tempJson.sku_name == null?'-':dataJson.tempJson.sku_name }}
          </el-descriptions-item>

          <el-descriptions-item />

          <el-descriptions-item />

        </el-descriptions>

        <br>
        <div v-if="dataJson.tempJson.schedule_type==='4'">
          <el-alert
            :title="dataJson.tempJson.in_type_name + '信息'"
            type="info"
            :closable="false"
          />
          <br>

          <el-descriptions
            title=""
            :column="1"
            :content-style="fileContentStyle"
            :label-style="fileLabelStyle"
            direction="horizontal"
            border
            style="padding-right: 10px;padding-left: 10px;"
          >
            <el-descriptions-item label="空车出库">
              <el-row v-if="dataJson.tempJson.monitorInVo">
                <el-descriptions
                  title=""
                  :column="3"
                  :content-style="contentStyle"
                  :label-style="labelStyle"
                  direction="horizontal"
                  border
                  style="padding-right: 10px;padding-left: 10px;"
                >

                  <el-descriptions-item label="毛重（吨）">
                    {{ dataJson.tempJson.monitorInVo.gross_weight }}
                  </el-descriptions-item>
                  <el-descriptions-item label="皮重（吨）">
                    {{ dataJson.tempJson.monitorInVo.tare_weight }}
                  </el-descriptions-item>
                  <el-descriptions-item label="净重（吨）">
                    <span class="fontWeight">
                      {{ dataJson.tempJson.monitorInVo.net_weight }}
                    </span>
                  </el-descriptions-item>
                </el-descriptions>
              </el-row>
              <br>
              <el-row style="display: flex;flex-wrap: wrap;">
                <el-col
                  :offset="1"
                  :span="4"
                >
                  <previewCard
                    :show-delete="settings.showDelete"
                    :show-title="settings.showTitle"
                    title="司机车头照片"
                    :data="dataJson.tempJson.monitorInVo.seven_fileVo"
                    @emitPreview="handlePreview"
                  />
                </el-col>
                <el-col
                  :offset="1"
                  :span="4"
                >
                  <previewCard
                    :show-delete="settings.showDelete"
                    :show-title="settings.showTitle"
                    title="司机驾驶证"
                    :data="dataJson.tempJson.monitorInVo.eleven_fileVo"
                    @emitPreview="handlePreview"
                  />
                </el-col>

                <el-col
                  :offset="1"
                  :span="4"
                >
                  <previewCard
                    :show-delete="settings.showDelete"
                    :show-title="settings.showTitle"
                    title="商品近照"
                    :data="dataJson.tempJson.monitorInVo.twelve_fileVo"
                    @emitPreview="handlePreview"
                  />
                </el-col>

                <el-col
                  :offset="1"
                  :span="4"
                >
                  <previewCard
                    :show-delete="settings.showDelete"
                    :show-title="settings.showTitle"
                    title="磅单"
                    :data="dataJson.tempJson.monitorInVo.nine_fileVo"
                    @emitPreview="handlePreview"
                  />
                </el-col>
              </el-row>
            </el-descriptions-item>

          </el-descriptions>
        </div>

        <div v-if="dataJson.tempJson.schedule_type==='5'">
          <el-alert
            :title="dataJson.tempJson.out_type_name + '信息'"
            type="info"
            :closable="false"
          />
          <br>

          <el-descriptions
            title=""
            :column="1"
            :content-style="fileContentStyle"
            :label-style="fileLabelStyle"
            direction="horizontal"
            border
            style="padding-right: 10px;padding-left: 10px;"
          >
            <el-descriptions-item label="重车出库">
              <el-row v-if="dataJson.tempJson.monitorOutVo">
                <el-descriptions
                  title=""
                  :column="3"
                  :content-style="contentStyle"
                  :label-style="labelStyle"
                  direction="horizontal"
                  border
                  style="padding-right: 10px;padding-left: 10px;"
                >

                  <el-descriptions-item label="毛重（吨）">
                    {{ dataJson.tempJson.monitorOutVo.gross_weight }}
                  </el-descriptions-item>
                  <el-descriptions-item label="皮重（吨）">
                    {{ dataJson.tempJson.monitorOutVo.tare_weight }}
                  </el-descriptions-item>
                  <el-descriptions-item label="净重（吨）">
                    <span class="fontWeight">
                      {{ dataJson.tempJson.monitorOutVo.net_weight }}
                    </span>
                  </el-descriptions-item>
                </el-descriptions>
              </el-row>
              <br>
              <el-row style="display: flex;flex-wrap: wrap;">
                <el-col
                  :offset="1"
                  :span="4"
                >
                  <previewCard
                    :show-delete="settings.showDelete"
                    :show-title="settings.showTitle"
                    title="司机车头照片"
                    :data="dataJson.tempJson.monitorOutVo.nine_fileVo"
                    @emitPreview="handlePreview"
                  />
                </el-col>
                <el-col
                  :offset="1"
                  :span="4"
                >
                  <previewCard
                    :show-delete="settings.showDelete"
                    :show-title="settings.showTitle"
                    title="司机驾驶证"
                    :data="dataJson.tempJson.monitorOutVo.twelve_fileVo"
                    @emitPreview="handlePreview"
                  />
                </el-col>

                <el-col
                  :offset="1"
                  :span="4"
                >
                  <previewCard
                    :show-delete="settings.showDelete"
                    :show-title="settings.showTitle"
                    title="商品近照"
                    :data="dataJson.tempJson.monitorOutVo.fifteen_fileVo"
                    @emitPreview="handlePreview"
                  />
                </el-col>

                <el-col
                  :offset="1"
                  :span="4"
                >
                  <previewCard
                    :show-delete="settings.showDelete"
                    :show-title="settings.showTitle"
                    title="磅单"
                    :data="dataJson.tempJson.monitorOutVo.eleven_fileVo"
                    @emitPreview="handlePreview"
                  />
                </el-col>
              </el-row>
            </el-descriptions-item>

          </el-descriptions>
        </div>

      </el-form>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />

      <el-button-group
        class="floatLeft"
        style="margin-right:10px"
      />
      <span
        v-if="editStatus === 'audit'"
        class="count floatLeft"
      >
        {{ dataJson.nowCount }} / {{ listCount }}
      </span>

      <el-button-group
        v-if="editStatus === 'audit'"
        style="margin-right:10px"
        class="floatLeft"
      >

        <el-button
          type="success"
          size="medium"
          :loading="settings.loading_prev"
          :disabled="settings.loading || !dataJson.tempJson.prev_id"
          icon="el-icon-arrow-left"
          @click="handleAuditPrev()"
        >上一条</el-button>
        <el-button
          :loading="settings.loading_next"
          type="success"
          size="medium"
          :disabled="settings.loading || !dataJson.tempJson.next_id"
          @click="handleAuditNext()"
        >下一条<i class="el-icon-arrow-right el-icon--right" /></el-button>
        <el-button
          v-if="settings.showAudit"
          v-permission="'P_MONITOR:IN_AUDIT'"
          type="primary"
          size="medium"
          :loading="settings.loading_next"
          @click="handleAudit()"
        >审核并跳转下一条</el-button>

      </el-button-group>

      <el-button-group class="floatRight">
        <el-button
          style="margin-left:10px"
          :disabled="settings.loading"
          size="medium"
          @click="handleCancel()"
        >返回</el-button>
      </el-button-group>

    </div>
    <validate-log
      v-if="popSettings.seven.visible"
      :visible="popSettings.seven.visible"
      :data="dataJson.tempJson"
      @closeMeCancel="handleValidateLogReturn"
    />
    <track-log
      v-if="popSettings.eight.visible"
      :visible="popSettings.eight.visible"
      :data="dataJson.tempJson"
      @closeMeCancel="handleTrackLogReturn"
    />
  </div>
</template>

<style scoped>
.count {
  display: inline-block;
  height: 30px;
  text-align: center;
  line-height: 30px;
}
br {
  display: block;
  margin: 10px;
  content: ' ';
}
.br {
  display: block;
  margin: 0px;
  content: ' ';
}
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
.font-class-red {
  color: #f00;
}
.fontWeight {
  font-weight: bold;
  color: #1890ff;
}
</style>

<script>
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getApi, auditOutApi, getMonitorFileApi, auditDirectApi } from '@/api/40_business/monitor/monitor'
import permission from '@/directive/permission/index.js' // 权限判断指令
import previewCard from '@/components/50_preview_card/preview_card_zl'
import ValidateLog from '@/views/40_business/monitor/tabs/dialog/validatelog.vue'
import TrackLog from '@/views/40_business/monitor/tabs/dialog/tracklog.vue'

export default {
  components: { TrackLog, ValidateLog, previewCard },
  directives: { elDragDialog, permission },
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
      },
      contentStyle: {
        width: '15%'
      },
      labelStyle: {
        width: '6%',
        'text-align': 'right'
      },
      fileLabelStyle: {
        width: '2%',
        'text-align': 'right'
      },
      fileContentStyle: {
        'text-align': 'center',
        width: '20%'
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
          },
          title: '委托方'
        },
        // 弹出的行业查询框参数设置
        searchDialogDataTwo: {
          // 弹出框显示参数
          visible: false,
          data: null,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          },
          title: '货主'
        },
        // 弹出的查询框参数设置
        searchDialogDataThree: {
          // 弹出框显示参数
          visible: false,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          },
          title: '委托方'
        },
        // 当前条数
        nowCount: 0,
        // 弹出的仓库查询框参数设置
        searchDialogDataFour: {
          // 弹出框显示参数
          visible: false,
          data: null,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          },
          title: '货主'
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
        // 弹出的库区查询框参数设置
        searchDialogDataSix: {
          // 弹出框显示参数
          visible: false,
          data: null,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 弹出的库位查询框参数设置
        searchDialogDataSeven: {
          // 弹出框显示参数
          visible: false,
          data: null,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 弹出的库位查询框参数设置
        searchDialogDataEight: {
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
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          code: '',
          monitorOutVo: {
            one_fileVo: undefined,
            two_fileVo: undefined,
            three_fileVo: undefined,
            four_fileVo: undefined,
            five_fileVo: undefined,
            six_fileVo: undefined,
            seven_fileVo: undefined,
            eight_fileVo: undefined,
            nine_fileVo: undefined,
            containerInfos: undefined
          },
          monitorInVo: {
            one_fileVo: undefined,
            two_fileVo: undefined,
            three_fileVo: undefined,
            four_fileVo: undefined,
            five_fileVo: undefined,
            six_fileVo: undefined,
            seven_fileVo: undefined,
            eight_fileVo: undefined,
            nine_fileVo: undefined,
            ten_fileVo: undefined,
            eleven_fileVo: undefined,
            containerInfos: undefined
          }
        },
        // 单条数据 json
        tempJson: {
          code: '',
          monitorOutVo: {
            one_fileVo: undefined,
            two_fileVo: undefined,
            three_fileVo: undefined,
            four_fileVo: undefined,
            five_fileVo: undefined,
            six_fileVo: undefined,
            seven_fileVo: undefined,
            eight_fileVo: undefined,
            nine_fileVo: undefined,
            ten_fileVo: undefined,
            twelve_fileVo: undefined,
            thirteen_fileVo: undefined,
            fourteen_fileVo: undefined,
            containerInfos: undefined
          },
          monitorInVo: {
            one_fileVo: undefined,
            two_fileVo: undefined,
            three_fileVo: undefined,
            four_fileVo: undefined,
            five_fileVo: undefined,
            six_fileVo: undefined,
            seven_fileVo: undefined,
            eight_fileVo: undefined,
            nine_fileVo: undefined,
            ten_fileVo: undefined,
            eleven_fileVo: undefined,
            fifteen_fileVo: undefined,
            containerInfos: undefined
          }
        },
        inputSettings: {
          maxLength: {
          }
        }
      },
      // 页面设置json
      settings: {
        showAudit: false,
        showDelete: false,
        showTitle: true,
        // loading 状态
        loading: true,
        loading_prev: true,
        loading_next: true,
        loading_audit_in: true,
        loading_audit_out: true,
        // tableHeight: this.setUIheight(),
        duration: 4000,

        // 按钮状态：是否可用，false:可用，true不可用
        btnDisabledStatus: {
          disabledInsert: true,
          disabledUpdate: true
        },
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: this.editStatus,
        // pop的check内容
        rulesOne: {

        },
        rules: {

        }
      },
      popSettings: {
        // 弹出编辑页面
        one: {
          visible: false,
          props: {
            index: 0,
            id: undefined,
            data: {},
            dialogStatus: ''
          }
        },
        // 验车日志
        seven: {
          visible: false,
          props: {
            id: undefined,
            data: {},
            dialogStatus: ''
          }
        },
        // 轨迹日志
        eight: {
          visible: false,
          props: {
            id: undefined,
            data: {},
            dialogStatus: ''
          }
        }
      }
    }
  },
  computed: {
    // 总条数
    listCount () {
      if (this.editStatus === 'audit') {
        return this.data.audit_ids.length
      } else {
        return 0
      }
    },
    // 是否显示
    isShowTrackMessage () {
      return Number(this.dataJson.tempJson.status) >= 5
    }
  },
  // 监听器
  watch: {},
  created () {
    this.init()
  },
  mounted () {

  },
  beforeUpdate () {
    // 回到顶部
    this.$nextTick(() => {
      this.$refs.toTop.scrollTop = 0
    })
  },
  destroyed () {
  },
  methods: {
    // 初始化处理
    init () {
      this.settings.loading = true
      // this.dataJson.tempJson = this.data
      this.settings.rules = this.settings.rulesOne
      this.initViewModel()
      this.settings.loading = false
    },
    initTempJsonOriginal () {
      // 单条数据 json的，初始化原始数据
      this.dataJson.tempJsonOriginal = this.$options.data.call(this).dataJson.tempJsonOriginal
    },
    // 查看时的初始化
    initViewModel () {
      // 数据初始化
      this.getData()
    },

    // 取消按钮
    handleCancel () {
      const operate_tab_data = {
        data: this.data
      }
      // if (history.state.pushState) {
      //   // 如果是列表页面过来的，可以直接返回
      //   window.history.go(-1)
      // } else {
      //   // 如果是直接打开的，返回查询页面
      //   // 全部
      //   this.$router.push({ name: constants_program.P_MONITOR })
      // }
      this.$router.push({
        // path: '/monitor/detail',
        query: {}
      })
      this.$emit('emitReturn', operate_tab_data)
    },
    // 上一条
    // handlePrev () {
    //   if (this.editStatus === constants_para.STATUS_VIEW) {
    //     this.data.id = this.dataJson.tempJson.prev_id
    //     this.data.no = this.data.no - 1
    //     window.history.replaceState({ pushState: true }, '', `#${this.$route.path}?p2=${this.data.id}`)
    //     this.settings.loading = true
    //     this.getData()
    //   } else {
    //     this.handleAuditPrev()
    //   }
    // },
    // 下一条
    // handleNext () {
    //   this.data.id = this.dataJson.tempJson.next_id
    //   this.data.no = this.data.no + 1
    //   alert(this.data.no)

    //   window.history.replaceState({ pushState: true }, '', `#${this.$route.path}?p2=${this.data.id}`)
    //   this.settings.loading = true
    //   this.getData()
    // },

    // 审核状态下一条
    handleAuditNext () {
      const { audit_ids } = this.data
      const index = audit_ids.indexOf(this.data.id)
      if (index < audit_ids.length - 1) {
        this.data.id = audit_ids[index + 1]
        this.dataJson.tempJson.next_id = audit_ids[index + 1]
        if (index === 0) {
          this.settings.loading_prev = true
        }
      } else {
        this.data.id = audit_ids[audit_ids.length - 1]
      }
      window.history.replaceState({ pushState: true }, '', `#${this.$route.path}?p2=${this.data.id}`)
      this.settings.loading = true
      this.getData()
    },

    // 审核状态上一条
    handleAuditPrev () {
      const { audit_ids } = this.data
      // 上一条下一条按钮
      const index = audit_ids.indexOf(this.data.id)
      if (index !== 0) {
        if (index < audit_ids.length) {
          console.log('上一条', audit_ids[index - 1])
          this.dataJson.tempJson.prev_id = audit_ids[index - 1]
          this.data.id = audit_ids[index - 1]
        }
      }
      window.history.replaceState({ pushState: true }, '', `#${this.$route.path}?p2=${this.data.id}`)
      this.settings.loading = true
      this.getData()
    },

    getData () {
      // 查询逻辑
      this.settings.loading = true
      this.showLoading('正在查询，请稍后...')
      getApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)

        // 预览附件查询
        this.getMonitorFile()

        if (this.editStatus === constants_para.STATUS_AUDIT) {
          this.settings.loading_next = false
          this.settings.loading_prev = false
          const { audit_ids } = this.data
          // 上一条下一条按钮
          const index = audit_ids.indexOf(this.data.id)
          this.dataJson.nowCount = index + 1
          if (index !== 0) {
            if (index < audit_ids.length) {
              this.dataJson.tempJson.prev_id = audit_ids[index - 1]
            }
          }
          if (audit_ids.length >= 2) {
            // 如果有两条, 下一条按钮高亮
            if (index < audit_ids.length - 1) {
              this.dataJson.tempJson.next_id = audit_ids[index + 1]
            }
          }
        }

        // 卸货完成才能审核
        if (this.dataJson.tempJson.status === '7') {
          this.settings.showAudit = true
        } else {
          this.settings.showAudit = false
        }

        if (this.dataJson.tempJson.monitorOutVo === null) {
          this.dataJson.tempJson.monitorOutVo = deepCopy(this.dataJson.tempJsonOriginal.monitorOutVo)
        }
        if (this.dataJson.tempJson.monitorInVo === null) {
          this.dataJson.tempJson.monitorInVo = deepCopy(this.dataJson.tempJsonOriginal.monitorInVo)
        }
      }).finally(() => {
        this.settings.loading = false
        this.closeLoading()
      })
    },
    // 审核按钮
    handleAudit () {
      // loading
      this.settings.loading = true
      const selectionJson = []
      selectionJson.push({ 'id': this.data.id })
      // 开始审核
      auditDirectApi(selectionJson).then((_data) => {
        this.$notify({
          title: '审核成功',
          message: _data.message,
          type: 'success',
          duration: this.settings.duration
        })
        this.handleAuditNext()
        // if (this.dataJson.tempJson.next_id !== null && this.dataJson.tempJson.next_id !== undefined) {
        //   this.handleAuditNext()
        // }
        // loading
      }, (_error) => {
        this.$notify({
          title: '审核错误',
          message: _error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 出库审核按钮
    handleReturn () {
      // loading
      this.settings.loading = true
      const selectionJson = []
      selectionJson.push({ 'id': this.data.id })

      // 开始出库审核
      auditOutApi(selectionJson).then((_data) => {
        this.$notify({
          title: '审核成功',
          message: _data.message,
          type: 'success',
          duration: this.settings.duration
        })
        this.handleAuditNext()
        // if (this.dataJson.tempJson.next_id !== null && this.dataJson.tempJson.next_id !== undefined) {
        //   this.handleAuditNext()
        // }
        // loading
      }, (_error) => {
        this.$notify({
          title: '审核错误',
          message: _error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },
    handlePreview (url) {
      // this.popSettings.one.visible = true
      console.log(url)
      const index = this.dataJson.tempJson.preview_data.findIndex(item => {
        return item.url === url
      })
      // this.popSettings.one.props.index = index

      // this.dataJson.tempJson.preview_data

      const { href } = this.$router.resolve({
        path: `/preview`,
        query: {
          id: this.dataJson.tempJson.id,
          type: 'monitor',
          index: index
        }
      })
      window.open(href, '_blank')
    },

    getMonitorFile () {
      // 查询逻辑
      const temp = {}
      temp.id = this.dataJson.tempJson.id
      getMonitorFileApi(temp).then(response => {
        this.dataJson.tempJson.preview_data = deepCopy(response.data.preview_data)
        this.popSettings.one.props.data = deepCopy(this.dataJson.tempJson.preview_data)
      }).finally(() => {
      })
    },
    // 验车日志 返回
    handleValidateLogReturn () {
      this.popSettings.seven.visible = false
    },
    // 验车日志, 打开
    handleValidateLogOpen () {
      this.popSettings.seven.visible = true
    },
    // 轨迹日志, 打开
    handleTrackLogOpen () {
      this.popSettings.eight.visible = true
    },
    // 轨迹日志, 关闭
    handleTrackLogReturn () {
      this.popSettings.eight.visible = false
    }
    // getPrevData () {
    //   // 查询逻辑
    //   this.settings.loading_prev = true
    //   getPrevApi(this.data).then(response => {
    //     this.dataJson.tempJson.prev_id = response.data.prev_id
    //   }).finally(() => {
    //     this.settings.loading_prev = false
    //   })
    // },
    // getNextData () {
    //   // 查询逻辑
    //   this.settings.loading_next = true
    //   getNextApi(this.data).then(response => {
    //     this.dataJson.tempJson.next_id = response.data.next_id
    //   }).finally(() => {
    //     this.settings.loading_next = false
    //   })
    // }

  }

}
</script>
