<template>
  <div>
    <el-radio-group v-model="formConfig.ruleType" style="margin: 20px 0 10px 0">
      <el-radio label="SIMPLE">简单模式</el-radio>
      <el-radio label="SCRIPT">高级模式</el-radio>
    </el-radio-group>
    <template v-if="formConfig.ruleType === 'SIMPLE'">
      <div class="w-add-rule" @click="addRule">
        + 添加联动规则
      </div>
      <div>
        <div v-for="(rule, i) in formConfig.rules" :key="'rule_' + i" class="w-form-rule" @click="editRule(i, rule)">
          <div class="w-form-rule-content" />
          <i class="el-icon-close icon" @click.stop="removeRule(i)" />
          <div>{{ '规则 ' + (i + 1) }}</div>
        </div>
      </div>

    </template>
    <el-button v-else size="small" style="margin-top: 10px;" icon="el-icon-set-up" @click="addRule">使用JS控制联动</el-button>
    <w-dialog v-model="ruleDialog" :title="`${isAddRule ? '新增':'编辑'}表单联动规则`" @ok="confirmRule">
      <template v-if="formConfig.ruleType === 'SIMPLE'">
        <el-alert type="success" description="当满足如下条件关系时，执行下方一系列联动动作" close-text="知道了" style="margin-bottom: 10px" />
        <condition-config v-model="selectedRule.condition" class="w-rule-conditions" :form-items="formItems" />
        <action-config v-model="selectedRule.action.with" :options="formItems" add-text="添加动作（满足条件时执行）" />
        <action-config v-model="selectedRule.action.other" :options="formItems" add-text="添加动作（不满足条件时执行）" />
      </template>
      <template v-else>
        <code-editor v-model="formConfig.ruleJs" />
      </template>
    </w-dialog>
  </div>
</template>

<script>
import ConditionConfig from './subs/ConditionConfig.vue'
import CodeEditor from '@/components/60_bpm/common/CodeEditor.vue'
import ActionConfig from './subs/ActionConfig.vue'
import WDialog from '@/components/60_bpm/common/WDialog'
import deepCopy from 'deep-copy'

export default {
  name: 'FormConfig',
  components: { WDialog,ActionConfig, CodeEditor, ConditionConfig },
  data () {
    return {
      ruleDialog: false,
      activeName: 'base',
      isAddRule: true,
      selectedRuleIndex: null,
      selectedRule: { condition: {}, action: {}},
      ruleProps: {
        condition: {
          logic: true,
          condition: {
            field: null,
            fieldType: null,
            compare: null,
            fixed: true,
            compareVal: []
          },
          children: []
        },
        action: {
          with: [// 满足条件时执行
            {
              targets: [],
              type: null,
              value: null
            }
          ],
          other: [// 不满足条件时执行
            {
              targets: [],
              type: null,
              value: null
            }
          ]
        }
      }
    }
  },
  computed: {
    formConfig () {
      return this.$store.getters.design.formConfig || {}
    },
    formItemMap: {
      get () {
        return this.$store.getters.formItemMap
      },
      set (val) {
        this.$store.getters.formItemMap = val
      }
    },
    formItems () {
      const items = []
      this.formItemMap = new Map()
      this.$store.getters.design.formItems.forEach(item => {
        this.loadItems(items, item)
      })
      return items
    }
  },
  methods: {
    loadItems (items, item, alisa) {
      this.formItemMap.set(item.id, item)
      if (item.name === 'SpanLayout') {
        item.props.items.forEach(it => this.loadItems(items, it))
      } else if (item.name === 'TableList') {
        items.push(item)
        item.props.columns.forEach(it => {
          this.loadItems(items, it, `${item.title}.${it.title}`)
        })
      } else {
        items.push({
          id: item.id,
          name: item.name,
          title: alisa || item.title,
          valueType: item.valueType,
          props: item.props
        })
      }
    },
    addRule () {
      this.isAddRule = true
      this.selectedRule = deepCopy(this.ruleProps)
      this.ruleDialog = true
    },
    editRule (i, rule) {
      this.isAddRule = false
      this.ruleDialog = true
      this.selectedRuleIndex = i
      this.selectedRule = deepCopy(rule)
    },
    removeRule (i) {
      this.formConfig.rules.splice(i, 1)
    },
    confirmRule () {
      if (this.isAddRule) {
        this.formConfig.rules.push(this.selectedRule)
      } else {
        this.formConfig.rules[this.selectedRuleIndex] = this.selectedRule
      }
      this.ruleDialog = false
    }
  }
}
</script>

<style lang="less" scoped>
.w-add-rule{
  padding: 5px;
  text-align: center;
  margin: 10px;
  cursor: pointer;
  border-radius: 5px;
  border: 2px dashed #E8E8E8;
  &:hover {
    color: @theme-primary;
    border-color: @theme-primary;
  }
}

.w-form-rule {
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
  background: white;
  cursor: pointer;
  position: relative;
  border: 1px solid white;
  &:hover {
    box-shadow: 0 0 10px 0 #E8E8E8;
    transition: box-shadow 0.5s;
    border: 1px dashed @theme-primary;
  }
  .icon {
    position: absolute;
    right: -8px;
    top: -10px;
    padding: 5px;
    border-radius: 50%;
    background: white;
    &:hover{
      color: @theme-danger;
    }
  }
}

.w-rule-conditions{

}

</style>
