<template>
  <el-dialog
    v-if="listenVisible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="新增员工"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="1300px"
    destroy-on-close
  >
    <el-tabs
      :value="settings.tabName"
      style="height: 600px"
      @tab-click="handleTabsClick"
    >
      <!-- 基本信息 -->
      <el-tab-pane name="tab1">
        <template slot="label">基本信息
          <el-badge
            v-show="settings.badge.countOne > 0"
            :value="settings.badge.countOne"
            type="danger"
          />
        </template>
        <el-form
          ref="baseForm"
          :model="dataJson.tempJson"
          :rules="settings.rulesOne"
          label-position="right"
          label-width="120px"
          status-icon
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="员工姓名：" prop="name">
                <el-input
                  ref="refFocusOne"
                  v-model.trim="dataJson.tempJson.name"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.name"
                  :placeholder="isPlaceholderShow('请输入')"
                  :disabled="isViewModel"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="员工姓名拼音：" prop="name_py">
                <el-input
                  v-model.trim="dataJson.tempJson.name_py"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.name_py"
                  :placeholder="isPlaceholderShow('请输入')"
                  :disabled="isViewModel"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="身份证号码：" prop="id_card">
                <el-input
                  v-model.trim="dataJson.tempJson.id_card"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.id_card"
                  :placeholder="isPlaceholderShow('请输入')"
                  :disabled="isViewModel"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="护照号码：" prop="passport">
                <el-input
                  v-model.trim="dataJson.tempJson.passport"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.passport"
                  :placeholder="isPlaceholderShow('请输入')"
                  :disabled="isViewModel"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="民族：" prop="nation">
                <el-input
                  v-model.trim="dataJson.tempJson.nation"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.nation"
                  :placeholder="isPlaceholderShow('请输入')"
                  :disabled="isViewModel"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="生日：" prop="birthday">
                <el-date-picker
                  v-model="dataJson.tempJson.birthday"
                  value-format="yyyy-MM-dd"
                  type="date"
                  clearable
                  :placeholder="isPlaceholderShow('请输入')"
                  style="width: 100%"
                  :disabled="isViewModel"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="性别：" prop="sex">
                <radio-dict
                  v-model="dataJson.tempJson.sex"
                  :para="CONSTANTS.DICT_SYS_SEX_TYPE"
                  :disabled="isViewModel"
                  @change="handleSexDictChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="在职情况：" prop="service">
                <select-dict
                  v-model="dataJson.tempJson.service"
                  :para="CONSTANTS.DICT_USR_SERVICE_TYPE"
                  init-placeholder="请选择在职情况"
                  :disabled="isViewModel"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="婚否：" prop="is_wed">
                <radio-dict
                  v-model="dataJson.tempJson.is_wed"
                  :para="CONSTANTS.DICT_USR_WED_TYPE"
                  :disabled="isViewModel"
                  @change="handleWedDictChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="学历：" prop="degree">
                <select-dict
                  v-model="dataJson.tempJson.degree"
                  :para="CONSTANTS.DICT_USR_DEGREE_TYPE"
                  init-placeholder="请选择学历情况"
                  :disabled="isViewModel"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="7">
              <el-form-item label="身份证正面照片：">
                <preview-card
                  :show-update="true"
                  :data="dataJson.tempJson.one_fileVo"
                  :title="'身份证正面照片'"
                  style="width: 200px;"
                  @upload-success="uploadSuccessOne"
                />
              </el-form-item>
            </el-col>
            <el-col :span="7" :offset="5">
              <el-form-item label="身份证背面照片：">
                <preview-card
                  :show-update="true"
                  :title="'身份证背面照片'"
                  :data="dataJson.tempJson.two_fileVo"
                  style="width: 200px;"
                  @upload-success="uploadSuccessTwo"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>

      <!-- 联系方式 -->
      <el-tab-pane name="tab2">
        <template slot="label">联系方式
          <el-badge
            v-show="settings.badge.countFour > 0"
            :value="settings.badge.countFour"
            type="danger"
          />
        </template>
        <el-form
          ref="contactForm"
          :model="dataJson.tempJson"
          :rules="settings.rulesFour"
          label-position="right"
          label-width="120px"
          status-icon
        >
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="家庭电话："
                prop="home_phone"
              >
                <el-input
                  v-model.trim="dataJson.tempJson.home_phone"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.home_phone"
                  :placeholder="isPlaceholderShow('请输入')"
                  :disabled="isViewModel"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="办公室电话："
                prop="office_phone"
              >
                <el-input
                  v-model.trim="dataJson.tempJson.office_phone"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.office_phone"
                  :placeholder="isPlaceholderShow('请输入')"
                  :disabled="isViewModel"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="手机号码："
                prop="mobile_phone"
              >
                <el-input
                  v-model.trim="dataJson.tempJson.mobile_phone"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.mobile_phone"
                  :placeholder="isPlaceholderShow('请输入')"
                  :disabled="isViewModel"
                  @blur="handleChangePhone"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="手机备用号码："
                prop="mobile_phone_backup"
              >
                <el-input
                  v-model.trim="dataJson.tempJson.mobile_phone_backup"
                  clearable
                  show-word-limit
                  :maxlength="
                    dataJson.inputSettings.maxLength.mobile_phone_backup
                  "
                  :placeholder="isPlaceholderShow('请输入')"
                  :disabled="isViewModel"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="邮箱地址："
                prop="email"
              >
                <el-input
                  v-model.trim="dataJson.tempJson.email"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.email"
                  :placeholder="isPlaceholderShow('请输入')"
                  :disabled="isViewModel"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="邮箱备用地址："
                prop="email_backup"
              >
                <el-input
                  v-model.trim="dataJson.tempJson.email_backup"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.maxLength.email_backup"
                  :placeholder="isPlaceholderShow('请输入')"
                  :disabled="isViewModel"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>

      <!-- 登录账号信息 -->
      <el-tab-pane name="tab3">
        <template slot="label">登录账号信息
          <el-badge
            v-show="settings.badge.countTwo > 0"
            :value="settings.badge.countTwo"
            type="danger"
          />
        </template>
        <el-form
          ref="loginForm"
          :model="dataJson.tempJson"
          :rules="rulesTwo"
          label-position="right"
          label-width="120px"
          status-icon
        >
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="开启账号登录："
                prop="is_enable"
              >
                <el-switch
                  v-model="dataJson.tempJson.user.is_enable"
                  active-text="开启"
                  inactive-text="关闭"
                  :disabled="isViewModel"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" />
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="登录模式："
                prop="login_type"
              >
                <radio-dict
                  v-model="dataJson.tempJson.user.login_type"
                  :para="CONSTANTS.DICT_SYS_LOGIN_TYPE"
                  :disabled="!isAccountLoginType || isViewModel"
                  @change="handleSysLoginTypeChange"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item
                label="登录用户名："
                prop="user.login_name"
              >
                <el-input
                  v-model.trim="dataJson.tempJson.user.login_name"
                  clearable
                  show-word-limit
                  :maxlength="dataJson.inputSettings.user.maxLength.login_name"
                  :placeholder="isPlaceholderShow('请输入')"
                  :disabled="!isAccountLoginType || isViewModel"
                  @blur="handleChangeLoginName"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="设置密码："
                prop=""
              >
                <el-button
                  type="primary"
                  icon="el-icon-unlock"
                  :disabled="!isAccountLoginType || isViewModel"
                  @click="handleSetPassword"
                >设置密码</el-button>
                <el-tag
                  v-show="
                    !(
                      dataJson.tempJson.user.pwd === '' ||
                      dataJson.tempJson.user.pwd === null ||
                      dataJson.tempJson.user.pwd === undefined
                    )
                  "
                  type="success"
                  effect="dark"
                >已设置密码</el-tag>
                <el-tag
                  v-show="
                    dataJson.tempJson.user.pwd === '' ||
                      dataJson.tempJson.user.pwd === null ||
                      dataJson.tempJson.user.pwd === undefined
                  "
                  type="danger"
                  effect="dark"
                >未设置密码</el-tag>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-form-item
              label="生效日期区间："
              prop=""
            >
              <el-date-picker
                v-model="dataJson.tempJson.user.datetimerange"
                type="datetimerange"
                :picker-options="settings.pickerOptions"
                range-separator="至"
                start-placeholder="生效开始日期"
                end-placeholder="生效结束日期"
                align="right"
                style="width: 100%"
                :disabled="!isAccountLoginType || isViewModel"
              />
            </el-form-item>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item
                label="登录用户类型："
                prop="type"
              >
                <select-dict
                  v-model="dataJson.tempJson.user.type"
                  :para="CONSTANTS.DICT_USR_LOGIN_TYPE"
                  init-placeholder="请选择登录用户类型"
                  :disabled="!isAccountLoginType || isViewModel"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="是否删除："
                prop="is_del"
              >
                <el-switch
                  v-model="dataJson.tempJson.user.is_del"
                  active-color="#ff4949"
                  inactive-color="#dcdfe6"
                  active-text="已删除"
                  inactive-text="未删除"
                  :disabled="!isAccountLoginType || isViewModel"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item
                label="用户锁定时间："
                prop="locked_time"
              >
                <el-date-picker
                  v-model="dataJson.tempJson.user.locked_time"
                  value-format="yyyy-MM-dd"
                  type="date"
                  clearable
                  :placeholder="isPlaceholderShow('选择日期')"
                  style="width: 100%"
                  :disabled="!isAccountLoginType || isViewModel"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="是否锁定："
                prop="is_lock"
              >
                <el-switch
                  v-model="dataJson.tempJson.user.is_lock"
                  active-color="#ff4949"
                  inactive-color="#dcdfe6"
                  active-text="已锁定"
                  inactive-text="未锁定"
                  :disabled="!isAccountLoginType || isViewModel"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item
                label="登录错误次数："
                prop="err_count"
              >
                <el-input
                  v-model.trim="dataJson.tempJson.user.err_count"
                  disabled
                  placeholder="[无]"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="是否修改过密码："
                prop="is_changed_pwd"
              >
                <el-switch
                  v-model="dataJson.tempJson.user.is_changed_pwd"
                  active-color="#ff4949"
                  inactive-color="#dcdfe6"
                  active-text="已修改"
                  inactive-text="未修改"
                  :disabled="!isAccountLoginType || isViewModel"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item
                label="最后登录时间："
                prop="last_login_date"
              >
                <el-date-picker
                  v-model="dataJson.tempJson.user.last_login_date"
                  type="datetime"
                  disabled
                  placeholder="[无]"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="最后登出时间："
                prop="last_logout_date"
              >
                <el-date-picker
                  v-model="dataJson.tempJson.user.last_logout_date"
                  type="datetime"
                  disabled
                  placeholder="[无]"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item
            label="说明："
            prop="descr"
          >
            <el-input
              v-model.trim="dataJson.tempJson.user.descr"
              clearable
              show-word-limit
              type="textarea"
              :maxlength="dataJson.inputSettings.maxLength.descr"
              :placeholder="isPlaceholderShow('请输入')"
              :disabled="isViewModel"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 所属信息 -->
      <el-tab-pane name="tab4">
        <template slot="label">所属信息
          <el-badge
            v-show="settings.badge.countThree > 0"
            :value="settings.badge.countThree"
            type="danger"
          />
        </template>
        <el-form
          ref="orgForm"
          :model="dataJson.tempJson"
          :rules="settings.rulesThree"
          label-position="right"
          label-width="120px"
          status-icon
        >
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="所属公司："
                prop="company_name"
              >
                <el-popover
                  v-model="settings.popover.visible"
                  placement="top"
                  width="200"
                  trigger="manual"
                >
                  <p>您修改了所属公司，请您重新选择默认部门！</p>
                  <div style="text-align: right; margin: 0">
                    <el-button
                      type="primary"
                      size="mini"
                      @click="settings.popover.visible = false"
                    >确定</el-button>
                  </div>
                  <select-company-dept
                    v-if="!isCompanyReadonly"
                    slot="reference"
                    v-model.trim="dataJson.tempJson.company_name"
                    :placeholder="isPlaceholderShow('请选择所属公司')"
                    :type="CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY"
                    :current-id="dataJson.tempJson.company_id"
                    :disabled="isViewModel"
                    @closeParentDialog="handleDialogClose"
                    @onReturnData="handleCompanyReturnData"
                  />
                  <el-input
                    v-else
                    slot="reference"
                    v-model.trim="dataJson.tempJson.company_name"
                    :placeholder="isPlaceholderShow('从组织树自动获取')"
                    readonly
                    disabled
                  />
                </el-popover>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="默认部门："
                prop="dept_name"
              >
                <select-company-dept
                  v-if="!isDepartmentReadonly"
                  v-model.trim="dataJson.tempJson.dept_name"
                  :placeholder="isPlaceholderShow('请选择默认部门')"
                  :type="CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT"
                  :current-id="dataJson.tempJson.dept_id"
                  :disabled="isViewModel"
                  :parent-id="dataJson.tempJson.company_id"
                  @closeParentDialog="handleDialogClose"
                  @onReturnData="handleDeptReturnData"
                />
                <el-input
                  v-else
                  v-model.trim="dataJson.tempJson.dept_name"
                  :placeholder="isPlaceholderShow('从组织树自动获取')"
                  readonly
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="岗位信息：">
                <template>
                  <div
                    v-show="positionIsShow()"
                    class="el-input-tag input-tag-wrapper"
                  >
                    <el-popconfirm
                      v-for="item in dataJson.tempJson.positions"
                      :key="item.position_id"
                      confirm-button-text="确定"
                      cancel-button-text="取消"
                      icon="el-icon-info"
                      icon-color="red"
                      title="点击确定后跳转到岗位页面，请注意保存当前数据。"
                      @confirm="handlePositionClick(item.position_name)"
                    >
                      <el-tag
                        slot="reference"
                        class="position_tag"
                      >
                        {{ item.position_name }}
                      </el-tag>
                    </el-popconfirm>
                  </div>
                  <div v-show="!positionIsShow()">
                    <el-input
                      value="[无岗位]"
                      disabled
                      placeholder="[无岗位]"
                    />
                  </div>
                </template>
              </el-form-item>
            </el-col>
            <el-col :span="12" />
          </el-row>
        </el-form>
      </el-tab-pane>

    </el-tabs>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        v-show="settings.btnShowStatus.showInsert && !isViewModel"
        plain
        type="primary"
        :disabled="settings.loading || settings.btnDisabledStatus.disabledInsert"
        @click="doInsert()"
      >确定</el-button>
      <el-button
        plain
        :disabled="settings.loading"
        @click="handleCancel()"
      >取消</el-button>
    </div>
  </el-dialog>
</template>

<style scoped>
.floatRight {
  float: right;
}
.floatLeft {
  float: left;
}
.el-form-item .el-select {
  width: 100%;
}
/* 岗位管理样式 */
.position_tag {
  margin-right: 8px;
  margin-bottom: 4px;
  cursor: pointer;
}
.input-tag-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  min-height: 32px;
  line-height: 24px;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import { insertApi } from '@/api/20_master/staff/staff'
import SelectCompanyDept from '@/views/20_master/staff/component/selectgrid/companyDept'
import PreviewCard from '@/components/50_preview_card/preview_card_new'
import deepCopy from 'deep-copy'
import RadioDict from '@/components/00_dict/redio'
import SelectDict from '@/components/00_dict/select/SelectDict'

export default {
  name: 'NewDialog',
  components: { SelectCompanyDept, PreviewCard, RadioDict, SelectDict },
  directives: { elDragDialog },
  props: {
    // 页面是否显示参数
    visible: {
      type: Boolean,
      default: false
    },
    // 组织上下文信息（从组织树传递）
    organizationContext: {
      type: Object,
      default: () => ({
        selectedNode: null,
        companyInfo: null,
        departmentInfo: null
      })
    }
  },
  data () {
    return {
      dataJson: {
        // 表单数据
        tempJson: {
          one_fileVo: {},
          two_fileVo: {},
          id: undefined,
          name: '',
          name_py: '',
          code: '',
          descr: '',
          sex: '',
          birthday: '',
          passport: '',
          nation: '',
          service: '',
          is_wed: '',
          degree: '',
          id_card: '',
          mobile_phone: '',
          home_phone: '',
          office_phone: '',
          mobile_phone_backup: '',
          email: '',
          email_backup: '',
          address: '',
          user: {
            is_enable: true,
            login_type: '',
            login_name: '',
            pwd: '',
            type: '',
            is_del: false,
            is_lock: false,
            locked_time: '',
            last_login_date: '',
            last_logout_date: '',
            is_changed_pwd: false,
            err_count: '',
            datetimerange: [],
            descr: ''
          },
          company_id: null,
          company_name: '',
          company_simple_name: '',
          dept_id: null,
          dept_name: '',
          entry_date: '',
          staff_status: 'active',
          positions: [],
          permissionTreeData: null,
          role_ids: []
        },
        // 输入长度限制
        inputSettings: {
          maxLength: {
            name: 20,
            name_py: 20,
            id_card: 25,
            passport: 20,
            nation: 20,
            home_phone: 15,
            office_phone: 15,
            mobile_phone: 15,
            mobile_phone_backup: 15,
            email: 20,
            email_backup: 20,
            descr: 200
          },
          user: {
            maxLength: {
              login_name: 20,
              descr: 200
            }
          }
        },
        // 角色树数据
        roleTreeData: [],
        roleTreeProps: {
          children: 'children',
          label: 'name'
        }
      },
      // 页面设置json
      settings: {
        popover: {
          visible: false,
          companyDisplayValue: '',
          pendingCompanyData: null
        },
        // loading 状态
        loading: false,
        // 按钮是否显示，默认不显示，false：不显示，true：显示
        btnShowStatus: {
          showInsert: true,
          showUpdate: false,
          showCopyInsert: false
        },
        // 按钮状态：是否可用，false:可用，true不可用
        btnDisabledStatus: {
          disabledReset: true,
          disabledInsert: false,
          disabledUpdate: true,
          disabledCopyInsert: true
        },
        // 表单验证规则
        rules: {},
        // 基本信息栏目check
        rulesOne: {
          name: [{ required: true, message: '请输入员工姓名', trigger: 'change' }],
          id_card: [
            // { required: true, message: '请输入身份证号', trigger: 'change' }
            // { pattern: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '身份证号格式不正确', trigger: 'blur' }
          ]
        },
        // rulesTwo 改为动态计算，基于是否开启账户登录
        // rulesTwo: {
        //   'user.login_name': [{ required: true, message: '请输入登录用户名', trigger: 'change' }]
        // },
        rulesThree: {
          dept_id: [{ required: true, message: '请选择默认部门', trigger: 'change' }],
          company_name: [{ required: true, message: '请选择所属公司', trigger: 'change' }]
        },
        rulesFour: {
          mobile_phone: [
            // { required: true, message: '请输入手机号', trigger: 'change' },
            { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
          ],
          email: [
            { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '邮箱格式不正确', trigger: 'blur' }
          ],
          email_backup: [
            { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '邮箱格式不正确', trigger: 'blur' }
          ]
        },
        // 错误数目
        badge: {
          countOne: 0,
          countTwo: 0,
          countThree: 0,
          countFour: 0
        },
        // 选中的标签页
        tabName: 'tab1',
        duration: 4000,
        // 日期选择器配置
        pickerOptions: {
          shortcuts: [{
            text: '今天',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近一周',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近三个月',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }]
        }
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    },
    // 判断登录类型是否为账号登录
    isAccountLoginType () {
      return this.dataJson.tempJson.user.is_enable === true
    },
    // 判断登录是否启用
    isLoginEnabled () {
      return this.dataJson.tempJson.user.is_enable === true
    },
    // 判断是否为查看模式（新增弹窗始终为false）
    isViewModel () {
      return false
    },
    // 动态计算登录账号信息验证规则
    rulesTwo () {
      if (this.dataJson.tempJson.user.is_enable) {
        // 开启账户登录时，登录用户名为必填
        return {
          'user.login_name': [{ required: true, message: '请输入登录用户名', trigger: 'change' }]
        }
      } else {
        // 未开启账户登录时，登录用户名非必填
        return {
          'user.login_name': []
        }
      }
    },
    // 判断是否设置了密码（新增弹窗需要设置密码）
    isPsdSetUp () {
      return this.dataJson.tempJson.password && this.dataJson.tempJson.password.length > 0
    },
    // 判断是否为更新模式（新增弹窗始终为false）
    isUpdateModel () {
      return false
    },
    // 判断是否有组织上下文信息
    hasOrganizationContext () {
      return this.organizationContext &&
             (this.organizationContext.companyInfo || this.organizationContext.departmentInfo)
    },
    // 判断公司字段是否应该只读（从组织上下文获取时）
    isCompanyReadonly () {
      return this.hasOrganizationContext && this.organizationContext.companyInfo
    },
    // 判断部门字段是否应该只读（从组织上下文获取时）
    isDepartmentReadonly () {
      return this.hasOrganizationContext && this.organizationContext.departmentInfo
    }
  },
  // 监听器
  watch: {
    // 监听开启账户登录状态变化
    'dataJson.tempJson.user.is_enable' (newVal, oldVal) {
      if (this.$refs.loginForm) {
        this.$nextTick(() => {
          if (!newVal) {
            // 当关闭账户登录时，清除登录用户名的验证错误
            this.$refs.loginForm.clearValidate(['user.login_name'])
          } else {
            // 当开启账户登录时，重新验证登录用户名字段
            this.$refs.loginForm.validateField('user.login_name')
          }
          // 更新错误计数
          this.updateErrorCounts()
        })
      }
    },
    // 监听页面是否打开
    listenVisible: {
      handler (newVal, oldVal) {
        if (newVal) {
          this.init()
        }
      },
      deep: true,
      immediate: true
    }
  },
  created () {
    // 设置当前打开的页面
  },
  methods: {
    init () {
      // 重置表单数据 - 使用正确的嵌套结构
      this.dataJson.tempJson = {
        one_fileVo: {},
        two_fileVo: {},
        id: undefined,
        name: '',
        name_py: '',
        code: '',
        descr: '',
        sex: '',
        birthday: '',
        passport: '',
        nation: '',
        service: '',
        is_wed: '',
        degree: '',
        id_card: '',
        mobile_phone: '',
        home_phone: '',
        office_phone: '',
        mobile_phone_backup: '',
        email: '',
        email_backup: '',
        address: '',
        user: {
          is_enable: true,
          login_type: '',
          login_name: '',
          pwd: '',
          type: '',
          is_del: false,
          locked_time: '',
          last_login_date: '',
          last_logout_date: '',
          is_changed_pwd: false,
          datetimerange: [],
          descr: ''
        },
        company_id: null,
        company_name: '',
        company_simple_name: '',
        dept_id: null,
        dept_name: '',
        entry_date: '',
        staff_status: 'active',
        positions: [],
        permissionTreeData: null,
        role_ids: []
      }

      // 重置错误计数
      this.dataJson.errorsCount = {
        baseErrors: 0,
        contactErrors: 0,
        loginErrors: 0,
        orgErrors: 0,
        permissionErrors: 0
      }

      // 重置Badge计数
      this.settings.badge = {
        countOne: 0,
        countTwo: 0,
        countThree: 0,
        countFour: 0
      }

      this.settings.loading = false
      this.settings.btnShowStatus.showInsert = true
      this.settings.btnDisabledStatus.disabledInsert = false

      // 应用组织上下文信息
      this.applyOrganizationContext()
    },

    // 应用组织上下文信息到表单字段
    applyOrganizationContext () {
      if (!this.hasOrganizationContext) {
        return
      }

      // 应用公司信息
      if (this.organizationContext.companyInfo) {
        this.dataJson.tempJson.company_id = this.organizationContext.companyInfo.id
        this.dataJson.tempJson.company_name = this.organizationContext.companyInfo.name
        this.dataJson.tempJson.company_simple_name = this.organizationContext.companyInfo.name
      }

      // 应用部门信息
      if (this.organizationContext.departmentInfo) {
        this.dataJson.tempJson.dept_id = this.organizationContext.departmentInfo.id
        this.dataJson.tempJson.dept_name = this.organizationContext.departmentInfo.name
      }
    },
    // 设置复制数据（用于复制新增）
    setCopyData (data) {
      this.dataJson.tempJson = deepCopy(data)
      // 清空主键和一些不需要复制的字段
      this.dataJson.tempJson.id = undefined
      this.dataJson.tempJson.login_name = ''
      this.dataJson.tempJson.password = ''
      this.dataJson.tempJson.confirm_password = ''
      this.dataJson.tempJson.c_time = undefined
      this.dataJson.tempJson.u_time = undefined
      this.dataJson.tempJson.c_id = undefined
      this.dataJson.tempJson.u_id = undefined
      this.dataJson.tempJson.dbversion = undefined
      this.dataJson.tempJson.one_fileVo = {}
      this.dataJson.tempJson.two_fileVo = {}
    },
    // 公司变更确认处理（带确认对话框）
    handleCompanyReturnDataWithConfirm (val) {
      // 存储待确认的公司数据
      this.settings.popover.pendingCompanyData = val
      this.settings.popover.companyDisplayValue = val.name

      // 如果是首次选择或公司未变更，直接应用
      if (!this.dataJson.tempJson.company_id || this.dataJson.tempJson.company_id === val.serial_id) {
        this.doChangeCompany()
      } else {
        // 显示确认对话框
        this.settings.popover.visible = true
      }
    },
    // 确认变更公司
    doChangeCompany () {
      const val = this.settings.popover.pendingCompanyData
      if (val) {
        // 如果企业变更了，清空部门选择
        if (this.dataJson.tempJson.company_id !== val.serial_id && this.dataJson.tempJson.dept_id) {
          this.dataJson.tempJson.dept_id = ''
          this.dataJson.tempJson.dept_name = ''
        }
        this.dataJson.tempJson.company_id = val.serial_id
        this.dataJson.tempJson.company_name = val.name
        this.dataJson.tempJson.company_simple_name = val.simple_name
      }
      // 关闭确认对话框
      this.settings.popover.visible = false
      this.settings.popover.pendingCompanyData = null
    },
    // 返回数据后，并关闭弹出页面，企业（原方法保持兼容）
    handleCompanyReturnData (val) {
      // 如果企业变更了，清空部门选择
      if (this.dataJson.tempJson.company_id !== val.serial_id && this.dataJson.tempJson.dept_id) {
        this.dataJson.tempJson.dept_id = ''
        this.dataJson.tempJson.dept_name = ''
      }
      this.dataJson.tempJson.company_id = val.serial_id
      this.dataJson.tempJson.company_name = val.name
    },
    // 返回数据后，并关闭弹出页面，部门
    handleDeptReturnData (val) {
      this.dataJson.tempJson.dept_id = val.serial_id
      this.dataJson.tempJson.dept_name = val.name
    },
    // 角色树选择处理
    handleRoleTreeCheck () {
      this.dataJson.tempJson.role_ids = this.$refs.roleTree.getCheckedKeys()
    },
    // 身份证正面照片上传成功回调
    uploadSuccessOne (res) {
      this.dataJson.tempJson.one_fileVo = res.response.data
      this.dataJson.tempJson.one_fileVo.time = res.response.timestamp
    },
    // 身份证反面照片上传成功回调
    uploadSuccessTwo (res) {
      this.dataJson.tempJson.two_fileVo = res.response.data
      this.dataJson.tempJson.two_fileVo.time = res.response.timestamp
    },
    // 关闭对话框
    handleDialogClose () {
      // 处理子组件对话框关闭事件
    },
    // 关闭
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 表单验证
    validateAllForms () {
      const forms = ['baseForm', 'contactForm', 'loginForm', 'orgForm', 'permissionForm']
      const validations = forms.map(formRef => {
        return new Promise(resolve => {
          if (this.$refs[formRef]) {
            this.$refs[formRef].validate(valid => {
              resolve(valid)
            })
          } else {
            resolve(true)
          }
        })
      })

      return Promise.all(validations).then(results => {
        this.updateErrorCounts()
        return results.every(result => result === true)
      })
    },
    // 更新错误计数
    updateErrorCounts () {
      this.$nextTick(() => {
        // 计算各个Tab的错误数量
        this.settings.badge.countOne = this.getFormErrorCount('baseForm')
        this.settings.badge.countTwo = this.getFormErrorCount('loginForm')
        this.settings.badge.countThree = this.getFormErrorCount('orgForm')
        this.settings.badge.countFour = this.getFormErrorCount('contactForm')

        // 保持dataJson.errorsCount兼容性
        this.dataJson.errorsCount = {
          baseErrors: this.settings.badge.countOne,
          contactErrors: this.settings.badge.countFour,
          loginErrors: this.settings.badge.countTwo,
          orgErrors: this.settings.badge.countThree,
          permissionErrors: 0
        }
      })
    },
    // 获取表单错误数量
    getFormErrorCount (formRef) {
      if (!this.$refs[formRef]) return 0
      const form = this.$refs[formRef]
      let errorCount = 0
      if (form.fields) {
        form.fields.forEach(field => {
          if (field.validateState === 'error') {
            errorCount++
          }
        })
      }
      return errorCount
    },
    // Tab切换处理
    handleTabsClick (tab, event) {
      this.settings.tabName = tab.name
      // 切换Tab时进行验证更新
      this.$nextTick(() => {
        this.updateErrorCounts()
      })
    },
    // 占位符显示判断
    isPlaceholderShow (text) {
      // 直接返回占位符文本
      return text
    },
    // 性别字典变更处理
    handleSexDictChange (value) {
      this.dataJson.tempJson.sex = value
    },
    // 婚姻状况变更处理
    handleMarriageChange (value) {
      this.dataJson.tempJson.is_wed = value
    },
    // 婚姻状况字典变更处理
    handleWedDictChange (value) {
      this.dataJson.tempJson.is_wed = value
    },
    // 登录模式变更处理
    handleLoginModeChange (value) {
      this.dataJson.tempJson.login_mode = value
      // 如果不是密码登录，清空密码字段
      if (value !== 'password') {
        this.dataJson.tempJson.password = ''
        this.dataJson.tempJson.confirm_password = ''
      }
    },
    // 启用状态变更处理
    handleEnableChange (value) {
      this.dataJson.tempJson.is_enable = value
    },
    // 员工状态变更处理
    handleStaffStatusChange (value) {
      this.dataJson.tempJson.staff_status = value
    },
    // 设置密码按钮处理
    handleSetPassword () {
      this.$emit('handleSetPasswordClick', {
        staffId: this.dataJson.tempJson.id,
        loginName: this.dataJson.tempJson.user.login_name
      })
    },
    // 密码设置成功回调，更新密码数据
    updatePasswordData (encryptedPassword) {
      this.dataJson.tempJson.user.pwd = encryptedPassword
      // 强制更新视图以确保密码状态标签正确显示
      this.$forceUpdate()
    },
    // 登录模式变更处理
    handleSysLoginTypeChange (val) {
      if (val === '10' && this.dataJson.tempJson.mobile_phone !== undefined) {
        this.dataJson.tempJson.user.login_name = this.dataJson.tempJson.mobile_phone
      } else {
        this.dataJson.tempJson.user.login_name = null
      }
      this.dataJson.tempJson.user.login_type = val
    },
    // 登录用户名变更处理
    handleChangeLoginName () {
      // 如果是手机号登录，手机号默认是登录名称
      if (this.dataJson.tempJson.user.login_type === '10') {
        this.dataJson.tempJson.mobile_phone = deepCopy(this.dataJson.tempJson.user.login_name)
      }
    },
    // 手机号变更处理 - 实现与登录用户名联动
    handleChangePhone () {
      // 如果登录模式是手机号登录，自动更新登录用户名
      if (this.dataJson.tempJson.user.login_type === '10' && this.dataJson.tempJson.mobile_phone) {
        this.dataJson.tempJson.user.login_name = this.dataJson.tempJson.mobile_phone
      }
    },
    // 岗位管理相关方法
    // 判断岗位信息是否已经设置
    positionIsShow () {
      return this.dataJson.tempJson.positions && this.dataJson.tempJson.positions.length > 0
    },
    // 岗位点击跳转处理
    handlePositionClick (positionName) {
      // 通知路由，打开岗位页面
      this.$router.push({
        name: this.PROGRAMS.P_POSITION,
        query: { name: positionName }
      })
      // 关闭当前页面
      this.handleCancel()
    },
    // 新增
    doInsert () {
      this.validateAllForms().then(valid => {
        if (valid) {
          this.settings.loading = true

          // 构建提交数据，使用正确的嵌套user对象
          const submitData = { ...this.dataJson.tempJson }

          insertApi(submitData).then(response => {
            this.$emit('closeMeOk', {
              return_flag: true,
              data: response
            })
          }).catch(error => {
            this.$emit('closeMeOk', {
              return_flag: false,
              error: error
            })
          }).finally(() => {
            this.settings.loading = false
          })
        } else {
          this.$message.error('请完善必填信息')
        }
      })
    }
  }
}
</script>
