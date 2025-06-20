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

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              统一社会信用代码</div>

            <el-form-item
              prop="uscc"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.uscc"
                :placeholder="isPlaceholderShow('请输入')"
                :disabled="true"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="">

            <div
              slot="label"
              class="required-mark"
            >
              企业名称</div>
            <el-form-item
              prop="name"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.name"
                :placeholder="isPlaceholderShow('请输入')"
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
                :placeholder="isPlaceholderShow()"
                :disabled="true"
              />
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
            >
              状态</div>
            {{ dataJson.tempJson.status_name }}
          </el-descriptions-item>
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              企业类型</div>
            <el-form-item
              prop="type_ids"
              label-width="0"
            >
              <el-checkbox-group v-model="dataJson.tempJson.type_ids">
                <el-checkbox-button
                  v-for="item in dataJson.typeListDate"
                  :key="item.dict_id"
                  :label="item.dict_id"
                  :checked="item.checked"
                  @change="changeTypeGroup(item)"
                >
                  {{ item.dict_label }}</el-checkbox-button>
              </el-checkbox-group>
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
              />
            </el-form-item>
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
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="成立时间">
            <el-form-item
              prop="est_date"
              label-width="0"
            >
              <el-date-picker
                v-model="dataJson.tempJson.est_date"
                type="date"
                clearable
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
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeLogoFile"
                />
              </el-col>
            </el-row></el-descriptions-item>
        </el-descriptions>
        <!--        <br>-->
        <!--        <el-alert-->
        <!--          title="开票信息"-->
        <!--          type="info"-->
        <!--          :closable="false"-->
        <!--        />-->
        <!--        <br>-->
        <!--        <el-descriptions-->
        <!--          title=""-->
        <!--          :column="2"-->
        <!--          :content-style="contentStyle"-->
        <!--          :label-style="labelStyle"-->
        <!--          direction="horizontal"-->
        <!--          border-->
        <!--          style="padding-right: 10px;padding-left: 10px;"-->
        <!--        >-->

        <!--          <el-descriptions-item label="开票公司名称">-->
        <!--            <el-form-item-->
        <!--              prop="bill_name"-->
        <!--              label-width="0"-->
        <!--            >-->
        <!--              <el-input-->
        <!--                v-model.trim="dataJson.tempJson.bill_name"-->
        <!--                :placeholder="isPlaceholderShow('请输入')"-->
        <!--                :disabled="isViewModel"-->
        <!--              />-->
        <!--            </el-form-item>-->
        <!--          </el-descriptions-item>-->

        <!--          <el-descriptions-item label="纳税人识别号">-->
        <!--            <el-form-item-->
        <!--              prop="taxpayer_no"-->
        <!--              label-width="0"-->
        <!--            >-->
        <!--              <el-input-->
        <!--                v-model.trim="dataJson.tempJson.taxpayer_no"-->
        <!--                :placeholder="isPlaceholderShow('请输入')"-->
        <!--                :disabled="isViewModel"-->
        <!--              />-->
        <!--            </el-form-item>-->
        <!--          </el-descriptions-item>-->

        <!--          <el-descriptions-item label="开户银行">-->
        <!--            <el-form-item-->
        <!--              prop="bank"-->
        <!--              label-width="0"-->
        <!--            >-->
        <!--              <el-input-->
        <!--                v-model.trim="dataJson.tempJson.bank"-->
        <!--                :placeholder="isPlaceholderShow('请输入')"-->
        <!--                :disabled="isViewModel"-->
        <!--              />-->
        <!--            </el-form-item>-->
        <!--          </el-descriptions-item>-->

        <!--          <el-descriptions-item label="银行账号">-->
        <!--            <el-form-item-->
        <!--              prop="bank_account"-->
        <!--              label-width="0"-->
        <!--            >-->
        <!--              <el-input-->
        <!--                v-model.trim="dataJson.tempJson.bank_account"-->
        <!--                :placeholder="isPlaceholderShow('请输入')"-->
        <!--                :disabled="isViewModel"-->
        <!--              />-->
        <!--            </el-form-item>-->
        <!--          </el-descriptions-item>-->

        <!--          <el-descriptions-item label="开票地址">-->
        <!--            <el-form-item-->
        <!--              prop="bill_address"-->
        <!--              label-width="0"-->
        <!--            >-->
        <!--              <el-input-->
        <!--                v-model.trim="dataJson.tempJson.bill_address"-->
        <!--                :placeholder="isPlaceholderShow('请输入')"-->
        <!--                :disabled="isViewModel"-->
        <!--              />-->
        <!--            </el-form-item>-->
        <!--          </el-descriptions-item>-->

        <!--          <el-descriptions-item label="开票电话">-->
        <!--            <el-form-item-->
        <!--              prop="bill_phone"-->
        <!--              label-width="0"-->
        <!--            >-->
        <!--              <el-input-->
        <!--                v-model.trim="dataJson.tempJson.bill_phone"-->
        <!--                :placeholder="isPlaceholderShow('请输入')"-->
        <!--                :disabled="isViewModel"-->
        <!--              />-->
        <!--            </el-form-item>-->
        <!--          </el-descriptions-item>-->

        <!--          <el-descriptions-item label="电票接受电话">-->
        <!--            <el-form-item-->
        <!--              prop="bill_accept_phone"-->
        <!--              label-width="0"-->
        <!--            >-->
        <!--              <el-input-->
        <!--                v-model.trim="dataJson.tempJson.bill_accept_phone"-->
        <!--                :placeholder="isPlaceholderShow('请输入')"-->
        <!--                :disabled="isViewModel"-->
        <!--              />-->
        <!--            </el-form-item>-->
        <!--          </el-descriptions-item>-->

        <!--          <el-descriptions-item label="电票接受邮箱">-->
        <!--            <el-form-item-->
        <!--              prop="bill_accept_mail"-->
        <!--              label-width="0"-->
        <!--            >-->
        <!--              <el-input-->
        <!--                v-model.trim="dataJson.tempJson.bill_accept_mail"-->
        <!--                :placeholder="isPlaceholderShow('请输入')"-->
        <!--                :disabled="isViewModel"-->
        <!--              />-->
        <!--            </el-form-item>-->
        <!--          </el-descriptions-item>-->

        <!--        </el-descriptions>-->
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
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeOtherFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>
        </el-descriptions>
      </el-form>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />

      <el-button
        type="primary"
        :disabled="settings.loading"
        size="medium"
        @click="handlestartProcessAndSave()"
      >提交审批并保存</el-button>
      <el-button
        :disabled="settings.loading"
        size="medium"
        @click="handleCancel()"
      >返回</el-button>
    </div>

    <!-- 审批流程设置：选择人 -->
    <bpm_dialog
      v-if="popSettingsData.sponsorDialog.visible"
      :visible="popSettingsData.sponsorDialog.visible"
      :form-data="popSettingsData.sponsorDialog.form_data"
      :serial-type="CONSTANTS.DICT_M_ENTERPRISE"
      @closeMeCancel="handleBpmDialogCancel"
      @closeMeOk="handleBpmDialogOk"
    />

  </div>
</template>

<script>
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import {
  getDetailApi,
  getTypeApi,
  updateApi,
  validateApi
} from '@/api/20_master/enterprise/enterprise.js'

import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import previewCard from '@/components/50_preview_card/preview_card.vue'
import cropPrcture from '@/components/CropPicture/cropPrcture.vue'
import numeric from '@/components/40_input/numeric/index.vue'
import bpm_dialog from '@/components/60_bpm/submitBpmDialog.vue'
import constants_dict from '@/common/constants/constants_dict'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  components: { bpm_dialog, numeric, cropPrcture, previewCard, SimpleUploadMutilFile },
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
    },
    modifyReason: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      // 监听器
      watch: {
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
        dialogFormVisible: false,
        // 审批流程
        sponsorDialog: {
          // 弹出框显示参数
          visible: false,
          form_data: { },
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          },
          // 审批流程
          initial_process: null,
          // 自选用户
          process_users: {}
        }
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
        // 单条数据 json
        tempJson: {
          type_ids: []
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
        duration: 4000,
        // 以下为pop的内容：数据弹出框
        selection: [],
        // pop的check内容
        rules: {
          uscc: [
            { required: true, message: '请输入统一社会信用代码', trigger: 'change' }
          ],
          name: [
            { required: true, message: '请输入企业名称', trigger: 'change' }
          ],
          type_ids: [
            { required: true, message: '请输入企业类型', trigger: 'change' }
          ]
        }
      }
    }
  },
  computed: {
    constants_dict () {
      return constants_dict
    },
    listenVisible () {
      return this.visible
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
    async init () {
      // 初始化企业类型
      this.initTypeList()
      this.getData()
      // 初始化watch
      this.setWatch()
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
    // Placeholder设置
    isPlaceholderShow (val) {
      return val
    },
    // 设置监听器
    setWatch () {
      this.unWatch()
    },
    unWatch () {
    },
    /**
     * 取消按钮
     */
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    /**
     * 校验数据 获取审批流程
     */
    handlestartProcessAndSave () {
      this.showLoading('正在保存，请稍后...')
      // 校验业务数据
      const tempData = deepCopy(this.dataJson.tempJson)
      tempData.check_type = constants_para.UPDATE_CHECK_TYPE
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          validateApi(tempData).then(_data => {
            if (_data.success) {
              this.getFlow()
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
    },
    /**
     * 获取审批流程
     */
    getFlow () {
      // 校验是否存在审批流程
      getFlowProcessApi({ 'serial_type': constants_dict.DICT_M_ENTERPRISE })
        .then((rsp) => {
          // 流程分支参数
          this.popSettingsData.sponsorDialog.form_data = { }
          // 启动审批流弹窗
          this.popSettingsData.sponsorDialog.visible = true
        })
        .catch((err) => {
          this.closeLoading()
          this.$message.error(err)
        })
    },
    // 更新逻辑
    doUpdate () {
      // 开始综合验证
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          this.settings.loading = true
          const tempData = deepCopy(this.dataJson.tempJson)
          // 审批流程启动数据
          tempData.initial_process = this.popSettingsData.sponsorDialog.initial_process // 流程
          tempData.form_data = this.popSettingsData.sponsorDialog.form_data // 表单参数
          tempData.process_users = this.popSettingsData.sponsorDialog.process_users // 自选用户
          tempData.modify_reason = this.modifyReason
          console.log(tempData)
          this.settings.loading = true
          updateApi(tempData)
            .then(
              _data => {
                this.closeLoading()
                this.$emit('closeMeOk', _data.data)
                // 通知兄弟组件，新增数据更新
                EventBus.$emit(this.EMITS.EMIT_MST_ENTERPRISE_UPDATE_OK, _data.data)
                this.$notify({
                  title: '修改处理成功',
                  message: _data.message,
                  type: 'success',
                  duration: this.settings.duration
                })
              },
              _error => {
                this.closeLoading()
                this.$notify({
                  title: '修改处理失败',
                  message: _error.message,
                  type: 'error',
                  duration: this.settings.duration
                })
              }
            )
            .finally(() => {
              this.closeLoading()
            })
        } else {
          this.closeLoading()
        }
      })
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
      // 数据初始化
      getDetailApi(this.data).then(res => {
        this.dataJson.tempJson = deepCopy(res.data)

        // logo附件
        this.dataJson.logo = this.dataJson.tempJson.logo_files
        if (this.dataJson.logo != null && this.dataJson.logo.length > 0) {
          this.dataJson.tempJson.logo_files.forEach(item => {
            this.dataJson.logo_file.push(item.url)
          })
        } else {
          this.dataJson.logo = []
          this.dataJson.logo_file = []
          this.dataJson.logo_files = []
        }

        // 营业执照附件
        this.dataJson.license_att = this.dataJson.tempJson.license_att_files
        if (this.dataJson.license_att != null && this.dataJson.license_att.length > 0) {
          this.dataJson.tempJson.license_att_files.forEach(item => {
            this.dataJson.license_att_file.push(item.url)
          })
        } else {
          this.dataJson.license_att = []
          this.dataJson.license_att_file = []
          this.dataJson.license_att_files = []
        }

        // 法人身份证正面附件
        this.dataJson.lr_id_front_att = this.dataJson.tempJson.lr_id_front_att_files
        if (this.dataJson.lr_id_front_att != null && this.dataJson.lr_id_front_att.length > 0) {
          this.dataJson.tempJson.lr_id_front_att_files.forEach(item => {
            this.dataJson.lr_id_front_att_file.push(item.url)
          })
        } else {
          this.dataJson.lr_id_front_att = []
          this.dataJson.lr_id_front_att_file = []
          this.dataJson.lr_id_front_att_files = []
        }

        // 法人身份证反面附件
        this.dataJson.lr_id_back_att = this.dataJson.tempJson.lr_id_back_att_files
        if (this.dataJson.lr_id_back_att != null && this.dataJson.lr_id_back_att.length > 0) {
          this.dataJson.tempJson.lr_id_back_att_files.forEach(item => {
            this.dataJson.lr_id_back_att_file.push(item.url)
          })
        } else {
          this.dataJson.lr_id_back_att = []
          this.dataJson.lr_id_back_att_file = []
          this.dataJson.lr_id_back_att_files = []
        }

        // 其他附件
        this.dataJson.doc_att = this.dataJson.tempJson.doc_att_files
        if (this.dataJson.doc_att != null && this.dataJson.doc_att.length > 0) {
          this.dataJson.tempJson.doc_att_files.forEach(item => {
            this.dataJson.doc_att_file.push(item.url)
          })
        } else {
          this.dataJson.doc_att = []
          this.dataJson.doc_att_file = []
          this.dataJson.doc_att_files = []
        }

        this.dataJson.typeListDate.forEach(item => {
          if (this.dataJson.tempJson.type_ids != null && this.dataJson.tempJson.type_ids.includes(item.dict_id)) {
            item.checked = true
          } else {
            item.checked = false
          }
        })
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
    },
    // 取消
    handleBpmDialogCancel () {
      this.popSettingsData.sponsorDialog.visible = false
      this.closeLoading()
    },
    // 审批流确定
    handleBpmDialogOk (data) {
      this.popSettingsData.sponsorDialog.initial_process = data.processData
      this.popSettingsData.sponsorDialog.process_users = data.process_users
      this.popSettingsData.sponsorDialog.visible = false

      // 判断执行新增，修改
      this.doUpdate()
    }
  }
}
</script>
<style scoped>
.edit-container {
  height: calc(100vh - 160px);
  overflow-x: auto;
}
.dialog-footer {
  text-align: center;
}
.el-form-item .el-select {
  width: 100%;
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
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
</style>
