<template>
  <div class="header-notice">
    <el-badge
      :value="$store.getters.messageCount"
      :max="99"
      class="item"
    >
      <div>
        <svg-icon
          v-popover:popover
          class-name="header-notice-icon"
          icon-class="bell"
          @click.stop="click"
        />
      </div>

      <el-popover
        ref="popover"
        placement="bottom"
        width="700"
      >
        <div>
          <span class="message-title">
            消息中心
          </span>
          <div style="float:right">
            <span class="notifications">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path d="M8 6.5A1.5 1.5 0 1 0 9.5 8 1.5 1.5 0 0 0 8 6.5zm5 0A1.5 1.5 0 1 0 14.47 8 1.5 1.5 0 0 0 13 6.5zm-10 0A1.5 1.5 0 1 0 4.53 8 1.5 1.5 0 0 0 3 6.5z" />
              </svg>
            </span>
          </div>
          <el-tabs
            ref="inTabs"
            v-model="tabs.active"
            @tab-click="handleTabsClick(tabs.active)"
          >
            <el-tab-pane name="first">
              <template slot="label">
                <el-badge
                  :value="toDoCount"
                  class="item"
                >
                  待办
                </el-badge></template>
            </el-tab-pane>
            <el-tab-pane name="second">
              <template slot="label">通知</template>
            </el-tab-pane>
            <el-tab-pane name="third">
              <template slot="label">
                <el-badge
                  :value="alarmCount"
                  class="item"
                >
                  预警
                </el-badge>
              </template>
            </el-tab-pane>
          </el-tabs>
          <!--          预警-->
          <AlarmHeader
            v-if="tabs.showAlarm"
            ref="syncAlarm"
            @closeTable="handleHeaderCloseTable"
          />
          <!--          消息通知-->
          <Pcnotice v-if="tabs.showNotice" />
          <!--          待办 template-->
          <todo
            v-if="tabs.showTodo"
            ref="syncTodo"
            @closeTable="handleHeaderCloseTable"
          />
        </div>
      </el-popover>
    </el-badge>
    <SyncPopup
      v-if="tabs.showAlarmPopup"
      title="预警"
      :show-alarm="tabs.showAlarmPopup"
      @closeTable="handleCloseTable"
    />
    <ResetPwdDialog
      v-if="tabs.showResetPwd"
      :show-dialog="tabs.showResetPwd"
      title="修改密码"
    />
  </div>
</template>

<style lang="scss" scoped>
.message-title {
  font-size: 18px;
  font-weight: bold;
}
.notifications {
  color: #b8d1e5;
  cursor: pointer;
}
</style>

<script>
import store from '@/store'
import AlarmHeader from '@/views/10_system/websocketnotice/header/alarmHeader'
import SyncPopup from '@/views/10_system/websocketnotice/dialog/alarmDialog'
import ResetPwdDialog from '@/views/10_system/websocketnotice/dialog/resetPwdDialog.vue'
import { getUserPwdWarningApi } from '@/api/user'
import { mapState, mapGetters } from 'vuex'
import Pcnotice from '@/views/10_system/pcnotice/dialog/header.vue'
// import { getCountApiApi } from '@/api/10_system/log/headerNotice'
import todo from '@/views/90_bpm/todo/dialog/index.vue'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  components: { AlarmHeader, SyncPopup, Pcnotice, ResetPwdDialog, todo },
  data () {
    return {
      tabs: {
        active: 'first',
        // 显示预警
        showAlarm: false,
        showAlarmPopup: false,
        showNotice: false, // 通知
        showResetPwd: false, // 密码过期
        showTodo: false
      },
      dataJson: {
        // 消息总数
        count_all: 0,
        // 同步失败数量
        syncCount: 0
      }
    }
  },
  computed: {
    ...mapState('headNotice', ['alarmCount', 'toDoCount']),
    ...mapGetters('websocket', ['isConnected', 'isReconnecting', 'connectionStatus'])
  },
  created () {
    // 设置默认打开页面el-tabs默认下划线不显示的问题
    this.handleTabsClick('first')
    // 解决
    this.$nextTick(() => {
      this.$refs.inTabs.$emit('tab-click', { name: '0' })
      this.$refs.inTabs.$el.querySelector('.el-tabs__active-bar').style.width =
        '42px'
    })
  },
  mounted () {
    this.init()
  },
  beforeDestroy () {
    // 使用store的disconnect action断开WebSocket连接
    this.$store.dispatch('websocket/WEBSOCKET_DISCONNECT')
  },
  methods: {
    /**
     * 初始化
     */
    async init () {
      // 通过vuex调用api，获取todocount，待办条数
      this.$store.dispatch('headNotice/todoCount', null)
      this.$store.dispatch('headNotice/alarmCount', null)
      this.getUserPwdWarning()

      // 初始化WebSocket连接和订阅
      await this.initWebSocket()
    },
    click () {
      // 通过vuex调用api，获取todocount，待办条数
      this.$store.dispatch('headNotice/todoCount', null)
    },
    /**
     * 初始化WebSocket连接和订阅
     */
    async initWebSocket () {
      try {
        // 使用store初始化WebSocket连接
        await this.$store.dispatch('websocket/WEBSOCKET_INIT')

        // 设置所有必要的订阅
        this.setupWebSocketSubscriptions()

        console.log('WebSocket连接和订阅设置完成')
      } catch (error) {
        console.error('WebSocket初始化失败:', error)
      }
    },
    /**
     * 设置WebSocket订阅
     */
    setupWebSocketSubscriptions () {
      // 订阅：心跳检测
      this.$store.dispatch('websocket/WEBSOCKET_SUBSCRIBE', {
        topic: '/topic/beating',
        callback: (res) => {
          console.log('ping!' + res)
        }
      })

      // 订阅：预警消息通知
      this.$store.dispatch('websocket/WEBSOCKET_SUBSCRIBE', {
        topic: `/user/${store.getters.staff_id}/topic/syncLog`,
        callback: (res) => {
          console.log('/topic/syncLog!' + res)
          const data = JSON.parse(res.body)

          if (data.is_using) {
            // notice_type:0消息通知, 1弹窗显示, 2用户密码过期
            if (data.notice_type === '1') {
              this.tabs.showAlarmPopup = true
            } else if (data.notice_type === '0') {
              this.tabs.showAlarm = true
              this.$refs.popover.doShow()
              this.$refs.syncAlarm.handleParentReturn()
              this.tabs.active = 'third'
              window.localStorage.setItem('WMS_HEADER_NOTICE_DEFAULT_PAGE', this.tabs.active)
            } else if (data.notice_type === '2') {
              this.tabs.showResetPwd = true
            }
          }
        }
      })

      // 订阅：审批消息通知
      this.$store.dispatch('websocket/WEBSOCKET_SUBSCRIBE', {
        topic: `/user/${store.getters.staff_id}/topic/bpm/approve`,
        callback: (res) => {
          console.log('websocket消息通知：/topic/bpm/approve!' + res)
          const data = JSON.parse(res.body)

          // 显示消息通知
          this.$notify({
            title: '消息通知',
            dangerouslyUseHTMLString: true,
            message: data.html,
            customClass: 'custom-notify',
            duration: 0
          })

          // 更新待办条数
          this.$store.dispatch('headNotice/todoCount', null)
          // 发起全局事件
          EventBus.$emit(this.EMITS.EMIT_NOTISE_BPM)

          if (data.type === '1') {
            this.tabs.showAlarmPopup = true
          } else if (data.type === '0') {
            this.handleTabsClick('first')
            this.$refs.popover.doShow()
            this.tabs.active = '0'
          }
        }
      })

      // 订阅：审批拒绝消息通知
      this.$store.dispatch('websocket/WEBSOCKET_SUBSCRIBE', {
        topic: `/user/${store.getters.staff_id}/topic/bpm/refuse`,
        callback: (res) => {
          console.log('websocket消息通知：/topic/bpm/refuse!' + res)
          const data = JSON.parse(res.body)

          this.$notify({
            title: '消息通知',
            dangerouslyUseHTMLString: true,
            message: data.html,
            customClass: 'custom-notify',
            duration: 0
          })

          this.$store.dispatch('headNotice/todoCount', null)
          EventBus.$emit(this.EMITS.EMIT_NOTISE_BPM)
        }
      })

      // 订阅：审批撤销消息通知
      this.$store.dispatch('websocket/WEBSOCKET_SUBSCRIBE', {
        topic: `/user/${store.getters.staff_id}/topic/bpm/cancel`,
        callback: (res) => {
          console.log('websocket消息通知：/topic/bpm/cancel!' + res)
          const data = JSON.parse(res.body)

          this.$notify({
            title: '消息通知',
            dangerouslyUseHTMLString: true,
            message: data.html,
            customClass: 'custom-notify',
            duration: 0
          })

          this.$store.dispatch('headNotice/todoCount', null)
          EventBus.$emit(this.EMITS.EMIT_NOTISE_BPM)
        }
      })
    },

    // 切换页签
    handleTabsClick (name, event) {
      switch (name) {
        case 'first':
          // 待办
          this.tabs.showAlarm = false
          this.tabs.showNotice = false
          this.tabs.showTodo = true
          this.tabs.active = name
          break
        case 'second':
          // 通知
          this.tabs.showAlarm = false
          this.tabs.showNotice = true
          this.tabs.showTodo = false
          this.tabs.active = name
          break
        case 'third':
          // 预警
          this.tabs.showAlarm = true
          this.tabs.showNotice = false
          this.tabs.showTodo = false
          this.tabs.active = name
          break
      }
      // 将选择的index存储在localstorage
      window.localStorage.setItem('WMS_HEADER_NOTICE_DEFAULT_PAGE', this.tabs.active)
    },
    // 关闭弹窗
    handleCloseTable () {
      this.$refs.popover.doClose()
      this.tabs.showAlarmPopup = false
    },
    // 关闭提醒
    handleHeaderCloseTable () {
      this.$refs.popover.doClose()
      // this.tabs.showAlarm = false
    },
    // 查询信息中心全部消息数量
    // getNoticeNumber () {
    //   getCountApiApi().then(response => {
    //     const data = response.data
    //     this.dataJson.syncCount = data.syncCount
    //     this.dataJson.count_all = data.syncCount
    //   }).finally(() => {
    //   })
    // }
    // 密码是否过期
    getUserPwdWarning () {
      getUserPwdWarningApi().then(response => {
        if (response.data.pwd_expired === true) {
          this.tabs.showResetPwd = true
        }
      }).finally(() => {
      })
    }
  }
}
</script>
<style lang="scss" scoped>

::v-deep .el-badge__content.is-fixed {
  top: 10px;
}
::v-deep .el-badge__content {
  border: 0px;
}
.header-notice {
  font-size: 0 !important;

  .header-notice-icon {
    cursor: pointer;
    font-size: 18px;
    vertical-align: middle;
  }

  .header-notice-select {
    width: 600px;
    opacity: 1;

    font-size: 18px;
    transition: width 0.2s;
    width: 0;
    overflow: hidden;
    background: transparent;
    border-radius: 0;
    display: inline-block;
    vertical-align: middle;

    ::v-deep .el-input__inner {
      border-radius: 0;
      border: 0;
      padding-left: 0;
      padding-right: 0;
      box-shadow: none !important;
      border-bottom: 1px solid #d9d9d9;
      vertical-align: middle;
    }
  }

  &.show {
    .header-notice-select {
      width: 210px;
      // margin-left: 10px;
      pointer-events: auto;
      opacity: 1;
      position: absolute;
    }
  }
}
</style>
