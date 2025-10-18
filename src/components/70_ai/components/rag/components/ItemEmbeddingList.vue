<template>
  <div class="embedding-list-container">
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      max-height="400"
    >
      <el-table-column
        prop="embeddingId"
        label="ID"
        width="200"
      />

      <el-table-column
        label="嵌入"
        prop="embedding"
      >
        <template slot-scope="scope">
          <div
            class="embedding-text"
            @click="handleShowDetail(scope.row.embedding.join(','))"
          >
            <template v-if="scope.row.embedding && scope.row.embedding.length > 8">
              {{ scope.row.embedding.slice(0, 8).join(',') }}...
            </template>
            <template v-else>
              {{ scope.row.embedding.join(',') }}
            </template>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="文档片段"
        prop="text"
      >
        <template slot-scope="scope">
          <div
            class="text-content"
            @click="handleShowDetail(scope.row.text)"
          >
            <template v-if="scope.row.text.length > 80">
              {{ scope.row.text.substring(0, 50) }}...
            </template>
            <template v-else>
              {{ scope.row.text }}
            </template>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      :visible.sync="showDetailDialog"
      title="详情"
      width="60%"
    >
      <div class="detail-content">
        {{ detailContent }}
      </div>
    </el-dialog>
  </div>
</template>

<script>
import knowledgeBaseService from '../../../api/knowledgeBaseService'

export default {
  name: 'ItemEmbeddingList',

  props: {
    kbItemUuid: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      loading: false,
      tableData: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      showDetailDialog: false,
      detailContent: ''
    }
  },

  watch: {
    kbItemUuid: {
      handler (val) {
        if (val) {
          this.loadList(1)
        }
      },
      immediate: true
    }
  },

  methods: {
    /**
     * 加载嵌入列表
     */
    async loadList (page) {
      if (!this.kbItemUuid) return

      this.loading = true
      try {
        const response = await knowledgeBaseService.embeddingList(
          this.kbItemUuid,
          page,
          this.pagination.pageSize
        )

        const data = response.data || response
        this.tableData = data.records || data || []
        this.pagination.page = page
        this.pagination.total = data.total || this.tableData.length
      } catch (error) {
        this.$message.error('加载失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },

    /**
     * 分页变化
     */
    handlePageChange (page) {
      this.loadList(page)
    },

    /**
     * 显示详情
     */
    handleShowDetail (content) {
      this.detailContent = content
      this.showDetailDialog = true
    }
  }
}
</script>

<style scoped>
.embedding-list-container {
  padding: 10px;
}

.embedding-text,
.text-content {
  cursor: pointer;
  color: #409EFF;
}

.embedding-text:hover,
.text-content:hover {
  text-decoration: underline;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.detail-content {
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
