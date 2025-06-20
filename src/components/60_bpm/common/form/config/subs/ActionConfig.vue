<template>
  <div class="w-rule-actions">
    <el-button class="w-rule-actions-add" icon="el-icon-plus" type="text" @click="addAction">{{ addText }}</el-button>
    <div v-for="(action, i) in value" :key="'action' + i" class="w-rule-action">
      <i class="el-icon-delete icon" @click="value.splice(i, 1)" />
      <el-select v-model="action.type" style="width: 150px; margin-right: 10px" size="small" placeholder="选择动作类型" @change="action.targets.length = 0">
        <el-option value="SHOW" label="显示表单字段" />
        <el-option value="HIDE" label="隐藏表单字段" />
        <el-option value="ENABLE" label="允许编辑字段" />
        <el-option value="DISABLE" label="禁止编辑字段" />
        <el-option value="UPDATE" label="设置字段值" />
      </el-select>
      <template v-if="action.type !== 'UPDATE'">
        <el-select v-model="action.targets" style="width: calc(100% - 180px);" multiple size="small" placeholder="选择表单字段">
          <el-option v-for="item in options" :key="item.id" :value="item.id" :label="item.title" />
        </el-select>
      </template>
      <template v-else>
        <el-select
          v-model="action.targets[0]"
          style="width: calc(100% - 180px); margin: 5px"
          size="small"
          placeholder="选择表单字段"
          @change="action.value = null"
        >
          <el-option v-for="item in options" :key="item.id" :value="item.id" :label="item.title" />
        </el-select>
        <form-design-render v-if="action.targets.length > 0" v-model="action.value" mode="PC" :config="formItemMap.get(action.targets[0])" />
      </template>
    </div>
  </div>
</template>

<script>
import FormDesignRender from '@/components/60_bpm/admin/layout/form/FormDesignRender'
export default {
  name: 'ActionConfig',
  components: { FormDesignRender },
  props: {
    value: {
      type: Array,
      default: () => {
        return []
      }
    },
    options: {
      type: Array,
      default: () => {
        return []
      }
    },
    addText: String
  },
  data () {
    return {

    }
  },
  computed: {
    formItemMap () {
      return this.$store.getters.formItemMap
    }
  },
  methods: {
    addAction () {
      this.value.push({
        targets: [],
        type: null,
        value: null
      })
    }
  }
}
</script>

<style scoped lang="less">
.w-rule-actions{
  position: relative;
  margin: 15px 0;
  padding: 10px;
  border-radius: 5px;
  border: 2px dashed #E8E8E8;
  .w-rule-actions-add{
    position: absolute;
    padding: 5px;
    top: -15px;
    left: calc(50% - 95px);
    background: white;
  }
  .w-rule-action {
    position: relative;
    margin: 7px 0;
    padding: 8px;
    border-radius: 5px;
    background: @theme-aside-bgc;
    .icon {
      cursor: pointer;
      position: absolute;
      right: 0;
      top: -12px;
      padding: 5px;
      border-radius: 50%;
      background: white;
      box-shadow: 0 0 10px 0 #E8E8E8;
      &:hover{
        color: @theme-danger;
      }
    }
  }
}
</style>
