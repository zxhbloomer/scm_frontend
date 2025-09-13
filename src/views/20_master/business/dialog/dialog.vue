<template>
  <el-dialog
    v-if="listenVisible"
    v-el-drag-dialog
    title="板块选择页面"
    :visible="visible"
    :modal="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="1300px"
    destroy-on-close
    top="5vh"
  >
    <my-page
      ref="dialogRef"
      :me-dialog-status="visible"
      :data="data"
    />

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button
        type="primary"
        :disabled="!selectedData.id"
        @click="handleOk"
      >确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import myPage from './page.vue'

export default {
  name: 'BusinessDialog',
  directives: { elDragDialog },
  components: { myPage },
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
      selectedData: {}
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    }
  },
  created () {
    // 设置页面标识，让FloatMenu组件能够正确管理列配置
    this.$options.name = this.$route.meta.page_code
  },
  methods: {
    handleOk () {
      this.$emit('closeMeOk', this.selectedData)
    },
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 监听子组件选择
    handleRowSelection (data) {
      this.selectedData = data
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: center;
}
</style>
