<template>
  <!-- 查看物料弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="物料查看"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="850px"
    destroy-on-close
  >
    <div class="view-container">
      <el-alert
        title="基本信息"
        type="info"
        :closable="false"
      />
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
          <div slot="label">所属板块</div>
          <span>{{ dataJson.tempJson.business_name || '-' }}</span>
        </el-descriptions-item>

        <el-descriptions-item>
          <div slot="label">所属行业</div>
          <span>{{ dataJson.tempJson.industry_name || '-' }}</span>
        </el-descriptions-item>

        <el-descriptions-item>
          <div slot="label">所属类别</div>
          <span>{{ dataJson.tempJson.category_name || '-' }}</span>
        </el-descriptions-item>

        <el-descriptions-item>
          <div slot="label">物料名称</div>
          <span>{{ dataJson.tempJson.name || '-' }}</span>
        </el-descriptions-item>

        <el-descriptions-item>
          <div slot="label">物料编码</div>
          <span>{{ dataJson.tempJson.code || '-' }}</span>
        </el-descriptions-item>

        <el-descriptions-item>
          <div slot="label">启用状态</div>
          <el-tag
            :type="dataJson.tempJson.enable ? 'success' : 'danger'"
            size="mini"
          >
            {{ dataJson.tempJson.enable ? '已启用' : '未启用' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 系统信息 -->
      <el-descriptions
        v-if="dataJson.tempJson.id"
        title=""
        :column="2"
        :content-style="contentStyle"
        :label-style="labelStyle"
        direction="horizontal"
        border
        style="padding-right: 10px;padding-left: 10px;margin-top: 20px;"
      >
        <el-descriptions-item>
          <div slot="label">创建人</div>
          <span>{{ dataJson.tempJson.c_name || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item>
          <div slot="label">创建时间</div>
          <span>{{ formatDateTime(dataJson.tempJson.c_time) || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item>
          <div slot="label">更新人</div>
          <span>{{ dataJson.tempJson.u_name || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item>
          <div slot="label">更新时间</div>
          <span>{{ formatDateTime(dataJson.tempJson.u_time) || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item>
          <div slot="label">数据版本</div>
          <span>{{ dataJson.tempJson.dbversion || 0 }}</span>
        </el-descriptions-item>
        <el-descriptions-item>
          <div slot="label">物料ID</div>
          <span>{{ dataJson.tempJson.id || '-' }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 关联信息 -->
      <el-descriptions
        title=""
        :column="2"
        :content-style="contentStyle"
        :label-style="labelStyle"
        direction="horizontal"
        border
        style="padding-right: 10px;padding-left: 10px;margin-top: 20px;"
      >
        <el-descriptions-item>
          <div slot="label">板块编码</div>
          <span>{{ dataJson.tempJson.business_code || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item>
          <div slot="label">行业编码</div>
          <span>{{ dataJson.tempJson.industry_code || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item>
          <div slot="label">类别编码</div>
          <span>{{ dataJson.tempJson.category_code || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item>
          <div slot="label">完整编码路径</div>
          <span>
            {{
              [
                dataJson.tempJson.business_code,
                dataJson.tempJson.industry_code,
                dataJson.tempJson.category_code
              ].filter(code => code).join(' > ') || '-'
            }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        plain
        type="primary"
        @click="handleClose()"
      >关闭</el-button>
      <el-button
        v-if="showEditButton"
        plain
        type="success"
        @click="handleEdit()"
      >编辑</el-button>
    </div>
  </el-dialog>
</template>

<style scoped>
.view-container {
  max-height: 70vh;
  overflow-y: auto;
}
.dialog-footer {
  text-align: center;
}
.el-descriptions >>> .el-descriptions__label {
  font-weight: bold;
}
.el-descriptions >>> .el-descriptions__content {
  word-break: break-all;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'

export default {
  name: 'GoodsViewDialog',
  directives: { elDragDialog },
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
    showEditButton: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      dataJson: {
        tempJson: {
          id: null,
          business_id: '',
          business_code: '',
          business_name: '',
          industry_id: '',
          industry_code: '',
          industry_name: '',
          category_id: '',
          category_code: '',
          category_name: '',
          name: '',
          code: '',
          enable: false,
          c_name: '',
          c_time: '',
          u_name: '',
          u_time: '',
          dbversion: 0
        }
      },
      settings: {
        loading: false,
        duration: 4000
      },
      // 样式设置
      contentStyle: {
        'background-color': '#f9f9f9',
        'padding': '12px',
        'min-height': '32px'
      },
      labelStyle: {
        'font-weight': 'bold',
        'width': '140px',
        'background-color': '#fafafa'
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
    }
  },
  methods: {
    init () {
      // 初始化数据
      if (this.data) {
        this.dataJson.tempJson = deepCopy(this.data)
      }

      // 如果有ID但没有完整数据，可以在这里调用API获取完整信息
      if (this.id && !this.data) {
        this.loadDetailData()
      }
    },

    // 加载详细数据（如果需要）
    async loadDetailData () {
      try {
        this.settings.loading = true
        // 这里可以调用getDetailApi获取完整数据
        // const response = await getDetailApi(this.id)
        // this.dataJson.tempJson = response.data
      } catch (error) {
        this.showErrorMsg('加载数据失败：' + error.message)
      } finally {
        this.settings.loading = false
      }
    },

    // 关闭对话框
    handleClose () {
      this.$emit('closeMeCancel')
    },

    // 切换到编辑模式
    handleEdit () {
      this.$emit('switchToEdit', this.dataJson.tempJson)
    },

    // 格式化显示文本
    formatDisplayText (text) {
      return text || '-'
    }
  }
}
</script>
