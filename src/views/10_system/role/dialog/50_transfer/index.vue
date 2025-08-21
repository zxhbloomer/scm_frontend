<template>
  <el-dialog
    v-el-drag-dialog
    :title="mode === 'view' ? '查看员工关联' : '员工关联管理'"
    :visible="visible"
    width="1000px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    :modal-append-to-body="false"
    @close="handleClose"
  >
    <!-- 搜索和统计 -->
    <div style="margin-bottom: 20px;">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchText"
            placeholder="搜索员工姓名或编号"
            prefix-icon="el-icon-search"
            clearable
            @input="handleSearch"
          />
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="selectedDept"
            placeholder="选择部门"
            clearable
            @change="handleDeptChange"
          >
            <el-option
              v-for="dept in departments"
              :key="dept.value"
              :label="dept.label"
              :value="dept.value"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="selectedPosition"
            placeholder="选择岗位"
            clearable
            @change="handlePositionChange"
          >
            <el-option
              v-for="position in positions"
              :key="position.value"
              :label="position.label"
              :value="position.value"
            />
          </el-select>
        </el-col>
        <el-col :span="4">
          <div style="color: #606266; line-height: 32px;">
            <i class="el-icon-user" />
            已关联：{{ assignedStaffIds.length }} 人
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 员工列表 -->
    <div style="display: flex; gap: 20px; height: 400px;">
      <!-- 左侧：可关联员工列表 -->
      <div style="flex: 1; border: 1px solid #dcdfe6; border-radius: 4px;">
        <div style="background: #f5f7fa; padding: 10px; border-bottom: 1px solid #dcdfe6;">
          <div style="font-weight: bold; margin-bottom: 5px;">
            <i class="el-icon-user" />
            可关联员工列表
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="color: #909399; font-size: 12px;">
              共 {{ availableStaff.length }} 个员工
            </div>
            <div v-if="mode === 'edit'">
              <el-button
                type="text"
                size="mini"
                @click="selectAll(availableStaff)"
              >全选</el-button>
              <el-button
                type="text"
                size="mini"
                @click="clearSelection(availableStaff)"
              >清空</el-button>
            </div>
          </div>
        </div>
        <div style="height: 320px; overflow-y: auto; padding: 5px;">
          <div
            v-for="staff in availableStaff"
            :key="`available-${staff.id}`"
            :class="['staff-item', { 'disabled': mode === 'view' }]"
            @click="mode === 'edit' && toggleStaff(staff, 'available')"
          >
            <el-checkbox
              v-if="mode === 'edit'"
              v-model="staff.checked"
              style="margin-right: 8px;"
            />
            <div class="staff-content">
              <div class="staff-name">{{ staff.name }}</div>
              <div class="staff-details">
                <span class="staff-code">{{ staff.code }}</span>
                <el-tag
                  size="mini"
                  type="primary"
                  style="margin-left: 5px;"
                >
                  {{ staff.position_name }}
                </el-tag>
              </div>
              <div class="staff-dept">部门：{{ staff.dept_name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间：操作按钮 -->
      <div v-if="mode === 'edit'" style="display: flex; flex-direction: column; justify-content: center; gap: 10px;">
        <el-button
          type="primary"
          icon="el-icon-d-arrow-right"
          :disabled="getCheckedCount(availableStaff) === 0"
          @click="moveToAssigned"
        >
          关联
        </el-button>
        <el-button
          icon="el-icon-d-arrow-left"
          :disabled="getCheckedCount(assignedStaff) === 0"
          @click="moveToAvailable"
        >
          取消关联
        </el-button>
        <el-divider />
        <el-button
          type="success"
          icon="el-icon-check"
          size="mini"
          @click="moveAllToAssigned"
        >
          全部关联
        </el-button>
        <el-button
          type="warning"
          icon="el-icon-close"
          size="mini"
          @click="moveAllToAvailable"
        >
          全部取消
        </el-button>
      </div>

      <!-- 右侧：已关联员工列表 -->
      <div style="flex: 1; border: 1px solid #dcdfe6; border-radius: 4px;">
        <div style="background: #f0f9ff; padding: 10px; border-bottom: 1px solid #dcdfe6;">
          <div style="font-weight: bold; margin-bottom: 5px;">
            <i class="el-icon-s-check" />
            已关联员工列表
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="color: #909399; font-size: 12px;">
              共 {{ assignedStaff.length }} 个员工
            </div>
            <div v-if="mode === 'edit'">
              <el-button
                type="text"
                size="mini"
                @click="selectAll(assignedStaff)"
              >全选</el-button>
              <el-button
                type="text"
                size="mini"
                @click="clearSelection(assignedStaff)"
              >清空</el-button>
            </div>
          </div>
        </div>
        <div style="height: 320px; overflow-y: auto; padding: 5px;">
          <div
            v-for="staff in assignedStaff"
            :key="`assigned-${staff.id}`"
            :class="['staff-item', 'assigned', { 'disabled': mode === 'view' }]"
            @click="mode === 'edit' && toggleStaff(staff, 'assigned')"
          >
            <el-checkbox
              v-if="mode === 'edit'"
              v-model="staff.checked"
              style="margin-right: 8px;"
            />
            <div class="staff-content">
              <div class="staff-name">{{ staff.name }}</div>
              <div class="staff-details">
                <span class="staff-code">{{ staff.code }}</span>
                <el-tag
                  size="mini"
                  type="primary"
                  style="margin-left: 5px;"
                >
                  {{ staff.position_name }}
                </el-tag>
              </div>
              <div class="staff-dept">部门：{{ staff.dept_name }}</div>
              <div v-if="staff.assign_time" class="staff-time">
                关联时间：{{ formatDateTime(staff.assign_time) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-divider />
      <el-button @click="handleClose">{{ mode === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button
        v-if="mode === 'edit'"
        type="primary"
        :loading="loading"
        @click="handleConfirm"
      >确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'RoleStaffTransferDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    roleId: {
      type: [Number, String],
      default: null
    },
    roleData: {
      type: Object,
      default: () => ({})
    },
    mode: {
      type: String,
      default: 'edit', // edit 或 view
      validator: value => ['edit', 'view'].includes(value)
    }
  },
  data () {
    return {
      loading: false,
      searchText: '',
      selectedDept: '',
      selectedPosition: '',
      // 所有员工列表
      allStaff: [],
      // 已关联员工ID列表
      assignedStaffIds: [],
      // 部门列表
      departments: [
        { label: '研发部', value: 'develop' },
        { label: '测试部', value: 'test' },
        { label: '产品部', value: 'product' },
        { label: '设计部', value: 'design' },
        { label: '人事部', value: 'hr' },
        { label: '财务部', value: 'finance' }
      ],
      // 岗位列表
      positions: [
        { label: '开发工程师', value: 'developer' },
        { label: '测试工程师', value: 'tester' },
        { label: '产品经理', value: 'pm' },
        { label: '设计师', value: 'designer' },
        { label: '人事专员', value: 'hr_specialist' },
        { label: '财务专员', value: 'finance_specialist' }
      ]
    }
  },
  computed: {
    // 筛选后的员工列表
    filteredStaff () {
      let staff = [...this.allStaff]

      // 按搜索文本筛选
      if (this.searchText) {
        const text = this.searchText.toLowerCase()
        staff = staff.filter(s =>
          s.name.toLowerCase().includes(text) ||
          s.code.toLowerCase().includes(text)
        )
      }

      // 按部门筛选
      if (this.selectedDept) {
        staff = staff.filter(s => s.dept_code === this.selectedDept)
      }

      // 按岗位筛选
      if (this.selectedPosition) {
        staff = staff.filter(s => s.position_code === this.selectedPosition)
      }

      return staff
    },

    // 可关联员工列表（未关联的）
    availableStaff () {
      return this.filteredStaff.filter(s =>
        !this.assignedStaffIds.includes(s.id)
      )
    },

    // 已关联员工列表
    assignedStaff () {
      return this.filteredStaff.filter(s =>
        this.assignedStaffIds.includes(s.id)
      )
    }
  },
  watch: {
    visible (newVal) {
      if (newVal) {
        this.loadData()
      } else {
        this.resetData()
      }
    }
  },
  methods: {
    // 加载数据
    loadData () {
      this.loadAllStaff()
      this.loadAssignedStaff()
    },

    // 加载所有员工
    loadAllStaff () {
      // TODO: 调用API加载所有员工
      this.allStaff = [
        {
          id: 1,
          code: 'EMP001',
          name: '张三',
          dept_name: '研发部',
          dept_code: 'develop',
          position_name: '开发工程师',
          position_code: 'developer',
          is_enable: true,
          checked: false
        },
        {
          id: 2,
          code: 'EMP002',
          name: '李四',
          dept_name: '测试部',
          dept_code: 'test',
          position_name: '测试工程师',
          position_code: 'tester',
          is_enable: true,
          checked: false
        },
        {
          id: 3,
          code: 'EMP003',
          name: '王五',
          dept_name: '产品部',
          dept_code: 'product',
          position_name: '产品经理',
          position_code: 'pm',
          is_enable: true,
          checked: false
        },
        {
          id: 4,
          code: 'EMP004',
          name: '赵六',
          dept_name: '设计部',
          dept_code: 'design',
          position_name: '设计师',
          position_code: 'designer',
          is_enable: true,
          checked: false
        },
        {
          id: 5,
          code: 'EMP005',
          name: '钱七',
          dept_name: '人事部',
          dept_code: 'hr',
          position_name: '人事专员',
          position_code: 'hr_specialist',
          is_enable: true,
          checked: false
        }
      ]
    },

    // 加载已关联员工
    loadAssignedStaff () {
      if (!this.roleId) return

      // TODO: 调用API加载角色已关联的员工
      this.assignedStaffIds = [1, 3] // 示例数据

      // 为已关联员工添加关联时间
      this.allStaff.forEach(staff => {
        if (this.assignedStaffIds.includes(staff.id)) {
          staff.assign_time = '2024-01-15 10:30:00'
        }
      })
    },

    // 重置数据
    resetData () {
      this.searchText = ''
      this.selectedDept = ''
      this.selectedPosition = ''
      this.allStaff.forEach(s => {
        s.checked = false
      })
    },

    // 搜索处理
    handleSearch () {
      // 搜索逻辑由computed属性处理
    },

    // 部门变化处理
    handleDeptChange () {
      // 筛选逻辑由computed属性处理
    },

    // 岗位变化处理
    handlePositionChange () {
      // 筛选逻辑由computed属性处理
    },

    // 切换员工选择状态
    toggleStaff (staff, listType) {
      staff.checked = !staff.checked
    },

    // 全选
    selectAll (staffList) {
      staffList.forEach(s => {
        s.checked = true
      })
    },

    // 清空选择
    clearSelection (staffList) {
      staffList.forEach(s => {
        s.checked = false
      })
    },

    // 获取选中数量
    getCheckedCount (staffList) {
      return staffList.filter(s => s.checked).length
    },

    // 移动到已关联
    moveToAssigned () {
      const checkedIds = this.availableStaff
        .filter(s => s.checked)
        .map(s => s.id)

      this.assignedStaffIds.push(...checkedIds)
      this.clearSelection(this.availableStaff)
    },

    // 移动到可关联
    moveToAvailable () {
      const checkedIds = this.assignedStaff
        .filter(s => s.checked)
        .map(s => s.id)

      this.assignedStaffIds = this.assignedStaffIds
        .filter(id => !checkedIds.includes(id))
      this.clearSelection(this.assignedStaff)
    },

    // 全部移动到已关联
    moveAllToAssigned () {
      const availableIds = this.availableStaff.map(s => s.id)
      this.assignedStaffIds.push(...availableIds)
    },

    // 全部移动到可关联
    moveAllToAvailable () {
      this.assignedStaffIds = []
    },

    // 关闭弹窗
    handleClose () {
      this.$emit('closeMeCancel')
    },

    // 确认保存
    handleConfirm () {
      this.loading = true

      // TODO: 调用API保存员工关联
      console.log('保存员工关联:', {
        roleId: this.roleId,
        staffIds: this.assignedStaffIds
      })

      setTimeout(() => {
        this.loading = false
        this.$emit('closeMeOk', {
          return_flag: true,
          data: {
            roleId: this.roleId,
            staffIds: this.assignedStaffIds,
            staffCount: this.assignedStaffIds.length
          }
        })
      }, 1000)
    }
  }
}
</script>

<style scoped>
.staff-item {
  display: flex;
  align-items: flex-start;
  padding: 8px;
  margin: 2px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.staff-item:hover:not(.disabled) {
  background-color: #f5f7fa;
  border-color: #c0c4cc;
}

.staff-item.assigned {
  background-color: #f0f9ff;
  border-color: #b3d8ff;
}

.staff-item.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.staff-content {
  flex: 1;
}

.staff-name {
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.staff-details {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.staff-code {
  font-family: monospace;
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.staff-dept {
  font-size: 12px;
  color: #606266;
}

.staff-time {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}

.dialog-footer {
  text-align: center;
}
</style>
