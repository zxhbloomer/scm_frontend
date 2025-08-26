<template>
  <!-- 查看弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    title="企业查看"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="800px"
    destroy-on-close
  >
    <el-form
      :model="dataJson.tempJson"
      label-position="right"
      label-width="140px"
    >
      <el-alert
        title="基本信息"
        type="info"
        :closable="false"
      />
      <br>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="企业编号："
            prop="code"
          >
            <span class="view-text">{{ dataJson.tempJson.code || '--' }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="社会信用代码："
            prop="company_no"
          >
            <span class="view-text">{{ dataJson.tempJson.company_no || '--' }}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="企业名称："
            prop="name"
          >
            <span class="view-text">{{ dataJson.tempJson.name || '--' }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="企业简称："
            prop="simple_name"
          >
            <span class="view-text">{{ dataJson.tempJson.simple_name || '--' }}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="法定代表人："
            prop="juridical_name"
          >
            <span class="view-text">{{ dataJson.tempJson.juridical_name || '--' }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="注册资本（万）："
            prop="register_capital"
          >
            <span class="view-text">{{ formatCurrency(dataJson.tempJson.register_capital,'true',4) || '--' }}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="成立日期："
            prop="setup_date"
          >
            <span class="view-text">{{ dataJson.tempJson.setup_date ? formatDate(dataJson.tempJson.setup_date) : '--' }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="企业类型："
            prop="type_name"
          >
            <span class="view-text">{{ dataJson.tempJson.type_name || '--' }}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="集团信息："
            prop="group_simple_name"
          >
            <span class="view-text">{{ dataJson.tempJson.group_simple_name || '--' }}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        label="备注："
        prop="descr"
      >
        <div class="view-textarea">{{ dataJson.tempJson.descr || '--' }}</div>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="创建人："
            prop="c_name"
          >
            <span class="view-text">{{ dataJson.tempJson.c_name || '--' }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="创建时间："
            prop="c_time"
          >
            <span class="view-text">{{ dataJson.tempJson.c_time ? formatDateTime(dataJson.tempJson.c_time) : '--' }}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="更新人："
            prop="u_name"
          >
            <span class="view-text">{{ dataJson.tempJson.u_name || '--' }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="更新时间："
            prop="u_time"
          >
            <span class="view-text">{{ dataJson.tempJson.u_time ? formatDateTime(dataJson.tempJson.u_time) : '--' }}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="删除状态："
            prop="is_del"
          >
            <span class="view-text">{{ dataJson.tempJson.is_del ? '已删除' : '未删除' }}</span>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        type="primary"
        @click="handleDialogClose"
      >关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'

export default {
  name: 'CompanyViewDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      dataJson: {
        // 表单数据
        tempJson: {}
      }
    }
  },
  watch: {
    visible: {
      handler (newVal) {
        if (newVal && this.data) {
          // 深拷贝传入的数据
          this.dataJson.tempJson = deepCopy(this.data)
        }
      },
      immediate: true
    }
  },
  methods: {
    // 关闭
    handleDialogClose () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>

<style scoped>
.view-text {
  color: #606266;
  font-size: 14px;
  line-height: 32px;
  display: inline-block;
  min-height: 32px;
}

.view-textarea {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  min-height: 80px;
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>
