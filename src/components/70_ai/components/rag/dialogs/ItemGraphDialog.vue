<template>
  <el-dialog
    v-el-drag-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="1200px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="graph-dialog-container">
      <item-graph-viewer
        v-if="dialogVisible && kbItemUuid"
        :kb-item-uuid="kbItemUuid"
      />
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
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
    dialogVisible: {
      get () {
        return this.visible
      },
      set (val) {
        this.$emit('update:visible', val)
      }
    },

    dialogTitle () {
      return this.itemTitle ? `${this.itemTitle} - 知识图谱` : '知识图谱'
    }
  },

  methods: {
    /**
     * 关闭弹窗
     */
    handleClose () {
      this.dialogVisible = false
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
