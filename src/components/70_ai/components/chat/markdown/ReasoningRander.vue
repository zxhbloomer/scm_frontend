<template>
  <div class="reasoning">
    <el-button
      type="text"
      class="reasoning-button"
      @click="showThink = !showThink"
    >
      思考过程
      <i :class="['el-icon-arrow-down', showThink ? 'rotate-180' : '']" class="ml-4" />
    </el-button>
    <el-collapse-transition>
      <div v-show="showThink" class="reasoning-content">
        <md-preview
          ref="editorRef"
          :text="content"
          class="reasoning-md"
        />
      </div>
    </el-collapse-transition>
  </div>
</template>

<script>
import MdPreview from './MdPreview.vue'

export default {
  name: 'ReasoningRander',
  components: {
    MdPreview
  },
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      showThink: true
    }
  },
  methods: {
    toggleThink () {
      this.showThink = !this.showThink
    },

    // 展开推理过程
    expandThink () {
      this.showThink = true
    },

    // 收起推理过程
    collapseThink () {
      this.showThink = false
    }
  }
}
</script>

<style lang="scss" scoped>
.reasoning {
  margin-bottom: 16px;

  .reasoning-button {
    font-size: 14px;
    color: #909399 !important;
    padding: 0;
    border: none;
    background: transparent;

    &:hover {
      color: #409EFF !important;
    }

    .ml-4 {
      margin-left: 8px;
      transition: transform 0.3s ease;
    }

    .rotate-180 {
      transform: rotate(180deg);
    }
  }

  .reasoning-content {
    margin-top: 8px;
    border-left: 3px solid #E4E7ED;

    .reasoning-md {
      padding-left: 8px;
      color: #909399;
      font-size: 13px;

      ::v-deep .github-markdown-body {
        color: #909399;
        font-size: 13px;
      }

      ::v-deep h1, ::v-deep h2, ::v-deep h3, ::v-deep h4, ::v-deep h5, ::v-deep h6 {
        color: #606266;
        font-size: 14px;
        margin-top: 8px;
        margin-bottom: 4px;
      }

      ::v-deep p {
        margin: 4px 0;
        line-height: 1.4;
      }

      ::v-deep code {
        background-color: rgba(0, 0, 0, 0.05);
        color: #909399;
        padding: 1px 3px;
        border-radius: 2px;
        font-size: 12px;
      }

      ::v-deep pre {
        background-color: rgba(0, 0, 0, 0.03);
        border: 1px solid #E4E7ED;
        border-radius: 4px;
        padding: 8px;
        margin: 8px 0;
      }

      ::v-deep blockquote {
        border-left: 3px solid #E4E7ED;
        padding-left: 8px;
        color: #909399;
        margin: 8px 0;
      }
    }
  }
}

/* 动画效果 */
.el-collapse-transition {
  transition: 0.3s height ease-in-out, 0.3s padding-top ease-in-out, 0.3s padding-bottom ease-in-out;
}
</style>
