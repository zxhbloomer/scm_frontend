<template>
  <div class="human-feedback-node-property">
    <!-- 输入变量（select/table_select动态选项通过此处连线映射） -->
    <node-property-input :workflow="workflow" :wf-node="wfNode" />

    <!-- 提示信息 -->
    <div class="property-section">
      <div class="section-title">提示信息</div>
      <el-input
        v-model="nodeConfig.tip"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 10 }"
        placeholder="显示给用户的提示文字"
      />
    </div>

    <!-- 交互类型 -->
    <div class="property-section">
      <div class="section-title">交互类型</div>
      <el-select
        v-model="nodeConfig.interactionType"
        size="small"
        style="width: 100%"
        @change="handleTypeChange"
      >
        <el-option label="自由文本" value="text" />
        <el-option label="确认驳回" value="confirm" />
        <el-option label="单项选择" value="select" />
        <el-option label="表格选择" value="table_select" />
        <el-option label="表单填写" value="form" />
      </el-select>
    </div>

    <!-- confirm 类型配置 -->
    <template v-if="nodeConfig.interactionType === 'confirm'">
      <div class="property-section">
        <div class="section-title">确认按钮文本</div>
        <el-input
          v-model="nodeConfig.confirmText"
          size="small"
          placeholder="确认"
        />
      </div>
      <div class="property-section">
        <div class="section-title">驳回按钮文本</div>
        <el-input
          v-model="nodeConfig.rejectText"
          size="small"
          placeholder="驳回"
        />
      </div>
      <div class="property-section">
        <div class="section-title">详情说明</div>
        <el-input
          v-model="nodeConfig.detail"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6 }"
          placeholder="需要用户确认的详细内容"
        />
      </div>
    </template>

    <!-- select 类型配置 -->
    <template v-if="nodeConfig.interactionType === 'select'">
      <div class="property-section">
        <div class="section-title">选项列表</div>
        <div
          v-for="(option, index) in nodeConfig.options"
          :key="index"
          class="list-row"
        >
          <el-input
            v-model="option.key"
            size="small"
            placeholder="key"
            style="width: 35%"
          />
          <el-input
            v-model="option.label"
            size="small"
            placeholder="显示名称"
            style="width: 50%; margin-left: 4px"
          />
          <el-button
            type="text"
            icon="el-icon-delete"
            size="small"
            style="margin-left: 4px; color: #F56C6C"
            @click="removeOption(index)"
          />
        </div>
        <el-button
          type="text"
          icon="el-icon-plus"
          size="small"
          @click="addOption"
        >
          添加选项
        </el-button>
      </div>
    </template>

    <!-- table_select 类型配置 -->
    <template v-if="nodeConfig.interactionType === 'table_select'">
      <div class="property-section">
        <div class="section-title">选项列表</div>
        <div
          v-for="(option, index) in nodeConfig.options"
          :key="index"
          class="list-row"
        >
          <el-input v-model="option.key" size="small" placeholder="key" style="width: 35%" />
          <el-input v-model="option.label" size="small" placeholder="显示名称" style="width: 50%; margin-left: 4px" />
          <el-button type="text" icon="el-icon-delete" size="small" style="margin-left: 4px; color: #F56C6C" @click="removeOption(index)" />
        </div>
        <el-button type="text" icon="el-icon-plus" size="small" @click="addOption">添加选项</el-button>
      </div>

      <div class="property-section">
        <div class="section-title">列定义</div>
        <div
          v-for="(col, index) in nodeConfig.columns"
          :key="index"
          class="list-row"
        >
          <el-input v-model="col.key" size="small" placeholder="字段key" style="width: 28%" />
          <el-input v-model="col.label" size="small" placeholder="列头名称" style="width: 35%; margin-left: 4px" />
          <el-input-number v-model="col.width" size="small" :min="60" :max="500" placeholder="宽度" style="width: 80px; margin-left: 4px" />
          <el-button type="text" icon="el-icon-delete" size="small" style="margin-left: 4px; color: #F56C6C" @click="removeColumn(index)" />
        </div>
        <el-button type="text" icon="el-icon-plus" size="small" @click="addColumn">添加列</el-button>
      </div>
    </template>

    <!-- form 类型配置 -->
    <template v-if="nodeConfig.interactionType === 'form'">
      <div class="property-section">
        <div class="section-title">表单字段</div>
        <div
          v-for="(field, index) in nodeConfig.fields"
          :key="index"
          class="list-row"
        >
          <el-input
            v-model="field.key"
            size="small"
            placeholder="字段标识"
            style="width: 22%"
          />
          <el-input
            v-model="field.label"
            size="small"
            placeholder="显示名称"
            style="width: 22%; margin-left: 4px"
          />
          <el-select
            v-model="field.type"
            size="small"
            style="width: 22%; margin-left: 4px"
          >
            <el-option label="文本" value="text" />
            <el-option label="多行文本" value="textarea" />
            <el-option label="数字" value="number" />
            <el-option label="下拉选择" value="select" />
          </el-select>
          <el-checkbox
            v-model="field.required"
            style="margin-left: 8px"
          >
            必填
          </el-checkbox>
          <el-button
            type="text"
            icon="el-icon-delete"
            size="small"
            style="margin-left: 4px; color: #F56C6C"
            @click="removeField(index)"
          />
        </div>
        <el-button
          type="text"
          icon="el-icon-plus"
          size="small"
          @click="addField"
        >
          添加字段
        </el-button>
      </div>

      <!-- 表单字段type=select时的子选项配置 -->
      <template v-for="(field, fIdx) in nodeConfig.fields">
        <div
          v-if="field.type === 'select'"
          :key="'field-opts-' + fIdx"
          class="property-section sub-section"
        >
          <div class="section-title">"{{ field.label || field.key }}" 的选项</div>
          <div
            v-for="(opt, oIdx) in (field.options || [])"
            :key="oIdx"
            class="list-row"
          >
            <el-input
              v-model="opt.key"
              size="small"
              placeholder="key"
              style="width: 35%"
            />
            <el-input
              v-model="opt.label"
              size="small"
              placeholder="显示名称"
              style="width: 50%; margin-left: 4px"
            />
            <el-button
              type="text"
              icon="el-icon-delete"
              size="small"
              style="margin-left: 4px; color: #F56C6C"
              @click="removeFieldOption(fIdx, oIdx)"
            />
          </div>
          <el-button
            type="text"
            icon="el-icon-plus"
            size="small"
            @click="addFieldOption(fIdx)"
          >
            添加选项
          </el-button>
        </div>
      </template>
    </template>

    <!-- 超时时间 -->
    <div class="property-section">
      <div class="section-title">超时时间(分钟)</div>
      <el-input-number
        v-model="nodeConfig.timeoutMinutes"
        :min="1"
        :max="1440"
        size="small"
      />
    </div>
  </div>
</template>

<script>
import NodePropertyInput from '../NodePropertyInput.vue'

export default {
  name: 'HumanFeedbackNodeProperty',

  components: { NodePropertyInput },

  props: {
    workflow: {
      type: Object,
      required: true
    },
    wfNode: {
      type: Object,
      required: true
    }
  },

  computed: {
    nodeConfig () {
      const config = this.wfNode.nodeConfig
      // 通用字段
      if (!config.tip) {
        this.$set(config, 'tip', '')
      }
      if (!config.interactionType) {
        this.$set(config, 'interactionType', 'text')
      }
      if (config.timeoutMinutes === undefined) {
        this.$set(config, 'timeoutMinutes', 30)
      }
      // confirm 字段
      if (config.confirmText === undefined) {
        this.$set(config, 'confirmText', '确认')
      }
      if (config.rejectText === undefined) {
        this.$set(config, 'rejectText', '驳回')
      }
      if (config.detail === undefined) {
        this.$set(config, 'detail', '')
      }
      // select 字段
      if (!config.options) {
        this.$set(config, 'options', [])
      }
      // form 字段
      if (!config.fields) {
        this.$set(config, 'fields', [])
      }
      // table_select 字段
      if (!config.columns) {
        this.$set(config, 'columns', [])
      }
      return config
    }
  },

  methods: {
    handleTypeChange () {
      this.emitUpdate()
    },

    // select 选项操作
    addOption () {
      this.nodeConfig.options.push({ key: '', label: '' })
    },
    removeOption (index) {
      this.nodeConfig.options.splice(index, 1)
    },

    // form 字段操作
    addField () {
      this.nodeConfig.fields.push({ key: '', label: '', type: 'text', required: false })
    },
    removeField (index) {
      this.nodeConfig.fields.splice(index, 1)
    },

    // form 字段的子选项操作（type=select时）
    addFieldOption (fieldIndex) {
      const field = this.nodeConfig.fields[fieldIndex]
      if (!field.options) {
        this.$set(field, 'options', [])
      }
      field.options.push({ key: '', label: '' })
    },
    removeFieldOption (fieldIndex, optionIndex) {
      this.nodeConfig.fields[fieldIndex].options.splice(optionIndex, 1)
    },

    // table_select 列操作
    addColumn () {
      this.nodeConfig.columns.push({ key: '', label: '', width: null })
    },
    removeColumn (index) {
      this.nodeConfig.columns.splice(index, 1)
    },

    emitUpdate () {
      this.$nextTick(() => {
        this.$root.$emit('workflow:update-node', {
          nodeUuid: this.wfNode.uuid,
          nodeData: this.wfNode
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.human-feedback-node-property {
  padding: 16px 0;

  .property-section {
    margin-top: 24px;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
      color: #303133;
      display: flex;
      align-items: center;
    }
  }

  .sub-section {
    margin-left: 16px;
    padding-left: 12px;
    border-left: 2px solid #E4E7ED;
  }

  .list-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }
}
</style>
