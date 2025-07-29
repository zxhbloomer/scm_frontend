<template>
  <div class="system-flow-chart">
    <svg :width="svgWidth" :height="svgHeight" viewBox="0 0 1200 800">
      <!-- 背景装饰 -->
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f0f8ff;stop-opacity:0.5" />
          <stop offset="100%" style="stop-color:#e6f3ff;stop-opacity:0.8" />
        </linearGradient>

        <!-- 箭头标记 -->
        <marker
          id="arrowhead"
          markerWidth="12"
          markerHeight="8"
          refX="11"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,8 L12,4 z" fill="#4A90E2" />
        </marker>
      </defs>

      <!-- 背景 -->
      <rect width="100%" height="100%" fill="url(#bgGradient)" />

      <!-- 模块框 -->
      <g v-for="module in modules" :key="module.id" class="module-group">
        <rect
          :x="module.x"
          :y="module.y"
          :width="module.width"
          :height="module.height"
          :fill="module.color"
          :stroke="module.borderColor"
          stroke-width="2"
          rx="8"
          ry="8"
          class="module-rect"
        />

        <!-- 图标区域 -->
        <rect
          :x="module.x + 10"
          :y="module.y + 10"
          width="40"
          height="40"
          :fill="module.iconBg"
          rx="6"
        />

        <!-- 模块标题 -->
        <text
          :x="module.x + module.width/2"
          :y="module.y + module.height - 15"
          text-anchor="middle"
          font-size="14"
          font-weight="500"
          fill="#333"
        >
          {{ module.label }}
        </text>
      </g>

      <!-- 连接线 -->
      <g v-for="connection in connections" :key="connection.id" class="connection-group">
        <path
          :d="connection.path"
          stroke="#4A90E2"
          stroke-width="3"
          fill="none"
          marker-end="url(#arrowhead)"
          class="connection-line"
        />
      </g>

      <!-- 标题 -->
      <text x="600" y="40" text-anchor="middle" font-size="24" font-weight="bold" fill="#2C5AA0">
        全系统流程图
      </text>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'SystemFlowChart',
  data () {
    return {
      svgWidth: 1200,
      svgHeight: 800,
      modules: [
        // 左侧模块
        { id: 1, x: 50, y: 100, width: 120, height: 80, label: '行政办公', color: '#E8F5E8', borderColor: '#4CAF50', iconBg: '#4CAF50' },
        { id: 2, x: 50, y: 200, width: 120, height: 80, label: '客户关系', color: '#FFF3E0', borderColor: '#FF9800', iconBg: '#FF9800' },
        { id: 3, x: 50, y: 300, width: 120, height: 80, label: '服务管理', color: '#F3E5F5', borderColor: '#9C27B0', iconBg: '#9C27B0' },
        { id: 4, x: 50, y: 400, width: 120, height: 80, label: '检验管理', color: '#E0F2F1', borderColor: '#009688', iconBg: '#009688' },
        { id: 5, x: 50, y: 500, width: 120, height: 80, label: '管理导航', color: '#E1F5FE', borderColor: '#03A9F4', iconBg: '#03A9F4' },

        // 第二列
        { id: 6, x: 300, y: 100, width: 120, height: 80, label: '应收应付', color: '#FFF8E1', borderColor: '#FFC107', iconBg: '#FFC107' },
        { id: 7, x: 300, y: 250, width: 120, height: 80, label: '现金银行', color: '#FFF8E1', borderColor: '#FFC107', iconBg: '#FFC107' },
        { id: 8, x: 300, y: 400, width: 120, height: 80, label: '固定资产', color: '#FFF8E1', borderColor: '#FFC107', iconBg: '#FFC107' },
        { id: 9, x: 300, y: 550, width: 120, height: 80, label: '人事管理', color: '#E3F2FD', borderColor: '#2196F3', iconBg: '#2196F3' },

        // 第三列
        { id: 10, x: 550, y: 100, width: 120, height: 80, label: '销售管理', color: '#FFF8E1', borderColor: '#FFC107', iconBg: '#FFC107' },
        { id: 11, x: 550, y: 250, width: 120, height: 80, label: '采购管理', color: '#E8F5E8', borderColor: '#4CAF50', iconBg: '#4CAF50' },
        { id: 12, x: 550, y: 400, width: 120, height: 80, label: '存货管理', color: '#FFEBEE', borderColor: '#F44336', iconBg: '#F44336' },
        { id: 13, x: 550, y: 550, width: 120, height: 80, label: '会计总账', color: '#FCE4EC', borderColor: '#E91E63', iconBg: '#E91E63' },

        // 右侧列
        { id: 14, x: 800, y: 100, width: 120, height: 80, label: '物料需求', color: '#E8F5E8', borderColor: '#4CAF50', iconBg: '#4CAF50' },
        { id: 15, x: 800, y: 250, width: 120, height: 80, label: '生产管理', color: '#FFEBEE', borderColor: '#F44336', iconBg: '#F44336' },
        { id: 16, x: 800, y: 400, width: 120, height: 80, label: '工艺管理', color: '#FFF8E1', borderColor: '#FFC107', iconBg: '#FFC107' },
        { id: 17, x: 800, y: 550, width: 120, height: 80, label: '生产成本', color: '#E0F2F1', borderColor: '#009688', iconBg: '#009688' }
      ],
      connections: [
        // 主要业务流程连接
        { id: 1, path: 'M 420 140 L 530 140 Q 540 140 540 150 L 540 140' },
        { id: 2, path: 'M 670 140 L 780 140 Q 790 140 790 150 L 790 140' },
        { id: 3, path: 'M 670 290 L 780 290 Q 790 290 790 300 L 790 290' },
        { id: 4, path: 'M 420 290 L 530 290 Q 540 290 540 300 L 540 290' },
        { id: 5, path: 'M 420 440 L 530 440 Q 540 440 540 450 L 540 440' },
        { id: 6, path: 'M 670 440 L 780 440 Q 790 440 790 450 L 790 440' },

        // 垂直连接
        { id: 7, path: 'M 610 180 L 610 230 Q 610 240 610 250' },
        { id: 8, path: 'M 610 330 L 610 380 Q 610 390 610 400' },
        { id: 9, path: 'M 860 180 L 860 230 Q 860 240 860 250' },
        { id: 10, path: 'M 860 330 L 860 380 Q 860 390 860 400' },

        // 财务流程连接
        { id: 11, path: 'M 420 590 L 530 590 Q 540 590 540 600 L 540 590' }
      ]
    }
  }
}
</script>

<style scoped>
.system-flow-chart {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.module-rect {
  transition: all 0.3s ease;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));
}

.module-rect:hover {
  transform: translateY(-2px);
  filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.15));
}

.connection-line {
  transition: all 0.3s ease;
}

.connection-line:hover {
  stroke-width: 4;
  stroke: #2196F3;
}

svg {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}
</style>
