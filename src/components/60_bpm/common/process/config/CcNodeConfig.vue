<template>
  <div>
    <el-button size="mini" icon="el-icon-plus" type="primary" round @click="selectOrg">选择抄送人</el-button>
    <div class="option">
      <el-checkbox v-model="config.shouldAdd" label="允许发起人添加抄送人" />
    </div>
    <org-items v-model="select" />
<!--    <org-picker ref="orgPicker" multiple type="org" :selected="select" @ok="selected" />-->
    <SelectStaff
      v-if="settings.popsettings.one.visible"
      :visible="settings.popsettings.one.visible"
      :type="settings.popsettings.one.type"
      :index="settings.popsettings.one.index"
      :cindex="settings.popsettings.one.cindex"
      :on-vuex-update="settings.popsettings.one.onVuexUpdate"
      :data="settings.popsettings.one.props.data"
      @emitInsertStaffOk="handleInsertStaffOk"
      @emitCloseCancel="handleSelectStaffCancel"
    />
  </div>
</template>

<script>
import OrgPicker from '@/components/60_bpm/common/OrgPicker'
import OrgItems from '../OrgItems'
import SelectStaff from '@/components/60_bpm/process/staffTreeDialog/index.vue'

export default {
  name: 'CcNodeConfigVue',
  components: {SelectStaff, OrgPicker, OrgItems },
  props: {
    config: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
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
    select: {
      get () {
        return this.config.assignedUser || []
      },
      set (val) {
        this.config.assignedUser = val
      }
    }
  },
  methods: {
    // selectOrg () {
    //   this.$refs.orgPicker.show()
    // },
    // selected (select) {
    //   console.log(select)
    //   this.select = Object.assign([], select)
    // },
    removeOrgItem (index) {
      this.select.splice(index, 1)
    },
    selectOrg () {
      this.settings.popsettings.one.visible = true
      this.settings.popsettings.one.onVuexUpdate = true
      this.settings.popsettings.one.props.data = this.config.assignedUser
    },
    // 取消选择人员
    handleSelectStaffCancel () {
      this.settings.popsettings.one.visible = false
    },
    // 选择人员成功
    handleInsertStaffOk (data) {
      console.log(data)
      this.config.assignedUser = data
      this.handleSelectStaffCancel()
    }
  }
}
</script>

<style lang="less" scoped>
.option{
  color: #606266;
  margin-top: 20px;
  font-size: small;
}

.desc{
  font-size: small;
  color: #8c8c8c;
}
.org-item{
  margin: 5px;
}
</style>
