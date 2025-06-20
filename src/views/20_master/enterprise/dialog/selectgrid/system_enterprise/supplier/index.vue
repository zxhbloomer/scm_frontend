<template>
  <div>
    <div v-show="settings.isOnlyOne">
      {{ dataJson.filterText }}
    </div>
    <div
      v-show="!settings.isOnlyOne"
      class="el-select"
      style="width: 100%"
    >
      <el-input
        ref="refSelectGrid"
        v-model.trim="dataJson.filterText"
        v-popover:popover
        :placeholder="placeholder"
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
      <el-popover
        ref="popover"
        v-model="settings.visible"
        :title="title"
        width="700"
        trigger="manual"
        popper-class="normal_popper"
        :placement="placement"
      >
        <el-container>
          <!-- <el-header>请选择仓库</el-header> -->
          <el-main class="el-main-class">
            <div style="overflow-y:auto;overflow-x:auto;">
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
                  min-width="130"
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
                  min-width="130"
                  prop="type_names"
                  label="企业类型"
                  align="left"
                />

              </el-table>
              <pagination
                ref="minusPaging"
                :total="dataJson.paging.total"
                :page.sync="dataJson.paging.current"
                :limit.sync="dataJson.paging.size"
                @pagination="getDataList"
              />
            </div>
          </el-main>
          <el-footer style="text-align:right">
            <el-divider />
            <el-button
              plain
              :disabled="settings.loading"
              @click="handlerCancel"
            >取消</el-button>
            <el-button
              plain
              :disabled="settings.loading || settings.btnDisabledStatus.disabledOk "
              type="primary"
              @click="handleOk()"
            >确定</el-button>
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
import { selectSystemEnterpriseSupplierGridDataApi } from '@/api/20_master/enterprise/enterprise'
import Pagination from '@/components/Pagination_for_dialog/index.vue'

export default {
  name: 'SelectEnterpriseGrid', // 页面id，和router中的name需要一致，作为缓存
  components: { Pagination },
  mixins: [],
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请选择供应商'
    },
    title: {
      type: String,
      default: ''
    },
    // // 重置
    // reset: {
    //   type: Boolean,
    //   default: false
    // },
    placement: {
      type: String,
      default: 'bottom'
    }
  },
  data () {
    return {
      dataJson: {
        // 查询使用的json
        searchForm: {
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          combine_search_condition: null,
          enable: true,
          id: null
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // 下拉树的对象
        element: null,
        node: null,
        // 下拉选项json
        selectOptions: [],
        filterText: null,
        filterTextCopy: null,
        dataList: [],
        // 单条数据 json
        currentJson: null,
        tempJson: {
        },
        tempJsonOriginal: null
      },
      settings: {
        // 清空状态
        clear_model: false,
        // 编辑模式
        edit_model: false,
        // 找到了唯一的数据
        isOnlyOne: false,
        isUpIcon: true,
        visible: false,
        para: this.CONSTANTS.DICT_ORG_SETTING_TYPE,
        filterPara: [],
        loading: true,
        // 按钮状态：是否可用
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
    showClose () {
      const hasValue = false
      return hasValue
    },
    iconClass () {
      return (this.settings.visible ? 'arrow-up is-reverse' : 'arrow-up')
    }
  },
  // 监听器
  watch: {
    'settings.edit_model': {
      handler () {
        if (!this.settings.edit_model) {
          this.dataJson.filterText = this.dataJson.filterTextCopy
        }
      }
    },
    'dataJson.filterText': {
      handler () {
        this.dataJson.searchForm.combine_search_condition = this.dataJson.filterText
        if (this.settings.visible && !this.settings.clear_model) {
          this.getDataList()
        }
      }
    },
    // 'reset': {
    //   handler () {
    //     this.dataJson.filterText = ''
    //   }
    // },
    'settings.visible': {
      handler () {
        if (this.settings.visible) {
          // 调用查询
          this.getDataList()
        }
      }
    }
  },
  created () {
    if (this.meDialogStatus) {
      this.dataJson.searchForm.enable = 1
    }
    // 页面初始化
    this.initCreated()
    // 点击其他不在的区域触发事件
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
    // 描绘完成
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
    },
    // 单击事件
    handleClick () {
      if (this.disabled) {
        return
      }
    },
    doDestroy () {
      this.$refs.popper && this.$refs.popper.doDestroy()
    },
    handleButtonSearch () {
      // 查询
      this.getDataList()
    },
    getDataList () {
      this.dataJson.searchForm.pageCondition.current = this.dataJson.paging.current
      this.dataJson.searchForm.pageCondition.size = this.dataJson.paging.size
      // 查询逻辑
      this.settings.loading = true
      this.settings.btnDisabledStatus.disabledOk = true
      selectSystemEnterpriseSupplierGridDataApi(this.dataJson.searchForm).then(response => {
        this.dataJson.dataList = response.data.records
        this.settings.loading = false
        this.dataJson.paging = response.data
      })
    },
    // 点击确定按钮
    handleOk () {
      this.dataJson.filterText = this.dataJson.currentJson.name
      this.dataJson.filterTextCopy = this.dataJson.currentJson.name
      this.$emit('onReturnData', this.dataJson.currentJson)
      this.settings.visible = false
      this.settings.edit_model = false
      // bin id
      this.dataJson.searchForm.id = this.dataJson.currentJson.id
    },
    // table选择框
    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
    },
    handleSortChange (column) {
      // 服务器端排序
      if (column.order === 'ascending') {
        this.dataJson.searchForm.pageCondition.sort = column.prop
      } else if (column.order === 'descending') {
        this.dataJson.searchForm.pageCondition.sort = '-' + column.prop
      }
      this.getDataList()
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
    },
    // 行双点击，仅在dialog中有效
    handleRowDbClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
      var _data = deepCopy(row)
      this.dataJson.currentJson = _data
      this.settings.visible = false
      this.handleOk()
    },
    // 行点击
    handleRowClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
      this.settings.btnDisabledStatus.disabledOk = false
    },
    // 获取行索引
    getRowIndex (row) {
      const _index = this.dataJson.dataList.lastIndexOf(row)
      return _index
    },
    // change事件
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
    // 清空操作
    handlerClear () {
      this.dataJson.filterText = ''
      this.dataJson.filterTextCopy = ''
      this.settings.clear_model = true
      this.$emit('onReturnData', null)
    },
    // 点击箭头
    handlerArrow () {
      this.settings.visible = !this.settings.visible
    },
    handlerCancel () {
      this.settings.visible = false
      this.dataJson.filterText = this.dataJson.filterTextCopy
    }
  }
}
</script>
