<template>
  <div class="edit-cell" @click="onFieldClick">
    <el-tooltip
      v-if="!editMode && !showInput"
      :placement="toolTipPlacement"
      :open-delay="toolTipDelay"
      :content="toolTipContent"
    >
      <div tabindex="0" @keyup.enter="onFieldClick">
        <slot name="edit-cell-content" />
      </div>
    </el-tooltip>
    <component
      :is="editableComponent"
      v-if="editMode || showInput"
      ref="input"
      v-model="model"
      v-bind="$attrs"
      @focus="onFieldClick"
      @keyup.enter.native="onInputExit"
      v-on="listeners"
    >
      <slot name="edit-component-slot" />
    </component>
  </div>
</template>
<script>
export default {
  name: 'EditableCell',
  inheritAttrs: false,
  props: {
    // value: {
    //   type: String,
    //   default: ''
    // },
    // eslint-disable-next-line vue/require-default-prop
    value: [String, Number],
    toolTipContent: {
      type: String,
      default: '点击我可编辑'
    },
    toolTipDelay: {
      type: Number,
      default: 500
    },
    toolTipPlacement: {
      type: String,
      default: 'top-start'
    },
    showInput: {
      type: Boolean,
      default: false
    },
    editableComponent: {
      type: String,
      default: 'el-input'
    },
    closeEvent: {
      type: String,
      default: 'blur'
    }
  },
  data () {
    return {
      editMode: false
    }
  },
  computed: {
    model: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    },
    listeners () {
      return {
        [this.closeEvent]: this.onInputExit,
        ...this.$listeners
      }
    }
  },
  methods: {
    onFieldClick () {
      this.editMode = true
      this.$nextTick(() => {
        const inputRef = this.$refs.input
        if (inputRef) {
          inputRef.focus()
        }
      })
    },
    onInputExit () {
      this.editMode = false
    },
    onInputChange (val) {
      this.$emit('input', val)
    }
  }
}
</script>
