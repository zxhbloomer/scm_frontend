<template>
  <el-main style="">
    <div class="scale">
      <!--      <el-tooltip effect="dark" content="当流程变化时，做一些事情" placement="top">
        <el-button size="small" type="primary" @click="openProcListener" icon="el-icon-service" circle></el-button>
      </el-tooltip>-->
      <el-button icon="el-icon-plus" size="small" :disabled="scale >= 150" circle @click="scale += 10" />
      <span>{{ scale }}%</span>
      <el-button icon="el-icon-minus" size="small" :disabled="scale <= 40" circle @click="scale -= 10" />
    </div>
    <div class="design" :style="'transform: scale('+ scale / 100 +');'">
      <process-tree ref="process-tree" @selectedNode="nodeSelected" />
    </div>
    <el-drawer
      :title="selectedNode.name"
      :visible.sync="showConfig"
      :modal-append-to-body="false"
      :size="selectedNode.type === 'CONDITION' ? '600px':'500px'"
      direction="rtl"
      :modal="false"
      destroy-on-close
    >
      <div slot="title">
        <el-input
          v-show="showInput"
          v-model="selectedNode.name"
          size="medium"
          style="width: 300px"
          @blur="showInput = false"
        />
        <el-link v-show="!showInput" style="font-size: medium" @click="showInput = true">
          <i class="el-icon-edit" style="margin-right: 10px" />
          {{ selectedNode.name }}
        </el-link>
      </div>
      <div class="node-config-content">
        <node-config />
      </div>
    </el-drawer>
  </el-main>
</template>

<script>
import ProcessTree from './process/ProcessTree.vue'
import NodeConfig from '../../common/process/config/NodeConfig'

export default {
  name: 'ProcessDesign',
  components: { ProcessTree, NodeConfig },
  data () {
    return {
      scale: 100,
      selected: {},
      showInput: false,
      showConfig: false,
      showProcListConfig: false
    }
  },
  computed: {
    selectedNode () {
      return this.$store.getters.selectedNode
    }
  },
  watch: {
    /* selectedNode:{
      deep: true,
      handler(node){
        console.log("更新")
        this.$refs["process-tree"].nodeDomUpdate(node)
      }
    }*/
  },
  mounted () {
  },
  methods: {
    openProcListener () {
      this.showProcListConfig = true
    },
    validate () {
      return this.$refs['process-tree'].validateProcess()
    },
    nodeSelected (node) {
      console.log('配置节点', node)
      this.showConfig = true
    }
  }
}
</script>

<style lang="less" scoped>
.design {
  margin-top: 0px;
  display: flex;
  transform-origin: 50% 0px 0px;
}

.scale {
  z-index: 999;
  position: absolute;
  top: 150px;
  right: 40px;

  span {
    margin: 0 10px;
    font-size: 15px;
    color: #7a7a7a;
    width: 50px;
  }
}

.node-config-content{
  padding: 0 20px 20px;
}

/deep/ .el-drawer__body{
  overflow-y: auto;
}
</style>
