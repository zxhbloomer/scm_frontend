<template>
  <div class="workflow-runtime-list">
    <!-- 内容区域：运行历史列表 -->
    <main ref="mainContainer" class="runtime-scroll-container" :style="{ height: mainHeight }">
      <div ref="scrollContainer" class="runtime-scroll-inner" @scroll="handleScroll">
        <div v-if="!runtimeList.length" class="empty-state">
          <i class="el-icon-finished" />
          <p>暂无运行记录</p>
          <p class="hint">点击下方"运行"按钮开始执行工作流</p>
        </div>

        <div v-else class="runtime-list">
          <div v-for="runtime in runtimeList" :key="runtime.runtimeUuid" class="runtime-item">
            <!-- 用户输入消息 -->
            <div class="message-row user-message-row">
              <div class="message-wrapper user-message">
                <div class="message-header">
                  <div class="message-info">
                    <span class="message-time">{{ formatTime(runtime.cTime || runtime.CTime) }}</span>
                  </div>
                  <el-button
                    type="text"
                    size="small"
                    icon="el-icon-delete"
                    class="delete-btn"
                    @click="handleDelete(runtime.runtimeUuid)"
                  >
                    删除
                  </el-button>
                </div>
                <div class="message-content">
                  <div v-if="runtime.input && Object.keys(runtime.input).length" class="input-content">
                    <div v-for="(value, key) in runtime.input" :key="key" class="input-item">
                      <!-- ⭐ 判断是否为附件数组（支持新旧两种格式） -->
                      <template v-if="isAttachmentArray(value)">
                        <!-- 使用SCM标准附件展示组件，normalizeAttachments转换旧格式 -->
                        <PreviewDescription :attachment-files="normalizeAttachments(value)" />
                      </template>
                      <template v-else>
                        <!-- 普通文本展示 -->
                        <span class="input-value">{{ formatValue(value) }}</span>
                      </template>
                    </div>
                  </div>
                  <div v-else class="no-input">
                    <span>无输入</span>
                  </div>
                </div>
              </div>
              <div class="message-avatar">
                <el-avatar :size="36" icon="el-icon-user" />
              </div>
            </div>

            <!-- AI 输出消息 -->
            <div class="message-row ai-message-row">
              <div class="message-avatar">
                <el-avatar :size="36" class="ai-avatar">
                  <i class="el-icon-s-operation" />
                </el-avatar>
              </div>
              <div class="message-wrapper ai-message">
                <div class="message-header">
                  <div class="message-info">
                    <span class="message-label">工作流输出</span>
                    <el-tag :type="getStatusType(runtime.status)" size="mini">
                      {{ getStatusText(runtime.status) }}
                    </el-tag>
                  </div>
                  <el-button
                    v-if="!runtime.loading && runtime.status !== 1"
                    type="text"
                    size="small"
                    @click="showExecutionDetail(runtime)"
                  >
                    执行详情
                  </el-button>
                </div>
                <div class="message-content">
                  <!-- 失败状态 -->
                  <div v-if="runtime.status === 4" class="error-content">
                    <i class="el-icon-warning" />
                    <span>{{ runtime.status_remark || runtime.statusRemark || '工作流执行失败' }}</span>
                  </div>

                  <!-- 有输出内容（包括loading中的流式输出）：优先显示output -->
                  <div v-else-if="runtime.output && (typeof runtime.output === 'string' ? runtime.output.trim() !== '' : Object.keys(runtime.output).length > 0)" class="output-content">
                    <!-- loading时显示流式指示器在顶部 -->
                    <div v-if="runtime.loading" class="streaming-header">
                      <i class="el-icon-loading" />
                      <span>工作流执行中...</span>
                    </div>

                    <div class="output-text-wrapper">
                      <div v-if="typeof runtime.output === 'string'" class="output-text">
                        {{ runtime.output }}
                      </div>
                      <div v-else-if="typeof runtime.output === 'object'" class="output-object">
                        <div v-for="(value, key) in runtime.output" :key="key" class="output-item">
                          <span class="output-label">{{ key }}:</span>
                          <span class="output-value">{{ formatValue(value) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 运行中但还没有输出：loading=true 且 output为空 -->
                  <div v-else-if="runtime.loading" class="loading-content">
                    <i class="el-icon-loading" />
                    <span>工作流执行中...</span>
                  </div>

                  <!-- 其他状态：已完成但无输出 -->
                  <div v-else class="no-output">
                    <span>无输出</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载更多提示 -->
        <div v-if="loading" class="loading-more">
          <i class="el-icon-loading" />
          <span>加载中...</span>
        </div>
        <div v-if="loadedAll && runtimeList.length" class="loaded-all">
          <span>已加载全部记录</span>
        </div>
      </div>
    </main>

    <!-- 底部：运行工作流区域 -->
    <footer ref="footerContainer" class="runtime-footer">
      <workflow-run-detail
        ref="runDetailRef"
        :workflow="workflow"
        @run="handleRunWorkflow"
        @resume="handleResumeWorkflow"
      />
    </footer>

    <!-- 执行详情对话框 -->
    <el-dialog
      v-el-drag-dialog
      :visible.sync="detailDialogVisible"
      title="执行详情"
      :modal="true"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="true"
      :append-to-body="true"
      :modal-append-to-body="true"
      class="execution-detail-dialog"
      destroy-on-close
      top="5vh"
    >
      <div
        v-if="currentRuntimeDetail"
        class="execution-detail"
        :style="{ height: dialogContentHeight + 'px', overflowY: 'auto' }"
      >
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4>基本信息</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="执行状态">
              <el-tag :type="getStatusType(currentRuntimeDetail.status)" size="mini">
                {{ getStatusText(currentRuntimeDetail.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="执行时间">
              {{ getRuntimeTime(currentRuntimeDetail) }}
            </el-descriptions-item>
            <el-descriptions-item v-if="getElapsedMs(currentRuntimeDetail)" label="耗时">
              {{ getElapsedMs(currentRuntimeDetail) }}ms
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 节点执行详情 -->
        <div v-if="currentRuntimeDetail.nodes && currentRuntimeDetail.nodes.length" class="detail-section">
          <h4>节点执行详情</h4>

          <!-- 节点卡片列表 -->
          <div v-for="(node, index) in currentRuntimeDetail.nodes" :key="index" class="node-card">
            <!-- 节点标题 -->
            <div class="node-header">
              <span class="node-name">{{ getNodeDisplayName(node) }}</span>
              <el-tag :type="getNodeStatusType(getActualNodeStatus(node))" size="mini">
                {{ getNodeStatusText(getActualNodeStatus(node)) }}
              </el-tag>
            </div>

            <!-- 输入参数区 -->
            <div v-if="node.inputData && Object.keys(node.inputData).length > 0" class="node-section">
              <div class="section-title">
                输入
              </div>
              <div v-for="(value, key) in node.inputData" :key="`input_${key}`" class="param-item">
                <!-- ⭐ 特殊处理：附件类型使用SCM标准组件显示 -->
                <template v-if="isAttachmentArray(value)">
                  <div class="param-label">
                    {{ key }}:
                  </div>
                  <PreviewDescription :attachment-files="normalizeAttachments(value)" />
                </template>
                <!-- 常规参数 -->
                <template v-else>
                  <span class="param-label">{{ key }}:</span>
                  <span class="param-value">{{ formatValue(value) }}</span>
                </template>
              </div>
            </div>

            <!-- 输出参数区 -->
            <div v-if="node.outputData && Object.keys(node.outputData).length > 0" class="node-section">
              <div class="section-title">
                输出
              </div>
              <div v-for="(value, key) in node.outputData" :key="`output_${key}`" class="param-item">
                <!-- ⭐ 特殊处理：type=4显示附件（使用SCM标准组件） -->
                <template v-if="isAttachmentArray(value)">
                  <div class="param-label">
                    {{ key }}:
                  </div>
                  <PreviewDescription :attachment-files="normalizeAttachments(value)" />
                </template>
                <!-- 常规参数 -->
                <template v-else>
                  <span class="param-label">{{ key }}:</span>
                  <span class="param-value">{{ formatValue(value) }}</span>
                </template>
              </div>
            </div>

            <!-- 错误信息（如果有）-->
            <div v-if="node.statusRemark" class="node-error">
              <i class="el-icon-warning" />
              <span>{{ node.statusRemark }}</span>
            </div>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="currentRuntimeDetail.status === 4" class="detail-section">
          <h4>错误信息</h4>
          <el-alert
            :title="currentRuntimeDetail.status_remark || currentRuntimeDetail.statusRemark || '工作流执行失败'"
            type="error"
            :closable="false"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { workflowRun, workflowRuntimeSearch, workflowRuntimeDelete, getRuntimeNodeDetails, resumeWorkflowRun } from '@/components/70_ai/api/workflowService'
import WorkflowRunDetail from './WorkflowRunDetail.vue'
import PreviewDescription from '@/components/51_preview_description/index.vue'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'WorkflowRuntimeList',

  directives: { elDragDialog },

  components: {
    WorkflowRunDetail,
    PreviewDescription
  },

  props: {
    workflow: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      running: false,
      loading: false,
      loadedAll: false,
      currentPage: 1,
      pageSize: 20,
      detailDialogVisible: false,
      currentRuntimeDetail: null,
      mainHeight: 'auto',
      currentController: null, // 用于取消SSE连接
      scrollTimer: null, // 用于滚动防抖
      localRuntimeList: [] // 本地runtime列表，不使用Vuex
    }
  },

  computed: {
    // 明确表达"workflow 是否就绪可以加载数据"这个概念
    workflowReady () {
      return Boolean(this.workflow.id && this.workflow.workflowUuid)
    },

    runtimeList () {
      // 使用本地列表
      return this.localRuntimeList
    },

    canRun () {
      // 判断工作流是否可以运行
      if (!this.workflow.workflowUuid || !this.workflow.nodes || this.workflow.nodes.length < 2) {
        return false
      }

      const hasStart = this.workflow.nodes.some(n => n.wfComponent && n.wfComponent.name === 'Start')
      const hasEnd = this.workflow.nodes.some(n => n.wfComponent && n.wfComponent.name === 'End')

      return hasStart && hasEnd
    },

    // 执行详情弹窗内容高度 = 浏览器高度 - 100px
    dialogContentHeight () {
      return window.innerHeight - 200
    }
  },

  watch: {
    // 只需要一个 watch，监听 workflow 是否就绪
    workflowReady: {
      immediate: true,
      handler (isReady) {
        if (isReady) {
          this.loadRuntimeList()
        }
      }
    },

    // 监听运行时列表变化，自动滚动到底部
    runtimeList: {
      handler () {
        this.scrollToBottom()
      },
      deep: true
    }
  },

  mounted () {
    this.calculateMainHeight()
    // 监听窗口大小变化
    window.addEventListener('resize', this.calculateMainHeight)
  },

  updated () {
    this.$nextTick(() => {
      this.calculateMainHeight()
    })
  },

  beforeDestroy () {
    // 清理resize监听器
    window.removeEventListener('resize', this.calculateMainHeight)

    // 清理SSE连接
    if (this.currentController) {
      this.currentController.abort()
      this.currentController = null
    }

    // 清理滚动定时器
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer)
      this.scrollTimer = null
    }
  },

  methods: {

    async loadRuntimeList (loadMore = false) {
      // 防止重复加载（例如快速滚动）
      if (this.loading) {
        return
      }

      if (!loadMore) {
        this.currentPage = 1
        this.loadedAll = false
      }

      this.loading = true

      try {
        const response = await workflowRuntimeSearch({
          workflowId: this.workflow.id,
          currentPage: this.currentPage,
          pageSize: this.pageSize
        })

        const records = response.data.records || []

        // 转换并校验后端数据结构：将outputData/inputData展开为output/input
        const validRecords = []
        records.forEach(runtime => {
          // 【防御性校验】必须有runtimeUuid，否则跳过
          if (!runtime.runtimeUuid) {
            return
          }

          // 处理input: 从inputData提取到input
          if (runtime.inputData && typeof runtime.inputData === 'object') {
            runtime.input = {}
            for (const [key, value] of Object.entries(runtime.inputData)) {
              runtime.input[key] = value
            }
          } else {
            // 如果没有inputData，设置空对象
            runtime.input = runtime.input || {}
          }

          // 处理output: 从outputData.output.value提取到output
          if (runtime.outputData && typeof runtime.outputData === 'object') {
            if (runtime.outputData.output && runtime.outputData.output.value) {
              runtime.output = runtime.outputData.output.value
            } else {
              // 兼容其他格式
              runtime.output = runtime.outputData
            }
          } else {
            // 如果没有outputData，设置空字符串
            runtime.output = runtime.output || ''
          }

          // 【防御性校验】通过所有检查的记录才添加到列表
          validRecords.push(runtime)
        })

        // 【重要】后端返回的是倒序（最新在前），需要反转为正序（最老在前）
        const reversedRecords = validRecords.reverse()

        if (loadMore) {
          // 加载更多：追加到列表前面
          this.localRuntimeList = [...reversedRecords, ...this.localRuntimeList]
        } else {
          // 首次加载：直接设置
          this.localRuntimeList = reversedRecords
        }

        if (validRecords.length < this.pageSize) {
          this.loadedAll = true
        } else {
          this.currentPage++
        }
      } catch (error) {
        console.error('加载运行历史失败:', error)
        this.$message.error(error.message || '加载运行历史失败')
      } finally {
        this.loading = false
      }
    },

    handleScroll (event) {
      const { scrollTop, scrollHeight } = event.target

      // 滚动到顶部时加载更多
      if (scrollTop < 50 && !this.loading && !this.loadedAll) {
        const prevScrollHeight = scrollHeight
        this.loadRuntimeList(true).then(() => {
          this.$nextTick(() => {
            // 保持滚动位置
            event.target.scrollTop = event.target.scrollHeight - prevScrollHeight
          })
        })
      }
    },

    /**
     * 滚动到底部
     * 参考AI Chat的MessageList.vue和知识库Chat的RagChatDialog.vue
     */
    scrollToBottom () {
      // 清除之前的定时器
      if (this.scrollTimer) {
        clearTimeout(this.scrollTimer)
      }

      // 使用requestAnimationFrame确保DOM已更新
      this.scrollTimer = setTimeout(() => {
        this.$nextTick(() => {
          const scrollContainer = this.$refs.scrollContainer
          if (scrollContainer) {
            scrollContainer.scrollTo({
              top: scrollContainer.scrollHeight,
              behavior: 'smooth'
            })
          }
        })
      }, 50) // 50ms防抖
    },

    /**
     * 运行工作流
     * 参考aideepin: RunDetail.vue handleSubmit() (lines 122-202)
     * 对应后端: WorkflowController.run() 返回SSE流
     */
    handleRunWorkflow (inputs) {
      // 防止重复点击
      if (this.running || !this.canRun) {
        return
      }

      this.running = true

      // 构造输入数组（保持与后端List<JSONObject>格式一致）
      const inputList = inputs.map(item => ({
        name: item.name,
        content: item.content,
        required: item.required || false
      }))

      // 创建AbortController用于取消SSE连接
      const controller = new AbortController()
      this.currentController = controller

      // 用于累积工作流输出
      let accumulatedOutput = ''
      let currentRuntimeUuid = null
      let lastOutputData = null // ⭐ 保存最后一次NODE_OUTPUT的数据（用于兜底恢复）

      // 使用回调函数处理SSE事件流
      workflowRun({
        wfUuid: this.workflow.workflowUuid,
        inputs: inputList,
        signal: controller.signal,

        // [START]事件回调：工作流启动
        startCallback: (wfRuntimeJson) => {
          if (!wfRuntimeJson) {
            this.$message.error('启动失败')
            this.running = false
            return
          }

          // 解析runtime对象
          const runtime = JSON.parse(wfRuntimeJson)

          // 保存runtime UUID用于后续更新
          currentRuntimeUuid = runtime.runtimeUuid

          // ⭐ 将用户输入保存到runtime.input（用于聊天显示）
          runtime.input = {}
          inputs.forEach(item => {
            // ⭐ 如果是附件类型，保存完整附件对象数组；否则保存content
            if (item.attachments) {
              runtime.input[item.name] = item.attachments
            } else {
              runtime.input[item.name] = item.content
            }
          })

          // 初始化output为空字符串
          runtime.output = ''
          runtime.loading = true // 设置loading状态

          // 添加到本地列表（最新的在最后面，像微信聊天一样）
          this.localRuntimeList.push(runtime)

          // 成功提示
          this.$message.success('工作流已开始执行')

          // 滚动到底部（显示最新消息）
          this.$nextTick(() => {
            const container = this.$refs.scrollContainer
            if (container) {
              container.scrollTop = container.scrollHeight
            }
          })
        },

        // 节点事件回调：NODE_RUN_xxx, NODE_CHUNK_xxx, NODE_OUTPUT_xxx, NODE_WAIT_FEEDBACK_BY_xxx
        messageReceived: (chunk, eventName) => {
          // 处理人机交互提示事件（参考aideepin: RunDetail.vue lines 185-189）
          if (eventName && eventName.includes('[NODE_WAIT_FEEDBACK_BY_') && currentRuntimeUuid) {
            const tip = chunk || '请输入您的反馈'
            // 调用WorkflowRunDetail组件的setHumanFeedback方法
            if (this.$refs.runDetailRef) {
              this.$refs.runDetailRef.setHumanFeedback(currentRuntimeUuid, tip)
            }
            // 更新runtime状态为等待输入(status=2)
            const index = this.localRuntimeList.findIndex(r => r.runtimeUuid === currentRuntimeUuid)
            if (index !== -1) {
              const oldRuntime = this.localRuntimeList[index]
              const newRuntime = {
                ...oldRuntime,
                status: 2, // 2-等待输入 (后端WORKFLOW_PROCESS_STATUS_WAITING_INPUT)
                loading: false
              }
              this.localRuntimeList.splice(index, 1, newRuntime)
            }
          }

          // 处理NODE_CHUNK事件：累积LLM流式输出
          if (eventName && eventName.startsWith('[NODE_CHUNK_')) {
            // ⭐ 修复：检查chunk是否有效，避免拼接null/undefined导致显示"null"/"undefined"
            if (chunk !== null && chunk !== undefined) {
              accumulatedOutput += chunk

              // 🔧 完全参考RAG实现:使用splice替换对象（不使用$nextTick，避免批量合并）
              if (currentRuntimeUuid) {
                const index = this.localRuntimeList.findIndex(r => r.runtimeUuid === currentRuntimeUuid)
                if (index !== -1) {
                  const oldRuntime = this.localRuntimeList[index]
                  const newRuntime = { ...oldRuntime, output: accumulatedOutput }
                  this.localRuntimeList.splice(index, 1, newRuntime)
                }
              }
            }
          }

          // 处理NODE_OUTPUT事件：节点执行完成，提取最终输出
          if (eventName && eventName.startsWith('[NODE_OUTPUT_')) {
            if (chunk && currentRuntimeUuid) {
              try {
                const outputData = JSON.parse(chunk)
                lastOutputData = outputData // ⭐ 保存最后一次NODE_OUTPUT数据（用于doneCallback兜底恢复）
                const index = this.localRuntimeList.findIndex(r => r.runtimeUuid === currentRuntimeUuid)
                if (index !== -1) {
                  // 检查输出数据格式：{name:"output", content:{value:"xxx"}}
                  // ⭐ 关键修复：只处理name="output"的NODE_OUTPUT事件，忽略其他name（如var_files、attachments等）
                  if (outputData.name === 'output' && outputData.content && outputData.content.value !== undefined && outputData.content.value !== null) {
                    const nodeOutput = outputData.content.value

                    // ⭐ 修复：只有当nodeOutput不是字符串"null"且不为空时才处理
                    // 关键问题：某些节点可能输出字符串"null"，需要过滤掉并允许后续真正内容覆盖
                    if (nodeOutput !== 'null' && nodeOutput !== '') {
                      // 🔧 关键修复：如果已经累积了流式输出，保留累积内容；否则使用NODE_OUTPUT的完整内容
                      // 特别处理：如果accumulatedOutput是字符串"null"，也要覆盖它
                      if (accumulatedOutput.length === 0 || accumulatedOutput === 'null') {
                        accumulatedOutput = nodeOutput
                      }
                      const oldRuntime = this.localRuntimeList[index]
                      const newRuntime = { ...oldRuntime, output: accumulatedOutput }
                      this.localRuntimeList.splice(index, 1, newRuntime)
                    }
                  } else if (outputData.name && outputData.name !== 'output') {
                    // 忽略非output的NODE_OUTPUT事件（如var_files、attachments等）
                    console.log('[DEBUG] NODE_OUTPUT: name=' + outputData.name + '，非output输出，忽略')
                  } else if (outputData.name === 'output' && outputData.output !== undefined && outputData.output !== null) {
                    // 兼容旧格式：{name:"output", output: "xxx"}
                    // ⭐ 修复：只有当name="output"且output不是字符串"null"且不为空时才处理
                    if (outputData.output !== 'null' && outputData.output !== '') {
                      if (accumulatedOutput.length === 0 || accumulatedOutput === 'null') {
                        accumulatedOutput = outputData.output
                      }
                      const oldRuntime = this.localRuntimeList[index]
                      const newRuntime = { ...oldRuntime, output: accumulatedOutput }
                      this.localRuntimeList.splice(index, 1, newRuntime)
                    }
                  } else if (outputData.name && outputData.name !== 'output' && outputData.output !== undefined) {
                    // 忽略非output的NODE_OUTPUT事件（旧格式）
                    console.log('[DEBUG] NODE_OUTPUT: 旧格式，name=' + outputData.name + '，非output输出，忽略')
                  }
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        },

        // [DONE]事件回调：工作流执行完成
        doneCallback: (chunk) => {
          this.running = false
          this.currentController = null

          // 通知WorkflowRunDetail组件运行完成
          if (this.$refs.runDetailRef) {
            this.$refs.runDetailRef.runDone()
          }

          // 更新runtime状态为成功，保存最终输出（使用splice确保响应式）
          if (currentRuntimeUuid) {
            const index = this.localRuntimeList.findIndex(r => r.runtimeUuid === currentRuntimeUuid)
            if (index !== -1) {
              const oldRuntime = this.localRuntimeList[index]

              // ⭐ 增强的output处理逻辑：多重fallback确保output不为空
              let finalOutput = oldRuntime.output || accumulatedOutput

              // 🛡️ 兜底1：如果finalOutput仍然为空，尝试从lastOutputData恢复
              if (!finalOutput && lastOutputData) {
                if (lastOutputData.content && lastOutputData.content.value) {
                  finalOutput = lastOutputData.content.value
                } else if (lastOutputData.output) {
                  finalOutput = lastOutputData.output
                }
              }

              // 🛡️ 兜底2：如果仍然为空，设置为空字符串（避免null）
              if (finalOutput === null || finalOutput === undefined) {
                finalOutput = ''
              }

              const newRuntime = {
                ...oldRuntime,
                status: 3, // 3-成功 (后端WORKFLOW_PROCESS_STATUS_SUCCESS)
                loading: false,
                output: finalOutput // 使用增强后的output
              }
              this.localRuntimeList.splice(index, 1, newRuntime)
            }
          }

          this.$message.success('工作流执行完成')
        },

        // [ERROR]事件回调：工作流执行失败
        errorCallback: (error) => {
          this.running = false
          this.currentController = null

          console.error('运行工作流失败:', error)
          this.$message.error(error || '工作流执行失败')

          // 通知WorkflowRunDetail组件运行失败
          if (this.$refs.runDetailRef) {
            this.$refs.runDetailRef.runError()
          }
        }
      })
    },

    /**
     * 取消工作流执行
     */
    handleCancelRun () {
      if (this.currentController) {
        this.currentController.abort()
        this.currentController = null
        this.running = false
        this.$message.info('已取消工作流执行')
      }
    },

    handleDelete (runtimeUuid) {
      this.$confirm('确定要删除这条运行记录吗？输入与输出会一起删除。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await workflowRuntimeDelete(runtimeUuid)
          // 从本地列表删除
          this.localRuntimeList = this.localRuntimeList.filter(r => r.runtimeUuid !== runtimeUuid)
          this.$message.success('删除成功')
        } catch (error) {
          console.error('删除运行记录失败:', error)
          this.$message.error(error.message || '删除失败')
        }
      }).catch(() => {
        // 取消删除
      })
    },

    /**
     * 处理恢复工作流执行（响应WorkflowRunDetail的resume事件）
     * 参考aideepin: RunDetail.vue resume() (lines 220-235)
     */
    async handleResumeWorkflow (data) {
      const { runtimeUuid, feedbackContent } = data

      try {
        // 通过runtimeUuid查找runtime.id
        const runtime = this.localRuntimeList.find(r => r.runtimeUuid === runtimeUuid)
        if (!runtime) {
          this.$message.error('运行时实例不存在')
          return
        }

        await resumeWorkflowRun({
          runtimeId: runtime.id,
          userInput: feedbackContent
        })

        this.$message.success('工作流已恢复执行')

        // 更新状态为运行中
        const index = this.localRuntimeList.findIndex(r => r.runtimeUuid === runtimeUuid)
        if (index !== -1) {
          const oldRuntime = this.localRuntimeList[index]
          const newRuntime = {
            ...oldRuntime,
            status: 1, // 1-运行中 (后端WORKFLOW_PROCESS_STATUS_RUNNING)
            loading: true
          }
          this.localRuntimeList.splice(index, 1, newRuntime)
        }
      } catch (error) {
        console.error('恢复工作流失败:', error)
        this.$message.error(error.message || '恢复工作流失败')
        // 通知子组件恢复失败，让它重新显示人机交互UI
        if (this.$refs.runDetailRef) {
          this.$refs.runDetailRef.submitting = false
        }
      }
    },

    async showExecutionDetail (runtime) {
      this.currentRuntimeDetail = runtime
      this.detailDialogVisible = true

      if (!runtime.nodes || runtime.nodes.length === 0) {
        try {
          const response = await getRuntimeNodeDetails(runtime.id)

          if (response.success && response.data && response.data.length > 0) {
            runtime.nodes = response.data
            this.currentRuntimeDetail = { ...runtime, nodes: response.data }
          }
        } catch (error) {
          this.$message.error('加载节点详情失败')
        }
      }
    },

    formatTime (time) {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now - date

      if (diff < 60000) {
        return '刚刚'
      } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`
      } else {
        return date.toLocaleString('zh-CN')
      }
    },

    formatValue (value) {
      if (value === null || value === undefined) return ''
      // 处理工作流输入/输出的特殊格式：{type:1, value:"xxx", title:"xxx"}
      if (typeof value === 'object' && value.value !== undefined) {
        return this.formatValue(value.value) // 递归提取value字段
      }
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2)
      }
      return String(value)
    },

    // ⭐ 新增：判断是否为附件数组（支持新旧两种格式）
    isAttachmentArray (value) {
      // ⭐ 先提取嵌套的value字段（旧数据格式：{type:4, value:["url"], title:"附件"}）
      let actualValue = value
      if (typeof value === 'object' && !Array.isArray(value) && value.value !== undefined) {
        actualValue = value.value
      }

      if (!Array.isArray(actualValue) || actualValue.length === 0) {
        return false
      }

      // 新格式：[{fileName: "xx", url: "xx", timestamp: xxx}]
      if (actualValue[0].fileName !== undefined && actualValue[0].url !== undefined) {
        return true
      }

      // 旧格式：["http://...file1.pdf", "http://...file2.pdf"]
      if (typeof actualValue[0] === 'string' && actualValue[0].startsWith('http')) {
        return true
      }

      return false
    },

    // ⭐ 新增：将附件数组标准化为新格式（兼容旧格式）
    normalizeAttachments (value) {
      // ⭐ 先提取嵌套的value字段（旧数据格式：{type:4, value:["url"], title:"附件"}）
      let actualValue = value
      if (typeof value === 'object' && !Array.isArray(value) && value.value !== undefined) {
        actualValue = value.value
      }

      if (!Array.isArray(actualValue) || actualValue.length === 0) {
        return []
      }

      // 如果已经是新格式，直接返回
      if (actualValue[0].fileName !== undefined && actualValue[0].url !== undefined) {
        return actualValue
      }

      // 旧格式转换为新格式
      if (typeof actualValue[0] === 'string' && actualValue[0].startsWith('http')) {
        return actualValue.map(url => {
          // 从URL中提取文件名（最后一个/后面的部分）
          const fileName = url.substring(url.lastIndexOf('/') + 1)
          return {
            fileName: fileName,
            url: url,
            timestamp: null // 旧数据没有时间戳
          }
        })
      }

      return []
    },

    /**
     * 获取节点显示名称
     * 通过 nodeId 关联 workflow.nodes 获取节点标题
     */
    getNodeDisplayName (node) {
      if (!node || !node.nodeId) {
        return '未命名节点'
      }

      // 通过 nodeId 查找 workflow.nodes
      const workflowNode = this.workflow.nodes?.find(n => n.id === node.nodeId)

      if (workflowNode) {
        // 优先级：title > wfComponent.title > wfComponent.name
        return workflowNode.title ||
               workflowNode.wfComponent?.title ||
               workflowNode.wfComponent?.name ||
               '未命名节点'
      }

      return '未命名节点'
    },

    /**
     * 安全获取时间字段（兼容驼峰和下划线命名）
     */
    getTimeField (obj, fieldName) {
      if (!obj) return null
      // 尝试驼峰命名（首字母小写）
      const camelCase = fieldName
      // 尝试下划线命名
      const snakeCase = fieldName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      // 尝试首字母大写的版本（兼容后端返回 CTime 而不是 cTime）
      const pascalCase = fieldName.charAt(0).toUpperCase() + fieldName.slice(1)

      return obj[camelCase] || obj[snakeCase] || obj[pascalCase] || null
    },

    /**
     * 格式化运行时对象的时间显示
     */
    getRuntimeTime (runtime) {
      const time = this.getTimeField(runtime, 'cTime') ||
                   this.getTimeField(runtime, 'createTime')
      return this.formatTime(time)
    },

    /**
     * 获取耗时毫秒数
     */
    getElapsedMs (runtime) {
      return this.getTimeField(runtime, 'elapsedMs') ||
             this.getTimeField(runtime, 'elapsed_ms') ||
             null
    },

    getStatusType (status) {
      // 对齐后端WorkflowConstants状态定义
      const typeMap = {
        0: 'info', // READY-就绪
        1: 'info', // RUNNING-运行中
        2: 'warning', // WAITING_INPUT-等待输入
        3: 'success', // SUCCESS-成功
        4: 'danger' // FAIL-失败
      }
      return typeMap[status] || 'info'
    },

    getStatusText (status) {
      // 对齐后端WorkflowConstants状态定义
      const textMap = {
        0: '就绪',
        1: '运行中',
        2: '等待输入',
        3: '成功',
        4: '失败'
      }
      return textMap[status] || '未知'
    },

    /**
     * 获取节点状态类型（用于标签颜色）
     * 节点状态定义：1-等待中, 2-运行中, 3-成功, 4-失败
     */
    getNodeStatusType (status) {
      const typeMap = {
        1: 'info', // 等待中 - 灰色
        2: 'primary', // 运行中 - 蓝色
        3: 'success', // 成功 - 绿色
        4: 'danger' // 失败 - 红色
      }
      return typeMap[status] || 'info'
    },

    /**
     * 获取节点状态文本
     * 节点状态定义：1-等待中, 2-运行中, 3-成功, 4-失败
     */
    getNodeStatusText (status) {
      const textMap = {
        1: '等待中',
        2: '运行中',
        3: '成功',
        4: '失败'
      }
      return textMap[status] || '未知'
    },

    /**
     * 获取节点实际显示状态
     * 兼容后端未更新节点最终状态的情况
     * 如果 runtime 整体已成功，但节点还是运行中状态，则推断为成功
     */
    getActualNodeStatus (node) {
      // 如果 runtime 整体已成功，但节点还是运行中状态（后端未更新），则显示为成功
      if (this.currentRuntimeDetail &&
          this.currentRuntimeDetail.status === 3 &&
          node.status === 2) {
        return 3 // 返回成功状态
      }
      return node.status
    },

    getNodeStatusIcon (status) {
      const iconMap = {
        1: 'el-icon-loading',
        2: 'el-icon-check',
        3: 'el-icon-warning',
        4: 'el-icon-close'
      }
      return iconMap[status] || 'el-icon-info'
    },

    /**
     * 动态计算main区域的高度
     * 公式：main高度 = 100% - footer高度
     */
    calculateMainHeight () {
      this.$nextTick(() => {
        const footerEl = this.$refs.footerContainer
        if (footerEl) {
          const footerHeight = footerEl.offsetHeight
          const totalFixedHeight = footerHeight + 100
          this.mainHeight = `calc(100% - ${totalFixedHeight}px)`
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.workflow-runtime-list {
  height: 100%;
  position: relative;
}

/* main: 动态计算高度 */
.runtime-scroll-container {
  overflow: hidden;
  background-color: #f5f7fa;
}

/* 内部真正滚动的容器 */
.runtime-scroll-inner {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;

  i {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.6;
  }

  p {
    font-size: 16px;
    margin: 8px 0;
  }

  .hint {
    font-size: 14px;
    color: #c0c4cc;
  }
}

.runtime-list {
  max-width: 100%;
  margin: 0 auto;
  width: 100%;
  padding: 0 20px;
}

.runtime-item {
  margin-bottom: 32px;
  width: 100%;
}

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 16px;

  &.user-message-row {
    flex-direction: row;
    justify-content: flex-end;
  }

  &.ai-message-row {
    flex-direction: row;
    justify-content: flex-start;
  }
}

.message-avatar {
  flex-shrink: 0;

  ::v-deep .el-avatar {
    background-color: #409eff;

    &.ai-avatar {
      background-color: #67c23a;
    }
  }
}

.message-wrapper {
  padding: 12px 16px;
  border-radius: 8px;
  max-width: 85%;
  word-wrap: break-word;
  line-height: 1.5;
  transition: all 0.3s ease;

  &.user-message {
    background: linear-gradient(to right, #5fa3f5, #4a9ff5);
    color: white;

    .message-label,
    .message-time,
    .input-label,
    .input-value {
      color: white;
    }

    .message-header {
      border-bottom-color: rgba(255, 255, 255, 0.2);
    }

    .delete-btn {
      color: white;
      &:hover {
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .no-input {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  &.ai-message {
    background-color: #ffffff;
    color: #303133;
    border: 1px solid #e4e7ed;
  }
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.message-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .message-label {
    font-weight: 500;
  }

  .message-time {
    font-size: 12px;
    color: #909399;
  }
}

.delete-btn {
  color: #f56c6c;

  &:hover {
    color: #f78989;
  }
}

.message-content {
  line-height: 1.6;
  color: #606266;
}

.input-content,
.output-object {
  .input-item,
  .output-item {
    margin-bottom: 8px;

    .input-label,
    .output-label {
      font-weight: 500;
      margin-right: 8px;
      color: #606266;
    }

    .input-value,
    .output-value {
      color: #303133;
      word-break: break-all;
    }
  }
}

.no-input,
.no-output {
  color: #c0c4cc;
  font-style: italic;
}

.loading-content,
.loading-placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;

  i {
    font-size: 16px;
  }
}

.streaming-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  margin-bottom: 12px;
  padding: 8px;
  background-color: #ecf5ff;
  border-radius: 4px;

  i {
    font-size: 16px;
    animation: rotating 1s linear infinite;
  }

  span {
    font-size: 14px;
    font-weight: 500;
  }
}

.output-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.streaming-indicator {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  color: #409eff;

  i {
    font-size: 14px;
    animation: rotating 1s linear infinite;
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.error-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f56c6c;

  i {
    font-size: 16px;
  }
}

.loading-more,
.loaded-all {
  text-align: center;
  padding: 16px;
  color: #909399;
  font-size: 14px;
}

.loading-more i {
  margin-right: 8px;
}

.runtime-footer {
  border-top: 1px solid #e4e7ed;
  background-color: #fff;
  padding: 16px;
}

.execution-detail {
  .detail-section {
    margin-bottom: 24px;

    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .node-card {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
    background-color: #fff;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .node-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background-color: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 12px;

    .node-name {
      font-weight: 500;
      color: #303133;
      font-size: 14px;
    }
  }

  .node-section {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 14px;
      font-weight: 500;
      color: #606266;
      padding-bottom: 8px;
      margin-bottom: 8px;
      border-bottom: 1px solid #ebeef5;
    }
  }

  .param-item {
    display: flex;
    margin-bottom: 8px;
    font-size: 13px;
    line-height: 1.6;

    &:last-child {
      margin-bottom: 0;
    }

    .param-label {
      min-width: 100px;
      font-weight: 500;
      color: #606266;
      flex-shrink: 0;
    }

    .param-value {
      color: #303133;
      word-break: break-word;
      white-space: pre-wrap;
      flex: 1;
    }
  }

  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
  }

  .node-error {
    margin-top: 12px;
    padding: 8px 12px;
    background-color: #fef0f0;
    border-radius: 4px;
    color: #f56c6c;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;

    i {
      font-size: 16px;
      flex-shrink: 0;
    }
  }
}
</style>
