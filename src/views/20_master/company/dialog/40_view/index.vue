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
            <el-input
              v-model="dataJson.tempJson.code"
              disabled
              placeholder=""
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="社会信用代码："
            prop="company_no"
          >
            <el-input
              v-model="dataJson.tempJson.company_no"
              disabled
              placeholder=""
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="企业名称："
            prop="name"
          >
            <el-input
              v-model="dataJson.tempJson.name"
              disabled
              placeholder=""
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="企业简称："
            prop="simple_name"
          >
            <el-input
              v-model="dataJson.tempJson.simple_name"
              disabled
              placeholder=""
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="法定代表人："
            prop="juridical_name"
          >
            <el-input
              v-model="dataJson.tempJson.juridical_name"
              disabled
              placeholder=""
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="注册资本（万）："
            prop="register_capital"
          >
            <el-input
              :value="formatCurrency(dataJson.tempJson.register_capital,'true',4)"
              disabled
              placeholder=""
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="成立日期："
            prop="setup_date"
          >
            <el-input
              :value="dataJson.tempJson.setup_date ? formatDate(dataJson.tempJson.setup_date) : ''"
              disabled
              placeholder=""
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="企业类型："
            prop="type_name"
          >
            <el-input
              v-model="dataJson.tempJson.type_name"
              disabled
              placeholder=""
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="集团信息："
            prop="group_full_simple_name"
          >
            <el-input
              v-model="dataJson.tempJson.group_full_simple_name"
              disabled
              placeholder=""
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        label="说明："
        prop="descr"
      >
        <el-input
          v-model="dataJson.tempJson.descr"
          type="textarea"
          disabled
          placeholder=""
        />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="创建人："
            prop="c_name"
          >
            <el-input
              v-model="dataJson.tempJson.c_name"
              disabled
              placeholder=""
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="创建时间："
            prop="c_time"
          >
            <el-input
              :value="dataJson.tempJson.c_time ? formatDateTime(dataJson.tempJson.c_time) : ''"
              disabled
              placeholder=""
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="更新人："
            prop="u_name"
          >
            <el-input
              v-model="dataJson.tempJson.u_name"
              disabled
              placeholder=""
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="更新时间："
            prop="u_time"
          >
            <el-input
              :value="dataJson.tempJson.u_time ? formatDateTime(dataJson.tempJson.u_time) : ''"
              disabled
              placeholder=""
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="删除状态："
            prop="is_del"
          >
            <el-input
              :value="dataJson.tempJson.is_del ? '已删除' : '未删除'"
              disabled
              placeholder=""
            />
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
</style>
