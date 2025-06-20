<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <template v-if="expansion">
        <el-checkbox-group v-if="multiple" v-model="_value" disabled>
          <el-checkbox v-for="(op, index) in options" :key="index" class="w-row-text" disabled :label="op">{{ op.name }}</el-checkbox>
        </el-checkbox-group>
        <el-radio-group v-else v-model="_value" disabled>
          <el-radio v-for="(op, index) in options" :key="index" class="w-row-text" style="margin: 5px" :label="op">{{ op.name }}</el-radio>
        </el-radio-group>
      </template>
      <template v-else>
        <el-button disabled icon="iconfont icon-map-site" type="primary" size="mini" round> 选择部门</el-button>
        <span class="placeholder"> {{ placeholder }}</span>
      </template>
    </div>
    <div v-else-if="mode === 'PC' && !readonly">
      <template v-if="expansion">
        <el-checkbox-group v-if="multiple" v-model="_value">
          <el-checkbox v-for="(op, index) in options" :key="index" class="w-row-text" :label="op">{{ op.name }}</el-checkbox>
        </el-checkbox-group>
        <el-radio-group v-else :value="_value[0]" @input="ev => _value = [ev]">
          <el-radio v-for="(op, index) in options" :key="index" class="w-row-text" style="margin: 5px" :label="op">{{ op.name }}</el-radio>
        </el-radio-group>
      </template>
      <template v-else>
        <el-button icon="iconfont icon-map-site" type="primary" size="mini" round @click="$refs.orgPicker.show()"> 选择部门</el-button>
        <org-picker ref="orgPicker" type="dept" :multiple="multiple" :selected="_value" @ok="selected" />
        <span class="placeholder"> {{ placeholder }}</span>
        <div style="margin-top: 5px">
          <el-tag v-for="(dept, index) in _value" :key="index" size="mini" style="margin: 5px" closable @close="delDept(i)">{{ dept.name }}</el-tag>
        </div>
      </template>
    </div>
    <div v-else-if="mode === 'MOBILE' && !readonly">
      <template v-if="expansion">
        <checkbox-group v-if="multiple" v-model="_value" direction="horizontal">
          <checkbox v-for="(op, index) in options" :key="index" style="margin: 5px" :name="op" shape="square">{{ op.name }}</checkbox>
        </checkbox-group>
        <radio-group v-else :value="_value[0]" direction="horizontal" @input="ev => _value = [ev]">
          <radio v-for="(op, index) in options" :key="index" style="margin: 5px" :name="op">{{ op.name }}</radio>
        </radio-group>
      </template>
      <template v-else>
        <field v-model="deptDesc" readonly clearable right-icon="arrow" clickable :placeholder="placeholder" @clear="_value = []" @click="$refs.orgPicker.show()" />
        <org-picker ref="orgPicker" :pc-mode="false" type="dept" :multiple="multiple" :selected="_value" @ok="selected" />
      </template>
    </div>
    <div v-else>
      {{ String(_value.map(v => v.name)) }}
    </div>
  </div>
</template>

<script>
import { Field, Radio, RadioGroup, Checkbox, CheckboxGroup } from 'vant'
import componentMinxins from '../ComponentMinxins'
import OrgPicker from '@/components/60_bpm/common/OrgPicker'

export default {
  name: 'DeptPicker',
  components: { OrgPicker, Field, Radio, RadioGroup, Checkbox, CheckboxGroup },
  mixins: [componentMinxins],
  props: {
    value: {
      type: Array,
      default: () => {
        return []
      }
    },
    placeholder: {
      type: String,
      default: '请选择部门'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    expansion: {
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
      showOrgSelect: false
    }
  },
  computed: {
    deptDesc: {
      get () {
        if (this._value && this._value.length > 3) {
          return `${String(this._value.slice(0, 3).map(v => v.name))}... 等${this._value.length}个部门`
        } else if (this._value && this._value.length > 0) {
          return String(this._value.map(v => v.name))
        } else {
          return null
        }
      },
      set (val) {

      }
    }
  },
  methods: {
    selected (values) {
      this.showOrgSelect = false
      this._value = values
    },
    delDept (i) {
      this._value.splice(i, 1)
    }
  }
}
</script>

<style lang="less" scoped>
.placeholder{
  margin-left: 10px;
  color: #adabab;
  font-size: smaller;
}

/deep/ .el-checkbox-group{
  line-height: 10px;
}
</style>
