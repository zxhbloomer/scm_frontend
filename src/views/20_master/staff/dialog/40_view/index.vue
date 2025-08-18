<template>
  <el-dialog
    v-if="listenVisible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="查看员工"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="1200px"
    destroy-on-close
  >
    <el-tabs :value="settings.tabName">
      <!-- 基本信息 -->
      <el-tab-pane name="tab1" label="基本信息">
        <el-form
          label-position="right"
          label-width="120px"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="员工姓名">
                <span>{{ dataJson.tempJson.name || '-' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="员工姓名拼音">
                <span>{{ dataJson.tempJson.name_py || '-' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="身份证号码">
                <span>{{ dataJson.tempJson.id_card || '-' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="护照号码">
                <span>{{ dataJson.tempJson.passport || '-' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="民族">
                <span>{{ dataJson.tempJson.nation || '-' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="生日">
                <span>{{ formatDate(dataJson.tempJson.birthday) || '-' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="性别">
                <span>{{ getSexText(dataJson.tempJson.sex) }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="在职情况">
                <span>{{ getServiceText(dataJson.tempJson.service) }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="婚否">
                <span>{{ getWedText(dataJson.tempJson.is_wed) }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="学历">
                <span>{{ getDegreeText(dataJson.tempJson.degree) }}</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="身份证正面照片">
                <div v-if="dataJson.tempJson.one_fileVo && dataJson.tempJson.one_fileVo.relativePath">
                  <el-image
                    style="width: 200px; height: 120px"
                    :src="getImageUrl(dataJson.tempJson.one_fileVo.relativePath)"
                    :preview-src-list="[getImageUrl(dataJson.tempJson.one_fileVo.relativePath)]"
                    fit="cover"
                  />
                </div>
                <span v-else>-</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="身份证背面照片">
                <div v-if="dataJson.tempJson.two_fileVo && dataJson.tempJson.two_fileVo.relativePath">
                  <el-image
                    style="width: 200px; height: 120px"
                    :src="getImageUrl(dataJson.tempJson.two_fileVo.relativePath)"
                    :preview-src-list="[getImageUrl(dataJson.tempJson.two_fileVo.relativePath)]"
                    fit="cover"
                  />
                </div>
                <span v-else>-</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>

      <!-- 联系方式 -->
      <el-tab-pane name="tab2" label="联系方式">
        <el-form
          label-position="right"
          label-width="120px"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="家庭电话">
                <span>{{ dataJson.tempJson.home_phone || '-' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="办公室电话">
                <span>{{ dataJson.tempJson.office_phone || '-' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="手机号码">
                <span>{{ dataJson.tempJson.mobile_phone || '-' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机备用号码">
                <span>{{ dataJson.tempJson.mobile_phone_backup || '-' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="邮箱地址">
                <span>{{ dataJson.tempJson.email || '-' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱备用地址">
                <span>{{ dataJson.tempJson.email_backup || '-' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>

      <!-- 登录账号信息 -->
      <el-tab-pane name="tab3" label="登录账号信息">
        <el-form
          label-position="right"
          label-width="120px"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="开启账号登录">
                <el-tag :type="dataJson.tempJson.user && dataJson.tempJson.user.is_enable ? 'success' : 'danger'">
                  {{ (dataJson.tempJson.user && dataJson.tempJson.user.is_enable) ? '开启' : '关闭' }}
                </el-tag>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="登录模式">
                <span>{{ getLoginTypeText(dataJson.tempJson.user && dataJson.tempJson.user.login_type) }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="登录用户名">
                <span>{{ (dataJson.tempJson.user && dataJson.tempJson.user.login_name) || '-' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="密码设置情况">
                <el-tag :type="(dataJson.tempJson.user && dataJson.tempJson.user.pwd) ? 'success' : 'danger'">
                  {{ (dataJson.tempJson.user && dataJson.tempJson.user.pwd) ? '已设置密码' : '未设置密码' }}
                </el-tag>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="生效日期区间">
                <span>{{ getDateRangeText(dataJson.tempJson.user && dataJson.tempJson.user.datetimerange) }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="登录用户类型">
                <span>{{ getUserTypeText(dataJson.tempJson.user && dataJson.tempJson.user.type) }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否删除">
                <el-tag :type="(dataJson.tempJson.user && dataJson.tempJson.user.is_del) ? 'danger' : 'success'">
                  {{ (dataJson.tempJson.user && dataJson.tempJson.user.is_del) ? '已删除' : '未删除' }}
                </el-tag>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="用户锁定时间">
                <span>{{ (dataJson.tempJson.user && dataJson.tempJson.user.locked_time) || '-' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否锁定">
                <el-tag :type="(dataJson.tempJson.user && dataJson.tempJson.user.is_lock) ? 'danger' : 'success'">
                  {{ (dataJson.tempJson.user && dataJson.tempJson.user.is_lock) ? '已锁定' : '未锁定' }}
                </el-tag>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="登录错误次数">
                <span>{{ (dataJson.tempJson.user && dataJson.tempJson.user.err_count) || '0' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否修改过密码">
                <el-tag :type="(dataJson.tempJson.user && dataJson.tempJson.user.is_changed_pwd) ? 'success' : 'warning'">
                  {{ (dataJson.tempJson.user && dataJson.tempJson.user.is_changed_pwd) ? '已修改' : '未修改' }}
                </el-tag>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="最后登录时间">
                <span>{{ formatDateTime(dataJson.tempJson.user && dataJson.tempJson.user.last_login_date) || '-' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最后登出时间">
                <span>{{ formatDateTime(dataJson.tempJson.user && dataJson.tempJson.user.last_logout_date) || '-' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>

      <!-- 所属信息 -->
      <el-tab-pane name="tab4" label="所属信息">
        <el-form
          label-position="right"
          label-width="120px"
        >
          <el-row>
            <el-col :span="24">
              <el-form-item label="所属主体企业">
                <span>{{ dataJson.tempJson.company_name || '-' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="默认部门">
                <span>{{ dataJson.tempJson.dept_name || '-' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="岗位信息">
                <div v-if="dataJson.tempJson.positions && dataJson.tempJson.positions.length > 0">
                  <el-tag
                    v-for="position in dataJson.tempJson.positions"
                    :key="position.position_id"
                    class="position-tag"
                  >
                    {{ position.position_name }}
                  </el-tag>
                </div>
                <span v-else>-</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>

      <!-- 权限信息 -->
      <el-tab-pane name="tab5" label="权限信息">
        <div style="margin-left:30px;">
          <el-row :gutter="20">
            <el-col :span="5">
              <el-switch
                v-model="horizontal"
                :width="50"
                active-text="横排"
                inactive-text="竖排"
                style="margin-top:8px;"
              />
            </el-col>
            <el-col :span="5">
              <el-switch
                v-model="expandAll"
                :width="50"
                active-text="全部展开"
                inactive-text="全部折叠"
                style="margin-top:8px;"
                @change="expandChange"
              />
            </el-col>
          </el-row>
        </div>

        <div style="font-size:12px;margin-top:30px;text-align:center">
          <el-scrollbar
            :style="scrollTreeStyle"
            class="el-org-tree"
          >
            <org-tree
              v-if="dataJson.tempJson.permissionTreeData"
              name="permission-tree"
              :props="{label: 'label', children: 'children', expand: 'expand'}"
              :data="dataJson.tempJson.permissionTreeData"
              :horizontal="horizontal"
              :collapsable="collapsable"
              :render-content="renderContent"
              @on-expand="onExpand"
              @on-node-click="onNodeClick"
            />
          </el-scrollbar>
        </div>
      </el-tab-pane>

    </el-tabs>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        plain
        @click="handleCancel()"
      >关闭</el-button>
    </div>
  </el-dialog>
</template>

<style scoped>
.position-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import { getApi } from '@/api/20_master/staff/staff'
import deepCopy from 'deep-copy'
import OrgTree from '@/components/OrgTree/index.js'

export default {
  name: 'ViewDialog',
  components: { OrgTree },
  directives: { elDragDialog },
  props: {
    // 页面是否显示参数
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
      dataJson: {
        // 表单数据
        tempJson: {}
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: false,
        duration: 4000,
        // 选中的标签页
        tabName: 'tab1'
      },
      // 权限信息
      scrollTreeStyle: 'width:100%;height:500px',
      horizontal: false,
      collapsable: true,
      expandAll: true
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    }
  },
  // 监听器
  watch: {
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
      if (!this.data || !this.data.id) {
        return
      }

      this.settings.loading = true
      this.dataJson.tempJson = deepCopy(this.data)

      // 加载详细信息
      this.loadStaffInfo()
    },
    // 加载员工详细信息
    loadStaffInfo () {
      getApi(this.data).then(response => {
        this.dataJson.tempJson = response.data
        // 默认全部展开权限树
        if (this.dataJson.tempJson.permissionTreeData && Array.isArray(this.dataJson.tempJson.permissionTreeData)) {
          this.toggleExpand(this.dataJson.tempJson.permissionTreeData, true)
        }
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 获取性别文本
    getSexText (sex) {
      if (sex === '1' || sex === 1) {
        return '男'
      } else if (sex === '0' || sex === 0) {
        return '女'
      }
      return '-'
    },
    // 获取在职情况文本
    getServiceText (service) {
      const serviceMap = {
        '1': '在职',
        '0': '离职',
        '2': '停职',
        '3': '转职'
      }
      return serviceMap[service] || '-'
    },
    // 获取婚否文本
    getWedText (isWed) {
      const wedMap = {
        '1': '已婚',
        '0': '未婚'
      }
      return wedMap[isWed] || '-'
    },
    // 获取学历文本
    getDegreeText (degree) {
      const degreeMap = {
        '1': '小学',
        '2': '初中',
        '3': '高中',
        '4': '中专',
        '5': '大专',
        '6': '本科',
        '7': '硕士',
        '8': '博士'
      }
      return degreeMap[degree] || '-'
    },
    // 获取登录模式文本
    getLoginTypeText (loginType) {
      const loginTypeMap = {
        '10': '手机号',
        '20': '用户名'
      }
      return loginTypeMap[loginType] || '-'
    },
    // 获取用户类型文本
    getUserTypeText (userType) {
      const userTypeMap = {
        '1': '系统管理员',
        '2': '业务用户',
        '3': '访问用户'
      }
      return userTypeMap[userType] || '-'
    },
    // 获取日期区间文本
    getDateRangeText (dateRange) {
      if (!dateRange || !Array.isArray(dateRange) || dateRange.length !== 2) {
        return '-'
      }
      const startDate = this.formatDateTime(dateRange[0])
      const endDate = this.formatDateTime(dateRange[1])
      return `${startDate || '-'} 至 ${endDate || '-'}`
    },
    // 获取图片URL
    getImageUrl (relativePath) {
      if (!relativePath) {
        return ''
      }
      // 根据项目配置生成完整的图片URL
      const baseUrl = process.env.VUE_APP_FILE_UPLOAD_URL || 'http://file.xinyirunscm.com'
      return `${baseUrl}/${relativePath}`
    },
    // 格式化日期 - 只显示日期部分
    formatDate (dateStr) {
      if (!dateStr) {
        return ''
      }
      // 如果是日期时间格式，提取日期部分
      return dateStr.split(' ')[0]
    },
    // 关闭
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 权限信息相关方法
    renderContent (h, data) {
      return data.label
    },
    onExpand (e, data) {
      // console.log('======================onExpand' + data.label)
      if ('expand' in data) {
        data.expand = !data.expand
        if (!data.expand && data.children) {
          this.collapse(data.children)
        }
      } else {
        this.$set(data, 'expand', true)
      }
    },
    onNodeClick (e, data) {
      let confirm_str = ''
      let path = ''
      let params = {}
      switch (data.serial_type) {
        case 'm_position':
          confirm_str = '查看该岗位详情，需要关闭当前页面，请注意保存！'
          path = '/position/position'
          params = { code: data.serial_code, fullpath: true }
          break
        case 's_role':
          confirm_str = '查看该角色详情，需要关闭当前页面，请注意保存！'
          path = '/role'
          params = { code: data.serial_code, fullpath: true }
          break
        case 'm_permission':
          confirm_str = '查看该权限详情，需要关闭当前页面，请注意保存！'
          path = '/permission'
          params = { name: data.label, fullpath: true }
          break
        default:
          confirm_str = ''
          path = ''
          params = {}
          break
      }

      if (confirm_str === '' || path === '') {
        return
      }
      this.$confirm(confirm_str, '确认信息', {
      }).then(() => {
        this.$router.push({
          path: path, query: params
        })
        this.handleCancel()
      }).catch(action => {
      })
    },
    expandChange () {
      this.collapsable = true
      this.toggleExpand(this.dataJson.tempJson.permissionTreeData, this.expandAll)
    },
    toggleExpand (data, val) {
      var _this = this
      if (Array.isArray(data)) {
        data.forEach(function (item) {
          _this.$set(item, 'expand', val)
          if (item.children) {
            _this.toggleExpand(item.children, val)
          }
        })
      } else {
        this.$set(data, 'expand', val)
        if (data.children) {
          _this.toggleExpand(data.children, val)
        }
      }
    },
    collapse (list) {
      var _this = this
      list.forEach(function (child) {
        if (child.expand) {
          child.expand = false
        }
        child.children && _this.collapse(child.children)
      })
    }
  }
}
</script>
