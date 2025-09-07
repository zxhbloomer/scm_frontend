<template>
  <!-- 编辑仓库弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="修改仓库"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="950px"
    destroy-on-close
    custom-class="edit-dialog-priority"
  >
    <el-form
      ref="dataSubmitForm"
      :rules="settings.rules"
      :model="dataJson.tempJson"
      label-position="right"
      label-width="150px"
      status-icon
    >
      <el-tabs
        style="height: 380px"
        @tab-click="handleTabsClick"
      >
        <br>

        <el-tab-pane>
          <template slot="label">
            基本信息
            <el-badge
              v-show="settings.badge.countOne > 0"
              :value="settings.badge.countOne"
              type="danger"
            />
          </template>
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="仓库编码："
                prop="code"
              >
                <el-input
                  v-model.trim="dataJson.tempJson.code"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.code"
                  disabled
                  placeholder="仓库编码"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="仓库名称："
                prop="name"
              >
                <el-input
                  ref="refFocusOne"
                  v-model.trim="dataJson.tempJson.name"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.name"
                  placeholder="请输入"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="仓库简称："
                prop="short_name"
              >
                <el-input
                  v-model.trim="dataJson.tempJson.short_name"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.short_name"
                  placeholder="请输入"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="仓库类型："
                prop="warehouse_type"
              >
                <select-dict
                  v-model="dataJson.tempJson.warehouse_type"
                  :para="CONSTANTS.DICT_M_WAREHOUSE_TYPE"
                  init-placeholder="请选择仓库类型"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="监管企业："
                prop="charge_company_id"
              >
                <select-charge-company
                  v-model.trim="dataJson.tempJson.charge_company_name"
                  placeholder="请选监管企业"
                  @closeParentDialog="handleDialogClose"
                  @onReturnData="handleChargeReturnData"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="运营企业："
                prop="operate_company_id"
              >
                <select-operate-company
                  v-model.trim="dataJson.tempJson.operate_company_name"
                  placeholder="请选择运营企业"
                  @closeParentDialog="handleDialogClose"
                  @onReturnData="handleOperateReturnData"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="联系人："
                prop="contact_person"
              >
                <el-input
                  v-model.trim="dataJson.tempJson.contact_person"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.contact_person"
                  placeholder="请输入"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="联系手机："
                prop="mobile_phone"
              >
                <el-input
                  v-model.trim="dataJson.tempJson.mobile_phone"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.mobile_phone"
                  placeholder="请输入"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item
                label="省市区："
                prop="cascader_areas"
              >
                <el-cascader
                  ref="refCascader"
                  v-model="dataJson.tempJson.cascader_areas"
                  placeholder="请选择省市区"
                  filterable
                  clearable
                  :options="dataJson.cascader.data"
                  style="width: 100%"
                  @change="handleCascaderChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="片区："
                prop="zone"
              >
                <select-dict
                  v-model="dataJson.tempJson.zone"
                  :para="CONSTANTS.DICT_M_WAREHOUSE_ZONE"
                  init-placeholder="请选择仓库片区"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item
            label="详细地址："
            prop="address"
          >
            <el-input
              v-model.trim="dataJson.tempJson.address"
              clearable
              show-word-limit
              type="textarea"
              :maxlength="dataJson.inputSettings.maxLength.address"
              placeholder="请输入"
            />
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane>
          <template slot="label">
            其他信息
            <el-badge
              v-show="settings.badge.countTwo > 0"
              :value="settings.badge.countTwo"
              type="danger"
            />
          </template>
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="仓库面积："
                prop="area"
              >
                <el-input
                  v-model.trim="dataJson.tempJson.area"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.area"
                  placeholder="请输入"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="仓库容积："
                prop="warehouse_capacity"
              >
                <el-input
                  v-model.trim="dataJson.tempJson.warehouse_capacity"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.warehouse_capacity"
                  placeholder="请输入"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="经度信息："
                prop="longitude"
              >
                <el-input
                  v-model.trim="dataJson.tempJson.longitude"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.longitude"
                  placeholder="请输入"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="纬度信息："
                prop="latitude"
              >
                <el-input
                  v-model.trim="dataJson.tempJson.latitude"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.latitude"
                  placeholder="请输入"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="启用日期："
                prop="start_dt"
              >
                <el-date-picker
                  v-model="dataJson.tempJson.start_dt"
                  value-format="yyyy-MM-dd"
                  type="date"
                  clearable
                  placeholder="选择日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="到期日期："
                prop="end_dt"
              >
                <el-date-picker
                  v-model="dataJson.tempJson.end_dt"
                  value-format="yyyy-MM-dd"
                  type="date"
                  clearable
                  placeholder="选择日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="每日收货开始时间："
                prop="receive_start_time"
              >
                <el-time-picker
                  v-model="dataJson.tempJson.receive_start_time"
                  value-format="HH:mm:ss"
                  format="HH:mm:ss"
                  clearable
                  placeholder="选择时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="每日收货结束时间："
                prop="receive_end_time"
              >
                <el-time-picker
                  v-model="dataJson.tempJson.receive_end_time"
                  value-format="HH:mm:ss"
                  format="HH:mm:ss"
                  clearable
                  placeholder="选择时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="每日发货开始时间："
                prop="deliver_start_time"
              >
                <el-time-picker
                  v-model="dataJson.tempJson.deliver_start_time"
                  value-format="HH:mm:ss"
                  format="HH:mm:ss"
                  clearable
                  placeholder="选择时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="每日发货结束时间："
                prop="deliver_end_time"
              >
                <el-time-picker
                  v-model="dataJson.tempJson.deliver_end_time"
                  value-format="HH:mm:ss"
                  format="HH:mm:ss"
                  clearable
                  placeholder="选择时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="是否启用："
                prop="enable"
              >
                <el-switch
                  v-model="dataJson.tempJson.enable"
                  active-color="#ff4949"
                  inactive-color="#dcdfe6"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="是否质检仓："
                prop="warehouse_check"
              >
                <el-switch
                  v-model="dataJson.tempJson.warehouse_check"
                  active-color="#ff4949"
                  inactive-color="#dcdfe6"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="启用库区："
                prop="enable_location"
              >
                <el-switch
                  v-model="dataJson.tempJson.enable_location"
                  disabled
                  active-color="#ff4949"
                  inactive-color="#dcdfe6"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="启用库位："
                prop="enable_bin"
              >
                <el-switch
                  v-model="dataJson.tempJson.enable_bin"
                  disabled
                  active-color="#ff4949"
                  inactive-color="#dcdfe6"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-form>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        plain
        type="primary"
        :disabled="settings.loading || settings.btnDisabledStatus.disabledUpdate"
        @click="doUpdate()"
      >确定</el-button>
      <el-button
        plain
        :disabled="settings.loading"
        @click="handleCancel()"
      >取消</el-button>
    </div>
  </el-dialog>
</template>

<style scoped>
.el-form-item .el-select {
  width: 100%;
}

.dialog-footer {
  text-align: center;
}
</style>

<script>
import { updateApi } from '@/api/30_wms/warehouse/warehouse'
import deepcopy from 'deep-copy'
import elDragDialog from '@/directive/el-drag-dialog'
import SelectDict from '@/components/00_dict/select/SelectDict'
import SelectChargeCompany from '@/views/30_wms/customer/selectgrid/selectCustomer'
import SelectOperateCompany from '@/views/30_wms/customer/selectgrid/selectCustomer'
import { getAreasCascaderApi } from '@/api/00_common/systemArea'

export default {
  name: 'WarehouseEditDialog',
  directives: { elDragDialog },
  components: {
    SelectDict,
    SelectChargeCompany,
    SelectOperateCompany
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      dataJson: {
        // 级联选择器数据
        cascader: {
          data: null,
          value: ''
        },
        tempJson: null,
        inputSettings: {
          maxLength: {
            code: 20,
            name: 100,
            short_name: 100,
            contact_person: 20,
            mobile_phone: 20,
            area: 20,
            warehouse_capacity: 20,
            longitude: 20,
            latitude: 20,
            address: 100
          }
        }
      },
      settings: {
        loading: false,
        duration: 4000,
        btnShowStatus: {
          showUpdate: true
        },
        btnDisabledStatus: {
          disabledUpdate: true
        },
        initialFormData: null,
        // 第一个标签页验证规则
        rulesOne: {
          name: [
            { required: true, message: '请输入仓库名称', trigger: 'change' }
          ],
          short_name: [
            { required: true, message: '请输入仓库简称', trigger: 'change' }
          ],
          warehouse_type: [
            { required: true, message: '请选择仓库类型', trigger: 'change' }
          ],
          charge_company_id: [
            { required: true, message: '请选择监管企业', trigger: 'change' }
          ]
        },
        // 第二个标签页验证规则
        rulesTwo: {
        },
        rules: {
        },
        // 错误数目标识
        badge: {
          countOne: 0,
          countTwo: 0
        }
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    }
  },
  watch: {
    listenVisible: {
      handler (newVal) {
        if (newVal) {
          this.init()
        }
      },
      immediate: true
    },
    editData: {
      handler (newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.dataJson.tempJson = deepcopy(newVal)

          // 修复 cascader_areas 数据格式问题
          if (typeof this.dataJson.tempJson.cascader_areas === 'string' || !Array.isArray(this.dataJson.tempJson.cascader_areas)) {
            // 如果不是正确的数组格式，且有 province/city/district 数据，重新构建数组
            if (this.dataJson.tempJson.province && this.dataJson.tempJson.city && this.dataJson.tempJson.district) {
              this.dataJson.tempJson.cascader_areas = [
                Number(this.dataJson.tempJson.province),
                Number(this.dataJson.tempJson.city),
                Number(this.dataJson.tempJson.district)
              ]
            }
          }
        }
      },
      deep: true,
      immediate: true
    },
    'dataJson.tempJson': {
      handler (newVal, oldVal) {
        // 检测表单数据是否发生变更
        const hasChanged = this.hasFormDataChanged()

        // 根据变更状态更新按钮启用/禁用状态
        // 有变更时启用按钮（disabledUpdate = false），无变更时禁用按钮（disabledUpdate = true）
        this.settings.btnDisabledStatus.disabledUpdate = !hasChanged
      },
      deep: true,
      immediate: false
    }
  },
  methods: {
    // 检测表单数据是否发生变更
    hasFormDataChanged () {
      if (!this.settings.initialFormData) {
        return false
      }

      // 深度比较当前表单数据与原始编辑数据
      return JSON.stringify(this.dataJson.tempJson) !== JSON.stringify(this.settings.initialFormData)
    },

    init () {
      // 数据回填
      if (this.editData && Object.keys(this.editData).length > 0) {
        this.dataJson.tempJson = deepcopy(this.editData)

        // 处理级联选择器数据回填（editData watch 已处理，此处作为备用）
        if (this.dataJson.tempJson.province && this.dataJson.tempJson.city && this.dataJson.tempJson.district && !this.dataJson.tempJson.cascader_areas) {
          this.dataJson.tempJson.cascader_areas = [
            Number(this.dataJson.tempJson.province),
            Number(this.dataJson.tempJson.city),
            Number(this.dataJson.tempJson.district)
          ]
        }
      }

      // 保存初始表单数据，用于检测变更
      this.$nextTick(() => {
        this.settings.initialFormData = deepcopy(this.dataJson.tempJson)
      })

      // 加载级联数据
      this.getCascaderDataList()

      // 合并验证规则
      this.doValidateAllRules()

      // 设置焦点
      this.$nextTick(() => {
        if (this.$refs.refFocusOne) {
          this.$refs.refFocusOne.focus()
        }
      })
    },

    // 监管企业选择回调
    handleChargeReturnData (data) {
      this.dataJson.tempJson.charge_company_id = data.id
      this.dataJson.tempJson.charge_company_name = data.name
      // 触发表单验证
      this.$nextTick(() => {
        if (this.$refs.dataSubmitForm) {
          this.$refs.dataSubmitForm.validateField('charge_company_id')
        }
      })
    },

    // 关闭弹窗回调
    handleDialogClose () {
      // 处理子组件弹窗关闭
    },

    // 执行更新操作
    doUpdate () {
      // 先进行分标签页验证并更新徽章
      this.doValidateByTabs()

      this.$refs.dataSubmitForm.validate((valid) => {
        if (valid) {
          this.settings.loading = true
          updateApi(this.dataJson.tempJson).then((response) => {
            this.$emit('closeMeOk', {
              return_flag: true,
              data: response
            })
          }).catch((error) => {
            this.$emit('closeMeOk', {
              return_flag: false,
              error: error
            })
          }).finally(() => {
            this.settings.loading = false
          })
        } else {
          // 验证失败时也更新徽章显示
          this.doValidateByTabs()
        }
      })
    },

    // 运营企业选择回调
    handleOperateReturnData (data) {
      this.dataJson.tempJson.operate_company_id = data.id
      this.dataJson.tempJson.operate_company_name = data.name
      // 触发表单验证
      this.$nextTick(() => {
        if (this.$refs.dataSubmitForm) {
          this.$refs.dataSubmitForm.validateField('operate_company_id')
        }
      })
    },

    // 标签页切换处理
    handleTabsClick (tab, event) {
      console.log('标签页切换:', tab.name, event)
    },

    // 级联事件
    handleCascaderChange (val) {
      this.dataJson.tempJson.cascader_text = this.$refs.refCascader.presentText
      this.dataJson.tempJson.province = val[0]
      this.dataJson.tempJson.city = val[1]
      this.dataJson.tempJson.district = val[2]
    },

    getCascaderDataList () {
      // 级联查询逻辑
      this.settings.loading = true
      getAreasCascaderApi().then(response => {
        this.dataJson.cascader.data = response.data
      }).finally(() => {
        this.settings.loading = false
      })
    },

    // 分标签页进行表单验证并更新徽章数量
    doValidateByTabs () {
      let countOne = 0
      let countTwo = 0

      // 第一个标签页验证
      if (this.$refs.dataSubmitForm && this.settings.rulesOne) {
        Object.keys(this.settings.rulesOne).forEach(field => {
          this.$refs.dataSubmitForm.validateField(field, (errorMessage) => {
            if (errorMessage) {
              countOne++
            }
          })
        })
      }

      // 第二个标签页验证
      if (this.$refs.dataSubmitForm && this.settings.rulesTwo) {
        Object.keys(this.settings.rulesTwo).forEach(field => {
          this.$refs.dataSubmitForm.validateField(field, (errorMessage) => {
            if (errorMessage) {
              countTwo++
            }
          })
        })
      }

      this.settings.badge.countOne = countOne
      this.settings.badge.countTwo = countTwo
    },

    // 验证所有规则并合并
    doValidateAllRules () {
      // 合并两个标签页的验证规则
      this.settings.rules = {
        ...this.settings.rulesOne,
        ...this.settings.rulesTwo
      }
    },

    // 取消操作
    handleCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>
