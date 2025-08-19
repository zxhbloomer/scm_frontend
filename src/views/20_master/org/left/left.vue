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
              <span v-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP" style="font-size: 12px;">
                <!-- 使用计算属性获取显示数据 -->
                <template v-if="getGroupDisplayData(data.sub_count).hasContent">
                  <span v-if="getGroupDisplayData(data.sub_count).isDetailed">
                    (
                    <!-- 使用v-for循环渲染链接，用v-if做case判断 -->
                    <template v-for="(link, index) in getGroupDisplayData(data.sub_count).links">
                      <!-- case: sub_group 子集团链接 -->
                      <el-link
                        v-if="link.type === 'sub_group'"
                        :key="link.type + '_' + index"
                        type="warning"
                        :underline="false"
                        style="font-size: 12px;"
                        @click="handleLinkClick(link, data)"
                      >
                        {{ link.text }}
                      </el-link>
                      <!-- case: company 企业链接 -->
                      <el-link
                        v-else-if="link.type === 'company'"
                        :key="link.type + '_' + index"
                        type="warning"
                        :underline="false"
                        style="font-size: 12px;"
                        @click="handleLinkClick(link, data)"
                      >
                        {{ link.text }}
                      </el-link>
                      <!-- 分隔符：如果不是最后一个就加"、" -->
                      <span v-if="index < getGroupDisplayData(data.sub_count).links.length - 1" :key="'separator_' + index">、</span>
                    </template>
                    )
                  </span>
                  <!-- case: 简单数字显示（向下兼容） -->
                  <span v-else style="color: #E6A23C;">
                    {{ getGroupDisplayData(data.sub_count).simpleText }}
                  </span>
                </template>
              </span>
              <!-- 企业类型显示部门数量 -->
              <span v-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY" class="company-dept-count" style="color: #409EFF; font-size: 12px;">
                （部门数：{{ data.dept_count || 0 }}）
              </span>
              <!-- 部门类型显示子部门和岗位数量 -->
              <span v-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT" style="font-size: 12px;">
                <!-- 使用计算属性获取显示数据 -->
                <template v-if="getDeptDisplayData(data.sub_count).hasContent">
                  <span v-if="getDeptDisplayData(data.sub_count).isDetailed">
                    (
                    <!-- 使用v-for循环渲染链接，用v-if做case判断 -->
                    <template v-for="(link, index) in getDeptDisplayData(data.sub_count).links">
                      <!-- case: sub_dept 子部门链接 -->
                      <el-link
                        v-if="link.type === 'sub_dept'"
                        :key="link.type + '_' + index"
                        type="success"
                        :underline="false"
                        style="font-size: 12px;"
                        @click="handleLinkClick(link, data)"
                      >
                        {{ link.text }}
                      </el-link>
                      <!-- case: position 岗位链接 -->
                      <el-link
                        v-if="link.type === 'position'"
                        :key="link.type + '_' + index"
                        type="success"
                        :underline="false"
                        style="font-size: 12px;"
                        @click="handleLinkClick(link, data)"
                      >
                        {{ link.text }}
                      </el-link>
                      <!-- 分隔符：如果不是最后一个就加"、" -->
                      <span v-if="index < getDeptDisplayData(data.sub_count).links.length - 1" :key="'separator_' + index">、</span>
                    </template>
                    )
                  </span>
                  <!-- case: 简单数字显示（向下兼容） -->
                  <span v-else style="color: #67C23A;">
                    {{ getDeptDisplayData(data.sub_count).simpleText }}
                  </span>
                </template>
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

    <!-- 新增：10_list 弹窗组件 -->
    <!-- 集团列表弹窗 -->
    <group-list-dialog
      v-if="popSettingsData.listDialogData.visible && popSettingsData.listDialogData.dialogType === 'group'"
      :visible="popSettingsData.listDialogData.visible"
      :data="popSettingsData.listDialogData.data"
      @closeMeOk="handleListDialogOk"
      @closeMeCancel="handleListDialogCancel"
    />

    <!-- 企业列表弹窗 -->
    <company-list-dialog
      v-if="popSettingsData.listDialogData.visible && popSettingsData.listDialogData.dialogType === 'company'"
      :visible="popSettingsData.listDialogData.visible"
      :data="popSettingsData.listDialogData.data"
      @closeMeOk="handleListDialogOk"
      @closeMeCancel="handleListDialogCancel"
    />

    <!-- 部门列表弹窗 -->
    <dept-list-dialog
      v-if="popSettingsData.listDialogData.visible && popSettingsData.listDialogData.dialogType === 'dept'"
      :visible="popSettingsData.listDialogData.visible"
      :data="popSettingsData.listDialogData.data"
      @closeMeOk="handleListDialogOk"
      @closeMeCancel="handleListDialogCancel"
    />

    <!-- 岗位列表弹窗 -->
    <position-list-dialog
      v-if="popSettingsData.listDialogData.visible && popSettingsData.listDialogData.dialogType === 'position'"
      :visible="popSettingsData.listDialogData.visible"
      :data="popSettingsData.listDialogData.data"
      @closeMeOk="handleListDialogOk"
      @closeMeCancel="handleListDialogCancel"
    />
    <!-- 员工列表弹窗 -->
    <staff-list-dialog
      v-if="popSettingsData.listDialogData.visible && popSettingsData.listDialogData.dialogType === 'staff'"
      :visible="popSettingsData.listDialogData.visible"
      :data="popSettingsData.listDialogData.data"
      @closeMeOk="handleListDialogOk"
      @closeMeCancel="handleListDialogCancel"
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

  /* 拖拽样式优化 - 简单明显的区分 */

  /* 子级拖拽样式 - 绿色背景+文字 */
  .drag-drop-inner {
    background: linear-gradient(90deg, #f0f9ff 0%, #e8f5e8 100%) !important;
    border: 3px solid #67C23A !important;
    border-radius: 8px !important;
    position: relative !important;
    box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3) !important;
  }

  .drag-drop-inner::after {
    content: '📁 成为子节点';
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: #67C23A;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: bold;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }

  /* 平级拖拽样式 - 优化版本 */
  .drag-drop-before {
    position: relative;
  }

  .drag-drop-before::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 20px;
    right: 10px;
    height: 6px;
    background: linear-gradient(90deg, #FF6B35 0%, #FF8C42 100%);
    border-radius: 3px;
    z-index: 9998;
    box-shadow: 0 2px 8px rgba(255, 107, 53, 0.5);
    border: 1px solid #FF6B35;
    pointer-events: none;
  }

  .drag-drop-before::after {
    content: '⬆️ 上方';
    position: absolute;
    top: -25px;
    right: 10px;
    background: #FF6B35;
    color: white;
    padding: 4px 10px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: bold;
    z-index: 9999;
    white-space: nowrap;
    box-shadow: 0 3px 10px rgba(255, 107, 53, 0.5);
    pointer-events: none;
    display: block;
  }

  .drag-drop-after {
    position: relative;
  }

  .drag-drop-after::before {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 20px;
    right: 10px;
    height: 6px;
    background: linear-gradient(90deg, #FF6B35 0%, #FF8C42 100%);
    border-radius: 3px;
    z-index: 9998;
    box-shadow: 0 2px 8px rgba(255, 107, 53, 0.5);
    border: 1px solid #FF6B35;
    pointer-events: none;
  }

  .drag-drop-after::after {
    content: '⬇️ 下方';
    position: absolute;
    bottom: -25px;
    right: 10px;
    background: #FF6B35;
    color: white;
    padding: 4px 10px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: bold;
    z-index: 9999;
    white-space: nowrap;
    box-shadow: 0 3px 10px rgba(255, 107, 53, 0.5);
    pointer-events: none;
    display: block;
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
import { getCorrectTypeByInsertStatusApi, getTreeListApi, insertApi, deleteApi, dragsaveApi, getSubCountApi } from '@/api/20_master/org/org'
import elDragDialog from '@/directive/el-drag-dialog'
import groupDialog from '@/views/20_master/group/dialog/30_edit/index.vue'
import companyDialog from '@/views/20_master/company/dialog/30_edit/index.vue'
import deptDialog from '@/views/20_master/dept/dialog/30_edit/index.vue'
import positionDialog from '@/views/20_master/position/dialog/30_edit/index.vue'
import setPositionDialog from '@/views/20_master/position/dialog/50_transfer/index.vue'
// 新增：引入 10_list 弹窗组件
import groupListDialog from '@/views/20_master/group/dialog/10_list/index.vue'
import companyListDialog from '@/views/20_master/company/dialog/10_list/index.vue'
import deptListDialog from '@/views/20_master/dept/dialog/10_list/index.vue'
import positionListDialog from '@/views/20_master/position/dialog/10_list/index.vue'
import staffListDialog from '@/views/20_master/staff/dialog/10_list/index.vue'
import { isNotEmpty } from '@/utils/index.js'
import { getDataByIdApi as getPositionByIdApi } from '@/api/20_master/position/position'
import { getByIdApi as getGroupByIdApi } from '@/api/20_master/group/group'
import { getByIdApi as getCompanyByIdApi } from '@/api/20_master/company/company'
import { getByIdApi as getDeptByIdApi } from '@/api/20_master/dept/dept'
// import '@/styles/org_png.scss' // 已改用el-tag，不再需要图片样式

export default {
  // name: 'P00000171', // 页面id，和router中的name需要一致，作为缓存
  components: {
    groupDialog, companyDialog, deptDialog, positionDialog, setPositionDialog,
    groupListDialog, companyListDialog, deptListDialog, positionListDialog, staffListDialog
  },
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
        },
        // 新增：10_list 弹窗状态管理
        listDialogData: {
          // 弹出框显示参数
          visible: false,
          // 弹窗类型：group/company/dept/position
          dialogType: '',
          // 传递给弹窗的数据
          data: null
        }
      },
      // 拖拽确认相关状态
      dragConfirmData: {
        originalTreeData: null, // 保存拖拽前的树状态
        isProcessing: false // 是否正在处理拖拽确认
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

      // 企业节点部门统计处理
      if (row && row.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY) {
        this.loadCompanyDeptCount(row.id)
      }

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
      // 新增：先弹出类型选择弹窗
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
          // 员工不作为树节点显示，不允许在此编辑
          this.$message.warning('员工信息请通过员工管理模块进行编辑')
          break
      }
    },
    handleRadioDictChange (val) {
      this.dataJson.tempJson.org_type = val
      this.doOk()
    },
    doOk () {
      this.popSettingsData.dialogFormVisible = false

      // 根据用户选择的类型，设置相应的listDialogData弹窗
      let dialogType = ''
      switch (this.dataJson.tempJson.org_type) {
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
          dialogType = 'group'
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
          dialogType = 'company'
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
          dialogType = 'dept'
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
          dialogType = 'position'
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF:
          dialogType = 'staff'
          break
      }

      // 设置弹窗数据并显示
      this.popSettingsData.listDialogData.dialogType = dialogType
      this.popSettingsData.listDialogData.data = {
        parent_id: this.dataJson.currentJson.id,
        parent_name: this.dataJson.currentJson.simple_name || '组织机构根节点',
        parent_type: this.dataJson.currentJson.type
      }
      this.popSettingsData.listDialogData.visible = true
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

    // 新增：10_list 弹窗事件处理
    // 列表弹窗：关闭对话框：确定
    handleListDialogOk (val) {
      this.popSettingsData.listDialogData.visible = false
      if (val) {
        this.settings.loading = true

        // 根据弹窗类型决定组织类型
        let orgType = ''
        switch (this.popSettingsData.listDialogData.dialogType) {
          case 'group':
            orgType = this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP
            break
          case 'company':
            orgType = this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY
            break
          case 'dept':
            orgType = this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT
            break
          case 'position':
            orgType = this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION
            break
          case 'staff':
            orgType = this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF
            break
        }

        // 调用insertApi创建组织关系
        insertApi({
          serial_id: val.id,
          type: orgType,
          parent_id: this.dataJson.currentJson.id
        }).then((_data) => {
          this.$notify({
            title: '新增处理成功',
            message: _data.message,
            type: 'success',
            duration: this.settings.duration
          })
          // 如果是员工类型，只更新当前岗位节点的员工数量显示，不刷新整个树
          if (this.popSettingsData.listDialogData.dialogType === 'staff') {
            this.updatePositionStaffCount(this.dataJson.currentJson)
          } else {
            // 其他类型刷新树数据，以便显示新增的节点
            this.getDataList()
          }
        }, (_error) => {
          this.$notify({
            title: '新增处理失败',
            message: _error.message,
            type: 'error',
            duration: this.settings.duration
          })
        }).finally(() => {
          this.settings.loading = false
        })
      }
    },
    // 列表弹窗：关闭对话框：取消
    handleListDialogCancel () {
      this.popSettingsData.listDialogData.visible = false
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
      // 在拖拽开始时保存原始树状态，用于可能的撤销操作
      this.dragConfirmData.originalTreeData = JSON.parse(JSON.stringify(this.dataJson.treeData))
    },

    handleDragEnter (draggingNode, dropNode, ev) {
      // 清除之前的样式
      this.clearDragStyles()

      // 计算拖拽类型并应用样式
      const dropType = this.calculateDropType(ev)
      if (dropType && this.allowDrop(draggingNode, dropNode, dropType)) {
        this.applyDragStyle(ev.target, dropType)
      }
    },

    handleDragLeave (draggingNode, dropNode, ev) {
      // 延迟清除样式，避免移动过程中的闪烁
      setTimeout(() => {
        this.clearDragStyles()
      }, 50)
    },

    handleDragOver (draggingNode, dropNode, ev) {
      // 清除之前的样式
      this.clearDragStyles()

      // 计算拖拽类型并应用样式
      const dropType = this.calculateDropType(ev)
      if (dropType && this.allowDrop(draggingNode, dropNode, dropType)) {
        this.applyDragStyle(ev.target, dropType)
      }
    },

    handleDragEnd (draggingNode, dropNode, dropType, ev) {
      // 清除所有拖拽样式
      this.clearDragStyles()
    },
    /**
     * 拖拽结束后事件
     * draggingNode:被拖拽结点对应的 Node
     * dropNode:结束拖拽时最后进入的结点
     * dropType:被拖拽结点的放置位置（before、after、inner）
     * ev:event
     */
    handleDrop (draggingNode, dropNode, dropType, ev) {
      // 如果正在处理确认，避免重复触发
      if (this.dragConfirmData.isProcessing) {
        return
      }

      this.dragConfirmData.isProcessing = true

      // 更新节点父子关系（Element UI已自动调整树结构）
      if (dropType === 'inner') {
        draggingNode.data.parent_id = dropNode.data.id
      } else if (dropType === 'before' || dropType === 'after') {
        draggingNode.data.parent_id = dropNode.data.parent_id
      }

      // 生成确认消息
      const confirmMessage = this.generateDragConfirmMessage(draggingNode, dropNode, dropType)

      // 显示确认弹窗
      this.$confirm(confirmMessage, '确认组织架构调整', {
        confirmButtonText: '确定调整',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        showClose: false,
        closeOnClickModal: false
      }).then(() => {
        // 用户确认 - 执行保存
        this.doDragSave()
      }).catch(() => {
        // 用户取消 - 恢复原始状态
        this.restoreTreeState()
      }).finally(() => {
        this.dragConfirmData.isProcessing = false
      })
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
        // 如果是集团、企业、部门或岗位类型，异步获取子节点数量
        if (node.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP ||
            node.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY ||
            node.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT ||
            node.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION) {
          // 对于集团类型，传递orgType参数以获取详细分类统计
          if (node.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP) {
            console.log(`[DEBUG] 调用集团API: orgId=${node.id}, orgType=${node.type}`)
            getSubCountApi(node.id, node.type).then(response => {
              console.log(`[DEBUG] 集团API返回数据:`, response.data)
              // 使用this.$set确保响应式更新
              this.$set(node, 'sub_count', response.data)
            }).catch(error => {
              console.error('获取集团子节点数量失败:', error)
              this.$set(node, 'sub_count', 0)
            })
          } else if (node.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY) {
            // 企业类型：同时获取子节点数量和部门统计
            getSubCountApi(node.id).then(response => {
              // 使用this.$set确保响应式更新
              this.$set(node, 'sub_count', response.data)
            }).catch(error => {
              console.error('获取企业子节点数量失败:', error)
              this.$set(node, 'sub_count', 0)
            })

            // 获取企业部门统计
            getSubCountApi(node.id, this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY).then(response => {
              const deptCount = response.data.dept_count || 0
              this.$set(node, 'dept_count', deptCount)
            }).catch(error => {
              console.error('获取企业部门统计失败:', error)
              this.$set(node, 'dept_count', 0)
            })
          } else if (node.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT) {
            // 部门类型：获取详细的子部门和岗位统计
            console.log(`[DEBUG] 调用部门API: orgId=${node.id}, orgType=${node.type}`)
            getSubCountApi(node.id, node.type).then(response => {
              console.log(`[DEBUG] 部门API返回数据:`, response.data)
              // 使用this.$set确保响应式更新
              this.$set(node, 'sub_count', response.data)
            }).catch(error => {
              console.error('获取部门子节点统计失败:', error)
              this.$set(node, 'sub_count', 0)
            })
          } else if (node.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION) {
            // 岗位类型：获取员工数量统计
            console.log(`[DEBUG] 调用岗位员工统计API: orgId=${node.id}`)
            getSubCountApi(node.id).then(response => {
              console.log(`[DEBUG] 岗位员工统计API返回数据:`, response.data)
              // 使用this.$set确保响应式更新
              this.$set(node, 'staff_count', response.data)
              // 更新节点显示标签，添加员工数量
              if (response.data > 0) {
                this.$set(node, 'label', node.name + `（员工数：${response.data}）`)
              } else {
                this.$set(node, 'label', node.name)
              }
            }).catch(error => {
              console.error('获取岗位员工数量失败:', error)
              this.$set(node, 'staff_count', 0)
              this.$set(node, 'label', node.name)
            })
          }
        }

        // 递归处理子节点
        if (node.children && node.children.length > 0) {
          this.loadSubCount(node.children)
        }
      })
    },
    // 更新指定岗位节点的员工数量显示
    updatePositionStaffCount (positionNode) {
      if (!positionNode || positionNode.type !== this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION) {
        return
      }
      // 调用API获取该岗位的员工数量
      getSubCountApi(positionNode.id).then(response => {
        console.log(`[DEBUG] 更新岗位员工数量: orgId=${positionNode.id}, 员工数=${response.data}`)
        // 更新树中对应节点的数据
        this.updateTreeNodeStaffCount(this.dataJson.treeData, positionNode.id, response.data)
        // 更新当前选中节点的数据
        if (this.dataJson.currentJson && this.dataJson.currentJson.id === positionNode.id) {
          this.$set(this.dataJson.currentJson, 'staff_count', response.data)
        }
      }).catch(error => {
        console.error('更新岗位员工数量失败:', error)
      })
    },
    // 递归更新树节点中指定节点的员工数量显示
    updateTreeNodeStaffCount (treeData, nodeId, staffCount) {
      for (let i = 0; i < treeData.length; i++) {
        if (treeData[i].id === nodeId) {
          // 更新员工数量
          this.$set(treeData[i], 'staff_count', staffCount)
          // 更新节点显示标签
          if (staffCount > 0) {
            this.$set(treeData[i], 'label', treeData[i].name + `（员工数：${staffCount}）`)
          } else {
            this.$set(treeData[i], 'label', treeData[i].name)
          }
          return true
        }
        if (treeData[i].children && treeData[i].children.length > 0) {
          if (this.updateTreeNodeStaffCount(treeData[i].children, nodeId, staffCount)) {
            return true
          }
        }
      }
      return false
    },
    // 获取集团节点的显示数据结构
    getGroupDisplayData (subCount) {
      console.log(`[DEBUG] getGroupDisplayData接收到的数据:`, subCount, '类型:', typeof subCount)
      // 如果subCount是详细分类对象（包含sub_group_count和company_count）
      if (subCount && typeof subCount === 'object' &&
          subCount.hasOwnProperty('sub_group_count') &&
          subCount.hasOwnProperty('company_count')) {
        const links = []

        // 子集团数量大于0时才显示
        if (subCount.sub_group_count > 0) {
          links.push({
            type: 'sub_group',
            text: `子集团数:${subCount.sub_group_count}`,
            count: subCount.sub_group_count,
            url: '/group/group'
          })
        }

        // 企业数量大于0时才显示
        if (subCount.company_count > 0) {
          links.push({
            type: 'company',
            text: `企业数:${subCount.company_count}`,
            count: subCount.company_count,
            url: '/company/company'
          })
        }

        return {
          isDetailed: true,
          links: links,
          hasContent: links.length > 0
        }
      } else {
        // 如果是简单数字，继续显示原格式
        return {
          isDetailed: false,
          simpleText: `(${subCount || 0})`,
          hasContent: true
        }
      }
    },

    // 获取部门节点的显示数据结构
    getDeptDisplayData (subCount) {
      console.log(`[DEBUG] getDeptDisplayData接收到的数据:`, subCount, '类型:', typeof subCount)
      // 如果subCount是详细分类对象（包含sub_dept_count和position_count）
      if (subCount && typeof subCount === 'object' &&
          subCount.hasOwnProperty('sub_dept_count') &&
          subCount.hasOwnProperty('position_count')) {
        const links = []

        // 子部门数量大于0时才显示
        if (subCount.sub_dept_count > 0) {
          links.push({
            type: 'sub_dept',
            text: `子部门数:${subCount.sub_dept_count}`,
            count: subCount.sub_dept_count,
            url: '/dept/dept'
          })
        }

        // 岗位数量大于0时才显示
        if (subCount.position_count > 0) {
          links.push({
            type: 'position',
            text: `岗位数:${subCount.position_count}`,
            count: subCount.position_count,
            url: '/position/position'
          })
        }

        return {
          isDetailed: true,
          links: links,
          hasContent: links.length > 0
        }
      } else {
        // 如果是简单数字，继续显示原格式
        return {
          isDetailed: false,
          simpleText: `(${subCount || 0})`,
          hasContent: true
        }
      }
    },

    // 获取企业部门统计数据（手动选择时调用）
    loadCompanyDeptCount (companyId) {
      // 检查节点是否已有部门统计数据，如果没有才重新获取
      const currentNode = this.$refs.treeObject.getCurrentNode()
      if (currentNode && currentNode.id === companyId && currentNode.dept_count !== undefined) {
        // 如果已有数据，直接返回，避免重复API调用
        return
      }

      getSubCountApi(companyId, this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY)
        .then(response => {
          const deptCount = response.data.dept_count || 0

          // 获取当前选中的树节点并更新部门数量
          if (currentNode && currentNode.id === companyId) {
            this.$set(currentNode, 'dept_count', deptCount)
          }

          // 同时更新dataJson中的数据
          if (this.dataJson.currentJson) {
            this.$set(this.dataJson.currentJson, 'dept_count', deptCount)
          }
        })
        .catch(error => {
          console.error('获取企业部门统计失败:', error)
          // 失败时设置为0
          if (currentNode && currentNode.id === companyId) {
            this.$set(currentNode, 'dept_count', 0)
          }

          if (this.dataJson.currentJson) {
            this.$set(this.dataJson.currentJson, 'dept_count', 0)
          }
        })
    },

    // 处理链接点击事件
    handleLinkClick (linkData, nodeData) {
      // 阻止事件冒泡，避免触发树节点选择
      event.stopPropagation()

      // 根据链接类型进行不同处理
      switch (linkData.type) {
        case 'sub_group':
          // 跳转到集团页面
          this.$router.push(linkData.url)
          console.log('跳转到集团页面:', linkData.url, '当前节点:', nodeData.simple_name)
          break
        case 'company':
          // 跳转到企业页面
          this.$router.push(linkData.url)
          console.log('跳转到企业页面:', linkData.url, '当前节点:', nodeData.simple_name)
          break
        case 'sub_dept':
          // 跳转到部门页面
          this.$router.push(linkData.url)
          console.log('跳转到部门页面:', linkData.url, '当前节点:', nodeData.simple_name)
          break
        case 'position':
          // 跳转到岗位页面
          this.$router.push(linkData.url)
          console.log('跳转到岗位页面:', linkData.url, '当前节点:', nodeData.simple_name)
          break
        default:
          console.warn('未知的链接类型:', linkData.type)
      }
    },

    // 生成拖拽确认消息
    generateDragConfirmMessage (draggingNode, dropNode, dropType) {
      const dragNodeName = draggingNode.data.simple_name || draggingNode.data.label
      const dragNodeType = this.getOrgTagText(draggingNode.data.type)
      const dropNodeName = dropNode.data.simple_name || dropNode.data.label
      const dropNodeType = this.getOrgTagText(dropNode.data.type)
      const dropTypeText = this.getDropTypeText(dropType)
      const affectedInfo = this.getAffectedChildrenInfo(draggingNode)

      return `
        <div style="text-align: left; line-height: 1.6;">
          <p style="margin: 0 0 8px 0; font-size: 16px;"><strong>确认调整组织架构？</strong></p>
          <p style="margin: 0 0 8px 0;">
            <span style="color: #409EFF;">拖拽节点：</span>
            <strong style="color: #303133;">「${dragNodeName}」</strong>
            <span style="background: #E1F5FE; color: #0277BD; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${dragNodeType}</span>
          </p>
          <p style="margin: 0 0 8px 0;">
            <span style="color: #67C23A;">目标位置：</span>
            <strong style="color: #303133;">「${dropNodeName}」</strong>
            <span style="background: #E8F5E8; color: #388E3C; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${dropNodeType}</span>
            ${dropTypeText}
          </p>
          ${affectedInfo}
        </div>
      `
    },

    // 获取放置位置描述
    getDropTypeText (dropType) {
      switch (dropType) {
        case 'inner':
          return '<span style="color: #67C23A;"> 下</span>'
        case 'before':
          return '<span style="color: #E6A23C;"> 前</span>'
        case 'after':
          return '<span style="color: #E6A23C;"> 后</span>'
        default:
          return ''
      }
    },

    // 获取影响的子节点信息
    getAffectedChildrenInfo (node) {
      const childCount = this.getChildrenCount(node)
      if (childCount > 0) {
        return `
          <p style="margin: 0 0 8px 0; color: #F56C6C;">
            <i class="el-icon-info"></i>
            <strong>影响范围：</strong>将同时移动 <strong>${childCount}</strong> 个子节点
          </p>
        `
      }
      return ''
    },

    // 递归计算子节点数量
    getChildrenCount (node) {
      if (!node.children || node.children.length === 0) {
        return 0
      }

      let count = node.children.length
      node.children.forEach(child => {
        count += this.getChildrenCount(child)
      })

      return count
    },

    // 恢复树状态（撤销拖拽）
    restoreTreeState () {
      if (this.dragConfirmData.originalTreeData) {
        // 使用 Vue.set 确保响应式更新
        this.$set(this.dataJson, 'treeData', JSON.parse(JSON.stringify(this.dragConfirmData.originalTreeData)))

        // 清除保存的状态
        this.dragConfirmData.originalTreeData = null

        // 显示取消消息
        this.$message({
          type: 'info',
          message: '已取消组织架构调整',
          duration: 2000
        })

        // 强制重新渲染树组件
        this.$nextTick(() => {
          // 重新渲染树组件以确保视图同步
          if (this.$refs.treeObject) {
            // 强制重新渲染
            this.$refs.treeObject.$forceUpdate()

            // 如果有当前选中节点，重新设置选中状态
            if (this.dataJson.currentJson && this.dataJson.currentJson.id) {
              this.$refs.treeObject.setCurrentKey(this.dataJson.currentJson.id)
            }
          }
        })
      }
    },

    // 拖拽样式辅助方法

    /**
     * 计算拖拽类型
     * @param {Event} ev - 事件对象
     * @returns {String} dropType - 'inner', 'before', 'after'
     */
    calculateDropType (ev) {
      const nodeContent = ev.target.closest('.el-tree-node__content')
      if (!nodeContent) return null

      const rect = nodeContent.getBoundingClientRect()
      const y = ev.clientY - rect.top
      const height = rect.height

      // 根据鼠标位置判断拖拽类型
      if (y < height * 0.25) {
        return 'before' // 上方25%区域 - 插入前面
      } else if (y > height * 0.75) {
        return 'after' // 下方25%区域 - 插入后面
      } else {
        return 'inner' // 中间50%区域 - 成为子节点
      }
    },

    /**
     * 应用拖拽样式
     * @param {Element} target - 目标元素
     * @param {String} dropType - 拖拽类型
     */
    applyDragStyle (target, dropType) {
      const nodeContent = target.closest('.el-tree-node__content')
      if (!nodeContent) return

      // 清除之前的样式
      this.clearDragStyles()

      // 应用对应的样式类
      if (dropType === 'inner') {
        nodeContent.classList.add('drag-drop-inner')
      } else if (dropType === 'before') {
        nodeContent.classList.add('drag-drop-before')
      } else if (dropType === 'after') {
        nodeContent.classList.add('drag-drop-after')
      }
    },

    /**
     * 清除所有拖拽样式
     */
    clearDragStyles () {
      // 清除所有节点的拖拽样式类
      const allNodes = this.$el.querySelectorAll('.el-tree-node__content')
      allNodes.forEach(node => {
        node.classList.remove('drag-drop-inner', 'drag-drop-before', 'drag-drop-after')
      })
    }
  }
}
</script>

