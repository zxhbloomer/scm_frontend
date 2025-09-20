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
      :width="dialogConfig.width"
      destroy-on-close
    >
      <el-form
        ref="dataSubmitForm"
        :model="dataJson.tempJson"
        label-position="right"
        label-width="0px"
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
          <el-descriptions-item label="仓库名称：">
            <span class="view-text">{{ dataJson.tempJson.warehouse_name || '--' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="库区名称：">
            <span class="view-text">{{ dataJson.tempJson.location_name || '--' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="库位名称：">
            <span class="view-text">{{ dataJson.tempJson.name || '--' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="启用状态：">
            <span class="view-text" :class="dataJson.tempJson.enable ? 'status-enabled' : 'status-disabled'">
              {{ enableStatusText }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="创建人：">
            <span class="view-text">{{ dataJson.tempJson.c_name || '--' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间：">
            <span class="view-text">{{ formattedCreateTime || '--' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="更新人：">
            <span class="view-text">{{ dataJson.tempJson.u_name || '--' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="更新时间：">
            <span class="view-text">{{ formattedUpdateTime || '--' }}</span>
          </el-descriptions-item>
        </el-descriptions>
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
.el-form-item .el-select {
  width: 100%;
}

.dialog-footer {
  text-align: center;
}

/* 查看页面文本样式 */
.view-text {
  display: inline-block;
  padding: 5px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
}

/* 启用状态样式 */
.status-enabled {
  color: #67C23A;
  font-weight: bold;
}

.status-disabled {
  color: #F56C6C;
  font-weight: bold;
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
      // 对话框配置常量
      dialogConfig: {
        width: '850px',
        labelWidth: '150px'
      },

      // 描述列表样式配置
      contentStyle: {
        width: '15%'
      },
      labelStyle: {
        width: '12%',
        'text-align': 'right'
      },
      dataJson: {
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
