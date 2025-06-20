<template>
  <div class="board-column">
    <div class="board-column-header">
      {{ headerText }}
    </div>
    <draggable
      :list="list"
      v-bind="$attrs"
      class="board-column-content"
      :set-data="setData"
    >
      <div v-for="element in list" :key="element.id" class="board-item">
        <el-row>
          <el-col :span="6">
            <el-select
              v-model="element.icon"
              filterable
              placeholder="请选择"
              @change="handleChange(element)"
            >
              <template slot="prefix">
                <span>
                  <!--              <i class="el-icon-s-data" />-->
                  <i :class="['iconfont', element.icon]" style="font-size: 25px" />
                </span>
              </template>
              <el-option
                v-for="item in options"
                :key="item.icon"
                :label="item.icon"
                :value="item.icon"
              >
                <span>
                  <i
                    class="iconfont text-bor"
                    :class="item.icon"
                    style="font-size: 20px"
                  />
                </span>
                <!--            <span>{{ item.icon }}</span>-->
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="17">
            <div>{{ element.text }}</div>
          </el-col>
        </el-row>
      </div>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'DragKanbanDemo',
  components: {
    draggable
  },
  props: {
    headerText: {
      type: String,
      default: 'Header'
    },
    options: {
      type: Array,
      default () {
        return []
      }
    },
    list: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      option: [{
        value: '选项1',
        label: '黄金糕'
      }, {
        value: '选项2',
        label: '双皮奶'
      }, {
        value: '选项3',
        label: '蚵仔煎'
      }, {
        value: '选项4',
        label: '龙须面'
      }, {
        value: '选项5',
        label: '北京烤鸭'
      }],
      value: ''
    }
  },
  methods: {
    setData (dataTransfer) {
      // to avoid Firefox bug
      // Detail see : https://github.com/RubaXa/Sortable/issues/1012
      dataTransfer.setData('Text', '')
    },
    handleChange (val) {
      console.log('change')
    }
  }
}
</script>
<style scoped>
@import url('../../../assets/iconfont/iconfont.css');
</style>

<style lang="scss" scoped>
.board-column {
  min-width: 300px;
  min-height: 100px;
  height: auto;
  overflow: hidden;
  background: #f0f0f0;
  border-radius: 3px;

  .board-column-header {
    height: 50px;
    line-height: 50px;
    overflow: hidden;
    padding: 0 20px;
    text-align: center;
    background: #333;
    color: #fff;
    border-radius: 3px 3px 0 0;
  }

  .board-column-content {
    height: auto;
    overflow: hidden;
    border: 10px solid transparent;
    min-height: 60px;
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    align-items: center;

    .board-item {
      cursor: pointer;
      width: 100%;
      height: 64px;
      margin: 5px 0;
      background-color: #fff;
      text-align: left;
      line-height: 54px;
      padding: 5px 10px;
      box-sizing: border-box;
      box-shadow: 0px 1px 3px 0 rgba(0, 0, 0, 0.2);
    }
  }
}
/* 隐藏输入框文字 */
/* 隐藏输入框文字 */
::v-deep .el-input__inner {
  color: transparent;
}

</style>

