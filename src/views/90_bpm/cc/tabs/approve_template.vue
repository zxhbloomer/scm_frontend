<template>
  <div class="bpm-container">
    <div>
      <!--企业管理-->
      <enterprise_master_approve_template
        v-if="data.serial_type === constants_dict.DICT_M_ENTERPRISE"
        :data="{ id: data.serial_id ,
                 serial_type: data.serial_type,
                 process_code: data.process_code,
                 bpm_instance_code: data.process_code
        }"
        :edit-status="editStatus"
        @emitReturn="handleReturn"
      />

      <!--采购合同-->
      <po_contract_master_approve_template
        v-if="data.serial_type === constants_dict.DICT_B_PO_CONTRACT"
        :data="{ id: data.serial_id ,
                 serial_type: data.serial_type,
                 process_code: data.process_code,
                 bpm_instance_code: data.process_code
        }"
        :edit-status="editStatus"
        @emitReturn="handleReturn"
      />

      <!--作废 采购合同-->
      <po_contract_master_approve_template
        v-if="data.serial_type === constants_dict.DICT_B_PO_CONTRACT_CANCEL"
        :data="{ id: data.serial_id ,
                 serial_type: data.serial_type,
                 process_code: data.process_code,
                 bpm_instance_code: data.process_code
        }"
        :edit-status="editStatus"
        @emitReturn="handleReturn"
      />

      <!--销售合同-->
      <so_contract_master_approve_template
        v-if="data.serial_type === constants_dict.DICT_B_SO_CONTRACT"
        :data="{ id: data.serial_id ,
                 serial_type: data.serial_type,
                 process_code: data.process_code,
                 bpm_instance_code: data.process_code
        }"
        :edit-status="editStatus"
        @emitReturn="handleReturn"
      />

      <!--作废 销售合同-->
      <so_contract_master_approve_template
        v-if="data.serial_type === constants_dict.DICT_B_SO_CONTRACT_CANCEL"
        :data="{ id: data.serial_id ,
                 serial_type: data.serial_type,
                 process_code: data.process_code,
                 bpm_instance_code: data.process_code
        }"
        :edit-status="editStatus"
        @emitReturn="handleReturn"
      />

      <!--采购订单-->
      <po_order_master_approve_template
        v-if="data.serial_type === constants_dict.DICT_B_PO_ORDER"
        :data="{ id: data.serial_id ,
                 serial_type: data.serial_type,
                 process_code: data.process_code,
                 bpm_instance_code: data.process_code
        }"
        :edit-status="editStatus"
        @emitReturn="handleReturn"
      />

      <!--作废 采购订单-->
      <po_order_master_approve_template
        v-if="data.serial_type === constants_dict.DICT_B_PO_ORDER_CANCEL"
        :data="{ id: data.serial_id ,
                 serial_type: data.serial_type,
                 process_code: data.process_code,
                 bpm_instance_code: data.process_code
        }"
        :edit-status="editStatus"
        @emitReturn="handleReturn"
      />

      <!--销售订单-->
      <so_order_master_approve_template
        v-if="data.serial_type === constants_dict.DICT_B_SO_ORDER"
        :data="{ id: data.serial_id ,
                 serial_type: data.serial_type,
                 process_code: data.process_code,
                 bpm_instance_code: data.process_code
        }"
        :edit-status="editStatus"
        @emitReturn="handleReturn"
      />

      <!--作废 销售订单-->
      <so_order_master_approve_template
        v-if="data.serial_type === constants_dict.DICT_B_SO_ORDER_CANCEL"
        :data="{ id: data.serial_id ,
                 serial_type: data.serial_type,
                 process_code: data.process_code,
                 bpm_instance_code: data.process_code
        }"
        :edit-status="editStatus"
        @emitReturn="handleReturn"
      />

      <!--付款管理-->
      <p_ap_master_approve_template
        v-if="data.serial_type === constants_dict.DICT_B_AP"
        :data="{ id: data.serial_id ,
                 serial_type: data.serial_type,
                 process_code: data.process_code,
                 bpm_instance_code: data.process_code
        }"
        :edit-status="editStatus"
        @emitReturn="handleReturn"
      />

      <!--付款管理-->
      <p_ap_master_approve_template
        v-if="data.serial_type === constants_dict.DICT_B_AP_CANCEL"
        :data="{ id: data.serial_id ,
                 serial_type: data.serial_type,
                 process_code: data.process_code,
                 bpm_instance_code: data.process_code
        }"
        :edit-status="editStatus"
        @emitReturn="handleReturn"
      />

    </div>
  </div>
</template>

<script>
import constants_para from '@/common/constants/constants_para'
import enterprise_master_approve_template from '@/views/20_master/enterprise/tabs/50_approve/index.vue'
import constants_dict from '@/common/constants/constants_dict'
import so_contract_master_approve_template from '@/views/40_business/socontract/tabs/50_approve/index.vue'
import po_contract_master_approve_template from '@/views/40_business/pocontract/tabs/50_approve/index.vue'
import po_order_master_approve_template from '@/views/40_business/poorder/tabs/50_approve/index.vue'
import so_order_master_approve_template from '@/views/40_business/poorder/tabs/50_approve/index.vue'
import p_ap_master_approve_template from '@/views/40_business/ap/tabs/50_approve/index.vue'

export default {
  components: { p_ap_master_approve_template, so_order_master_approve_template, po_order_master_approve_template,
    po_contract_master_approve_template, so_contract_master_approve_template, enterprise_master_approve_template },
  props: {
    // 业务表
    data: {
      type: Object,
      default: null
    },
    editStatus: {
      type: String,
      default: null
    },
    // 撤销按钮
    enableCancel: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      dataJson: {
        // 业务数据查询组装
        serialData: { id: this.data.serial_id },
        // 审批流程数据查询
        processData: { process_code: this.data.process_code, task_id: this.data.task_id }
      }
    }
  },
  computed: {
    constants_dict () {
      return constants_dict
    },
    constants_para () {
      return constants_para
    }
  },
  methods: {
    handleReturn () {
      this.$emit('emitReturn')
    },
    // 组装业务表数据参数
    assembleData (data) {
      switch (data.serial_type) {
        case constants_dict.DICT_BPM_TODO_SERIAL_TYPE_OUT_PLAN: // 出库计划
          return { id: this.data.serial_id }
        case constants_dict.DICT_M_ENTERPRISE: // 企业管理
          return { id: this.data.serial_id }
        default:
          return {
            id: this.data.serial_id
          }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.bpm-container {
  //padding: 10px;
  //background-color: rgb(240, 242, 245);

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  //.chart-wrapper {
  //  background: #fff;
  //  padding: 16px 16px 0;
  //  margin-bottom: 10px;
  //  height: calc(100vh - 170px);
  //}
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
.dialog-footer {
  text-align: center;
}

</style>
