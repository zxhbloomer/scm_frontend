<template>
  <el-dialog
    v-if="listenVisible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="员工选择"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="!PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="!PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="1150px"
    top="10vh"
    destroy-on-close
    @close="handleClose"
  >
    <el-container>
      <el-aside width="300px">
        <LeftTree />
      </el-aside>
      <el-main>
        <!--选择用户-->
        <RightUserStaff v-if="type==='user'" :data="data" :multiple-choices="multipleChoices" />
        <!--选择岗位-->
        <RightPostStaff v-if="type==='post'" :data="data" />
      </el-main>
    </el-container>
    <el-footer>
      <FooterSelected
        ref="footer"
        :data="data"
        @emitButtonDisabledStatus="handleButtonDisabledStatus"
      />
    </el-footer>
    <div class="button">
      <el-button
        type="primary"
        icon="el-icon-circle-plus-outline"
        :disabled="!settings.btnShowStatus.showInsert"
        :loading="settings.loading"
        @click="handleSelect"
      >完成选择</el-button>
      <el-button
        type="primary"
        icon="el-icon-edit-outline"
        :disabled="!settings.btnShowStatus.showInsert"
        :loading="settings.loading"
        @click="handleClear"
      >清空</el-button>
      <el-button
        type="primary"
        icon="el-icon-camera-solid"
        :loading="settings.loading"
        @click="handleClose"
      >关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
// import '@/styles/org_png.scss' // 已改用el-tag，不再需要图片样式
import elDragDialog from '@/directive/el-drag-dialog'
import LeftTree from '@/components/60_bpm/process/staffTreeDialog/left/leftTree.vue'
import RightUserStaff from '@/components/60_bpm/process/staffTreeDialog/right/rightUserStaff.vue'
import RightPostStaff from '@/components/60_bpm/process/staffTreeDialog/right/rightPostStaff.vue'
import FooterSelected from '@/components/60_bpm/process/staffTreeDialog/bottom/footerSelected.vue'

export default {
  components: { LeftTree, RightUserStaff, RightPostStaff, FooterSelected },
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // 分组下标
    index: {
      type: Number,
      default: 0
    },
    // 条件下标
    cindex: {
      type: Number,
      default: 0
    },
    // 是否更vuex数据
    onVuexUpdate: {
      type: Boolean,
      default: false
    },
    // 打开弹窗类型 user=用户  post=岗位
    type: {
      type: String,
      default: 'user'
    },
    // 是否多选
    multipleChoices: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      dataJson: {},
      settings: {
        loading: false,
        btnShowStatus: {
          showInsert: false
        }
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    },
    selectedNode () {
      return this.$store.getters.selectedNode
    }
  },
  created () {
  },
  methods: {
    handleSelect () {
      const listData = this.$refs.footer.dataJson.listData
      // 不存入vuex 返回用户所有信息
      if (!this.onVuexUpdate) {
        this.$emit('emitInsertStaffOk', listData, this.index, this.cindex)
        return
      }

      // 存入vuex,返回用户组装数据
      const formData = []
      switch (this.type) {
        case 'user':
          // 组装已选用户数据
          listData.forEach(k => {
            formData.push({
              id: k.id || k.staff_id || k.user_id,
              code: k.login_name || k.code,
              name: k.name,
              avatar: k.avatar,
              type: 'user'
            })
          })
          break
        case 'post':
          listData.forEach(k => {
            formData.push({
              id: k.id || k.staff_id || k.user_id,
              code: k.code,
              name: k.name,
              avatar: k.avatar,
              type: 'post'
            })
          })
          break
      }

      this.$emit('emitInsertStaffOk', formData, this.index, this.cindex)
    },
    // 清空选择
    handleClear () {
      this.$refs.footer.dataJson.listData = []
    },
    handleButtonDisabledStatus (status) {
      this.settings.btnShowStatus.showInsert = status
    },
    handleClose () {
      this.$emit('emitCloseCancel')
    }
  }
}
</script>

<style scoped>
.el-aside {
  background-color: white;
  padding: 2px 3px;
}
.el-main {
  padding: 3px;
}
.el-footer {
  padding: 0 3px;
}
.button {
  padding-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
