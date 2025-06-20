<template>
  <el-card>
    <!-- 标题 -->
    <div slot="header">
      <span class="el-card-title">当月信息统计-采购</span>
      <i
        v-show="!isPanelSetIcon"
        class="el-icon-close"
        style="float: right; padding: 3px 0"
        @click="deletePanelItem"
      />
    </div>
    <div>
      <!--        第一行：当月总交易额、成交总金额、合同、订单数量-->
      <el-row>
        <el-col :span="7">
          <el-col :span="5">
            <div class="app-icon ">
              <svg-icon
                icon-class="money_c"
                class="app-svg"
              />
            </div>
          </el-col>
          <el-col :span="19">
            <div class="stat-item-head">
              <div class="stat-value-head">9,999.99</div>
              <div class="stat-label-head">当月总交易额</div>
            </div>
          </el-col>
        </el-col>
        <el-col :span="1">
          <el-divider direction="vertical" />
        </el-col>
        <el-col :span="7">
          <el-col :span="5">
            <div class="app-icon ">
              <svg-icon
                icon-class="money_c2"
                class="app-svg"
              />
            </div>
          </el-col>
          <el-col :span="19">
            <div class="stat-item-head">
              <div class="stat-value-head">9,999.99</div>
              <div class="stat-label-head">成交总金额</div>
            </div>
          </el-col>
        </el-col>
        <el-col :span="1">
          <el-divider direction="vertical" />
        </el-col>
        <el-col :span="7">
          <el-col :span="5">
            <div class="app-icon ">
              <svg-icon
                icon-class="handshake"
                class="app-svg"
              />
            </div>
          </el-col>
          <el-col :span="19">
            <div class="stat-item-head">
              <div class="stat-value-head">100   |    120</div>
              <div class="stat-label-head">合同、订单数量</div>
            </div>
          </el-col>
        </el-col>
      </el-row>
      <br>
      <!--      第二行-->
      <el-row>
        <el-col :span="5">
          <div class="stat-item">
            <div class="stat-value">9,999.99</div>
            <div class="stat-label">预付款金额-应付（万元）</div>
          </div>
        </el-col>
        <el-col :span="5">
          <div class="stat-item">
            <div class="stat-value">9,999.99</div>
            <div class="stat-label">结算付款金额-应付（万元）</div>
          </div>
        </el-col>
        <el-col :span="5">
          <div class="stat-item">
            <div class="stat-value">9,999.99</div>
            <div class="stat-label">待付款金额（万元）</div>
          </div>
        </el-col>
        <el-col :span="5">
          <div class="stat-item">
            <div class="stat-value">9,999.99</div>
            <div class="stat-label">采购数量（吨）</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item">
            <div class="stat-value">9,999.99</div>
            <div class="stat-label">已结算金额（万元）</div>
          </div>
        </el-col>
      </el-row>
      <!--      第三行-->
      <el-row>
        <el-col :span="5">
          <div class="stat-item">
            <div class="stat-value">9,999.99</div>
            <div class="stat-label">预付款金额-实付（万元）</div>
          </div>
        </el-col>
        <el-col :span="5">
          <div class="stat-item">
            <div class="stat-value">9,999.99</div>
            <div class="stat-label">结算付款金额-实付（万元）</div>
          </div>
        </el-col>
        <el-col :span="5">
          <div class="stat-item">
            <div class="stat-value">9,999.99</div>
            <div class="stat-label">累计付款金额（万元）</div>
          </div>
        </el-col>
        <el-col :span="5">
          <div class="stat-item">
            <div class="stat-value">9,999.99</div>
            <div class="stat-label">收货合计（吨）</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item">
            <div class="stat-value">9,999.99</div>
            <div class="stat-label">已开票金额（万元）</div>
          </div>
        </el-col>
      </el-row>
      <el-row />
    </div>
  </el-card>
</template>
<script>
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getQuickOperationApi, saveQuickApi } from '@/api/01_dashboard'

export default {
  components: { },
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
          break
        case 'sales_contract':
          // 新建销售合同
          break
        case 'purchase_order':
          // 新建采购订单
          break
        case 'sales_order':
          // 新建销售订单
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
    },
    // 新增弹窗关闭
    handlePopNewCloseCancel () {
      console.log('handlePopNewCloseCancel')
      this.settings.popNewEnterpriseVisible = false
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
.stats-container {
}

.stats-row {
  margin-bottom: 30px;
}

.stat-item {
  text-align: left;
  padding: 15px;
  border-radius: 4px;
}

.stat-value {
  font-size: 20px;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  color: #606266;
}

.stat-item-head {
  text-align: left;
  padding: 15px;
  border-radius: 4px;
}

.stat-value-head {
  font-size: 24px;
  font-weight: bold;
  color: #396aff;
  margin-bottom: 8px;
}

.stat-label-head {
  font-size: 16px;
  color: #606266;
}
.el-divider--vertical {
  height: 80px;
  margin-left: 19px;
}
.app-icon {
  position: relative;
  width: 60px;
  height: 80px;
  align-items: center;
  border-radius: 24px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  color: #ffffff;
  font-size: 70px;
}
</style>
