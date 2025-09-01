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
            v-permission="'P_ORG:ADD'"
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
          content="修改当前选中的组织"
          placement="top"
        >
          <el-button
            v-permission="'P_ORG:EDIT'"
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
            v-permission="'P_ORG:DELETE'"
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
        @node-contextmenu="handleNodeContextMenu"
      >
        <span
          slot-scope="{ node, data }"
          class="custom-tree-node"
        >
          <!-- he-tree机制：虚拟占位节点渲染 -->
          <div v-if="Object.keys(data).length === 0" class="scm-virtual-placeholder">
            <i class="el-icon-download" style="color: #409EFF; margin-right: 4px;" />
            <span>拖拽到此处</span>
          </div>

          <!-- 正常节点渲染 -->
          <span v-else>
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
            <!-- 员工节点图标 -->
            <svg-icon
              v-else-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF"
              icon-class="perfect-icon-user"
              class="el-icon--right"
            />
            <span v-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT">
              组织机构根节点
              <!-- 显示根节点统计信息 -->
              <span v-if="data.countLoading" style="font-size: 12px; color: #606266;">（加载中...）</span>
              <span v-else-if="data.root_stats" style="font-size: 12px; color: #606266;">
                {{ data.root_stats }}
              </span>
            </span>
            <!-- 员工节点显示 -->
            <span v-else-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF">
              {{ data.label }}
              <span style="color: #909399; font-size: 12px;">
                {{ getStaffDisplayText(data) }}
              </span>
            </span>
            <span v-else-if="data.type !== CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT">
              {{ data.simple_name }}
              <!-- 集团类型显示子节点数量 -->
              <span v-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP" style="font-size: 12px;">
                <!-- 如果正在加载，显示loading -->
                <span v-if="data.countLoading" style="color: #E6A23C;">（加载中...）</span>
                <!-- 使用计算属性获取显示数据 -->
                <template v-else-if="getGroupDisplayData(data.sub_count).hasContent">
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
                <span v-if="data.countLoading">（加载中...）</span>
                <span v-else-if="data.dept_count > 0">（部门数：{{ data.dept_count }}）</span>
              </span>
              <!-- 部门类型显示子部门和岗位数量 -->
              <span v-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT" style="font-size: 12px;">
                <!-- 如果正在加载，显示loading -->
                <span v-if="data.countLoading" style="color: #67C23A;">（加载中...）</span>
                <!-- 使用计算属性获取显示数据 -->
                <template v-else-if="getDeptDisplayData(data.sub_count).hasContent">
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
              <!-- 岗位节点显示员工数量、角色数量和权限数量 -->
              <span
                v-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION"
                style="color: #909399; font-size: 12px;"
              >
                {{ getPositionDisplayText(data) }}
              </span>
            </span>
          </span>
          <!-- <span>[{{ data.type_text }}]</span> -->
          <el-tag
            v-if="data.type !== CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT && data.type !== CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF"
            :type="getOrgTagType(data.type)"
            size="mini"
            effect="dark"
            style="margin-left: 8px;"
          >
            {{ getOrgTagText(data.type) }}
          </el-tag>
          <!-- 员工节点标签 -->
          <el-tag
            v-if="data.type === CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF"
            type="success"
            size="mini"
            effect="plain"
            style="margin-left: 8px;"
          >
            员工
          </el-tag>
        </span>
      </el-tree>
    </div>

    <!-- 右键菜单 -->
    <ul
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      tabindex="-1"
      @blur="hideContextMenu"
    >
      <li
        v-for="(item, index) in contextMenu.items"
        :key="index"
        class="context-menu-item"
        :class="{ disabled: !item.enabled }"
        @click="handleContextMenuClick(item)"
      >
        <i :class="item.icon" />
        {{ item.label }}
      </li>
    </ul>

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
      :organization-context="dataJson.organizationContext"
      @closeMeOk="handleListDialogOk"
      @closeMeCancel="handleListDialogCancel"
    />

    <!-- 岗位角色管理弹窗 -->
    <position-role-dialog
      v-if="roleDialogData.visible"
      :id="roleDialogData.positionId"
      :visible="roleDialogData.visible"
      :data="roleDialogData.positionData"
      model="edit"
      @closeMeOk="handleRoleDialogOk"
      @closeMeCancel="handleRoleDialogCancel"
    />

    <!-- 岗位权限管理弹窗 -->
    <position-permission-dialog
      v-if="permissionDialogData.visible"
      :visible="permissionDialogData.visible"
      :position-id="permissionDialogData.positionId"
      @closeMeOk="handlePermissionDialogOk"
      @closeMeCancel="handlePermissionDialogCancel"
    />

    <!-- 员工编辑弹窗 -->
    <staff-edit-dialog
      v-if="popSettingsData.staffEditDialogData.visible"
      :visible="popSettingsData.staffEditDialogData.visible"
      :data="popSettingsData.staffEditDialogData.data"
      :dialog-status="PARAMETERS.STATUS_UPDATE"
      @closeMeOk="handleStaffEditDialogOk"
      @closeMeCancel="handleStaffEditDialogCancel"
    />

    <!-- 员工角色管理弹窗 -->
    <staff-role-dialog
      v-if="popSettingsData.staffRoleDialogData.visible"
      :visible="popSettingsData.staffRoleDialogData.visible"
      :staff-id="popSettingsData.staffRoleDialogData.staffId"
      @closeMeOk="handleStaffRoleDialogOk"
      @closeMeCancel="handleStaffRoleDialogCancel"
    />

    <!-- 员工权限管理弹窗 -->
    <staff-permission-dialog
      v-if="popSettingsData.staffPermissionDialogData.visible"
      :visible="popSettingsData.staffPermissionDialogData.visible"
      :staff-id="popSettingsData.staffPermissionDialogData.staffId"
      @closeMeOk="handleStaffPermissionDialogOk"
      @closeMeCancel="handleStaffPermissionDialogCancel"
    />

    <!-- 员工权限排除弹窗 -->
    <staff-exclude-permission-dialog
      v-if="popSettingsData.staffExcludePermissionDialogData.visible"
      :visible="popSettingsData.staffExcludePermissionDialogData.visible"
      :staff-id="popSettingsData.staffExcludePermissionDialogData.staffId"
      @closeMeOk="handleStaffExcludePermissionDialogOk"
      @closeMeCancel="handleStaffExcludePermissionDialogCancel"
    />

    <!-- 员工删除确认弹窗 -->
    <StaffDeleteConfirmDialog
      v-model="popSettingsData.staffDeleteDialogData.visible"
      :staff-info="popSettingsData.staffDeleteDialogData.staffInfo"
      @confirm="handleStaffDeleteConfirm"
      @cancel="handleStaffDeleteCancel"
    />

    <!-- 跟随鼠标的文字提示 -->
    <div
      v-show="mouseFollowTip.visible"
      class="mouse-follow-tip"
      :style="{
        left: mouseFollowTip.x + 'px',
        top: mouseFollowTip.y + 'px'
      }"
    >
      {{ mouseFollowTip.text }}
    </div>

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

  /* 子级拖拽样式 - 红色背景+文字 */
  .drag-drop-inner {
    background: linear-gradient(90deg, #fff0f0 0%, #ffe8e8 100%) !important;
    border: 3px solid #F56C6C !important;
    border-radius: 8px !important;
    position: relative !important;
    box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3) !important;
  }

  .drag-drop-inner::after {
    content: '📁 成为子节点';
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: #F56C6C;
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
    top: -3px;
    left: 20px;
    right: 10px;
    height: 4px;
    background: linear-gradient(90deg, #F56C6C 0%, #FF7979 100%);
    border-radius: 2px;
    z-index: 9998;
    box-shadow: 0 2px 8px rgba(245, 108, 108, 0.5);
    border: 1px solid #F56C6C;
    pointer-events: none;
  }

  .drag-drop-before::after {
    content: '⬆️ 插入上方';
    position: absolute;
    top: -16px;
    right: 10px;
    background: #F56C6C;
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: bold;
    z-index: 10000;
    white-space: nowrap;
    box-shadow: 0 2px 6px rgba(245, 108, 108, 0.7);
    pointer-events: none;
    display: block;
  }

  /* he-tree机制：虚拟占位节点样式 - 保持SCM红色风格 */
  .scm-virtual-placeholder {
    height: 32px;
    width: 100%; /* 占满容器宽度，与正常节点保持一致 */
    background: linear-gradient(90deg, #fff0f0 0%, #ffe8e8 100%);
    border: 2px dashed #F56C6C;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #F56C6C;
    font-size: 12px;
    font-weight: bold;
    margin: 2px auto;
    opacity: 0.9;
    animation: placeholderPulse 1.5s ease-in-out infinite;
    box-sizing: border-box;
    white-space: nowrap;
  }

  @keyframes placeholderPulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }

  .el-icon--right {
    margin-left: 0px;
  }

  /* 员工Loading转圈动画 - 原生样式 */
  .staff-loading-icon {
    animation: loading-rotate 2s linear infinite;
  }

  @keyframes loading-rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* 🎯 精确的节点选中状态颜色控制 - 只影响选中节点 */
  .el-tree-node.is-current > .el-tree-node__content {
    /* 企业部门数量: 蓝色 → 白色 */
    .company-dept-count,
    span[style*="color: #409EFF"],
    span[style*="color:#409EFF"] {
      color: white !important;
    }

    /* 部门统计数据: 绿色 → 白色 */
    span[style*="color: #67C23A"],
    span[style*="color:#67C23A"] {
      color: white !important;
    }

    /* 岗位员工数量: 灰色 → 白色 */
    span[style*="color: #909399"],
    span[style*="color:#909399"] {
      color: white !important;
    }

    /* 集团统计数据: 橙色 → 白色 */
    span[style*="color: #E6A23C"],
    span[style*="color:#E6A23C"] {
      color: white !important;
    }

    /* Element UI 链接组件颜色覆盖 */
    .el-link--success,
    .el-link--warning {
      color: white !important;
    }

    /* 所有描述文字 */
    .custom-tree-node span[style*="color"],
    .custom-tree-node .el-link {
      color: white !important;
    }
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

<style scoped>
/* 右键菜单样式 */
.context-menu {
  position: fixed !important;
  z-index: 9999 !important;
  background: white !important;
  border: 1px solid #ebeef5 !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
  padding: 4px 0 !important;
  margin: 0 !important;
  list-style: none !important;
  min-width: 120px !important;
  max-width: 200px !important;
  outline: none !important;
  display: block !important;
  font-family: inherit !important;
}

.context-menu-item {
  display: flex !important;
  align-items: center !important;
  padding: 8px 16px !important;
  font-size: 14px !important;
  color: #606266 !important;
  cursor: pointer !important;
  transition: background-color 0.2s !important;
  line-height: 1.4 !important;
  white-space: nowrap !important;
  min-height: 32px !important;
  box-sizing: border-box !important;
  user-select: none !important;
}

.context-menu-item:hover:not(.disabled) {
  background-color: #f5f7fa !important;
  color: #409eff !important;
}

.context-menu-item.disabled {
  color: #c0c4cc !important;
  cursor: not-allowed !important;
}

.context-menu-item.disabled:hover {
  background-color: transparent !important;
  color: #c0c4cc !important;
}

.context-menu-item i {
  margin-right: 8px !important;
  font-size: 16px !important;
  width: 16px !important;
  text-align: center !important;
  flex-shrink: 0 !important;
}

/* 分隔线样式（如果需要的话） */
.context-menu-divider {
  height: 1px !important;
  background-color: #e4e7ed !important;
  margin: 4px 0 !important;
}
</style>

<script>
import { EventBus } from '@/common/eventbus/eventbus'
import { getCorrectTypeByInsertStatusApi, getTreeListApi, insertApi, dragsaveApi, getSubCountApi, getRootStatisticsApi, getEmployeesForTreeApi } from '@/api/20_master/org/org'
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
// 新增：引入角色和权限管理弹窗组件
import positionRoleDialog from '@/views/10_system/role/component/dialog/listfor/position/index.vue'
import positionPermissionDialog from '@/views/20_master/permission/component/dialog/listfor/position/index.vue'
// 新增：引入员工相关弹窗组件
import staffEditDialog from '@/views/20_master/staff/dialog/30_edit/index.vue'
import staffRoleDialog from '@/views/10_system/role/component/dialog/listfor/staff/index.vue'
import staffPermissionDialog from '@/views/20_master/permission/component/dialog/listfor/staff/index.vue'
import staffExcludePermissionDialog from '@/views/20_master/permission/component/dialog/listfor/staffexclude/index.vue'
// 新增：引入员工删除确认对话框组件
import StaffDeleteConfirmDialog from '@/components/30_table/StaffDeleteConfirmDialog/index.vue'
import { isNotEmpty } from '@/utils/index.js'
import { convertEmployeesToTreeNodes, isPositionNode } from '@/utils/treeHelper'
import { getDataByIdApi as getPositionByIdApi, getPositionAssignedRoleIdsApi } from '@/api/20_master/position/position'
import { getPositionAssignedPermissionIdsApi } from '@/api/20_master/permission/permission'
import { getByIdApi as getGroupByIdApi } from '@/api/20_master/group/group'
import { getByIdApi as getCompanyByIdApi } from '@/api/20_master/company/company'
import { getByIdApi as getDeptByIdApi } from '@/api/20_master/dept/dept'
// 新增：引入员工相关API
import { getApi as getStaffByIdApi, getStaffAssignedRoleIds, getStaffAssignedPermissionIds, getStaffExcludedPermissionIds, removeFromOrgTreeApi, deleteFromOrgApi } from '@/api/20_master/staff/staff'
// 新增：引入各节点类型的删除API
import { deleteOrgApi as deleteGroupApi } from '@/api/20_master/group/group'
import { deleteOrgApi as deleteCompanyApi } from '@/api/20_master/company/company'
import { deleteOrgApi as deleteDeptApi } from '@/api/20_master/dept/dept'
import { deleteOrgApi as deletePositionApi } from '@/api/20_master/position/position'
import { deleteApi as deleteStaffApi } from '@/api/20_master/staff/staff'
import permission from '@/directive/permission/index.js' // 权限判断指令
// import '@/styles/org_png.scss' // 已改用el-tag，不再需要图片样式

export default {
  // name: 'P00000171', // 页面id，和router中的name需要一致，作为缓存
  components: {
    groupDialog, companyDialog, deptDialog, positionDialog, setPositionDialog,
    groupListDialog, companyListDialog, deptListDialog, positionListDialog, staffListDialog,
    positionRoleDialog, positionPermissionDialog,
    staffEditDialog, staffRoleDialog, staffPermissionDialog, staffExcludePermissionDialog,
    StaffDeleteConfirmDialog
  },
  directives: { elDragDialog, permission },
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
        // 树组件配置
        defaultProps: {
          children: 'children',
          label: 'label',
          isLeaf: 'isLeaf'
        },
        tempJson: {
          org_type: ''
        },
        tempJsonOriginal: null,
        // 当前选中的组织节点上下文
        organizationContext: {
          selectedNode: null, // 当前选中的树节点
          companyInfo: null, // 提取的公司信息
          departmentInfo: null // 提取的部门信息
        }
      },
      // 页面设置json
      settings: {
        para: this.CONSTANTS.DICT_ORG_SETTING_TYPE,
        filterPara: [],
        loading: true,
        // 员工数据加载标志位
        isLoadingEmployees: false,
        // 按钮状态：是否可用
        btnDisabledStatus: {
          disabledInsert: true,
          disabledUpdate: true,
          disabledDelete: true
        },
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        // 节点类型与删除API的映射关系
        deleteApiMap: {
          '20': deleteGroupApi, // 集团
          '30': deleteCompanyApi, // 主体企业
          '40': deleteDeptApi, // 部门
          '50': deletePositionApi, // 岗位
          '60': deleteStaffApi // 员工
        },
        // 节点类型中文名映射
        nodeTypeNames: {
          '20': '集团',
          '30': '主体企业',
          '40': '部门',
          '50': '岗位',
          '60': '员工'
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
        // 员工编辑弹窗参数设置
        staffEditDialogData: {
          visible: false,
          data: null
        },
        // 员工角色管理弹窗参数设置
        staffRoleDialogData: {
          visible: false,
          staffId: null
        },
        // 员工权限管理弹窗参数设置
        staffPermissionDialogData: {
          visible: false,
          staffId: null
        },
        // 员工权限排除弹窗参数设置
        staffExcludePermissionDialogData: {
          visible: false,
          staffId: null
        },
        // 员工删除确认弹窗参数设置
        staffDeleteDialogData: {
          visible: false,
          staffInfo: {
            name: '',
            code: '',
            id: null
          }
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
      },
      // 右键菜单相关数据
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        items: [],
        currentNode: null, // 当前右键的节点
        currentData: null // 当前右键的节点数据
      },
      // 角色管理弹窗状态
      roleDialogData: {
        visible: false,
        positionId: null,
        positionData: null
      },
      // 权限管理弹窗状态
      permissionDialogData: {
        visible: false,
        positionId: null,
        positionData: null
      },
      // 跟随鼠标的文字提示
      mouseFollowTip: {
        visible: false,
        x: 0,
        y: 0,
        text: '测试'
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

    // 绑定鼠标移动事件监听器 - 用于跟随鼠标的文字提示
    document.addEventListener('mousemove', this.handleMouseMove)
  },
  beforeDestroy () {
    // 移除鼠标移动事件监听器，防止内存泄漏
    document.removeEventListener('mousemove', this.handleMouseMove)
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
        // 加载根节点统计信息
        this.loadRootStatistics()
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

      // 提取组织上下文信息
      this.extractOrganizationContext(row)

      // 通知兄弟组件
      // EventBus.$off(this.EMITS.EMIT_ORG_CHANGE)
      EventBus.$emit(this.EMITS.EMIT_ORG_CHANGE, row)
    },

    // 提取组织上下文信息
    extractOrganizationContext (node) {
      if (!this.dataJson || !this.dataJson.organizationContext) {
        console.warn('dataJson or organizationContext is not initialized')
        return
      }

      if (!node) {
        this.dataJson.organizationContext.selectedNode = null
        this.dataJson.organizationContext.companyInfo = null
        this.dataJson.organizationContext.departmentInfo = null
        return
      }

      this.dataJson.organizationContext.selectedNode = node

      // 根据节点类型提取相应信息
      switch (node.type) {
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
          // 企业节点：设置公司信息，清空部门信息
          this.dataJson.organizationContext.companyInfo = {
            id: node.serial_id,
            name: node.simple_name,
            code: node.code
          }
          this.dataJson.organizationContext.departmentInfo = null
          break

        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
          // 部门节点：设置部门信息，同时查找父级企业信息
          this.dataJson.organizationContext.departmentInfo = {
            id: node.serial_id,
            name: node.simple_name,
            code: node.code
          }

          // 查找父级企业信息
          this.findParentCompany(node)
          break

        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
          // 岗位节点：查找父级部门和企业信息
          this.findParentDepartmentAndCompany(node)
          break

        default:
          // 其他类型节点：清空上下文信息
          this.dataJson.organizationContext.companyInfo = null
          this.dataJson.organizationContext.departmentInfo = null
          break
      }
    },

    // 递归查找父级企业信息
    findParentCompany (node) {
      if (!node || !node.parent_id || !this.dataJson || !this.dataJson.treeData) return

      const parentNode = this.findNodeInTree(this.dataJson.treeData, node.parent_id)

      if (parentNode) {
        if (parentNode.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY) {
          // 找到企业节点
          this.dataJson.organizationContext.companyInfo = {
            id: parentNode.serial_id,
            name: parentNode.simple_name,
            code: parentNode.code
          }
        } else {
          // 继续向上查找
          this.findParentCompany(parentNode)
        }
      }
    },

    // 查找父级部门和企业信息（用于岗位节点）
    findParentDepartmentAndCompany (node) {
      if (!node || !node.parent_id || !this.dataJson || !this.dataJson.treeData) return

      const parentNode = this.findNodeInTree(this.dataJson.treeData, node.parent_id)

      if (parentNode) {
        if (parentNode.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT) {
          // 找到部门节点
          this.dataJson.organizationContext.departmentInfo = {
            id: parentNode.serial_id,
            name: parentNode.simple_name,
            code: parentNode.code
          }
          // 继续查找父级企业
          this.findParentCompany(parentNode)
        } else if (parentNode.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY) {
          // 直接找到企业节点
          this.dataJson.organizationContext.companyInfo = {
            id: parentNode.serial_id,
            name: parentNode.simple_name,
            code: parentNode.code
          }
        }
      }
    },

    // 在树数据中递归查找指定ID的节点
    findNodeInTree (treeData, nodeId) {
      if (!treeData || !Array.isArray(treeData)) return null

      for (const node of treeData) {
        if (node.id === nodeId) {
          return node
        }

        if (node.children && node.children.length > 0) {
          const found = this.findNodeInTree(node.children, nodeId)
          if (found) return found
        }
      }

      return null
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
          // 员工节点：调用员工编辑方法
          this.handleStaffEdit(this.dataJson.currentJson)
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
      const currentNode = this.dataJson.currentJson
      if (!currentNode) {
        this.$message.warning('请先选择要删除的节点')
        return
      }

      const nodeType = currentNode.type
      const typeName = this.settings.nodeTypeNames[nodeType] || '节点'
      const nodeName = currentNode.label || currentNode.name || '未命名节点'

      // 员工删除：显示专门的删除确认对话框
      if (nodeType === this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF) {
        // 设置员工信息并显示删除确认对话框
        this.popSettingsData.staffDeleteDialogData.staffInfo = {
          name: nodeName,
          code: currentNode.code || '未知编码',
          id: currentNode.serial_id,
          dbversion: currentNode.dbversion
        }
        this.popSettingsData.staffDeleteDialogData.visible = true
        return
      }

      // 其他节点类型：使用原有的删除确认逻辑
      this.$confirm(`确定要删除${typeName}「${nodeName}」吗？此操作将同时删除所有子节点且不可恢复。`, '删除确认', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.doDelete()
      }).catch(action => {
        // 用户取消删除操作
      })
    },
    handleRefresh () {
      // 初始化查询
      this.getDataList()
    },
    doDelete () {
      // 获取当前节点信息
      const currentNode = this.dataJson.currentJson
      if (!currentNode) {
        this.$message.warning('请先选择要删除的节点')
        return
      }

      // 获取节点类型
      const nodeType = currentNode.type
      const typeName = this.settings.nodeTypeNames[nodeType] || '节点'
      const deleteApi = this.settings.deleteApiMap[nodeType]

      if (!deleteApi) {
        this.$message.error(`不支持的节点类型: ${nodeType}`)
        return
      }

      // 调用对应的删除API - 使用实体ID而不是树节点ID
      deleteApi({
        id: currentNode.serial_id, // 使用实体ID (如：m_dept.id = 37)
        dbversion: currentNode.dbversion
      }).then((_data) => {
        this.$notify({
          title: '删除处理成功',
          message: `${typeName}删除成功`,
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
          title: '删除处理失败',
          message: `${typeName}删除失败: ${_error.message}`,
          type: 'error',
          duration: this.settings.duration
        })
        this.popSettingsData.dialogFormVisible = false
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
        // 刷新树数据以确保缓存同步
        this.handleTreeRefresh()
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
        // 刷新树数据以确保缓存同步
        this.handleTreeRefresh()
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
        // 刷新树数据以确保缓存同步
        this.handleTreeRefresh()
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
        // 刷新树数据以确保缓存同步
        this.handleTreeRefresh()
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
          // 统一刷新整个树，确保新增的节点能够正确显示
          this.handleTreeRefresh()
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

      // he-tree机制：拖拽开始时清理虚拟节点
      this.removeVirtualPlaceholder()

      // 拖拽开始时，初始化鼠标跟随提示状态
      this.hideMouseFollowTip()
    },

    handleDragEnter (draggingNode, dropNode, ev) {
      // 更新鼠标位置（拖拽时确保位置跟随）
      this.updateMousePosition(ev)

      // he-tree机制：先移除旧虚拟节点
      this.removeVirtualPlaceholder()

      // 计算拖拽类型
      const dropType = this.calculateDropType(ev)
      const allowDrop = dropType && this.allowDrop(draggingNode, dropNode, dropType)

      if (allowDrop) {
        // he-tree机制：插入虚拟占位节点
        this.insertVirtualPlaceholder(dropNode, dropType)
        // 允许拖拽时隐藏跟随鼠标的提示
        this.hideMouseFollowTip()
      } else {
        // 不允许拖拽时显示具体的错误原因
        const failureReason = this.getDropFailureReason(draggingNode, dropNode, dropType)
        this.showMouseFollowTip(failureReason)
      }
    },

    handleDragLeave (draggingNode, dropNode, ev) {
      // 更新鼠标位置（拖拽时确保位置跟随）
      this.updateMousePosition(ev)

      // he-tree机制：离开节点时移除虚拟占位节点
      setTimeout(() => {
        this.removeVirtualPlaceholder()
      }, 50)

      // 离开节点时隐藏跟随鼠标的提示
      this.hideMouseFollowTip()
    },

    handleDragOver (draggingNode, dropNode, ev) {
      // 更新鼠标位置（拖拽时确保位置跟随） - 这是最重要的事件
      this.updateMousePosition(ev)

      // he-tree机制：先移除旧虚拟节点
      this.removeVirtualPlaceholder()

      // 计算拖拽类型
      const dropType = this.calculateDropType(ev)
      const allowDrop = dropType && this.allowDrop(draggingNode, dropNode, dropType)

      if (allowDrop) {
        // he-tree机制：插入虚拟占位节点
        this.insertVirtualPlaceholder(dropNode, dropType)
        // 允许拖拽时隐藏跟随鼠标的提示
        this.hideMouseFollowTip()
      } else {
        // 不允许拖拽时显示具体的错误原因
        const failureReason = this.getDropFailureReason(draggingNode, dropNode, dropType)
        this.showMouseFollowTip(failureReason)
      }
    },

    handleDragEnd (draggingNode, dropNode, dropType, ev) {
      // 更新鼠标位置（拖拽时确保位置跟随）
      if (ev) this.updateMousePosition(ev)

      // he-tree机制：拖拽结束时移除虚拟占位节点
      this.removeVirtualPlaceholder()

      // 拖拽结束时确保隐藏跟随鼠标的提示
      this.hideMouseFollowTip()
    },
    /**
     * 拖拽结束后事件
     * draggingNode:被拖拽结点对应的 Node
     * dropNode:结束拖拽时最后进入的结点
     * dropType:被拖拽结点的放置位置（before、after、inner）
     * ev:event
     */
    handleDrop (draggingNode, dropNode, dropType, ev) {
      // 更新鼠标位置（最后一次位置更新）
      if (ev) this.updateMousePosition(ev)

      // 拖拽结束，隐藏跟随鼠标的提示
      this.hideMouseFollowTip()

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
        // 刷新树数据
        this.handleTreeRefresh()
        this.popSettingsData.dialogFormVisible = false
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

      // 处理员工节点拖拽验证
      if (draggingNode.data.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF) {
        // 员工只能拖拽到岗位节点，且必须是放入内部
        if (dropNode.data.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION && type === 'inner') {
          return true
        }
        // 员工不能拖拽到其他类型节点
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

    /**
     * 获取拖拽失败的具体原因
     * @param {Object} draggingNode - 被拖拽的节点
     * @param {Object} dropNode - 目标节点
     * @param {String} type - 拖拽类型 ('before', 'after', 'inner')
     * @returns {String} 失败原因描述
     */
    getDropFailureReason (draggingNode, dropNode, type) {
      // 不得放到根目录位置
      if (!isNotEmpty(dropNode.data.parent_id)) {
        return '不能放置到根目录位置'
      }

      // 处理员工节点拖拽限制
      if (draggingNode.data.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF) {
        // 员工只能拖拽到岗位节点内部
        if (dropNode.data.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION) {
          if (type !== 'inner') {
            return '员工只能分配到岗位内部'
          }
        } else {
          // 员工不能拖拽到其他类型节点
          switch (dropNode.data.type) {
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
              return '员工不能直接归属于集团'
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
              return '员工不能直接归属于企业'
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
              return '员工不能直接归属于部门'
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT:
              return '员工不能直接归属于租户'
            default:
              return '员工只能分配到岗位下'
          }
        }
      }

      // 处理其他节点类型的拖拽限制
      switch (draggingNode.data.type) {
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
          // 集团拖拽限制
          switch (dropNode.data.type) {
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
              return '集团不能作为企业的子级'
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
              return '集团不能作为部门的子级'
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
              return '集团不能作为岗位的子级'
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF:
              return '集团不能作为员工的子级'
            default:
              return '集团只能在租户或其他集团下'
          }

        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
          // 企业拖拽限制
          switch (dropNode.data.type) {
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
              if (dropNode.data.code.length <= 8 && type === 'prev') {
                return '不能放置到此集团前面'
              }
              break
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
              if (type === 'inner') {
                return '企业不能嵌套到其他企业内部'
              }
              break
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
              return '企业不能作为部门的子级'
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
              return '企业不能作为岗位的子级'
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF:
              return '企业不能作为员工的子级'
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT:
              return '企业不能直接归属于租户'
            default:
              return '企业只能在集团下或与其他企业平级'
          }
          break

        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
          // 部门拖拽限制
          switch (dropNode.data.type) {
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
              return '部门不能直接归属于集团'
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
              if (type !== 'inner') {
                return '部门只能在企业内部'
              }
              break
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
              return '部门不能作为岗位的子级'
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF:
              return '部门不能作为员工的子级'
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT:
              return '部门不能直接归属于租户'
            default:
              return '部门只能在企业内部或其他部门下'
          }
          break

        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
          // 岗位拖拽限制
          switch (dropNode.data.type) {
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
              return '岗位不能直接归属于集团'
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
              return '岗位不能直接归属于企业'
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
              if (type !== 'inner') {
                return '岗位只能在部门内部'
              }
              break
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
              if (type === 'inner') {
                return '岗位不能嵌套到其他岗位内部'
              }
              break
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF:
              return '岗位不能作为员工的子级'
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT:
              return '岗位不能直接归属于租户'
            default:
              return '岗位只能在部门内部或与其他岗位平级'
          }
          break

        default:
          return '不支持此类型的拖拽操作'
      }

      return '不允许的拖拽操作'
    },
    // 允许拖拽的情况
    allowDrag (draggingNode) {
      // 员工节点允许拖拽（即使没有parent_id）
      if (draggingNode.data.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF) {
        return true
      }

      // 其他节点需要有parent_id才能拖拽
      if (isNotEmpty(draggingNode.data.parent_id)) {
        return true
      } else {
        return false
      }
    },

    /**
     * 鼠标移动处理函数 - 更新跟随鼠标提示的位置
     */
    handleMouseMove (event) {
      this.updateMousePosition(event)
    },

    /**
     * 更新鼠标位置 - 从事件对象中提取坐标
     * @param {Event} event - 鼠标事件或拖拽事件
     */
    updateMousePosition (event) {
      // 拖拽事件和鼠标事件都有 clientX 和 clientY 属性
      if (event && typeof event.clientX !== 'undefined' && typeof event.clientY !== 'undefined') {
        this.mouseFollowTip.x = event.clientX
        this.mouseFollowTip.y = event.clientY
      }
    },

    /**
     * 显示跟随鼠标的文字提示
     * @param {String} text - 要显示的文字
     */
    showMouseFollowTip (text = '测试') {
      this.mouseFollowTip.visible = true
      this.mouseFollowTip.text = text
    },

    /**
     * 隐藏跟随鼠标的文字提示
     */
    hideMouseFollowTip () {
      this.mouseFollowTip.visible = false
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
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF:
          return '员工'
        default:
          return ''
      }
    },

    /**
     * 为所有岗位节点直接加载员工数据 - 简化版本，不使用懒加载
     */
    async loadAllEmployeesForPositions () {
      // 防止重复调用
      if (this.settings.isLoadingEmployees) {
        return
      }
      this.settings.isLoadingEmployees = true

      try {
        // 递归查找所有岗位节点
        const positionNodes = this.findAllPositionNodes(this.dataJson.treeData)

        if (positionNodes.length === 0) {
          return
        }

        // 第一步：为所有岗位节点设置loading状态
        positionNodes.forEach(positionNode => {
          this.$set(positionNode, 'staffLoading', true)
        })

        // 强制更新界面
        this.$forceUpdate()

        // 第二步：逐个加载员工数据
        for (const positionNode of positionNodes) {
          try {
            // 调用API获取员工数据
            const response = await getEmployeesForTreeApi(positionNode.code)
            const staffList = response.data?.list || []

            if (staffList.length > 0) {
              // 转换员工数据为树节点格式
              const employeeNodes = convertEmployeesToTreeNodes(staffList, positionNode.code)

              // 直接设置子节点
              this.$set(positionNode, 'children', employeeNodes)

              // 同步更新员工数量统计
              this.$set(positionNode, 'staff_count', employeeNodes.length)
            } else {
              // 没有员工时，确保staff_count为0
              this.$set(positionNode, 'staff_count', 0)
            }
          } catch (error) {
            // 静默处理错误，不影响其他岗位加载
          } finally {
            // 第三步：逐个清除loading状态
            this.$set(positionNode, 'staffLoading', false)
          }
        }
      } finally {
        this.settings.isLoadingEmployees = false
      }

      // 员工节点创建完成后，立即加载统计数据
      await this.loadStaffStatsForAllEmployees()
    },

    /**
     * 递归查找所有岗位节点
     */
    findAllPositionNodes (treeData) {
      const positionNodes = []

      const traverse = (nodes) => {
        if (!Array.isArray(nodes)) return

        nodes.forEach(node => {
          // 检查是否为岗位节点
          if (isPositionNode(node)) {
            positionNodes.push(node)
          }

          // 递归查找子节点
          if (node.children && Array.isArray(node.children)) {
            traverse(node.children)
          }
        })
      }

      traverse(treeData)
      return positionNodes
    },

    /**
     * 递归查找所有员工节点
     */
    findAllStaffNodes (treeData) {
      const staffNodes = []

      const traverse = (nodes) => {
        if (!Array.isArray(nodes)) return

        nodes.forEach(node => {
          // 检查是否为员工节点
          if (node.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF) {
            staffNodes.push(node)
          }

          // 递归查找子节点
          if (node.children && Array.isArray(node.children)) {
            traverse(node.children)
          }
        })
      }

      traverse(treeData)
      return staffNodes
    },

    /**
     * 为所有员工节点加载统计数据
     */
    async loadStaffStatsForAllEmployees () {
      try {
        // 递归查找所有员工节点
        const staffNodes = this.findAllStaffNodes(this.dataJson.treeData)

        if (staffNodes.length === 0) {
          return
        }

        // 为每个员工节点并行获取统计数据
        const promises = staffNodes.map(async (staffNode) => {
          try {
            // 数据验证
            if (!staffNode.serial_id) {
              return
            }

            // 并行获取员工的角色数、权限数和排除权限数
            const responses = await Promise.all([
              getStaffAssignedRoleIds({ staff_id: staffNode.serial_id }), // 角色数
              getStaffAssignedPermissionIds({ staff_id: staffNode.serial_id }), // 权限数
              getStaffExcludedPermissionIds({ staff_id: staffNode.serial_id }) // 排除权限数
            ])

            // 使用this.$set确保响应式更新
            this.$set(staffNode, 'role_count', Array.isArray(responses[0].data) ? responses[0].data.length : 0)
            this.$set(staffNode, 'permission_count', Array.isArray(responses[1].data) ? responses[1].data.length : 0)
            this.$set(staffNode, 'exclude_permission_count', Array.isArray(responses[2].data) ? responses[2].data.length : 0)
          } catch (error) {
            // 设置默认值
            this.$set(staffNode, 'role_count', 0)
            this.$set(staffNode, 'permission_count', 0)
            this.$set(staffNode, 'exclude_permission_count', 0)
          }
        })

        // 等待所有员工统计数据加载完成
        await Promise.all(promises)

        // 强制Vue重新渲染，确保统计数据显示
        this.$forceUpdate()
      } catch (error) {
        console.error('加载员工统计数据时发生错误:', error)
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
            this.$set(node, 'countLoading', true)
            getSubCountApi(node.id, node.type).then(response => {
              // 使用this.$set确保响应式更新
              this.$set(node, 'sub_count', response.data)
            }).catch(error => {
              console.error('获取集团子节点数量失败:', error)
              this.$set(node, 'sub_count', 0)
            }).finally(() => {
              this.$set(node, 'countLoading', false)
            })
          } else if (node.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY) {
            // 企业类型：只调用一次API获取部门统计（包含dept_count）
            this.$set(node, 'countLoading', true)
            getSubCountApi(node.id, this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY).then(response => {
              const deptCount = response.data.dept_count || 0
              this.$set(node, 'dept_count', deptCount)
              // 不再需要单独的sub_count，部门数量就是其子节点数量
              this.$set(node, 'sub_count', response.data)
            }).catch(error => {
              console.error('获取企业部门统计失败:', error)
              this.$set(node, 'dept_count', 0)
              this.$set(node, 'sub_count', 0)
            }).finally(() => {
              this.$set(node, 'countLoading', false)
            })
          } else if (node.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT) {
            // 部门类型：获取详细的子部门和岗位统计
            this.$set(node, 'countLoading', true)
            getSubCountApi(node.id, node.type).then(response => {
              // 使用this.$set确保响应式更新
              this.$set(node, 'sub_count', response.data)
            }).catch(error => {
              console.error('获取部门子节点统计失败:', error)
              this.$set(node, 'sub_count', 0)
            }).finally(() => {
              this.$set(node, 'countLoading', false)
            })
          } else if (node.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION) {
            // 岗位类型：并行获取角色数量和权限数量统计，员工数直接从子节点计算
            this.$set(node, 'countLoading', true)

            // 如果已经有员工子节点，直接使用子节点数量作为员工数
            const actualStaffCount = node.children ? node.children.filter(child => child.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF).length : 0
            this.$set(node, 'staff_count', actualStaffCount)

            Promise.all([
              getPositionAssignedRoleIdsApi({ position_id: node.serial_id }), // 角色数
              getPositionAssignedPermissionIdsApi({ position_id: node.serial_id }) // 权限数
            ]).then(responses => {
              // 使用this.$set确保响应式更新，员工数保持从子节点计算的值
              this.$set(node, 'role_count', Array.isArray(responses[0].data) ? responses[0].data.length : 0)
              this.$set(node, 'permission_count', Array.isArray(responses[1].data) ? responses[1].data.length : 0)
            }).catch(error => {
              console.error('获取岗位统计数据失败:', error)
              // 设置默认值（员工数保持从子节点计算的值）
              this.$set(node, 'role_count', 0)
              this.$set(node, 'permission_count', 0)
            }).finally(() => {
              this.$set(node, 'countLoading', false)
            })
          } else if (node.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF) {
            // 员工类型：并行获取角色数量、权限数量和排除权限数量统计
            this.$set(node, 'countLoading', true)
            Promise.all([
              getStaffAssignedRoleIds({ staff_id: node.serial_id }), // 角色数
              getStaffAssignedPermissionIds({ staff_id: node.serial_id }), // 权限数
              getStaffExcludedPermissionIds({ staff_id: node.serial_id }) // 排除权限数
            ]).then(responses => {
              // 使用this.$set确保响应式更新
              this.$set(node, 'role_count', Array.isArray(responses[0].data) ? responses[0].data.length : 0)
              this.$set(node, 'permission_count', Array.isArray(responses[1].data) ? responses[1].data.length : 0)
              this.$set(node, 'exclude_permission_count', Array.isArray(responses[2].data) ? responses[2].data.length : 0)
            }).catch(error => {
              console.error('获取员工统计数据失败:', error)
              // 设置默认值
              this.$set(node, 'role_count', 0)
              this.$set(node, 'permission_count', 0)
              this.$set(node, 'exclude_permission_count', 0)
            }).finally(() => {
              this.$set(node, 'countLoading', false)
            })
          }
        }

        // 递归处理子节点
        if (node.children && node.children.length > 0) {
          this.loadSubCount(node.children)
        }
      })
    },
    // 加载根节点统计信息
    loadRootStatistics () {
      // 查找根节点（通常是第一个节点，且没有parent_id）
      const rootNode = this.dataJson.treeData.find(node => !node.parent_id)
      if (rootNode) {
        this.$set(rootNode, 'countLoading', true)
      }

      getRootStatisticsApi().then(response => {
        const stats = response.data

        if (rootNode) {
          // 添加统计信息到根节点标签
          const statsText = `（集团数：${stats.group_count}、主体企业数：${stats.company_count}、岗位数：${stats.position_count}、员工数：${stats.staff_count}）`

          // 根据根节点类型选择正确的更新字段
          if (rootNode.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT) {
            // 租户类型节点：模板显示固定的"组织机构根节点"，无法直接修改
            // 我们可以在模板中添加条件来显示统计信息
            this.$set(rootNode, 'root_stats', statsText)
          } else {
            // 非租户类型节点：使用simple_name字段
            const originalName = rootNode.simple_name || rootNode.name || '组织机构管理'

            // 生成新的名称
            let newName
            if (originalName.includes('（')) {
              // 替换现有统计信息
              newName = originalName.replace(/（.*）/, statsText)
            } else {
              // 添加统计信息
              newName = originalName + statsText
            }

            // 使用Vue.set确保响应式更新
            this.$set(rootNode, 'simple_name', newName)
          }

          // 强制触发视图更新
          this.$forceUpdate()
        } else {
          // 备用方案：使用第一个节点
          if (this.dataJson.treeData && this.dataJson.treeData.length > 0) {
            const firstNode = this.dataJson.treeData[0]
            const statsText = `（集团数：${stats.group_count}、主体企业数：${stats.company_count}、岗位数：${stats.position_count}、员工数：${stats.staff_count}）`
            this.$set(firstNode, 'label', (firstNode.label || '组织机构管理') + statsText)
          }
        }
      }).catch(error => {
        console.error('获取根节点统计信息失败:', error)
      }).finally(() => {
        if (rootNode) {
          this.$set(rootNode, 'countLoading', false)
        }
      })
    },
    // 更新指定岗位节点的员工数量显示
    updatePositionStats (positionNode) {
      if (!positionNode || positionNode.type !== this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION) {
        return
      }
      // 设置loading状态
      this.$set(positionNode, 'countLoading', true)

      // 并行获取岗位的员工数、角色数和权限数
      Promise.all([
        getSubCountApi(positionNode.id, positionNode.type), // 员工数
        getPositionAssignedRoleIdsApi({ position_id: positionNode.serial_id }), // 角色数
        getPositionAssignedPermissionIdsApi({ position_id: positionNode.serial_id }) // 权限数
      ]).then(responses => {
        const stats = {
          staff_count: responses[0].data || 0,
          role_count: Array.isArray(responses[1].data) ? responses[1].data.length : 0,
          permission_count: Array.isArray(responses[2].data) ? responses[2].data.length : 0
        }

        // 更新树中对应节点的数据
        this.updateTreeNodeStats(this.dataJson.treeData, positionNode.id, stats)

        // 更新当前选中节点的数据
        if (this.dataJson.currentJson && this.dataJson.currentJson.id === positionNode.id) {
          this.$set(this.dataJson.currentJson, 'staff_count', stats.staff_count)
          this.$set(this.dataJson.currentJson, 'role_count', stats.role_count)
          this.$set(this.dataJson.currentJson, 'permission_count', stats.permission_count)
        }
      }).catch(error => {
        console.error('更新岗位统计数据失败:', error)
      }).finally(() => {
        this.$set(positionNode, 'countLoading', false)
      })
    },

    // 更新指定员工节点的权限统计显示
    updateStaffStats (staffNode) {
      if (!staffNode || staffNode.type !== this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF) {
        return
      }
      // 设置loading状态
      this.$set(staffNode, 'countLoading', true)

      // 并行获取员工的角色数、权限数和排除权限数
      Promise.all([
        getStaffAssignedRoleIds({ staff_id: staffNode.serial_id }), // 角色数
        getStaffAssignedPermissionIds({ staff_id: staffNode.serial_id }), // 权限数
        getStaffExcludedPermissionIds({ staff_id: staffNode.serial_id }) // 排除权限数
      ]).then(responses => {
        const stats = {
          role_count: Array.isArray(responses[0].data) ? responses[0].data.length : 0,
          permission_count: Array.isArray(responses[1].data) ? responses[1].data.length : 0,
          exclude_permission_count: Array.isArray(responses[2].data) ? responses[2].data.length : 0
        }

        // 更新树中对应节点的数据
        this.updateTreeNodeStaffStats(this.dataJson.treeData, staffNode.id, stats)

        // 更新当前选中节点的数据
        if (this.dataJson.currentJson && this.dataJson.currentJson.id === staffNode.id) {
          this.$set(this.dataJson.currentJson, 'role_count', stats.role_count)
          this.$set(this.dataJson.currentJson, 'permission_count', stats.permission_count)
          this.$set(this.dataJson.currentJson, 'exclude_permission_count', stats.exclude_permission_count)
        }
      }).catch(error => {
        console.error('更新员工统计数据失败:', error)
      }).finally(() => {
        this.$set(staffNode, 'countLoading', false)
      })
    },
    // 递归更新树节点中指定节点的统计数据显示
    updateTreeNodeStats (treeData, nodeId, stats) {
      for (let i = 0; i < treeData.length; i++) {
        if (treeData[i].id === nodeId) {
          // 更新所有统计数据
          this.$set(treeData[i], 'staff_count', stats.staff_count)
          this.$set(treeData[i], 'role_count', stats.role_count)
          this.$set(treeData[i], 'permission_count', stats.permission_count)

          // 注意：不再更新label，因为现在使用getPositionDisplayText方法动态计算显示文本
          // 这样可以确保显示逻辑保持一致性

          return true
        }
        if (treeData[i].children && treeData[i].children.length > 0) {
          if (this.updateTreeNodeStats(treeData[i].children, nodeId, stats)) {
            return true
          }
        }
      }
      return false
    },

    // 递归更新树节点中指定员工节点的统计数据显示
    updateTreeNodeStaffStats (treeData, nodeId, stats) {
      for (let i = 0; i < treeData.length; i++) {
        if (treeData[i].id === nodeId) {
          // 更新员工统计数据
          this.$set(treeData[i], 'role_count', stats.role_count)
          this.$set(treeData[i], 'permission_count', stats.permission_count)
          this.$set(treeData[i], 'exclude_permission_count', stats.exclude_permission_count)

          // 注意：不再更新label，因为现在使用getStaffDisplayText方法动态计算显示文本
          // 这样可以确保显示逻辑保持一致性

          return true
        }
        if (treeData[i].children && treeData[i].children.length > 0) {
          if (this.updateTreeNodeStaffStats(treeData[i].children, nodeId, stats)) {
            return true
          }
        }
      }
      return false
    },
    // 获取集团节点的显示数据结构
    getGroupDisplayData (subCount) {
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
        // 如果是简单数字且大于0才显示，等于0时不显示
        const count = subCount || 0
        return {
          isDetailed: false,
          simpleText: `(${count})`,
          hasContent: count > 0
        }
      }
    },

    // 获取部门节点的显示数据结构
    getDeptDisplayData (subCount) {
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
        // 如果是简单数字且大于0才显示，等于0时不显示
        const count = subCount || 0
        return {
          isDetailed: false,
          simpleText: `(${count})`,
          hasContent: count > 0
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
          break
        case 'company':
          // 跳转到企业页面
          this.$router.push(linkData.url)
          break
        case 'sub_dept':
          // 跳转到部门页面
          this.$router.push(linkData.url)
          break
        case 'position':
          // 跳转到岗位页面
          this.$router.push(linkData.url)
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
      }
      // 'after' 类型使用Element UI内置指示器，不需要额外样式
    },

    /**
     * 清除所有拖拽样式
     */
    clearDragStyles () {
      // 清除所有节点的拖拽样式类
      const allNodes = this.$el.querySelectorAll('.el-tree-node__content')
      allNodes.forEach(node => {
        node.classList.remove('drag-drop-inner', 'drag-drop-before')
      })
    },

    // ===================== he-tree机制：虚拟占位节点管理 =====================

    /**
     * 插入虚拟占位节点
     * @param {Object} dropNode - 目标节点
     * @param {String} dropType - 拖拽类型 ('before', 'after', 'inner')
     */
    insertVirtualPlaceholder (dropNode, dropType) {
      const placeholderData = {} // he-tree方式：空对象作为虚拟节点

      if (dropType === 'inner') {
        // 作为子节点：插入到目标节点的children开头
        if (!dropNode.data.children) {
          this.$set(dropNode.data, 'children', [])
        }
        dropNode.data.children.unshift(placeholderData)
      } else if (dropType === 'before') {
        // 插入前面：在父级中找到目标节点位置，插入到前面
        this.insertPlaceholderInParent(dropNode, 0, placeholderData)
      } else if (dropType === 'after') {
        // 插入后面：在父级中找到目标节点位置，插入到后面
        this.insertPlaceholderInParent(dropNode, 1, placeholderData)
      }
    },

    /**
     * 在父级节点中插入虚拟节点
     */
    insertPlaceholderInParent (targetNode, offset, placeholderData) {
      const parent = targetNode.parent
      if (parent && parent.data) {
        // 有父节点的情况
        if (!parent.data.children) {
          this.$set(parent.data, 'children', [])
        }
        const parentChildren = parent.data.children
        const index = parentChildren.indexOf(targetNode.data)
        if (index !== -1) {
          parentChildren.splice(index + offset, 0, placeholderData)
        }
      } else {
        // 根级节点
        const rootData = this.dataJson.treeData
        const index = rootData.indexOf(targetNode.data)
        if (index !== -1) {
          rootData.splice(index + offset, 0, placeholderData)
        }
      }
    },

    /**
     * 移除所有虚拟占位节点
     */
    removeVirtualPlaceholder () {
      this.removeVirtualNodesFromArray(this.dataJson.treeData)
    },

    /**
     * 递归移除数组中的虚拟节点
     */
    removeVirtualNodesFromArray (nodeArray) {
      if (!Array.isArray(nodeArray)) return

      for (let i = nodeArray.length - 1; i >= 0; i--) {
        const node = nodeArray[i]

        // he-tree机制：空对象就是虚拟节点
        if (Object.keys(node).length === 0) {
          nodeArray.splice(i, 1)
        } else if (node.children && node.children.length > 0) {
          // 递归处理子节点
          this.removeVirtualNodesFromArray(node.children)
        }
      }
    },

    /**
     * 树数据刷新方法
     * 保存当前选中状态，重新获取树数据，恢复选中状态
     */
    async handleTreeRefresh () {
      try {
        // 1. 保存当前选中状态
        const selectedId = this.$refs.treeObject ? this.$refs.treeObject.getCurrentKey() : null

        // 2. 显示加载状态
        this.settings.loading = true

        // 3. 重新获取树数据
        const response = await getTreeListApi(this.dataJson.searchForm)

        // 4. 更新树数据
        this.dataJson.treeData = response.data

        // 5. 为集团类型节点异步加载子节点数量
        this.loadSubCount(this.dataJson.treeData)

        // 5.5. 加载根节点统计信息
        this.loadRootStatistics()

        // 6. 执行数据处理
        this.getListAfterProcess()

        // 7. 恢复选中状态
        this.$nextTick(() => {
          if (selectedId && this.$refs.treeObject) {
            // 尝试恢复之前选中的节点
            this.$refs.treeObject.setCurrentKey(selectedId)
            const currentNode = this.$refs.treeObject.getCurrentNode()
            if (currentNode) {
              this.handleCurrentChange(currentNode)
            } else {
              // 如果之前选中的节点不存在了，选中第一个节点
              if (this.dataJson.treeData && this.dataJson.treeData.length > 0) {
                this.$refs.treeObject.setCurrentKey(this.dataJson.treeData[0].id)
                this.handleCurrentChange(this.dataJson.treeData[0])
              }
            }
          } else {
            // 如果没有之前选中的节点，选中第一个节点
            if (this.dataJson.treeData && this.dataJson.treeData.length > 0) {
              this.$refs.treeObject.setCurrentKey(this.dataJson.treeData[0].id)
              this.handleCurrentChange(this.dataJson.treeData[0])
            }
          }
        })
      } catch (error) {
        console.error('树数据刷新失败:', error)
        this.$message.error('刷新组织架构数据失败')
      } finally {
        this.settings.loading = false
      }
    },

    // 右键菜单相关方法
    // 处理节点右键菜单事件
    handleNodeContextMenu (event, data, node, nodeComponent) {
      try {
        // 防止默认右键菜单
        event.preventDefault()
        event.stopPropagation()

        // 参数验证
        if (!event) {
          console.error('右键菜单事件对象缺失')
          return
        }

        if (!data) {
          this.$message.warning('选中的节点数据无效')
          return
        }

        if (!node) {
          this.$message.warning('选中的树节点无效')
          return
        }

        // 存储当前右键的节点信息
        this.contextMenu.currentNode = node
        this.contextMenu.currentData = data

        // 获取菜单项
        try {
          this.contextMenu.items = this.getContextMenuItems(data)
        } catch (error) {
          this.$message.error('生成右键菜单失败: ' + error.message)
          console.error('生成右键菜单失败:', error)
          return
        }

        // 如果没有可用的菜单项，不显示菜单
        if (!this.contextMenu.items || this.contextMenu.items.length === 0) {
          this.$message.info('当前节点暂无可用操作')
          return
        }

        // 计算菜单位置，防止菜单超出屏幕边界
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const menuWidth = 200 // 预估菜单宽度
        const menuHeight = this.contextMenu.items.length * 40 // 预估菜单高度

        let x = event.clientX
        let y = event.clientY

        // 检查右侧边界
        if (x + menuWidth > viewportWidth) {
          x = viewportWidth - menuWidth - 10
        }

        // 检查底部边界
        if (y + menuHeight > viewportHeight) {
          y = viewportHeight - menuHeight - 10
        }

        // 确保不超出顶部和左侧边界
        x = Math.max(10, x)
        y = Math.max(10, y)

        this.contextMenu.x = x
        this.contextMenu.y = y

        // 显示菜单
        this.contextMenu.visible = true

        // 在下一个tick中获取焦点，确保菜单可以响应键盘事件
        this.$nextTick(() => {
          try {
            const menu = document.querySelector('.context-menu')
            if (menu) {
              menu.focus()
            }
          } catch (error) {
            console.warn('设置右键菜单焦点失败:', error)
          }
        })

        // 添加全局点击事件监听，用于隐藏菜单
        document.addEventListener('click', this.hideContextMenu)
      } catch (error) {
        this.$message.error('显示右键菜单失败: ' + error.message)
        console.error('右键菜单处理失败:', error)

        // 确保在错误情况下清理状态
        this.hideContextMenu()
      }
    },

    // 根据节点类型生成菜单项
    getContextMenuItems (nodeData) {
      // 检查nodeData是否有效
      if (!nodeData || !nodeData.type) {
        return []
      }

      const items = []

      // 处理员工节点
      if (nodeData.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF) {
        items.push(
          { label: '修改员工', icon: 'el-icon-edit', action: 'edit_staff', enabled: true },
          { label: '维护员工角色', icon: 'el-icon-user-solid', action: 'manage_staff_role', enabled: true },
          { label: '维护员工权限', icon: 'el-icon-key', action: 'manage_staff_permission', enabled: true },
          { label: '排除权限', icon: 'el-icon-circle-close', action: 'exclude_staff_permission', enabled: true }
        )
        return items
      }

      // 处理组织节点 (使用 type)
      const nodeType = nodeData.type
      if (!nodeType) {
        return []
      }

      switch (nodeType) {
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT: // 租户节点
          items.push(
            { label: '新增集团', icon: 'el-icon-plus', action: 'create_group_from_tenant', enabled: true },
            { label: '新增企业', icon: 'el-icon-office-building', action: 'create_company_from_tenant', enabled: true }
          )
          break

        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP: // 集团节点
          items.push(
            { label: '新增子集团', icon: 'el-icon-plus', action: 'create_sub_group', enabled: true },
            { label: '新增企业', icon: 'el-icon-office-building', action: 'create_company_under_group', enabled: true },
            { label: '修改集团', icon: 'el-icon-edit', action: 'edit_group', enabled: true }
          )
          break

        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY: // 企业节点
          items.push(
            { label: '新增部门', icon: 'el-icon-plus', action: 'create_dept_under_company', enabled: true },
            { label: '修改企业', icon: 'el-icon-edit', action: 'edit_company', enabled: true }
          )
          break

        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT: // 部门节点
          items.push(
            { label: '新增子部门', icon: 'el-icon-plus', action: 'create_sub_dept', enabled: true },
            { label: '新增岗位', icon: 'el-icon-user-solid', action: 'create_position_under_dept', enabled: true },
            { label: '修改部门', icon: 'el-icon-edit', action: 'edit_dept', enabled: true }
          )
          break

        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION: // 岗位节点
          items.push(
            { label: '修改岗位', icon: 'el-icon-edit', action: 'edit_position', enabled: true },
            { label: '新增员工', icon: 'el-icon-user', action: 'create_staff_under_position', enabled: true },
            { label: '维护岗位角色', icon: 'el-icon-user-solid', action: 'manage_position_role', enabled: true },
            { label: '维护岗位权限', icon: 'el-icon-key', action: 'manage_position_permission', enabled: true }
          )
          break

        default:
          items.push(
            { label: '刷新节点', icon: 'el-icon-refresh', action: 'refresh_node', enabled: true }
          )
          break
      }

      return items
    },

    // 处理菜单项点击事件
    handleContextMenuClick (menuItem) {
      if (!menuItem.enabled) {
        return
      }

      const nodeData = this.contextMenu.currentData
      this.hideContextMenu()

      // 设置当前节点上下文
      this.dataJson.currentJson = Object.assign({}, nodeData)
      this.$refs.treeObject.setCurrentKey(nodeData.id)

      switch (menuItem.action) {
        // === 租户节点操作 ===
        case 'create_group_from_tenant':
          this.openDirectListDialog('group', nodeData)
          break
        case 'create_company_from_tenant':
          this.openDirectListDialog('company', nodeData)
          break

        // === 集团节点操作 ===
        case 'create_sub_group':
          this.openDirectListDialog('group', nodeData)
          break
        case 'create_company_under_group':
          this.openDirectListDialog('company', nodeData)
          break
        case 'edit_group':
          this.handleDirectEdit('group', nodeData)
          break

        // === 企业节点操作 ===
        case 'create_dept_under_company':
          this.openDirectListDialog('dept', nodeData)
          break
        case 'edit_company':
          this.handleDirectEdit('company', nodeData)
          break

        // === 部门节点操作 ===
        case 'create_sub_dept':
          this.openDirectListDialog('dept', nodeData)
          break
        case 'create_position_under_dept':
          this.openDirectListDialog('position', nodeData)
          break
        case 'edit_dept':
          this.handleDirectEdit('dept', nodeData)
          break

        // === 岗位节点操作 ===
        case 'edit_position':
          this.handleDirectEdit('position', nodeData)
          break
        case 'create_staff_under_position':
          this.openDirectListDialog('staff', nodeData)
          break
        case 'manage_position_role':
          this.openPositionRoleDialog(nodeData)
          break
        case 'manage_position_permission':
          this.openPositionPermissionDialog(nodeData)
          break

        // === 员工节点操作 ===
        case 'edit_staff':
          this.handleStaffEdit(nodeData)
          break
        case 'manage_staff_role':
          this.openStaffRoleDialog(nodeData)
          break
        case 'manage_staff_permission':
          this.openStaffPermissionDialog(nodeData)
          break
        case 'exclude_staff_permission':
          this.openStaffExcludePermissionDialog(nodeData)
          break

        default:
          console.log('未知的右键菜单操作:', menuItem.action)
      }
    },

    // 隐藏右键菜单
    hideContextMenu () {
      this.contextMenu.visible = false
      this.contextMenu.currentNode = null
      this.contextMenu.currentData = null
      this.contextMenu.items = []

      // 移除全局点击事件监听
      document.removeEventListener('click', this.hideContextMenu)
    },

    // 处理新增节点操作
    handleCreateNode (action, parentNodeData) {
      // 设置当前节点为父节点
      this.dataJson.currentJson = Object.assign({}, parentNodeData)
      this.$refs.treeObject.setCurrentKey(parentNodeData.id)

      // 根据操作类型打开相应的弹窗
      switch (action) {
        case 'create_group':
          this.doInsert('20') // 集团类型
          break
        case 'create_company':
          this.doInsert('30') // 企业类型
          break
        case 'create_dept':
          this.doInsert('40') // 部门类型
          break
        case 'create_position':
          this.doInsert('50') // 岗位类型
          break
      }
    },

    // 处理修改节点操作
    handleEditNode (action, nodeData) {
      // 设置当前节点
      this.dataJson.currentJson = Object.assign({}, nodeData)
      this.$refs.treeObject.setCurrentKey(nodeData.id)

      // 调用现有的修改方法
      this.doUpdate()
    },

    // 处理删除节点操作
    handleDeleteNode (action, nodeData) {
      // 设置当前节点
      this.dataJson.currentJson = Object.assign({}, nodeData)
      this.$refs.treeObject.setCurrentKey(nodeData.id)

      // 调用现有的删除方法
      this.doDelete()
    },

    // 打开岗位角色管理弹窗
    openPositionRoleDialog (nodeData) {
      if (nodeData.type !== this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION) {
        this.$message.warning('只有岗位节点才能设置角色')
        return
      }

      // 获取岗位的serial_id作为positionId
      this.roleDialogData.positionId = nodeData.serial_id || nodeData.id
      this.roleDialogData.positionData = nodeData
      this.roleDialogData.visible = true
    },

    // 打开岗位权限管理弹窗
    openPositionPermissionDialog (nodeData) {
      if (nodeData.type !== this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION) {
        this.$message.warning('只有岗位节点才能设置权限')
        return
      }

      // 获取岗位的serial_id作为positionId
      this.permissionDialogData.positionId = nodeData.serial_id || nodeData.id
      this.permissionDialogData.positionData = nodeData
      this.permissionDialogData.visible = true
    },

    // === 员工节点相关方法 ===
    // 处理员工编辑
    handleStaffEdit (nodeData) {
      if (nodeData.type !== this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF) {
        this.$message.warning('只有员工节点才能编辑员工信息')
        return
      }

      // 数据验证
      if (!nodeData.serial_id) {
        this.$message.error('员工数据不完整，无法编辑')
        return
      }

      // 显示加载状态
      const loadingMessage = this.$message({
        message: '正在加载员工数据...',
        type: 'info',
        duration: 0,
        showClose: false
      })

      // 获取员工完整数据
      getStaffByIdApi({ id: nodeData.serial_id }).then(response => {
        // 关闭加载提示
        loadingMessage.close()

        // 验证响应数据
        if (!response || !response.data) {
          this.$message.error('服务器返回的员工数据为空')
          return
        }

        this.popSettingsData.staffEditDialogData.data = response.data
        this.popSettingsData.staffEditDialogData.visible = true
        this.$message.success('员工数据加载完成')
      }).catch(error => {
        // 关闭加载提示
        loadingMessage.close()

        // 根据错误类型显示不同的提示信息
        let errorMessage = '获取员工数据失败'
        if (error.response) {
          // 服务器返回错误
          const status = error.response.status
          switch (status) {
            case 404:
              errorMessage = '员工信息不存在，可能已被删除'
              break
            case 403:
              errorMessage = '没有权限查看该员工信息'
              break
            case 500:
              errorMessage = '服务器内部错误，请稍后重试'
              break
            default:
              errorMessage = `服务器错误 (${status}): ${error.response.data?.message || '未知错误'}`
          }
        } else if (error.code === 'NETWORK_ERROR') {
          errorMessage = '网络连接失败，请检查网络状态'
        } else {
          errorMessage = error.message || '未知错误'
        }

        this.$message.error(errorMessage)
        console.error('获取员工数据失败:', error)
      })
    },

    // 打开员工角色管理弹窗
    openStaffRoleDialog (nodeData) {
      if (nodeData.type !== this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF) {
        this.$message.warning('只有员工节点才能管理角色')
        return
      }

      // 数据验证
      if (!nodeData.serial_id) {
        this.$message.error('员工数据不完整，无法管理角色')
        return
      }

      try {
        this.popSettingsData.staffRoleDialogData.staffId = nodeData.serial_id
        this.popSettingsData.staffRoleDialogData.staffName = nodeData.name || nodeData.label
        this.popSettingsData.staffRoleDialogData.visible = true
        this.$message.success('打开员工角色管理弹窗')
      } catch (error) {
        this.$message.error('打开员工角色管理弹窗失败: ' + error.message)
        console.error('员工角色管理弹窗打开失败:', error)
      }
    },

    // 打开员工权限管理弹窗
    openStaffPermissionDialog (nodeData) {
      if (nodeData.type !== this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF) {
        this.$message.warning('只有员工节点才能管理权限')
        return
      }

      // 数据验证
      if (!nodeData.serial_id) {
        this.$message.error('员工数据不完整，无法管理权限')
        return
      }

      try {
        this.popSettingsData.staffPermissionDialogData.staffId = nodeData.serial_id
        this.popSettingsData.staffPermissionDialogData.staffName = nodeData.name || nodeData.label
        this.popSettingsData.staffPermissionDialogData.visible = true
        this.$message.success('打开员工权限管理弹窗')
      } catch (error) {
        this.$message.error('打开员工权限管理弹窗失败: ' + error.message)
        console.error('员工权限管理弹窗打开失败:', error)
      }
    },

    // 打开员工权限排除弹窗
    openStaffExcludePermissionDialog (nodeData) {
      if (nodeData.type !== this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF) {
        this.$message.warning('只有员工节点才能排除权限')
        return
      }

      // 数据验证
      if (!nodeData.serial_id) {
        this.$message.error('员工数据不完整，无法排除权限')
        return
      }

      try {
        this.popSettingsData.staffExcludePermissionDialogData.staffId = nodeData.serial_id
        this.popSettingsData.staffExcludePermissionDialogData.staffName = nodeData.name || nodeData.label
        this.popSettingsData.staffExcludePermissionDialogData.visible = true
        this.$message.success('打开员工权限排除弹窗')
      } catch (error) {
        this.$message.error('打开员工权限排除弹窗失败: ' + error.message)
        console.error('员工权限排除弹窗打开失败:', error)
      }
    },

    // 角色弹窗关闭-确定
    handleRoleDialogOk (result) {
      if (result.return_flag) {
        this.$message.success('岗位角色设置成功')
        // 可以在这里刷新树节点或者更新显示信息
        this.loadSubCount([this.roleDialogData.positionData])
      }
      this.roleDialogData.visible = false
      this.roleDialogData.positionId = null
      this.roleDialogData.positionData = null
    },

    // 角色弹窗关闭-取消
    handleRoleDialogCancel () {
      this.roleDialogData.visible = false
      this.roleDialogData.positionId = null
      this.roleDialogData.positionData = null
    },

    // 权限弹窗关闭-确定
    handlePermissionDialogOk (result) {
      if (result.return_flag) {
        this.$message.success('岗位权限设置成功')
        // 可以在这里刷新树节点或者更新显示信息
        this.loadSubCount([this.permissionDialogData.positionData])
      }
      this.permissionDialogData.visible = false
      this.permissionDialogData.positionId = null
      this.permissionDialogData.positionData = null
    },

    // 权限弹窗关闭-取消
    handlePermissionDialogCancel () {
      this.permissionDialogData.visible = false
      this.permissionDialogData.positionId = null
      this.permissionDialogData.positionData = null
    },

    // === 员工弹窗事件处理 ===
    // 员工编辑弹窗关闭-确定
    handleStaffEditDialogOk (result) {
      try {
        // 验证回调结果
        if (!result) {
          this.$message.warning('操作结果未知')
          return
        }

        if (result.return_flag) {
          this.$message.success('员工修改成功')
          // 刷新组织树以更新员工信息显示
          this.init().catch(error => {
            this.$message.warning('员工修改成功，但刷新页面失败: ' + error.message)
            console.error('刷新组织树失败:', error)
          })
        } else {
          // 操作失败的情况
          const errorMsg = result.message || result.error || '员工修改失败'
          this.$message.error(errorMsg)
        }
      } catch (error) {
        this.$message.error('处理员工修改结果时发生错误: ' + error.message)
        console.error('员工编辑回调处理失败:', error)
      } finally {
        // 确保弹窗关闭和数据清理
        this.popSettingsData.staffEditDialogData.visible = false
        this.popSettingsData.staffEditDialogData.data = null
      }
    },

    // 员工编辑弹窗关闭-取消
    handleStaffEditDialogCancel () {
      this.popSettingsData.staffEditDialogData.visible = false
      this.popSettingsData.staffEditDialogData.data = null
    },

    // 员工角色弹窗关闭-确定
    handleStaffRoleDialogOk (result) {
      try {
        // 验证回调结果
        if (!result) {
          this.$message.warning('角色设置结果未知')
          return
        }

        if (result.return_flag) {
          this.$message.success('员工角色设置成功')
        } else {
          // 操作失败的情况
          const errorMsg = result.message || result.error || '员工角色设置失败'
          this.$message.error(errorMsg)
        }
      } catch (error) {
        this.$message.error('处理员工角色设置结果时发生错误: ' + error.message)
        console.error('员工角色回调处理失败:', error)
      } finally {
        // 确保弹窗关闭和数据清理
        this.popSettingsData.staffRoleDialogData.visible = false
        this.popSettingsData.staffRoleDialogData.staffId = null
      }
    },

    // 员工角色弹窗关闭-取消
    handleStaffRoleDialogCancel () {
      this.popSettingsData.staffRoleDialogData.visible = false
      this.popSettingsData.staffRoleDialogData.staffId = null
    },

    // 员工权限弹窗关闭-确定
    handleStaffPermissionDialogOk (result) {
      try {
        // 验证回调结果
        if (!result) {
          this.$message.warning('权限设置结果未知')
          return
        }

        if (result.return_flag) {
          this.$message.success('员工权限设置成功')
        } else {
          // 操作失败的情况
          const errorMsg = result.message || result.error || '员工权限设置失败'
          this.$message.error(errorMsg)
        }
      } catch (error) {
        this.$message.error('处理员工权限设置结果时发生错误: ' + error.message)
        console.error('员工权限回调处理失败:', error)
      } finally {
        // 确保弹窗关闭和数据清理
        this.popSettingsData.staffPermissionDialogData.visible = false
        this.popSettingsData.staffPermissionDialogData.staffId = null
      }
    },

    // 员工权限弹窗关闭-取消
    handleStaffPermissionDialogCancel () {
      this.popSettingsData.staffPermissionDialogData.visible = false
      this.popSettingsData.staffPermissionDialogData.staffId = null
    },

    // 员工权限排除弹窗关闭-确定
    handleStaffExcludePermissionDialogOk (result) {
      try {
        // 验证回调结果
        if (!result) {
          this.$message.warning('权限排除设置结果未知')
          return
        }

        if (result.return_flag) {
          this.$message.success('员工权限排除设置成功')
        } else {
          // 操作失败的情况
          const errorMsg = result.message || result.error || '员工权限排除设置失败'
          this.$message.error(errorMsg)
        }
      } catch (error) {
        this.$message.error('处理员工权限排除设置结果时发生错误: ' + error.message)
        console.error('员工权限排除回调处理失败:', error)
      } finally {
        // 确保弹窗关闭和数据清理
        this.popSettingsData.staffExcludePermissionDialogData.visible = false
        this.popSettingsData.staffExcludePermissionDialogData.staffId = null
      }
    },

    // 员工权限排除弹窗关闭-取消
    handleStaffExcludePermissionDialogCancel () {
      this.popSettingsData.staffExcludePermissionDialogData.visible = false
      this.popSettingsData.staffExcludePermissionDialogData.staffId = null
    },

    // 新增：直接打开列表选择弹窗
    openDirectListDialog (dialogType, parentNodeData) {
      console.log('openDirectListDialog', dialogType, parentNodeData)

      // 设置弹窗数据并直接显示列表选择弹窗
      this.popSettingsData.listDialogData = {
        visible: true,
        dialogType: dialogType,
        data: {
          parent_id: parentNodeData.id, // 父节点ID
          parent_name: parentNodeData.simple_name || '组织机构根节点', // 父节点名称
          // 员工特殊处理：需要组织上下文
          ...(dialogType === 'staff' ? {
            organization_context: this.dataJson.organizationContext
          } : {})
        }
      }
    },

    // 新增：直接编辑处理
    handleDirectEdit (entityType, nodeData) {
      console.log('handleDirectEdit', entityType, nodeData)

      // 根据实体类型调用相应的API获取完整数据并打开编辑弹窗
      switch (entityType) {
        case 'group':
          // 获取集团完整数据
          getGroupByIdApi({ id: nodeData.serial_id }).then(response => {
            this.popSettingsData.searchDialogDataOne.data = response.data
            this.popSettingsData.searchDialogDataOne.visible = true
          }).catch(error => {
            this.$message.error('获取集团数据失败: ' + error.message)
          })
          break

        case 'company':
          // 获取企业完整数据
          getCompanyByIdApi({ id: nodeData.serial_id }).then(response => {
            this.popSettingsData.searchDialogDataTwo.data = response.data
            this.popSettingsData.searchDialogDataTwo.visible = true
          }).catch(error => {
            this.$message.error('获取企业数据失败: ' + error.message)
          })
          break

        case 'dept':
          // 获取部门完整数据
          getDeptByIdApi({ id: nodeData.serial_id }).then(response => {
            this.popSettingsData.searchDialogDataThree.data = response.data
            this.popSettingsData.searchDialogDataThree.visible = true
          }).catch(error => {
            this.$message.error('获取部门数据失败: ' + error.message)
          })
          break

        case 'position':
          // 获取岗位完整数据
          getPositionByIdApi({ id: nodeData.serial_id }).then(response => {
            this.popSettingsData.searchDialogDataFour.data = response.data
            this.popSettingsData.searchDialogDataFour.visible = true
          }).catch(error => {
            this.$message.error('获取岗位数据失败: ' + error.message)
          })
          break

        default:
          console.log('未知的实体类型:', entityType)
          this.$message.warning('未支持的编辑类型: ' + entityType)
      }
    },

    // 获取岗位节点显示文本
    getPositionDisplayText (node) {
      if (node.type !== this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION) {
        return ''
      }

      // 如果正在加载，显示loading文字
      if (node.countLoading) {
        return '（加载中...）'
      }

      const parts = []

      // 只有数量>0时才添加到显示文本中
      if (node.staff_count > 0) {
        parts.push(`员工数：${node.staff_count}`)
      }

      if (node.role_count > 0) {
        parts.push(`角色数：${node.role_count}`)
      }

      if (node.permission_count > 0) {
        parts.push(`权限数：${node.permission_count}`)
      }

      // 如果有内容才返回带括号的文本，否则返回空字符串
      return parts.length > 0 ? `（${parts.join('、')}）` : ''
    },

    // 获取员工节点显示文本
    getStaffDisplayText (node) {
      if (node.type !== this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF) {
        return ''
      }

      // 如果正在加载，显示loading文字
      if (node.countLoading) {
        return '（加载中...）'
      }

      const parts = []

      // 只有数量>0时才添加到显示文本中
      if (node.role_count > 0) {
        parts.push(`角色数：${node.role_count}`)
      }

      if (node.permission_count > 0) {
        parts.push(`权限数：${node.permission_count}`)
      }

      if (node.exclude_permission_count > 0) {
        parts.push(`排除权限：${node.exclude_permission_count}`)
      }

      // 如果有内容才返回带括号的文本，否则返回空字符串
      return parts.length > 0 ? `（${parts.join('、')}）` : ''
    },

    // ==================== 员工删除确认对话框处理方法 ====================

    // 员工删除确认对话框 - 确认回调
    handleStaffDeleteConfirm (confirmData) {
      const { deleteType, staffInfo } = confirmData

      this.settings.loading = true

      // 构建API请求数据 - 需要传递组织上下文信息
      const currentNode = this.dataJson.currentJson
      const requestData = [{
        id: staffInfo.id,
        // 修复乐观锁版本不匹配问题：对于从组织架构移除操作，不传递dbversion
        // 因为前端获取的是组织节点版本号，但后端检查的是员工实体版本号
        dbversion: deleteType === 'remove_only' ? null : staffInfo.dbversion,
        // 添加组织上下文信息，用于精确删除关联关系
        org_node_id: currentNode.id, // 当前组织节点ID
        parent_org_id: currentNode.parent_id, // 父组织节点ID（岗位ID）
        org_type: currentNode.type // 组织节点类型
      }]

      // 根据删除类型调用不同的API
      const apiCall = deleteType === 'remove_only'
        ? removeFromOrgTreeApi(requestData)
        : deleteFromOrgApi(requestData)

      const operationName = deleteType === 'remove_only'
        ? '从组织架构移除'
        : '删除'

      apiCall.then((_data) => {
        this.$notify({
          title: `员工${operationName}成功`,
          message: `员工「${staffInfo.name}」已${operationName}`,
          type: 'success',
          duration: this.settings.duration
        })

        // 刷新树数据
        this.dataJson.currentJson = null
        this.getDataList()
      }, (_error) => {
        this.$notify({
          title: `员工${operationName}失败`,
          message: `员工${operationName}失败: ${_error.message}`,
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.loading = false
        this.popSettingsData.staffDeleteDialogData.visible = false
      })
    },

    // 员工删除确认对话框 - 取消回调
    handleStaffDeleteCancel () {
      this.popSettingsData.staffDeleteDialogData.visible = false
      // 清理员工信息
      this.popSettingsData.staffDeleteDialogData.staffInfo = {
        name: '',
        code: '',
        id: null
      }
    }
  }
}
</script>

<style scoped>
.org-left {
  height: 100%;
  overflow-y: auto;
}

/* 覆盖Element UI拖拽指示器样式 - 使用红色主题并添加文字 */
::v-deep .el-tree__drop-indicator {
  background-color: #d73502 !important;  /* 红色线条替代蓝色 */
  height: 2px !important;  /* 稍微粗一点 */
}

/* 屏蔽拖拽指示器上的文字提示 */
::v-deep .el-tree__drop-indicator::before {
  display: none !important; /* 隐藏"插入到此位置"文字提示 */
}

/* 使用全局element-ui_tree.scss中的蓝色拖拽样式，不覆盖 */

/* 跟随鼠标的文字提示样式 */
.mouse-follow-tip {
  position: fixed;
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  z-index: 9999;
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
  transform: translate(-50%, -100%);
  margin-top: -15px;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  animation: tipPulse 2s ease-in-out infinite;
  letter-spacing: 0.5px;
}

/* 提示框脉动动画 */
@keyframes tipPulse {
  0%, 100% {
    transform: translate(-50%, -100%) scale(1);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: translate(-50%, -100%) scale(1.05);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6), 0 4px 8px rgba(0, 0, 0, 0.15);
  }
}

/* 为提示框添加小箭头指向鼠标位置 */
.mouse-follow-tip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid #ff5252;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
}

/* 使用Element UI默认的拖拽和sortable-ghost样式，不自定义覆盖 */

/* 修复拖拽过程中节点悬停状态的样式 */
::v-deep .el-tree-node__content:hover {
  background-color: rgba(215, 53, 2, 0.05) !important; /* 轻微的红色背景 */
}

/* 修复选中状态下的hover样式冲突 - 保持蓝色主题 */
::v-deep .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content:hover {
  background-color: rgba(0, 153, 255, 0.8) !important; /* 选中状态hover时稍微淡一些的蓝色 */
  color: white !important;
}
</style>
