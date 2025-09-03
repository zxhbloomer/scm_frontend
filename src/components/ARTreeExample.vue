<template>
  <div class="ar-tree-example">
    <!-- AR增强现实拖拽树示例 -->
    <div class="ar-tree-header">
      <h3>🚀 方案五：增强现实指引系统示例</h3>
      <p>体验类似增强现实的拖拽效果：实时路径预测、动态指引线、智能区域提示</p>
    </div>

    <!-- 树组件容器 -->
    <div class="ar-tree-container">
      <el-tree
        ref="arTree"
        :data="treeData"
        :props="treeProps"
        :draggable="true"
        :allow-drop="allowDrop"
        :allow-drag="allowDrag"
        node-key="id"
        default-expand-all
        @node-drag-start="onDragStart"
        @node-drag-enter="onDragEnter"
        @node-drag-leave="onDragLeave"
        @node-drag-over="onDragOver"
        @node-drag-end="onDragEnd"
        @node-drop="onDrop"
      >
        <template #default="{ node, data }">
          <span class="ar-tree-node-content">
            <i :class="getNodeIcon(data)" />
            <span class="ar-node-label">{{ node.label }}</span>
            <el-badge
              v-if="data.children && data.children.length"
              :value="data.children.length"
              class="ar-children-count"
            />
          </span>
        </template>
      </el-tree>
    </div>

    <!-- AR系统状态面板 -->
    <div class="ar-status-panel">
      <div class="status-item">
        <span class="status-label">AR系统状态:</span>
        <el-tag :type="arEnabled ? 'success' : 'info'">
          {{ arEnabled ? '🟢 已启用' : '⚪ 未启用' }}
        </el-tag>
      </div>
      <div class="status-item">
        <span class="status-label">当前拖拽:</span>
        <el-tag v-if="isDragging" type="primary">{{ currentDragNode }}</el-tag>
        <el-tag v-else type="info">无</el-tag>
      </div>
      <div class="status-item">
        <span class="status-label">目标节点:</span>
        <el-tag v-if="currentTarget" type="warning">{{ currentTarget }}</el-tag>
        <el-tag v-else type="info">无</el-tag>
      </div>
    </div>

    <!-- 操作提示 -->
    <div class="ar-tips">
      <h4>🎯 AR拖拽体验特点：</h4>
      <ul>
        <li><strong>🔮 拖拽幽灵：</strong>跟随鼠标的半透明节点预览，带脉冲指示器</li>
        <li><strong>📍 智能高亮：</strong>所有潜在目标自动高亮，当前目标特殊标记</li>
        <li><strong>🎨 脉冲环：</strong>围绕当前目标的动态脉冲环效果</li>
        <li><strong>📏 指引线：</strong>从鼠标到目标的实时指引线，带流动动画</li>
        <li><strong>🎚️ 置信度条：</strong>右上角实时显示拖拽操作的置信度</li>
        <li><strong>📂 区域提示：</strong>明确的文字提示告诉您拖拽的具体位置</li>
        <li><strong>✅ 成功动画：</strong>拖拽完成时的视觉确认效果</li>
      </ul>
    </div>
  </div>
</template>

<script>
import ARTreeDrag from '@/mixins/arTreeDrag'

export default {
  name: 'ARTreeExample',
  mixins: [ARTreeDrag],

  data () {
    return {
      // 树组件配置
      treeProps: {
        children: 'children',
        label: 'name'
      },

      // AR系统状态
      arEnabled: true,
      isDragging: false,
      currentDragNode: '',
      currentTarget: '',

      // 示例树数据
      treeData: [
        {
          id: 1,
          name: '📁 项目根目录',
          type: 'folder',
          children: [
            {
              id: 11,
              name: '📂 src',
              type: 'folder',
              children: [
                {
                  id: 111,
                  name: '🎨 components',
                  type: 'folder',
                  children: [
                    { id: 1111, name: '📄 Header.vue', type: 'file' },
                    { id: 1112, name: '📄 Footer.vue', type: 'file' },
                    { id: 1113, name: '📄 Sidebar.vue', type: 'file' }
                  ]
                },
                {
                  id: 112,
                  name: '📁 views',
                  type: 'folder',
                  children: [
                    { id: 1121, name: '🏠 Home.vue', type: 'file' },
                    { id: 1122, name: '👤 Profile.vue', type: 'file' },
                    { id: 1123, name: '⚙️ Settings.vue', type: 'file' }
                  ]
                },
                {
                  id: 113,
                  name: '🔧 utils',
                  type: 'folder',
                  children: [
                    { id: 1131, name: '📄 helpers.js', type: 'file' },
                    { id: 1132, name: '📄 constants.js', type: 'file' }
                  ]
                }
              ]
            },
            {
              id: 12,
              name: '🧪 tests',
              type: 'folder',
              children: [
                { id: 121, name: '📄 unit.test.js', type: 'file' },
                { id: 122, name: '📄 e2e.test.js', type: 'file' }
              ]
            },
            {
              id: 13,
              name: '📚 docs',
              type: 'folder',
              children: [
                { id: 131, name: '📖 README.md', type: 'file' },
                { id: 132, name: '📋 CHANGELOG.md', type: 'file' }
              ]
            }
          ]
        }
      ]
    }
  },

  methods: {
    /**
     * 获取节点图标
     */
    getNodeIcon (data) {
      const iconMap = {
        folder: 'el-icon-folder',
        file: 'el-icon-document'
      }
      return iconMap[data.type] || 'el-icon-document'
    },

    /**
     * 是否允许拖拽
     */
    allowDrag (draggingNode) {
      console.log('AR树：检查拖拽权限', draggingNode.data.name)
      return true // 允许所有节点拖拽
    },

    /**
     * 是否允许放置
     */
    allowDrop (draggingNode, dropNode, type) {
      console.log('AR树：检查放置权限', {
        dragging: draggingNode.data.name,
        target: dropNode.data.name,
        type
      })

      // 文件不能包含其他节点
      if (dropNode.data.type === 'file' && type === 'inner') {
        return false
      }

      return true
    },

    /**
     * 拖拽开始事件
     */
    onDragStart (node, ev) {
      console.log('AR树：开始拖拽', node.data.name)
      this.isDragging = true
      this.currentDragNode = node.data.name
      this.arEnabled = true
    },

    /**
     * 拖拽进入事件
     */
    onDragEnter (draggingNode, dropNode, ev) {
      console.log('AR树：拖拽进入', {
        dragging: draggingNode.data.name,
        target: dropNode.data.name
      })
      this.currentTarget = dropNode.data.name
    },

    /**
     * 拖拽离开事件
     */
    onDragLeave (draggingNode, dropNode, ev) {
      console.log('AR树：拖拽离开', dropNode.data.name)
      if (this.currentTarget === dropNode.data.name) {
        this.currentTarget = ''
      }
    },

    /**
     * 拖拽悬停事件
     */
    onDragOver (draggingNode, dropNode, ev) {
      // AR系统会自动处理悬停效果
    },

    /**
     * 拖拽结束事件
     */
    onDragEnd (draggingNode, dropNode, dropType, ev) {
      console.log('AR树：拖拽结束')
      this.isDragging = false
      this.currentDragNode = ''
      this.currentTarget = ''
    },

    /**
     * 节点放置事件
     */
    onDrop (draggingNode, dropNode, dropType, ev) {
      console.log('AR树：节点放置', {
        dragging: draggingNode.data.name,
        target: dropNode.data.name,
        type: dropType
      })

      // 显示成功消息
      this.$message.success({
        message: `✅ "${draggingNode.data.name}" 已成功移动到 "${dropNode.data.name}" ${this.getDropTypeText(dropType)}`,
        duration: 3000
      })
    },

    /**
     * 获取放置类型文本
     */
    getDropTypeText (dropType) {
      const typeMap = {
        'before': '上方',
        'after': '下方',
        'inner': '内部'
      }
      return typeMap[dropType] || dropType
    }
  }
}
</script>

<style lang="scss" scoped>
.ar-tree-example {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;

  .ar-tree-header {
    text-align: center;
    margin-bottom: 30px;

    h3 {
      color: #2c3e50;
      font-size: 24px;
      margin-bottom: 10px;
    }

    p {
      color: #7f8c8d;
      font-size: 16px;
      margin: 0;
    }
  }

  .ar-tree-container {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 20px;

    ::v-deep .el-tree {
      background: transparent;

      .el-tree-node__content {
        height: 40px;
        border-radius: 8px;
        margin: 2px 0;
        transition: all 0.3s ease;

        &:hover {
          background-color: rgba(64, 158, 255, 0.1);
          transform: translateX(4px);
        }
      }

      .ar-tree-node-content {
        display: flex;
        align-items: center;
        width: 100%;

        i {
          margin-right: 8px;
          font-size: 16px;
          color: #409EFF;
        }

        .ar-node-label {
          flex: 1;
          font-weight: 500;
          color: #2c3e50;
        }

        .ar-children-count {
          ::v-deep .el-badge__content {
            background-color: #67c23a;
            font-size: 10px;
          }
        }
      }
    }
  }

  .ar-status-panel {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
    backdrop-filter: blur(5px);

    .status-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .status-label {
        font-weight: 600;
        color: #34495e;
        margin-right: 10px;
        min-width: 100px;
      }
    }
  }

  .ar-tips {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 8px;
    padding: 20px;
    backdrop-filter: blur(5px);

    h4 {
      color: #2c3e50;
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 18px;
    }

    ul {
      margin: 0;
      padding-left: 20px;

      li {
        color: #34495e;
        margin-bottom: 8px;
        line-height: 1.6;

        strong {
          color: #2c3e50;
        }
      }
    }
  }
}
</style>
