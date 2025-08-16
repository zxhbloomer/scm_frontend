<template>
  <div>
    <el-input
      ref="minusLeftFilterInput"
      v-model="dataJson.filterText"
      class="filterInput"
      placeholder="输入关键字进行过滤"
      style="width:calc(100% - 120px)"
    >
      <el-button
        slot="append"
        ref="buttonSearch"
        icon="el-icon-search"
        class="buttonSearch"
        @click="handleButtonSearch"
      />
    </el-input>
    <div class="floatRight">
      <el-button-group>
        <el-tooltip
          class="item"
          effect="dark"
          content="新增子组织"
          placement="top-start"
        >
          <el-button
            type="primary"
            icon="el-icon-plus"
            style="padding:7px 7px"
            :disabled="settings.btnDisabledStatus.disabledInsert"
            @click="handleInsert"
          />
        </el-tooltip>
        <el-tooltip
          class="item"
          effect="dark"
          content="更换当前选中的组织"
          placement="top"
        >
          <el-button
            type="primary"
            icon="el-icon-edit"
            style="padding:7px 7px"
            :disabled="settings.btnDisabledStatus.disabledUpdate"
            @click="handleUpdate"
          />
        </el-tooltip>
        <el-tooltip
          class="item"
          effect="dark"
          content="删除当前选中的组织和子组织"
          placement="top"
        >
          <el-button
            type="danger"
            icon="el-icon-delete"
            style="padding:7px 7px"
            :disabled="settings.btnDisabledStatus.disabledDelete"
            @click="handleDelete"
          />
        </el-tooltip>
        <el-tooltip
          class="item"
          effect="dark"
          content="刷新所有组织"
          placement="top-end"
        >
          <el-button
            type="info"
            icon="el-icon-refresh-right"
            style="padding:7px 7px"
            @click="handleRefresh"
          />
        </el-tooltip>
      </el-button-group>
    </div>
    <div
      :style="{height: height + 'px'}"
      style="overflow-y:auto;overflow-x:auto;"
      class="mytree"
    >
      <el-tree
        ref="treeObject"
        :data="dataJson.treeData"
        :props="dataJson.defaultProps"
        :filter-node-method="filterNode"
        :expand-on-click-node="false"
        :indent="0"
        highlight-current
        node-key="id"
        default-expand-all
        class="tree"
        draggable
        :allow-drop="allowDrop"
        :allow-drag="allowDrag"
        @node-drag-start="handleDragStart"
        @node-drag-enter="handleDragEnter"
        @node-drag-leave="handleDragLeave"
        @node-drag-over="handleDragOver"
        @node-drag-end="handleDragEnd"
        @node-drop="handleDrop"
        @current-change="handleCurrentChange"
      >
        <span
          slot-scope="{ node, data }"
          class="custom-tree-node"
        >
          <span>
            <svg-icon
              v-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT"
              icon-class="perfect-icon-tenant"
              class="el-icon--right"
            />
            <svg-icon
              v-else-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP"
              icon-class="perfect-icon-group"
              class="el-icon--right"
            />
            <svg-icon
              v-else-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY"
              icon-class="perfect-icon-company"
              class="el-icon--right"
            />
            <svg-icon
              v-else-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT"
              icon-class="perfect-icon-dept"
              class="el-icon--right"
            />
            <svg-icon
              v-else-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION"
              icon-class="perfect-icon-position"
              class="el-icon--right"
            />
            <span v-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT">
              组织机构根节点
            </span>
            <span v-if="data.type !== CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT">
              {{ data.simple_name }}
              <!-- 集团类型显示子节点数量 -->
              <span v-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP" style="color: #E6A23C; font-size: 12px;">
                ({{ data.sub_count || 0 }})
              </span>
              <!-- 企业类型显示子节点数量 -->
              <span v-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY" style="color: #409EFF; font-size: 12px;">
                ({{ data.sub_count || 0 }})
              </span>
              <!-- 部门类型显示子节点数量 -->
              <span v-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT" style="color: #67C23A; font-size: 12px;">
                ({{ data.sub_count || 0 }})
              </span>
            </span>
          </span>
          <!-- <span>[{{ data.type_text }}]</span> -->
          <el-tag
            v-if="data.type !== CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT"
            :type="getOrgTagType(data.type)"
            size="mini"
            effect="dark"
            style="margin-left: 8px;"
          >
            {{ getOrgTagText(data.type) }}
          </el-tag>
        </span>
      </el-tree>
    </div>

    <!-- pop窗口 数据编辑:新增、修改、步骤窗体-->
    <el-dialog
      v-if="popSettingsData.dialogFormVisible"
      v-el-drag-dialog
      :title="popSettingsData.textMap[popSettingsData.dialogStatus]"
      :visible="popSettingsData.dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      destroy-on-close
      width="500px"
      top="5vh"
    >
      <el-form
        ref="dataForm"
        label-position="top"
        label-width="120px"
        status-icon
      >
        <el-form-item
          label="组织机构类型："
          prop="org_type"
        >

          <el-radio-group
            v-model="dataJson.tempJson.org_type"
            @input="handleRadioDictChange"
          >
            <el-radio-button
              v-for="item in dataJson.selectOptions"
              :key="item.value"
              :value="item.value"
              :label="item.value"
            >{{ item.name }}
            </el-radio-button>
          </el-radio-group>

        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-divider />
        <el-button
          plain
          :disabled="settings.loading"
          @click="popSettingsData.dialogFormVisible = false"
        >取消</el-button>
        <!-- <el-button plain type="primary" :disabled="settings.loading || popSettingsData.btnDisabledStatus.disabledOK " @click="doOk()">确定</el-button> -->
      </div>
    </el-dialog>

    <!-- 集团编辑弹窗 -->
    <group-dialog
      v-if="popSettingsData.searchDialogDataOne.visible"
      :visible="popSettingsData.searchDialogDataOne.visible"
      :data="popSettingsData.searchDialogDataOne.data"
      @closeMeOk="handleGroupCloseOk"
      @closeMeCancel="handleGroupCloseCancel"
    />

    <!-- 企业编辑弹窗 -->
    <company-dialog
      v-if="popSettingsData.searchDialogDataTwo.visible"
      :visible="popSettingsData.searchDialogDataTwo.visible"
      :data="popSettingsData.searchDialogDataTwo.data"
      @closeMeOk="handleCompanyCloseOk"
      @closeMeCancel="handleCompanyCloseCancel"
    />

    <!-- 部门编辑弹窗 -->
    <dept-dialog
      v-if="popSettingsData.searchDialogDataThree.visible"
      :visible="popSettingsData.searchDialogDataThree.visible"
      :data="popSettingsData.searchDialogDataThree.data"
      @closeMeOk="handleDeptCloseOk"
      @closeMeCancel="handleDeptCloseCancel"
    />

    <!-- 岗位编辑弹窗 -->
    <position-dialog
      v-if="popSettingsData.searchDialogDataFour.visible"
      :visible="popSettingsData.searchDialogDataFour.visible"
      :data="popSettingsData.searchDialogDataFour.data"
      @closeMeOk="handlePositionCloseOk"
      @closeMeCancel="handlePositionCloseCancel"
    />

    <set-position-dialog
      v-if="popSettingsData.searchDialogDataFive.visible"
      :id="popSettingsData.searchDialogDataFive.id"
      :data="popSettingsData.searchDialogDataFive.data"
      :visible="popSettingsData.searchDialogDataFive.visible"
      :model="CONSTANTS.DICT_ORG_USED_TYPE_SHOW_UNUSED"
      @closeMeOk="handleSetPositionOk"
      @closeMeCancel="handleSetPositionCancel"
    />

  </div>
</template>

<style scoped>
.floatRight {
  float: right;
}
.floatLeft {
  float: left;
}
</style>

<style scoped>
.treeStyle {
  overflow: auto;
  border: 1px solid #ebeef5;
}
.filterInput {
  margin-bottom: 10px;
}

.leaf {
  width: 20px;
  background: #ddd;
}

.folder {
  width: 20px;
  background: #888;
}

.custom-tree-container {
  display: -ms-flexbox;
  display: flex;
  margin: -24px;
}

.block {
  -ms-flex: 1;
  flex: 1;
  padding: 8px 24px 24px;
}

.block > p {
  text-align: center;
  margin: 0;
  line-height: 4;
}

.block:first-child {
  border-right: 1px solid #eff2f6;
}

.custom-tree-node {
  -ms-flex: 1;
  flex: 1;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: center;
  align-items: center;
  -ms-flex-pack: justify;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
.el-tree-node:focus > .el-tree-node__content {
  background-color: transparent !important;
}
</style>

<style lang="scss" scoped>
.mytree ::v-deep {
  .el-tree > .el-tree-node:after {
    border-top: none;
  }

  // .el-tree-node__content {
  //   margin-left: -20px;
  // }

  .el-tree-node {
    position: relative;
    padding-left: 2px;
  }
  //结点有间隙，隐藏掉展开按钮就好了,如果觉得空隙没事可以删掉
  .el-tree-node__expand-icon.is-leaf {
    // display: none;
    // color: transparent;
    border-left: 5px solid;
    border-top: 5px solid;
    border-bottom: 5px solid;
    // height: 10px;
    // top: 12px;
    // width: 8px;
    // margin-right: 8px;
    // assets使用方法
    border-image: url('~@/assets/images/hyphen.png') 1 fill stretch;
  }
  .el-tree-node__expand-icon.is-leaf.el-icon-caret-right:before {
    content: '';
  }
  .el-tree-node__children {
    padding-left: 20px;
  }

  .el-tree-node :last-child:before {
    height: 38px;
  }

  .el-tree > .el-tree-node:before {
    border-left: none;
  }

  .el-tree > .el-tree-node:after {
    border-top: none;
  }

  .el-tree-node:before {
    content: '';
    left: 2px;
    position: absolute;
    right: auto;
    border-width: 1px;
  }

  .el-tree-node:after {
    content: '';
    left: 2px;
    position: absolute;
    right: auto;
    border-width: 1px;
  }

  .el-tree-node:before {
    border-left: 1px solid #4386c6;
    bottom: 0px;
    height: 100%;
    top: -26px;
    width: 1px;
  }
  .el-icon--right {
    margin-left: 0px;
  }

  // .el-tree-node:after {
  //   border-top: 1px solid #4386c6;
  //   height: 20px;
  //   top: 12px;
  //   width: 8px;
  // }

  .el-tree > .el-tree-node {
    min-width: 100%;
    display: inline-block;
  }

  .el-tree-node__content > .el-tree-node__expand-icon {
    // padding: 2px
    padding-left: 2px;
    padding-right: 2px;
  }
}
</style>

<style >
.buttonSearch {
  color: #ffffff;
  background-color: #1890ff;
  border-color: #1890ff;
}
</style>

<script>
import { EventBus } from '@/common/eventbus/eventbus'
import { getCorrectTypeByInsertStatusApi, getTreeListApi, deleteApi, dragsaveApi, getSubCountApi } from '@/api/20_master/org/org'
import elDragDialog from '@/directive/el-drag-dialog'
import groupDialog from '@/views/20_master/group/dialog/30_edit/index.vue'
import companyDialog from '@/views/20_master/company/dialog/30_edit/index.vue'
import deptDialog from '@/views/20_master/dept/dialog/30_edit/index.vue'
import positionDialog from '@/views/20_master/position/dialog/30_edit/index.vue'
import setPositionDialog from '@/views/20_master/position/dialog/50_transfer/index.vue'
import { isNotEmpty } from '@/utils/index.js'
import { getDataByIdApi as getPositionByIdApi } from '@/api/20_master/position/position'
import { getByIdApi as getGroupByIdApi } from '@/api/20_master/group/group'
import { getByIdApi as getCompanyByIdApi } from '@/api/20_master/company/company'
import { getByIdApi as getDeptByIdApi } from '@/api/20_master/dept/dept'
// import '@/styles/org_png.scss' // 已改用el-tag，不再需要图片样式

export default {
  // name: 'P00000171', // 页面id，和router中的name需要一致，作为缓存
  components: { groupDialog, companyDialog, deptDialog, positionDialog, setPositionDialog },
  directives: { elDragDialog },
  props: {
    height: {
      type: Number,
      default: 200
    }
  },
  data () {
    return {
      dataJson: {
        // 查询使用的json
        searchForm: {
          type: this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT
        },
        // 下拉选项json
        selectOptions: [],
        filterText: '',
        treeData: [],
        // 单条数据 json
        currentJson: null,
        tempJson: {
          org_type: ''
        },
        tempJsonOriginal: null
      },
      // 页面设置json
      settings: {
        para: this.CONSTANTS.DICT_ORG_SETTING_TYPE,
        filterPara: [],
        loading: true,
        // 按钮状态：是否可用
        btnDisabledStatus: {
          disabledInsert: true,
          disabledUpdate: true,
          disabledDelete: true
        },
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      },
      popSettingsData: {
        // 弹出窗口状态名称
        dialogStatus: '',
        textMap: {
          update: '请选择要修改结点的类型',
          insert: '请选择添加下级结点类型'
        },
        dialogFormVisible: false,
        btnDisabledStatus: {
          disabledOK: false
        },
        // 弹出的编辑框参数设置 - 集团
        searchDialogDataOne: {
          // 弹出框显示参数
          visible: false,
          // 编辑数据
          data: null
        },
        // 弹出的编辑框参数设置 - 企业
        searchDialogDataTwo: {
          // 弹出框显示参数
          visible: false,
          // 编辑数据
          data: null
        },
        // 弹出的编辑框参数设置 - 部门
        searchDialogDataThree: {
          // 弹出框显示参数
          visible: false,
          // 编辑数据
          data: null
        },
        // 弹出的编辑框参数设置 - 岗位
        searchDialogDataFour: {
          // 弹出框显示参数
          visible: false,
          // 编辑数据
          data: null
        },
        // 弹出的查询框参数设置
        searchDialogDataFive: {
          id: undefined,
          data: null,
          // 弹出框显示参数
          visible: false,
          // 点击确定以后返回的值
          selectedDataJson: {}
        }
      }
    }
  },
  computed: {
  },
  watch: {
    'dataJson.filterText': {
      handler (newVal, oldVal) {
        this.$refs.treeObject.filter(newVal)
      }
    },
    'dataJson.currentJson': {
      handler (newVal, oldVal) {
        if (newVal !== null) {
          // 判断是否是第一个结点：第一个结点是租户，所以不能删除，修改，只能新增
          if (this.dataJson.currentJson.parent_id === null) {
            this.settings.btnDisabledStatus.disabledInsert = false
            this.settings.btnDisabledStatus.disabledUpdate = true
            this.settings.btnDisabledStatus.disabledDelete = true
          } else {
            // 判断是否是岗位结点
            if (this.dataJson.currentJson.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION) {
              this.settings.btnDisabledStatus.disabledInsert = false
              this.settings.btnDisabledStatus.disabledUpdate = false
              this.settings.btnDisabledStatus.disabledDelete = false
            } else {
              this.settings.btnDisabledStatus.disabledInsert = false
              this.settings.btnDisabledStatus.disabledUpdate = false
              this.settings.btnDisabledStatus.disabledDelete = false
            }
          }
        } else {
          this.settings.btnDisabledStatus.disabledInsert = true
          this.settings.btnDisabledStatus.disabledUpdate = true
          this.settings.btnDisabledStatus.disabledDelete = true
        }
      }
    },
    'popSettingsData.dialogFormVisible': {
      handler (newVal, oldVal) {
        if (newVal === true) {
          const arr = []
          // arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF)
          switch (this.dataJson.currentJson.type) {
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT:
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF)
              break
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT)
              // arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF)
              break
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF)
              break
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY)
              // arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF)
              break
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION)
              break
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF:
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT)
              break
          }
          this.dataJson.tempJson.org_type = ''
          this.settings.filterPara = arr
          // 查询数据库，获取下拉选项
          this.getCorrectTypeByInsertStatus(this.dataJson.currentJson.code, this.dataJson.currentJson.type, arr)
        }
      }
    },
    'settings.loading': {
      handler (newVal, oldVal) {
        switch (newVal) {
          case true:
            this.showLoading('正在查询，请稍后...')
            break
          case false:
            this.closeLoading()
            break
        }
      }
    }
  },
  created () {
    // 初始化查询
    this.getDataList()
    EventBus.$on(this.EMITS.EMIT_ORG_LEFT, _data => {
      this.handleRefresh()
    })
  },
  mounted () {
    this.initSearchButton()
    // 和right开始绑定事件
    // 描绘完成
    EventBus.$on(this.EMITS.EMIT_ORG_LOADING, _data => { this.settings.loading = true })
    EventBus.$on(this.EMITS.EMIT_ORG_LOADING_OK, _data => { this.settings.loading = false })
  },
  methods: {
    // 选择or重置按钮的初始化
    initSearchButton () {
      this.$nextTick(() => {
        this.$refs.buttonSearch.$el.parentElement.className = ' buttonSearch ' + this.$refs.buttonSearch.$el.parentElement.className
      })
    },
    filterNode (value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    getDataList () {
      // 查询逻辑
      this.settings.loading = true
      getTreeListApi(this.dataJson.searchForm).then(response => {
        this.dataJson.treeData = response.data
        // 为集团类型节点异步加载子节点数量
        this.loadSubCount(this.dataJson.treeData)
        this.getListAfterProcess()
        this.settings.loading = false
        this.$nextTick(() => {
          let current_node = null
          if (this.dataJson.currentJson === null) {
            current_node = this.dataJson.treeData[0]
            this.$refs.treeObject.setCurrentKey(this.dataJson.treeData[0].id)
            this.$refs.treeObject.getCurrentNode(current_node)
          } else {
            current_node = this.dataJson.currentJson
            this.$refs.treeObject.setCurrentKey(this.dataJson.currentJson.currentkey)
            this.$refs.treeObject.getCurrentNode(current_node)
          }
          this.handleCurrentChange(current_node)
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.tempJsonOriginal = Object.assign({}, row) // copy obj
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson = this.$refs.treeObject.getCurrentNode()
      this.dataJson.currentJson.currentkey = this.$refs.treeObject.getCurrentKey()
      // 通知兄弟组件
      // EventBus.$off(this.EMITS.EMIT_ORG_CHANGE)
      EventBus.$emit(this.EMITS.EMIT_ORG_CHANGE, row)
    },
    // 兄弟组件发过来的调用请求
    handleDataChange () {
      // 查询
      this.getDataList()
    },
    handleButtonSearch () {
      // 查询
      this.getDataList()
    },
    // 查询后处理
    getListAfterProcess () {
      if (Object.keys(this.dataJson.filterText).length !== 0) {
        this.$nextTick(() => {
          this.$refs.treeObject.filter(this.dataJson.filterText)
        })
      }
    },
    // 点击新增子结构按钮
    handleInsert () {
      // 新增
      this.popSettingsData.dialogStatus = this.PARAMETERS.STATUS_INSERT
      this.popSettingsData.dialogFormVisible = true
    },
    // 修改当前结点按钮
    handleUpdate () {
      // 根据类型获取完整数据后显示编辑弹窗
      switch (this.dataJson.currentJson.type) {
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
          // 获取集团完整数据
          getGroupByIdApi({ id: this.dataJson.currentJson.serial_id }).then(response => {
            this.popSettingsData.searchDialogDataOne.data = response.data
            this.popSettingsData.searchDialogDataOne.visible = true
          }).catch(error => {
            this.$message.error('获取集团数据失败: ' + error.message)
          })
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
          // 获取企业完整数据
          getCompanyByIdApi({ id: this.dataJson.currentJson.serial_id }).then(response => {
            this.popSettingsData.searchDialogDataTwo.data = response.data
            this.popSettingsData.searchDialogDataTwo.visible = true
          }).catch(error => {
            this.$message.error('获取企业数据失败: ' + error.message)
          })
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
          // 获取部门完整数据
          getDeptByIdApi({ id: this.dataJson.currentJson.serial_id }).then(response => {
            this.popSettingsData.searchDialogDataThree.data = response.data
            this.popSettingsData.searchDialogDataThree.visible = true
          }).catch(error => {
            this.$message.error('获取部门数据失败: ' + error.message)
          })
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
          // 获取岗位完整数据
          getPositionByIdApi({ id: this.dataJson.currentJson.serial_id }).then(response => {
            this.popSettingsData.searchDialogDataFour.data = response.data
            this.popSettingsData.searchDialogDataFour.visible = true
          }).catch(error => {
            this.$message.error('获取岗位数据失败: ' + error.message)
          })
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF:
          // 员工类型保持原有逻辑
          getPositionByIdApi({ id: this.dataJson.currentJson.serial_id }).then(response => {
            this.popSettingsData.searchDialogDataFive.id = response.data.id
            this.popSettingsData.searchDialogDataFive.data = response.data
            this.popSettingsData.searchDialogDataFive.visible = true
          }).catch(error => {
            this.$message.error('获取员工数据失败: ' + error.message)
          })
          break
      }
    },
    handleRadioDictChange (val) {
      this.dataJson.tempJson.org_type = val
      this.doOk()
    },
    doOk () {
      this.popSettingsData.dialogFormVisible = false
      switch (this.dataJson.tempJson.org_type) {
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
          this.popSettingsData.searchDialogDataOne.visible = true
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
          this.popSettingsData.searchDialogDataTwo.visible = true
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
          this.popSettingsData.searchDialogDataThree.visible = true
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
          this.popSettingsData.searchDialogDataFour.visible = true
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF:
          getPositionByIdApi({ id: this.dataJson.currentJson.serial_id }).then(response => {
            this.popSettingsData.searchDialogDataFive.id = response.data.id
            this.popSettingsData.searchDialogDataFive.data = response.data
            this.popSettingsData.searchDialogDataFive.visible = true
          }).finally(() => {
          })
          break
      }
    },
    handleDelete () {
      this.$confirm('请注意：即将删除当前选择结点以及【子结点】的数据，而且不能恢复。', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }).then(() => {
        this.doDelete()
      }).catch(action => {
        // 右上角X
        // if (action !== 'close') {
        //   //
        // }
      })
    },
    handleRefresh () {
      // 初始化查询
      this.getDataList()
    },
    doDelete () {
      // 删除当前结点和子结点
      deleteApi(this.dataJson.tempJson).then((_data) => {
        this.$notify({
          title: '新增处理成功',
          message: _data.message,
          type: 'success',
          duration: this.settings.duration
        })
        // 查询
        this.dataJson.currentJson = null
        this.getDataList()
        this.popSettingsData.dialogFormVisible = false
        this.settings.loading = false
      }, (_error) => {
        this.$notify({
          title: '新增处理失败',
          message: _error.message,
          type: 'error',
          duration: this.settings.duration
        })
        // this.popSettingsData.dialogFormVisible = false
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // --------------弹出查询框：开始--------------
    // 递归更新树节点数据的辅助函数
    updateTreeNodeData (treeData, nodeId, updatedData) {
      for (let i = 0; i < treeData.length; i++) {
        if (treeData[i].id === nodeId) {
          // 保持树结构相关属性，只更新业务数据
          const originalChildren = treeData[i].children
          Object.assign(treeData[i], updatedData)
          if (originalChildren) {
            treeData[i].children = originalChildren
          }
          return true
        }
        if (treeData[i].children && treeData[i].children.length > 0) {
          if (this.updateTreeNodeData(treeData[i].children, nodeId, updatedData)) {
            return true
          }
        }
      }
      return false
    },
    // 集团：关闭编辑弹窗：确定
    handleGroupCloseOk (val) {
      this.popSettingsData.searchDialogDataOne.visible = false
      if (val.return_flag) {
        this.$notify({
          title: '集团修改成功',
          message: val.data.message || '修改成功',
          type: 'success',
          duration: this.settings.duration
        })
        // 直接更新树中当前节点的数据
        this.updateTreeNodeData(this.dataJson.treeData, this.dataJson.currentJson.id, val.data.data)
        // 更新当前选中节点数据
        Object.assign(this.dataJson.currentJson, val.data.data)
      } else {
        this.$notify({
          title: '集团修改失败',
          message: val.error.message || '修改失败',
          type: 'error',
          duration: this.settings.duration
        })
      }
    },
    // 集团：关闭对话框：取消
    handleGroupCloseCancel () {
      this.popSettingsData.searchDialogDataOne.visible = false
    },
    // 企业：关闭编辑弹窗：确定
    handleCompanyCloseOk (val) {
      this.popSettingsData.searchDialogDataTwo.visible = false
      if (val.return_flag) {
        this.$notify({
          title: '企业修改成功',
          message: val.data.message || '修改成功',
          type: 'success',
          duration: this.settings.duration
        })
        // 直接更新树中当前节点的数据
        this.updateTreeNodeData(this.dataJson.treeData, this.dataJson.currentJson.id, val.data.data)
        // 更新当前选中节点数据
        Object.assign(this.dataJson.currentJson, val.data.data)
      } else {
        this.$notify({
          title: '企业修改失败',
          message: val.error.message || '修改失败',
          type: 'error',
          duration: this.settings.duration
        })
      }
    },
    // 企业：关闭对话框：取消
    handleCompanyCloseCancel () {
      this.popSettingsData.searchDialogDataTwo.visible = false
    },
    // 部门：关闭编辑弹窗：确定
    handleDeptCloseOk (val) {
      this.popSettingsData.searchDialogDataThree.visible = false
      if (val.return_flag) {
        this.$notify({
          title: '部门修改成功',
          message: val.data.message || '修改成功',
          type: 'success',
          duration: this.settings.duration
        })
        // 直接更新树中当前节点的数据
        this.updateTreeNodeData(this.dataJson.treeData, this.dataJson.currentJson.id, val.data.data)
        // 更新当前选中节点数据
        Object.assign(this.dataJson.currentJson, val.data.data)
      } else {
        this.$notify({
          title: '部门修改失败',
          message: val.error.message || '修改失败',
          type: 'error',
          duration: this.settings.duration
        })
      }
    },
    // 部门：关闭对话框：取消
    handleDeptCloseCancel () {
      this.popSettingsData.searchDialogDataThree.visible = false
    },
    // 岗位：关闭编辑弹窗：确定
    handlePositionCloseOk (val) {
      this.popSettingsData.searchDialogDataFour.visible = false
      if (val.return_flag) {
        this.$notify({
          title: '岗位修改成功',
          message: val.data.message || '修改成功',
          type: 'success',
          duration: this.settings.duration
        })
        // 直接更新树中当前节点的数据
        this.updateTreeNodeData(this.dataJson.treeData, this.dataJson.currentJson.id, val.data.data)
        // 更新当前选中节点数据
        Object.assign(this.dataJson.currentJson, val.data.data)
      } else {
        this.$notify({
          title: '岗位修改失败',
          message: val.error.message || '修改失败',
          type: 'error',
          duration: this.settings.duration
        })
      }
    },
    // 岗位：关闭对话框：取消
    handlePositionCloseCancel () {
      this.popSettingsData.searchDialogDataFour.visible = false
    },
    // 员工岗位设置：关闭对话框：确定
    handleSetPositionOk (val) {
      // 通知兄弟组件
      // this.$off(this.EMITS.EMIT_ORG_CHANGE)
      EventBus.$emit(this.EMITS.EMIT_ORG_CHANGE, this.dataJson.currentJson)
      this.popSettingsData.searchDialogDataFive.visible = false
    },
    // 员工岗位设置：关闭对话框：取消
    handleSetPositionCancel () {
      this.popSettingsData.searchDialogDataFive.visible = false
    },
    // --------------弹出查询框：结束--------------
    getCorrectTypeByInsertStatus (_code, _type, _filter_para) {
      getCorrectTypeByInsertStatusApi({ code: _code, type: _type, filter_para: _filter_para }).then((_data) => {
        this.dataJson.selectOptions = _data.data
      }, (_error) => {
      }).finally(() => {
        this.settings.loading = false
      })
    },
    handleDragStart (node, ev) {
    },
    handleDragEnter (draggingNode, dropNode, ev) {
    },
    handleDragLeave (draggingNode, dropNode, ev) {
    },
    handleDragOver (draggingNode, dropNode, ev) {
    },
    handleDragEnd (draggingNode, dropNode, dropType, ev) {
    },
    /**
     * 拖拽结束后事件
     * draggingNode:被拖拽结点对应的 Node
     * dropNode:结束拖拽时最后进入的结点
     * dropType:被拖拽结点的放置位置（before、after、inner）
     * ev:event
     */
    handleDrop (draggingNode, dropNode, dropType, ev) {
      // 进入结点，作为子结点
      if (dropType === 'inner') {
        // 获取老子的id
        const parent_id = dropNode.data.id
        // 获取儿子
        draggingNode.data.parent_id = parent_id
      }
      if (dropType === 'before') {
        // 获取老子的id
        const parent_id = dropNode.data.parent_id
        // 获取儿子
        draggingNode.data.parent_id = parent_id
      }
      if (dropType === 'after') {
        // 获取老子的id
        const parent_id = dropNode.data.parent_id
        // 获取儿子
        draggingNode.data.parent_id = parent_id
      }
      this.doDragSave()
    },
    doDragSave () {
      this.settings.loading = true
      // this.$off(this.EMITS.EMIT_ORG_LOADING)
      EventBus.$emit(this.EMITS.EMIT_ORG_LOADING)
      dragsaveApi(this.dataJson.treeData).then((_data) => {
        this.$notify({
          title: '更新处理成功',
          message: _data.message,
          type: 'success',
          duration: this.settings.duration
        })
        // 查询
        this.getDataList()
        this.popSettingsData.dialogFormVisible = false
        this.getDataList()
        // this.$off(this.EMITS.EMIT_ORG_LOADING_OK)
        EventBus.$emit(this.EMITS.EMIT_ORG_LOADING_OK)
      }, (_error) => {
        this.$notify({
          title: '更新处理失败',
          message: _error.message,
          type: 'error',
          duration: this.settings.duration
        })
        // this.popSettingsData.dialogFormVisible = false
        // this.$off(this.EMITS.EMIT_ORG_LOADING_OK)
        EventBus.$emit(this.EMITS.EMIT_ORG_LOADING_OK)
      }).finally(() => {
        this.settings.loading = false
      })
    },
    allowDrop (draggingNode, dropNode, type) {
      // if (type !== 'inner') {
      //   return false
      // }
      // 不得放到根目录之前
      if (!isNotEmpty(dropNode.data.parent_id)) {
        return false
      }
      // 不得放到根目录之后，平级
      if (!isNotEmpty(dropNode.data.parent_id)) {
        return false
      }
      switch (draggingNode.data.type) {
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
          // 集团可嵌套，必须在租户下
          switch (dropNode.data.type) {
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
              return true
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT:
              return true
          }
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
          // 企业必须在集团下
          switch (dropNode.data.type) {
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
              if (dropNode.data.code.length <= 8 && type === 'prev') {
                return false
              }
              return true
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
              if (type === 'inner') {
                return false
              }
              return true
          }
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
          switch (dropNode.data.type) {
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
              return false
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
              if (type === 'inner') {
                return true
              }
              break
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
              return true
          }
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
          switch (dropNode.data.type) {
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
              return false
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
              return false
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
              if (type === 'inner') {
                return true
              }
              break
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
              if (type !== 'inner') {
                return true
              }
              break
          }
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF:
          break
      }
      return false
    },
    // 允许拖拽的情况
    allowDrag (draggingNode) {
      if (isNotEmpty(draggingNode.data.parent_id)) {
        return true
      } else {
        return false
      }
    },
    // 获取组织类型标签颜色
    getOrgTagType (type) {
      switch (type) {
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
          return 'warning' // 橙色
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
          return '' // 蓝色（默认）
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
          return 'success' // 绿色
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
          return 'info' // 灰色
        default:
          return 'info'
      }
    },
    // 获取组织类型标签文本
    getOrgTagText (type) {
      switch (type) {
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
          return '集团'
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
          return '企业'
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
          return '部门'
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
          return '岗位'
        default:
          return ''
      }
    },
    // 为集团、企业、部门类型节点异步加载子节点数量
    loadSubCount (treeNodes) {
      if (!treeNodes || !Array.isArray(treeNodes)) return

      treeNodes.forEach(node => {
        // 如果是集团、企业或部门类型，异步获取子节点数量
        if (node.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP ||
            node.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY ||
            node.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT) {
          getSubCountApi(node.id).then(response => {
            // 使用this.$set确保响应式更新
            this.$set(node, 'sub_count', response.data)
          }).catch(error => {
            console.error('获取子节点数量失败:', error)
            this.$set(node, 'sub_count', 0)
          })
        }

        // 递归处理子节点
        if (node.children && node.children.length > 0) {
          this.loadSubCount(node.children)
        }
      })
    }
  }
}
</script>
