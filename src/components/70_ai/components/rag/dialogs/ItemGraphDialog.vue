<template>
  <div>
    <el-dialog
      v-if="visible"
      v-el-drag-dialog
      :visible="visible"
      :title="dialogTitle"
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :append-to-body="true"
      :modal-append-to-body="true"
      class="item-graph-dialog"
      width="1200px"
      destroy-on-close
      top="5vh"
      @close="handleClose"
    >
      <div class="graph-dialog-container">
        <item-graph-viewer
          v-if="visible && kbItemUuid"
          :kb-item-uuid="kbItemUuid"
        />
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ItemGraphViewer from '../components/ItemGraphViewer.vue'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'ItemGraphDialog',

  directives: { elDragDialog },

  components: {
    ItemGraphViewer
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    kbItemUuid: {
      type: String,
      default: ''
    },
    itemTitle: {
      type: String,
      default: ''
    }
  },

  computed: {
    dialogTitle () {
      return this.itemTitle ? `${this.itemTitle} - 知识图谱` : '知识图谱'
    }
  },

  methods: {
    /**
     * 关闭弹窗
     */
    handleClose () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>
.graph-dialog-container {
  min-height: 600px;
}

.dialog-footer {
  text-align: right;
}
</style>
