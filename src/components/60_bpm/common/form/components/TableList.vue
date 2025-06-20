<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <draggable
        class="l-drag-from"
        :list="_columns"
        group="form"
        :options="{animation: 300, chosenClass:'choose', sort:true}"
        @start="drag = true"
        @end="drag = false"
      >
        <div
          v-for="(cp, id) in _columns"
          :key="id"
          class="l-form-item"
          :style="getSelectedClass(cp)"
          @click.stop="selectItem(cp)"
        >
          <div class="l-form-header">
            <p><span v-if="cp.props.required">*</span>{{ cp.title }}</p>
            <div class="l-option">
              <i class="el-icon-close" @click="delItem(id)" />
            </div>
            <form-design-render :config="cp" />
          </div>
        </div>
      </draggable>
      <div style="color: #c0bebe;text-align: center; width: 90%; padding: 5px;">☝ 拖拽控件到表格内部</div>
    </div>
    <div v-else-if="mode === 'MOBILE'">
      <collapse v-model="actives">
        <div v-if="_value.length === 0" class="m-tb-empty">点击下方 + 添加数据</div>
        <collapse-item v-for="(row, i) in _value" :key="i" :lazy-render="false" style="background: #f7f8fa" :name="i">
          <template #title>
            <span>第 {{ i + 1 }} 项  </span>
            <span v-show="isError(i)" class="m-valid-error">
              <i class="el-icon-warning-outline" />
            </span>
            <span v-if="!readonly" class="del-row" @click.stop="delRow(i, row)">删除</span>
          </template>
          <form-item
            v-for="(column, index) in _columns"
            :ref="`${column.id}_${i}`"
            :key="'column_' + index"
            :model="row"
            :rule="rules[column.id]"
            :prop="column.id"
            :label="column.title"
          >
            <form-design-render v-model="row[column.id]" :form-data="formData" :readonly="isReadonly(column)" :mode="mode" :config="column" />
          </form-item>
        </collapse-item>
      </collapse>
      <div v-if="!readonly" class="m-add-row" @click="addRow">
        <i class="el-icon-plus" />
        <span> {{ placeholder }}</span>
      </div>
    </div>
    <div v-else>
      <div v-if="rowLayout">
        <el-table
          size="medium"
          :cell-style="cellStyle"
          :header-cell-style="tbCellStyle"
          :border="showBorder"
          :summary-method="getSummaries"
          :show-summary="showSummary"
          :data="_value"
          style="width: 100%"
        >
          <el-table-column fixed type="index" label="序号" width="50" />
          <el-table-column v-for="(column, index) in _columns" :key="index" :min-width="getMinWidth(column)" :prop="column.id" :label="column.title">
            <template slot="header">
              <span v-show="column.props.required" style="color:#da4b2b;">* </span>
              {{ column.title }}
            </template>
            <template slot-scope="scope">
              <form-design-render
                v-model="_value[scope.$index][column.id]"
                :index="scope.$index + 1"
                :form-data="formData"
                :class="{'valid-error': showError(column, _value[scope.$index][column.id]), 'readonly': readonly}"
                :readonly="isReadonly(column)"
                :mode="mode"
                :config="column"
              />
            </template>
          </el-table-column>
          <el-table-column v-if="!readonly" fixed="right" min-width="90" label="操作">
            <template slot-scope="scope">
              <el-button size="mini" type="text" @click="copyData(scope.$index, scope.row)">复制</el-button>
              <el-button size="mini" type="text" @click="delRow(scope.$index, scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button v-if="!readonly" size="small" icon="el-icon-plus" @click="addRow">{{ placeholder }}</el-button>
      </div>
      <div v-else>
        <el-form v-for="(row, i) in _value" :ref="`table-form-${i}`" :key="i" :rules="rules" :model="row" class="table-column">
          <div class="table-column-action">
            <span>第 {{ i + 1 }} 项</span>
            <i v-if="!readonly" class="el-icon-close" @click="delRow(i, row)" />
          </div>
          <el-form-item v-for="(column, index) in _columns" :key="'column_' + index" :prop="column.id" :label="column.title">
            <form-design-render v-model="row[column.id]" :index="index + 1" :form-data="formData" :readonly="isReadonly(column)" :mode="mode" :config="column" />
          </el-form-item>
        </el-form>
        <el-button v-if="!readonly" size="small" icon="el-icon-plus" @click="addRow">{{ placeholder }}</el-button>
      </div>
    </div>
  </div>

</template>

<script>
import draggable from 'vuedraggable'
import { ValueType } from '../ComponentsConfigExport'
import { Collapse, CollapseItem, Dialog, Toast } from 'vant'
import FormItem from '@/components/60_bpm/common/FormItem'
import FormDesignRender from '@/components/60_bpm/admin/layout/form/FormDesignRender'
import componentMinxins from '../ComponentMinxins'

export default {
  name: 'TableList',
  components: { draggable, FormItem, Collapse, CollapseItem, FormDesignRender },
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
      default: '添加数据'
    },
    columns: {
      type: Array,
      default: () => {
        return []
      }
    },
    showBorder: {
      type: Boolean,
      default: true
    },
    showSummary: {
      type: Boolean,
      default: false
    },
    maxSize: {
      type: Number,
      default: 0
    },
    rowLayout: {
      type: Boolean,
      default: true
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
      ValueType,
      actives: [],
      tbCellStyle: {
        background: '#e8e8e8',
        padding: '3px 0'
      },
      cellStyle: {
        padding: '0'
      }
    }
  },
  computed: {
    rules () {
      const rules = {}
      this.columns.forEach(col => {
        if (col.props.required) {
          rules[col.id] = [{
            type: col.valueType === 'Array' ? 'array' : undefined,
            required: true,
            message: `请完成${col.title}`, trigger: 'blur'
          }]
        }
      })
      return rules
    },
    _columns: {
      get () {
        return this.columns
      },
      set (val) {
        this.columns = val
      }
    },
    selectFormItem: {
      get () {
        return this.$store.getters.selectFormItem
      },
      set (val) {
        this.$store.getters.selectFormItem = val
      }
    }
  },
  created () {
    if (!Array.isArray(this.value)) {
      this._value = []
    }
  },
  methods: {
    getMinWidth (col) {
      switch (col.name) {
        case 'DateTime':
          return '250px'
        case 'DateTimeRange':
          return '280px'
        case 'MultipleSelect':
          return '200px'
        default:
          return '150px'
      }
    },
    showError (col, val) {
      if (col.props.required) {
        switch (col.valueType) {
          case ValueType.dept:
          case ValueType.user:
          case ValueType.dateRange:
          case ValueType.array:
            return !(Array.isArray(val) && val.length > 0)
          default:
            return !this.$isNotEmpty(val)
        }
      }
      return false
    },
    isError (i) {
      for (let j = 0; j < this._columns.length; j++) {
        const ref = this.$refs[`${this._columns[j].id}_${i}`]
        if (ref && Array.isArray(ref) && ref.length > 0 && ref[0].isError) {
          if (ref[0].isError()) {
            return true
          }
        }
      }
      return false
    },
    isReadonly (item) {
      return item.perm === 'R'
    },
    copyData (i, row) {
      this._value.push(this.$deepCopy(row))
    },
    delRow (i, row) {
      if (this.mode === 'PC') {
        this.$confirm('您确定要删除该行数据吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this._value.splice(i, 1)
        })
      } else {
        Dialog.confirm({
          title: '提示',
          message: '您确定要删除该行数据吗？'
        }).then(() => {
          this._value.splice(i, 1)
        })
      }
    },
    addRow () {
      if (this.maxSize > 0 && this._value.length >= this.maxSize) {
        if (this.mode === 'PC') {
          this.$message.warning(`最多只能添加${this.maxSize}行`)
        } else {
          Toast.fail(`最多加${this.maxSize}行`)
        }
      } else {
        const row = {}
        this.columns.forEach(col => this.$set(row, col.id, undefined))
        this._value.push(row)
        this.$set(this, '_value', this._value)
      }
    },
    delItem (id) {
      this._columns.splice(id, 1)
    },
    selectItem (cp) {
      this.selectFormItem = cp
    },
    getSelectedClass (cp) {
      return this.selectFormItem && this.selectFormItem.id === cp.id ? 'border-left: 4px solid #f56c6c' : ''
    },
    getSummaries (param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        const values = data.map(item => Number(item[column.property]))
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
        } else {
          sums[index] = '...'
        }
      })

      return sums
    },
    validate (call) {
      if (this.mode === 'PC') {
        if (this.rowLayout) {
          let result = true
          for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].props.required) {
              for (let j = 0; j < this._value.length; j++) {
                result = !this.showError(this.columns[i], this._value[j][this.columns[i].id])
                if (!result) {
                  call(false)
                  return
                }
              }
            }
          }
          call(result)
        } else {
          let success = 0
          this._value.forEach((v, i) => {
            const formRef = this.$refs[`table-form-${i}`]
            if (formRef && Array.isArray(formRef) && formRef.length > 0) {
              formRef[0].validate(valid => {
                if (valid) {
                  success++
                }
              })
            }
          })
          setTimeout(() => call(success === this._value.length), 500)
        }
      } else {
        let success = true
        this._value.forEach((row, i) => {
          this._columns.forEach(col => {
            const tbColRef = this.$refs[`${col.id}_${i}`]
            if (tbColRef && Array.isArray(tbColRef) && tbColRef.length > 0) {
              tbColRef[0].validate(valid => {
                if (!valid) {
                  success = false
                }
              })
            }
          })
        })
        call(success)
      }
    }
  }
}
</script>

<style lang="less" scoped>

.m-valid-error {
  margin-left: 10px;
  font-size: 1rem;
  color: @theme-danger;
}

.readonly{
  padding: 5px 0;
}

/deep/ .m-form-item .valid-error{
  border-bottom: none;
}

.del-row {
  float:right;
  margin-right: 10px;
  font-size: 1rem;
  color: #8c8c8c;
}

/deep/ .valid-error {
  border-bottom: 2px dashed @theme-danger;
}

.choose {
  border: 1px dashed @theme-primary !important;
}

/deep/ .el-table__row{
  .cell{
    .el-input__inner, .el-textarea__inner{
      border-radius: 0;
      border: none;
      padding-left: 0;
    }
    .el-input__prefix{
      display: none;
    }
  }
}

.table-column {
  padding: 5px;
  margin-bottom: 10px;
  border-left: 3px solid @theme-primary;
  border-radius: 5px;
  background: #fafafa;

  /deep/ .el-form-item {
    margin-bottom: 0;

    .el-form-item__label {
      height: 25px;
    }
  }

  .table-column-action {
    float: right;

    span {
      color: #afafaf;
      margin-right: 10px;
      font-size: 13px;
    }

    i {
      color: #afafaf;
      padding: 5px;
      font-size: large;
      cursor: pointer;

      &:hover {
        color: #666666;
      }
    }
  }
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

.m-add-row {
  color: @theme-primary;
  padding-top: 10px;
  text-align: center;
  cursor: pointer;
}

/deep/ .van-collapse-item__content {
  padding: 0;
  background: #f7f8fa;
}

.m-tb-empty {
  padding: 20px;
  background: #f7f8fa;
  color: #bdb7b7;
  text-align: center;
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
