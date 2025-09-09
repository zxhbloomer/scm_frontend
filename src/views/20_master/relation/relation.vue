<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col
        :xs="6"
        :sm="6"
        :md="6"
        :lg="6"
        :xl="6"
      >
        <el-card
          shadow="always"
          :body-style="{ padding: '10px' }"
        >
          <left
            :serial-data="serialData"
            :height="settings.leftHeight -68"
          />
        </el-card>
      </el-col>
      <el-col
        :xs="18"
        :sm="18"
        :md="18"
        :lg="18"
        :xl="18"
      >
        <el-card
          shadow="always"
          :body-style="{ padding: '10px' }"
        >
          <right :height="settings.rightHeight-68" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>

export default {
  components: {
    left: () => import('./left/left'), // 左侧tree
    right: () => import('./right/right') // 右侧list
  },
  props: {
    dataModel: {
      type: String,
      default: ''
    },
    meDialogStatus: {
      type: Boolean,
      default: false
    },
    serialData: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      // 数据类
      dataJson: {
      },
      // 页面设置json
      settings: {
        leftHeight: this.setUIheight(),
        rightHeight: this.setUIheight()
      }
    }
  },
  computed: {
    // leftHeight() {
    //   return this.setUIheight() - 60
    // },
    // rightHeight() {
    //   return this.setUIheight() - 50
    // }
  },
  // 监听器
  watch: {
  },
  created () {
    // 设置页面标识，让FloatMenu组件能够正确管理列配置
    this.$options.name = this.$route.meta.page_code
  },
  mounted () {
  },
  methods: {
    // 弹出框设置初始化
    initDialogStatus (val) {
      // this.dataJson.dialog_param = val
    }
  }
}
</script>
