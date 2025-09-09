<template>
  <div>
    <el-tabs
      ref="refTabs"
      v-model="settings.tabs.activeName"
      @tab-click="handleTabsClick"
      @tab-remove="handleRemoveTab"
    >
      <!--      付款单管理-列表-->
      <!--      注意：第一个list页面是不需要v-if来管理是否隐藏-->
      <el-tab-pane
        name="main"
      >
        <template slot="label">退款单管理-列表</template>
        <list_template
          :data="dataJson.data"
        />
      </el-tab-pane>

    </el-tabs>

  </div>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import list_template from './tabs/10_list/index.vue'

export default {
  components: { list_template },
  directives: { elDragDialog },
  props: {
    height: {
      type: Number,
      default: 200
    }
  },
  data () {
    return {
      dataJson: {
        tab: {
          showMain: true, // 显示主页面-列表
          showView: false // 显示查看页面
        },
        operation_head_info: '',
        permissionId: null,
        canEdit: null
      },
      // 页面设置json
      settings: {
        tabs: {
          activeName: 'main',
          is_edit: false
        },
        // loading 状态
        loading: true,
        duration: 4000
      }
    }
  },
  // 监听器
  watch: {
    // 监听页面状态变化，自动更新RouterTab标题
    'settings.tabs.activeName': {
      handler (newVal) {
        this.$nextTick(() => {
          this.updateTabTitleByState(newVal)
        })
      },
      immediate: true
    }
  },
  mounted () {
    // 描绘完成
    this.$nextTick(() => {
      this.$refs.refTabs.$el.children[0].style.margin = 0
      this.$refs.refTabs.$el.children[0].style.display = 'none'
    })
  },
  created () {
    // 设置页面标识，让FloatMenu组件能够正确管理列配置
    this.$options.name = this.$route.meta.page_code
  },
  methods: {
    // 状态到标题扩展的映射
    getTabTitleExtension (tabState) {
      const titleMap = {
        'main': '-查询',
        'view': '-查看'
      }
      return titleMap[tabState] || ''
    },

    // 根据页面状态更新RouterTab标题
    updateTabTitleByState (tabState) {
      const extensionText = this.getTabTitleExtension(tabState)
      // 使用RouterTab组件的通用方法
      if (this.$routerTab && this.$routerTab.updateTabTitle) {
        this.$routerTab.updateTabTitle(extensionText)
      }
    },

    handleTabsClick (tab, event) {
      // console.log(tab, event)
    },
    // 点击tabs的关闭
    handleRemoveTab (targetName) {
    },
    doCloseTab () {
      this.dataJson.tab.showView = false
      this.dataJson.tab.showMain = true
      this.settings.tabs.activeName = 'main'
    },
    /**
     * 新增页面返回
     */
    handleReturn () {
      this.dataJson.tab.showMain = true
      this.dataJson.tab.showView = false
      this.settings.tabs.activeName = 'main'
    }
  }
}
</script>

