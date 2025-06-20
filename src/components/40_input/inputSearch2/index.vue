<template>
  <div
    :class="[
      inputSize ? 'el-input--' + inputSize : '',
      {
        'el-input-group': $slots.prepend || $slots.append,
        'el-input-group--append': $slots.append,
        'el-input-group--prepend': $slots.prepend,
        'el-input--prefix': $slots.prefix,
        'el-input--suffix': $slots.suffix
      }
    ]"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <div
      v-if="$slots.prepend"
      class="el-input-group__prepend"
    >
      <slot name="prepend" />
    </div>
    <span v-show="disabled">
      <el-tag
        v-for="item in value"
        :key="item.id"
        class="position_tag"
      >
        {{ item.name }}
      </el-tag>
    </span>
    <el-input
      v-show="!disabled"
      v-model.trim="dataJson.values"
      readonly
      :placeholder="isPlaceholderShow('请点击进行选择')"
      @click.native="handleClick"
    >
      <el-button
        slot="append"
        type="primary"
        icon="el-icon-search"
        :disabled="disabled"
      >
        选择
      </el-button>
    </el-input>
  </div>
</template>

<style scoped>
.el-input.is-disabled::v-deep .el-input__inner {
  color: #606266 !important;
  cursor: pointer;
}
.el-input::v-deep .el-input__inner {
  color: #606266 !important;
  cursor: pointer;
}
</style>

<script>
export default {
  name: 'InputSearch',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      dataJson: {
        tempJson: {},
        values: ''
      }
    }
  },
  watch: {
    value: {
      immediate: true, // 立即触发一次以初始化数据
      handler (newVal) {
        this.updateValues(newVal)
      }
    }
  },
  methods: {
    inputSize () {
      return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size
    },
    handleClick () {
      if (!this.disabled) {
        this.$emit('onInputSearch')
      }
    },
    isPlaceholderShow (val) {
      return this.disabled ? '' : val
    },
    updateValues (value) {
      if (value && Array.isArray(value)) {
        this.dataJson.values = value.map(item => item.name).join(',')
      } else {
        this.dataJson.values = ''
      }
    }
  }
}
</script>
