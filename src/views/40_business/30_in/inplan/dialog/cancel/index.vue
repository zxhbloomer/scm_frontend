<template>
  <div>
    <!-- 作废审批提交弹窗 -->
    <el-dialog
      v-if="listenVisible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      title="作废审批提交"
      :visible="visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
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
              prop="remark"
              label-width="0"
            >
              <el-input
                ref="refFocusOne"
                v-model.trim="dataJson.tempJson.remark"
                type="textarea"
                clearable
                show-word-limit
                :rows="4"
                maxlength="500"
                :placeholder="'请输入作废理由'"
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
                v-for="(item, i) in dataJson.cancel_data"
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
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-divider />
        <el-button
          plain
          type="primary"
          :disabled="settings.loading"
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
.el-descriptions {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import deepCopy from 'deep-copy'
import { cancelApi } from '@/api/40_business/30_in/inplan/inplan'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import constants_dict from '@/common/constants/constants_dict'
import constants_bpm from '@/common/constants/constants_bpm'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  name: 'InPlanCancelDialog',
  components: { BpmDialog, SimpleUploadMutilFile, PreviewCard },
  directives: { elDragDialog },
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
      popSettingsData: {
        // 审批流程
        sponsorDialog: {
          serial_type: constants_bpm.BPM_B_IN_PLAN_CANCEL,
          // 弹出框显示参数
          visible: false,
          form_data: {},
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

        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          remark: '',
          cancel_files: []
        },
        // 单条数据 json
        tempJson: null,
        inputSettings: {
        }
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: false,
        duration: 4000,
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
    }
  },
  // 监听器
  watch: {
    // 监听弹窗显示状态，每次打开时重新初始化数据
    visible: {
      handler (newVal) {
        if (newVal === true) {
          // 弹窗打开时，重新初始化所有数据
          this.resetData()
        }
      },
      immediate: false
    }
  },
  created () {
    this.init()
  },
  mounted () {
    // 描绘完成
  },
  methods: {
    // 初始化处理
    init () {
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)
      this.settings.loading = false
    },

    // 重置数据 - 每次弹窗打开时调用
    resetData () {
      // 重置表单数据
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)

      // 清空附件数据
      this.dataJson.cancel_data = []
      this.dataJson.cancel_file = []
      this.dataJson.cancel_files = []

      // 重置审批流程数据
      this.popSettingsData.sponsorDialog.visible = false
      this.popSettingsData.sponsorDialog.form_data = {}
      this.popSettingsData.sponsorDialog.initial_process = null
      this.popSettingsData.sponsorDialog.process_users = {}

      // 设置当前数据ID
      if (this.data && this.data.id) {
        this.dataJson.tempJson.id = this.data.id
      }

      // 清除表单验证状态
      this.$nextTick(() => {
        if (this.$refs['dataSubmitForm']) {
          this.$refs['dataSubmitForm'].clearValidate()
        }
      })

      this.settings.loading = false
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
    // 其他附件附件文件移除
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
        duration: this.settings.duration
      })
    },
    // 作废提交逻辑
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
                // 通知兄弟组件，数据更新
                setTimeout(() => {
                  EventBus.$emit(this.EMITS.EMIT_MST_INPLAN_UPDATE_OK, _data.data)
                }, 1000)

                this.$notify({
                  title: '作废申请成功',
                  message: _data.data.message,
                  type: 'success',
                  duration: this.settings.duration
                })
              },
              _error => {
                this.$notify({
                  title: '作废申请失败',
                  message: _error.error.message,
                  type: 'error',
                  duration: this.settings.duration
                })
              }
            )
            .finally(() => {
              // 在finally中调用closeMeOk事件，确保无论成功失败都会关闭弹窗
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
      this.settings.loading = true
      // 校验是否存在审批流程
      getFlowProcessApi({ 'serial_type': this.popSettingsData.sponsorDialog.serial_type })
        .then((rsp) => {
          if (rsp.data === null) {
            this.$message.error('未找到作废审批流程，请联系管理员')
            this.settings.loading = false
          } else {
            // 流程参数
            this.popSettingsData.sponsorDialog.form_data = {}
            // 启动审批流弹窗
            this.popSettingsData.sponsorDialog.visible = true
            this.settings.loading = false
          }
        }).catch((err) => {
          this.settings.loading = false
          this.$message.error('获取审批流程失败：' + err.message)
        })
    },
    // 取消审批流程选择
    handleBpmDialogCancel () {
      this.popSettingsData.sponsorDialog.visible = false
      this.settings.loading = false
    },
    // 审批流确定
    handleBpmDialogOk (data) {
      this.popSettingsData.sponsorDialog.initial_process = data.processData
      this.popSettingsData.sponsorDialog.process_users = data.process_users
      this.popSettingsData.sponsorDialog.visible = false
      this.doInsert()
    }
  }
}
</script>
