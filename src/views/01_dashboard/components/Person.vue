<template>
  <el-card :class="{ panelBg: isPanelStyle }">
    <div class="personal-message-box">
      <el-avatar :size="70" :src="user.avatar" />
      <span class="user-title">{{ user.name }}</span>
      <div class="btn-box">
        <span
          v-show="isPanelStyle"
          :class="{ exitBtn: isPanelStyle }"
          @click="exitEdit"
        >退出编辑</span>

        <span
          v-show="!isPanelStyle"
          class="person-btn"
          @click="handleCallSearch"
        >
          <search
            id="header-search"
            class="right-menu-item"
          />
        </span>
        <span
          v-show="!isPanelStyle"
          class="edit-btn"
          @click="editDesktop"
        ><i style="margin-right: 5px;" class="iconfont icon-edit" />管理我的桌面
        </span>
      </div>
    </div>
  </el-card>
</template>

<script>
import { getUserInfo } from '@/api/10_system/user/user'
import Search from '@/views/01_dashboard/components/dialog/search.vue'

export default {
  components: {
    Search
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    },
    editPersonStyle: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      user: {},
      panelId: this.id,
      isPanelStyle: this.editPersonStyle,
      fireEventFlg: false
    }
  },
  created () {
    this.getUser()
  },
  methods: {
    // 删除面板项发送事件
    deletePanelItem () {
      this.$emit('deletePanelItemEvent', this.panelId)
    },
    // 跳转管理界面事件
    editDesktop () {
      this.$emit('editDesktopEvent')
    },
    exitEdit () {
      // this.$router.push('check')
      this.$emit('exitEditEvent')
    },
    handleViewPersion () {
      this.$router.push('/user/info1')
    },
    handleCallSearch () {
      this.fireEventFlg = true
    },
    getUser () {
      getUserInfo({}).then(response => {
        this.user = response.data
        console.log(this.user)
        // this.roleGroup = response.roleGroup
        // this.postGroup = response.postGroup
      }).finally(() => {
        // this.settings.loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-card {
  height: 100%;
}
.personal-message-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0px 0;
  height: 100%;
}
.personal-message-box .user-title {
  margin: 10px 0;
  font-size: 1.5em;
  font-weight: bold;
}
.btn-box {
  display: flex;
  justify-content: center;
  width: 100%;
}
.btn-box .person-btn,
.edit-btn {
  flex: 0 0 50%;
  border: 1px solid #d7ddeb;
  border-radius: 4px;
  padding: 10px 0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.9em;
}
.btn-box .person-btn {
  margin-right: 5px;
  width: 100%;
}
.btn-box .edit-btn {
  margin-left: 5px;
}
.panelBg {
  background-color: #d3d6dc !important;
  border: none !important;
}
.exitBtn {
  border: 1px solid #d7ddeb;
  border-radius: 4px;
  text-align: center;
  padding: 10px 50px;
  cursor: pointer;
  background-color: #fff;
}
</style>
