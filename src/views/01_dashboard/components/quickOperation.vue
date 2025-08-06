<template>
  <el-card>
    <!-- 标题 -->
    <div slot="header">
      <span class="el-card-title">快捷操作</span>
      <i
        v-show="!isPanelSetIcon"
        class="el-icon-close"
        style="float: right; padding: 3px 0"
        @click="deletePanelItem"
      />
      <i
        v-show="isPanelSetIcon"
        class="iconfont icon-setting"
        style="float: right; padding: 3px 0;cursor: pointer;"
        @click="handleSetting"
      />
    </div>
    <!-- 新建按钮:循环quickOperationList -->
    <div v-if="settings.loading === false" class="often-control-box">
      <div
        v-for="(item, index) in setted_list"
        :key="index"
        class="often-control-item"
        @click="handleQuickPanelClick(item)"
      >
        <div class="svg-icon">
          <svg-icon
            :icon-class="item.icon"
            :class="item.icon"
            icon-color="#396aff"
          />
        </div>
        <span>{{ item.text }}</span>
      </div>
    </div>
    <el-skeleton v-if="settings.loading" :rows="5" animated />
    <!--    弹窗：编辑快捷操作-->
    <div>
      <el-dialog
        v-el-drag-dialog
        title="快捷操作维护页面"
        :visible="settings.popEditVisible"
        :modal="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        :append-to-body="true"
        :modal-append-to-body="true"
        destroy-on-close
        width="500px"
      >
        <div>
          <el-alert
            title="快捷操作-已加入"
            type="info"
            :closable="false"
          />
          <div class="often-control-box">
            <div
              v-for="(item, index) in setted_list"
              :key="index"
              class="often-control-item"
            >
              <div class="svg-icon">
                <svg-icon
                  :icon-class="item.icon"
                  :class="item.icon"
                  icon-color="#396aff"
                />
              </div>
              <span>{{ item.text }}</span>
              <div class="floatRight">
                <el-button-group>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="更换当前图标"
                    placement="top"
                  >
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      style="padding:5px 5px"
                      plain
                      @click="handleUpdateIcon(item)"
                    />
                  </el-tooltip>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="退出快捷操作"
                    placement="top"
                  >
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      style="padding:5px 5px"
                      plain
                      @click="handleDelete(item)"
                    />
                  </el-tooltip>
                </el-button-group>
              </div>
            </div>
          </div>
          <el-alert
            title="快捷操作-未加入"
            type="info"
            :closable="false"
          />
          <div class="often-control-box">
            <div
              v-for="(item, index) in unsetted_list"
              :key="index"
              class="often-control-item"
            >
              <div class="svg-icon">
                <svg-icon
                  :icon-class="item.icon"
                  :class="item.icon"
                  icon-color="#396aff"
                />
              </div>
              <span>{{ item.text }}</span>
              <div class="floatRight">
                <el-button-group>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="更换当前图标"
                    placement="top"
                  >
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      style="padding:5px 5px"
                      plain
                      @click="handleUpdateIcon(item)"
                    />
                  </el-tooltip>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="加入快捷操作"
                    placement="top-start"
                  >
                    <el-button
                      type="primary"
                      icon="el-icon-plus"
                      style="padding:5px 5px"
                      plain
                      @click="handleInsert(item)"
                    />
                  </el-tooltip>
                </el-button-group>
              </div>
            </div>
          </div>
        </div>
        <div
          slot="footer"
          class="dialog-footer"
        >
          <el-divider />
          <el-button
            plain
            :disabled="settings.loading"
            @click="handlCloseDialog"
          >关 闭</el-button>
          <el-button
            type="primary"
            :disabled="settings.loading"
            @click="handlOk"
          >确 定</el-button>
        </div>
      </el-dialog>
      <!--  图标选择弹窗-->
      <sys-icon-dialog
        v-if="settings.popIconVisible"
        :visible="settings.popIconVisible"
        @closeMeOk="handleSysIconCloseOk"
        @closeMeCancel="handleSysIconCloseCancel"
      />

      <!--      企业-新增弹窗-->
      <entperprise_new_template
        v-if="settings.popNewEnterpriseVisible"
        :visible="settings.popNewEnterpriseVisible"
        title="快捷操作-新增-企业登记"
        @closeMeOk="handlePopNewCloseOk"
        @closeMeCancel="handlePopNewCloseCancel"
      />

      <!--      采购合同-新增弹窗-->
      <pocontract_new_template
        v-if="settings.popNewPoContractVisible"
        :visible="settings.popNewPoContractVisible"
        title="快捷操作-新增-采购合同"
        @closeMeOk="handlePopNewCloseOk"
        @closeMeCancel="handlePopNewCloseCancel"
      />

      <!--      销售合同-新增弹窗-->
      <socontract_new_template
        v-if="settings.popNewSoContractVisible"
        :visible="settings.popNewSoContractVisible"
        title="快捷操作-新增-销售合同"
        @closeMeOk="handlePopNewCloseOk"
        @closeMeCancel="handlePopNewCloseCancel"
      />

      <!--      采购订单-新增弹窗-->
      <poorder_new_template
        v-if="settings.popNewPoOrderVisible"
        :visible="settings.popNewPoOrderVisible"
        title="快捷操作-新增-采购订单"
        @closeMeOk="handlePopNewCloseOk"
        @closeMeCancel="handlePopNewCloseCancel"
      />

      <!--      销售订单-新增弹窗-->
      <soorder_new_template
        v-if="settings.popNewSoOrderVisible"
        :visible="settings.popNewSoOrderVisible"
        title="快捷操作-新增-销售订单"
        @closeMeOk="handlePopNewCloseOk"
        @closeMeCancel="handlePopNewCloseCancel"
      />
    </div>
  </el-card>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getQuickOperationApi, saveQuickApi } from '@/api/01_dashboard'
import sysIconDialog from '@/views/10_system/icons/dialog/dialog'
import entperprise_new_template from '@/views/20_master/enterprise/dialog/new'
import pocontract_new_template from '@/views/40_business/10_po/pocontract/dialog/new'
import socontract_new_template from '@/views/40_business/20_so/socontract/dialog/new'
import poorder_new_template from '@/views/40_business/10_po/poorder/dialog/new'
import soorder_new_template from '@/views/40_business/20_so/soorder/dialog/new'

export default {
  components: { sysIconDialog, entperprise_new_template, pocontract_new_template, socontract_new_template, poorder_new_template, soorder_new_template },
  directives: { elDragDialog },
  props: {
    id: {
      type: [String, Number],
      required: true
    },
    panelSetIcon: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      updateItem: {},
      group: 'mission',
      panelId: this.id,
      isPanelSetIcon: this.panelSetIcon,
      settings: {
        popEditVisible: false,
        popIconVisible: false,
        popNewEnterpriseVisible: false, // 企业-新增弹窗
        popNewPoContractVisible: false, // 采购合同-新增弹窗
        popNewSoContractVisible: false, // 销售合同-新增弹窗
        popNewPoOrderVisible: false, // 采购订单-新增弹窗
        popNewSoOrderVisible: false, // 销售订单-新增弹窗
        loading: false
      },
      setted_list: [],
      unsetted_list: [],
      // 快捷操作内容
      operationList: {},
      orignOperationList: {}
    }
  },
  mounted () {
    this.settings.loading = true
    this.init()
  },
  methods: {
    /**
     * 初始化
     */
    init () {
      this.getData()
    },
    getData () {
      getQuickOperationApi().then(response => {
        console.log('initData', response)
        this.orignOperationList = deepCopy(JSON.parse(response.data.config))
        this.setted_list = deepCopy(JSON.parse(response.data.config).current)
        this.unsetted_list = deepCopy(JSON.parse(response.data.config).unsetted)
        this.settings.loading = false
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 删除面板项发送事件
    deletePanelItem () {
      this.$emit('deletePanelItemEvent', this.panelId)
    },
    // 设置按钮点击事件
    handleSetting () {
      this.settings.popEditVisible = true
    },
    /**
     * 快捷操作点击事件
     * @param item
     */
    handleQuickPanelClick (item) {
      console.log('handleQuickPanelClick', item)
      switch (item.code) {
        case 'purchase_contract':
          // 新建采购合同
          this.settings.popNewPoContractVisible = true
          break
        case 'sales_contract':
          // 新建销售合同
          this.settings.popNewSoContractVisible = true
          break
        case 'purchase_order':
          // 新建采购订单
          this.settings.popNewPoOrderVisible = true
          break
        case 'sales_order':
          // 新建销售订单
          this.settings.popNewSoOrderVisible = true
          break
        case 'purchase_settlement':
          // 新建采购结算
          break
        case 'sales_settlement':
          // 新建销售结算
          break
        case 'enterprise_mast':
          // 新建企业登记
          this.settings.popNewEnterpriseVisible = true
          break
        default:
        // 默认逻辑
      }
    },
    // 加入快捷操作
    handleInsert (item) {
      console.log('handleInsert', item)
      this.setted_list.push(item)
      this.unsetted_list = this.unsetted_list.filter(val => val.id !== item.id)
      this.operationList = { current: this.setted_list, unsetted: this.unsetted_list }
    },
    // 关闭弹出窗口
    handlCloseDialog () {
      this.settings.popEditVisible = false
      console.log('handlCloseDialog', this.orignOperationList)
      this.setted_list = deepCopy(this.orignOperationList.current)
      this.unsetted_list = deepCopy(this.orignOperationList.unsetted)
      this.operationList = { current: this.setted_list, unsetted: this.unsetted_list }
    },
    // 退出快捷操作
    handleDelete (item) {
      console.log('handleDelete', item)
      this.unsetted_list.push(item)
      this.setted_list = this.setted_list.filter(val => val.id !== item.id)
      this.operationList = { current: this.setted_list, unsetted: this.unsetted_list }
    },
    // 系统图标弹窗关闭
    handleSysIconCloseOk (val) {
      console.log('handleSysIconCloseOk', val)
      // 替换当前的icon
      this.updateItem.icon = val
      // 根据val.id先查找setted_list替换
      this.setted_list.forEach((item, index) => {
        if (item.id === this.updateItem.id) {
          this.setted_list[index].icon = val
        }
      })
      // 根据val.id先查找unsetted_list替换
      this.unsetted_list.forEach((item, index) => {
        if (item.id === this.updateItem.id) {
          this.unsetted_list[index].icon = val
        }
      })
      this.operationList = { current: this.setted_list, unsetted: this.unsetted_list }
      this.settings.popIconVisible = false
    },
    // 系统图标弹窗关闭
    handleSysIconCloseCancel () {
      console.log('handleSysIconCloseCancel')
      this.settings.popIconVisible = false
    },
    handleUpdateIcon (val) {
      // 记录当前点击的数据
      this.updateItem = val
      this.settings.popIconVisible = true
      console.log('handleUpdateIcon', this.operationList)
    },
    // 确定
    handlOk () {
      this.operationList = { current: this.setted_list, unsetted: this.unsetted_list }
      console.log('handlOk', this.operationList)
      this.settings.loading = true
      /**
       * 数据库保存
       */
      this.showLoading('正在保存，请稍后...')
      window.sessionStorage.setItem('layout', JSON.stringify(this.layout))
      saveQuickApi({ config: this.operationList })
        .then(
          _data => {
            this.closeLoading()
            this.settings.loading = false
            this.$notify({
              title: '桌面保存成功',
              message: _data.message,
              type: 'success',
              duration: this.settings.duration
            })
          },
          _error => {
            this.closeLoading()
            this.settings.loading = false
            this.$notify({
              title: '桌面保存失败',
              message: _error.message,
              type: 'error',
              duration: this.settings.duration
            })
          }
        )
        .finally(() => {
          this.closeLoading()
          this.settings.loading = false
          this.settings.popEditVisible = false
        })
    },
    // 新增弹窗关闭
    handlePopNewCloseOk (val) {
      console.log('handlePopNewCloseOk', val)
      this.settings.popNewEnterpriseVisible = false
      this.settings.popNewPoContractVisible = false
      this.settings.popNewSoContractVisible = false
      this.settings.popNewPoOrderVisible = false
      this.settings.popNewSoOrderVisible = false
    },
    // 新增弹窗关闭
    handlePopNewCloseCancel () {
      console.log('handlePopNewCloseCancel')
      this.settings.popNewEnterpriseVisible = false
      this.settings.popNewPoContractVisible = false
      this.settings.popNewSoContractVisible = false
      this.settings.popNewPoOrderVisible = false
      this.settings.popNewSoOrderVisible = false
    }
  }
}
</script>

<style scoped>
.el-card {
  height: 100%;
}
.el-icon-close {
  font-size: 1.2em;
  cursor: pointer;
}
.el-card-title {
  font-weight: bold;
}
.often-control-box {
  display: grid;
  grid-template-columns: repeat(2, 50%);
}
.often-control-box .often-control-item {
  position: relative;
  height: 50px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #424e5c;
}
.often-control-item > i {
  color: #396aff;
  margin-right: 10px;
  font-size: 1.5em;
}
.board {
  width: 800px;
  margin-left: 20px;
  display: flex;
  justify-content: space-around;
  flex-direction: row;
  align-items: flex-start;
}
.kanban {
  &.todo {
    .board-column-header {
      background: #4A9FF9;
    }
  }
  &.working {
    .board-column-header {
      background: #f9944a;
    }
  }
  &.done {
    .board-column-header {
      background: #2ac06d;
    }
  }
}
.floatRight {
  float: right;
}
.svg-icon {
  width: 20px;
  height: 20px;
  overflow: hidden;
  margin-right: 10px;
}
</style>
