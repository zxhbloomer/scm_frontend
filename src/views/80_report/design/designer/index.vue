<template>
  <div class="report-designer">
    <div class="designer-header">
      <el-button-group>
        <el-button icon="el-icon-folder-add" @click="handleNew">新建</el-button>
        <el-button icon="el-icon-folder-opened" @click="handleOpen">打开</el-button>
        <el-button icon="el-icon-document" @click="handleSave">保存</el-button>
        <el-button icon="el-icon-view" @click="handlePreview">预览</el-button>
      </el-button-group>
    </div>

    <div class="designer-body">
      <div class="designer-left">
        <!-- 组件库 -->
        <component-library />
      </div>

      <div class="designer-center">
        <!-- 设计画布 -->
        <design-canvas ref="canvas" />
      </div>

      <div class="designer-right">
        <!-- 属性面板 -->
        <property-panel />
      </div>
    </div>

    <!-- 预览对话框 -->
    <preview-dialog
      v-if="previewVisible"
      :visible.sync="previewVisible"
      :report-data="currentReportData"
    />
  </div>
</template>

<script>
import ComponentLibrary from '@/components/80_report/designer/ComponentLibrary.vue'
import DesignCanvas from '@/components/80_report/designer/DesignCanvas.vue'
import PropertyPanel from '@/components/80_report/designer/PropertyPanel.vue'
import PreviewDialog from '@/components/80_report/designer/PreviewDialog.vue'
import designerApi from '@/api/80_report/design/designer.js'

export default {
  name: 'ReportDesigner',
  components: {
    ComponentLibrary,
    DesignCanvas,
    PropertyPanel,
    PreviewDialog
  },
  data () {
    return {
      previewVisible: false,
      currentReportData: null
    }
  },
  created () {
    // 设置页面标识，让FloatMenu组件能够正确管理列配置
    this.$options.name = this.$route.meta.page_code
  },
  methods: {
    /**
     * 新建报表
     */
    handleNew () {
      this.$refs.canvas.clearCanvas()
    },

    /**
     * 打开报表
     */
    handleOpen () {
      // 实现报表选择和加载逻辑
      this.$message.info('打开报表功能待实现')
    },

    /**
     * 保存报表
     */
    async handleSave () {
      try {
        const designData = this.$refs.canvas.getDesignData()
        await designerApi.saveDesign(designData)
        this.$message.success('保存成功')
      } catch (error) {
        this.$message.error('保存失败：' + error.message)
      }
    },

    /**
     * 预览报表
     */
    async handlePreview () {
      try {
        const designData = this.$refs.canvas.getDesignData()
        const result = await designerApi.previewReport(designData)
        this.currentReportData = result.data
        this.previewVisible = true
      } catch (error) {
        this.$message.error('预览失败：' + error.message)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.report-designer {
  height: 100%;
  display: flex;
  flex-direction: column;

  .designer-header {
    padding: 10px;
    border-bottom: 1px solid #ebeef5;
  }

  .designer-body {
    flex: 1;
    display: flex;
    overflow: hidden;

    .designer-left {
      width: 250px;
      border-right: 1px solid #ebeef5;
    }

    .designer-center {
      flex: 1;
      position: relative;
    }

    .designer-right {
      width: 300px;
      border-left: 1px solid #ebeef5;
    }
  }
}
</style>
