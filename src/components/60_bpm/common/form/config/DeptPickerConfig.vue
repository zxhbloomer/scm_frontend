<template>
  <div>
    <el-form-item label="提示文字">
      <el-input v-model="value.placeholder" size="small" placeholder="请设置提示语" />
    </el-form-item>
    <el-form-item label="是否多选">
      <el-switch v-model="value.multiple" />
    </el-form-item>
    <el-form-item label="备选模式">
      <el-switch v-model="value.expansion" />
    </el-form-item>
    <el-form-item v-if="value.expansion" label="选项">
      <el-button size="mini" type="primary" icon="el-icon-plus" round @click="$refs.orgPicker.show()">添加</el-button>
      <org-items v-model="value.options" />
    </el-form-item>
    <org-picker ref="orgPicker" title="请选择部门备选项" multiple type="dept" :selected="value.options" @ok="selected" />
  </div>
</template>

<script>
import OrgItems from '@/components/60_bpm/common/process/OrgItems'
import OrgPicker from '@/components/60_bpm/common/OrgPicker'
export default {
  name: 'DeptPickerConfig',
  components: { OrgItems, OrgPicker },
  props: {
    value: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {}
  },
  methods: {
    selected (select) {
      this.value.options.length = 0
      select.forEach(val => this.value.options.push(val))
    }
  }
}
</script>

<style scoped>

</style>
