<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col
        :span="6"
        :xs="24"
      >
        <el-card class="box-card">
          <div
            slot="header"
            class="clearfix"
          >
            <span>个人信息</span>
          </div>
          <div>
            <div class="text-center">
              <userAvatar :user="user" />
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <span class="item-label"><svg-icon icon-class="user" />用户名称</span>
                <span class="item-value">{{ user.name }}</span>
              </li>
              <li class="list-group-item">
                <span class="item-label"><svg-icon icon-class="phone" />手机号码</span>
                <span class="item-value">{{ user.user_session_bean && user.user_session_bean.staff_info ? user.user_session_bean.staff_info.mobile_phone : '' }}</span>
              </li>
              <li class="list-group-item">
                <span class="item-label"><svg-icon icon-class="email" />用户邮箱</span>
                <span class="item-value">{{ user.email }}</span>
              </li>
              <li class="list-group-item">
                <span class="item-label"><svg-icon icon-class="tree" />所属部门</span>
                <span class="item-value">{{ user.dept ? user.dept.deptName : '' }}</span>
              </li>
              <li class="list-group-item">
                <span class="item-label"><svg-icon icon-class="date" />创建日期</span>
                <span class="item-value">{{ user.user_session_bean && user.user_session_bean.staff_info ? user.user_session_bean.staff_info.c_time : '' }}</span>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col
        :span="9"
        :xs="24"
      >
        <el-card>
          <div
            slot="header"
            class="clearfix"
          >
            <span>基本资料</span>
          </div>
          <el-tabs v-model="activeTab">
            <el-tab-pane
              label="基本资料"
              name="userinfo"
            >
              <userInfo :user="user" />
            </el-tab-pane>
            <el-tab-pane
              label="修改密码"
              name="resetPwd"
            >
              <resetPwd />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
      <el-col
        :span="9"
        :xs="24"
      >
        <el-card>
          <div
            slot="header"
            class="clearfix"
          >
            <span>系统设置</span>
          </div>
          <system-settings />

        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import userAvatar from './userAvatar'
import userInfo from './userInfo'
import resetPwd from './resetPwd'
import { getUserInfo } from '@/api/10_system/user/user'
import SystemSettings from '@/views/20_master/user/systemSettings.vue'

export default {
  name: 'Profile',
  components: { userAvatar, userInfo, resetPwd, SystemSettings },
  data () {
    return {
      user: {},
      roleGroup: {},
      postGroup: {},
      activeTab: 'userinfo'
    }
  },
  created () {
    this.getUser()
  },
  methods: {
    getUser () {
      getUserInfo({}).then(response => {
        this.user = response.data
        // this.roleGroup = response.roleGroup
        // this.postGroup = response.postGroup
      }).finally(() => {
        // this.settings.loading = false
      })
    }
  }
}
</script>

<style scoped>
.list-group {
  padding-left: 0;
  list-style: none;
  margin: 16px 0 0 0;
}
.list-group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #606266;
}
.list-group-item:last-child {
  border-bottom: none;
}
.item-label {
  display: flex;
  align-items: center;
  color: #909399;
}
.item-label .svg-icon {
  margin-right: 6px;
  font-size: 16px;
}
.item-value {
  color: #303133;
}
.text-center {
  text-align: center;
  margin-bottom: 16px;
}
</style>
