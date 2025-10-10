<template>
  <el-dialog
    v-el-drag-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="embedding-dialog-container">
      <item-embedding-list
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
import ItemEmbeddingList from '../components/ItemEmbeddingList.vue'
import elDragDialog from '@/directive/el-drag-dialog'

export default {

  name: 'ItemEmbeddingDialog',
  directives: { elDragDialog },

  components: {
    ItemEmbeddingList
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
      return this.itemTitle ? `${this.itemTitle} - 嵌入向量列表` : '嵌入向量列表'
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
.embedding-dialog-container {
  min-height: 400px;
}

.dialog-footer {
  text-align: right;
}
</style>
