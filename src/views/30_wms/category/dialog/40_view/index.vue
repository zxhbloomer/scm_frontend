<template>
  <!-- 查看类别弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="查看类别"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="850px"
    destroy-on-close
  >
    <el-form
      ref="dataSubmitForm"
      :model="dataJson.tempJson"
      label-position="right"
      label-width="0px"
      status-icon
    >
      <br>
      <el-descriptions
        title=""
        :column="2"
        :content-style="contentStyle"
        :label-style="labelStyle"
        direction="horizontal"
        border
        style="padding-right: 10px;padding-left: 10px;"
      >
        <el-descriptions-item>
          <div
            slot="label"
            class="label-text"
          >
            所属板块
          </div>
          <el-form-item
            label-width="0"
          >
            <el-input
              v-model.trim="dataJson.tempJson.business_name"
              :disabled="true"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item>
          <div
            slot="label"
            class="label-text"
          >
            所属行业：
          </div>
          <el-form-item
            label-width="0"
          >
            <el-input
              v-model.trim="dataJson.tempJson.industry_name"
              :disabled="true"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item>
          <div
            slot="label"
            class="label-text"
          >
            类别名称：
          </div>
          <el-form-item>
            <el-input
              v-model.trim="dataJson.tempJson.name"
              :disabled="true"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item>
          <div
            slot="label"
            class="label-text"
          >
            类别编号：
          </div>
          <el-form-item>
            <el-input
              v-model.trim="dataJson.tempJson.code"
              :disabled="true"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item>
          <div
            slot="label"
            class="label-text"
          >
            启用状态：
          </div>
          <el-form-item>
            <el-switch
              v-model="dataJson.tempJson.enable"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="true"
              :inactive-value="false"
              :width="30"
              :disabled="true"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item>
          <div
            slot="label"
            class="label-text"
          >
            创建人：
          </div>
          <el-form-item>
            <el-input
              v-model.trim="dataJson.tempJson.c_name"
              :disabled="true"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item>
          <div
            slot="label"
            class="label-text"
          >
            创建时间：
          </div>
          <el-form-item>
            <el-input
              :value="formatDateTime(dataJson.tempJson.c_time)"
              :disabled="true"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item>
          <div
            slot="label"
            class="label-text"
          >
            更新人：
          </div>
          <el-form-item>
            <el-input
              v-model.trim="dataJson.tempJson.u_name"
              :disabled="true"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item>
          <div
            slot="label"
            class="label-text"
          >
            更新时间：
          </div>
          <el-form-item>
            <el-input
              :value="formatDateTime(dataJson.tempJson.u_time)"
              :disabled="true"
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
        @click="handleCancel()"
      >关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'

export default {
  components: {},
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
        // 单条数据 json
        tempJson: {
          business_name: '',
          industry_name: '',
          name: '',
          code: '',
          enable: false,
          c_name: '',
          c_time: '',
          u_name: '',
          u_time: ''
        }
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: false
      }
    }
  },
  created () {
    this.init()
  },
  methods: {
    // 初始化处理
    init () {
      this.initViewModel()
    },
    // 查看时的初始化
    initViewModel () {
      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.data)
    },
    // 关闭按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>

<style scoped>
.label-text {
  color: #606266;
  font-weight: normal;
}
.dialog-footer {
  text-align: center;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
.el-form-item .el-select {
  width: 100%;
}
.el-button-group {
  margin-bottom: 15px;
}
</style>
