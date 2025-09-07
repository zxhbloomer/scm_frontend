<template>
  <!-- 数据批量导入弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    title="数据批量导入"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="620px"
    destroy-on-close
  >
    <el-form
      ref="dataForm"
      label-position="right"
      label-width="120px"
      status-icon
    >
      <el-form-item label="点击下载：">
        <el-link
          ref="refDownLoadOne"
          type="primary"
          :href="templateFilePath"
        > 模版文件下载</el-link>
      </el-form-item>

      <el-form-item label="选择导入文件：">
        <simple-upload
          :accept="'.xls,.xlsx'"
          @upload-success="handleUploadFileSuccess"
          @upload-error="handleUploadFileError"
        />
        <el-link
          v-show="!(errorFileUrl === '')"
          type="danger"
          :href="errorFileUrl"
        >
          <i class="el-icon-view el-icon--right" />错误信息
        </el-link>
      </el-form-item>
    </el-form>

    <!-- 使用说明 -->
    <p><strong>说明：</strong></p>
    <ul>
      <li>请先下载模版文件，在模版文件中进行修改后再上传</li>
      <li>支持上传的文件类型：xls、xlsx</li>
      <li>请避免excel文件格式错误</li>
      <li>文件中存在任何错误，整个文件上传都将失败</li>
      <li>如果上传失败，会自动下载错误信息，请修改完毕后再次上传</li>
    </ul>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        plain
        :disabled="settings.loading"
        @click="handleClose"
      >关 闭</el-button>
    </div>
  </el-dialog>
</template>

<style scoped>
.dialog-footer {
  text-align: center;
}

ul {
  margin: 10px 0;
  padding-left: 20px;
}

li {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}
</style>

<script>
import { importExcelApi } from '@/api/10_system/dicttype/dicttype'
import elDragDialog from '@/directive/el-drag-dialog'
import SimpleUpload from '@/components/10_file/SimpleUpload'

export default {
  name: 'DicttypeImportDialog',
  directives: { elDragDialog },
  components: {
    SimpleUpload
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      // 模版文件地址
      templateFilePath: process.env.VUE_APP_BASE_API + '/api/v1/template.html?id=P00000030',
      // 错误数据文件URL
      errorFileUrl: '',
      settings: {
        loading: false
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    }
  },
  watch: {
    listenVisible: {
      handler (newVal) {
        if (newVal) {
          this.init()
        }
      },
      immediate: true
    }
  },
  methods: {
    init () {
      // 清空错误文件URL
      this.errorFileUrl = ''

      // 设置下载链接的target
      this.$nextTick(() => {
        if (this.$refs.refDownLoadOne) {
          this.$refs.refDownLoadOne.$el.target = 'refIframe'
        }
      })
    },

    // 文件上传成功处理
    handleUploadFileSuccess (res) {
      this.settings.loading = true

      // 调用导入API
      importExcelApi(res.response.data).then(response => {
        this.errorFileUrl = ''

        if (response.code !== 0) {
          // 导入失败，显示错误文件下载链接
          this.errorFileUrl = response.data.url
          this.$message.error('您上传的excel数据有错误，请点击错误信息进行查看！')
        } else if (response.code === 0) {
          // 导入成功
          const successMessage = '成功导入 ' + response.data.length + ' 条数据'
          this.$alert(successMessage, '导入成功', {
            confirmButtonText: '关闭',
            type: 'success'
          }).then(() => {
            // 通知父组件导入成功，刷新数据
            this.$emit('closeMeOk', {
              return_flag: true,
              data: response.data
            })
          })
        }
      }).catch(error => {
        console.error('导入异常：', error)
        this.$message.error('发生了异常，请联系管理员！')
        this.$emit('closeMeOk', {
          return_flag: false,
          error: error
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },

    // 文件上传失败处理
    handleUploadFileError () {
      console.debug('文件上传失败')
      this.$notify({
        title: '导入错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
      })
    },

    // 关闭对话框
    handleClose () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>
