<!--card-->
<template>
  <div>
    <el-descriptions
      title=""
      :column="1"
      :label-style="{ display: 'none' }"
      :content-style="contentStyle"
      direction="horizontal"
      style="padding-right: 10px;padding-left: 10px;"
      border
    >
      <el-descriptions-item
        v-for="(file, index) in attachmentFiles"
        :key="index"
        label=""
      >
        <span>
          附件名称：{{ file.fileName }} &nbsp;文件上传日期：{{ formatTimestamp(file.timestamp) }} &nbsp;<span class="clickable" @click="handleDownload(file)">下载</span>
        </span>
      </el-descriptions-item>
    </el-descriptions>

    <iframe
      id="refIframe"
      ref="refIframe"
      scrolling="no"
      frameborder="0"
      style="display:none"
      name="refIframe"
    >x</iframe>
  </div>
</template>

<style scoped>
/* .iframe {
  width: 100%;
  height: 100%;
} */
.span_filename {
  word-break: normal;
  width: auto;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  padding-left: 10px;
}
.clickable {
  cursor: pointer;
  color: #409EFF;
  text-decoration: underline;
}
.clickable:hover {
  color: #66b1ff;
}
.span_title {
  word-break: normal;
  width: auto;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  padding-left: 10px;
}
.span_time {
  word-break: normal;
  width: auto;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  padding-left: 10px;
}
.time {
  color: #999;
}
.floatRight {
  float: right;
  padding-right: 10px;
}
.floatLeft {
  float: left;
  padding-left: 10px;
}
.el-card {
  margin-bottom: 10px;
}
.bottom {
  line-height: 10px;
}

.image {
  width: 100%;
  display: block;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: '';
}

.clearfix:after {
  clear: both;
}
</style>

<script>
import { Base64 } from 'js-base64'
import { exportCorsFileApi } from '@/api/00_common/corsDownload'

export default {
  name: 'CardComponent',
  props: {
    // 附件文件数组
    attachmentFiles: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      contentStyle: {
        width: '100%'
      },
      dataJson: {
        iframeWidth: 228,
        preview_online_url: '',
        preview_pic_url: '',
        settings: {
          // 页面设置json
          // loading 状态
          loading: true
        }
      }
    }
  },
  // 监听器
  watch: {
  },
  created () {
    // 初始化查询
    // this.init() // 暂时注释掉，因为不再依赖单个文件
  },
  mounted () {
    // 描绘完成
  },
  destroyed () {
  },
  methods: {
    // 初始化
    init (url = '') {
      if (!url) return
      const base64_encode = encodeURIComponent(Base64.encode(url))
      this.dataJson.preview_online_url = process.env.VUE_APP_FILE_ONLINE_PREVIEW_URL + '?url=' + base64_encode
      this.dataJson.preview_pic_url = process.env.VUE_APP_FILE_PIC_PREVIEW_URL +
        '?width=' + process.env.VUE_APP_FILE_ONLINE_PREVIEW_WIDTH +
        '&height=' + process.env.VUE_APP_FILE_ONLINE_PREVIEW_HEIGHT +
        '&url=' + base64_encode
    },
    handleDelete (file) {
      this.$emit('removeFile', file.url)
    },
    handlePreview (file) {
      this.init(file.url)
      const width = 300
      const height = 400
      window.open(this.dataJson.preview_online_url + '&width=' + width + '&height=' + height)
    },
    async handleDownload (file) {
      const url = file.url // 文件下载地址
      const fileName = file.fileName // 文件名
      const res = await exportCorsFileApi({ // 获取文件二进制数据的接口
        urlPath: url
      })
      this.saveAs(new Blob([res], { type: 'text/plain;charset=UTF-8' }), fileName)
    },

    // 格式化时间戳
    formatTimestamp (timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN')
    },

    // 导出文件函数
    saveAs (obj, fileName) {
      const ele = document.createElement('a')
      ele.download = fileName || '下载'
      ele.href = URL.createObjectURL(obj) // 绑定a标签
      ele.style.display = 'none'
      document.body.appendChild(ele) // 兼容火狐浏览器
      ele.click()
      setTimeout(function () { // 延时释放
        URL.revokeObjectURL(obj) // 用URL.revokeObjectURL()来释放这个object URL
        document.body.removeChild(ele)// 兼容火狐浏览器
      }, 100)
    }
  }
}
</script>
