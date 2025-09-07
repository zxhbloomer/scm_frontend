<template>
  <div>
    <!-- 新增库区弹窗 -->
    <el-dialog
      v-if="visible"
      v-el-drag-dialog
      v-loading="loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      title="新增库区"
      :visible="visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="true"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="850px"
      destroy-on-close
      @close="handleCancel"
    >
      <el-form
        ref="dataForm"
        :rules="formRules"
        :model="formData"
        label-position="right"
        label-width="150px"
        status-icon
      >
        <br>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="仓库名称："
              prop="warehouse_name"
            >
              <el-input
                v-model.trim="formData.warehouse_name"
                disabled
              >
                <el-button
                  slot="append"
                  ref="selectWarehouse"
                  icon="el-icon-search"
                  @click="handleSelectWarehouse"
                >
                  选择
                </el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="库区名称："
              prop="name"
            >
              <el-input
                ref="focusInput"
                v-model.trim="formData.name"
                clearable
                show-word-limit
                :maxlength="maxLength.name"
                placeholder="请输入库区名称"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item
              label="库区简称："
              prop="short_name"
            >
              <el-input
                v-model.trim="formData.short_name"
                clearable
                show-word-limit
                :maxlength="maxLength.short_name"
                placeholder="请输入库区简称"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-divider />
        <el-button
          plain
          type="primary"
          :disabled="loading || !canSubmit"
          @click="handleSubmit"
        >
          确定
        </el-button>
        <el-button
          plain
          :disabled="loading"
          @click="handleCancel"
        >
          取消
        </el-button>
      </div>
    </el-dialog>

    <!-- 仓库选择弹窗 -->
    <warehouse-dialog
      v-if="warehouseDialog.visible"
      :visible="warehouseDialog.visible"
      @closeMeOk="handleWarehouseSelected"
      @closeMeCancel="handleWarehouseCancel"
    />
  </div>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { insertApi } from '@/api/30_wms/location/location'
import warehouseDialog from '@/views/30_wms/warehouse/dialog/10_list/index.vue'

export default {
  name: 'LocationNewDialog',
  components: { warehouseDialog },
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: false,

      // 表单数据
      formData: {
        id: undefined,
        name: '',
        short_name: '',
        warehouse_name: '',
        warehouse_id: undefined
      },

      // 表单验证规则
      formRules: {
        warehouse_name: [
          { required: true, message: '请选择仓库', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入库区名称', trigger: 'blur' },
          { min: 1, max: 20, message: '库区名称长度在1到20个字符', trigger: 'blur' }
        ],
        short_name: [
          { max: 20, message: '库区简称长度不能超过20个字符', trigger: 'blur' }
        ]
      },

      // 输入长度限制
      maxLength: {
        name: 20,
        short_name: 20
      },

      // 仓库选择弹窗
      warehouseDialog: {
        visible: false
      },

      // 监听器
      formWatcher: null
    }
  },
  computed: {
    // 是否可以提交
    canSubmit () {
      return this.formData.warehouse_id && this.formData.name
    }
  },
  watch: {
    visible: {
      handler (newVal) {
        if (newVal) {
          this.initForm()
          this.setupWatcher()
          this.$nextTick(() => {
            if (this.$refs.focusInput) {
              this.$refs.focusInput.focus()
            }
          })
        } else {
          this.destroyWatcher()
        }
      },
      immediate: true
    }
  },
  destroyed () {
    this.destroyWatcher()
  },
  methods: {
    // 初始化表单
    initForm () {
      this.formData = {
        id: undefined,
        name: '',
        short_name: '',
        warehouse_name: '',
        warehouse_id: undefined
      }
      this.loading = false

      // 重置表单验证
      this.$nextTick(() => {
        if (this.$refs.dataForm) {
          this.$refs.dataForm.clearValidate()
        }
      })
    },

    // 设置表单监听器
    setupWatcher () {
      this.destroyWatcher()
      this.formWatcher = this.$watch(
        'formData',
        () => {
          // 表单数据变化时的处理逻辑
        },
        { deep: true }
      )
    },

    // 销毁监听器
    destroyWatcher () {
      if (this.formWatcher) {
        this.formWatcher()
        this.formWatcher = null
      }
    },

    // 选择仓库
    handleSelectWarehouse () {
      this.warehouseDialog.visible = true
    },

    // 仓库选择确认
    handleWarehouseSelected (warehouse) {
      this.formData.warehouse_id = warehouse.id
      this.formData.warehouse_name = warehouse.name
      this.warehouseDialog.visible = false

      // 触发表单验证
      this.$nextTick(() => {
        if (this.$refs.dataForm) {
          this.$refs.dataForm.validateField('warehouse_name')
        }
      })
    },

    // 仓库选择取消
    handleWarehouseCancel () {
      this.warehouseDialog.visible = false
    },

    // 取消
    handleCancel () {
      this.$emit('closeMeCancel')
    },

    // 提交
    handleSubmit () {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          this.doInsert()
        } else {
          this.$message.warning('请检查输入信息')
          return false
        }
      })
    },

    // 执行新增操作
    async doInsert () {
      try {
        this.loading = true
        const submitData = deepCopy(this.formData)

        const response = await insertApi(submitData)

        this.$message.success('新增成功')
        this.$emit('closeMeOk', response.data)
      } catch (error) {
        console.error('新增库区失败:', error)
        this.$message.error(error.message || '新增失败')
        this.$emit('error', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: center;
}

.el-form-item .el-select {
  width: 100%;
}
</style>

<style>
.el-input-group__append_select,
.el-input-group__append {
  color: #ffffff;
  background-color: #1890ff;
  border-color: #1890ff;
}
</style>
