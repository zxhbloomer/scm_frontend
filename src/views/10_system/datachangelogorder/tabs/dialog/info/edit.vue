<template>
  <div class="app-container">
    <div>
      <el-form
        ref="dataSubmitForm"
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
          :column="3"
          :content-style="contentStyle"
          :label-style="labelStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="业务单号">
            {{ dataJson.tempJson.order_code }}
          </el-descriptions-item>
          <el-descriptions-item label="业务名称">
            {{ dataJson.tempJson.name }}
          </el-descriptions-item>
          <el-descriptions-item label="最后更新时间">
            {{ dataJson.tempJson.u_time }}
          </el-descriptions-item>
        </el-descriptions>
        <el-alert
          title="操作记录"
          type="info"
          :closable="false"
        />
        <div style="padding-right: 10px;padding-left: 10px; padding-top: 10px;">
          <el-table
            ref="multipleTable"
            v-loading="settings.loading"
            :data="dataJson.detailListData"
            :element-loading-text="'正在拼命加载中...'"
            element-loading-background="rgba(255, 255, 255, 0.5)"
            :height="settings.tableHeight"
            stripe
            border
            highlight-current-row
            style="width: 100%"
            @row-click="handleRowClick"
            @current-change="handleCurrentChange"
          >
            <el-table-column
              type="index"
              width="45"
              label="No"
            />
            <el-table-column
              show-overflow-tooltip
              min-width="40"
              prop="type"
              label="类型"
            />
            <el-table-column
              show-overflow-tooltip
              min-width="130"
              prop="name"
              label="表名"
            >
              <template v-slot="scope">
                {{ scope.row.name }} - {{ scope.row.table_name }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="130"
              prop="name"
              label="字段名"
            >
              <template v-slot="scope">
                {{ scope.row.clm_label }} - {{ scope.row.clm_name }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="130"
              prop="old_value"
              label="修改前"
            >
              <template v-slot="scope">
                {{ scope.row.old_value === null || scope.row.old_value === '' ? '-' : scope.row.old_value }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="130"
              prop="new_value"
              label="修改后"
            >
              <template v-slot="scope">
                {{ scope.row.new_value === null || scope.row.new_value === '' ? '-' : scope.row.new_value }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="100"
              prop="u_name"
              label="修改人"
            />
            <el-table-column
              show-overflow-tooltip
              min-width="100"
              prop="u_time"
              label="更新时间"
            />
            <el-table-column
              min-width="60"
              prop="u_time"
              label="操作"
              fixed="right"
            >
              <template v-slot="scope">
                <el-button
                  type="primary"
                  size="mini"
                  @click="handleInfo(scope.row)"
                >
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

      </el-form>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />

      <el-button
        :disabled="settings.loading"
        size="medium"
        @click="handleCancel()"
      >返回</el-button>
    </div>

    <!-- 操作记录详情弹窗 -->
    <el-dialog
      v-el-drag-dialog
      title="操作记录"
      :visible="infoDialogVisible"
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="1000px"
      destroy-on-close
      top="5vh"
    >
      <el-descriptions
        :column="2"
        direction="horizontal"
        border
      >
        <el-descriptions-item label="业务单号">
          {{ currentInfoData.order_code || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="操作类型">
          {{ currentInfoData.type || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="表名（中文名）">
          {{ currentInfoData.name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="表名（英文名）">
          {{ currentInfoData.table_name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="字段名（中文）">
          {{ currentInfoData.clm_label || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="字段名（英文名）">
          {{ currentInfoData.clm_name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="修改前">
          {{ currentInfoData.old_value === null || currentInfoData.old_value === '' ? '-' : currentInfoData.old_value }}
        </el-descriptions-item>
        <el-descriptions-item label="修改后">
          {{ currentInfoData.new_value === null || currentInfoData.new_value === '' ? '-' : currentInfoData.new_value }}
        </el-descriptions-item>
      </el-descriptions>

      <div slot="footer" class="dialog-footer">
        <el-divider />
        <el-button type="primary" @click="closeInfoDialog">关闭</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<style scoped>
.edit-container {
  height: calc(100vh - 160px);
  overflow-x: auto;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}
.dialog-footer {
  text-align: center;
}
.floatRight {
  float: right;
}
.floatLeft {
  float: left;
}
.el-form-item .el-select {
  width: 100%;
}
.el-button-group {
  margin-bottom: 15px;
}
.el-popup-border-color >>> .el-input__inner {
  border-color: #1890ff;
}
.slotColor
/deep/.el-input-group__append, .el-input-group__prepend {
  background-color: #f5f7fa;
  color: #909399;
  vertical-align: middle;
  display: table-cell;
  position: relative;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 20px;
  width: 1px;
  white-space: nowrap;
}
.el-descriptions {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getApi } from '@/api/30_wms/datachangelogcode/datachangelogcode'
import mixin from './mixin'

export default {
  components: { },
  directives: { elDragDialog },
  mixins: [mixin],
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      id: '',
      // 操作记录弹窗控制
      infoDialogVisible: false,
      currentInfoData: {},
      // 监听器
      watch: {
        unwatch_tempJson: null
      },
      contentStyle: {
        width: '15%'
      },
      labelStyle: {
        width: '10%',
        'text-align': 'right'
      },
      dataJson: {
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          plan_code: '',
          consignor_name: '',
          contract_no: '',
          owner_name: '',
          type: '',
          plan_time: '',
          over_inventory_upper: 0
        },
        // 单条数据 json
        tempJson: {
          order_code: '',
          name: '',
          u_name: '',
          u_time: ''
        },
        inputSettings: {
          maxLength: {
            contract_num: 20,
            ship_name: 20,
            contract_no: 20,
            price: 10,
            waybill_code: 30,
            remark: 100
          }
        },
        detailListData: []
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        // 是否开启超收配置
        over_receive: false,
        tableHeight: this.setUIheight(),
        duration: 4000
      }
    }
  },
  computed: {
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
    async init () {
      this.settings.loading = false
      // 数据初始化
      if (this.data) {
        // 如果传入的是order_code参数，则根据order_code查询数据
        if (this.data.order_code) {
          await this.getDataByOrderCode()
        } else {
          // 否则使用传入的完整数据
          this.dataJson.tempJson = deepCopy(this.data)
          this.dataJson.detailListData = this.data.detailVo || []
          await this.getData()
        }
      }

      // 初始化watch
      this.setWatch()
    },
    // 设置监听器
    setWatch () {
      this.unWatch()
    },
    unWatch () {
    },

    // 返回按钮
    handleCancel () {
      this.$emit('emitReturn', { data: this.data })
    },

    handleRowClick (row) {
      // 处理行点击事件
    },
    // 获取行索引
    getRowIndex (row) {
      const _index = this.dataJson.detailListData.lastIndexOf(row)
      return _index
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
    },

    // 根据order_code查询数据
    async getDataByOrderCode () {
      this.settings.loading = true
      try {
        await getApi({ order_code: this.data.order_code }).then(response => {
          this.dataJson.tempJson = deepCopy(response.data)
          this.dataJson.tempJsonOriginal = deepCopy(response.data)
          this.dataJson.detailListData = this.dataJson.tempJson.dataChangeMongoVoList || []
        })
      } catch (error) {
        console.error('查询数据更新日志失败:', error)
      } finally {
        this.settings.loading = false
      }
    },

    async getData () {
      // 查询逻辑
      this.settings.loading = true
      await getApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.tempJson.over_inventory_upper = this.dataJson.tempJson.over_inventory_upper * 100
        this.dataJson.tempJsonOriginal = deepCopy(response.data)
        this.dataJson.detailListData = this.dataJson.tempJson.dataChangeMongoVoList || []
      }).finally(() => {
        this.settings.loading = false
      })
    },

    // 查看按钮点击事件
    handleInfo (row) {
      console.log('点击查看：', row)
      this.currentInfoData = Object.assign({}, row)
      this.infoDialogVisible = true
    },

    // 关闭操作记录弹窗
    closeInfoDialog () {
      this.infoDialogVisible = false
      this.currentInfoData = {}
    }

  }

}
</script>
