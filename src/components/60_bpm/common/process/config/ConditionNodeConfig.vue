<template>
  <div>
    <el-form inline label-width="100px">
      <el-form-item label="调整优先级" prop="level">
        <el-popover placement="right" title="拖拽条件调整优先级顺序" width="250" trigger="click">
          <draggable style="width: 100%; min-height:25px" :list="prioritySortList" group="from" :options="sortOption">
            <div
              v-for="(cd, index) in prioritySortList"
              :class="{'drag-no-choose': true, 'drag-hover': cd.id === selectedNode.id}"
            >
              <ellipsis style="width: 160px;" hover-tip :content="cd.name" />
              <div>优先级 {{ index + 1 }}</div>
            </div>
          </draggable>
          <el-button slot="reference" icon="el-icon-sort" size="small">第{{ nowNodeLeave + 1 }}级</el-button>
        </el-popover>
      </el-form-item>
      <el-form-item v-if="config.mode === 'SIMPLE'" label="条件组关系" label-width="150px">
        <el-switch
          v-model="config.groupsType"
          active-color="#409EFF"
          inactive-color="#c1c1c1"
          active-value="AND"
          inactive-value="OR"
          active-text="且"
          inactive-text="或"
        />
      </el-form-item>
      <el-form-item label="条件设置模式">
        <el-radio-group v-model="config.mode">
          <el-radio label="SIMPLE">简单模式</el-radio>
          <el-radio label="UEL" disabled>逻辑表达式</el-radio>
          <el-radio label="HTTP" disabled>网络请求</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="config.mode === 'UEL'" label="表达式设置">
        <el-input v-model="config.expression" size="medium" placeholder="使用bpmn UEL表达式构造条件" />
        <span class="item-desc">使用表达式构建复杂逻辑，谨慎使用</span>
      </el-form-item>
    </el-form>
    <div v-if="config.mode === 'SIMPLE'">
      <el-button type="primary" size="mini" icon="el-icon-plus" style="margin: 0 15px 15px 0" round @click="addConditionGroup">
        添加条件组
      </el-button>
      <span class="item-desc">📢表单字段设置为必填才能作为审批条件</span>
      <group-item />
    </div>
    <div v-if="config.mode === 'HTTP'">
      <http-req v-model="config.http" />
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import GroupItem from './ConditionGroupItemConfig.vue'
import HttpReq from '@/components/60_bpm/common/HttpReq.vue'
import ellipsis from '@/components/60_bpm/common/Ellipsis'

export default {
  name: 'ConditionNodeConfig',
  components: {ellipsis, HttpReq, draggable, GroupItem },
  props: {
    config: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      sortOption: {
        animation: 300,
        chosenClass: 'choose',
        scroll: true,
        sort: true
      }
    }
  },
  computed: {
    selectedNode () {
      return this.$store.getters.selectedNode
    },
    select () {
      return this.config.assignedUser || []
    },
    nowNodeLeave () {
      return this.prioritySortList.indexOf(this.selectedNode)
    },
    // 条件节点
    prioritySortList () {
      const node = this.$store.getters.nodeMap.get(this.selectedNode.parentId)
      console.log(this.selectedNode.id, node)
      if (node) {
        return node.branchs || []
      }
      return []
    }
  },
  methods: {
    addConditionGroup () {
      this.config.groups.push({
        cids: [],
        groupType: 'OR',
        conditions: []
      })
    },
    selectUser () {
      this.showOrgSelect = true
    },
    selected (select) {
      console.log(select)
      this.showOrgSelect = false
      select.forEach(val => this.select.push(val))
    },
    removeOrgItem (index) {
      this.select.splice(index, 1)
    }
  }
}
</script>

<style lang="less" scoped>
.choose {
  border-radius: 5px;
  margin-top: 2px;
  background: #f4f4f4;
  border: 1px dashed #1890FF !important;
}

.drag-hover {
  color: #1890FF
}

.drag-no-choose {
  cursor: move;
  background: #f8f8f8;
  border-radius: 5px;
  margin: 5px 0;
  height: 25px;
  line-height: 25px;
  padding: 5px 10px;
  border: 1px solid #ffffff;
  div{
    display: inline-block;
    font-size: small !important;
  }

  div:nth-child(2) {
    float: right !important;
  }
}
</style>
