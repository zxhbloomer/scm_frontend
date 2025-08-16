<template>
  <el-dialog
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
        <RightUserStaff v-if="type==='user'" :data="data" @rowDbClick="handleSelect" />
        <!--选择岗位-->
        <RightPostStaff v-if="type==='post'" :data="data" />
      </el-main>
    </el-container>
    <el-footer>
      <FooterSelected
        ref="footer"
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
      >确定</el-button>
<!--      <el-button-->
<!--        type="primary"-->
<!--        icon="el-icon-edit-outline"-->
<!--        :disabled="!settings.btnShowStatus.showInsert"-->
<!--        :loading="settings.loading"-->
<!--        @click="handleClear"-->
<!--      >清空</el-button>-->
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
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  components: {  LeftTree, RightUserStaff, RightPostStaff, FooterSelected },
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
    // listenSelectedDataJson () {
    //   console.log(this.$store.getters.selectedDataJson)
    //   return this.$store.getters.selectedDataJson
    // },
    selectedNode () {
      return this.$store.getters.selectedNode
    }
  },
  // 监听器
  watch: {
    // // 监听页面上面是否有选择
    // listenSelectedDataJson: {
    //   handler (newVal, oldVal) {
    //     if (newVal === undefined || newVal === null || newVal.length === 0) {
    //       this.settings.btnShowStatus.showInsert = true
    //     } else {
    //       this.settings.btnShowStatus.showInsert = false
    //     }
    //   },
    //   deep: true,
    //   immediate: true
    // }
  },
  created () {
    // 设置dialog的返回
    // this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
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
              id: k.id,
              code: k.code,
              name: k.name,
              avatar: k.avatar,
              type: 'user'
            })
          })
          break
        case 'post':
          listData.forEach(k => {
            formData.push({
              id: k.id,
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
      // 插入选择的
      EventBus.$emit(this.EMITS.EMIT_ORG_DIALOG_STAFF_SELECT,[])
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
