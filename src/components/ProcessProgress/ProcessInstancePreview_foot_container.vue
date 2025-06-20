<template>
  <div class="view-wrapper">
    <div v-loading="loading" class="preview">
      <!--    显示审批操作工具栏-->
      <!--      审批流发起人拥有审批权限-->
      <!--      and 审批流执行中-->
      <!--      and 编辑状态不等于查看时-->
      <div v-if="processApproveStatus && instanceData.result === 'RUNNING' && editStatus !== constants_para.STATUS_VIEW" class="actions">
        <div style="position: relative; width: 100%">
          <div class="return-back" style="height: 60px;" @click="handleReturn()">
            <span style="font-size: 20px"><i class="el-icon-arrow-left" /></span>
            <div>返回</div>
          </div>

          <!--          <el-button-group v-if="buttonPermissions()" style="float: right">-->
          <!--            <el-dropdown style="float: left">-->
          <!--              <el-button icon="el-icon-arrow-up" link class="borderless">-->
          <!--                更多-->
          <!--              </el-button>-->
          <!--              <template #dropdown>-->
          <!--                <el-dropdown-menu>-->
          <!--                  <el-dropdown-item @click.native="handler('transfer')">-->
          <!--                    <icon name="iconfont icon-zhuanyi-16" />-->
          <!--                    转交-->
          <!--                  </el-dropdown-item>-->
          <!--                  &lt;!&ndash;                  <el-dropdown-item @click.native="handler('recall')">  暂时不做&ndash;&gt;-->
          <!--                  &lt;!&ndash;                    <icon name="el-icon-s-release" />&ndash;&gt;-->
          <!--                  &lt;!&ndash;                    退回&ndash;&gt;-->
          <!--                  &lt;!&ndash;                  </el-dropdown-item>&ndash;&gt;-->
          <!--                  &lt;!&ndash;                  <el-dropdown-item @click.native="handler('afterAdd')"> todo 后开发&ndash;&gt;-->
          <!--                  &lt;!&ndash;                    <icon name="iconfont icon-zhaopinguanli" />&ndash;&gt;-->
          <!--                  &lt;!&ndash;                    后加签&ndash;&gt;-->
          <!--                  &lt;!&ndash;                  </el-dropdown-item>&ndash;&gt;-->
          <!--                  &lt;!&ndash;                  instanceData.owner_user.code === loginUser.user_session_bean.staff_info.code&ndash;&gt;-->
          <!--                  <el-dropdown-item v-if="processCancelStatus && instanceData.result === 'RUNNING' && editStatus !== constants_para.STATUS_VIEW" @click.native="handler('cancel')">-->
          <!--                    <icon name="el-icon-refresh-left" />-->
          <!--                    撤销-->
          <!--                  </el-dropdown-item>-->
          <!--                </el-dropdown-menu>-->
          <!--              </template>-->
          <!--            </el-dropdown>-->
          <div style="display: flex; justify-content: flex-end">
            <div class="comment" style="height: 60px;" @click="handler('comment')">
              <span style="font-size: 20px"><i class="el-icon-chat-dot-round" /></span>
              <div>评论</div>
            </div>
            <div class="cancel" style="height: 60px;" @click="handler('cancel')">
              <span style="font-size: 20px"><i class="el-icon-refresh-left" /></span>
              <div>撤销</div>
            </div>
            <div
              v-if="processCancelStatus && instanceData.result === 'RUNNING' && editStatus !== constants_para.STATUS_VIEW"
              class="transfer"
              style="height: 60px;"
              @click="handler('transfer')"
            >
              <span style="font-size: 20px"><icon name="el-icon-guide" /></span>
              <div>转交</div>
            </div>
            <el-button-group v-if="buttonPermissions()">
              <el-button type="danger" icon="el-icon-circle-close" style="margin-left: 20px" @click="handler('refuse')">拒绝</el-button>
              <el-button type="primary" icon="el-icon-check" style="margin-left: 5px" @click="handler('agree')">同意</el-button>
            </el-button-group>
          </div>
        </div>

      </div>
      <!--      显示撤销按钮-->
      <!--      审批流发起人拥有撤销权限-->
      <!--      and 审批流执行中-->
      <!--      and 编辑状态不等于查看时-->
      <div v-else-if="processCancelStatus && enableCancel && instanceData.result === 'RUNNING' && editStatus !== constants_para.STATUS_VIEW " class="actions">
        <div style="position: relative; width: 100%">
          <div class="return-back" style="height: 60px;" @click="handleReturn()">
            <span style="font-size: 20px"><i class="el-icon-arrow-left" /></span>
            <div>返回</div>
          </div>
        </div>
        <el-button type="danger" style="float: right" @click="handler('cancel')">
          撤销该流程
        </el-button>
      </div>
      <!--      其他情况时：显示返回-->
      <div v-else class="actions">
        <div style="position: relative; width: 100%">
          <div class="return-back" style="height: 60px;" @click="handleReturn()">
            <span style="font-size: 20px"><i class="el-icon-arrow-left" /></span>
            <div>返回</div>
          </div>
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
  components: { Comment, WDialog, icon },
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
      serial_type: '',
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
  },
  created () {

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
        this.serial_type = this.instanceData.serial_type
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
    // async agreeBtn () {
    //   this.showLoading('正在保存，请稍后...')
    //   await agreeApi(this.agreeData).then((_data) => {
    //     this.$notify({
    //       title: '操作成功',
    //       message: _data.message,
    //       type: 'success',
    //       duration: 10000
    //     })
    //     this.$emit('emitReturn')
    //   }, (_error) => {
    //     this.$notify({
    //       title: '操作失败',
    //       message: _error.message,
    //       type: 'error',
    //       duration: this.settings.duration
    //     })
    //   })
    //     .finally(() => {
    //       this.closeLoading()
    //     })
    // },
    // // 拒绝按钮
    // refuseBtn () {
    //   this.showLoading('正在保存，请稍后...')
    //   refuseApi(this.refuseData).then((_data) => {
    //     this.$notify({
    //       title: '操作成功',
    //       message: _data.message,
    //       type: 'success',
    //       duration: 10000
    //     })
    //     this.$emit('emitReturn')
    //   }, (_error) => {
    //     this.$notify({
    //       title: '操作失败',
    //       message: _error.message,
    //       type: 'error',
    //       duration: this.settings.duration
    //     })
    //   })
    //     .finally(() => {
    //       this.closeLoading()
    //     })
    // },
    // // 评论按钮
    // commentsBtn () {
    //   this.showLoading('正在保存，请稍后...')
    //   commentsApi(this.commentsData).then((_data) => {
    //     this.getInstanceData()
    //     this.$notify({
    //       title: '操作成功',
    //       message: _data.message,
    //       type: 'success',
    //       duration: 10000
    //     })
    //     /**
    //      * 评论成功后不关闭页面
    //      */
    //     // this.$emit('emitReturn')
    //   }, (_error) => {
    //     this.$notify({
    //       title: '操作失败',
    //       message: _error.message,
    //       type: 'error',
    //       duration: this.settings.duration
    //     })
    //   })
    //     .finally(() => {
    //       this.closeLoading()
    //       console.log('this.data', this.data)
    //       // 通知兄弟组件
    //       EventBus.$emit(this.EMITS.EMIT_BPM_PROCESS_COMMENT, this.data)
    //     })
    // },
    // // 撤销按钮
    // cancelBtn () {
    //   this.showLoading('正在保存，请稍后...')
    //   cancelApi(this.cancelData).then((_data) => {
    //     this.$notify({
    //       title: '操作成功',
    //       message: _data.message,
    //       type: 'success',
    //       duration: 10000
    //     })
    //     this.$emit('emitReturn')
    //   }, (_error) => {
    //     this.$notify({
    //       title: '操作失败',
    //       message: _error.message,
    //       type: 'error',
    //       duration: this.settings.duration
    //     })
    //   })
    //     .finally(() => {
    //       this.closeLoading()
    //     })
    // },
    // // 转交按钮
    // transferBtn () {
    //   this.showLoading('正在保存，请稍后...')
    //   transferApi(this.transferData).then((_data) => {
    //     this.$notify({
    //       title: '操作成功',
    //       message: _data.message,
    //       type: 'success',
    //       duration: 10000
    //     }, (_error) => {
    //       this.$notify({
    //         title: '操作失败',
    //         message: _error.message,
    //         type: 'error',
    //         duration: this.settings.duration
    //       })
    //     })
    //     this.$emit('emitReturn')
    //   })
    //     .finally(() => {
    //       this.closeLoading()
    //     })
    // },
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
    beforeDestroy () {
      EventBus.$off(this.EMITS.EMIT_BPM_PROCESS_COMMENT)
    },
    async closeMeOk (actionType, val) {
      try {
        switch (actionType) {
          case constants_dict.DICT_BPM_INSTANCE_PROCESS_BTN_AGREE:
            // 同意
            this.agreeData = {
              process_code: this.data.process_code,
              task_id: this.data.task_id,
              comments: val.comments,
              annex_files: val.annex_files
            }
            this.showLoading('正在保存，请稍后...')
            {
              const res = await agreeApi(this.agreeData)
              this.$notify({ title: '操作成功', message: res.message, type: 'success', duration: 10000 })
              this.$emit('emitReturn')
            }
            break
          case constants_dict.DICT_BPM_INSTANCE_PROCESS_BTN_REFUSE:
            // 拒绝
            this.refuseData = {
              process_code: this.data.process_code,
              task_id: this.data.task_id,
              comments: val.comments,
              annex_files: val.annex_files
            }
            this.showLoading('正在保存，请稍后...')
            {
              const res = await refuseApi(this.refuseData)
              this.$notify({ title: '操作成功', message: res.message, type: 'success', duration: 10000 })
              this.$emit('emitReturn')
            }
            break
          case constants_dict.DICT_BPM_INSTANCE_PROCESS_BTN_TRANSFER:
            // 转交
            this.transferData = {
              process_code: this.data.process_code,
              task_id: this.data.task_id,
              comments: val.comments,
              annex_files: val.annex_files,
              assignee_code: val.userData.code
            }
            this.showLoading('正在保存，请稍后...')
            {
              const res = await transferApi(this.transferData)
              this.$notify({ title: '操作成功', message: res.message, type: 'success', duration: 10000 })
              this.$emit('emitReturn')
            }
            break
          case constants_dict.DICT_BPM_INSTANCE_PROCESS_BTN_CANCEL:
            // 撤销，撤回
            this.cancelData = {
              process_code: this.data.process_code,
              process_instance_id: this.data.process_instance_id,
              task_id: this.data.task_id,
              comments: val.comments,
              annex_files: val.annex_files
            }
            this.showLoading('正在保存，请稍后...')
            {
              const res = await cancelApi(this.cancelData)
              this.$notify({ title: '操作成功', message: res.message, type: 'success', duration: 10000 })
              this.$emit('emitReturn')
            }
            break
          default:
            this.commentsData = {
              process_code: this.data.process_code,
              comments: val.comments,
              annex_files: val.annex_files
            }
            this.showLoading('正在保存，请稍后...')
            commentsApi(this.commentsData).then((_data) => {
              this.getInstanceData()
              this.$notify({
                title: '操作成功',
                message: _data.message,
                type: 'success',
                duration: 10000
              })
              /**
                   * 评论成功后不关闭页面
                   */
              // this.$emit('emitReturn')
            }, (_error) => {
              this.$notify({
                title: '操作失败',
                message: _error.message,
                type: 'error',
                duration: this.settings.duration
              })
            })
              .finally(() => {
                this.closeLoading()
                console.log('this.data', this.data)
                // 通知兄弟组件
                EventBus.$emit(this.EMITS.EMIT_BPM_PROCESS_COMMENT, this.data)
              })
        }
      } catch (error) {
        this.$notify({ title: '操作失败', message: error.message, type: 'error', duration: this.settings.duration })
      } finally {
        this.closeLoading()
        if (actionType === constants_dict.DICT_BPM_INSTANCE_PROCESS_BTN_COMMENT) {
          console.log('actionType', actionType)
        } else {
          console.log('!!serial_type!!', this.serial_type)
          switch (this.serial_type) {
            case constants_dict.DICT_M_ENTERPRISE:
              EventBus.$emit(this.EMITS.EMIT_MST_ENTERPRISE_BPM_OK)
              break
            case constants_dict.DICT_B_PO_CONTRACT:
              EventBus.$emit(this.EMITS.EMIT_MST_POCONTRACT_BPM_OK)
              break
            case constants_dict.DICT_B_PO_ORDER:
              EventBus.$emit(this.EMITS.EMIT_MST_POORDER_BPM_OK)
              break
            case constants_dict.DICT_B_SO_CONTRACT:
              EventBus.$emit(this.EMITS.EMIT_MST_SOCONTRACT_BPM_OK)
              break
            case constants_dict.DICT_B_SO_ORDER:
              EventBus.$emit(this.EMITS.EMIT_MST_SOORDER_BPM_OK)
              break
            case constants_dict.DICT_B_AP:
              EventBus.$emit(this.EMITS.EMIT_MST_B_AP_BPM_OK)
              break
          }
        }
        this.actionVisible = false
      }
    }
  },
  emits: ['handler-after']
}
</script>

<style lang="less" scoped>
.preview {

  .actions {
    height: 90px;
    padding: 12px 30px 5px 30px;
    position: absolute;
    width: 100%;
    top: 40px;
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
      //position: absolute;
      //right: 20px;
      top: -5px;
      cursor: pointer;
      text-align: center;
      font-size: 12px;
      width: 60px;
      :deep(.icon) {
        font-size: 20px;
      }

      &:hover {
        color: #1989fa;
      }
    }

    .return-back {
      position: absolute;
      left: 0px;
      top: -5px;
      cursor: pointer;
      text-align: center;
      font-size: 12px;
      width: 60px;
      :deep(.icon) {
        font-size: 20px;
      }

      &:hover {
        color: #1989fa;
      }
    }

    .comment {
      //position: absolute;
      //left: 40px;
      top: -5px;
      cursor: pointer;
      text-align: center;
      font-size: 12px;
      width: 60px;
      :deep(.icon) {
        font-size: 20px;
      }

      &:hover {
        color: #1989fa;
      }
    }

    .transfer {
      //position: absolute;
      //right: 140px;
      top: -5px;
      cursor: pointer;
      text-align: center;
      font-size: 12px;
      width: 60px;
      :deep(.icon) {
        font-size: 20px;
      }

      &:hover {
        color: #1989fa;
      }
    }

    .cancel {
      //position: absolute;
      //right: 180px;
      top: -5px;
      cursor: pointer;
      text-align: center;
      font-size: 12px;
      width: 60px;
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
  background: #fff;
}
</style>
