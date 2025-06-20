<template>
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    v-loading="settings.loading"
    title="监管任务导出"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    custom-class="configDialog"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="600px"
    height="300px"
    destroy-on-close
  >
    <div class="formData">
      <div style="padding-bottom: 10px">
        <el-checkbox
          v-model="checkAll"
          style="width: 3%; padding-left: 0.5%"
          @change="handleCheckAllChange"
        /> 全部
        <span style="float: right">{{ checkCount }}/8</span>
      </div>
      <div>出库信息</div>
      <el-divider />
      <div>
        <div class="font">重车出库</div>
        <el-row style="padding-top: 10px; padding-bottom: 10px">
          <el-col :span="5"><el-checkbox v-model="dataJson.formData.file_17.value" :disabled="!outType" /> <span>{{ dataJson.formData.file_17.name }}</span></el-col>
          <el-col :span="5"><el-checkbox v-model="dataJson.formData.file_38.value" :disabled="!outType" /> <span>{{ dataJson.formData.file_38.name }}</span></el-col>
          <el-col :span="5"><el-checkbox v-model="dataJson.formData.file_43.value" :disabled="!outType" /> <span>{{ dataJson.formData.file_43.name }}</span></el-col>
          <el-col :span="5"><el-checkbox v-model="dataJson.formData.file_19.value" :disabled="!outType" /> <span>{{ dataJson.formData.file_19.name }}</span></el-col>
          <el-col :span="9" />
        </el-row>
      </div>
      <el-divider />
      <div>入库信息</div>
      <el-divider />

      <div>
        <div class="font">空车出库</div>
        <el-row style="padding-top: 10px; padding-bottom: 15px">
          <el-col :span="5"><el-checkbox v-model="dataJson.formData.file_35.value" :disabled="!inType" /> <span>{{ dataJson.formData.file_35.name }}</span></el-col>
          <el-col :span="5"><el-checkbox v-model="dataJson.formData.file_41.value" :disabled="!inType" /> <span>{{ dataJson.formData.file_41.name }}</span></el-col>
          <el-col :span="5"><el-checkbox v-model="dataJson.formData.file_42.value" :disabled="!inType" /> <span>{{ dataJson.formData.file_42.name }}</span></el-col>
          <el-col :span="5"><el-checkbox v-model="dataJson.formData.file_37.value" :disabled="!inType" /> <span>{{ dataJson.formData.file_37.name }}</span></el-col>
          <el-col :span="9" />
        </el-row>
      </div>
      <div style="width: 25%; margin-left: auto;">
        <el-button
          :disabled="settings.loading"
          @click="handleCancel"
        >取消</el-button>
        <el-button
          plain
          type="primary"
          :disabled="settings.loading"
          @click="handleOk"
        >确定</el-button>
      </div>
    </div>

  </el-dialog>
</template>

<script>
import {
  getExportFileSettingsDirectApi, saveDirectExportFileSettingsApi
} from '@/api/40_business/monitor/monitor'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: true
    },
    inType: {
      type: Boolean,
      default: true
    },
    outType: {
      type: Boolean,
      default: true
    }

  },
  data () {
    return {
      dataJson: {
        formData: {
          file_35: { },
          file_41: { },
          file_42: { },
          file_37: { },
          file_17: { },
          file_38: { },
          file_43: { },
          file_19: { }
        }
      },
      settings: {
        // loading 状态
        loading: true
      }

    }
  },
  computed: {
    checkAll () {
      return this.dataJson.formData.file_35.value && this.dataJson.formData.file_41.value && this.dataJson.formData.file_42.value &&
        this.dataJson.formData.file_37.value && this.dataJson.formData.file_17.value && this.dataJson.formData.file_38.value &&
        this.dataJson.formData.file_43.value && this.dataJson.formData.file_19.value && this.inType && this.outType
    },
    checkCount () {
      let count = 0
      if (this.dataJson.formData.file_35.value && this.inType) { count += 1 }
      if (this.dataJson.formData.file_41.value && this.inType) { count += 1 }
      if (this.dataJson.formData.file_42.value && this.inType) { count += 1 }
      if (this.dataJson.formData.file_37.value && this.inType) { count += 1 }
      if (this.dataJson.formData.file_17.value && this.outType) { count += 1 }
      if (this.dataJson.formData.file_38.value && this.outType) { count += 1 }
      if (this.dataJson.formData.file_43.value && this.outType) { count += 1 }
      if (this.dataJson.formData.file_19.value && this.outType) { count += 1 }
      return count
    }
  },
  created () {
    this.getFormData()
  },
  methods: {
    // 全选框
    handleCheckAllChange (val) {
      if (this.inType) {
        this.dataJson.formData.file_35.value = val
        this.dataJson.formData.file_41.value = val
        this.dataJson.formData.file_42.value = val
        this.dataJson.formData.file_37.value = val
      } else {
        this.dataJson.formData.file_35.value = false
        this.dataJson.formData.file_41.value = false
        this.dataJson.formData.file_42.value = false
        this.dataJson.formData.file_37.value = false
      }

      if (this.outType) {
        this.dataJson.formData.file_17.value = val
        this.dataJson.formData.file_38.value = val
        this.dataJson.formData.file_43.value = val
        this.dataJson.formData.file_19.value = val
      } else {
        this.dataJson.formData.file_17.value = false
        this.dataJson.formData.file_38.value = false
        this.dataJson.formData.file_43.value = false
        this.dataJson.formData.file_19.value = false
      }
    },
    getFormData () {
      getExportFileSettingsDirectApi().then(response => {
        this.settings.loading = true
        this.dataJson.formData = response.data

        if (!this.inType) {
          this.dataJson.formData.file_35.value = false
          this.dataJson.formData.file_41.value = false
          this.dataJson.formData.file_42.value = false
          this.dataJson.formData.file_37.value = false
        }

        if (!this.outType) {
          this.dataJson.formData.file_17.value = false
          this.dataJson.formData.file_38.value = false
          this.dataJson.formData.file_43.value = false
          this.dataJson.formData.file_19.value = false
        }
      }, (_error) => {
        console.log('发生了异常，请联系管理员！:' + JSON.stringify(_error))
      }).finally(() => {
        this.settings.loading = false
      })
    },
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    async handleOk () {
      this.settings.loading = true
      saveDirectExportFileSettingsApi(this.dataJson.formData)
        .then(
          _data => {
            this.$emit('closeMeOk')
          },
          _error => {
            this.settings.loading = false
          }
        )
        .finally(() => {
          this.settings.loading = false
        })
    }
  }
}
</script>

<style scoped>
.el-divider--horizontal {
  margin: 10px 0 15px 0;
}
span {
  padding-left: 12px;
}
.formData {
  .el-checkbox {
    width: 3%;
    padding-left: 10px;
  }
  .font {
    color: #115aa5;
  }
}
</style>
