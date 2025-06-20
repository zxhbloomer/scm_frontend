<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-select v-if="!expanding" v-model="_value" class="max-fill" size="medium" multiple disabled :placeholder="placeholder" />
      <el-checkbox-group v-else v-model="_value">
        <el-checkbox v-for="(op, index) in options" :key="index" class="w-row-text" disabled :label="op">{{ op }}</el-checkbox>
      </el-checkbox-group>
    </div>
    <div v-else-if="mode === 'PC' && !readonly">
      <el-select v-if="!expanding" v-model="_value" class="max-fill" multiple size="medium" clearable :placeholder="placeholder">
        <el-option v-for="(op, index) in options" :key="index" :value="op" :label="op" />
      </el-select>
      <el-checkbox-group v-else v-model="_value">
        <el-checkbox v-for="(op, index) in options" :key="index" class="w-row-text" style="margin: 5px" :label="op">{{ op }}</el-checkbox>
      </el-checkbox-group>
    </div>
    <div v-else-if="mode === 'MOBILE' && !readonly">
      <!--      <div v-if="!expanding">
        <field right-icon="arrow" readonly clickable :value="_value" :placeholder="placeholder" @click="showPicker = true"/>
        <popup v-model="showPicker" position="bottom">
          <picker :title="placeholder" show-toolbar :columns="options" @confirm="onConfirm" @cancel="showPicker = false"></picker>
        </popup>
      </div>-->
      <checkbox-group v-model="_value" direction="horizontal">
        <checkbox v-for="(op, index) in options" :key="index" style="margin: 5px" :name="op" shape="square">{{ op }}</checkbox>
      </checkbox-group>
    </div>
    <div v-else>
      {{ String(_value) }}
    </div>
  </div>
</template>

<script>

import { Checkbox, CheckboxGroup } from 'vant'
import componentMinxins from '../ComponentMinxins'

export default {
  name: 'MultipleSelect',
  components: { Checkbox, CheckboxGroup },
  mixins: [componentMinxins],
  props: {
    placeholder: {
      type: String,
      default: '请选择选项'
    },
    value: {
      type: Array,
      default: () => {
        return []
      }
    },
    expanding: {
      type: Boolean,
      default: false
    },
    options: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      showPicker: false,
      checks: []
    }
  },
  computed: {

  },
  methods: {
    onConfirm () {

    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .el-checkbox-group{
  line-height: 10px;
}
</style>
