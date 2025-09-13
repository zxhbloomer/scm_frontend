<template>
  <!-- 编辑规格弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    :title="getDialogTitle()"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="850px"
    destroy-on-close
  >
    <el-form
      ref="dataSubmitForm"
      :rules="settings.rules"
      :model="dataJson.tempJson"
      label-position="right"
      label-width="150px"
      status-icon
      :disabled="isViewModel"
    >
      <el-alert
        title="基本信息"
        type="info"
        :closable="false"
      />
      <br>

      <el-descriptions
        title=""
        :column="2"
        :content-style="contentStyle"
        :label-style="labelStyle"
        direction="horizontal"
        border
        style="padding-right: 10px;padding-left: 10px;"
      >

        <el-descriptions-item>
          <div
            slot="label"
            class="required-mark"
          >
            所属类别
          </div>
          <el-form-item
            prop="category_name"
            label-width="0"
          >
            <input-search
              v-model.trim="dataJson.tempJson.category_name"
              :disabled="isViewModel"
              @onInputSearch="handleCategoryDialog"
            />
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item>
          <div
            slot="label"
            class="required-mark"
          >
            物料名称
          </div>
          <el-form-item
            prop="name"
            label-width="0"
          >
            <el-input
              ref="refFocusOne"
              v-model.trim="dataJson.tempJson.name"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.name"
              :placeholder="isPlaceholderShow('请输入物料名称')"
              :disabled="isViewModel"
            />
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item>
          <div
            slot="label"
            class="required-mark"
          >
            商品属性
          </div>
          <el-form-item
            prop="prop_name"
            label-width="0"
          >
            <el-select
              v-model.trim="dataJson.tempJson.prop_name"
              placeholder="商品属性"
              clearable
              filterable
              :disabled="isViewModel"
              @change="selectProp"
            >
              <el-option
                v-for="item in dataJson.propList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item>
          <div
            slot="label"
            class="required-mark"
          >
            规格
          </div>
          <el-form-item
            prop="spec"
            label-width="0"
          >
            <el-input
              v-model.trim="dataJson.tempJson.spec"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.spec"
              :placeholder="isPlaceholderShow('请输入规格')"
              :disabled="isViewModel"
            />
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item>
          <div
            slot="label"
          >
            规格编号
          </div>
          <el-form-item
            prop="sku_code"
            label-width="0"
          >
            <el-input
              v-model.trim="dataJson.tempJson.sku_code"
              clearable
              show-word-limit
              :maxlength="dataJson.inputSettings.maxLength.sku_code"
              :placeholder="isPlaceholderShow('请输入规格编号')"
              :disabled="isViewModel"
            />
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item>
          <div
            slot="label"
          >
            启用状态
          </div>
          <el-form-item
            prop="enable"
            label-width="0"
          >
            <el-switch
              v-model="dataJson.tempJson.enable"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="true"
              :inactive-value="false"
              :disabled="isViewModel"
            />
          </el-form-item>
        </el-descriptions-item>

      </el-descriptions>

      <!-- 扩展信息区域 -->
      <el-alert
        title="扩展信息"
        type="info"
        :closable="false"
        style="margin-top: 20px;"
      />
      <br>

      <el-descriptions
        title=""
        :column="3"
        :content-style="contentStyle"
        :label-style="labelStyle"
        direction="horizontal"
        border
        style="padding-right: 10px;padding-left: 10px;"
      >
        <el-descriptions-item>
          <div slot="label">净重</div>
          <el-form-item
            prop="net_weight"
            label-width="0"
          >
            <el-input
              v-model.trim="dataJson.tempJson.net_weight"
              clearable
              :placeholder="isPlaceholderShow('请输入净重')"
              :disabled="isViewModel"
            />
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item>
          <div slot="label">毛重</div>
          <el-form-item
            prop="rough_weight"
            label-width="0"
          >
            <el-input
              v-model.trim="dataJson.tempJson.rough_weight"
              clearable
              :placeholder="isPlaceholderShow('请输入毛重')"
              :disabled="isViewModel"
            />
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item>
          <div slot="label">体积</div>
          <el-form-item
            prop="volume"
            label-width="0"
          >
            <el-input
              v-model.trim="dataJson.tempJson.volume"
              clearable
              :placeholder="isPlaceholderShow('请输入体积')"
              :disabled="isViewModel"
            />
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item>
          <div slot="label">单位</div>
          <el-form-item
            prop="unit"
            label-width="0"
          >
            <select-dict
              v-model="dataJson.tempJson.unit"
              :para="CONSTANTS.DICT_M_UNIT"
              init-placeholder="请选择单位"
              :disabled="isViewModel"
            />
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item>
          <div slot="label">产地</div>
          <el-form-item
            prop="origin"
            label-width="0"
          >
            <el-input
              v-model.trim="dataJson.tempJson.origin"
              clearable
              :placeholder="isPlaceholderShow('请输入产地')"
              :disabled="isViewModel"
            />
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item />
      </el-descriptions>
    </el-form>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        v-if="!isViewModel"
        plain
        type="primary"
        :disabled="settings.loading"
        @click="doSubmit()"
      >确定</el-button>
      <el-button
        plain
        :disabled="settings.loading"
        @click="handleCancel()"
      >{{ isViewModel ? '关闭' : '取消' }}</el-button>
    </div>

    <!-- 级联选择对话框 -->
    <category-dialog
      v-if="popSettingsData.searchDialogDataThree.visible"
      :visible="popSettingsData.searchDialogDataThree.visible"
      @closeMeOk="handleCategoryCloseOk"
      @closeMeCancel="handleCategoryCloseCancel"
    />
  </el-dialog>
</template>

<style scoped>
.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}
.dialog-footer {
  text-align: center;
}
.el-form-item .el-select {
  width: 100%;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
</style>

<script>
import { updateApi } from '@/api/30_wms/spec/spec'
import { getListApi as getPropListApi } from '@/api/30_wms/prop/prop'
import deepCopy from 'deep-copy'
import elDragDialog from '@/directive/el-drag-dialog'
import InputSearch from '@/components/40_input/inputSearch'
import SelectDict from '@/components/00_dict/select/SelectDict'
import CategoryDialog from '@/views/30_wms/category/dialog/10_list/index'

export default {
  name: 'SpecEditDialog',
  directives: { elDragDialog },
  components: {
    InputSearch,
    SelectDict,
    CategoryDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    id: {
      type: [String, Number],
      default: undefined
    },
    data: {
      type: Object,
      default: () => ({})
    },
    dialogStatus: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      dataJson: {
        tempJson: {},
        propList: [], // 商品属性下拉框
        inputSettings: {
          maxLength: {
            name: 100,
            prop_name: 100,
            spec: 200,
            sku_code: 50,
            net_weight: 20,
            rough_weight: 20,
            volume: 20,
            origin: 50
          }
        }
      },
      settings: {
        loading: false,
        rules: {
          category_name: [
            { required: true, message: '请选择所属类别', trigger: 'blur' }
          ],
          name: [
            { required: true, message: '请输入物料名称', trigger: 'blur' },
            { max: 100, message: '物料名称不能超过100个字符', trigger: 'blur' }
          ],
          prop_name: [
            { required: true, message: '请选择商品属性', trigger: 'blur' }
          ],
          spec: [
            { required: true, message: '请输入规格', trigger: 'blur' },
            { max: 200, message: '规格不能超过200个字符', trigger: 'blur' }
          ],
          sku_code: [
            { max: 50, message: '规格编号不能超过50个字符', trigger: 'blur' }
          ]
        }
      },
      // 级联选择对话框状态
      popSettingsData: {
        searchDialogDataThree: {
          visible: false,
          selectedDataJson: {}
        }
      },
      // 样式设置
      contentStyle: {
        'background-color': '#f0f0f0',
        'padding': '10px'
      },
      labelStyle: {
        'font-weight': 'bold',
        'width': '120px'
      }
    }
  },
  computed: {
    isViewModel () {
      return this.dialogStatus === this.PARAMETERS.STATUS_VIEW
    }
  },
  watch: {
    visible: {
      handler (newVal) {
        if (newVal) {
          this.init()
        }
      },
      immediate: true
    }
  },
  created () {
    // 初始化商品属性下拉框
    this.getPropList()
  },
  methods: {
    init () {
      this.dataJson.tempJson = deepCopy(this.data)

      // 设置级联选择的选中状态
      if (this.data.category_id) {
        this.popSettingsData.searchDialogDataThree.selectedDataJson = {
          id: this.data.category_id
        }
      }

      // 设置焦点
      if (!this.isViewModel) {
        this.$nextTick(() => {
          if (this.$refs.refFocusOne) {
            this.$refs.refFocusOne.focus()
          }
        })
      }
    },

    getDialogTitle () {
      switch (this.dialogStatus) {
        case this.PARAMETERS.STATUS_UPDATE:
          return '规格编辑'
        case this.PARAMETERS.STATUS_VIEW:
          return '规格查看'
        case this.PARAMETERS.STATUS_COPY_INSERT:
          return '规格复制新增'
        default:
          return '规格操作'
      }
    },

    // Placeholder设置
    isPlaceholderShow (val) {
      if (this.isViewModel) {
        return ''
      } else {
        return val
      }
    },

    // 类别选择对话框
    handleCategoryDialog () {
      this.popSettingsData.searchDialogDataThree.visible = true
    },
    handleCategoryCloseOk (data) {
      this.popSettingsData.searchDialogDataThree.visible = false
      this.popSettingsData.searchDialogDataThree.selectedDataJson = data

      // 设置类别信息
      this.dataJson.tempJson.category_id = data.id
      this.dataJson.tempJson.category_code = data.code
      this.dataJson.tempJson.category_name = data.name
    },
    handleCategoryCloseCancel () {
      this.popSettingsData.searchDialogDataThree.visible = false
    },

    // 商品属性选择
    selectProp (val) {
      this.dataJson.tempJson.prop_id = val
      const prop = this.dataJson.propList.find((item) => {
        return item.id === val
      })
      if (prop) {
        this.dataJson.tempJson.prop_name = prop.name
        this.dataJson.tempJson.prop_id = prop.id
      }
    },

    // 查询商品属性列表
    getPropList () {
      this.settings.loading = true
      const searchForm = { pageCondition: {}}
      getPropListApi(searchForm).then(response => {
        this.dataJson.propList = response.data
      }).finally(() => {
        this.settings.loading = false
      })
    },

    doSubmit () {
      this.$refs.dataSubmitForm.validate((valid) => {
        if (valid) {
          this.settings.loading = true
          updateApi(this.dataJson.tempJson).then((response) => {
            this.$emit('closeMeOk', {
              return_flag: true,
              data: response
            })
          }).catch((error) => {
            this.$emit('closeMeOk', {
              return_flag: false,
              error: error
            })
          }).finally(() => {
            this.settings.loading = false
          })
        }
      })
    },

    handleCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>
