<template>
  <div class="design-canvas">
    <div class="canvas-toolbar">
      <el-button-group>
        <el-button size="mini" icon="el-icon-zoom-in" @click="handleZoomIn">放大</el-button>
        <el-button size="mini" icon="el-icon-zoom-out" @click="handleZoomOut">缩小</el-button>
        <el-button size="mini" icon="el-icon-refresh" @click="handleReset">重置</el-button>
      </el-button-group>
      <span class="zoom-info">{{ zoomLevel }}%</span>
    </div>

    <div
      class="canvas-container"
      :style="{ transform: `scale(${zoomLevel / 100})` }"
      @drop="handleDrop"
      @dragover.prevent
    >
      <div class="canvas-paper">
        <!-- 网格背景 -->
        <div class="grid-background" />

        <!-- 报表组件容器 -->
        <div class="components-container">
          <draggable
            v-model="reportComponents"
            :group="{ name: 'report-components' }"
            @change="handleComponentsChange"
          >
            <report-component
              v-for="component in reportComponents"
              :key="component.id"
              :component-data="component"
              :selected="selectedComponentId === component.id"
              @click="handleSelectComponent"
              @contextmenu.prevent="handleContextMenu"
            />
          </draggable>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <el-dropdown
      v-if="contextMenuVisible"
      :style="contextMenuStyle"
      trigger="click"
      @command="handleContextCommand"
    >
      <span />
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="copy">复制</el-dropdown-item>
        <el-dropdown-item command="cut">剪切</el-dropdown-item>
        <el-dropdown-item command="paste">粘贴</el-dropdown-item>
        <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import Draggable from 'vuedraggable'
import ReportComponent from './ReportComponent.vue'

export default {
  name: 'DesignCanvas',
  components: {
    Draggable,
    ReportComponent
  },
  data () {
    return {
      zoomLevel: 100,
      reportComponents: [],
      selectedComponentId: null,
      contextMenuVisible: false,
      contextMenuStyle: {},
      copiedComponent: null
    }
  },
  methods: {
    /**
     * 放大
     */
    handleZoomIn () {
      if (this.zoomLevel < 200) {
        this.zoomLevel += 10
      }
    },

    /**
     * 缩小
     */
    handleZoomOut () {
      if (this.zoomLevel > 50) {
        this.zoomLevel -= 10
      }
    },

    /**
     * 重置缩放
     */
    handleReset () {
      this.zoomLevel = 100
    },

    /**
     * 处理拖拽放置
     */
    handleDrop (event) {
      event.preventDefault()
      const componentType = event.dataTransfer.getData('componentType')
      if (componentType) {
        this.addComponent(componentType, {
          x: event.offsetX,
          y: event.offsetY
        })
      }
    },

    /**
     * 添加组件
     */
    addComponent (type, position) {
      const newComponent = {
        id: `component_${Date.now()}`,
        type: type,
        x: position.x,
        y: position.y,
        width: 100,
        height: 50,
        properties: this.getDefaultProperties(type)
      }

      this.reportComponents.push(newComponent)
      this.selectedComponentId = newComponent.id
      this.$emit('component-added', newComponent)
    },

    /**
     * 获取默认属性
     */
    getDefaultProperties (type) {
      const defaultProps = {
        text: { content: '文本', fontSize: 14, color: '#333' },
        table: { rows: 3, cols: 3, showHeader: true },
        chart: { chartType: 'bar', dataSource: null },
        image: { src: '', alt: '图片' }
      }
      return defaultProps[type] || {}
    },

    /**
     * 组件选择
     */
    handleSelectComponent (componentId) {
      this.selectedComponentId = componentId
      const selectedComponent = this.reportComponents.find(c => c.id === componentId)
      this.$emit('component-selected', selectedComponent)
    },

    /**
     * 右键菜单
     */
    handleContextMenu (event, componentId) {
      this.selectedComponentId = componentId
      this.contextMenuVisible = true
      this.contextMenuStyle = {
        position: 'fixed',
        left: event.clientX + 'px',
        top: event.clientY + 'px',
        zIndex: 9999
      }
    },

    /**
     * 右键菜单命令
     */
    handleContextCommand (command) {
      const selectedComponent = this.reportComponents.find(c => c.id === this.selectedComponentId)

      switch (command) {
        case 'copy':
          this.copiedComponent = JSON.parse(JSON.stringify(selectedComponent))
          break
        case 'cut':
          this.copiedComponent = JSON.parse(JSON.stringify(selectedComponent))
          this.deleteComponent(this.selectedComponentId)
          break
        case 'paste':
          if (this.copiedComponent) {
            const pastedComponent = JSON.parse(JSON.stringify(this.copiedComponent))
            pastedComponent.id = `component_${Date.now()}`
            pastedComponent.x += 10
            pastedComponent.y += 10
            this.reportComponents.push(pastedComponent)
          }
          break
        case 'delete':
          this.deleteComponent(this.selectedComponentId)
          break
      }

      this.contextMenuVisible = false
    },

    /**
     * 删除组件
     */
    deleteComponent (componentId) {
      const index = this.reportComponents.findIndex(c => c.id === componentId)
      if (index > -1) {
        this.reportComponents.splice(index, 1)
        this.selectedComponentId = null
        this.$emit('component-deleted', componentId)
      }
    },

    /**
     * 组件变化
     */
    handleComponentsChange (change) {
      this.$emit('components-changed', this.reportComponents)
    },

    /**
     * 清空画布
     */
    clearCanvas () {
      this.reportComponents = []
      this.selectedComponentId = null
      this.zoomLevel = 100
    },

    /**
     * 获取设计数据
     */
    getDesignData () {
      return {
        components: this.reportComponents,
        canvasSettings: {
          width: 800,
          height: 600,
          backgroundColor: '#ffffff'
        }
      }
    },

    /**
     * 加载设计数据
     */
    loadDesignData (data) {
      this.reportComponents = data.components || []
      this.selectedComponentId = null
    }
  }
}
</script>

<style lang="scss" scoped>
.design-canvas {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;

  .canvas-toolbar {
    padding: 8px 16px;
    background: #fff;
    border-bottom: 1px solid #dcdfe6;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .zoom-info {
      font-size: 12px;
      color: #909399;
    }
  }

  .canvas-container {
    flex: 1;
    overflow: auto;
    padding: 20px;
    transform-origin: top left;

    .canvas-paper {
      width: 800px;
      height: 600px;
      background: #fff;
      border: 1px solid #dcdfe6;
      position: relative;
      margin: 0 auto;

      .grid-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image:
          linear-gradient(90deg, #f0f0f0 1px, transparent 1px),
          linear-gradient(#f0f0f0 1px, transparent 1px);
        background-size: 10px 10px;
        pointer-events: none;
      }

      .components-container {
        position: relative;
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
