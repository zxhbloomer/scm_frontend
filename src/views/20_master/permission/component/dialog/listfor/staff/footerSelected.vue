<template>
  <div class="container">
    <div class="header">已排除权限:</div>
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
        暂未排除权限
      </span>
    </div>
  </div>
</template>

<script>
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  name: 'StaffFooterSelectedPermission',
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
    EventBus.$on(this.EMITS.EMIT_PERMISSION_DIALOG_SELECT, _data => {
      this.doUpdateListData(_data)
    })
  },
  beforeDestroy () {
    EventBus.$off(this.EMITS.EMIT_PERMISSION_DIALOG_SELECT)
  },
  methods: {
    doUpdateListData (_data) {
      this.dataJson.listData = []

      for (let i = 0; i < _data.length; i++) {
        const permission = _data[i]
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

    handleClose (itemIndex) {
      const removedPermission = this.dataJson.listData[itemIndex]
      this.dataJson.listData.splice(itemIndex, 1)

      this.$emit('emitRemovePermission', removedPermission)
    },

    updateSelectedData (selectedData) {
      this.dataJson.listData = JSON.parse(JSON.stringify(selectedData || []))
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
