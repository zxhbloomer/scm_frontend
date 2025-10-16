<template>
  <div class="container">
    <el-tag
      v-for="(item, key) in dataJson.listData"
      :key="key"
      closable
      :disable-transitions="false"
      @close="handleClose(key)"
    >
      {{ item.name }}
    </el-tag>
    <span
      v-if="!dataJson.listData || dataJson.listData.length === 0"
      class="noStaff"
    >
      暂未选择
    </span>
  </div>
</template>
<script>
import { EventBus } from '@/common/eventbus/eventbus'

export default {
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
    'dataJson.listData': {
      handler (newVal) {
        if (newVal.length > 0) {
          this.$emit('emitButtonDisabledStatus', true)
        } else {
          this.$emit('emitButtonDisabledStatus', false)
        }
      }
    },
    // 监听props数据变化
    'data': {
      handler (newVal) {
        if (newVal && Array.isArray(newVal) && newVal.length > 0) {
          this.dataJson.listData = [...newVal]
        }
      },
      immediate: true
    }
  },
  created () {
    if (this.data !== undefined && this.data !== null && Array.isArray(this.data) && this.data.length > 0) {
      this.dataJson.listData = [...this.data]
    }
  },
  mounted () {
    EventBus.$on(this.EMITS.EMIT_ORG_DIALOG_STAFF_SELECT, _data => {
      this.doUpdateListData(_data)
    })
  },
  methods: {
    doUpdateListData (_data) {
      this.dataJson.listData = []

      // 遍历数组_data, 如果listData中有相同的key, 则更新listData中的数据
      if (!_data || !Array.isArray(_data)) {
        return
      }

      for (let i = 0; i < _data.length; i++) {
        // 添加空值检查，防止访问null对象的属性
        if (!_data[i]) {
          continue
        }

        // 获取员工的唯一标识，支持多种字段格式
        const staffKey = _data[i].login_name || _data[i].code || _data[i].user_code || _data[i].user_id || _data[i].staff_id || _data[i].id || String(_data[i].staff_id) || String(_data[i].user_id) || String(_data[i].id)
        const staffName = _data[i].name || _data[i].user_name || _data[i].staff_name

        // 放宽验证条件：只要有任何一种标识就可以
        if (!staffKey) {
          continue
        }

        // 如果没有姓名，使用标识作为显示名称
        const displayName = staffName || staffKey || `员工${i + 1}`

        // 标准化数据结构
        const normalizedItem = {
          ...(_data[i]), // 保留原始数据
          login_name: staffKey, // 统一使用login_name作为标识
          name: displayName, // 统一使用name作为显示名称
          id: _data[i].id || _data[i].staff_id || _data[i].user_id
        }

        // 判断是否已存在（使用标准化后的login_name比较）
        const _index = this.dataJson.listData.findIndex(existingItem => {
          const existingKey = existingItem.login_name || existingItem.code || existingItem.user_id || existingItem.staff_id || existingItem.id
          return existingKey === staffKey
        })

        if (_index === -1) {
          // 不存在则添加标准化后的数据
          this.dataJson.listData.push(normalizedItem)
        }
      }
    },
    handleClose (key) {
      this.dataJson.listData.splice(key, 1)
      // 提交vuex
      EventBus.$emit(this.EMITS.EMIT_ORG_DIALOG_STAFF_SELECT, this.dataJson.listData)
    }
  }
}
</script>

<style scoped>
.container {
  height: 60px;
  border: 1px solid #cfcfcf;
  padding: 2px;
  overflow: auto;
}
.noStaff {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 10px;
}
.el-tag--mini {
  margin-bottom: 3px;
}
</style>
