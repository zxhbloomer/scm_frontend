<template>
  <div>
    <div style="margin-bottom: 20px">
      <p class="item-desc">延时方式</p>
      <el-radio-group v-model="config.type" size="small" @change="config.dateTime = ''">
        <el-radio-button label="FIXED">固定时长</el-radio-button>
        <el-radio-button label="PRECISE">指定时间</el-radio-button>
        <el-radio-button label="AUTO">自动计算</el-radio-button>
      </el-radio-group>
    </div>
    <div v-if="config.type === 'FIXED'">
      <el-input v-model="config.time" style="width: 180px;" placeholder="时间单位" size="small" type="number">
        <el-select slot="append" v-model="config.unit" style="width: 75px;" placeholder="请选择">
          <el-option label="天" value="D" />
          <el-option label="小时" value="H" />
          <el-option label="分钟" value="M" />
        </el-select>
      </el-input>
      <span class="item-desc"> 后进入下一步</span>
    </div>
    <div v-else-if="config.type === 'PRECISE'" class="item-desc">
      <el-date-picker v-model="config.dateTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" style="width: 200px;" size="small" placeholder="等待至指定时间" />
      <span class="item-desc"> 后继续</span>
    </div>
    <div v-else class="item-desc">
      <el-time-picker v-model="config.dateTime" value-format="HH:mm:ss" style="width: 150px;" size="small" placeholder="等至当天的时间点" />
      <span class="item-desc"> 后进入下一步</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DelayNodeConfig',
  components: {},
  props: {
    config: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {}
  },
  methods: {}
}
</script>

<style scoped>

</style>
