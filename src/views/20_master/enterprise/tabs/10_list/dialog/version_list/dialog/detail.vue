<template>
  <div class="app-container">
    <div>
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
        <el-descriptions-item label="统一社会信用代码">
          {{ dataJson.tempJson.uscc }}
        </el-descriptions-item>

        <el-descriptions-item label="企业名称">
          {{ dataJson.tempJson.name }}
        </el-descriptions-item>

        <el-descriptions-item label="曾用名称">
          {{ dataJson.tempJson.former_name }}
        </el-descriptions-item>

        <el-descriptions-item :label="isUpdateModel?'状态':null">
          {{ dataJson.tempJson.status_name }}
        </el-descriptions-item>
        <el-descriptions-item label="企业类型">
          {{ dataJson.tempJson.type_names }}
        </el-descriptions-item>
        <el-descriptions-item label="法定代表人">
          {{ dataJson.tempJson.legal_person }}
        </el-descriptions-item>
        <el-descriptions-item label="注册资本">
          {{ dataJson.tempJson.registration_capital }}
        </el-descriptions-item>
        <el-descriptions-item label="成立时间">
          {{ dataJson.tempJson.est_date == null?'':formatDate(dataJson.tempJson.est_date) }}
        </el-descriptions-item>

        <el-descriptions-item label="公司logo">
          <el-row style="display: flex;flex-wrap: wrap;">
            <el-col
              v-for="(item, i) in dataJson.logo"
              :key="i"
              :offset="1"
              :span="4.5"
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
      <br>
      <el-alert
        title="联系信息"
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

        <el-descriptions-item label="联系人">
          {{ dataJson.tempJson.contact_person }}
        </el-descriptions-item>

        <el-descriptions-item label="联系电话">
          {{ dataJson.tempJson.contact_phone }}
        </el-descriptions-item>

        <el-descriptions-item label="地址">
          {{ dataJson.tempJson.address }}
        </el-descriptions-item>

        <el-descriptions-item />

        <el-descriptions-item label="备注">
          {{ dataJson.tempJson.remark }}
        </el-descriptions-item>

      </el-descriptions>

      <br>
      <el-alert
        title="附件信息"
        type="info"
        :closable="false"
      />
      <br>
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
            <el-col
              v-for="(item, i) in dataJson.license_att"
              :key="i"
              :offset="1"
              :span="4.5"
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
            <el-col
              v-for="(item, i) in dataJson.lr_id_front_att"
              :key="i"
              :offset="1"
              :span="4.5"
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
            <el-col
              v-for="(item, i) in dataJson.lr_id_back_att"
              :key="i"
              :offset="1"
              :span="4.5"
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
            <el-col
              v-for="(item, i) in dataJson.doc_att"
              :key="i"
              :offset="1"
              :span="4.5"
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
      <br>
      <div v-if="editStatus === 'audit'">
        <el-alert
          title="审核意见"
          type="info"
          :closable="false"
        />
        <br>
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
            {{ dataJson.tempJson.audit_opinion }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </div>
</template>

<script>
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getAdjustDetailApi } from '@/api/20_master/enterprise/enterprise.js'
import previewCard from '@/components/50_preview_card/preview_card.vue'

export default {
  components: { previewCard },
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
        duration: 4000,
        // 以下为pop的内容：数据弹出框
        selection: []
      }
    }
  },
  computed: {
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
  },
  mounted () {
    // 描绘完成
    this.init()
  },
  destroyed () {
    this.unWatch()
  },
  methods: {
    // 初始化处理
    init () {
      this.settings.loading = true
      this.getData()
      this.settings.loading = false
    },
    // 设置监听器
    setWatch () {
    },
    unWatch () {
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
    // 删除营业执照文件
    removeBusinessLicenseFile (val) {
      // 获取下标
      const _index = this.dataJson.license_att_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.license_att.splice(_index, 1)
      this.dataJson.license_att_file.splice(_index, 1)
      this.dataJson.tempJson.license_att_files = this.dataJson.license_att
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

<style scoped>

.el-form-item .el-select {
  width: 100%;
}

br {
  display: block;
  margin: 10px;
  content: ' ';
}

::v-deep .el-tabs__header .el-tabs--card{
  margin: 0 0 0;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
</style>
