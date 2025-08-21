<template>
  <div class="container">
    <div class="header">已选权限:</div>
    <div class="content">
      <el-tag
        v-for="(item, key) in dataJson.listData"
        :key="key"
        type="primary"
        closable
        :disable-transitions="false"
        @close="handleClose(key)"
      >
        {{ item.name }}
      </el-tag>
      <span
        v-if="!dataJson.listData || dataJson.listData.length === 0"
        class="noPermission"
      >
        暂未选择权限
      </span>
    </div>
  </div>
</template>

<script>
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  name: 'FooterSelectedPermission',
  props: {
    data: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      dataJson: {
        listData: []
      }
    }
  },
  watch: {
    // 监听props.data变化，实时更新已选权限显示
    data: {
      handler (newVal) {
        if (newVal && Array.isArray(newVal)) {
          this.dataJson.listData = JSON.parse(JSON.stringify(newVal))
        }
      },
      deep: true,
      immediate: true
    },
    'dataJson.listData': {
      handler (newVal) {
        if (newVal.length > 0) {
          this.$emit('emitButtonDisabledStatus', true)
        } else {
          this.$emit('emitButtonDisabledStatus', false)
        }
      }
    }
  },
  created () {
    if (this.data !== undefined && this.data !== null) {
      this.dataJson.listData = JSON.parse(JSON.stringify(this.data))
    }
  },
  mounted () {
    // 监听权限选择事件
    EventBus.$on(this.EMITS.EMIT_PERMISSION_DIALOG_SELECT, _data => {
      this.doUpdateListData(_data)
    })
  },
  beforeDestroy () {
    // 清理EventBus监听
    EventBus.$off(this.EMITS.EMIT_PERMISSION_DIALOG_SELECT)
  },
  methods: {
    doUpdateListData (_data) {
      // 重置列表数据为当前选择的数据
      this.dataJson.listData = []

      // 遍历数组_data, 添加到listData中
      for (let i = 0; i < _data.length; i++) {
        const permission = _data[i]
        // 检查是否已存在，避免重复
        const existingIndex = this.dataJson.listData.findIndex(item => item.id === permission.id)
        if (existingIndex === -1) {
          this.dataJson.listData.push({
            id: permission.id,
            name: permission.name,
            descr: permission.descr,
            u_name: permission.u_name,
            u_time: permission.u_time
          })
        }
      }
    },

    handleClose (key) {
      // 删除指定索引的权限
      const removedItem = this.dataJson.listData[key]
      this.dataJson.listData.splice(key, 1)

      // 通知父组件更新表格选择状态
      this.$emit('emitRemovePermission', removedItem)

      // 通过EventBus通知列表组件取消选择
      EventBus.$emit(this.EMITS.EMIT_PERMISSION_DIALOG_SELECT, this.dataJson.listData)
    },

    // 获取已选权限数据
    getSelectedData () {
      return this.dataJson.listData
    },

    // 清空已选权限
    clearSelected () {
      this.dataJson.listData = []
    }
  }
}
</script>

<style scoped>
.container {
  border: 1px solid #cfcfcf;
  padding: 8px;
  overflow: auto;
  background-color: #fafafa;
  border-radius: 4px;
}

.header {
  font-size: 14px;
  font-weight: bold;
  color: #606266;
  margin-bottom: 8px;
}

.content {
  min-height: 40px;
}

.noPermission {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  color: #909399;
  font-size: 14px;
}

.el-tag {
  margin: 2px 4px 2px 0;
}

.el-tag--primary {
  background-color: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
}

.el-tag--primary .el-tag__close {
  color: #409eff;
}

.el-tag--primary .el-tag__close:hover {
  color: #fff;
  background-color: #409eff;
}
</style>
