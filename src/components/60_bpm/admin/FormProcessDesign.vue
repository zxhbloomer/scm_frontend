<template>
  <el-container v-loading="loading">
    <div style="width: 100%;" :class="{'process-design':activeSelect === 'processDesign'}">
      <el-header style="background: white;  width: 100%; z-index: 99;">
        <layout-header v-model="activeSelect" @publish="publishProcess" @save="save" />
      </el-header>
      <div class="layout-body">
        <form-base-setting v-show="activeSelect === 'baseSetting'" ref="baseSetting" />
        <form-design v-show="activeSelect === 'formSetting'" ref="formSetting" />
        <process-design v-show="activeSelect === 'processDesign'" ref="processDesign" />
        <form-pro-setting v-show="activeSelect === 'proSetting'" ref="proSetting" />
      </div>
      <w-dialog v-model="validVisible" :show-footer="false" title="设置项检查">
        <el-steps align-center :active="validStep" finish-status="success">
          <el-step
            v-for="(step, i) in validOptions"
            :key="i"
            :title="step.title"
            :icon="step.icon"
            :status="step.status"
            :description="step.description"
          />
        </el-steps>
        <el-result :icon="validIcon" :title="errTitle" :sub-title="validResult.desc">
          <i v-if="!validResult.finished" slot="icon" style="font-size: 30px" class="el-icon-loading" />
          <div v-if="validResult.errs.length > 0" slot="subTitle" class="err-info">
            <ellipsis v-for="(err, i) in validResult.errs" :key="i + '_err'" hover-tip :content="err">
              <i slot="pre" class="el-icon-warning-outline" />
            </ellipsis>
          </div>
          <template slot="extra">
            <el-button v-if="validResult.finished" type="primary" size="medium" @click="doAfter">
              {{ validResult.action }}
            </el-button>
          </template>
        </el-result>
      </w-dialog>
    </div>
  </el-container>

</template>

<script>
import LayoutHeader from './LayoutHeader'
// import { saveProcess, deployProcess, getNewVerProcess } from '@/api/process'
import { deployProcessApi, getDetailApi } from '@/api/40_business/bpmprocess/bpmprocess'
import FormBaseSetting from '@/components/60_bpm/admin/layout/FormBaseSetting'
import FormDesign from '@/components/60_bpm/admin/layout/FormDesign'
import ProcessDesign from '@/components/60_bpm/admin/layout/ProcessDesign'
import FormProSetting from '@/components/60_bpm/admin/layout/FormProSetting'
import MobilePreview from './layout/FormDesignMobilePreview'
import constants_para from '@/common/constants/constants_para'
import { isNotEmpty } from '@/utils'
import WDialog from '@/components/60_bpm/common/WDialog'
import ellipsis from '@/components/60_bpm/common/Ellipsis'
import { MessageBox } from 'element-ui'

export default {
  name: 'FormProcessDesign',
  components: { ellipsis,WDialog, LayoutHeader, FormBaseSetting, FormDesign, ProcessDesign, FormProSetting, MobilePreview },
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
    },
    dialogStatus: {
      type: String,
      default: constants_para.STATUS_VIEW
    },
    title: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      isNew: true,
      validStep: 0,
      timer: null,
      loading: false,
      activeSelect: 'baseSetting',
      validVisible: false,
      isSave: false,
      validResult: {},
      duration: 4000,
      validOptions: [
        { title: '基础信息', description: '', icon: '', status: '' },
        // { title: '审批表单', description: '', icon: '', status: '' },
        { title: '审批流程', description: '', icon: '', status: '' },
        { title: '扩展设置', description: '', icon: '', status: '' }
      ],
      validComponents: ['baseSetting', 'formSetting', 'processDesign', 'proSetting']
    }
  },
  computed: {
    setup () {
      return this.$store.getters.design
    },
    isMobilePreview () {
      return isNotEmpty(this.$route.query.mobilePreview)
    },
    errTitle () {
      if (this.validResult.finished && !this.validResult.success) {
        return this.validResult.title + ` (${this.validResult.errs.length}项错误) 😥`
      }
      return this.validResult.title
    },
    validIcon () {
      if (!this.validResult.finished) {
        return 'el-icon-loading'
      } else if (this.validResult.success) {
        return 'success'
      } else {
        return 'warning'
      }
    }
  },
  created () {
    this.showValiding()
    // const formId = this.$route.query.code
    // 判断传参，决定是新建还是加载原始数据
    this.loadInitFrom()
    if (isNotEmpty(this.data)) {
      this.isNew = false
      this.loadFormInfo(formId)
    }
    // const group = this.$route.query.groupId
    // this.setup.groupId = isNotEmpty(group) ? parseInt(group) : null
  },
  beforeDestroy () {
    this.stopTimer()
    window.removeEventListener('onbeforeunload', this.exitTip)
  },
  mounted () {
    window.addEventListener('onbeforeunload', this.exitTip)
  },
  methods: {
    getDfFormConfig () {
      return {
        labelPos: 'top',
        ruleType: 'SIMPLE',
        labelWidth: '',
        rules: [],
        ruleJs: '//formData: 表单数据  formMap: 表单字段id -> 字段json配置\r\nfunction doChange(formData, formMap){\r\n\t\r\n}'
      }
    },
    loadFormInfo (formId) {
      this.loading = true
      getDetailApi(formId).then(rsp => {
        this.loading = false
        const form = rsp.data
        form.logo = JSON.parse(form.logo)
        form.settings = JSON.parse(form.settings)
        form.formItems = JSON.parse(form.formItems)
        form.process = JSON.parse(form.process)
        form.formConfig = form.formConfig ? JSON.parse(form.formConfig) : this.getDfFormConfig()
        this.$store.commit('loadForm', form)
      }).catch(err => {
        this.loading = false
        this.$err(err, '获取流程信息失败')
      })
    },
    loadInitFrom () {
      this.$store.commit('loadForm', {
        formId: null,
        formName: '未命名表单',
        logo: {
          icon: 'el-icon-eleme',
          background: '#1e90ff'
        },
        settings: {
          commiter: [],
          admin: [],
          sign: false,
          notify: {
            types: ['APP'],
            title: '消息通知标题'
          }
        },
        groupId: undefined,
        formItems: [],
        formConfig: this.getDfFormConfig(),
        process: {
          id: 'root',
          parentId: null,
          type: 'ROOT',
          name: '发起人',
          desc: '任何人',
          props: {
            assignedUser: [],
            formPerms: []
          },
          children: {}
        },
        remark: '备注说明'
      })
    },
    validateDesign () {
      this.validVisible = true
      this.validStep = 0
      this.showValiding()
      this.stopTimer()
      this.timer = setInterval(() => {
        this.validResult.errs = this.$refs[this.validComponents[this.validStep]].validate()
        if (Array.isArray(this.validResult.errs) && this.validResult.errs.length === 0) {
          this.validStep++
          if (this.validStep >= this.validOptions.length) {
            this.stopTimer()
            this.showValidFinish(true)
          }
        } else {
          this.stopTimer()
          this.validOptions[this.validStep].status = 'error'
          this.showValidFinish(false, this.getDefaultValidErr())
        }
      }, 300)
    },
    getDefaultValidErr () {
      switch (this.validStep) {
        case 0:
          return '请检查基础设置项'
        case 1:
          return '请检查审批表单相关设置'
        case 2:
          return '请检查审批流程，查看对应标注节点错误信息'
        case 3:
          return '请检查扩展设置'
        default:
          return '未知错误'
      }
    },
    showValidFinish (success, err) {
      this.validResult.success = success
      this.validResult.finished = true
      this.validResult.title = success ? '校验完成 😀' : '校验失败 '
      this.validResult.desc = success ? '设置项校验成功，是否提交？' : err
      this.validResult.action = success ? '提 交' : '去修改'
    },
    showValiding () {
      this.validResult = {
        errs: [],
        finished: false,
        success: false,
        title: '检查中...',
        action: '处理',
        desc: '正在检查设置项'
      }
      this.validStep = 0
      this.validOptions.forEach(op => {
        op.status = ''
        op.icon = ''
        op.description = ''
      })
    },
    doAfter () {
      if (this.validResult.success) {
        this.doPublish()
      } else {
        this.activeSelect = this.validComponents[this.validStep]
        this.validVisible = false
      }
    },
    stopTimer () {
      if (this.timer) {
        clearInterval(this.timer)
      }
    },
    save () {
      this.doSave()
    },
    publishProcess () {
      this.validateDesign()
    },
    // doSave (call) {
    //   this.valids = this.$refs.baseSetting.validate()
    //   if (Array.isArray(this.valids) && this.valids.length === 0) {
    //     const modelData = this.getDataFromStore()
    //     this.loading = true
    //     saveProcess(modelData).then(rsp => {
    //       this.loading = false
    //       this.isSave = true
    //       this.$message.success('保存成功')
    //       if (call) {
    //         this.loading = true
    //         call(modelData.groupId, rsp.data)
    //         this.loading = false
    //       }
    //       this.createReload(modelData.groupId, rsp.data)
    //     }).catch(err => {
    //       this.loading = false
    //       this.$err(err, '抄送我的')
    //     })
    //   } else {
    //     this.$message.warning(String(this.valids))
    //   }
    // },
    getDataFromStore () {
      return {
        formId: this.setup.formId,
        formName: this.setup.formName,
        logo: JSON.stringify(this.setup.logo),
        settings: JSON.stringify(this.setup.settings),
        groupId: this.setup.groupId,
        formConfig: JSON.stringify(this.setup.formConfig || {}),
        formItems: JSON.stringify(this.setup.formItems),
        process: JSON.stringify(this.setup.process),
        remark: this.setup.remark
      }
    },
    createReload (groupId, formId) {
      if (!isNotEmpty(this.$route.query.code)) {
        window.location.replace(`${window.location.origin}/#/admin/design?groupId=${groupId}&code=${formId}`)
        window.location.reload()
      }
    },
    doPublish () {
      // this.$confirm('如果您只想临时保存请选择保存，确认发布后流程立即生效，是否继续?', '提示', {
      this.$confirm('流程发布后立即生效，新业务将会使用新流程，是否继续?', '提示', {
        confirmButtonText: '发布',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.validVisible = false

        const processNew = JSON.parse(JSON.stringify(this.setup.process))

        const template = {
          id: this.setup.id,
          name: this.setup.name,
          settings: JSON.stringify(this.setup.settings),
          group_id: this.setup.group_id,
          form_items: JSON.stringify(this.setup.form_items),
          process: JSON.stringify(processNew),
          remark: this.setup.remark
        }
        console.log('template',template)


        // this.doSave((groupId, formId) => {
        //   this.isSave = true
        //   deployProcessApi(formId).then(rsp => {
        //     this.loading = false
        //     this.$confirm('发布成功，您想继续留在本页还是返回表单列表呢', '操作成功', {
        //       confirmButtonText: '留在本页',
        //       cancelButtonText: '返回列表',
        //       type: 'success'
        //     }).then(() => {
        //       this.createReload(groupId, formId)
        //     }).catch(() => {
        //       this.$router.push('/workspace/formsPanel')
        //     })
        //   }).catch(err => {
        //     this.$err(err, '部署流程失败')
        //   })
        // })

        // this.doSave((groupId, formId) => {
        //   this.isSave = true
        //   deployProcessApi(formId).then(rsp => {
        //     this.loading = false
        //     this.$confirm('发布成功，您想继续留在本页还是返回表单列表呢', '操作成功', {
        //       confirmButtonText: '留在本页',
        //       cancelButtonText: '返回列表',
        //       type: 'success'
        //     }).then(() => {
        //       this.createReload(groupId, formId)
        //     }).catch(() => {
        //       this.$router.push('/workspace/formsPanel')
        //     })
        //   }).catch(err => {
        //     this.$err(err, '部署流程失败')
        //   })
        // })
        // 发布模板
        deployProcessApi(template).then(_data => {
          this.$message.success('发布成功')
          this.$notify({
            title: '启用成功',
            message: _data.message,
            type: 'success',
            duration: this.duration
          })
          this.validVisible = false
          /**
           * 关闭页面
           */
          this.$emit('closeMeOk', _data.data)
        }).catch(err => {
          MessageBox.alert(err, '错误信息', {
            confirmButtonText: '确定',
            showClose: false,
            type: 'error'
          }).then(() => {
          })
        })
      })
    },
    exitTip (e) {
      if (!this.isSave) {
        e = e || window.event
        if (e) {
          e.returnValue = '数据还没保存，您确定离开吗？'
        }
        return '数据还没保存，您确定离开吗？'
      }
    }
  }
}
</script>

<style lang="less" scoped>

.layout-body {
  min-width: 980px;
  height: calc(95vh - 160px);
  overflow: auto;
}

/deep/ .el-step {
  .is-success {
    color: #2a99ff;
    border-color: #2a99ff;
  }
}

.err-info{
  max-height: 180px;
  overflow-y: auto;
  & > div{
    padding: 5px;
    margin: 2px 0;
    width: 220px;
    text-align: left;
    border-radius: 3px;
    background: rgb(242 242 242);
  }
  i{
    margin: 0 5px;
  }
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-thumb {
  background: #99a9bf;
  border-radius: 20px;
}

</style>
