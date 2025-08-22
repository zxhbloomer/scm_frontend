<template>
  <div class="container">
    <div class="header">已选角色:</div>
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
        class="noRole"
      >
        暂未选择角色
      </span>
    </div>
  </div>
</template>

<script>
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  name: 'FooterSelectedRole',
  props: {
    data: {
      type: Array,
      default: () => {
        return []
      }
    },
    multiple: {
      type: Boolean,
      default: false
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
    // 监听props.data变化，实时更新已选角色显示
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
    // 监听角色选择事件
    EventBus.$on(this.EMITS.EMIT_ROLE_DIALOG_SELECT, _data => {
      this.doUpdateListData(_data)
    })
  },
  beforeDestroy () {
    // 清理EventBus监听
    EventBus.$off(this.EMITS.EMIT_ROLE_DIALOG_SELECT)
  },
  methods: {
    doUpdateListData (_data) {
      // 重置列表数据为当前选择的数据
      this.dataJson.listData = []

      // 遍历数组_data, 添加到listData中
      for (let i = 0; i < _data.length; i++) {
        const role = _data[i]
        // 检查是否已存在，避免重复
        const existingIndex = this.dataJson.listData.findIndex(item => item.id === role.id)
        if (existingIndex === -1) {
          this.dataJson.listData.push({
            id: role.id,
            code: role.code,
            name: role.name,
            descr: role.descr,
            permissionList: role.permissionList,
            u_name: role.u_name,
            u_time: role.u_time
          })
        }
      }
    },

    handleClose (key) {
      // 删除指定索引的角色
      const removedItem = this.dataJson.listData[key]
      this.dataJson.listData.splice(key, 1)

      // 通知父组件更新表格选择状态
      this.$emit('emitRemoveRole', removedItem)

      // 通过EventBus通知列表组件取消选择
      EventBus.$emit(this.EMITS.EMIT_ROLE_DIALOG_SELECT, this.dataJson.listData)
    },

    // 获取已选角色数据
    getSelectedData () {
      return this.dataJson.listData
    },

    // 清空已选角色
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

.noRole {
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
