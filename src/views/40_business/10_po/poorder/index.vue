<template>
  <div>
    <el-tabs
      ref="refTabs"
      v-model="settings.tabs.activeName"
      @tab-click="handleTabsClick"
      @tab-remove="handleRemoveTab"
    >
      <!--      采购订单-列表-->
      <!--      注意：第一个list页面是不需要v-if来管理是否隐藏-->
      <el-tab-pane
        name="main"
      >
        <template slot="label">采购订单-列表</template>
        <list_template
          :data="dataJson.data"
          @emitView="handleView"
          @emitNew="handleNew"
          @emitUpdate="handleUpdate"
          @emitApprove="handleApprove"
          @emitInplanNew="handleInplanNew"
          @emitSettlementNew="handleSettlementNew"
          @emitCargoRightTransferNew="handleCargoRightTransferNew"
        />
      </el-tab-pane>
      <!--新增-->
      <el-tab-pane
        v-if="dataJson.tab.showNew"
        name="edit"
        closable
      >
        <template slot="label">{{ dataJson.tab.name }}</template>
        <new_template
          :data="dataJson.data"
          :edit-status="dataJson.editStatus"
          :head-info="dataJson.operation_head_info"
          :can-edit="dataJson.canEdit"
          @closeMeCancel="handleReturn"
          @closeMeOk="handleCloseMeOk"
        />
      </el-tab-pane>
      <!--修改-->
      <el-tab-pane
        v-if="dataJson.tab.showUpdate"
        name="edit"
        closable
      >
        <template slot="label">{{ dataJson.tab.name }}</template>
        <update_template
          :data="dataJson.data"
          :edit-status="dataJson.editStatus"
          :head-info="dataJson.operation_head_info"
          :can-edit="dataJson.canEdit"
          :modify-reason="dataJson.modifyReason"
          @closeMeCancel="handleReturn"
          @closeMeOk="handleCloseMeOk"
        />
      </el-tab-pane>
      <!--查看-->
      <el-tab-pane
        v-if="dataJson.tab.showView"
        name="view"
        closable
      >
        <template slot="label">{{ dataJson.tab.name }}</template>
        <detail_template
          :data="dataJson.data"
          edit-status="view"
          :enable-cancel="false"
          @emitReturn="handleReturn"
        />
      </el-tab-pane>
      <!--审批-->
      <el-tab-pane
        v-if="dataJson.tab.showApprove"
        name="approve"
        closable
      >
        <template slot="label">{{ dataJson.tab.name }}</template>
        <approve_template
          :data="dataJson.data"
          :edit-status="dataJson.editStatus"
          :enable-cancel="dataJson.enableCancel"
          @emitReturn="handleReturn"
        />
      </el-tab-pane>
      <!--入库计划新增-->
      <el-tab-pane
        v-if="dataJson.tab.showInplanNew"
        name="inplan_new"
        closable
      >
        <template slot="label">{{ dataJson.tab.inplanName }}</template>
        <inplan_new_template
          :po-id="dataJson.po_id"
          @closeMeCancel="handleReturn"
          @closeMeOk="handleCloseMeOk"
        />
      </el-tab-pane>
      <!--结算单新增-->
      <el-tab-pane
        v-if="dataJson.tab.showSettlementNew"
        name="settlement_new"
        closable
      >
        <template slot="label">{{ dataJson.tab.settlementName }}</template>
        <settlement_new_template
          :po-id="dataJson.po_id"
          @closeMeCancel="handleReturn"
          @closeMeOk="handleCloseMeOk"
        />
      </el-tab-pane>
      <!--货权转移新增-->
      <el-tab-pane
        v-if="dataJson.tab.showCargoRightTransferNew"
        name="cargo_right_transfer_new"
        closable
      >
        <template slot="label">{{ dataJson.tab.cargoRightTransferName }}</template>
        <cargo_right_transfer_new_template
          :data="dataJson.po_data"
          @closeMeCancel="handleReturn"
          @closeMeOk="handleCloseMeOk"
        />
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import list_template from './tabs/10_list/index.vue'
import new_template from './tabs/20_new/index.vue'
import update_template from './tabs/30_edit/index.vue'
import detail_template from './tabs/40_view/index.vue'
import approve_template from './tabs/50_approve/index.vue'
import inplan_new_template from '@/views/40_business/30_in/inplan/component/push/bypoorder/index.vue'
import settlement_new_template from '@/views/40_business/10_po/settlement/component/push/bypoorder/index.vue'
import cargo_right_transfer_new_template from '@/views/40_business/10_po/cargo_right_transfer/component/push/index.vue'

export default {
  components: { list_template, new_template, update_template, detail_template, approve_template, inplan_new_template, settlement_new_template, cargo_right_transfer_new_template },
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
        po_id: null, // 采购订单ID
        tab: {
          showMain: true, // 显示主页面-列表
          // showEdit: false, // 显示新增/修改页面
          showNew: false, // 显示新增
          showUpdate: false, // 显示修改页面
          showView: false, // 显示查看页面
          showApprove: false, // 显示审批页面
          showInplanNew: false, // 显示入库计划新增页面
          showSettlementNew: false, // 显示结算单新增页面
          showCargoRightTransferNew: false, // 显示货权转移新增页面
          inplanName: '入库计划新增', // 入库计划页签名称
          settlementName: '结算单新增', // 结算单页签名称
          cargoRightTransferName: '货权转移新增' // 货权转移页签名称
        },
        po_data: null, // 采购订单数据
        operation_head_info: '',
        permissionId: null,
        canEdit: null
      },
      // 页面设置json
      settings: {
        tabs: {
          activeName: 'main',
          is_edit: false
        },
        // loading 状态
        loading: true,
        duration: 4000
      }
    }
  },
  // 监听器
  watch: {
    'settings.tabs.activeName': {
      handler (newVal) {
        this.$nextTick(() => {
          this.updateTabTitleByState(newVal)
        })
      },
      immediate: true
    }
  },
  mounted () {
    // 描绘完成
    this.$nextTick(() => {
      this.$refs.refTabs.$el.children[0].style.margin = 0
      this.$refs.refTabs.$el.children[0].style.display = 'none'
    })
  },
  created () {
    // 设置页面标识，让FloatMenu组件能够正确管理列配置
    this.$options.name = this.$route.meta.page_code
  },
  methods: {
    handleTabsClick (tab, event) {
      // console.log(tab, event)
    },
    // 点击tabs的关闭
    handleRemoveTab (targetName) {
    },
    doCloseTab () {
      this.dataJson.tab.showNew = false
      this.dataJson.tab.showUpdate = false
      this.dataJson.tab.showView = false
      this.dataJson.tab.showInplanNew = false
      this.dataJson.tab.showSettlementNew = false
      this.dataJson.tab.showCargoRightTransferNew = false
      this.dataJson.tab.showMain = true
      this.settings.tabs.activeName = 'main'
    },
    /**
     * 查看
     * @param _data
     */
    handleView (_data) {
      // 查看监管任务
      this.dataJson.data = _data.data
      this.dataJson.tab = _data.operate_tab_info
      this.settings.tabs.activeName = 'view'
      this.dataJson.tab.showView = true
      this.dataJson.tab.showMain = false
      this.dataJson.tab.showNew = false
      this.dataJson.tab.showUpdate = false
      this.dataJson.canEdit = false

      this.dataJson.editStatus = _data.editStatus
    },
    /**
     * 新增
     * @param _data
     */
    handleNew (_data) {
      // 编辑监管任务
      this.dataJson.data = _data.data
      this.dataJson.tab = _data.operate_tab_info
      this.settings.tabs.activeName = 'edit'
      this.dataJson.tab.showNew = true
      this.dataJson.tab.showUpdate = false
      this.dataJson.tab.showView = false
      this.dataJson.tab.showMain = false
      this.dataJson.canEdit = false
      this.dataJson.editStatus = _data.editStatus
    },
    /**
     * 修改
     * @param _data
     */
    handleUpdate (_data) {
      // 编辑监管任务
      this.dataJson.data = _data.data
      this.dataJson.tab = _data.operate_tab_info
      this.settings.tabs.activeName = 'edit'
      this.dataJson.tab.showNew = false
      this.dataJson.tab.showUpdate = true
      this.dataJson.tab.showView = false
      this.dataJson.tab.showMain = false
      this.dataJson.canEdit = false
      this.dataJson.editStatus = _data.editStatus
      this.dataJson.modifyReason = _data.modifyReason
    },
    /**
     * 新增页面返回
     */
    handleReturn () {
      this.dataJson.tab.showMain = true
      this.dataJson.tab.showNew = false
      this.dataJson.tab.showUpdate = false
      this.dataJson.tab.showView = false
      this.dataJson.tab.showApprove = false
      this.dataJson.tab.showInplanNew = false
      this.dataJson.tab.showSettlementNew = false
      this.dataJson.tab.showCargoRightTransferNew = false
      this.settings.tabs.activeName = 'main'
    },
    /**
     * 新增页面，新增成功后，关闭页面
     */
    handleCloseMeOk () {
      this.dataJson.tab.showMain = true
      this.dataJson.tab.showNew = false
      this.dataJson.tab.showUpdate = false
      this.dataJson.tab.showView = false
      this.dataJson.tab.showApprove = false
      this.dataJson.tab.showInplanNew = false
      this.dataJson.tab.showSettlementNew = false
      this.dataJson.tab.showCargoRightTransferNew = false
      this.settings.tabs.activeName = 'main'
    },
    /**
     * 审批
     * @param _data
     */
    handleApprove (_data) {
      // 编辑监管任务
      this.dataJson.data = _data.data
      this.dataJson.editStatus = _data.editStatus
      this.dataJson.enableCancel = _data.enableCancel
      this.settings.tabs.activeName = 'approve'
      this.dataJson.tab.showNew = false
      this.dataJson.tab.showUpdate = false
      this.dataJson.tab.showView = false
      this.dataJson.tab.showMain = false
      this.dataJson.tab.showApprove = true
      this.dataJson.tab.showInplanNew = false
      this.dataJson.tab.showSettlementNew = false
      this.dataJson.tab.showCargoRightTransferNew = false
      this.dataJson.canEdit = false
    },
    /**
     * 入库计划新增
     * @param _data
     */
    handleInplanNew (_data) {
      this.dataJson.po_id = _data.id
      this.settings.tabs.activeName = 'inplan_new'
      this.dataJson.tab.showNew = false
      this.dataJson.tab.showUpdate = false
      this.dataJson.tab.showView = false
      this.dataJson.tab.showMain = false
      this.dataJson.tab.showApprove = false
      this.dataJson.tab.showInplanNew = true
      this.dataJson.tab.showSettlementNew = false
      this.dataJson.tab.showCargoRightTransferNew = false
    },
    /**
     * 结算单新增
     * @param _data
     */
    handleSettlementNew (_data) {
      this.dataJson.po_id = _data.id
      this.settings.tabs.activeName = 'settlement_new'
      this.dataJson.tab.showNew = false
      this.dataJson.tab.showUpdate = false
      this.dataJson.tab.showView = false
      this.dataJson.tab.showMain = false
      this.dataJson.tab.showApprove = false
      this.dataJson.tab.showInplanNew = false
      this.dataJson.tab.showSettlementNew = true
      this.dataJson.tab.showCargoRightTransferNew = false
    },
    /**
     * 货权转移新增
     * @param _data
     */
    handleCargoRightTransferNew (_data) {
      this.dataJson.po_data = _data
      this.settings.tabs.activeName = 'cargo_right_transfer_new'
      this.dataJson.tab.showNew = false
      this.dataJson.tab.showUpdate = false
      this.dataJson.tab.showView = false
      this.dataJson.tab.showMain = false
      this.dataJson.tab.showApprove = false
      this.dataJson.tab.showInplanNew = false
      this.dataJson.tab.showSettlementNew = false
      this.dataJson.tab.showCargoRightTransferNew = true
    },
    /**
     * 获取标签页标题扩展文本
     * @param {string} tabState - 标签页状态
     * @returns {string} 标题扩展文本
     */
    getTabTitleExtension (tabState) {
      const titleMap = {
        'main': '-查询',
        'view': '-查看',
        'edit': this.dataJson.tab.showNew ? '-新增' : '-修改',
        'approve': '-审批',
        'inplan_new': '-入库计划新增',
        'settlement_new': '-结算单新增',
        'cargo_right_transfer_new': '-货权转移新增'
      }
      return titleMap[tabState] || ''
    },
    /**
     * 根据页面状态更新RouterTab标题
     * @param {string} tabState - 标签页状态
     */
    updateTabTitleByState (tabState) {
      const extensionText = this.getTabTitleExtension(tabState)
      // 使用RouterTab组件的通用方法
      if (this.$routerTab && this.$routerTab.updateTabTitle) {
        this.$routerTab.updateTabTitle(extensionText)
      }
    }
  }
}
</script>

