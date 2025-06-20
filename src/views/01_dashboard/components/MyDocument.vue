<template>
  <el-card>
    <!-- 标题 -->
    <div slot="header">
      <span class="el-card-title">我督办的公文</span>
      <i
        v-show="!isPanelSetIcon"
        class="el-icon-close"
        style="float: right; padding: 3px 0"
        @click="deletePanelItem"
      />
      <i
        v-show="isPanelSetIcon"
        class="iconfont icon-caret-right"
        style="float: right; padding: 3px 0"
      />
    </div>
    <!-- 标签栏 -->
    <div class="mydocument-box">
      <div class="mydocument-item">
        <span>405001</span>
        <i class="iconfont icon-bell-fill" />
        <span>收文-关于国庆节假期规定</span>
        <span class="level-item">普通</span>
        <span>当前步骤：部门会签</span>
        <span class="name-item">王小明</span>
        <span>2020-09-10 09:51</span>
      </div>
      <div class="mydocument-item">
        <span>405001</span>
        <i class="iconfont icon-bell-fill" />
        <span>收文-关于国庆节假期规定</span>
        <span class="level-item">普通</span>
        <span>当前步骤：部门会签</span>
        <span class="name-item">王小明</span>
        <span>2020-09-10 09:51</span>
      </div>
      <div class="mydocument-item">
        <span>405001</span>
        <i class="iconfont icon-bell-fill" />
        <span>收文-关于国庆节假期规定</span>
        <span class="level-item">普通</span>
        <span>当前步骤：部门会签</span>
        <span class="name-item">王小明</span>
        <span>2020-09-10 09:51</span>
      </div>
      <div class="mydocument-item">
        <span>405001</span>
        <i class="iconfont icon-bell-fill" />
        <span>收文-关于国庆节假期规定</span>
        <span class="level-item">普通</span>
        <span>当前步骤：部门会签</span>
        <span class="name-item">王小明</span>
        <span>2020-09-10 09:51</span>
      </div>
      <div class="mydocument-item">
        <span>405001</span>
        <i class="iconfont icon-bell-fill" />
        <span>收文-关于国庆节假期规定</span>
        <span class="level-item">普通</span>
        <span>当前步骤：部门会签</span>
        <span class="name-item">王小明</span>
        <span>2020-09-10 09:51</span>
      </div>
    </div>
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
      panelId: this.id,
      isPanelSetIcon: this.panelSetIcon
    }
  },
  methods: {
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
}
.el-icon-close {
  font-size: 1.2em;
  cursor: pointer;
}
.el-card-title {
  font-weight: bold;
}
.mydocument-item {
  display: grid;
  grid-template-columns: 1fr 0.5fr 3.5fr 1fr 3fr 1fr 2fr;
  height: 40px;
  cursor: pointer;
  font-size: 14px;
  line-height: 40px;
}
.mydocument-item i {
  color: #ffb339;
}
.mydocument-item > * {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
