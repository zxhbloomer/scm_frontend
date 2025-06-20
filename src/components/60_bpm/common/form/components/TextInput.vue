<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-input size="medium" disabled :placeholder="placeholder" />
    </div>
    <div v-else-if="mode === 'PC' && !readonly">
      <el-input v-model="_value" size="medium" clearable :placeholder="placeholder">
        <el-button v-if="enableScan" slot="append" icon="el-icon-full-screen" @click="scanCode" />
      </el-input>
      <scan-code v-model="visible" pc-mode @ok="scanOk" />
    </div>
    <div v-else-if="mode === 'MOBILE' && !readonly">
      <field v-model="_value" clearable :placeholder="placeholder">
        <template v-if="enableScan" #right-icon>
          <i class="el-icon-full-screen" @click="scanCode" />
        </template>
      </field>
      <scan-code v-model="visible" @ok="scanOk" />
    </div>
    <div v-else>
      {{ _value }}
    </div>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'
import { Field, Toast } from 'vant'
import ScanCode from '@/components/60_bpm/common/ScanCode'

export default {
  name: 'TextInput',
  components: { Field, ScanCode },
  mixins: [componentMinxins],
  props: {
    value: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: '请输入内容'
    },
    enableScan: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      visible: false

    }
  },
  methods: {
    scanCode () {
      this.visible = true
    },
    scanOk (code) {
      this._value = code
      Toast.success('扫码成功')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
