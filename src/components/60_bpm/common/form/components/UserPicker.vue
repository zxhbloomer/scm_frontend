<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-button disabled icon="el-icon-user" type="primary" size="mini" round>选择人员</el-button>
      <span class="placeholder"> {{ placeholder }}</span>
    </div>
    <div v-else-if="mode === 'PC' && !readonly" style="max-width: 350px">
      <el-button icon="el-icon-user" type="primary" size="mini" round @click="$refs.orgPicker.show()">选择人员</el-button>
      <org-picker ref="orgPicker" type="user" :multiple="multiple" :selected="_value" @ok="selected" />
      <span class="placeholder"> {{ placeholder }}</span>
      <div style="margin-top: 5px">
        <el-tag v-for="(dept, index) in _value" :key="index" size="mini" style="margin: 5px" closable @close="delDept(i)">{{ dept.name }}</el-tag>
      </div>
    </div>
    <div v-else-if="mode === 'MOBILE' && !readonly">
      <field v-model="deptDesc" readonly clearable right-icon="arrow" clickable :placeholder="placeholder" @clear="_value = []" @click="$refs.orgPicker.show()" />
      <org-picker ref="orgPicker" :pc-mode="false" type="user" :multiple="multiple" :selected="_value" @ok="selected" />
    </div>
    <div v-else class="preview">
      <avatar v-for="(user, index) in _value" :key="index" :size="35" :name="user.name" show-y :src="user.avatar" />
    </div>
  </div>
</template>

<script>
import { Field } from 'vant'
import componentMinxins from '../ComponentMinxins'
import OrgPicker from '@/components/60_bpm/common/OrgPicker'

export default {
  name: 'DeptPicker',
  components: { Field, OrgPicker },
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
      default: '请选择人员'
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
        if (this._value && this._value.length > 1) {
          return `${this._value[0].name}${this._value[1].name}..等${this._value.length}人`
        } else if (this._value && this._value.length > 0) {
          return this._value[0].name
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

<style scoped>
.placeholder{
  margin-left: 10px;
  color: #adabab;
  font-size: smaller;
}
.preview{
  display: flex;
  justify-content: left;
  /deep/ .avatar{
    margin: 0 5px;
  }
}
</style>
