<template>
  <div
    ref="page"
    :class="{ 'floating-window': true, zIndexTop: moveFlags }"
    @mouseup.stop.prevent="moveEnd"
  >
    <div
      ref="floatBtn"
      class="popover-content__trigger floatBtn"
      :style="{
        transition: !moveFlags ? 'all 300ms ease' : 'unset',
        transform: `translate3d(${transform.left}px,${transform.top}px,0)`,
      }"
      @mouseover.stop.prevent="showButton"
      @click.stop.prevent="toggleMenu"
    >
      <el-badge
        :hidden="showDot"
        is-dot
        class="item"
      >
        <span
          :style="{
            left: transform.left < 50 ? '-50px' : 0,
            width: moveFlags ? '50px' : '100px',
          }"
          class="hover-area"
          @mouseleave.stop.prevent="hideButton"
        />
        <transition name="floating-popover-fade-in-out">
          <div
            v-if="popoverShow"
            ref="popoverContent"
            class="floating-popover"
            :style="menuPosition"
          >
            <slot>
              <div class="popover-content">
                <!-- <div
                class="popover-content__item el-button"
                @click.stop.prevent="handleResetCustomColumnsWidth"
              >
                <i class="el-icon-refresh-left icon" />重置列宽度
              </div>
              <el-divider /> -->
                <div
                  v-if="shouldShowColumnConfig"
                  class="popover-content__item el-button"
                  @click.stop.prevent="handleTableColumnsSetting"
                >
                  <i class="el-icon-data-analysis icon" />列属性管理
                </div>
                <el-divider v-if="shouldShowColumnConfig && shouldShowBpmManage" />
                <div
                  v-if="shouldShowBpmManage"
                  class="popover-content__item el-button"
                  @click.stop.prevent="handleBpmSetting"
                >
                  <i class="el-icon-cpu icon" />流程管理
                </div>
              </div>
            </slot>
          </div>
        </transition>
        <i
          :style="{ fontSize: `${form.fontSize}px` }"
          class="el-icon-s-tools"
        />
        <!-- <img class="icon" src="../assets/float-icon.png" /> -->
      </el-badge>
    </div>

    <el-dialog
      v-if="popSettings.one.visible"
      v-el-drag-dialog
      v-loading="settings.loading"
      title="列排序设置"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      :visible="popSettings.one.visible"
      :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
      :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
      :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
      custom-class="configDialog"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="900px"
      height="500px"
      destroy-on-close
    >
      <div>
        <span class="checkCount">{{ selected.length }}/{{ resultList.length }}</span>
        <template>
          <div>
            <el-row
              :gutter="10"
              class="configTitle"
            >
              <el-col :span="1" />
              <el-col
                :span="2"
                class="tar"
              >
                序号
              </el-col>
              <el-col
                :span="6"
                class="tal"
              >
                列名称
              </el-col>
              <el-col
                :span="3"
                class="tal"
              >
                <el-checkbox
                  v-model="checkAll"
                  :indeterminate="isIndeterminate"
                  @change="handleCheckAllChange"
                />显示
              </el-col>
              <el-col
                :span="2"
                class="tal"
              >
                固定
              </el-col>
              <el-col
                :span="4"
                class="tal"
              >
                置顶
              </el-col>
            </el-row>
            <!-- <el-checkbox /> <a href="javascript:void(0);">重置</a> -->

            <el-row :gutter="10">
              <el-divider />
              <div class="el-dialog-div">
                <div
                  ref="mainSortableContainer"
                  class="hierarchical-column-list"
                >
                  <!-- 渲染所有项目，按resultList顺序显示 -->
                  <template v-for="item in resultList">
                    <!-- 普通列项 -->
                    <div
                      v-if="item.is_group !== 1"
                      :key="item.id"
                      :data-id="item.id"
                      :class="['draggable-item', 'normal-item', { 'is-fixed': item.fix }]"
                    >
                      <el-row :gutter="10" class="item-row">
                        <el-col :span="1" class="tal">
                          <i class="el-icon-rank drag-handle" />
                        </el-col>
                        <el-col :span="2" class="tar">
                          {{ item.sort*1+1 }}
                        </el-col>
                        <el-col :span="6" class="tal">
                          {{ item.label }}
                        </el-col>
                        <el-col :span="3" class="tal">
                          <el-checkbox
                            v-model="item.is_enable"
                            :disabled="item.fix || item.is_delete !== false"
                            @change="handleCheckedChange"
                          />
                        </el-col>
                        <el-col :span="3" class="tal">
                          {{ item.fix === true?'是':'否' }}
                        </el-col>
                        <el-col :span="4" class="tal">
                          <i
                            v-if="!item.fix && item.is_delete === false"
                            class="el-icon-top"
                            @click="top(item)"
                          />
                        </el-col>
                      </el-row>
                    </div>

                    <!-- 分组头 -->
                    <div
                      v-else-if="item.is_group === 1"
                      :key="item.id"
                      :data-id="item.id"
                      :data-group-name="item.name"
                      :class="['draggable-item', 'group-item']"
                    >
                      <!-- 分组头显示 -->
                      <div class="group-header-content">
                        <el-row :gutter="10" class="item-row">
                          <el-col :span="1" class="tal">
                            <i class="el-icon-rank drag-handle group-drag-handle" />
                          </el-col>
                          <el-col :span="2" class="tar">
                            {{ item.sort*1+1 }}
                          </el-col>
                          <el-col :span="6" class="tal group-header-label">
                            <strong>{{ item.label }}</strong>
                            <span class="item-count">({{ (item.groupChildren || []).length }}项)</span>
                          </el-col>
                          <el-col :span="3" class="tal">
                            <el-checkbox
                              v-model="item.is_enable"
                              :disabled="item.fix || item.is_delete !== false"
                              @change="handleGroupHeaderCheckedChange(item)"
                            />
                          </el-col>
                          <el-col :span="7" class="tal">
                            <!-- 组头不显示固定和置顶 -->
                          </el-col>
                        </el-row>
                      </div>

                      <!-- 分组内子项 -->
                      <div class="group-children-container">
                        <ul
                          :ref="`groupChildrenList_${item.name}`"
                          class="group-children-list"
                          :data-group-name="item.name"
                        >
                          <li
                            v-for="(child, childIndex) in item.groupChildren || []"
                            :key="child.id"
                            :data-id="child.id"
                            :class="['group-child-item', { 'is-fixed': child.fix }]"
                          >
                            <el-row :gutter="10" class="item-row child-item-row">
                              <el-col :span="1" class="tal">
                                <i class="el-icon-rank child-drag-handle" />
                              </el-col>
                              <el-col :span="2" class="tar">
                                {{ child.displayIndex || (childIndex + 1) }}
                              </el-col>
                              <el-col :span="6" class="tal child-label">
                                <span class="group-child-text">{{ child.label }}</span>
                              </el-col>
                              <el-col :span="3" class="tal">
                                <el-checkbox
                                  v-model="child.is_enable"
                                  :disabled="child.fix || child.is_delete !== false"
                                  @change="handleCheckedChange"
                                />
                              </el-col>
                              <el-col :span="7" class="tal">
                                <!-- 分组内不显示固定和置顶 -->
                              </el-col>
                            </el-row>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </template>
                </div>
                <div />
              </div>
            </el-row>
          </div>
        </template>
      </div>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-divider />
        <br>
        <el-button
          type="primary"
          class="floatLeft"
          :disabled="settings.loading"
          @click="handleReset"
        >重置列排序设置</el-button>
        <el-button
          type="primary"
          class="floatLeft"
          :disabled="settings.loading"
          @click="handleResetCustomColumnsWidth"
        >重置列宽度</el-button>

        <el-button
          plain
          type="primary"
          :disabled="settings.loading || !confirmButtonEnabled"
          @click="handleOk"
        >确定</el-button>

        <el-button
          :disabled="settings.loading"
          @click="handleCancel"
        >取消</el-button>
      </div>
    </el-dialog>

    <bpm-dialog
      v-if="bpmVisible"
      :data="bpmTemplateData"
      :visible="bpmVisible"
      :dialog-status="constants_para.STATUS_UPDATE"
      @closeMeCancel="handleBpmDialogCancel"
    />
    <bpm-list-dialog
      v-if="bpmListVisible"
      :data="bpmTemplateDataList"
      :visible="bpmListVisible"
      title="流程列表-选择您需要编辑流程"
      @closeMeCancel="handleBpmListDialogCancel"
    />
  </div>
</template>
<script>

import { EventBus } from '@/common/eventbus/eventbus'
import elDragDialog from '@/directive/el-drag-dialog'
import permission from '@/directive/permission' // 权限判断指令
import bpmDialog from '@/components/60_bpm/designBpmDialog.vue'
import bpmListDialog from '@/views/90_bpm/definition/00_dialog/list/dialog.vue'
import constants_para from '@/common/constants/constants_para'
import Sortable from 'sortablejs'

import { getTableConfigApi, saveTableConfigApi, resetTableConfigApi, checkTableConfigApi, getBpmDataByPageCodeApi } from '@/api/00_common/table_config'

export default {
  name: 'FloatMenu',
  components: { bpmDialog, bpmListDialog },
  directives: { elDragDialog, permission },
  mixins: [],
  props: {
    form: {
      type: Object,
      default: function () {
        return {
          fontSize: 28
        }
      }
    },
    // 是否显示列属性管理按钮
    showColumnConfig: {
      type: Boolean,
      default: true
    },
    // 是否显示流程管理按钮
    showBpmManage: {
      type: Boolean,
      default: true
    },
    // 流程管理权限（仅当showBpmManage为true时生效）
    bpmManagePermission: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      bpmVisible: false,
      bpmListVisible: false,
      showDot: true,
      checkAll: false,
      isIndeterminate: false,
      contentStyle: {
        width: '100%'
      },
      labelStyle: {
        width: '0%'
      },
      resultList: [], // 表格列数据
      selected: [],
      // SortableJS 实例存储
      sortableInstances: {},
      bpmList: [], // 流程列表数据
      bpmTemplateData: {}, // 流程模板
      bpmTemplateDataList: {}, // 流程模板List
      // 页面设置json
      settings: {
        // loading 状态
        loading: true
      },
      dialogVisible: false,
      moveFlags: false,
      clickFlag: false,
      hoverFlag: false,
      // 初始的位置记录
      movePosition: { x: 0, y: 0 },
      nx: '',
      ny: '',
      dx: '',
      dy: '',
      xPum: '',
      yPum: '',
      popoverShow: false,
      // 显示菜单的定时器
      showMenuTimer: null,

      // 浮窗的位置
      transform: {
        top: document.body.offsetHeight - 300,
        left: document.body.offsetWidth - 25
      },
      lastMoveIndex: 0, //  拖拽计数
      curMoveIndex: 0, //  历史计数
      menuPosition: {
        top: 0,
        left: 0
      },
      popSettings: {
        // 弹出编辑页面
        one: {
          visible: false,
          page_code: ''
        }
      },
      // 确定按钮是否可用
      confirmButtonEnabled: false,
      // 用于跟踪是否为初始数据加载
      isInitialLoad: true
    }
  },
  computed: {
    constants_para () {
      return constants_para
    },
    // 是否显示列属性管理按钮（所有人都可以使用，只控制显示/隐藏）
    shouldShowColumnConfig () {
      return this.showColumnConfig
    },
    // 是否显示流程管理按钮（需要权限验证 + 显示控制）
    shouldShowBpmManage () {
      if (!this.showBpmManage) return false
      if (!this.bpmManagePermission) return false
      const userPermissionDataOperations = this.$store.getters.userPermissionData.permission_operation
      return userPermissionDataOperations.find(item => item.operation_perms === this.bpmManagePermission)
    }
  },
  // 监听器
  watch: {
    'resultList': {
      handler (newVal, oldVal) {
        this.selected = this.resultList.filter(item => {
          return item.is_enable === true
        })
        console.log(this.selected.length)

        // 监听数据变化，启用确定按钮（但不包括初始数据加载）
        if (!this.isInitialLoad) {
          this.confirmButtonEnabled = true
        }
      },
      deep: true // 深度监听，监听数组内对象的变化
    }
  },
  created () {
    document.addEventListener('mouseup', (e) => {
      if (
        e.clientY > window.innerHeight ||
        e.clientY < 60 ||
        e.clientX < 0 ||
        e.clientX > window.innerWidth
      ) {
        this.moveEnd()
      }
    })
    // 控制小红点显示隐藏
    var _this = this
    this.checkTableConfigData(this.$route.meta.page_code, function (page_code, response) {
      _this.showDot = response.data
    })
  },

  mounted () {
    this.$set(this.transform, 'left', document.body.offsetWidth - window.document.querySelector('.sidebar-container').offsetWidth - 25)
    window.addEventListener('resize', () => {
      this.$set(this.transform, 'top', document.body.offsetHeight - 300)
      this.$set(this.transform, 'left', document.body.offsetWidth - window.document.querySelector('.sidebar-container').offsetWidth - 25)
    })
    const floatBtn = this.$refs.floatBtn
    document.addEventListener('click', (event) => {
      if (!floatBtn) return
      var tDom = event.target
      if (floatBtn !== tDom && !floatBtn.contains(tDom)) {
        this.closeMenuAndFloating()
      }
    })
  },

  updated () {
    // 当数据更新后重新初始化SortableJS实例
    this.$nextTick(() => {
      this.initSortableInstances()
    })
  },

  beforeDestroy () {
    // 组件销毁前清理SortableJS实例
    this.destroySortableInstances()
    // 清理定时器
    if (this.showMenuTimer) {
      clearTimeout(this.showMenuTimer)
      this.showMenuTimer = null
    }
  },
  methods: {

    // 获取元素在resultList中的真实索引
    getResultListIndex (item) {
      return this.resultList.findIndex(listItem => listItem.id === item.id)
    },

    // 初始化SortableJS实例
    initSortableInstances () {
      // 销毁已存在的实例
      this.destroySortableInstances()

      // 为主容器创建统一的sortable，处理所有顶级元素
      this.initMainContainerSortable()
      // 为组内子项创建独立的sortable
      this.initGroupChildrenSortable()
    },

    // 销毁所有SortableJS实例
    destroySortableInstances () {
      Object.values(this.sortableInstances).forEach(instance => {
        if (instance && instance.destroy) {
          instance.destroy()
        }
      })
      this.sortableInstances = {}
    },

    // 为主容器创建统一的sortable实例
    initMainContainerSortable () {
      const container = this.$refs.mainSortableContainer
      if (!container) return

      this.sortableInstances.main = Sortable.create(container, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',

        // 指定哪些元素可以被拖拽 - 现在都是主容器的直接子元素
        draggable: '.draggable-item',

        filter: '.is-fixed',

        onMove: (evt) => {
          return !evt.related.classList.contains('is-fixed')
        },

        onEnd: (evt) => {
          this.handleMainDragEnd(evt)
        }
      })
    },

    // 初始化组内子项拖拽
    initGroupChildrenSortable () {
      // 获取所有分组头项
      const groupHeaders = this.resultList.filter(item => item.is_group === 1)

      groupHeaders.forEach((groupHeader) => {
        const refName = `groupChildrenList_${groupHeader.name}`
        const element = this.$refs[refName]

        if (element && element[0]) { // $refs可能返回数组
          const listElement = Array.isArray(element) ? element[0] : element

          this.sortableInstances[refName] = Sortable.create(listElement, {
            group: {
              name: `group-${groupHeader.name}`,
              pull: false, // 不允许拖出组
              put: false // 不接受外部项目
            },
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            filter: '.is-fixed',
            onMove: (evt) => {
              return !evt.related.classList.contains('is-fixed')
            },
            onEnd: (evt) => {
              this.handleGroupChildDragEnd(evt, groupHeader.name)
            }
          })
        }
      })
    },

    // 处理主容器拖拽结束
    handleMainDragEnd (evt) {
      const { oldIndex, newIndex, item } = evt

      if (oldIndex === newIndex) return

      // 新的处理方式：直接操作resultList数组
      const itemId = item.dataset.id

      // 修复类型不匹配：DOM dataset.id是字符串，resultList.id是数字，显式转换类型比较
      const actualOldIndex = this.resultList.findIndex(listItem => listItem.id === Number(itemId))

      if (actualOldIndex === -1) {
        return
      }

      // 根据拖拽元素类型选择处理方式
      if (item.classList.contains('group-item')) {
        // 分组项拖拽 - 整个分组作为单元移动
        this.handleGroupItemDrag(item, actualOldIndex, newIndex)
      } else if (item.classList.contains('normal-item')) {
        // 普通列项拖拽 - 单个项目移动
        this.handleNormalItemDragNew(actualOldIndex, newIndex)
      }

      // 强制触发Vue响应式更新
      this.$forceUpdate()
    },

    // 处理分组项拖拽
    handleGroupItemDrag (item, actualOldIndex, newIndex) {
      const groupName = item.dataset.groupName
      if (!groupName) return

      // 在新结构中，分组是单个项目，不需要收集多个项目
      // 直接移动分组项（包含其所有子项数据）
      const tempResultList = [...this.resultList]

      // 移除被拖拽的分组项
      const [removedGroupItem] = tempResultList.splice(actualOldIndex, 1)

      // 计算实际插入位置
      let insertIndex = newIndex
      if (newIndex >= tempResultList.length) {
        insertIndex = tempResultList.length
      }

      // 重新插入分组项
      tempResultList.splice(insertIndex, 0, removedGroupItem)
      this.resultList = tempResultList
    },

    // 处理普通列项拖拽（新版本）
    handleNormalItemDragNew (actualOldIndex, newIndex) {
      const tempResultList = [...this.resultList]

      // 移除并重新插入
      const [removedItem] = tempResultList.splice(actualOldIndex, 1)

      // 计算实际插入位置
      let insertIndex = newIndex
      if (newIndex >= tempResultList.length) {
        insertIndex = tempResultList.length
      }

      tempResultList.splice(insertIndex, 0, removedItem)
      this.resultList = tempResultList
    },

    // 处理组内子项拖拽结束
    handleGroupChildDragEnd (evt, groupName) {
      const { oldIndex, newIndex } = evt

      if (oldIndex === newIndex) return

      // 找到对应的分组项
      const groupItem = this.resultList.find(item =>
        item.is_group === 1 && item.name === groupName
      )

      if (!groupItem || !groupItem.groupChildren) return

      // 直接操作 groupChildren 数组重新排序
      const draggedItem = groupItem.groupChildren[oldIndex]
      if (draggedItem) {
        // 移除被拖拽的项
        groupItem.groupChildren.splice(oldIndex, 1)
        // 插入到新位置
        groupItem.groupChildren.splice(newIndex, 0, draggedItem)

        // 注意：拖拽后不重新计算displayIndex，保持原有序号显示
        // 等待后端处理完成后，重新加载数据时会获得正确的序号
      }
    },

    closeMenuAndFloating () {
      // console.log('closeMenuAndFloating')
      // 清除显示菜单的定时器
      if (this.showMenuTimer) {
        clearTimeout(this.showMenuTimer)
        this.showMenuTimer = null
      }

      this.popoverShow = false
      this.hoverFlag = false
      this.moveFlags = false
      this.resetFloatBtnLocation()
    },
    async toggleMenu () {
      //  如果上一次down事件到下一次click事件中 相同即为点击事件
      if (this.lastMoveIndex === this.curMoveIndex) {
        console.log(this.lastMoveIndex - this.curMoveIndex)
        this.popoverShow = !this.popoverShow
        await this.$nextTick()
        if (this.popoverShow) {
          document.onmousemove = null
          const { top, left } = this.transform
          if (top >= 60) {
            this.menuPosition.top = `-${this.$refs.popoverContent.offsetHeight +
              10}px`
          } else {
            this.menuPosition.top = '60px'
          }
          if (left > 200) {
            this.menuPosition.left = '-132px'
          } else {
            this.menuPosition.left = 0
          }
          console.log(`top:${top},left:${left}`)
        }
      }
      this.curMoveIndex = this.lastMoveIndex
    },
    hideButton () {
      console.log('mouse-leave')
      // 清除显示菜单的定时器
      if (this.showMenuTimer) {
        clearTimeout(this.showMenuTimer)
        this.showMenuTimer = null
      }

      if (this.popoverShow) return
      this.hoverFlag = false
      // 移动过程中不复位 按钮；
      if (this.moveFlags) return
      this.resetFloatBtnLocation()
    },
    showButton () {
      console.log('mouse-over')
      if (this.moveFlags) return (this.hoverFlag = false)
      this.hoverFlag = true
      const { left, top } = this.transform
      if (left > 0 && left < -25) return

      // 清除之前的定时器
      if (this.showMenuTimer) {
        clearTimeout(this.showMenuTimer)
        this.showMenuTimer = null
      }

      // 先展开按钮到可见位置
      const bodyWidth = document.body.clientWidth - window.document.querySelector('.sidebar-container').offsetWidth
      if (left < bodyWidth / 2) {
        this.generateTransform({ top: top, left: 20 })
      } else {
        this.generateTransform({ top: top, left: bodyWidth - 70 })
      }

      // 500ms后自动显示菜单
      this.showMenuTimer = setTimeout(() => {
        if (this.hoverFlag && !this.popoverShow && !this.moveFlags) {
          this.popoverShow = true
          // 计算菜单位置
          this.$nextTick(() => {
            this.updateMenuPosition()
          })
        }
        this.showMenuTimer = null
      }, 500)
    },

    // 计算菜单位置
    updateMenuPosition () {
      if (!this.$refs.popoverContent) return

      const { top, left } = this.transform
      // 垂直位置：根据按钮位置决定菜单显示在上方还是下方
      if (top >= 60) {
        this.menuPosition.top = `-${this.$refs.popoverContent.offsetHeight + 10}px`
      } else {
        this.menuPosition.top = '60px'
      }

      // 水平位置：根据按钮位置决定菜单显示在左侧还是右侧
      if (left > 200) {
        this.menuPosition.left = '-132px'
      } else {
        this.menuPosition.left = 0
      }

      console.log(`updateMenuPosition: top:${top}, left:${left}, menuTop:${this.menuPosition.top}, menuLeft:${this.menuPosition.left}`)
    },

    moveStart (e) {
      console.log('moveStart')
      if (e.button === 2) return
      if (this.popoverShow) {
        this.moveFlags = false
        return
      }
      if (this.moveFlags) {
        console.log('---移动中点击---')
        this.hoverFlag = false
        this.moveEnd()
        return
      }
      this.clickFlag = true
      const floatBtn = this.$refs.floatBtn // 获取目标元素
      this.movePosition.x = e.clientX
      this.movePosition.y = e.clientY
      // 计算鼠标相对元素的位置
      const { left, top } = this.transform
      this.dx = e.clientX - left
      this.dy = e.clientY - top
      this.moveFlags = true
      document.onmousemove = async (e) => {
        this.clickFlag = false
        this.moveFlags = true
        console.log('onmousemove')
        const bodyWidth = document.body.clientWidth
        const bodyHeight = document.body.clientHeight
        const moveMaxHeight = bodyHeight - 30
        const moveMaxWidth = bodyWidth - floatBtn.offsetWidth / 2 + this.dx
        this.nx = e.clientX
        this.ny = e.clientY
        this.xPum = (this.nx > moveMaxWidth ? moveMaxWidth : this.nx) - this.dx
        this.yPum =
          (this.ny > moveMaxHeight ? moveMaxHeight : this.ny) - this.dy
        await this.$nextTick()
        this.lastMoveIndex++
        this.generateTransform({
          left: this.xPum > -25 ? this.xPum : -25,
          top: this.yPum > 0 ? this.yPum : 0
        })
      }
      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
        this.moveEnd()
      }
    },
    generateTransform ({ top, left }) {
      const floatBtn = this.$refs.floatBtn // 获取目标元素
      if (!floatBtn) return
      this.$set(this.transform, 'left', left)
      this.$set(this.transform, 'top', top)
    },
    resetFloatBtnLocation () {
      // console.log('------reset')
      const floatBtn = this.$refs.floatBtn // 获取目标元素
      if (!floatBtn) return
      const bodyWidth = document.body.clientWidth
      const { left, top } = this.transform
      if (left < bodyWidth / 2) {
        this.generateTransform({ top, left: `-25` })
      } else {
        this.generateTransform({ top, left: bodyWidth - window.document.querySelector('.sidebar-container').offsetWidth - 25 })
      }
    },
    moveEnd () {
      console.log(`moveEnd---this.moveFlags,this.hoverFlag:` + this.moveFlags + ',' + this.hoverFlag)
      this.moveFlags = false
      if (this.hoverFlag) return
      document.onmousemove = null
      this.resetFloatBtnLocation()
    },
    // 重置表格列
    handleResetCustomColumnsWidth () {
      this.$confirm('确定要重置该表格的宽度设置吗！', '确认信息', {
      }).then(() => {
        // 通过vuex，删除数据
        // this.$options.name = this.$route.meta.page_code
        const _para = {
          page_code: this.$route.meta.page_code
        }
        console.log(`----page_code:` + _para)
        this.$store.dispatch('customTableColumns/columns', _para)
        EventBus.$emit(this.EMITS.EMIT_TABLE_COLUMNS_CONFIG_START, this.$route.fullPath)
      }).catch(action => {
      })
    },
    // 设置列属性
    handleTableColumnsSetting () {
      // 重置按钮状态和初始加载标记
      this.confirmButtonEnabled = false
      this.isInitialLoad = true

      this.popSettings.one.visible = true
      var _this = this
      this.checkTableConfigData(this.$route.meta.page_code, function (page_code, response) {
        if (response.data === false) {
          _this.$confirm('该表格列数据有变化，点击确定读取最新列数据。读取最新列数据将删除您设置的列排序，您需要重新设置列排序数据。', '确认信息', {
          }).then(() => {
            _this.resetTableConfigData(page_code)
          }).catch(action => {
          })
        }
      })
      this.getTableConfig(this.$route.meta.page_code)
    },
    handleBpmSetting () {
      this.checkBpmConfigData(this.$route.meta.page_code)
    },
    getTableConfig (page_code) {
      // 获取数据
      getTableConfigApi({ page_code: page_code }).then(response => {
        this.resultList = response.data

        // 为分组子项设置稳定的显示序号，拖拽后不会自动重排
        this.resultList.forEach(item => {
          if (item.is_group === 1 && item.groupChildren && Array.isArray(item.groupChildren)) {
            item.groupChildren.forEach((child, index) => {
              // 设置初始显示序号，后续拖拽不会改变这个值，等后端更新
              child.displayIndex = index + 1
            })
          }
        })

        // 确保组内序号从1开始
        this.reIndexGroupSort()
        this.selected = this.resultList.filter(item => {
          return item.is_enable === true
        })
        if (this.selected.length === this.resultList.length) {
          this.checkAll = true
        } else if (this.selected.length > 0 && this.selected.length < this.resultList.length) {
          this.checkAll = true
          this.isIndeterminate = true
        } else {
          this.checkAll = false
        }

        // 初始数据加载完成，后续的数据变化将启用确定按钮
        this.$nextTick(() => {
          this.isInitialLoad = false
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },
    resetTableConfig (page_code) {
      this.$confirm('读取最新列数据将删除您设置的列排序，您需要重新设置列排序数据。', '确认信息', {
      }).then(() => {
        this.resetTableConfigData(page_code)
      }).catch(action => {
      })
    },
    handleReset () {
      this.resetTableConfig(this.$route.meta.page_code)
    },
    handleOk () {
      // 确认对话框
      this.$confirm('确定本次修改吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.popSettings.one.visible = false
        this.doSortUpdate(this.resultList)
        // 重置按钮状态和初始加载标记
        this.confirmButtonEnabled = false
        this.isInitialLoad = true
      }).catch(() => {
        // 用户取消，不做任何操作
      })
    },
    handleCancel () {
      this.popSettings.one.visible = false
      // 重置按钮状态和初始加载标记
      this.confirmButtonEnabled = false
      this.isInitialLoad = true
    },

    // sort重新计算 - 适配新数据结构（基于resultList中的实际位置）
    doReIndexSort () {
      // 新结构简化：只需要给resultList中的每个项目分配sort值
      // 分组子项(groupChildren)的顺序由数组索引决定，不需要单独的sort字段
      this.resultList.forEach((item, index) => {
        item.sort = index

        // 如果是分组项且有子项，确保子项顺序正确
        if (item.is_group === 1 && item.groupChildren && Array.isArray(item.groupChildren)) {
          // 子项排序由数组索引决定，不需要额外处理
          // 只确保子项存在必要的字段
          item.groupChildren.forEach((child, childIndex) => {
            // 子项不需要sort字段，位置由数组索引决定
            if (!child.hasOwnProperty('is_enable')) {
              child.is_enable = true // 默认启用
            }
          })
        }
      })

      this.validateSortOrder()
    },

    // 重新计算分组内序号（新结构中不需要此方法，但保留避免调用出错）
    reIndexGroupSort () {
      // 在新的数据结构中，分组内子项顺序由 groupChildren 数组索引决定
      // 不需要维护 group_sort 字段，这个方法保留为空函数避免调用出错
      console.log('reIndexGroupSort: 新结构中使用数组索引，不需要重新计算group_sort')
    },

    // 验证序号连续性
    validateSortOrder () {
      // 在新结构中，每个 resultList 中的项都是独立的（分组项和普通项）
      // 验证主列表中每个项目的 sort 值是否连续
      const sortValues = this.resultList.map(item => item.sort).sort((a, b) => a - b)

      for (let i = 0; i < sortValues.length; i++) {
        if (sortValues[i] !== i) {
          return false
        }
      }

      return true
    },
    // 更新逻辑
    doSortUpdate (listData) {
      saveTableConfigApi(listData).then((_data) => {

      }, (_error) => {

      }).finally(() => {
        this.settings.loading = false
        // 发送新的配置更新事件，传递page_code和配置数据
        EventBus.$emit(this.EMITS.EMIT_TABLE_COLUMNS_CONFIG_UPDATED, {
          page_code: this.$route.meta.page_code,
          config: listData
        })
        // 注释掉原有的事件，避免触发页面刷新和业务查询
        // EventBus.$emit(this.EMITS.EMIT_TABLE_COLUMNS_CONFIG_START, this.$route.path)
      })
    },
    // 检查表格配置数据
    checkTableConfigData (page_code, callback) {
      checkTableConfigApi({ page_code: page_code }).then(response => {
        callback(page_code, response)
      }).finally(() => {
        this.settings.loading = false
      })
    },
    /**
     * 检查当前页面的流程配置数据
     * 如果没有：报错
     * 如果有一个：跳转当前的流程设计
     * 如果有多个：弹出流程选择
     */
    checkBpmConfigData (page_code) {
      // 检查流程配置数据
      getBpmDataByPageCodeApi({ page_code: page_code }).then(response => {
        this.bpmList = response.data
      }).finally(() => {
        if (this.bpmList.length === 0) {
          this.$message.error('当前页面没有流程配置，请先配置流程！')
          return
        } else if (this.bpmList.length === 1) {
          this.bpmTemplateData = { id: this.bpmList[0].id,
            name: this.bpmList[0].name,
            page_code: this.bpmList[0].page_code,
            process: this.bpmList[0].process
          }
          console.log('bpmTemplateData:' + this.bpmTemplateData)
          console.log('单条:' + this.bpmList)
          this.bpmVisible = true
        } else {
          console.log('多条审批模板数据:' + this.bpmList)
          this.bpmTemplateDataList = {
            page_code: page_code
          }
          this.bpmListVisible = true
        }
        this.settings.loading = false
      })
    },

    resetTableConfigData (page_code) {
      // 重置时也设置为初始加载状态
      this.isInitialLoad = true

      // 重置 - 直接使用reset API返回的原始数据，不需要再调用其他API
      resetTableConfigApi({ page_code: page_code }).then(response => {
        console.log('=== 重置API返回的数据:', response.data)
        this.resultList = response.data

        // 为分组子项设置稳定的显示序号，拖拽后不会自动重排
        this.resultList.forEach(item => {
          if (item.is_group === 1 && item.groupChildren && Array.isArray(item.groupChildren)) {
            item.groupChildren.forEach((child, index) => {
              // 设置初始显示序号，后续拖拽不会改变这个值，等后端更新
              child.displayIndex = index + 1
            })
          }
        })

        // 确保组内序号从1开始
        this.reIndexGroupSort()
        this.selected = this.resultList.filter(item => {
          return item.is_enable === true
        })
        if (this.selected.length === this.resultList.length) {
          this.checkAll = true
        } else if (this.selected.length > 0 && this.selected.length < this.resultList.length) {
          this.checkAll = true
          this.isIndeterminate = true
        } else {
          this.checkAll = false
        }

        // 重置数据加载完成，后续的数据变化将启用确定按钮
        this.$nextTick(() => {
          this.isInitialLoad = false
          // 重置操作本身就是用户操作，应该立即启用确定按钮
          this.confirmButtonEnabled = true
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 全选change事件
    handleCheckAllChange (val) {
      console.log(val)
      if (val === true) {
        this.resultList.forEach(function (element, index, array) {
          if (element.is_delete !== true) {
            element.is_enable = true
          }
        })
      } else {
        this.resultList.forEach(function (element, index, array) {
          if (element.fix !== true && element.is_delete !== true) {
            element.is_enable = false
          }
        })
      }
      this.selected = this.resultList.filter(item => {
        return item.is_enable === true
      })
      this.isIndeterminate = false
    },
    // 复选框change事件
    handleCheckedChange () {
      // 更新子项勾选状态后，同步更新对应分组的勾选状态
      this.syncGroupCheckboxStates()

      // 更新全局选中状态
      this.selected = this.resultList.filter(item => {
        return item.is_enable === true
      })

      this.isIndeterminate = this.selected.length > 0 && this.selected.length < this.resultList.length
    },

    /**
     * 同步分组勾选框状态 - 简单关联模式
     * 子项→分组头的同步逻辑：
     * 1. 任何子项被勾选 → 分组头自动勾选
     * 2. 所有子项都取消 → 分组头自动取消勾选
     */
    syncGroupCheckboxStates () {
      this.resultList.forEach(item => {
        // 只处理分组项
        if (item.is_group === 1 && item.groupChildren && item.groupChildren.length > 0) {
          // 获取所有可勾选的子项（排除固定项和已删除项）
          const selectableChildren = item.groupChildren.filter(child =>
            !child.fix && child.is_delete !== true
          )
          if (selectableChildren.length > 0) {
            // 统计勾选状态
            const checkedCount = selectableChildren.filter(child => child.is_enable === true).length
            // 简单关联逻辑：有子项勾选就勾选分组头，没有子项勾选就取消分组头
            if (checkedCount > 0) {
              // 有子项被勾选 → 分组头自动勾选
              item.is_enable = true
            } else {
              // 所有子项都取消 → 分组头自动取消勾选
              item.is_enable = false
            }
          }
        }
      })
    },

    // 置顶
    top (item) {
      // 属性fix为true的数据不能拖动

      const newItems = [...this.resultList]
      // 删除老的节点
      newItems.splice(item.sort, 1)
      // 在列表中目标位置增加新的节点
      newItems.splice(item.min_sort, 0, item)
      this.resultList = [...newItems]
      this.newIndex = ''

      this.doReIndexSort()
    },
    /**
     * 关闭流程设计弹出层
     */
    handleBpmDialogCancel () {
      this.bpmVisible = false
      this.bpmTemplateData = {}
    },
    /**
     * 关闭流程设计弹出层
     */
    handleBpmListDialogCancel () {
      this.bpmListVisible = false
      this.bpmTemplateDataList = {}
    },

    // === 新增的分层级功能方法 ===

    /**
     * 组头复选框状态变化
     * 当组头取消选中时，组内所有子项也取消选中
     * 当组头选中时，组内所有非固定子项都选中
     */
    handleGroupHeaderCheckedChange (groupHeader) {
      const headerChecked = groupHeader.is_enable
      const groupChildren = groupHeader.groupChildren || []

      groupChildren.forEach(child => {
        if (!child.fix && child.is_delete !== true) {
          child.is_enable = headerChecked
        }
      })

      // 触发整体的选中状态更新
      this.handleCheckedChange()
    },

    /**
     * 组内置顶功能 - 适配新数据结构
     * 将子项移动到组内第一位
     */
    topInGroup (item, group) {
      // 在新结构中，使用 groupChildren 数组
      const groupChildren = group.groupChildren || []
      const currentIndex = groupChildren.findIndex(child => child.id === item.id)

      if (currentIndex > 0) {
        // 移除当前项
        groupChildren.splice(currentIndex, 1)
        // 插入到第一位
        groupChildren.unshift(item)

        // 新结构中不需要维护 group_sort 字段
        // 子项的顺序由 groupChildren 数组索引决定

        // 更新组对象的 groupChildren 引用
        group.groupChildren = groupChildren

        // 触发数据更新，让前端界面重新渲染
        this.$forceUpdate()
      }
    }

  }
}
</script>
<style lang="scss" scoped>
.zIndexTop {
  z-index: 1000;
}
.el-icon-s-tools {
  color: white;
}
.hover-area {
  position: absolute;
  width: 100px;
  height: 100%;
}
.floating-window {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 82vh;
  overflow: hidden;
  pointer-events: none;
  .floatBtn {
    position: absolute;
    z-index: 1000;
    cursor: pointer;
    span:last-child {
      z-index: 2;
    }
  }
  .popover-content {
    width: 100% !important;
    &__trigger {
      width: 50px;
      height: 50px;
      min-width: 50px;
      min-height: 50px;
      background: #2196f3;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      box-shadow: 0px 16px 34px 0px rgba(0, 49, 128, 0.2);
      pointer-events: auto;
      border: none;
      outline: none;
      box-sizing: border-box;
    }
  }
}
</style>
<style lang="scss" scoped>
.floating-popover-fade-in-out {
  &-enter-active,
  &-leave-active {
    transition-timing-function: ease;
    transition-duration: 300ms;
    transition-property: opacity, transform;
  }
  &-enter,
  &-leave-to {
    opacity: 0;
    transform: translate3d(0, -10px, 0);
  }
}
.floating-popover {
  position: absolute;
  /* width: 182px; */
  padding: 0 !important;
  border: 0 !important;
  /* border-radius: 40px !important; */
  /* box-shadow: 0px 16px 34px 0px rgba(0, 49, 128, 0.2); */
}

.el-divider--horizontal {
  height: 1px;
  width: 100%;
  margin: 0px 0 0 0;
}
.popover-content__item {
  width: 100% !important;
  height: 40px;
  padding: 0;
  border: 0;
  line-height: 40px;
  font-size: 16px;
  border-radius: 0;
  // color: var(--themeColor);
  padding: 0 20px;
  text-align: left;
}

// .popover-content__item.el-button:hover {
//   // background: var(--shadowColor);
// }

.popover-content__item > .icon {
  margin-right: 10px;
  font-size: 18px;
}

.popover-content {
  width: 182px;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0px 0px 34px 5px rgb(0 49 128 / 45%);

  .el-button + .el-button {
    margin-left: 0;
  }

  // .el-button:focus,
  // .el-button:hover {
  //   // color: var(--themeColor);
  // }

  &__item {
    width: 100% !important;
    height: 40px;
    padding: 0;
    border: 0;
    line-height: 40px;
    font-size: 16px;
    border-radius: 0;
    // color: var(--themeColor);
    padding: 0 20px;
    text-align: left;

    // &.el-button:hover {
    //   // background: var(--shadowColor);
    // }

    > .icon {
      margin-right: 10px;
      font-size: 18px;
    }
  }
}
.li > span {
  display: inline-block;
  width: 50px;
}

.list {
  list-style: none;
  .drag-move {
    transition: transform 0.3s;
  }
  .list-item {
    cursor: pointer;
    position: relative;
    border-radius: 4px;
    height: 31px;
    line-height: 31px;
    text-align: center;
    margin-top: 2px;
  }
}
.el-icon-rank {
  cursor: move;
}

.floatRight {
  float: right;
}
.floatLeft {
  float: left;
}
.configDialog.el-dialog {
  .el-dialog__header {
    display: none !important;
  }
  .dj-dialog-content {
    padding: 0;
    overflow: unset;
  }
}
.el-checkbox {
  width: auto;
}
.configDialog ul {
  margin: 0;
  padding: 0;
}
.el-dialog-div {
  height: 40vh;
  overflow-y: auto;
  overflow-x: hidden;
}
.configTitle .el-col {
  padding: 5px 0;
}
.checkCount {
  position: absolute;
  top: 0;
  right: 0;
}

/* === SortableJS 拖拽视觉反馈样式 === */
.sortable-ghost {
  opacity: 0.4;
  background: #e6f7ff !important;
  border: 2px dashed #1890ff !important;
  transform: scale(1.02);
  transition: all 0.2s ease;
}

.sortable-chosen {
  opacity: 0.8;
  background: #f6ffed !important;
  border-left: 3px solid #52c41a;
  transform: translateX(5px);
  transition: all 0.2s ease;
}

.sortable-drag {
  opacity: 0.6;
  background: #fff7e6 !important;
  border: 1px solid #ffa940;
  box-shadow: 0 4px 12px rgba(255, 169, 64, 0.3);
  transform: rotate(5deg);
  transition: all 0.2s ease;
}

.is-fixed {
  opacity: 0.5 !important;
  cursor: not-allowed !important;

  * {
    cursor: not-allowed !important;
  }
}

.sortable-list {
  min-height: 20px; /* 确保空列表也能作为放置目标 */
}

/* 分组容器在拖拽时的样式 */
.group-container:hover {
  border-color: #d9d9d9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

.group-header.sortable-chosen {
  background: #e6f7ff !important;
  border-color: #1890ff !important;
}

.group-children-list.sortable-chosen {
  background: #f6ffed !important;
  border-left: 2px solid #52c41a;
}

/* === 分层级界面样式 === */
.hierarchical-column-list {
  .draggable-item {
    cursor: pointer;
    border-radius: 4px;
    margin: 2px 0;

    .item-row {
      height: 31px;
      line-height: 31px;
      background: #ffffff;

      &:hover {
        background: #f8f9fa;
      }
    }

    .drag-handle {
      cursor: move;
      color: #909399;

      &:hover {
        color: #606266;
      }
    }
  }

  .group-item {
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    margin: 6px 0;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .group-header-content {
      background: #f8f9fa;
      cursor: pointer;
      border-radius: 4px 4px 0 0;
      min-height: 36px;
      padding: 8px 0;
      border-bottom: 1px solid #e8eaed;

      &:hover {
        background: #ecf5ff;
      }

      .item-row {
        margin: 0 !important;
        background: transparent;

        &:hover {
          background: transparent;
        }
      }

      .group-header-label {
        display: flex;
        align-items: center;

        strong {
          color: #409eff;
          font-weight: 600;
        }

        .item-count {
          margin-left: 8px;
          color: #606266;
          font-size: 12px;
          font-weight: normal;
          background: #e1f3ff;
          padding: 2px 6px;
          border-radius: 10px;
        }
      }

      .group-drag-handle {
        color: #909399;
        font-size: 14px;

        &:hover {
          color: #606266;
        }
      }
    }

    .group-children-container {
      padding: 0;

      .group-children-list {
        margin: 0;
        padding: 0;
        list-style: none;

        .group-child-item {
          .child-item-row {
            background: #ffffff;
            border-bottom: 1px solid #f0f0f0;

            &:hover {
              background: #f8f9fa;
            }
          }

          &:last-child .child-item-row {
            border-bottom: none;
          }

          .child-label {
            .group-child-text {
              margin-left: 16px;
            }
          }

          .child-drag-handle {
            margin-left: 8px;
            color: #c0c4cc;
            font-size: 12px;
          }
        }
      }
    }
  }

  .normal-item {
    .item-row {
      background: #ffffff;

      &:hover {
        background: #f8f9fa;
      }
    }
  }
}

</style>
<style lang="scss" >
.configDialog .el-dialog__body {
  position: relative;
}
.tal {
  text-align: left;
}
.tar {
  text-align: right;
}
.el-badge__content.is-fixed.is-dot {
  right: 33px;
}
</style>
