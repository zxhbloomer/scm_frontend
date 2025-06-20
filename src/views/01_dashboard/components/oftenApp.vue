<template>
  <el-card>
    <!-- 标题 -->
    <div slot="header">
      <span class="el-card-title">常用应用</span>
      <i
        v-show="!isPanelSetIcon"
        class="el-icon-close"
        style="float: right; padding: 3px 0"
        @click="deletePanelItem"
      />
      <i
        v-show="isPanelSetIcon"
        v-if="!settings.modelEdit"
        class="iconfont icon-setting"
        style="float: right; padding: 3px 0;cursor: pointer;"
        @click="handleSetting"
      />
    </div>
    <!-- 主体区域 -->
    <div v-if="settings.loading === false" class="often-app-box">
      <div
        v-for="(item, index) in setted_list"
        :key="index"
        @click="handleOpenUrl(item)"
      >
        <div class="app-icon ">
          <svg-icon
            :icon-class="item.icon"
            class="app-svg"
          />
        </div>
        <div class="grid-text">{{ item.name }}</div>
      </div>
    </div>
    <el-skeleton v-if="settings.loading" :rows="5" animated />
    <!--    弹窗：编辑常用应用-->
    <div>
      <el-dialog
        v-el-drag-dialog
        title="常用应用维护页面"
        :visible="settings.popEditVisible"
        :modal="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        :append-to-body="true"
        :modal-append-to-body="true"
        destroy-on-close
        width="500px"
      >
        <div>
          <el-alert
            title="常用应用-已加入"
            type="info"
            :closable="false"
          />
          <div class="often-app-box">
            <div
              v-for="(item, index) in setted_list"
              :key="index"
            >
              <div class="app-icon ">
                <svg-icon
                  :icon-class="item.icon"
                  class="app-svg"
                />
                <span
                  class="image-remove"
                  @click="handleDelete(item)"
                >+</span>
              </div>
              <div class="grid-text">{{ item.name }}</div>
            </div>
          </div>
          <el-alert
            title="常用应用-未加入"
            type="info"
            :closable="false"
          />
          <div class="often-app-box">
            <div
              v-for="(item, index) in unsetted_list"
              :key="index"
            >
              <div class="app-icon ">
                <svg-icon
                  :icon-class="item.icon"
                  class="app-svg"
                />
                <span
                  class="image-add"
                  @click="handleInsert(item)"
                >+</span>
              </div>
              <div class="grid-text">{{ item.name }}</div>
            </div>
          </div>
        </div>
        <div
          slot="footer"
          class="dialog-footer"
        >
          <el-divider />
          <el-button
            plain
            :disabled="settings.loading"
            @click="handlCloseDialog"
          >关 闭</el-button>
          <el-button
            type="primary"
            :disabled="settings.loading"
            @click="handlOk"
          >确 定</el-button>
        </div>
      </el-dialog>
    </div>
  </el-card>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import { getOfftenOperationApi, saveOfftenApi } from '@/api/01_dashboard'
import deepCopy from 'deep-copy'
export default {
  components: {
  },
  directives: { elDragDialog },
  props: {
    id: {
      type: [String, Number],
      required: true
    },
    panelSetIcon: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      settings: {
        popEditVisible: false,
        loading: false
      },
      panelId: this.id,
      isPanelSetIcon: this.panelSetIcon,
      setted_list: [],
      unsetted_list: [],
      // 常用操作内容
      operationList: {},
      orignOperationList: {}
    }
  },
  mounted () {
    this.settings.loading = true
    this.init()
  },
  methods: {
    init () {
      this.getData()
    },
    getData () {
      getOfftenOperationApi().then(response => {
        console.log('initData', response)
        this.orignOperationList = deepCopy(JSON.parse(response.data.config))
        this.setted_list = deepCopy(JSON.parse(response.data.config).current)
        this.unsetted_list = deepCopy(JSON.parse(response.data.config).unsetted)
        this.settings.loading = false
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 删除面板项发送事件
    deletePanelItem () {
      this.$emit('deletePanelItemEvent', this.panelId)
    },
    // 设置按钮点击事件
    handleSetting () {
      this.settings.popEditVisible = true
    },
    // 关闭弹出窗口
    handlCloseDialog () {
      this.settings.popEditVisible = false
      console.log('handlCloseDialog', this.orignOperationList)
      this.setted_list = deepCopy(this.orignOperationList.current)
      this.unsetted_list = deepCopy(this.orignOperationList.unsetted)
      this.operationList = { current: this.setted_list, unsetted: this.unsetted_list }
    },
    // 确定
    handlOk () {
      this.operationList = { current: this.setted_list, unsetted: this.unsetted_list }
      console.log('handlOk', this.operationList)
      this.settings.loading = true
      /**
       * 数据库保存
       */
      this.showLoading('正在保存，请稍后...')
      window.sessionStorage.setItem('layout', JSON.stringify(this.layout))
      saveOfftenApi({ config: this.operationList })
        .then(
          _data => {
            this.closeLoading()
            this.settings.loading = false
            this.$notify({
              title: '桌面保存成功',
              message: _data.message,
              type: 'success',
              duration: this.settings.duration
            })
          },
          _error => {
            this.closeLoading()
            this.settings.loading = false
            this.$notify({
              title: '桌面保存失败',
              message: _error.message,
              type: 'error',
              duration: this.settings.duration
            })
          }
        )
        .finally(() => {
          this.closeLoading()
          this.settings.loading = false
          this.settings.popEditVisible = false
        })
    },
    // 退出常用操作
    handleDelete (item) {
      console.log('handleDelete', item)
      this.unsetted_list.push(item)
      this.setted_list = this.setted_list.filter(val => val.id !== item.id)
      this.operationList = { current: this.setted_list, unsetted: this.unsetted_list }
    },
    // 加入快捷操作
    handleInsert (item) {
      console.log('handleInsert', item)
      this.setted_list.push(item)
      this.unsetted_list = this.unsetted_list.filter(val => val.id !== item.id)
      this.operationList = { current: this.setted_list, unsetted: this.unsetted_list }
    },
    // 打开链接
    handleOpenUrl (item) {
      console.log('handleOpenUrl', item)
      this.$router.push({ path: item.url })
    }
  }
}
</script>

<style scoped>
.el-card {
  height: 100%;
}
.el-icon-close {
  font-size: 1.2em;
  cursor: pointer;
}
.el-card-title {
  font-weight: bold;
}
.often-app-box {
  display: grid;
  grid-template-columns: repeat(4, 25%);
  cursor: pointer;
  justify-items: center;
}
.often-app-box .often-app {
  display: flex;
  flex-direction: column;
  width: 80px;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}
.often-app i {
  color: #fff;
  padding: 10px;
  font-size: 2em;
  border-radius: 4px;
}
.app-1 i {
  background: #29c814;
}
.app-2 i {
  background: #ffb339;
}
.app-3 i {
  background: #ff6b79;
}
.app-4 i {
  background: #00cde9;
}
.app-5 i {
  background: #39a0ff;
}
.app-title {
  margin-top: 10px;
}
.app-icon {
  position: relative;
  width: 70px;
  height: 70px;
  align-items: center;
  border-radius: 24px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  color: #ffffff;
  font-size: 40px;
}
.icon-image {
  max-width: 70%;
  max-height: 70%;
  object-fit: contain;
}

.image-remove{
  background-color: #aeaeae;
  font-color: #ececec;
  font-size: 18px;
  width: 20px;
  height: 20px;
  text-align: center;
  border-radius: 100%;
  transform: rotate(45deg);
  cursor:pointer;
  opacity: 0.5;
  top:2px;
  right:2px;
  display: block;
  position: absolute;
}

.image-add{
  background-color: #1890ff;
  font-color: #ececec;
  font-size: 18px;
  width: 20px;
  height: 20px;
  text-align: center;
  border-radius: 100%;
  cursor:pointer;
  opacity: 0.5;
  top:2px;
  right:2px;
  display: block;
  position: absolute;
}
.save-btn {
  background-color: #396aff !important;
  color: #fff !important;
}
.head_container{
  float: right;
}
</style>
