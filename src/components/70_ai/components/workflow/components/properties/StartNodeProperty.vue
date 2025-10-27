<template>
  <div class="start-node-property">
    <!-- 开场白 -->
    <div class="property-section">
      <div class="section-title">开场白</div>
      <el-input
        v-model="nodeConfig.prologue"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 6 }"
        placeholder="请输入开场白"
      />
    </div>

    <!-- 输入列表 -->
    <el-collapse :value="['inputs']" class="inputs-collapse">
      <el-collapse-item name="inputs">
        <template slot="title">
          <span class="collapse-title">输入</span>
        </template>

        <el-table
          :data="wfNode.inputConfig.user_inputs"
          border
          stripe
          size="small"
        >
          <el-table-column prop="name" label="变量名" min-width="120" />
          <el-table-column prop="title" label="标题" min-width="120" />
          <el-table-column label="类型" min-width="80">
            <template slot-scope="scope">
              {{ getInputTypeName(scope.row.type) }}
            </template>
          </el-table-column>
          <el-table-column label="必填" min-width="60" align="center">
            <template slot-scope="scope">
              {{ scope.row.required ? '是' : '否' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template slot-scope="scope">
              <el-button
                type="text"
                icon="el-icon-edit"
                @click="handleEdit(scope.row)"
              />
              <el-button
                type="text"
                icon="el-icon-delete"
                style="color: #f56c6c;"
                @click="handleDelete(scope.row)"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>
    </el-collapse>

    <!-- 新增按钮 -->
    <el-button
      type="primary"
      icon="el-icon-plus"
      plain
      style="margin-top: 12px; width: 100%;"
      @click="handleAdd"
    >
      新增输入
    </el-button>

    <!-- 编辑对话框 -->
    <el-dialog
      v-if="dialogVisible"
      v-el-drag-dialog
      :visible="dialogVisible"
      title="变量设置"
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="true"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="600px"
      destroy-on-close
      top="5vh"
      @close="handleClose"
    >
      <el-form ref="formRef" :model="tmpItem" :rules="formRules" label-width="120px">
        <el-form-item label="类型" prop="type">
          <el-select v-model="tmpItem.type" placeholder="请选择类型">
            <el-option label="文本" :value="1" />
            <el-option label="数字" :value="2" />
            <el-option label="文件" :value="4" />
            <el-option label="布尔值" :value="5" />
          </el-select>
        </el-form-item>

        <el-form-item label="名称" prop="name">
          <el-input
            v-model="tmpItem.name"
            maxlength="50"
            show-word-limit
            placeholder="请输入变量名称"
          />
        </el-form-item>

        <el-form-item label="标题（显示名称）" prop="title">
          <el-input
            v-model="tmpItem.title"
            maxlength="50"
            show-word-limit
            placeholder="请输入标题"
          />
        </el-form-item>

        <el-form-item label="是否必须">
          <el-switch v-model="tmpItem.required" />
        </el-form-item>

        <el-form-item v-if="tmpItem.type === 3" label="多选">
          <el-switch v-model="tmpItem.multiple" />
        </el-form-item>

        <el-form-item v-if="tmpItem.type === 4" label="最大文件数量">
          <el-input-number v-model="tmpItem.limit" :min="1" :max="10" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :disabled="!submitEnabled" @click="handleSubmit">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { nanoid } from 'nanoid'
import { getNameByInputType } from '@/components/70_ai/components/workflow/utils'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'StartNodeProperty',

  directives: { elDragDialog },

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

  data () {
    return {
      dialogVisible: false,
      tmpItem: {
        uuid: '',
        type: 1,
        name: '',
        title: '',
        required: false,
        limit: 10,
        multiple: false
      },
      formRules: {
        name: [
          { required: true, message: '请输入变量名称', trigger: 'blur' }
        ],
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择类型', trigger: 'change' }
        ]
      }
    }
  },

  computed: {
    nodeConfig () {
      if (!this.wfNode.nodeConfig.prologue) {
        this.$set(this.wfNode.nodeConfig, 'prologue', '')
      }
      return this.wfNode.nodeConfig
    },

    submitEnabled () {
      return this.tmpItem.name && this.tmpItem.title
    }
  },

  methods: {
    getInputTypeName (type) {
      return getNameByInputType(type)
    },

    handleAdd () {
      this.tmpItem = {
        uuid: nanoid(32).replace(/-/g, ''),
        type: 1,
        name: '',
        title: '',
        required: false,
        limit: 10,
        multiple: false
      }
      this.dialogVisible = true
    },

    handleEdit (row) {
      const index = this.wfNode.inputConfig.user_inputs.findIndex(item => item.uuid === row.uuid)
      if (index > -1) {
        this.tmpItem = { ...this.wfNode.inputConfig.user_inputs[index] }
        this.dialogVisible = true
      }
    },

    handleDelete (row) {
      const index = this.wfNode.inputConfig.user_inputs.findIndex(item => item.uuid === row.uuid)
      if (index > -1) {
        this.$store.commit('ai/workflow/DELETE_USER_INPUT', {
          wfUuid: this.workflow.workflowUuid,
          nodeUuid: this.wfNode.uuid,
          idx: index
        })
      }
    },

    handleSubmit () {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          const index = this.wfNode.inputConfig.user_inputs.findIndex(item => item.uuid === this.tmpItem.uuid)
          if (index > -1) {
            // 编辑模式
            Object.assign(this.wfNode.inputConfig.user_inputs[index], { ...this.tmpItem })
          } else {
            // 新增模式
            this.$store.commit('ai/workflow/ADD_USER_INPUT_TO_NODE', {
              wfUuid: this.workflow.workflowUuid,
              nodeUuid: this.wfNode.uuid,
              newInput: { ...this.tmpItem }
            })
          }

          this.handleClose()
        }
      })
    },

    handleClose () {
      this.dialogVisible = false
      this.tmpItem = {
        uuid: '',
        type: 1,
        name: '',
        title: '',
        required: false,
        limit: 10,
        multiple: false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.start-node-property {
  padding: 16px 0;

  .property-section {
    margin-bottom: 20px;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
      color: #303133;
    }
  }

  .inputs-collapse {
    margin-bottom: 12px;

    .collapse-title {
      font-size: 16px;
      font-weight: 500;
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>
