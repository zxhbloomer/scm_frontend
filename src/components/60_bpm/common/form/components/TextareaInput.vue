<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-input size="medium" disabled :placeholder="placeholder" show-word-limit :rows="2" type="textarea" />
    </div>
    <div v-else-if="mode === 'PC' && !readonly">
      <el-input v-model="_value" size="medium" clearable :maxlength="255" :placeholder="placeholder" show-word-limit :rows="3" type="textarea">
        <el-button v-if="enableScan" slot="append" icon="el-icon-full-screen" @click="scanCode" />
      </el-input>
    </div>
    <div v-else-if="mode === 'MOBILE' && !readonly">
      <field
        v-model="_value"
        rows="2"
        autosize
        type="textarea"
        maxlength="2048"
        :placeholder="placeholder"
        show-word-limit
      >
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
import { Field, Toast } from 'vant'
import ScanCode from '@/components/60_bpm/common/ScanCode'
import componentMinxins from '../ComponentMinxins'

export default {
  name: 'TextareaInput',
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
      visible: false,
      popupStyle: {
        height: '100%',
        width: '100%',
        background: 'black',
        opacity: '0.5'
      }
    }
  },
  computed: {
    _value: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    }
  },
  methods: {
    scanCode () {
      this.visible = true
    },
    scanOk (code) {
      this._value += code + '\n'
      Toast.success('扫码成功')
    }
  }
}
</script>

<style scoped>

</style>
