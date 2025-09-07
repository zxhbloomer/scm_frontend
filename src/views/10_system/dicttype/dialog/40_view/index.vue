<template>
  <!-- 查看字典类型弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    title="字典类型详情"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="700px"
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
      <el-descriptions-item label="字典类型">
        {{ data.code || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="字典名称">
        {{ data.name || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="说明" :span="2">
        {{ data.descr || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="启用状态">
        <el-tag :type="!data.is_del ? 'success' : 'danger'">
          {{ !data.is_del ? '已启用' : '已删除' }}
        </el-tag>
      </el-descriptions-item>

      <el-descriptions-item label="数据版本">
        {{ data.dbversion || '暂无' }}
      </el-descriptions-item>
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

      <el-descriptions-item label="记录ID">
        {{ data.id || '暂无' }}
      </el-descriptions-item>

      <el-descriptions-item label="数据版本">
        {{ data.dbversion || '暂无' }}
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
  name: 'DicttypeViewDialog',
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
  methods: {
    handleClose () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>
