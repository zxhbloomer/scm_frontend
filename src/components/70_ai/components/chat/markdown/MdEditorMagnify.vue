<template>
  <div class="md-editor-magnify-container">
    <v-md-editor
      v-model="data"
      v-bind="$attrs"
      :preview="false"
      :toolbars="[]"
      class="magnify-md-editor"
      :left-toolbar="leftToolbar"
    >
      <template #left-toolbar-after>
        <el-button size="mini" type="text" @click="openDialog">
          <i class="el-icon-zoom-in" style="font-size: 16px; color: #909399;" />
        </el-button>
      </template>
    </v-md-editor>
    <!-- 内容编辑弹出层 -->
    <el-dialog
      :visible.sync="dialogVisible"
      :title="title"
      append-to-body
      center
      width="80%"
      :close-on-click-modal="false"
    >
      <v-md-editor
        v-model="cloneContent"
        :preview="false"
        :toolbars="[]"
        :left-toolbar="''"
        height="400px"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDialog">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import VMdEditor from '@kangc/v-md-editor'

export default {
  name: 'MdEditorMagnify',
  components: {
    'v-md-editor': VMdEditor
  },
  props: {
    title: {
      type: String,
      default: '编辑内容'
    },
    value: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      dialogVisible: false,
      cloneContent: '',
      leftToolbar: 'undo redo clear | h bold italic strikethrough quote | ul ol table hr | link image code | magnify'
    }
  },
  computed: {
    data: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    }
  },
  watch: {
    dialogVisible (bool) {
      if (!bool) {
        this.$emit('submitDialog', this.cloneContent)
      }
    }
  },
  methods: {
    openDialog () {
      this.cloneContent = this.value
      this.dialogVisible = true
    },
    submitDialog () {
      this.$emit('input', this.cloneContent)
      this.$emit('submitDialog', this.cloneContent)
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.magnify-md-editor {
  ::v-deep .v-md-editor {
    border: 1px solid #DCDFE6;
    border-radius: 4px;
  }

  ::v-deep .v-md-editor-footer {
    border: none !important;
  }
}

/* 弹窗中的编辑器样式 */
.el-dialog__body {
  padding: 10px 20px;
}

.dialog-footer {
  margin-top: 20px;
}
</style>
