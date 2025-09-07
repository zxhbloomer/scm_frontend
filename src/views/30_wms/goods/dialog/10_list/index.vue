<template>
  <!-- 物料选择对话框 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    title="物料选择页面"
    :visible="visible"
    :modal="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="1300px"
    destroy-on-close
    top="5vh"
  >
    <!-- 选择提示信息 -->
    <el-alert
      v-if="multiple"
      title="多选模式：可选择多条记录，点击确定按钮完成选择"
      type="info"
      :closable="false"
      style="margin-bottom: 10px;"
    />
    <el-alert
      v-else
      title="单选模式：双击行或点击确定按钮完成选择"
      type="info"
      :closable="false"
      style="margin-bottom: 10px;"
    />

    <!-- 嵌入主业务组件 -->
    <goods-list
      ref="goodsListRef"
      :me-dialog-status="true"
      :data-model="dataModel"
      @rowDbClick="handleRowDbClick"
    />

    <div
      slot="footer"
      class="dialog-footer"
    >
      <div class="selection-info">
        <span v-if="selectedItems.length > 0">
          已选择 {{ selectedItems.length }} 项
        </span>
        <span v-else class="no-selection">
          未选择任何项
        </span>
      </div>
      <el-divider />
      <el-button
        plain
        @click="handleCancel()"
      >取消</el-button>
      <el-button
        :disabled="settings.btnDisabledStatus.disabledOk"
        type="primary"
        @click="handleConfirm()"
      >确定</el-button>
    </div>
  </el-dialog>
</template>

<style scoped>
.dialog-footer {
  text-align: center;
  position: relative;
}
.selection-info {
  position: absolute;
  left: 20px;
  top: 10px;
  color: #606266;
  font-size: 14px;
}
.no-selection {
  color: #909399;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import GoodsList from '../../page/10_list/index.vue'

export default {
  name: 'GoodsSelectionDialog',
  components: { GoodsList },
  directives: { elDragDialog },
  props: {
    // 对话框显示状态
    visible: {
      type: Boolean,
      default: false
    },
    // 传递给子组件的数据
    data: {
      type: Object,
      default: null
    },
    // 选择模式：true=多选，false=单选
    multiple: {
      type: Boolean,
      default: false
    },
    // 数据模型标识
    dataModel: {
      type: String,
      default: 'selection'
    },
    // 预选数据
    preSelectedData: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      selectedItems: [],
      settings: {
        btnDisabledStatus: {
          disabledOk: true
        }
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    },
    // 监听Vuex存储的选中数据
    listenSelectedDataJson () {
      return this.$store.getters.selectedDataJson
    }
  },
  watch: {
    // 监听选中数据变化
    listenSelectedDataJson: {
      handler (newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          // 单选模式直接替换
          if (!this.multiple) {
            this.selectedItems = [newVal]
            this.settings.btnDisabledStatus.disabledOk = false
          } else {
            // 多选模式需要检查是否已存在
            const existingIndex = this.selectedItems.findIndex(item => item.id === newVal.id)
            if (existingIndex === -1) {
              this.selectedItems.push(newVal)
            }
            this.settings.btnDisabledStatus.disabledOk = this.selectedItems.length === 0
          }
        } else {
          // 清空选择时的处理
          if (!this.multiple) {
            this.selectedItems = []
            this.settings.btnDisabledStatus.disabledOk = true
          }
        }
      },
      deep: true,
      immediate: true
    },
    // 监听对话框打开
    listenVisible: {
      handler (newVal) {
        if (newVal) {
          this.init()
        }
      },
      immediate: true
    }
  },
  methods: {
    init () {
      // 清空Vuex中的选择数据
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)

      // 初始化预选数据
      if (this.preSelectedData && this.preSelectedData.length > 0) {
        this.selectedItems = [...this.preSelectedData]
        this.settings.btnDisabledStatus.disabledOk = false
      } else {
        this.selectedItems = []
        this.settings.btnDisabledStatus.disabledOk = true
      }

      // 初始化子组件
      this.$nextTick(() => {
        if (this.$refs.goodsListRef) {
          // 如果子组件有初始化方法，调用它
          if (this.$refs.goodsListRef.initShow) {
            this.$refs.goodsListRef.initShow()
          }
        }
      })
    },

    // 行双击处理
    handleRowDbClick (rowData) {
      if (this.multiple) {
        // 多选模式：双击切换选择状态
        this.toggleSelection(rowData)
      } else {
        // 单选模式：双击直接确认选择
        this.selectedItems = [rowData]
        this.handleConfirm()
      }
    },

    // 切换选择状态（多选模式）
    toggleSelection (rowData) {
      const existingIndex = this.selectedItems.findIndex(item => item.id === rowData.id)
      if (existingIndex === -1) {
        // 添加选择
        this.selectedItems.push(rowData)
      } else {
        // 移除选择
        this.selectedItems.splice(existingIndex, 1)
      }
      this.settings.btnDisabledStatus.disabledOk = this.selectedItems.length === 0
    },

    // 移除选中项
    removeSelectedItem (item) {
      const index = this.selectedItems.findIndex(selected => selected.id === item.id)
      if (index !== -1) {
        this.selectedItems.splice(index, 1)
        this.settings.btnDisabledStatus.disabledOk = this.selectedItems.length === 0
      }
    },

    // 确认选择
    handleConfirm () {
      if (this.selectedItems.length === 0) {
        this.showErrorMsg('请选择至少一项数据')
        return
      }

      const result = this.multiple ? this.selectedItems : this.selectedItems[0]
      this.$emit('closeMeOk', result)
    },

    // 取消选择
    handleCancel () {
      // 清空Vuex中的选择数据
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
      this.$emit('closeMeCancel')
    },

    // 清空所有选择
    clearSelection () {
      this.selectedItems = []
      this.settings.btnDisabledStatus.disabledOk = true
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
    },

    // 获取当前选择的数据
    getSelectedData () {
      return this.multiple ? this.selectedItems : (this.selectedItems[0] || null)
    }
  }
}
</script>
