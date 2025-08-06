<template>
  <div class="app-container">
    <div>
      <el-form
        ref="dataSubmitForm"
        :rules="settings.rules"
        :model="dataJson.tempJson"
        label-position="right"
        label-width="150px"
        status-icon
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
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item label="主体企业">
            {{ dataJson.tempJson.enterprise_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              账户编码
            </div>
            <el-form-item
              prop="code"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.code"
                clearable
                show-word-limit
                :maxlength="dataJson.inputSettings.maxLength.code"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              账户名称
            </div>
            <el-form-item
              prop="name"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.name"
                clearable
                show-word-limit
                :maxlength="dataJson.inputSettings.maxLength.name"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item />

          <el-descriptions-item label="银行账号">
            <el-form-item
              prop="account_number"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.account_number"
                clearable
                show-word-limit
                :maxlength="dataJson.inputSettings.maxLength.account_number"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="开户名">
            <el-form-item
              prop="holder_name"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.holder_name"
                clearable
                show-word-limit
                :maxlength="dataJson.inputSettings.maxLength.holder_name"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="开户行">
            <el-form-item
              prop="bank_name"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.bank_name"
                clearable
                show-word-limit
                :maxlength="dataJson.inputSettings.maxLength.bank_name"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item v-model.trim="dataJson.tempJson.currency" label="币别">RMB</el-descriptions-item>

          <el-descriptions-item label="默认账户">
            <el-form-item
              prop="is_default"
              label-width="0"
            >
              <el-checkbox v-model="dataJson.tempJson.is_default" :true-label="1" :false-label="0" :checked="false">默认账户</el-checkbox>
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="启用/禁用">
            <el-form-item
              prop="status"
              label-width="0"
            >
              <el-switch
                v-model="dataJson.tempJson.status"
                active-color="#ff4949"
                inactive-color="#13ce66"
                :active-value="0"
                :inactive-value="1"
                :width="30"
                :value="1"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item span="2">
            <div
              slot="label"
              class="required-mark"
            >
              账户类型
            </div>
            <el-form-item
              prop="bank_type"
              label-width="0"
            >
              <el-checkbox-group v-model="dataJson.tempJson.bank_type">
                <el-checkbox-button
                  v-for="item in dataJson.bankTypeOptions"
                  :key="item.code"
                  :label="item.code"
                >{{ item.name }}</el-checkbox-button>
              </el-checkbox-group>
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="备注" span="2">
            <el-form-item
              prop="remark"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.remarks"
                type="textarea"
                clearable
                show-word-limit
                :maxlength="dataJson.inputSettings.maxLength.remarks"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-descriptions-item>

        </el-descriptions>

      </el-form>
    </div>
    <br>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />

      <el-button
        v-show="settings.btnShowStatus.showUpdate"
        size="medium"
        type="primary"
        :disabled="settings.loading"
        @click="handleStart()"
      >保存</el-button>
      <el-button
        size="medium"
        :disabled="settings.loading"
        @click="handleCancel()"
      >取消</el-button>
    </div>

  </div>
</template>

<style scoped>
.edit-container {
  overflow-x: auto;
}
.dialog-footer {
  text-align: center;
}
.floatRight {
  float: right;
}
.floatLeft {
  float: left;
}
.el-form-item .el-select {
  width: 100%;
}
.el-input-group__append_select,
.el-input-group__append {
  color: #ffffff;
  background-color: #1890ff;
  border-color: #1890ff;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}
br {
  display: block;
  margin: 10px;
  content: ' ';
}
.form-items-container {
  display: flex;
  align-items: center;
}

.left-side {
  flex: 9; /* 或者你想要的更高的值，表示左边占据较多的空间 */
}

.right-side {
  flex: 1; /* 或者你想要的更低的值，表示右边占据较少的空间 */
  margin-left: 5px;
}
</style>

<script>
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getApi, updateApi, validateApi } from '@/api/20_master/bankaccounts/bankaccounts'
import { selectListDataApi } from '@/api/10_system/dictdata/dictdata'
import constants_dict from '@/common/constants/constants_dict'
import { EventBus } from '@/common/eventbus/eventbus'
export default {
  directives: { elDragDialog },
  components: { },
  mixins: [],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    id: {
      type: Number,
      default: null
    },
    data: {
      type: Object,
      default: null
    },
    editStatus: {
      type: String,
      default: constants_para.STATUS_INSERT
    }
  },
  data () {
    return {
      contentStyle: {
        width: '15%'
      },
      labelStyle: {
        width: '10%',
        'text-align': 'right'
      },
      fileLabelStyle: {
        width: '2.3%',
        'text-align': 'right'
      },
      // 监听器
      watch: {
        unwatch_tempJson: null,
        unwatch_actual_count: null,
        unwatch_actual_price: null,
        'dataJson.tempJson.unit_id': {
          handler (newVal, oldVal) {
            console.log(newVal)
          }
        }
      },
      popSettingsData: {
        // 弹出窗口状态名称
        dialogStatus: '',
        dialogFormVisible: false,
        btnDisabledStatus: {
          disabledOK: false
        }
      },
      dataJson: {
        unitConvertList: [],
        // 账户类型选项
        bankTypeOptions: [],
        // 用于监听
        actual_count: 0,
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          is_default: 0,
          link_status: 0,
          currency: 'RMB',
          bank_type: []
        },
        // 单条数据 json
        tempJson: {},
        searchForm: {
          reset: false,
          owner_id: undefined,
          owner_name: ''
        },
        inputSettings: {
          maxLength: {
            code: 20,
            name: 20,
            account_number: 20,
            holder_name: 20,
            bank_name: 20,
            remarks: 500
          }
        }
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        btnUnitStatus: {
          // 关于单位的按钮显示
          showUnit: false,
          showInsert: false
        },
        // 按钮是否显示，默认不显示，false：不显示，true：显示
        btnShowStatus: {
          showInsert: false,
          showUpdate: false
        },
        // 按钮状态：是否可用，false:可用，true不可用
        btnDisabledStatus: {
          disabledInsert: true,
          disabledUpdate: true
        },
        // 按钮状态：是否可用，false:可用，true不可用
        btnTableDisabledStatus: {
          disabledInsert: true,
          disabledUpdate: true,
          disabledDelete: true
        },
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: this.editStatus,
        // pop的check内容
        rules: {
          code: [
            { required: true, message: '请填写账户编码', trigger: 'change' }
          ],
          name: [
            { required: true, message: '请填写账户名称', trigger: 'change' }
          ],
          bank_type: [
            {
              required: true,
              type: 'array',
              min: 1,
              message: '请至少选择一个账户类型',
              trigger: 'change'
            }
          ]
        }
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    }
  },
  // 监听器
  watch: {},
  created () {
    this.init()
  },
  mounted () {
    // 描绘完成
  },
  destroyed () {
    this.unWatch()
  },
  methods: {
    // 初始化处理
    init () {
      this.initButtonShowStatus()
      this.initButtonDisabledStatus()
      this.initUpdateModel()
      this.loadBankTypes()

      // 初始化watch
      this.setWatch()
      this.settings.loading = false
    },
    initTempJsonOriginal () {
      // 单条数据 json的，初始化原始数据
      this.dataJson.tempJsonOriginal = this.$options.data.call(this).dataJson.tempJsonOriginal
    },
    initButtonShowStatus () {
      // 初始化按钮状态：默认都隐藏
      this.settings.btnShowStatus = this.$options.data.call(this).settings.btnShowStatus
    },
    initButtonDisabledStatus () {
      // 按钮状态初始化：默认不可用
      this.settings.btnDisabledStatus = this.$options.data.call(this).settings.btnDisabledStatus
    },
    // 修改时的初始化
    initUpdateModel () {
      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.data)
      this.dataJson.tempJsonOriginal = deepCopy(this.data)
      this.getData()

      // 设置按钮
      this.settings.btnShowStatus.showUpdate = true
    },
    getData () {
      // 查询逻辑
      this.settings.loading = true
      getApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.tempJsonOriginal = deepCopy(response.data)
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 加载银行账户类型选项
    loadBankTypes () {
      const params = {
        dictTypeCode: constants_dict.DICT_M_BANK_TYPE,
        is_del: 0
      }
      selectListDataApi(params).then(response => {
        this.dataJson.bankTypeOptions = response.data.map(item => ({
          code: item.dict_value,
          name: item.label
        }))
      }).catch(error => {
        console.error('获取银行账户类型失败:', error)
      })
    },
    // 设置监听器
    setWatch () {
      this.unWatch()
      // 监听页面上面是否有修改，有修改按钮高亮
      this.watch.unwatch_tempJson = this.$watch(
        'dataJson.tempJson',
        (newVal, oldVal) => {
          this.settings.btnDisabledStatus.disabledInsert = false
          this.settings.btnDisabledStatus.disabledUpdate = false
        },
        { deep: true }
      )
    },
    unWatch () {
      if (this.watch.unwatch_tempJson) {
        this.watch.unwatch_tempJson()
      }
      if (this.watch.unwatch_actual_count) {
        this.watch.unwatch_actual_count()
      }
      if (this.watch.unwatch_actual_price) {
        this.watch.unwatch_actual_price()
      }
    },
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 新增
    doUpdate () {
      // 开始综合验证
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)

          this.settings.loading = true
          updateApi(tempData).then(
            _data => {
              this.closeLoading()
              this.$emit('closeMeOk', _data.data)
              // 通知兄弟组件，新增数据更新
              EventBus.$emit(this.EMITS.EMIT_MST_BANK_ACCOUNTS_UPDATE_OK, _data.data)
              this.$notify({
                title: '新增成功',
                message: _data.data.message,
                type: 'success',
                duration: this.settings.duration
              })
            },
            _error => {
              this.closeLoading()
              this.$notify({
                title: '新增失败',
                message: _error.error.message,
                type: 'error',
                duration: this.settings.duration
              })
            }
          )
            .finally(() => {
              this.$emit('closeMeCancel')
              this.closeLoading()
            })
        } else {
          this.$emit('closeMeCancel')
          this.closeLoading()
        }
      })
    },
    handleRowClick (row) {
      this.popSettingsData.goodsDialog.rowIndex = this.getRowIndex(row)
    },
    // 获取行索引
    getRowIndex (row) {
      const _index = this.dataJson.tempJson.detailListData.lastIndexOf(row)
      return _index
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
      this.settings.btnTableDisabledStatus.disabledInsert = false
      this.settings.btnTableDisabledStatus.disabledUpdate = false
      this.settings.btnTableDisabledStatus.disabledDelete = false
    },

    /**
     * 校验数据
     */
    handleStart () {
      this.showLoading('正在查询，请稍后...')
      // 校验业务数据
      const tempData = deepCopy(this.dataJson.tempJson)
      tempData.check_type = constants_para.UPDATE_CHECK_TYPE

      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          validateApi(tempData).then(_data => {
            if (_data.success) {
              // 保存数据
              this.doUpdate()
            } else {
              this.closeLoading()
              this.$notify({
                title: '校验失败',
                message: _data.data.message,
                type: 'error',
                duration: this.settings.duration
              })
            }
          }).catch(error => {
            console.log('校验出错', error)
            this.closeLoading()
          })
        } else {
          this.closeLoading()
        }
      })
    }
  }

}
</script>
