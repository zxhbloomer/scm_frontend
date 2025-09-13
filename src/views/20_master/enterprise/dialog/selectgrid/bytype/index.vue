<template>
  <div>
    <!-- 只读显示模式 -->
    <div v-show="settings.isOnlyOne">
      {{ dataJson.filterText }}
    </div>

    <!-- 选择模式 -->
    <div
      v-show="!settings.isOnlyOne"
      class="el-select"
      style="width: 100%"
    >
      <!-- 输入框触发器 -->
      <el-input
        ref="refSelectGrid"
        v-model.trim="dataJson.filterText"
        v-popover:popover
        placeholder="请输入"
        style="cursor:pointer"
        :disabled="settings.isOnlyOne || disabled"
        clearable
        @input="handlerInput"
        @dblclick.native="handleDbClick"
        @clear="handlerClear"
      >
        <template slot="suffix">
          <i
            :class="['el-select__caret', 'el-input__icon', 'el-icon-' + iconClass]"
            @click="handlerArrow()"
          />
        </template>
      </el-input>

      <!-- 弹出选择框 -->
      <el-popover
        ref="popover"
        v-model="settings.visible"
        width="750"
        trigger="manual"
        popper-class="normal_popper"
        :placement="placement"
      >
        <el-container>
          <el-main class="el-main-class">
            <div style="overflow-y:auto;overflow-x:auto;">
              <!-- 企业列表表格 -->
              <el-table
                ref="multipleTable"
                v-loading="settings.loading"
                :data="dataJson.dataList"
                :element-loading-text="'正在拼命加载中...'"
                element-loading-background="rgba(255, 255, 255, 0.5)"
                height="350px"
                stripe
                border
                fit
                highlight-current-row
                :default-sort="{prop: 'name', order: 'ascending'}"
                style="width: 100%"
                @row-click="handleRowClick"
                @row-dblclick="handleRowDbClick"
                @current-change="handleCurrentChange"
                @sort-change="handleSortChange"
                @selection-change="handleSelectionChange"
              >
                <!-- 表格列定义 -->
                <el-table-column
                  type="index"
                  width="45"
                  label="No"
                />
                <el-table-column
                  sortable="custom"
                  :sort-orders="settings.sortOrders"
                  :auto-fit="true"
                  min-width="130"
                  prop="uscc"
                  label="信用代码"
                  align="left"
                />
                <el-table-column
                  sortable="custom"
                  :sort-orders="settings.sortOrders"
                  :auto-fit="true"
                  min-width="150"
                  prop="name"
                  label="企业名称"
                  align="left"
                />
                <el-table-column
                  sortable="custom"
                  :sort-orders="settings.sortOrders"
                  :auto-fit="true"
                  min-width="100"
                  prop="legal_person"
                  label="法人"
                  align="left"
                />
                <el-table-column
                  sortable="custom"
                  :sort-orders="settings.sortOrders"
                  :auto-fit="true"
                  min-width="120"
                  prop="type_names"
                  label="企业类型"
                  align="left"
                />
              </el-table>

              <!-- 分页组件 -->
              <pagination
                ref="minusPaging"
                :total="dataJson.paging.total"
                :page.sync="dataJson.paging.current"
                :limit.sync="dataJson.paging.size"
                @pagination="getDataList"
              />
            </div>
          </el-main>

          <!-- 操作按钮 -->
          <el-footer style="text-align:right">
            <el-divider />
            <el-button
              plain
              :disabled="settings.loading"
              @click="handlerCancel"
            >
              取消
            </el-button>
            <el-button
              plain
              :disabled="settings.loading || settings.btnDisabledStatus.disabledOk"
              type="primary"
              @click="handleOk()"
            >
              确定
            </el-button>
          </el-footer>
        </el-container>
      </el-popover>
    </div>
  </div>
</template>

<style scoped>
.el-header {
  padding: 10px 10px 10px 10px;
  background: #115aa5;
  color: #fff;
  height: 100% !important;
}

.filterInput {
  margin-bottom: 10px;
}

.el-main-class {
  padding: 10px;
}
</style>

<script>
import deepCopy from 'deep-copy'
import { getListApi } from '@/api/20_master/enterprise/enterprise'
import Pagination from '@/components/Pagination_for_dialog/index.vue'

export default {
  name: 'SelectEnterpriseByType',
  components: { Pagination },
  props: {
    // 基础UI参数
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    placement: {
      type: String,
      default: 'bottom'
    },

    // 核心业务参数
    enterpriseTypes: {
      type: Array,
      required: true,
      default: () => ['2']
    }

  },
  data () {
    return {
      dataJson: {
        // 查询条件
        searchForm: {
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          combine_search_condition: null,
          enable: true,
          id: null,
          // 企业类型过滤（核心参数）
          type_ids: [...this.enterpriseTypes]
        },
        // 分页数据
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // 输入框数据
        filterText: null,
        filterTextCopy: null,
        // 表格数据
        dataList: [],
        // 当前选中数据
        currentJson: null,
        tempJson: {},
        tempJsonOriginal: null
      },
      settings: {
        // 状态控制
        clear_model: false,
        edit_model: false,
        isOnlyOne: false,
        isUpIcon: true,
        visible: false,
        loading: true,
        // 表格排序
        sortOrders: ['ascending', 'descending'],
        // 按钮状态
        btnDisabledStatus: {
          disabledOk: true
        },
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      }
    }
  },
  computed: {
    // 图标类名
    iconClass () {
      return this.settings.visible ? 'arrow-up is-reverse' : 'arrow-up'
    }
  },
  watch: {
    // 监听企业类型变化
    enterpriseTypes: {
      handler (newTypes) {
        this.dataJson.searchForm.type_ids = [...newTypes]
        if (this.settings.visible) {
          this.getDataList()
        }
      },
      deep: true
    },

    // 监听编辑模式变化
    'settings.edit_model': {
      handler () {
        if (!this.settings.edit_model) {
          this.dataJson.filterText = this.dataJson.filterTextCopy
        }
      }
    },

    // 监听过滤文本变化
    'dataJson.filterText': {
      handler () {
        this.dataJson.searchForm.combine_search_condition = this.dataJson.filterText
        if (this.settings.visible && !this.settings.clear_model) {
          this.getDataList()
        }
      }
    },

    // 监听弹窗显示状态
    'settings.visible': {
      handler () {
        if (this.settings.visible) {
          this.getDataList()
        }
      }
    }
  },
  created () {
    // 初始化
    this.initCreated()

    // 点击外部区域关闭弹窗
    document.addEventListener('click', (e) => {
      if (this.settings.visible !== false) {
        if (!this.$el.contains(e.target)) {
          this.settings.visible = false
          this.settings.edit_model = false
        }
      }
    })
  },
  mounted () {
    // 设置输入框样式
    const originalClass = this.$refs['refSelectGrid'].$el.children[0].className
    const newClass = originalClass + ' , pointer_cursor '
    this.$refs['refSelectGrid'].$el.children[0].className = newClass
  },
  methods: {
    // 页面初始化
    initCreated () {
      this.$data.dataJson = deepCopy(this.$options.data.call(this).dataJson)
      this.settings.btnDisabledStatus.disabledOk = true
      this.settings.clear_model = false

      // 设置企业类型
      this.dataJson.searchForm.type_ids = [...this.enterpriseTypes]
    },

    // 查询数据列表
    async getDataList () {
      try {
        // 设置查询参数
        this.dataJson.searchForm.pageCondition.current = this.dataJson.paging.current
        this.dataJson.searchForm.pageCondition.size = this.dataJson.paging.size

        // 查询参数
        const searchParams = { ...this.dataJson.searchForm }

        // 设置企业类型
        searchParams.type_ids = [...this.enterpriseTypes]
        searchParams.is_sys_company = false

        // 开始加载
        this.settings.loading = true
        this.settings.btnDisabledStatus.disabledOk = true

        // 调用API
        const response = await getListApi(searchParams)

        // 处理返回数据
        this.dataJson.dataList = response.data.records || response.data || []
        this.dataJson.paging = response.data || this.dataJson.paging
      } catch (error) {
        let errorMessage = '查询企业数据失败'

        if (error.response) {
          const status = error.response.status
          if (status === 400) {
            errorMessage = '查询参数错误，请检查企业类型设置'
          } else if (status === 401 || status === 403) {
            errorMessage = '权限不足，无法查询企业数据'
          } else if (status === 500) {
            errorMessage = '服务器内部错误，请稍后重试'
          }
        } else if (error.request) {
          errorMessage = '网络连接失败，请检查网络连接'
        }

        console.error('查询企业数据失败:', error)
        this.$message.error(errorMessage)
      } finally {
        this.settings.loading = false
      }
    },

    // 确定选择
    handleOk () {
      if (!this.dataJson.currentJson) {
        this.$message.warning('请选择一个企业')
        return
      }

      this.dataJson.filterText = this.dataJson.currentJson.name
      this.dataJson.filterTextCopy = this.dataJson.currentJson.name

      // 发送选中数据，包含类型信息
      this.$emit('onReturnData', {
        ...this.dataJson.currentJson,
        selectedTypes: this.enterpriseTypes
      })

      this.settings.visible = false
      this.settings.edit_model = false
      this.dataJson.searchForm.id = this.dataJson.currentJson.id
    },

    // 取消选择
    handlerCancel () {
      this.settings.visible = false
      this.dataJson.filterText = this.dataJson.filterTextCopy
      this.settings.edit_model = false
      this.$emit('onReturnData', null)
    },

    // 清空选择
    handlerClear () {
      this.dataJson.filterText = ''
      this.dataJson.filterTextCopy = ''
      this.settings.clear_model = true
      this.$emit('onReturnData', null)
    },

    // 输入事件
    handlerInput (v) {
      if (!this.settings.isOnlyOne) {
        this.settings.visible = true
        this.settings.edit_model = true
      }
      this.settings.clear_model = false
    },

    // 双击事件
    handleDbClick () {
      if (!this.settings.isOnlyOne) {
        this.settings.visible = true
        this.settings.edit_model = true
      }
    },

    // 点击箭头
    handlerArrow () {
      this.settings.visible = !this.settings.visible
    },

    // 表格行点击
    handleRowClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
      this.settings.btnDisabledStatus.disabledOk = false
    },

    // 表格行双击
    handleRowDbClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
      const _data = deepCopy(row)
      this.dataJson.currentJson = _data
      this.settings.visible = false
      this.handleOk()
    },

    // 当前行变化
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row)
      this.dataJson.currentJson.index = this.getRowIndex(row)
    },

    // 表格选择变化
    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
    },

    // 表格排序变化
    handleSortChange (column) {
      if (column.order === 'ascending') {
        this.dataJson.searchForm.pageCondition.sort = column.prop
      } else if (column.order === 'descending') {
        this.dataJson.searchForm.pageCondition.sort = '-' + column.prop
      }
      this.getDataList()
    },

    // 获取行索引
    getRowIndex (row) {
      return this.dataJson.dataList.lastIndexOf(row)
    },

    // 单击事件（保留接口）
    handleClick () {
      if (this.disabled) {
        return
      }
    },

    // 搜索按钮事件（保留接口）
    handleButtonSearch () {
      this.getDataList()
    },

    // 销毁事件（保留接口）
    doDestroy () {
      this.$refs.popper && this.$refs.popper.doDestroy()
    }
  }
}
</script>
