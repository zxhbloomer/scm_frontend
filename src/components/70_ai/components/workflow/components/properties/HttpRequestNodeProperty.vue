<template>
  <div class="http-request-node-property">
    <!-- 引用输入配置 -->
    <node-property-input
      :workflow="workflow"
      :wf-node="wfNode"
    />

    <!-- URL -->
    <div class="property-section">
      <div class="section-title">URL</div>
      <el-input v-model="nodeConfig.url" placeholder="请输入请求URL" />
    </div>

    <!-- Method -->
    <div class="property-section">
      <div class="section-title">Method</div>
      <el-select v-model="nodeConfig.method" placeholder="请选择请求方法" style="width: 100%;">
        <el-option label="GET" value="GET" />
        <el-option label="POST" value="POST" />
      </el-select>
    </div>

    <!-- 超时时间 -->
    <div class="property-section">
      <div class="section-title">超时时间(秒)</div>
      <el-input-number
        v-model="nodeConfig.timeout"
        :min="1"
        :max="600"
        controls-position="right"
        style="width: 100%;"
      />
    </div>

    <!-- 重试次数 -->
    <div class="property-section">
      <div class="section-title">重试次数</div>
      <el-input-number
        v-model="nodeConfig.retry_times"
        :min="0"
        :max="10"
        controls-position="right"
        style="width: 100%;"
      />
    </div>

    <!-- 请求头 -->
    <div class="property-section">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="请求头" name="headers">
          <el-table :data="nodeConfig.headers" size="small" border style="margin-bottom: 8px;">
            <el-table-column prop="name" label="Key" width="150">
              <template slot-scope="scope">
                <el-input v-model="scope.row.name" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="value" label="Value">
              <template slot-scope="scope">
                <el-input v-model="scope.row.value" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  icon="el-icon-delete"
                  size="small"
                  @click="handleDeleteHeader(scope.$index)"
                />
              </template>
            </el-table-column>
          </el-table>
          <el-button size="small" @click="handleAddHeader">+ 添加请求头</el-button>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 请求参数 -->
    <div class="property-section">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="请求参数" name="params">
          <el-table :data="nodeConfig.params" size="small" border style="margin-bottom: 8px;">
            <el-table-column prop="name" label="Key" width="150">
              <template slot-scope="scope">
                <el-input v-model="scope.row.name" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="value" label="Value">
              <template slot-scope="scope">
                <el-input v-model="scope.row.value" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  icon="el-icon-delete"
                  size="small"
                  @click="handleDeleteParam(scope.$index)"
                />
              </template>
            </el-table-column>
          </el-table>
          <el-button size="small" @click="handleAddParam">+ 添加参数</el-button>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- Content-Type -->
    <div class="property-section">
      <div class="section-title">Content-Type</div>
      <el-select v-model="nodeConfig.content_type" placeholder="请选择Content-Type" style="width: 100%;">
        <el-option label="text/plain" value="text/plain" />
        <el-option label="application/json" value="application/json" />
        <el-option label="x-www-form-urlencoded" value="application/x-www-form-urlencoded" />
        <el-option label="form-data" value="multipart/form-data" />
      </el-select>

      <!-- JSON Body -->
      <div v-show="nodeConfig.content_type === 'application/json'" style="margin-top: 12px;">
        <el-input
          v-model="nodeConfig.json_body"
          type="textarea"
          :autosize="{ minRows: 5, maxRows: 10 }"
          placeholder="请输入JSON格式数据"
        />
      </div>

      <!-- Text Body -->
      <div v-show="nodeConfig.content_type === 'text/plain'" style="margin-top: 12px;">
        <el-input
          v-model="nodeConfig.text_body"
          type="textarea"
          :autosize="{ minRows: 5, maxRows: 10 }"
          placeholder="请输入文本内容"
          show-word-limit
        />
      </div>

      <!-- Form URL Encoded Body -->
      <div v-show="nodeConfig.content_type === 'application/x-www-form-urlencoded'" style="margin-top: 12px;">
        <el-table :data="nodeConfig.form_urlencoded_body" size="small" border style="margin-bottom: 8px;">
          <el-table-column prop="name" label="Key" width="150">
            <template slot-scope="scope">
              <el-input v-model="scope.row.name" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="value" label="Value">
            <template slot-scope="scope">
              <el-input v-model="scope.row.value" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template slot-scope="scope">
              <el-button
                type="text"
                icon="el-icon-delete"
                size="small"
                @click="handleDeleteFormUrlencodedBody(scope.$index)"
              />
            </template>
          </el-table-column>
        </el-table>
        <el-button size="small" @click="handleAddFormUrlencodedBody">+ 添加参数</el-button>
      </div>

      <!-- Form Data Body -->
      <div v-show="nodeConfig.content_type === 'multipart/form-data'" style="margin-top: 12px;">
        <el-table :data="nodeConfig.form_data_body" size="small" border style="margin-bottom: 8px;">
          <el-table-column prop="name" label="Key" width="150">
            <template slot-scope="scope">
              <el-input v-model="scope.row.name" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="value" label="Value">
            <template slot-scope="scope">
              <el-input v-model="scope.row.value" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template slot-scope="scope">
              <el-button
                type="text"
                icon="el-icon-delete"
                size="small"
                @click="handleDeleteFormDataBody(scope.$index)"
              />
            </template>
          </el-table-column>
        </el-table>
        <el-button size="small" @click="handleAddFormDataBody">+ 添加参数</el-button>
      </div>
    </div>

    <!-- 清除HTML -->
    <div class="property-section">
      <div class="section-title">
        清除HTML
        <el-tooltip placement="top">
          <div slot="content">如果响应是 HTML 格式且只需要主要内容，请将其打开。</div>
          <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
        </el-tooltip>
      </div>
      <el-switch v-model="nodeConfig.clear_html" />
    </div>

    <!-- 输出变量说明 -->
    <div class="property-section">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="输出变量" name="output">
          <div class="output-vars">
            <div class="output-var-item">
              <el-tag size="small" type="info">status_code</el-tag>
              <span>Http状态码</span>
            </div>
            <div class="output-var-item">
              <el-tag size="small" type="info">output</el-tag>
              <span>响应体</span>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import NodePropertyInput from '../NodePropertyInput.vue'

export default {
  name: 'HttpRequestNodeProperty',

  components: {
    NodePropertyInput
  },

  props: {
    workflow: {
      type: Object,
      required: true
    },
    wfNode: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      activeNames: ['headers', 'params']
    }
  },

  computed: {
    nodeConfig () {
      // 初始化默认值
      if (!this.wfNode.nodeConfig.url) {
        this.$set(this.wfNode.nodeConfig, 'url', '')
      }
      if (!this.wfNode.nodeConfig.method) {
        this.$set(this.wfNode.nodeConfig, 'method', 'GET')
      }
      if (!this.wfNode.nodeConfig.timeout) {
        this.$set(this.wfNode.nodeConfig, 'timeout', 30)
      }
      if (!this.wfNode.nodeConfig.retry_times) {
        this.$set(this.wfNode.nodeConfig, 'retry_times', 0)
      }
      if (!this.wfNode.nodeConfig.headers) {
        this.$set(this.wfNode.nodeConfig, 'headers', [])
      }
      if (!this.wfNode.nodeConfig.params) {
        this.$set(this.wfNode.nodeConfig, 'params', [])
      }
      if (!this.wfNode.nodeConfig.content_type) {
        this.$set(this.wfNode.nodeConfig, 'content_type', 'application/json')
      }
      if (!this.wfNode.nodeConfig.json_body) {
        this.$set(this.wfNode.nodeConfig, 'json_body', '{}')
      }
      if (!this.wfNode.nodeConfig.text_body) {
        this.$set(this.wfNode.nodeConfig, 'text_body', '')
      }
      if (!this.wfNode.nodeConfig.form_urlencoded_body) {
        this.$set(this.wfNode.nodeConfig, 'form_urlencoded_body', [])
      }
      if (!this.wfNode.nodeConfig.form_data_body) {
        this.$set(this.wfNode.nodeConfig, 'form_data_body', [])
      }
      if (this.wfNode.nodeConfig.clear_html === undefined) {
        this.$set(this.wfNode.nodeConfig, 'clear_html', false)
      }
      return this.wfNode.nodeConfig
    }
  },

  methods: {
    handleAddHeader () {
      this.nodeConfig.headers.push({ name: '', value: '' })
    },
    handleDeleteHeader (index) {
      this.nodeConfig.headers.splice(index, 1)
    },
    handleAddParam () {
      this.nodeConfig.params.push({ name: '', value: '' })
    },
    handleDeleteParam (index) {
      this.nodeConfig.params.splice(index, 1)
    },
    handleAddFormUrlencodedBody () {
      this.nodeConfig.form_urlencoded_body.push({ name: '', value: '' })
    },
    handleDeleteFormUrlencodedBody (index) {
      this.nodeConfig.form_urlencoded_body.splice(index, 1)
    },
    handleAddFormDataBody () {
      this.nodeConfig.form_data_body.push({ name: '', value: '' })
    },
    handleDeleteFormDataBody (index) {
      this.nodeConfig.form_data_body.splice(index, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
.http-request-node-property {
  padding: 16px 0;

  .property-section {
    margin-top: 24px;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
      color: #303133;
      display: flex;
      align-items: center;
    }
  }

  .output-vars {
    padding: 8px;

    .output-var-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      .el-tag {
        margin-right: 12px;
      }

      span {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}
</style>
