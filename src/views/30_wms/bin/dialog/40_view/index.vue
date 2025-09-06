<template>
  <div>
    <!-- 查看库位弹窗 -->
    <el-dialog
      v-if="visible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      title="库位查看"
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
        label-width="150px"
      >
        <br>
        <el-row>
          <el-col :span="12">
            <el-form-item label="仓库名称：">
              <el-input
                v-model.trim="dataJson.tempJson.warehouse_name"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库区名称：">
              <el-input
                v-model.trim="dataJson.tempJson.location_name"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="库位名称：">
              <el-input
                v-model.trim="dataJson.tempJson.name"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用状态：">
              <el-input
                v-model.trim="enableStatusText"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="创建人：">
              <el-input
                v-model.trim="dataJson.tempJson.c_name"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="创建时间：">
              <el-input
                v-model.trim="formattedCreateTime"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="更新人：">
              <el-input
                v-model.trim="dataJson.tempJson.u_name"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新时间：">
              <el-input
                v-model.trim="formattedUpdateTime"
                disabled
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
          plain
          :disabled="settings.loading"
          @click="handleCancel()"
        >关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.floatRight {
  float: right;
}
.floatLeft {
  float: left;
}
.el-form-item .el-select {
  width: 100%;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'

export default {
  name: 'BinViewDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      dataJson: {
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          name: '',
          warehouse_id: undefined,
          warehouse_name: '',
          location_id: undefined,
          location_name: '',
          enable: false,
          c_name: '',
          c_time: '',
          u_name: '',
          u_time: ''
        },
        // 单条数据 json
        tempJson: {
          name: '',
          warehouse_name: '',
          location_name: '',
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
  computed: {
    listenVisible () {
      return this.visible
    },
    // 启用状态文字显示
    enableStatusText () {
      if (this.dataJson.tempJson.enable === true || this.dataJson.tempJson.enable === 'true') {
        return '已启用'
      } else {
        return '未启用'
      }
    },
    // 格式化创建时间
    formattedCreateTime () {
      return this.formatDateTime(this.dataJson.tempJson.c_time)
    },
    // 格式化更新时间
    formattedUpdateTime () {
      return this.formatDateTime(this.dataJson.tempJson.u_time)
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
    }
  },
  methods: {
    // 初始化处理
    init () {
      // 数据初始化 - 查看模式使用传入的data
      if (this.data) {
        this.dataJson.tempJson = deepCopy(this.data)
      }
    },
    // 关闭按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>
