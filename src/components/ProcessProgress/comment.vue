<template>
  <div>
    <el-dialog
      v-if="listenVisible"
      v-el-drag-dialog
      :title="dataJson.comment_title"
      :visible="visible"
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="800px"
      destroy-on-close
      top="5vh"
    >
      <div>
        <div v-if="dataJson.actionTransfer">
          <span>转交给谁:&nbsp;</span>
          <el-tag
            v-if="dataJson.userData!=null"
            style="height: 30px;width: 80px;text-align: center; line-height: 30px;"
            closable
            :disable-transitions="false"
            @close="handleUserDelete()"
          >{{ dataJson.userData.name }}</el-tag>
          <el-button v-else plain icon="el-icon-plus" @click="selectUser(dataJson.userData)">选择人员</el-button>
          <div style="margin: 10px 0;" />
        </div>

        <span>请输入意见/评论内容:</span>
        <div style="margin: 10px 0;" />
        <el-input
          v-model="dataJson.comments"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4}"
          placeholder="请输入意见内容"
          maxlength="200"
          show-word-limit
        />
        <div style="margin: 10px 0;" />
        <!--      推荐回复-->
        <span>推荐回复:</span>
        <div>
          <el-tag
            v-for="(item, i) in dataJson.suggestedRepliesData"
            :key="i"
            plain
            size="small"
            style="cursor: pointer;"
            @click="handleFastReplay(item)"
          >
            {{ item.label }}
          </el-tag>
        </div>
        <br>
        <span>图片及附件:</span>
        <div style="margin: 10px 0;" />
        <el-row>
          <el-col
            :offset="0"
            :span="2"
          >
            <Simple-upload-mutil-file
              :accept="'*'"
              @upload-success="handleUploadFileSuccess"
              @upload-error="handleUploadFileError"
            />
          </el-col>
        </el-row>
        <el-row>
          <el-col
            v-for="(item, i) in dataJson.annex"
            :key="i"
            :offset="1"
            :span="7"
          >
            <previewCard
              :file-name="item.fileName"
              :url="item.url"
              :time="item.timestamp"
              @removeFile="removeFile"
            />
          </el-col>
        </el-row>

      </div>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-divider />
        <el-button
          plain
          @click="handleDoCancel()"
        >取消
        </el-button>
        <el-button
          type="primary"
          size="mini"
          @click="handleDoOk()"
        >确定
        </el-button>
      </div>
    </el-dialog>

    <!--员工组件-->
    <SelectStaff
      v-if="settings.popsettings.one.visible"
      :visible="settings.popsettings.one.visible"
      :type="settings.popsettings.one.type"
      :index="settings.popsettings.one.index"
      :cindex="settings.popsettings.one.cindex"
      :on-vuex-update="settings.popsettings.one.onVuexUpdate"
      :data="settings.popsettings.one.props.data"
      :multiple-choices="settings.popsettings.one.multipleChoices"
      @emitInsertStaffOk="handleInsertStaffOk"
      @emitCloseCancel="handleSelectStaffCancel"
    />
  </div>

</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import previewCard from '@/components/50_preview_card/preview_card.vue'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import constants_dict from '@/common/constants/constants_dict'
import SelectStaff from '@/components/60_bpm/process/staffTreeDialog/index.vue'
import { MessageBox } from 'element-ui'
import { getDictApi } from '@/api/90_bpm/comment/index.js'
import constants_type from '@/common/constants/constants_dict'

export default {
  components: { SelectStaff, SimpleUploadMutilFile, previewCard },
  directives: { elDragDialog },
  props: {
    // 页面是否显示
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
    },
    // 操作类型
    actionType: {
      type: String,
      default: null
    }
    // // 操作标题
    // actionTitle: {
    //   type: String,
    //   default: this.initTitle()
    // }
  },
  data () {
    return {
      dataJson: {
        suggestedRepliesData: [],
        // 页面设置json
        settings: {
          // 按钮状态：是否可用
          btnDisabledStatus: {
            disabledOk: false
          }
        },
        // 文本
        comments: '',
        // 附件文件
        annex: [],
        annex_file: [],
        annex_files: [],
        // 标题
        comment_title: '',
        // 选择的人员弹窗
        actionTransfer: false,
        // 选择的人员
        userData: null
      },
      settings: {
        popsettings: {
          // 弹出编辑页面
          one: {
            visible: false,
            // 分组下标
            index: null,
            // 条件下标
            cindex: null,
            // 是否插入vuex数据
            onVuexUpdate: false,
            type: 'user',
            // 是否多选
            multipleChoices: false,
            props: {
              id: undefined,
              data: Array,
              dialogStatus: ''
            }
          }
        }
      }
    }
  },
  computed: {
    listenSelectedDataJson () {
      return this.$store.getters.selectedDataJson
    },
    listenVisible () {
      return this.visible
    }
  },
  // 监听器
  watch: {
    // 监听页面上面是否有选择
    listenSelectedDataJson: {
      handler (newVal, oldVal) {
        if (newVal === undefined || newVal === null || JSON.stringify(newVal) === '{}') {
          this.dataJson.settings.btnDisabledStatus.disabledOk = true
        } else {
          this.dataJson.settings.btnDisabledStatus.disabledOk = false
        }
      },
      deep: true,
      immediate: true
    }

  },
  mounted () {
    // 描绘完成
    getDictApi({ dictTypeCode: constants_type.DICT_APPROVE_COMMENT_TYPE }).then(response => {
      this.settings.loading = true
      this.dataJson.suggestedRepliesData = response.data
    }).finally(() => {
      this.settings.loading = false
    })
  },
  created () {
    // 初始化标题
    this.initTitle()
    // 设置dialog的返回
    this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
  },
  methods: {
    // 确定
    handleDoOk () {
      if (this.dataJson.comments === '') {
        MessageBox.alert('请输入意见/评论内容', '错误信息', {
          confirmButtonText: '确定',
          showClose: false,
          type: 'error'
        }).then(() => {
        })
        return
      }
      this.$emit('closeMeOk', this.actionType, this.dataJson)
    },
    // 取消
    handleDoCancel () {
      this.$emit('closeMeCancel')
    },
    // 磅单上传成功
    handleUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.annex.push(res.response.data)
      this.dataJson.annex_file.push(res.response.data.url)
      this.dataJson.annex_files = this.dataJson.annex
    },
    // 磅单上传失败
    handleUploadFileError () {
      console.debug('文件上传失败')
      this.$notify({
        title: '上传错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
      })
    },
    // 删除磅单文件
    removeFile (val) {
      // 获取下标
      const _index = this.dataJson.images_files.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.images.splice(_index, 1)
      this.dataJson.images_files.splice(_index, 1)
    },
    initTitle () {
      switch (this.actionType) {
        case constants_dict.DICT_BPM_INSTANCE_PROCESS_BTN_AGREE: // 同意
          this.dataJson.comment_title = '提交审批'
          return
        case constants_dict.DICT_BPM_INSTANCE_PROCESS_BTN_REFUSE: // 拒绝
          this.dataJson.comment_title = '拒绝审批'
          return
        case constants_dict.DICT_BPM_INSTANCE_PROCESS_BTN_TRANSFER: // 转交
          this.dataJson.comment_title = '转交给其他人审批'
          this.dataJson.actionTransfer = true
          return
        case constants_dict.DICT_BPM_INSTANCE_PROCESS_BTN_RECALL: // 退回
          this.dataJson.comment_title = '退回到之前节点'
          return
        case constants_dict.DICT_BPM_INSTANCE_PROCESS_BTN_AFTERADD: // 后加签
          this.dataJson.comment_title = '后方增加审批人'
          return
        case constants_dict.DICT_BPM_INSTANCE_PROCESS_BTN_CANCEL: // 撤销
          this.dataJson.comment_title = '撤销当前流程'
          return
        default:
          this.dataJson.comment_title = '评论'
          return
      }
    },
    // 取消选择人员
    handleSelectStaffCancel () {
      this.settings.popsettings.one.visible = false
    },
    // 选择人员成功
    handleInsertStaffOk (data) {
      if (data !== undefined && data.length > 0) {
        this.dataJson.userData = data[0]
      } else {
        this.dataJson.userData = null
      }
      this.handleSelectStaffCancel()
    },
    selectUser (value) {
      const _data = []
      _data.push(value)
      this.settings.popsettings.one.visible = true
      this.settings.popsettings.one.onVuexUpdate = true
      this.settings.popsettings.one.props.data = _data
    },
    // 删除已选用户
    handleUserDelete () {
      this.dataJson.userData = null
    },
    // 快速回复
    handleFastReplay (val) {
      this.dataJson.comments = this.dataJson.comments + val.label
    }
  }
}
</script>
