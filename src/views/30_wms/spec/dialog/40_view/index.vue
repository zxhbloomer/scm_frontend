<template>
  <!-- 查看规格弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    title="规格详情"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="850px"
    destroy-on-close
  >
    <el-alert
      title="基本信息"
      type="info"
      :closable="false"
    />
    <br>

    <!-- 基本信息 -->
    <el-descriptions
      title=""
      :column="2"
      direction="horizontal"
      border
      style="margin-bottom: 20px;"
    >
      <el-descriptions-item label="所属板块">
        {{ data.business_name || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="所属行业">
        {{ data.industry_name || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="所属类别">
        {{ data.category_name || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="物料名称">
        {{ data.name || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="商品属性">
        {{ data.prop_name || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="规格">
        {{ data.spec || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="规格编号">
        {{ data.sku_code || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="启用状态">
        <el-tag :type="data.enable ? 'success' : 'danger'">
          {{ data.enable ? '已启用' : '未启用' }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <!-- 扩展信息 -->
    <el-alert
      title="扩展信息"
      type="info"
      :closable="false"
    />
    <br>

    <el-descriptions
      title=""
      :column="3"
      direction="horizontal"
      border
      style="margin-bottom: 20px;"
    >
      <el-descriptions-item label="净重">
        {{ data.net_weight || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="毛重">
        {{ data.rough_weight || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="体积">
        {{ data.volume || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="单位">
        {{ data.unit || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="产地">
        {{ data.origin || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item />
    </el-descriptions>

    <!-- 系统信息 -->
    <el-alert
      title="系统信息"
      type="warning"
      :closable="false"
    />
    <br>

    <el-descriptions
      title=""
      :column="2"
      direction="horizontal"
      border
    >
      <el-descriptions-item label="创建人">
        {{ data.c_name || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="创建时间">
        {{ formatDateTime(data.c_time) || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="更新人">
        {{ data.u_name || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="更新时间">
        {{ formatDateTime(data.u_time) || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="数据版本">
        {{ data.dbversion || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="记录ID">
        {{ data.id || '暂无' }}
      </el-descriptions-item>
    </el-descriptions>

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
    </div>
  </el-dialog>
</template>

<style scoped>
.dialog-footer {
  text-align: center;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'SpecViewDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    id: {
      type: [String, Number],
      default: undefined
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    handleClose () {
      this.$emit('closeMeOk')
    }
  }
}
</script>
