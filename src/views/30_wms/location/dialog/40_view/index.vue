<template>
  <div>
    <!-- 查看库区弹窗 -->
    <el-dialog
      v-if="visible"
      v-el-drag-dialog
      v-loading="loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      title="查看库区"
      :visible="visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="true"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="850px"
      destroy-on-close
      @close="handleClose"
    >
      <el-form
        ref="dataForm"
        :model="formData"
        label-position="right"
        label-width="150px"
      >
        <br>
        <el-row>
          <el-col :span="12">
            <el-form-item label="仓库名称：">
              <span class="view-field">{{ formData.warehouse_name }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库区名称：">
              <span class="view-field">{{ formData.name }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="库区简称：">
              <span class="view-field">{{ formData.short_name }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态：">
              <el-tag
                v-if="formData.status !== undefined"
                :type="formData.status === 1 ? 'success' : 'danger'"
              >
                {{ formData.status === 1 ? '启用' : '禁用' }}
              </el-tag>
              <span v-else>暂无</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="showExtendedInfo">
          <el-col :span="12">
            <el-form-item label="创建时间：">
              <span class="view-field">{{ formatDateTime(formData.c_time) }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="修改时间：">
              <span class="view-field">{{ formatDateTime(formData.u_time) }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="showExtendedInfo">
          <el-col :span="12">
            <el-form-item label="创建人：">
              <span class="view-field">{{ formData.c_name }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="修改人：">
              <span class="view-field">{{ formData.u_name }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="formData.remark">
          <el-col :span="24">
            <el-form-item label="备注：">
              <span class="view-field remark-field">{{ formData.remark }}</span>
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
          @click="handleClose"
        >
          关闭
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'

export default {
  name: 'LocationViewDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
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
        warehouse_id: undefined,
        status: undefined,
        c_time: '',
        u_time: '',
        c_name: '',
        u_name: '',
        remark: '',
        dbversion: undefined
      }
    }
  },
  computed: {
    // 是否显示扩展信息(创建时间、修改时间等)
    showExtendedInfo () {
      return this.formData.c_time || this.formData.u_time || this.formData.c_name || this.formData.u_name
    }
  },
  watch: {
    visible: {
      handler (newVal) {
        if (newVal) {
          this.initForm()
        }
      },
      immediate: true
    },

    data: {
      handler (newVal) {
        if (newVal && this.visible) {
          this.initForm()
        }
      },
      immediate: true
    }
  },
  methods: {
    // 初始化表单
    initForm () {
      if (this.data) {
        this.formData = deepCopy(this.data)
      } else {
        this.formData = {
          id: undefined,
          name: '',
          short_name: '',
          warehouse_name: '',
          warehouse_id: undefined,
          status: undefined,
          c_time: '',
          u_time: '',
          c_name: '',
          u_name: '',
          remark: '',
          dbversion: undefined
        }
      }

      this.loading = false
    },

    // 关闭弹窗
    handleClose () {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: center;
}

.el-form-item .el-input {
  width: 100%;
}

.el-form-item .el-textarea {
  width: 100%;
}

/* 查看页面纯文本显示样式 */
.view-field {
  display: block;
  padding: 11px 15px;
  line-height: 1.4;
  color: #606266;
  font-size: 14px;
  word-wrap: break-word;
}

.remark-field {
  min-height: 84px;
  white-space: pre-wrap;
}
</style>
