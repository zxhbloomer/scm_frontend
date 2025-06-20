<template>
  <div :class="{ avatar: true, 'show-y': showY }">
    <div class="a-img">
      <template v-if="type === 'user'">
        <el-avatar v-if="src" :size="size" :src="src" />
        <div v-else-if="alisa" :style="{ '--bgc': bgc, '--size': size + 'px' }">
          <span>{{ alisa }}</span>
        </div>
        <icon v-else name="el-icon-more multi-user-avatar" />
      </template>
      <el-avatar v-else-if="type === 'dept'" style="background: #f78f5f" icon="el-icon-histogram" :size="size" />
      <el-avatar v-else icon="el-icon-userfilled" style="background: #576a95" :size="size" />
      <icon v-if="closeable" name="el-icon-close close" @click="$emit('close')" />
      <icon v-show="status" :name="`${statusIcon} status`" />
    </div>
    <div v-if="!showY && showName" class="name">{{ name }}</div>
    <ellipsis v-show="showName" v-else hover-tip class="name" :style="{ width: size + 10 + 'px' }" :content="name" />
  </div>
</template>

<script>
import Ellipsis from '@/components/ProcessProgress/Ellipsis.vue'
import Icon from '@/components/ProcessProgress/Icon.vue'

export default {
  components: { Ellipsis, Icon },
  props: {
    type: {
      type: String,
      default: 'user'
    },
    name: {
      type: String,
      default: '未知'
    },
    size: {
      type: Number,
      default: 40
    },
    src: {
      type: String,
      default: undefined
    },
    bgc: {
      type: String,
      default: '#1989fa'
    },
    square: {
      type: Boolean,
      default: false
    },
    showY: {
      type: Boolean,
      default: false
    },
    showName: {
      type: Boolean,
      default: true
    },
    closeable: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      default: ''
    }
  },
  data () {
    return {}
  },
  computed: {
    alisa () {
      if (this.name) {
        return this.name.length > 2
          ? this.name.substring(this.name.length - 2, this.name.length)
          : this.name
      } else {
        return false
      }
    },
    statusIcon () {
      switch (this.status) {
        case 'error':
          return 'el-icon-error error'
        case 'pending':
          return 'pending iconfont icon-dengdaizhongbeifen'
        case 'success':
          return 'el-icon-success success'
        case 'cc':
          return 'el-icon-s-promotion cc'
        case 'comment':
          return 'comment iconfont icon-xiaoxi'
        case 'transfer':
          return 'transfer iconfont icon-zhuanyi'
        case 'cancel':
          return 'cancel iconfont icon-fanhui-chehui-06'
        case 'recall':
          return 'recall iconfont icon-quxiao'
        case 'leader':
          return 'el-icon-userfilled leader'
        default:
          return null
      }
    }
  },
  methods: {},
  emits: ['close']
}
</script>

<style lang="less" scoped>
.show-y {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column !important;
  .name {
    margin-left: 0 !important;
  }
}
.close {
  position: absolute;
  top: 0;
  right: 0;
  color: white;
  cursor: pointer;
  border-radius: 50%;
  background: black;
}
.avatar {
  display: flex;
  flex-direction: row;
  position: relative;
  align-items: center;
  .a-img {
    display: flex;
    border-radius: 50%;
    flex-direction: column;
    justify-content: center;
    background: white;
    position: relative;

    & > div {
      display: inline-block;
      text-align: center;
      background: var(--bgc);
      color: white;
      border-radius: 50%;
      width: var(--size);
      height: var(--size);
      line-height: var(--size);
      font-size: 14px;
    }
  }
  :deep(.el-avatar) {
    background: white;
  }

  .name {
    text-align: center;
    color: #19191a;
    font-size: 14px;
    margin-left: 10px;
  }
}
.status {
  position: absolute;
  bottom: -4px;
  right: -8px;
  border-radius: 50%;
  font-size: 15px;
  background: white;
  border: 2px solid white;
}
.error {
  color: #f56c6c !important;;
}
.leader {
  font-size: 12px;
  color: #f78f5f !important;;
}
.pending {
  color: #f78f5f !important;
}
.success {
  color: #35b881 !important;;
}
.transfer {
  color: white;
  background: #7a939d;
  font-size: 12px;
  padding: 1px;
}
.comment {
  color: #1989fa !important;;
}
.cc {
  color: white;
  font-size: 12px;
  padding: 1px;
  margin-top: 5px;
  background: #1989fa !important;;
}
.cancel {
  color: #838383 !important;;
}
.recall {
  color: #f56c6c !important;;
}
</style>
