<template>
  <div class="view-wrapper">
    <div v-loading="loading" class="preview">
      <!--      若流程编号存在 显示审批节点流数据-->
      <div v-if="instanceData.process_instance_id">
        <!--        头部信息：审批流名称+编号-->
        <div class="title">
          <!--          <div v-if="instanceData.owner_user">-->
          <!--            <avatar show-y :name="instanceData.owner_user.name" :src="instanceData.owner_user.avatar" />-->
          <!--          </div>-->
          <div class="title-info">
            <div class="name">
              <span style="margin-right: 15px; color: #000">{{ instanceData.process_definition_name }}</span>
              <el-tag :type="status.type">{{ status.text }}</el-tag>
            </div>
            <div class="code">
              <span style="color: #6c6c6c">编号：</span>
              <span class="id">{{ instanceData.process_code }}</span>
            </div>
            <img v-if="status.img" :src="status.img" :style="isMobile ? 'right: -20px' : ''">
          <!--          <div style="font-size: 13px; color: rgb(142 141 141)" v-if="instanceData.staterUser">
                        由 {{instanceData.staterUser.name}} 在{{instanceData.startTime}}发起
                      </div>-->
          </div>
          <div v-if="!isMobile" class="extend-options">
            <el-tooltip class="item" effect="dark" content="打印" placement="top-start">
              <icon name="el-icon-printer" @click="print" />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="手机扫码" placement="top-start">
              <icon name="iconfont icon-iconfonterweima" @click="scanQr" />
            </el-tooltip>
          </div>
        </div>
        <!--      审批流详情，包含评论-->
        <div class="process">
          <process-progress :result="instanceData.result" :status="instanceData.status_name" :progress="instanceData.progress" />
        </div>
      </div>

      <w-dialog v-model="printVisible" width="700px" title="打印预览" ok-text="打 印" @ok="doPrint">
        <template #title>
          <div>
            <span>打印预览</span>
            <el-radio-group v-if="printTemplateConfig.customPrint" v-model="printCheck" style="margin: 0 30px" @change="renderPrint">
              <el-radio :label="false">默认模板</el-radio>
              <el-radio :label="true">自定义模板</el-radio>
            </el-radio-group>
          </div>
        </template>
        <div v-if="printCheck" id="printDom" ref="print" v-html="printTemplateConfig.printTemplate" />
      <!--      <default-printer v-else ref="print" :status="status" :instance="instanceData" />-->
      </w-dialog>
      <!-- 弹窗   -->
      <!--    <w-dialog v-model="actionVisible" :width="isMobile ? '100%' : '500px'" :title="actionDesc.title" ok-text="提 交" @ok="doAction">-->
      <!--      <process-action v-if="actionVisible" ref="action" :form-data="formData" :active-tasks="activeTasks" :instance="instanceData" :action="actionType" :action-desc="actionDesc" @success="handlerOk" />-->
      <!--    </w-dialog>-->

      <!--      评论-->
      <comment
        v-if="actionVisible"
        :visible="actionVisible"
        :action-type="actionType"
        @closeMeCancel="closeMeCancel"
        @closeMeOk="closeMeOk"
      />
    </div>
  </div>
</template>

<script>
import ProcessProgress from './ProcessProgress.vue'
import WDialog from '@/components/ProcessProgress/WDialog.vue'
import icon from '@/components/ProcessProgress/Icon.vue'
import {
  cancelApi,
  commentsApi,
  getInstanceProgressApi,
  refuseApi,
  transferApi
} from '@/api/40_business/bpm_todo/todo'
import { agreeApi } from '@/api/40_business/bpm_todo/todo'
import agree from '@/assets/images/agree.png'
import recall from '@/assets/images/recall.png'
import refuse from '@/assets/images/refuse.png'
import constants_para from '@/common/constants/constants_para'
import Comment from '@/components/ProcessProgress/comment.vue'
import constants_dict from '@/common/constants/constants_dict'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  components: { Comment, ProcessProgress, WDialog, icon },
  props: {
    /**
     * 是否显示撤销按钮
     */
    enableCancel: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
    },
    /**
     * view: 查看
     * audit：审批
     * update：更新
     * insert：插入
     */
    editStatus: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      printVisible: false,
      actionVisible: false,
      printCheck: false,
      loading: false,
      actionType: 'agree',
      instanceData: {},
      agreeVisible: false,
      // 审批流发起人撤销权限
      processCancelStatus: false,
      // 审批任务同意拒绝权限
      processApproveStatus: false,
      printTemplateConfig: {
        customPrint: false,
        printTemplate: ''
      },
      // 登录用户
      loginUser: {},
      // 组装审批通过数据
      agreeData: {
        process_code: '',
        task_id: '',
        // form_data: '',
        comments: '',
        annex_files: []
      },
      // 组装审批拒绝数据
      refuseData: {
        process_code: '',
        task_id: '',
        // form_data: '',
        comments: '',
        annex_files: []
      },
      // 组装评论拒绝数据
      commentsData: {
        process_code: '',
        // form_data: '',
        comments: '',
        annex_files: []
      },
      // 组装审批撤销数据
      cancelData: {
        process_code: '',
        task_id: '',
        // form_data: '',
        comments: '',
        annex_files: []
      },
      // 组装审批流转交数据
      transferData: {
        process_code: '',
        task_id: '',
        assignee_code: '',
        // form_data: '',
        comments: '',
        annex_files: []
      }
    }
  },
  computed: {
    constants_para () {
      return constants_para
    },
    isMobile () {
      return window.screen.width < 450
    },
    // // 操作按钮权限
    // opPerms () {
    //   const opPerms = this.instanceData.operationPerm || {}
    //   for (const key in opPerms) {
    //     if (!opPerms[key]) {
    //       opPerms[key] = { alisa: '', show: false }
    //     }
    //   }
    //   return opPerms
    // },
    // showMore () {
    //   return (
    //     this.opPerms.transfer.show ||
    //     this.opPerms.recall.show ||
    //     this.opPerms.afterAdd.show ||
    //     this.enableCancel
    //   )
    // },
    status () {
      const status = {
        text: this.instanceData.status_name
      }
      switch (this.instanceData.result) {
        case 'RUNNING':
        case 'COMPLETE':
          status.type = ''
          status.img = ''
          break
        case 'PASS':
          status.type = 'success'
          status.img = agree
          break
        case 'CANCEL':
          status.type = 'info'
          status.img = recall
          break
        case 'REFUSE':
          status.type = 'danger'
          status.img = refuse
          break
      }
      return status
    },
    formData () {
      // 过滤出可编辑的表单字段
      const formFields = []
      const formData = {}
      this.getEnableEditForm(this.instanceData.form_items || [], formFields)
      formFields.forEach((k) => {
        formData[k] = this.instanceData.formData[k]
      })
      return formData
    }
  },
  mounted () {
    this.getInstanceData()
    this.getPrintConfig()

    /**
     * 监听兄弟组件的事件
     */
    EventBus.$once(this.EMITS.EMIT_BPM_PROCESS_COMMENT, _data => {
      console.log('接收到评论事件', _data)
      this.getInstanceData()
    })
  },
  created () {

  },
  beforeDestroy () {
    EventBus.$off(this.EMITS.EMIT_BPM_PROCESS_COMMENT)
  },
  methods: {
    // 根据退回进行分段拆解
    splitByRecall (progress) {
      // 提取分段时间点
      const points = progress
        .filter((p) => p.result === 'recall')
        .map((p) => new Date(p.start_time).getTime())
      if (points.length > 0) {
        const blocks = [] // 分段流程块组
        let pointer = 0 // 定点索引
        points.push(new Date().getTime())
        points.forEach((point) => {
          const block = []
          for (let i = pointer; i < progress.length; i++) {
            const start_time = new Date(progress[i].start_time).getTime()
            if (start_time <= point) {
              block.push(progress[i])
            } else {
              pointer = i
              break
            }
          }
          // 存段
          blocks.push(block)
        })
        // 按段处理
        const processNodes = []
        blocks.forEach((block) => processNodes.push(...this.mergeTask(block)))
        return processNodes
      }
      return this.mergeTask(progress)
    },
    // 合并活动节点，此处执行一段合并算法用来处理退回导致节点重合的问题
    mergeTask (progress) {
      const merge = []
      progress.forEach((pg) => {
        const i = merge.findIndex(
          (n) => n.node_id === pg.node_id && n.start_time === pg.start_time
        )
        if (i > -1) {
          // 存在则合并到对象
          if (merge[i].users) {
            // 已经合并过了
            merge[i].finish_time = pg.finish_time
            merge[i].users.push(pg)
            merge[i].result = this.getApprovalResult(merge[i], pg, pg.approval_mode)
            merge[i].comment = merge[i].comment.concat(pg.comment)
          } else {
            // 没有就合并
            merge[i] = {
              agree: null,
              name: pg.name,
              node_type: pg.node_type,
              approval_mode: pg.approval_mode,
              node_id: pg.node_id,
              result: this.getApprovalResult(merge[i], pg, pg.approval_mode),
              start_time: merge[i].start_time,
              finish_time: pg.finish_time,
              comment: merge[i].comment.concat(pg.comment),
              users: [merge[i], pg]
            }
            merge[i].comment = merge[i].comment.sort(
              // (a, b) => moment(a.createTime) - moment(b.createTime)
            )
          }
        } else {
          merge.push(pg)
        }
      })
      return merge
    },
    getInstanceData () {
      this.showLoading('正在保存，请稍后...')
      getInstanceProgressApi(this.data).then((rsp) => {
        this.instanceData = rsp.data
        this.instanceData.progress = this.splitByRecall(rsp.data.progress)

        // 判断用户是否有撤销权限
        this.processCancelStatus = this.instanceData.if_owner_user

        // 判断用户是否有审批权限
        this.processApproveStatus = this.instanceData.if_approve_user

        // 赋值当前登录用户的任务ID
        if (this.data.task_id == null) {
          this.data.task_id = this.instanceData.current_task_id
        }
      }).finally(() => {
        this.closeLoading()
      })
    },
    getApprovalResult (oldVal, newVal, mode) {
      if (mode === 'OR') {
        return newVal.result ? newVal.result : oldVal.result
      } else if (mode === 'AND') {
        const rs = oldVal.result || newVal.result
        return rs === 'recall' ? 'recall' : rs
      } else {
        return newVal.result
      }
    },
    handler (action) {
      this.actionType = action
      this.actionVisible = true
    },
    handleReturn () {
      this.$emit('emitReturn')
    },
    // doAction () {
    //   if (this.actionType !== 'recall') {
    //     this.$refs.form.validate((valid) => {
    //       if (valid) {
    //         this.$refs.action.submitAction()
    //       } else {
    //         this.actionVisible = false
    //         if (this.isMobile) {
    //           // showFailToast('请完善表单')
    //         } else {
    //           this.$message.warning('请完善表单')
    //         }
    //       }
    //     })
    //   } else {
    //     this.$refs.action.submitAction()
    //   }
    // },
    print () {
      this.printVisible = true
    },
    doPrint () {
      // Print(this.printCheck ? this.$refs.print : this.$refs.print.$el)
    },
    scanQr () {
      this.$message.warning('敬请期待')
    },
    handlerOk () {
      console.log('处理---handlerOk')
      this.actionVisible = false
      this.$emit('handler-after')
    },
    getEnableEditForm (forms, fields) {
      forms.forEach((f) => {
        if (f.name === 'SpanLayout' || f.name === 'ModuleBlock') {
          this.getEnableEditForm(f.props.items, fields)
        } else if (f.name === 'TableList') {
          fields.push(f.id)
        } else if (f.perm === 'E') {
          fields.push(f.id)
        }
      })
    },
    getPrintConfig () {
      // getCustomPrintConfig(this.instanceId)
      //   .then((rsp) => {
      //     this.printTemplateConfig = rsp.data
      //   })
      //   .catch((err) => {
      //     this.$err(err, '获取打印模板配置失败')
      //   })
    },
    renderPrint (val) {
      if (val) {
        this.$nextTick(() => {
          // bindVar(
          //   this.printTemplateConfig.printTemplate,
          //   this.formatFormData,
          //   'printDom'
          // )
        })
      }
    },
    // // 获取当前登录用户信息
    // getUser () {
    //   getUserInfo({}).then(response => {
    //     this.loginUser = response.data
    //     console.log('11111', this.instanceData)
    //     if (this.instanceData.owner_user != null && this.instanceData.owner_user.code === this.loginUser.user_session_bean.staff_info.code) {
    //       this.processCancelStatus = true
    //     }
    //   }).finally(() => {
    //     // this.settings.loading = false
    //   })
    // },
    // 同意按钮
    agreeBtn () {
      this.showLoading('正在保存，请稍后...')
      agreeApi(this.agreeData).then(() => {
        this.$message.success('操作成功')
        this.$emit('emitReturn')
      })
        .finally(() => {
          this.closeLoading()
        })
    },
    // 拒绝按钮
    refuseBtn () {
      this.showLoading('正在保存，请稍后...')
      refuseApi(this.refuseData).then(() => {
        this.$message.success('操作成功')
        this.$emit('emitReturn')
      })
        .finally(() => {
          this.closeLoading()
        })
    },
    // 评论按钮
    commentsBtn () {
      this.showLoading('正在保存，请稍后...')
      commentsApi(this.commentsData).then(() => {
        this.getInstanceData()
        this.$message.success('操作成功')
        /**
         * 评论成功后不关闭页面
         */
        // this.$emit('emitReturn')
      })
        .finally(() => {
          this.closeLoading()
        })
    },
    // 撤销按钮
    cancelBtn () {
      this.showLoading('正在保存，请稍后...')
      cancelApi(this.cancelData).then(() => {
        this.$message.success('操作成功')
        this.$emit('emitReturn')
      })
        .finally(() => {
          this.closeLoading()
        })
    },
    // 转交按钮
    transferBtn () {
      this.showLoading('正在保存，请稍后...')
      transferApi(this.transferData).then(() => {
        this.$message.success('操作成功')
        this.$emit('emitReturn')
      })
        .finally(() => {
          this.closeLoading()
        })
    },
    buttonPermissions () {
      if (this.data.editStatus === constants_para.STATUS_VIEW) {
        return false
      } else {
        return true
      }
    },
    closeMeCancel () {
      this.actionType = null
      this.actionVisible = false
    },
    closeMeOk (actionType, val) {
      // 拼接数据调用方法
      switch (actionType) {
        case constants_dict.DICT_BPM_INSTANCE_PROCESS_BTN_AGREE: // 同意
          this.agreeData.process_code = this.data.process_code
          this.agreeData.task_id = this.data.task_id
          this.agreeData.comments = val.comments
          this.agreeData.annex_files = val.annex_files
          this.agreeBtn()
          break
        case constants_dict.DICT_BPM_INSTANCE_PROCESS_BTN_REFUSE: // 拒绝
          this.refuseData.process_code = this.data.process_code
          this.refuseData.task_id = this.data.task_id
          this.refuseData.comments = val.comments
          this.refuseData.annex_files = val.annex_files
          this.refuseBtn()
          break
        case constants_dict.DICT_BPM_INSTANCE_PROCESS_BTN_TRANSFER: // 转交
          this.transferData.process_code = this.data.process_code
          this.transferData.task_id = this.data.task_id
          this.transferData.comments = val.comments
          this.transferData.annex_files = val.annex_files
          this.transferData.assignee_code = val.userData.code
          this.transferBtn()
          break
        case constants_dict.DICT_BPM_INSTANCE_PROCESS_BTN_RECALL: // 退回
          break
        case constants_dict.DICT_BPM_INSTANCE_PROCESS_BTN_AFTERADD: // 后加签
          break
        case constants_dict.DICT_BPM_INSTANCE_PROCESS_BTN_CANCEL: // 撤销
          this.cancelData.process_code = this.data.process_code
          this.cancelData.process_instance_id = this.data.process_instance_id
          this.cancelData.task_id = this.data.task_id
          this.cancelData.comments = val.comments
          this.cancelData.annex_files = val.annex_files
          this.cancelBtn()
          break
        default: // 评论
          this.commentsData.process_code = this.data.process_code
          this.commentsData.comments = val.comments
          this.commentsData.annex_files = val.annex_files
          this.commentsBtn()
          break
      }
      // 关闭弹窗
      this.actionVisible = false
    }
  },
  emits: ['handler-after']
}
</script>

<style lang="less" scoped>
.preview {
  position: relative;
  height: 100%;

  &>div:nth-child(1) {
    overflow-y: auto;
    height: 100%;
    //padding-bottom: 50px;
  }

  .actions {
    height: 50px;
    padding: 12px 0 5px 0;
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 0;
    z-index: 99;
    background: white;
    border-top: 1px solid #dcdfe6;
    box-shadow: 0 0 0 0 #dad8d8;

    .ok-refuse {
      position: absolute;
      right: 20px;
    }

    .action-more {
      position: absolute;
      right: 180px;
      top: 5px;
    }

    .cancel {
      position: absolute;
      right: 20px;
      top: 5px;
    }

    .return-back {
      position: absolute;
      left: 0px;
      top: -5px;
      cursor: pointer;
      text-align: center;
      font-size: 12px;
      :deep(.icon) {
        font-size: 20px;
      }

      &:hover {
        color: #1989fa;
      }
    }

    .comment {
      position: absolute;
      left: 40px;
      top: -5px;
      cursor: pointer;
      text-align: center;
      font-size: 12px;

      :deep(.icon) {
        font-size: 20px;
      }

      &:hover {
        color: #1989fa;
      }
    }
  }
}

.process {
  background: white;
  padding: 20px 10px 50px 10px;
}

.title {
  background: white;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  position: relative;
  padding: 0 10px 10px 10px;

  &>div {
    color: #666666;
    display: inline-block;
  }

  .title-info {
    height: 50px;
    display: flex;
    padding: 0 10px;
    position: relative;
    flex-direction: column;
    justify-content: space-between;

    .name {
      font-size: 15px;
      color: #5e5e5e;
    }

    .code {
      font-size: 13px;
    }

    img {
      width: 80px;
      height: 80px;
      position: absolute;
      right: -100px;
      top: 30px;
      z-index: 9999;
    }
  }

  .extend-options {
    position: absolute;
    right: 0;

    :deep(.icon) {
      cursor: pointer;
      padding: 0 2px;

      &:hover {
        color: #1989fa;
      }
    }
  }
}

.form {
  margin: 15px 0;
  padding: 10px 10px 1px 10px;
  background: white;
}

.borderless {
  border: none !important;
  box-shadow: none !important; /* 如果你也想去掉阴影 */
}

.view-wrapper {
  padding: 10px;
  background: #fff;
  //height: calc(100vh - 135px);
}
</style>
