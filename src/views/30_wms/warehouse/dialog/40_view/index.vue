<template>
  <!-- 查看仓库弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="查看"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="950px"
    destroy-on-close
  >
    <el-form
      :model="dataJson.tempJson"
      label-position="right"
      label-width="150px"
    >
      <el-tabs style="height: 380px">
        <br>

        <el-tab-pane label="基本信息">
          <el-descriptions
            :content-style="contentStyle"
            :label-style="labelStyle"
            :column="2"
          >
            <el-descriptions-item label="仓库编码：">
              <span class="view-text">{{ dataJson.tempJson.code || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="仓库名称：">
              <span class="view-text">{{ dataJson.tempJson.name || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="仓库简称：">
              <span class="view-text">{{ dataJson.tempJson.short_name || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="仓库类型：">
              <span class="view-text">{{ getWarehouseTypeText(dataJson.tempJson.warehouse_type) || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="监管企业：">
              <span class="view-text">{{ dataJson.tempJson.charge_company_name || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="运营企业：">
              <span class="view-text">{{ dataJson.tempJson.operate_company_name || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="联系人：">
              <span class="view-text">{{ dataJson.tempJson.contact_person || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="联系手机：">
              <span class="view-text">{{ dataJson.tempJson.mobile_phone || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="省市区：">
              <span class="view-text">{{ getCascaderText() || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="片区：">
              <span class="view-text">{{ getZoneText(dataJson.tempJson.zone) || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="详细地址：" :span="2">
              <div class="view-textarea">{{ dataJson.tempJson.address || '--' }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="其他信息">
          <el-descriptions
            :content-style="contentStyle"
            :label-style="labelStyle"
            :column="2"
          >
            <el-descriptions-item label="仓库面积：">
              <span class="view-text">{{ dataJson.tempJson.area || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="仓库容积：">
              <span class="view-text">{{ dataJson.tempJson.warehouse_capacity || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="经度信息：">
              <span class="view-text">{{ dataJson.tempJson.longitude || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="纬度信息：">
              <span class="view-text">{{ dataJson.tempJson.latitude || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="启用日期：">
              <span class="view-text">{{ dataJson.tempJson.start_dt || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="到期日期：">
              <span class="view-text">{{ dataJson.tempJson.end_dt || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="每日收货开始时间：">
              <span class="view-text">{{ dataJson.tempJson.receive_start_time || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="每日收货结束时间：">
              <span class="view-text">{{ dataJson.tempJson.receive_end_time || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="每日发货开始时间：">
              <span class="view-text">{{ dataJson.tempJson.deliver_start_time || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="每日发货结束时间：">
              <span class="view-text">{{ dataJson.tempJson.deliver_end_time || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="是否启用：">
              <el-tag :type="dataJson.tempJson.enable === 1 || dataJson.tempJson.enable === true ? 'success' : 'danger'">
                {{ dataJson.tempJson.enable === 1 || dataJson.tempJson.enable === true ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="是否质检仓：">
              <el-tag :type="dataJson.tempJson.warehouse_check === 1 || dataJson.tempJson.warehouse_check === true ? 'success' : 'info'">
                {{ dataJson.tempJson.warehouse_check === 1 || dataJson.tempJson.warehouse_check === true ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="启用库区：">
              <el-tag :type="dataJson.tempJson.enable_location === 1 || dataJson.tempJson.enable_location === true ? 'success' : 'info'">
                {{ dataJson.tempJson.enable_location === 1 || dataJson.tempJson.enable_location === true ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="启用库位：">
              <el-tag :type="dataJson.tempJson.enable_bin === 1 || dataJson.tempJson.enable_bin === true ? 'success' : 'info'">
                {{ dataJson.tempJson.enable_bin === 1 || dataJson.tempJson.enable_bin === true ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
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
        :disabled="settings.loading"
        @click="handleCancel()"
      >关闭</el-button>
    </div>
  </el-dialog>
</template>

<style scoped>
.view-text {
  color: #606266;
  font-size: 14px;
  line-height: 32px;
}

.view-textarea {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  min-height: 32px;
  padding: 5px 0;
  word-break: break-all;
}

.dialog-footer {
  text-align: center;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
.el-button-group {
  margin-bottom: 15px;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import deepcopy from 'deep-copy'

export default {
  name: 'WarehouseViewDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    viewData: {
      type: Object,
      default: () => ({})
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
      dataJson: {
        tempJson: {
          id: undefined,
          code: '',
          name: '',
          short_name: '',
          warehouse_type: '',
          charge_company_id: undefined,
          charge_company_name: '',
          operate_company_id: undefined,
          operate_company_name: '',
          contact_person: '',
          mobile_phone: '',
          province: '',
          city: '',
          district: '',
          zone: '',
          address: '',
          area: '',
          warehouse_capacity: '',
          longitude: '',
          latitude: '',
          start_dt: '',
          end_dt: '',
          receive_start_time: '',
          receive_end_time: '',
          deliver_start_time: '',
          deliver_end_time: '',
          enable: 1,
          warehouse_check: false,
          enable_location: false,
          enable_bin: false,
          remark: '',
          c_name: '',
          c_time: '',
          u_name: '',
          u_time: '',
          dbversion: undefined
        }
      },
      settings: {
        loading: false
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
    viewData: {
      handler (newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.dataJson.tempJson = deepcopy(newVal)
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    init () {
      // 数据回填
      if (this.viewData && Object.keys(this.viewData).length > 0) {
        this.dataJson.tempJson = deepcopy(this.viewData)
      }
    },

    // 获取仓库类型文本
    getWarehouseTypeText (type) {
      // 使用系统常量获取正确的仓库类型标签
      if (type === this.CONSTANTS.DICT_M_WAREHOUSE_TYPE_ZX) return '直属库'
      if (type === this.CONSTANTS.DICT_M_WAREHOUSE_TYPE_WD) return '加工厂库'
      if (type === this.CONSTANTS.DICT_M_WAREHOUSE_TYPE_TL) return '铁路码头虚拟库'
      if (type === this.CONSTANTS.DICT_M_WAREHOUSE_TYPE_CL) return '饲料厂库'
      return type
    },

    // 获取省市区级联文本显示
    getCascaderText () {
      // 优先使用编辑时生成的中文文本字段
      if (this.dataJson.tempJson.cascader_text) {
        return this.dataJson.tempJson.cascader_text
      }
      // 备用显示（显示原始ID，用于调试）
      if (this.dataJson.tempJson.province && this.dataJson.tempJson.city && this.dataJson.tempJson.district) {
        return `${this.dataJson.tempJson.province} / ${this.dataJson.tempJson.city} / ${this.dataJson.tempJson.district}`
      }
      return ''
    },

    // 获取片区文本
    getZoneText (zone) {
      if (zone === this.CONSTANTS.DICT_M_WAREHOUSE_ZONE_HD) return '华东'
      if (zone === this.CONSTANTS.DICT_M_WAREHOUSE_ZONE_HB) return '华北'
      if (zone === this.CONSTANTS.DICT_M_WAREHOUSE_ZONE_HN) return '华南'
      if (zone === this.CONSTANTS.DICT_M_WAREHOUSE_ZONE_HZ) return '华中'
      if (zone === this.CONSTANTS.DICT_M_WAREHOUSE_ZONE_XB) return '西北'
      if (zone === this.CONSTANTS.DICT_M_WAREHOUSE_ZONE_XN) return '西南'
      if (zone === this.CONSTANTS.DICT_M_WAREHOUSE_ZONE_DB) return '东北'
      return zone
    },

    // 取消操作
    handleCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>
