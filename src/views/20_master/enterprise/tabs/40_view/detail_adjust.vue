<template>
  <div class="app-container">
    <div class="edit-container">
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
        <el-descriptions
          title=""
          :column="2"
          :content-style="contentStyle"
          :label-style="labelStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >

          <el-descriptions-item label="统一社会信用代码">
            <el-form-item
              prop="uscc"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.uscc"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="企业名称">
            <el-form-item
              prop="name"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.name"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="曾用名称">
            <el-form-item
              prop="former_name"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.former_name"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="true"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item :label="isUpdateModel?'状态':null">
            {{ dataJson.tempJson.status_name }}
          </el-descriptions-item>

          <el-descriptions-item label="注册资本">
            <el-form-item
              prop="registration_capital"
              label-width="0"
            >
              <numeric
                v-model.trim="dataJson.tempJson.registration_capital"
                :decimal-places="4"
                :currency-symbol="''"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="法定代表人">
            <el-form-item
              prop="legal_person"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.legal_person"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="企业类型">
            <el-checkbox-group v-model="dataJson.tempJson.type_ids">
              <el-checkbox-button
                v-for="item in dataJson.typeListDate"
                :key="item.dict_id"
                :label="item.dict_id"
                :checked="item.checked"
                :disabled="!item.checked"
                @change="changeTypeGroup(item)"
              >
                {{ item.dict_label }}</el-checkbox-button>
            </el-checkbox-group>
          </el-descriptions-item>

          <el-descriptions-item label="成立时间">
            <el-form-item
              prop="registration_date"
              label-width="0"
            >
              <el-date-picker
                v-model="dataJson.tempJson.registration_date"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                clearable
                :disabled="isViewModel"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="公司logo">
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                :span="1"
              >
                <div class="text-center">
                  <cropPrcture
                    v-show="!isViewModel"
                    :accept="'*'"
                    :title="'LOGO上传'"
                    @upload-success="handleLogoUploadFileSuccess"
                    @upload-error="handleFileError"
                  />
                </div>
              </el-col>

              <el-col
                v-for="(item, i) in dataJson.logo"
                :key="i"
                :offset="1"
                :span="3"
              >
                <previewCard
                  :show-delete="false"
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeLogoFile"
                />
              </el-col>
            </el-row></el-descriptions-item>
        </el-descriptions>
        <el-alert
          title="开票信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          title=""
          :column="2"
          :content-style="contentStyle"
          :label-style="labelStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >

          <el-descriptions-item label="开票公司名称">
            <el-form-item
              prop="bill_name"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.bill_name"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="纳税人识别号">
            <el-form-item
              prop="taxpayer_no"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.taxpayer_no"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="开户银行">
            <el-form-item
              prop="bank"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.bank"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="银行账号">
            <el-form-item
              prop="bank_account"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.bank_account"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="开票地址">
            <el-form-item
              prop="bill_address"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.bill_address"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="开票电话">
            <el-form-item
              prop="bill_phone"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.bill_phone"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="电票接受电话">
            <el-form-item
              prop="bill_accept_phone"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.bill_accept_phone"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="电票接受邮箱">
            <el-form-item
              prop="bill_accept_mail"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.bill_accept_mail"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              />
            </el-form-item>
          </el-descriptions-item>
        </el-descriptions>
        <el-alert
          title="联系信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          title=""
          :column="2"
          :content-style="contentStyle"
          :label-style="labelStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >

          <el-descriptions-item label="联系人">
            <el-form-item
              prop="contact_person"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.contact_person"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="联系电话">
            <el-form-item
              prop="contact_phone"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.contact_phone"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="地址">
            <el-form-item
              prop="address"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.address"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item />

          <el-descriptions-item label="备注">
            <el-form-item
              prop="remark"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.remark"
                type="textarea"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="isViewModel"
              />
            </el-form-item>
          </el-descriptions-item>
        </el-descriptions>
        <el-alert
          title="附件信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          title=""
          :column="1"
          :label-style="fileLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="营业执照">
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col :span="1">
                <Simple-upload-mutil-file
                  v-show="!isViewModel"
                  :accept="'*'"
                  @upload-success="handleBusinessLicenseUploadFileSuccess"
                  @upload-error="handleFileError"
                />
              </el-col>
              <el-col
                v-for="(item, i) in dataJson.license_att"
                :key="i"
                :offset="1"
                :span="3"
              >
                <previewCard
                  :show-delete="false"
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeBusinessLicenseFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>
          <el-descriptions-item label="法人身份证正面">
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col :span="1">
                <Simple-upload-mutil-file
                  v-show="!isViewModel"
                  :accept="'*'"
                  @upload-success="handlePositiveIdCardUploadFileSuccess"
                  @upload-error="handleFileError"
                />
              </el-col>
              <el-col
                v-for="(item, i) in dataJson.lr_id_front_att"
                :key="i"
                :offset="1"
                :span="3"
              >
                <previewCard
                  :show-delete="false"
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removePositiveIdCardFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>

          <el-descriptions-item label="法人身份证反面">
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col :span="1">
                <Simple-upload-mutil-file
                  v-show="!isViewModel"
                  :accept="'*'"
                  @upload-success="handleReverseIdCardUploadFileSuccess"
                  @upload-error="handleFileError"
                />
              </el-col>
              <el-col
                v-for="(item, i) in dataJson.lr_id_back_att"
                :key="i"
                :offset="1"
                :span="3"
              >
                <previewCard
                  :show-delete="false"
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeReverseIdCardFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>
          <el-descriptions-item label="其他材料">
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col :span="1">
                <Simple-upload-mutil-file
                  v-show="!isViewModel"
                  :accept="'*'"
                  @upload-success="handleOtherUploadFileSuccess"
                  @upload-error="handleFileError"
                />
              </el-col>
              <el-col
                v-for="(item, i) in dataJson.doc_att"
                :key="i"
                :offset="1"
                :span="3"
              >
                <previewCard
                  :show-delete="false"
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeOtherFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>
        </el-descriptions>
        <div v-if="editStatus === 'audit'">
          <el-alert
            title="审核意见"
            type="info"
            :closable="false"
          />
          <el-descriptions
            title=""
            :column="1"
            :label-style="fileLabelStyle"
            :content-style="contentStyle"
            direction="horizontal"
            border
            style="padding-right: 10px;padding-left: 10px;"
          >
            <el-descriptions-item label="审核意见" style="float: left">

              <el-row style="display: flex;flex-wrap: wrap;">
                <el-col>
                  <el-form-item
                    prop="remark"
                    label-width="0"
                  >
                    <el-input
                      v-model.trim="dataJson.tempJson.audit_opinion"
                      type="textarea"
                      :placeholder="isPlaceholderShow('请输入')"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-form>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />

      <el-button-group
        class="floatLeft"
        style="margin-right:10px"
      />
      <span
        v-if="editStatus === 'audit'"
        class="count floatLeft"
      >
        {{ dataJson.nowCount }} / {{ listCount }}
      </span>
      <el-button-group class="floatRight">
        <el-button
          style="margin-left:10px"
          :disabled="settings.loading"
          size="medium"
          @click="handleCancel()"
        >返回</el-button>
      </el-button-group>

    </div>

  </div>
</template>

<style scoped>
.edit-container {
  height: calc(100vh - 220px);
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
.el-descriptions {
  margin-top: 10px;
  margin-bottom: 10px;
}
.el-button-group {
  margin-top: 10px;
  margin-left: 10px;
}
.el-table {
  margin: 10px;
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
::v-deep .el-tabs__header .el-tabs--card{
  margin: 0 0 0;
}
</style>

<script>
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getTypeApi, getAdjustDetailApi } from '@/api/20_master/enterprise/enterprise.js'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import previewCard from '@/components/50_preview_card/preview_card.vue'
import cropPrcture from '@/components/CropPicture/cropPrcture.vue'
import numeric from '@/components/40_input/numeric/index.vue'

export default {
  components: { numeric, cropPrcture, previewCard, SimpleUploadMutilFile },
  directives: { elDragDialog },
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
      // 监听器
      watch: {
        unwatch_tempJson: null,
        unwatch_actual_count: null,
        unwatch_actual_price: null
      },
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
      popSettingsData: {
        // 弹出窗口状态名称
        dialogStatus: '',
        dialogFormVisible: false
      },
      dataJson: {
        // logo文件文件附件
        logo: [],
        logo_file: [],
        logo_files: [],
        typeListDate: [],
        // 营业执照文件文件附件
        license_att: [],
        license_att_file: [],
        license_att_files: [],
        // 法人身份证正面文件附件
        lr_id_front_att: [],
        lr_id_front_att_file: [],
        lr_id_front_att_files: [],
        // 法人身份证反面文件附件
        lr_id_back_att: [],
        lr_id_back_att_file: [],
        lr_id_back_att_files: [],
        // 其他文件附件
        doc_att: [],
        doc_att_file: [],
        doc_att_files: [],
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
        },
        // 单条数据 json
        tempJson: {
          type_ids: []
        }
      },
      // 页面设置json
      settings: {
        showAudit: false,
        // loading 状态
        loading_prev: true,
        loading_next: true,
        loading_audit: true,
        // loading 状态
        loading: true,
        duration: 4000,
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: this.editStatus,
        // pop的check内容
        rules: {
          owner_name: [
            { required: true, message: '请选择货主', trigger: 'change' }
          ]
        }
      }
    }
  },
  computed: {
    // 总条数
    listCount () {
      if (this.editStatus === 'audit') {
        return this.data.audit_ids.length
      } else {
        return 0
      }
    },
    // 是否为更新模式
    isUpdateModel () {
      if (
        this.settings.dialogStatus === this.PARAMETERS.STATUS_INSERT ||
        this.settings.dialogStatus === this.PARAMETERS.STATUS_COPY_INSERT
      ) {
        return false
      } else {
        return true
      }
    },
    listenVisible () {
      return this.visible
    },
    isViewModel () {
      return true
    }
  },
  // 监听器
  watch: {},
  created () {
    // 初始化页面
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
      this.settings.loading = true
      // 初始化企业类型
      this.initTypeList()
      this.settings.rules = this.settings.rulesOne
      this.initViewModel()
      this.settings.loading = false
    },
    initTypeList () {
      const _this = this
      getTypeApi().then(response => {
        _this.dataJson.typeListDate = _this.dataJson.typeListDate.concat(response.data)
        _this.dataJson.typeListDate.forEach(item => {
          item.checked = false
        })
      })
    },
    // 企业类型选中事件
    changeTypeGroup (val) {
      const _this = this

      if (val.dict_id === null) {
        if (val.checked === true) {
          _this.dataJson.typeListDate.forEach(item => {
            item.checked = false
          })
        } else {
          _this.dataJson.typeListDate.forEach(item => {
            item.checked = true
          })
        }
      } else {
        _this.dataJson.typeListDate.forEach(item => {
          if (item.dict_id === val.dict_id) {
            if (item.checked === true) {
              item.checked = false
            } else {
              item.checked = true
            }
          }
        })
      }

      _this.dataJson.tempJson.type_ids = []
      _this.dataJson.typeListDate.forEach(item => {
        if (item.checked === true && item.dict_id !== 0 && item.dict_id !== null) {
          _this.dataJson.tempJson.type_ids.push(item.dict_id)
        }
      })

      if (_this.dataJson.tempJson.type_ids.length + 1 === _this.dataJson.typeListDate.length) {
        _this.dataJson.tempJson.type_ids.push(0)
      }
    },

    initTempJsonOriginal () {
      // 单条数据 json的，初始化原始数据
      this.dataJson.tempJsonOriginal = this.$options.data.call(this).dataJson.tempJsonOriginal
    },
    initButtonShowStatus () {
      // 初始化按钮状态：默认都隐藏
      this.settings.btnShowStatus = this.$options.data.call(
        this
      ).settings.btnShowStatus
    },
    initButtonDisabledStatus () {
      // 按钮状态初始化：默认不可用
      this.settings.btnDisabledStatus = this.$options.data.call(
        this
      ).settings.btnDisabledStatus
    },
    // 新增时的初始化
    initInsertModel () {
      // 数据初始化
      this.initTempJsonOriginal()
      // this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)

      this.settings.loading = false
      // 设置按钮
      this.settings.btnShowStatus.showInsert = true
    },
    // 更新打开页面
    initUpdateModel () {
      this.getData()
      this.settings.btnShowStatus.showUpdate = true
    },
    // Placeholder设置
    isPlaceholderShow (val) {
      if (this.isViewModel) {
        return ''
      } else {
        return val
      }
    },
    // 查看时的初始化
    initViewModel () {
      this.getData()
    },
    // 审核时的初始化
    initAuditModel () {
      this.getData()
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
      this.$emit('emitReturn')
    },
    // logo上传成功
    handleLogoUploadFileSuccess (val) {
      if (this.dataJson.logo.length > 0) {
        this.dataJson.logo = []
        this.dataJson.logo_file = []
        this.dataJson.logo_files = []
      }

      val.response.data.timestamp = val.response.timestamp
      this.dataJson.logo.push(val.response.data)
      this.dataJson.logo_file.push(val.response.data.url)
      this.dataJson.tempJson.logo_files = this.dataJson.logo
    },
    // 删除logo文件
    removeLogoFile (val) {
      // 获取下标
      const _index = this.dataJson.logo_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.logo.splice(_index, 1)
      this.dataJson.logo_file.splice(_index, 1)
      this.dataJson.tempJson.logo_files = this.dataJson.logo
    },
    // 营业执照上传成功
    handleBusinessLicenseUploadFileSuccess (res) {
      if (this.dataJson.license_att.length > 0) {
        this.dataJson.license_att = []
        this.dataJson.license_att_file = []
        this.dataJson.license_att_files = []
      }

      res.response.data.timestamp = res.response.timestamp
      this.dataJson.license_att.push(res.response.data)
      this.dataJson.license_att_file.push(res.response.data.url)
      this.dataJson.tempJson.license_att_files = this.dataJson.license_att
    },
    // 删除营业执照文件
    removeBusinessLicenseFile (val) {
      // 获取下标
      const _index = this.dataJson.license_att_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.license_att.splice(_index, 1)
      this.dataJson.license_att_file.splice(_index, 1)
      this.dataJson.tempJson.license_att_files = this.dataJson.license_att
    },
    // 身份证正面照文件上传成功
    handlePositiveIdCardUploadFileSuccess (res) {
      if (this.dataJson.lr_id_front_att.length > 0) {
        this.dataJson.lr_id_front_att = []
        this.dataJson.lr_id_front_att_file = []
        this.dataJson.lr_id_front_att_files = []
      }

      res.response.data.timestamp = res.response.timestamp
      this.dataJson.lr_id_front_att.push(res.response.data)
      this.dataJson.lr_id_front_att_file.push(res.response.data.url)
      this.dataJson.tempJson.lr_id_front_att_files = this.dataJson.lr_id_front_att
    },
    // 删除身份证正面照
    removePositiveIdCardFile (val) {
      // 获取下标
      const _index = this.dataJson.lr_id_front_att_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.lr_id_front_att.splice(_index, 1)
      this.dataJson.lr_id_front_att_file.splice(_index, 1)
      this.dataJson.tempJson.lr_id_front_att_files = this.dataJson.lr_id_front_att
    },
    // 身份证反面照上传成功
    handleReverseIdCardUploadFileSuccess (res) {
      if (this.dataJson.lr_id_back_att.length > 0) {
        this.dataJson.lr_id_back_att = []
        this.dataJson.lr_id_back_att_file = []
        this.dataJson.lr_id_back_att_files = []
      }

      res.response.data.timestamp = res.response.timestamp
      this.dataJson.lr_id_back_att.push(res.response.data)
      this.dataJson.lr_id_back_att_file.push(res.response.data.url)
      this.dataJson.tempJson.lr_id_back_att_files = this.dataJson.lr_id_back_att
    },
    // 删除身份证反面照
    removeReverseIdCardFile (val) {
      // 获取下标
      const _index = this.dataJson.lr_id_back_att_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.lr_id_back_att.splice(_index, 1)
      this.dataJson.lr_id_back_att_file.splice(_index, 1)
      this.dataJson.tempJson.lr_id_back_att_files = this.dataJson.lr_id_back_att
    },
    // 其他附件上传成功
    handleOtherUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.doc_att.push(res.response.data)
      this.dataJson.doc_att_file.push(res.response.data.url)
      this.dataJson.tempJson.doc_att_files = this.dataJson.doc_att
    },
    // 其他附件附件文件
    removeOtherFile (val) {
      // 获取下标
      const _index = this.dataJson.doc_att_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.doc_att.splice(_index, 1)
      this.dataJson.doc_att_file.splice(_index, 1)
      this.dataJson.tempJson.doc_att_files = this.dataJson.doc_att
    },
    // 弹出框关闭
    handleDialogClose () {
      this.settings.visible = false
    },
    getData () {
      // 查询逻辑
      this.settings.loading = true
      this.showLoading('正在查询，请稍后...')
      console.log(this.data)
      getAdjustDetailApi(this.data).then(res => {
        this.dataJson.tempJson = deepCopy(res.data)

        // logo附件
        this.dataJson.logo = this.dataJson.tempJson.logo_files
        if (this.dataJson.logo != null && this.dataJson.logo.length > 0) {
          this.dataJson.tempJson.logo_files.forEach(item => {
            this.dataJson.logo_file.push(item.url)
          })
        }

        // 营业执照附件
        this.dataJson.license_att = this.dataJson.tempJson.license_att_files
        if (this.dataJson.license_att != null && this.dataJson.license_att.length > 0) {
          this.dataJson.tempJson.license_att_files.forEach(item => {
            this.dataJson.license_att_file.push(item.url)
          })
        }

        // 法人身份证正面附件
        this.dataJson.lr_id_front_att = this.dataJson.tempJson.lr_id_front_att_files
        if (this.dataJson.lr_id_front_att != null && this.dataJson.lr_id_front_att.length > 0) {
          this.dataJson.tempJson.lr_id_front_att_files.forEach(item => {
            this.dataJson.lr_id_front_att_file.push(item.url)
          })
        }

        // 法人身份证反面附件
        this.dataJson.lr_id_back_att = this.dataJson.tempJson.lr_id_back_att_files
        if (this.dataJson.lr_id_back_att != null && this.dataJson.lr_id_back_att.length > 0) {
          this.dataJson.tempJson.lr_id_back_att_files.forEach(item => {
            this.dataJson.lr_id_back_att_file.push(item.url)
          })
        }

        // 其他附件
        this.dataJson.doc_att = this.dataJson.tempJson.doc_att_files
        if (this.dataJson.doc_att != null && this.dataJson.doc_att.length > 0) {
          this.dataJson.tempJson.doc_att_files.forEach(item => {
            this.dataJson.doc_att_file.push(item.url)
          })
        }

        this.dataJson.typeListDate.forEach(item => {
          if (this.dataJson.tempJson.type_ids != null && this.dataJson.tempJson.type_ids.includes(item.dict_id)) {
            item.checked = true
          } else {
            item.checked = false
          }
        })

        if (this.editStatus === constants_para.STATUS_AUDIT) {
          if (this.dataJson.tempJson.audit_status === 2) {
            this.settings.showAudit = true
          } else {
            this.settings.showAudit = false
          }

          this.settings.showAudit = true
          this.settings.loading_next = false
          this.settings.loading_prev = false
          const { audit_ids } = this.data
          // 上一条下一条按钮
          const index = audit_ids.indexOf(this.data.id)
          this.dataJson.nowCount = index + 1
          if (index !== 0) {
            if (index < audit_ids.length) {
              this.dataJson.tempJson.prev_id = audit_ids[index - 1]
            }
          }
          if (audit_ids.length >= 2) {
            // 如果有两条, 下一条按钮高亮
            if (index < audit_ids.length - 1) {
              this.dataJson.tempJson.next_id = audit_ids[index + 1]
            }
          }
        }
      }).finally(() => {
        this.settings.loading = false
        this.closeLoading()
      })
    },
    // 上传失败
    handleFileError () {
      console.debug('文件上传失败')
      this.$notify({
        title: '上传错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
      })
    }
  }
}
</script>
