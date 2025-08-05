<template>
  <div>
    <!-- pop窗口 数据编辑:新增、修改 -->
    <el-dialog
      v-if="listenVisible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      title="作废审批提交"
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
        <el-alert
          title="作废理由"
          type="info"
          :closable="false"
        />
        <div style="margin-bottom: 10px" />
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
              作废理由
            </div>
            <el-form-item
              prop="cancel_reason"
              label-width="0"
            >
              <el-input
                ref="refFocusOne"
                v-model.trim="dataJson.tempJson.cancel_reason"
                type="textarea"
                clearable
                show-word-limit
                :placeholder="'请输入'"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="附件">
            <el-row>
              <Simple-upload-mutil-file
                :accept="'*'"
                @upload-success="handleOtherUploadFileSuccess"
                @upload-error="handleFileError"
              />
            </el-row>
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.cancel_data"
                :key="i"
                :offset="0"
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
          type="primary"
          :disabled="settings.loading "
          @click="startProcess()"
        >确定</el-button>
        <el-button
          plain
          :disabled="settings.loading"
          @click="handleCancel()"
        >取消</el-button>
      </div>
    </el-dialog>

    <!-- 审批流程设置：选择人 -->
    <bpm-dialog
      v-if="popSettingsData.sponsorDialog.visible"
      :visible="popSettingsData.sponsorDialog.visible"
      :form-data="popSettingsData.sponsorDialog.form_data"
      :serial-type="popSettingsData.sponsorDialog.serial_type"
      @closeMeCancel="handleBpmDialogCancel"
      @closeMeOk="handleBpmDialogOk"
    />
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
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import deepCopy from 'deep-copy'
import { cancelApi } from '@/api/40_business/20_so/soorder/soorder'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import constants_bpm from '@/common/constants/constants_bpm'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  components: { BpmDialog, SimpleUploadMutilFile, PreviewCard },
  directives: { elDragDialog },
  mixins: [],
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
      // 监听器
      watch: {
        unwatch_tempJson: null
      },
      popSettingsData: {
        // 审批流程
        sponsorDialog: {
          serial_type: constants_bpm.BPM_B_SO_ORDER_CANCEL,
          // 弹出框显示参数
          visible: false,
          form_data: { },
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          },
          // 审批流程
          initial_process: null,
          // 自选用户
          process_users: {}
        }
      },
      dataJson: {
        // 附件
        cancel_data: [],
        cancel_file: [],
        cancel_files: [],

        // 单条数据 json
        tempJson: {
          cancel_reason: '',
          cancel_files: []
        },
        inputSettings: {
        }
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: this.dialogStatus,
        // pop的check内容
        rules: {
          remark: [
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
  watch: {},
  created () {
    this.init()
  },
  mounted () {
    // 描绘完成
  },
  destroyed () {
    this.unWatch()
  },
  methods: {
    // 初始化处理
    init () {
      this.dataJson.tempJson = deepCopy(this.$options.data.call(this).dataJson.tempJson)
      // 初始化watch
      this.setWatch()
      this.settings.loading = false
    },
    // 设置监听器
    setWatch () {
      this.unWatch()
    },
    unWatch () {
    },
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 其他附件上传成功
    handleOtherUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.cancel_data.push(res.response.data)
      this.dataJson.cancel_file.push(res.response.data.url)
      this.dataJson.tempJson.cancel_files = this.dataJson.cancel_data
    },
    // 其他附件附件文件
    removeOtherFile (val) {
      // 获取下标
      const _index = this.dataJson.cancel_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.cancel_data.splice(_index, 1)
      this.dataJson.cancel_file.splice(_index, 1)
      this.dataJson.tempJson.cancel_files = this.dataJson.cancel_data
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
          // 审批流程启动数据
          tempData.initial_process = this.popSettingsData.sponsorDialog.initial_process // 流程
          tempData.form_data = this.popSettingsData.sponsorDialog.form_data // 表单参数
          tempData.process_users = this.popSettingsData.sponsorDialog.process_users // 自选用户

          this.settings.loading = true
          cancelApi(tempData)
            .then(
              _data => {
                this.closeLoading()
                // 通知兄弟组件，新增数据更新
                EventBus.$emit(this.EMITS.EMIT_MST_SOORDER_UPDATE_OK, _data.data)
                this.$notify({
                  title: '新增成功',
                  message: _data.data.message,
                  type: 'success',
                  duration: this.settings.duration
                })
              },
              _error => {
                this.closeLoading()
                this.$notify({
                  title: '新增失败',
                  message: _error.error.message,
                  type: 'error',
                  duration: this.settings.duration
                })
              }
            )
            .finally(() => {
              this.$emit('closeMeOk', tempData)
              this.closeLoading()
            })
        } else {
          this.closeLoading()
        }
      })
    },
    // 获取审批流程
    startProcess () {
      // 校验是否存在审批流程
      getFlowProcessApi({ 'serial_type': this.popSettingsData.sponsorDialog.serial_type })
        .then((rsp) => {
          if (rsp.data === null) {
            this.$message.error('未找到审批流程，请联系管理员')
          } else {
            // 流程参数
            this.popSettingsData.sponsorDialog.form_data = { }
            // 启动审批流弹窗
            this.popSettingsData.sponsorDialog.visible = true
          }
        }).catch((err) => {
          this.closeLoading()
          this.$message.error(err)
        }).finally(() => {
          this.closeLoading()
        })
    },
    // 取消
    handleBpmDialogCancel () {
      this.popSettingsData.sponsorDialog.visible = false
      this.closeLoading()
    },
    // 审批流确定
    handleBpmDialogOk (data) {
      this.popSettingsData.sponsorDialog.initial_process = data.processData
      this.popSettingsData.sponsorDialog.process_users = data.process_users
      this.popSettingsData.sponsorDialog.visible = false
      this.doInsert()
    },
    // 显示加载中
    showLoading (message) {
      this.settings.loading = true
    },
    // 关闭加载中
    closeLoading () {
      this.settings.loading = false
    }
  }
}
</script>
