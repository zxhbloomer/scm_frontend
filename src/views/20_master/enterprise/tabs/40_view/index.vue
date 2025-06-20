<template>
  <div class="app-container">
    <el-tabs
      ref="minusTabs"
      type="card"
    >
      <el-tab-pane v-if="settings.showView1">
        <template slot="label">企业详情</template>
        <!--企业详情：详情信息+审批流只读信息-->
        <enterprose_view_template
          :data="data"
          :edit-status="editStatus"
          :enable-cancel="enableCancel"
          @emitReturn="handleReturn"
        />

      </el-tab-pane>
      <el-tab-pane v-if="settings.showView2">
        <div />
        <template slot="label">调整信息</template>
        <enterprise_list_adjust
          :data="data"
          :edit-status="editStatus"
          @emitReturn="handleReturn"
          @emitView="handleView"
        />
      </el-tab-pane>

      <el-tab-pane v-if="settings.showView3">
        <template slot="label">调整信息</template>
        <enterprise_detail_adjust
          :data="adjustData"
          :edit-status="editStatus"
          @emitReturn="handleAdjustReturn"
        />
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script>
import enterprose_view_template from './view.vue'
import enterprise_list_adjust from './list_adjust.vue'
import enterprise_detail_adjust from './detail_adjust.vue'
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  components: { enterprose_view_template, enterprise_list_adjust, enterprise_detail_adjust },
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
    },
    // 撤销按钮
    enableCancel: {
      type: Boolean,
      default: false
    },
    adjustData: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      detailListData: [],
      // 监听器
      watch: {
      },

      popSettingsData: {

      },
      dataJson: {

        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {

        },
        // 单条数据 json
        tempJson: {

        },
        inputSettings: {
          maxLength: {

          }
        }
      },
      // 页面设置json
      settings: {
        showView1: true,
        showView2: true,
        showView3: false,
        // loading 状态
        loading: true,
        duration: 4000,

        // 按钮状态：是否可用，false:可用，true不可用
        btnDisabledStatus: {
          disabledInsert: true,
          disabledUpdate: true
        },
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: this.editStatus,
        // pop的check内容
        rules: {

        }
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    }
  },
  // 监听器
  watch: {},
  created () {
    this.init()
  },
  mounted () {
    // 描绘完成
    this.$nextTick(() => {
      this.$refs.minusTabs.$el.children[0].style.margin = 0
    })
  },
  destroyed () {
    this.unWatch()
  },
  methods: {
    // 初始化处理
    init () {
      // 初始化watch
      this.setWatch()
      this.settings.loading = false
    },
    // 弹出框设置初始化
    initDialogStatus () {
    },
    initTempJsonOriginal () {
      // 单条数据 json的，初始化原始数据
      this.dataJson.tempJsonOriginal = this.$options.data.call(
        this
      ).dataJson.tempJsonOriginal
    },
    // Placeholder设置
    isPlaceholderShow (val) {
      return ''
    },
    // 设置监听器
    setWatch () {
      this.unWatch()
    },
    unWatch () {
    },

    handleReturn (_data) {
      const operate_tab_data = {
        data: _data
      }
      this.$router.push({
        query: {}
      })

      this.settings.showView1 = true
      this.settings.showView2 = true
      this.settings.showView3 = false

      this.$emit('emitReturn', operate_tab_data)
    },

    handleAdjustReturn () {
      this.settings.showView2 = true
      this.settings.showView3 = false
    },
    handleView (_data) {
      this.adjustData = _data.data
      this.dataJson.tab = _data.operate_tab_info
      // this.settings.showView1 = false
      this.settings.showView2 = false
      this.settings.showView3 = true
      this.dataJson.canEdit = false
      this.dataJson.editStatus = _data.editStatus
    }
  }

}
</script>
