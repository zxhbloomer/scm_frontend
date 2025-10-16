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
      class="item-embedding-dialog"
      width="900px"
      destroy-on-close
      top="5vh"
      @close="handleClose"
    >
      <div class="embedding-dialog-container">
        <item-embedding-list
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
    dialogTitle () {
      return this.itemTitle ? `${this.itemTitle} - 嵌入向量列表` : '嵌入向量列表'
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
.embedding-dialog-container {
  min-height: 400px;
}

.dialog-footer {
  text-align: right;
}
</style>
