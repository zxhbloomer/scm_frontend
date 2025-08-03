<template>
  <div>
    <!-- pop窗口 数据编辑:新增、修改 -->
    <el-dialog
      v-if="listenVisible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      title="中止弹出框"
      :visible="visible"
      :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
      :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
      :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="950px"
      destroy-on-close
    >
      <el-form
        ref="dataSubmitForm"
        :rules="settings.rules"
        :model="dataJson.tempJson"
        label-position="rigth"
        label-width="0px"
        status-icon
      >
        <br>
        <el-alert
          title="中止理由"
          type="info"
          :closable="false"
        />
        <br>
        <el-descriptions
          title=""
          :column="1"
          :label-style="fileLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              中止理由
            </div>
            <el-form-item
              prop="stop_reason"
              label-width="0"
            >
              <el-input
                ref="refFocusOne"
                v-model.trim="dataJson.tempJson.stop_reason"
                type="textarea"
                clearable
                show-word-limit
                :placeholder="isPlaceholderShow('请输入')"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="附件">
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col :span="1">
                <Simple-upload-mutil-file
                  :accept="'*'"
                  @upload-success="handleOtherUploadFileSuccess"
                  @upload-error="handleFileError"
                />
              </el-col>
              <el-col
                v-for="(item, i) in dataJson.stop_data"
                :key="i"
                :offset="3"
                :span="5"
              >
                <previewCard
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeOtherFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>
        </el-descriptions>
        <br>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-divider />
        <el-button
          plain
          :disabled="settings.loading"
          @click="handleCancel()"
        >取消</el-button>
        <el-button
          plain
          type="primary"
          :disabled="settings.loading || settings.btnDisabledStatus.disabledInsert "
          @click="doInsert()"
        >确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.edit-container {
  height: calc(100vh - 160px);
  overflow-x: auto;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}
.dialog-footer {
  text-align: center;
}
.floatRight {
  float: right;
}
.floatLeft {
  float: left;
}
.el-form-item .el-select {
  width: 100%;
}
.el-button-group {
  margin-bottom: 15px;
}
.el-popup-border-color >>> .el-input__inner {
  border-color: #1890ff;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { suspendPayment } from '@/api/40_business/10_po/ap/ap'
import { EventBus } from '@/common/eventbus/eventbus'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'

export default {
  components: { PreviewCard, SimpleUploadMutilFile },
  directives: { elDragDialog },
  mixins: [],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    id: {
      type: Number,
      default: null
    },
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      fileLabelStyle: {
        width: '3%',
        'text-align': 'right'
      },
      contentStyle: {
        width: '15%'
      },
      labelStyle: {
        width: '10%',
        'text-align': 'right'
      },
      popSettingsData: {},
      dataJson: {
        // 附件
        stop_data: [],
        stop_file: [],
        stop_files: [],

        // 单条数据 json
        tempJson: null,
        inputSettings: {
        }
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        // 按钮是否显示，默认不显示，false：不显示，true：显示
        btnShowStatus: {
          showInsert: false,
          showUpdate: false
        },
        // 按钮状态：是否可用，false:可用，true不可用
        btnDisabledStatus: {
          disabledInsert: true,
          disabledUpdate: true
        },
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: this.dialogStatus,
        // pop的check内容
        rules: {
          stop_reason: [
            { required: true, message: '请输入作废理由', trigger: 'change' }
          ]
        }
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    },
    isViewModel () {
      if (this.settings.dialogStatus === this.PARAMETERS.STATUS_VIEW) {
        return true
      } else {
        return false
      }
    }
  },
  // 监听器
  watch: {
    // 监听页面上面是否有修改，有修改按钮高亮
    'dataJson.tempJson': {
      handler (newVal, oldVal) {
        this.settings.btnDisabledStatus.disabledInsert = false
        this.settings.btnDisabledStatus.disabledUpdate = false
      },
      deep: true
    },
    // 全屏loading监听
    'settings.loading': {}
  },
  created () {
    this.init()
  },
  mounted () {
    // 描绘完成
  },
  destroyed () {
  },
  methods: {
    // 初始化处理
    init () {
      this.initButtonShowStatus()
      this.initButtonDisabledStatus()

      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.$options.data.call(this).dataJson.tempJson)

      this.settings.loading = false
    },
    initButtonShowStatus () {
      // 初始化按钮状态：默认都隐藏
      this.settings.btnShowStatus = this.$options.data.call(
        this
      ).settings.btnShowStatus
    },
    initButtonDisabledStatus () {
      // 按钮状态初始化：默认不可用
      this.settings.btnDisabledStatus = this.$options.data.call(
        this
      ).settings.btnDisabledStatus
    },
    // Placeholder设置
    isPlaceholderShow (val) {
      if (this.isViewModel) {
        return ''
      } else {
        return val
      }
    },

    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 其他附件上传成功
    handleOtherUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.stop_data.push(res.response.data)
      this.dataJson.stop_file.push(res.response.data.url)
      this.dataJson.tempJson.stop_files = this.dataJson.stop_data
    },
    // 其他附件附件文件
    removeOtherFile (val) {
      // 获取下标
      const _index = this.dataJson.cancel_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.stop_data.splice(_index, 1)
      this.dataJson.stop_file.splice(_index, 1)
      this.dataJson.tempJson.stop_files = this.dataJson.stop_data
    },
    // 上传失败
    handleFileError () {
      console.debug('文件上传失败')
      this.$notify({
        title: '上传错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
      })
    },
    // 插入逻辑
    doInsert () {
      // 开始综合验证
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)
          tempData.id = this.data.id

          this.settings.loading = true
          suspendPayment(tempData).then(
            _data => {
              this.closeLoading()
              // 通知兄弟组件，新增数据更新
              EventBus.$emit(this.EMITS.EMIT_MST_B_AP_UPDATE_OK, _data.data)
              this.$notify({
                title: '新增成功',
                message: _data.data.message,
                type: 'success',
                duration: this.settings.duration
              })
            }, _error => {
              this.closeLoading()
              this.$notify({
                title: '新增失败',
                message: _error.error.message,
                type: 'error',
                duration: this.settings.duration
              })
            }
          ).finally(() => {
            this.$emit('closeMeOk', tempData)
            this.closeLoading()
          })
        } else {
          this.closeLoading()
        }
      })
    }
  }
}
</script>
