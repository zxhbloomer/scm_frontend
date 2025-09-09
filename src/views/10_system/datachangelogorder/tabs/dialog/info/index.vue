<template>
  <el-dialog
    v-el-drag-dialog
    :title="title"
    :visible="visible"
    :modal="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="1400px"
    destroy-on-close
    top="5vh"
  >
    <div>
      <my-page
        ref="dialogRef"
        :data="data"
        @emitReturn="handleDoCancel"
      />
    </div>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import myPage from './edit.vue'

export default {
  components: { myPage },
  directives: { elDragDialog },
  props: {
    // 页面是否显示参数
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
    },
    title: {
      type: String,
      default: '数据更新日志'
    }
  },
  data () {
    return {
      dataJson: {
        // 页面设置json
        settings: {
          // 按钮状态：是否可用
          btnDisabledStatus: {
            disabledOk: false
          }
        }
      }
    }
  },
  computed: {
  },
  // 监听器
  watch: {
  },
  created () {
  },
  methods: {
    // 取消
    handleDoCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>
