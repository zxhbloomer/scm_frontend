<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <draggable
        class="l-drag-from"
        :list="_items"
        group="form"
        :options="{animation: 300, chosenClass:'choose', sort:true}"
        @start="drag = true"
        @end="drag = false"
      >
        <div
          v-for="(cp, id) in _items"
          :key="id"
          class="l-form-item"
          :style="getSelectedClass(cp)"
          @click.stop="selectItem(cp)"
        >
          <div class="l-form-header">
            <p><span v-if="cp.props.required">*</span>{{ cp.title }}</p>
            <div class="l-option">
              <!--<i class="el-icon-copy-document" @click="copy"></i>-->
              <i class="el-icon-close" @click="delItem(id)" />
            </div>
            <form-design-render :config="cp" />
          </div>
        </div>
      </draggable>
      <div style="color: #c0bebe;text-align: center; width: 90%; padding: 5px;">☝ 拖拽控件到布局容器内部</div>
    </div>
    <div v-else-if="mode === 'PC' && !readonly">
      <el-row v-for="(rows, rsi) in __items" :key="rsi + '_rows'" :gutter="20">
        <el-col v-for="(item, ri) in rows" :key="ri + '_row'" :span="24 / rows.length">
          <el-form-item
            v-if="item.name !== 'SpanLayout' && item.name !== 'Description'"
            :key="item.name + ri"
            :prop="item.id"
            :label="item.title"
          >
            <form-design-render v-model="_value[item.id]" :form-data="formData" :readonly="isReadonly(item)" :mode="mode" :config="item" />
          </el-form-item>
          <form-design-render v-else v-model="_value" :form-data="formData" :readonly="isReadonly(item)" :mode="mode" :config="item" />
        </el-col>
      </el-row>
    </div>
    <div v-else-if="mode === 'PC'">
      <div v-for="(item, rsi) in _items" v-show="showItem(item)" :key="rsi + '_rows'">
        <el-form-item
          v-if="item.name !== 'SpanLayout' && item.name !== 'Description'"
          :key="item.name + rsi"
          :prop="item.id"
          :label="item.title"
        >
          <form-design-render v-model="_value[item.id]" :form-data="formData" :readonly="isReadonly(item)" :mode="mode" :config="item" />
        </el-form-item>
        <form-design-render v-else v-model="_value" :form-data="formData" :readonly="isReadonly(item)" :mode="mode" :config="item" />
      </div>

    </div>
    <div v-else>
      <div v-for="(item, i) in _items" v-show="showItem(item)" :key="'column_' + i">
        <form-item
          v-if="item.name !== 'SpanLayout' && item.name !== 'Description'"
          :ref="item.id"
          :model="_value"
          :rule="rules[item.id]"
          :prop="item.id"
          :label="item.title"
        >
          <form-design-render v-model="_value[item.id]" :form-data="formData" :readonly="isReadonly(item)" :mode="mode" :config="item" />
        </form-item>
        <form-design-render v-else :ref="item.id" v-model="_value" :form-data="formData" :readonly="isReadonly(item)" :mode="mode" :config="item" />
      </div>
    </div>
  </div>

</template>

<script>
import draggable from 'vuedraggable'
import FormItem from '@/components/60_bpm/common/FormItem'
import FormDesignRender from '@/components/60_bpm/admin/layout/form/FormDesignRender'
import componentMinxins from '../ComponentMinxins'

export default {
  name: 'SpanLayout',
  components: { draggable, FormItem, FormDesignRender },
  mixins: [componentMinxins],
  props: {
    value: {
      default: null
    },
    items: {
      type: Array,
      default: () => {
        return []
      }
    },
    number: {
      type: Number,
      default: 2
    },
    formData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      select: null,
      drag: false,
      formConfig: {
        // 数据字段
        data: {},
        // 校验规则
        rules: {}
      },
      form: {
        formId: '',
        formName: '',
        logo: {},
        formItems: [],
        process: {},
        remark: ''
      }
    }
  },
  computed: {
    rules () {
      const rules = {}
      this.items.forEach(v => {
        if (v.props.required) {
          rules[v.id] = [{ required: true, message: '请完成' + v.title, trigger: 'blur' }]
        }
      })
      return rules
    },
    _items: {
      get () {
        return this.items
      },
      set (val) {
        this.items = val
      }
    },
    __items () {
      const result = []
      for (let i = 0; i < this.items.length; i++) {
        if (i > 0 && i % this.number === 0) {
          result.push([this.items[i]])
        } else {
          const row = result[parseInt(i / this.number)]
          if (row) {
            row.push(this.items[i])
          } else {
            result.push([this.items[i]])
          }
        }
      }
      return result
    },
    selectFormItem: {
      get () {
        return this.$store.getters.selectFormItem
      },
      set (val) {
        this.$store.getters.selectFormItem = val
      }
    },
    nodeMap () {
      return this.$store.getters.nodeMap
    }
  },
  methods: {
    showItem (item) {
      return (!(this.isReadonly(item) && this.isBlank(this._value[item.id]))) || item.name === 'SpanLayout'
    },

    isBlank (val) {
      return !this.$isNotEmpty(val) ||
          ((val instanceof String) && val.trim() === '') ||
          (Array.isArray(val) && val.length === 0)
    },
    isReadonly (item) {
      return item.perm === 'R'
    },
    selectItem (cp) {
      this.selectFormItem = cp
    },
    getSelectedClass (cp) {
      return this.selectFormItem && this.selectFormItem.id === cp.id
        ? 'border-left: 4px solid #f56c6c' : ''
    },
    delItem (index) {
      this.$confirm('删除组件将会连带删除包含该组件的条件以及相关设置，是否继续?', '提示', {
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        type: 'warning'
      }).then(() => {
        if (this._items[index].name === 'SpanLayout') {
          // 删除的是分栏则遍历删除分栏内所有子组件
          this._items[index].props.items.forEach(item => {
            this.removeFormItemAbout(item)
          })
          this._items[index].props.items.length = 0
        } else {
          this.removeFormItemAbout(this._items[index])
        }
        this._items.splice(index, 1)
      })
    },
    validate (call) {
      let success = true
      this.items.forEach(form => {
        const formRef = this.$refs[form.id]
        if (formRef && Array.isArray(formRef) && formRef.length > 0) {
          formRef[0].validate(subValid => {
            if (!subValid) {
              success = false
            }
          })
        }
      })
      call(success)
    },
    async removeFormItemAbout (item) {
      this.nodeMap.forEach(node => {
        // 搜寻条件，进行移除
        if (node.type === 'CONDITION') {
          node.props.groups.forEach(group => {
            const i = group.cids.remove(item.id)
            if (i > -1) {
              // 从子条件移除
              group.conditions.splice(i, 1)
            }
          })
        }
        // 搜寻权限，进行移除
        if (node.type === 'ROOT' || node.type === 'APPROVAL' || node.type === 'CC') {
          node.props.formPerms.removeByKey('id', item.id)
        }
      })
    }

  }
}
</script>

<style lang="less" scoped>

.choose {
  border: 1px dashed @theme-primary !important;
}

.l-drag-from {
  min-height: 50px;
  background-color: rgb(245, 246, 246);

  .l-form-item, li {
    cursor: grab;
    background: #ffffff;
    padding: 10px;
    border: 1px solid #ebecee;
    margin: 5px 0;
  }
}

.l-form-header {
  font-size: small;
  color: #818181;
  text-align: left;
  position: relative;
  background-color: #fff;

  p {
    position: relative;
    margin: 0 0 10px 0;

    span {
      position: absolute;
      left: -8px;
      top: 3px;
      color: rgb(217, 0, 19);
    }
  }

  .l-option {
    position: absolute;
    top: -10px;
    right: -10px;

    i {
      font-size: large;
      cursor: pointer;
      color: #8c8c8c;
      padding: 5px;

      &:hover {
        color: @theme-primary;
      }
    }
  }
}

</style>
