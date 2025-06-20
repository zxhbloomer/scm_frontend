<template>
  <div class="progress">
    <div v-for="item in progress" :key="item.task_id" class="progress-item">
      <div>
        <div class="item-user">
          <div class="item-user-avatar">
            <template v-if="item.user">
              <avatar
                :show-name="false"
                :status="getStatus(item)"
                :name="item.user.name"
                :src="item.user.avatar"
              />
            </template>
            <template v-else>
              <span v-if="item.node_type === 'APPROVAL'" class="iconfont icon-huiyi multi-user-avatar" />
              <icon v-else name="el-icon-promotion multi-user-avatar" class="el-icon-s-promotion" />
            </template>
          </div>
          <div class="item-user-desc">
            <div>{{ item.name }}</div>
            <div>{{ getDesc(item) }}</div>
          </div>
        </div>
        <div class="time">{{ getShortTime(item) }}</div>
      </div>

      <div v-if="item.users && item.users.length > 0" class="multi-user">
        <div v-for="subItem in item.users" :key="subItem.task_id" class="">
          <div class="item-user-avatar">
            <avatar
              show-y
              :size="35"
              :status="getStatus(subItem)"
              :name="subItem.user.name"
              :src="subItem.user.avatar"
            />
          </div>
        </div>
      </div>

      <div v-show="(item.comment && item.comment.length > 0) || item.signature" class="user-comment">
        <!--        签名-->
        <div v-if="item.signature" style="display: flex; align-items: center">
          <span><icon name="el-icon-editpen" /> 签字： </span>
          <img :src="item.signature" style="width: 140px; height: 60px">
        </div>
        <!--        评论-->
        <div v-for="cmt in item.comment" :key="cmt.id" style="position: relative">
          <div v-if="item.users" class="user-comment-user">
            <avatar :size="30" :name="cmt.user.name" :src="cmt.user.avatar" />
            <span>（添加了评论）</span>
          </div>
          <div v-if="item.users" class="user-comment-time">{{ cmt.c_time.substring(5, 16) }}</div>
          <div class="user-comment-content">
            <div class="text-comment">{{ cmt.text }}</div>
            <div v-show="cmt.annex_files && cmt.annex_files.length > 0" class="image-comment">
              <el-row style="display: flex;flex-wrap: wrap;">
                <el-col
                  v-for="(atem, i) in cmt.annex_files"
                  :key="i"
                >
                  <previewProcess
                    :show-delete="false"
                    :file-name="atem.file_name"
                    :url="atem.url"
                    :time="atem.timestamp"
                    :width="110"
                    :height="70"
                  />
                </el-col>
              </el-row>
            </div>
            <div class="user-comment-time">{{ cmt.c_time.substring(5, 16) }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="progress-item end-process">
      <div class="item-user-avatar node-icon">
        <icon
          :key="statusIcon"
          :name="`${statusIcon} multi-user-avatar`"
          :styles="statusColor"
        />
      </div>
      <div class="item-user-desc" style="font-size: 16px; line-height: 34px">{{ status }}</div>
    </div>
  </div>
</template>

<script>
import { getTaskResult } from './ProcessUtil.js'
import Avatar from '@/components/ProcessProgress/Avatar.vue'
import Icon from '@/components/ProcessProgress/Icon.vue'
import previewProcess from '@/components/50_preview_card/preview_process.vue'

export default {
  components: { previewProcess, Icon, Avatar },
  props: {
    progress: {
      type: Array,
      required: true,
      default: () => []
    },
    result: {
      type: String,
      required: true,
      default: null
    },
    status: {
      type: String,
      required: true,
      default: '未知'
    }
  },
  data () {
    return {
    }
  },
  computed: {
    // eslint-disable-next-line vue/return-in-computed-property
    statusIcon () {
      switch (this.result) {
        case 'RUNNING':
          return 'el-icon-morefilled icon-morefilled el-icon-remove '
        case 'COMPLETE':
          return 'el-icon-morefilled icon-morefilled el-icon-success'
        case 'PASS':
          return 'el-icon-morefilled icon-morefilled el-icon-success'
        case 'CANCEL':
          return 'el-icon-circleclose icon-morefilled el-icon-circle-close'
        case 'REFUSE':
          return 'el-icon-morefilled icon-morefilled el-icon-error'
      }
    },
    // eslint-disable-next-line vue/return-in-computed-property
    statusColor () {
      switch (this.result) {
        case 'RUNNING':
          return 'font-size: 40px; border-radius: 50%; background: white !important; color: #35b881 !important;'
        case 'COMPLETE':
          return 'font-size: 40px; border-radius: 50%; background: white !important; color: #35b881 !important;'
        case 'PASS':
          return 'font-size: 40px; border-radius: 50%; background: white !important; color: #35b881 !important;'
        case 'CANCEL':
          return 'font-size: 40px; border-radius: 50%; background: white !important; color: #808080 !important;'
        case 'REFUSE':
          return 'font-size: 40px; border-radius: 50%; background: white !important; color: #FF0000 !important;'
      }
    }
  },
  methods: {
    // filterImages (annex_files) {
    //   return annex_files.url
    // },
    // filterFiles (annex_files) {
    //   return (annex_files || [])
    //     .map((f) => {
    //       f.url = this.$getRes(f.url)
    //       return f
    //     })
    // },
    download (file) {
      window.open(`${this.$getRes(file.url)}?name=${file.name}`, '_blank')
    },
    // getSize (size) {
    //   if (size > 1048576) {
    //     return (size / 1048576).toFixed(1) + 'MB'
    //   } else if (size > 1024) {
    //     return (size / 1024).toFixed(1) + 'KB'
    //   } else {
    //     return size + 'B'
    //   }
    // },
    getShortTime (item) {
      if (item.finish_time !== null) {
        return item.finish_time.substring(5, 16)
      } else if (item.start_time === null) {
        return '等待中'
      } else {
        return '处理中'
      }
    },
    getStatus (item) {
      if (item.finish_time === null) return 'pending'
      if (item.node_type === 'CC' && item.result === 'agree') return 'cc'
      if (item.result === 'complete') return 'success'
      if (item.result === 'agree') return 'success'
      if (item.result === 'refuse') return 'error'
      if (item.result === 'comment') return 'comment'
      if (item.result === 'transfer') return 'transfer'
      if (item.result === 'recall') return 'recall'
      if (item.node_type === 'cancel') return 'cancel'
      return undefined
    },
    getDesc (item) {
      if (item.node_type === 'ROOT') {
        return item.user.name
      } else if (item.node_type === 'APPROVAL' || item.node_type === 'TASK') {
        if (item.user) {
          return `${item.user.name}（${getTaskResult(item).text}）`
        }
        const desc = `${item.users.length}人（`
        switch (item.approval_mode) {
          case 'AND':
            return desc + '会签）'
          case 'OR':
            return desc + '或签）'
          case 'NEXT':
            return desc + '顺序会签）'
        }
      } else if (item.node_type === 'CC') {
        return item.user ? `抄送 ${item.user.name}（${getTaskResult(item).text}）` : `抄送 ${item.users.length}人`
      } else if (item.result === 'comment') {
        return `${item.user.name}（添加了评论）`
      }
    }
  }
}
</script>

<style lang="less" scoped>
.progress {
  position: relative;
}

.progress::after {
  content: '';
  position: absolute;
  width: 4px;
  top: 0;
  left: 18px;
  color: #e4e4e4;
  background: #e4e4e4;
  height: 100%;
}

.end-process {
  height: 40px;

  .node-icon {
    span {
      font-size: 30px;
    }

    .icon {
      left: 0 !important;
      top: 0 !important;
    }

    .icon-success {
      color: #35b881 !important;
      background: white !important;
    }

    .icon-error {
      color: #f56c6c !important;
      background: white !important;
    }

    .icon-circleclose {
      color: #979797 !important;
      background: white !important;
    }

    .icon-morefilled {
      color: #b0b0b0 !important;
      background: #e4e4e4 !important;
    }
  }
}

.progress-item {
  z-index: 1;
  margin-bottom: 30px;
  position: relative;

  .item-user {
    & > div {
      display: inline-block;
    }
  }

  .user-comment {
    margin-left: 60px;
    font-size: 14px;
    position: relative;
    padding-top: 5px;

    .user-comment-user {
      display: flex;
      align-items: center;
    }

    :deep(.a-img span) {
      font-size: 12px;
    }

    .user-comment-time {
      position: absolute;
      right: 8px;
      top: 7px;
      color: #8c8c8c;
      font-size: small;
    }

    .user-comment-content {
      margin: 5px 0;
      background: #eeeeee;
      padding: 5px 20px;
      border-radius: 0 5px 5px 5px;

      :deep(.image-comment) {
        padding: 5px 0;

        .image {
          height: 60px;
          width: 60px;
          padding: 5px;
        }

        img {
          border-radius: 5px;
        }
      }

      .file-comment {
        .file-item {
          color: #1989fa;
          cursor: pointer;
        }
      }
    }
  }

  .item-user-avatar {
    background: white;
    position: relative;
    padding: 4px 0;

    :deep(.icon) {
      border-radius: 50%;
      font-size: 15px;
      color: white;
      border: 2px solid white;
      position: absolute;
      padding: 0px;
      right: -10px;
      top: 20px;
    }

    .el-icon-promotion {
      padding: 1px;
      font-size: 12px;
    }

    .el-icon-more {
      color: white;
      font-size: 6px !important;
    }

    .multi-user-avatar {
      display: flex;
      height: 40px;
      width: 40px;
      background: #1989fa;
      color: white;
      font-size: 28px;
      border-radius: 50%;
      justify-content: center;
      align-items: center;
      right: -43px;
      top: -5px;
    }
  }

  .item-user-desc {
    position: absolute;
    left: 60px;
    top: 5px;
    font-size: 14px;

    div:nth-child(1) {
      color: #8c8c8c;
    }

    div:nth-child(2) {
      font-size: 15px;
      color: black;
    }
  }
}

.time {
  font-size: 15px;
  color: #8a8a8a;
  position: absolute;
  right: 0;
  top: 0;
}

.multi-user {
  margin-top: 25px;
  display: grid;
  margin-left: 50px;
  grid-template-columns: repeat(7, 60px);
  /*.item-user-avatar {
    :deep(.icon) {
      right: 2px;
    }
  }*/
}
</style>
