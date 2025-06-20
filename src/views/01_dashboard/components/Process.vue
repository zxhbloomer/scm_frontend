<template>
  <el-card>
    <i
      v-show="!isPanelSetIcon"
      class="el-icon-close process-close-icon"
      @click="deletePanelItem"
    />
    <i
      v-show="isPanelSetIcon"
      class="iconfont icon-caret-right process-close-icon"
    />
    <!-- 标签栏 -->
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="待办流程" name="first">
        <div class="process-box">
          <div class="process-item">
            <el-avatar src="https://picsum.photos/200/200?random=2" />
            <span>王小明</span>
            <span>请假申请</span>
            <span>当前步骤：经理审批</span>
            <span>2020-09-10 09:51</span>
          </div>
        </div>
        <div class="process-box">
          <div class="process-item">
            <el-avatar src="https://picsum.photos/200/200?random=3" />
            <span>王小明</span>
            <span>请假申请</span>
            <span>当前步骤：经理审批</span>
            <span>2020-09-10 09:51</span>
          </div>
        </div>
        <div class="process-box">
          <div class="process-item">
            <el-avatar src="https://picsum.photos/200/200?random=4" />
            <span>王小明</span>
            <span>请假申请</span>
            <span>当前步骤：经理审批</span>
            <span>2020-09-10 09:51</span>
          </div>
        </div>
        <div class="process-box">
          <div class="process-item">
            <el-avatar src="https://picsum.photos/200/200?random=5" />
            <span>王小明</span>
            <span>请假申请</span>
            <span>当前步骤：经理审批</span>
            <span>2020-09-10 09:51</span>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="待签阅流程" name="second">配置管理</el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
export default {
  props: {
    id: {
      type: [String, Number],
      required: true
    },
    panelSetIcon: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      activeName: 'first',
      panelId: this.id,
      isPanelSetIcon: this.panelSetIcon
    }
  },
  methods: {
    handleClick (tab, event) {
      console.log(tab, event)
    },
    // 删除面板项
    deletePanelItem () {
      this.$emit('deletePanelItemEvent', this.panelId)
    }
  }
}
</script>

<style scoped>
.el-card {
  height: 100%;
  position: relative;
}
.el-card .process-close-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 200;
}
.process-item {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr 3fr 3fr;
  height: 40px;
  margin-bottom: 20px;
  font-size: 14px;
  cursor: pointer;
  line-height: 40px;
}
.process-item > * {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
