<template>
  <div class="app-container">
    <el-form
      ref="mainForm"
      :model="dataJson.formData"
      :rules="rules"
      label-width="120px"
      class="form-container"
    >
      <!-- 基本信息区域 -->
      <el-card shadow="never" class="card-container">
        <div slot="header" class="card-header">
          <span>基本信息</span>
        </div>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="入库计划编号" prop="code">
              <el-input v-model="dataJson.formData.code" disabled placeholder="系统自动生成" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="类型" prop="type">
              <select-dicts
                v-model="dataJson.formData.type"
                :para="CONSTANTS.DICT_B_IN_PLAN_TYPE"
                init-placeholder="请选择入库计划类型"
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="计划时间" prop="plan_time">
              <el-date-picker
                v-model="dataJson.formData.plan_time"
                type="datetime"
                placeholder="选择计划时间"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="货主" prop="owner_name">
              <select-se-owner
                v-model="dataJson.formData.owner_name"
                placeholder="请选择货主"
                @onReturnData="handleOwnerChange"
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="委托方" prop="consignor_name">
              <select-se-customer
                v-model="dataJson.formData.consignor_name"
                placeholder="请选择委托方"
                @onReturnData="handleConsignorChange"
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="超收比例(%)" prop="over_receipt_rate">
              <el-input-number
                v-model="dataJson.formData.over_receipt_rate"
                :min="0"
                :max="100"
                :precision="2"
                placeholder="超收比例"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="dataJson.formData.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 明细信息区域 -->
      <el-card shadow="never" class="card-container">
        <div slot="header" class="card-header">
          <span>明细信息</span>
          <el-button
            type="primary"
            size="small"
            style="float: right"
            @click="handleAddDetail"
          >
            添加明细
          </el-button>
        </div>

        <el-table
          ref="detailTable"
          :data="dataJson.formData.detailListData"
          border
          stripe
          style="width: 100%"
        >
          <el-table-column type="index" label="序号" width="60" />

          <el-table-column label="商品" width="200" prop="goods_name">
            <template slot-scope="scope">
              <select-goods
                v-model="scope.row.goods_name"
                placeholder="请选择商品"
                @onReturnData="(data) => handleGoodsChange(data, scope.$index)"
              />
            </template>
          </el-table-column>

          <el-table-column label="SKU" width="150" prop="sku_code">
            <template slot-scope="scope">
              <select-sku
                v-model="scope.row.sku_code"
                :goods-id="scope.row.goods_id"
                placeholder="请选择SKU"
                @onReturnData="(data) => handleSkuChange(data, scope.$index)"
              />
            </template>
          </el-table-column>

          <el-table-column label="计划数量" width="120" prop="qty">
            <template slot-scope="scope">
              <el-input-number
                v-model="scope.row.qty"
                :min="0"
                :precision="4"
                placeholder="数量"
                size="small"
                @change="calculateAmount(scope.$index)"
              />
            </template>
          </el-table-column>

          <el-table-column label="价格" width="120" prop="price">
            <template slot-scope="scope">
              <el-input-number
                v-model="scope.row.price"
                :min="0"
                :precision="4"
                placeholder="价格"
                size="small"
                @change="calculateAmount(scope.$index)"
              />
            </template>
          </el-table-column>

          <el-table-column label="重量" width="100" prop="weight">
            <template slot-scope="scope">
              <el-input-number
                v-model="scope.row.weight"
                :min="0"
                :precision="4"
                placeholder="重量"
                size="small"
              />
            </template>
          </el-table-column>

          <el-table-column label="体积" width="100" prop="volume">
            <template slot-scope="scope">
              <el-input-number
                v-model="scope.row.volume"
                :min="0"
                :precision="4"
                placeholder="体积"
                size="small"
              />
            </template>
          </el-table-column>

          <el-table-column label="仓库" width="150" prop="warehouse_name">
            <template slot-scope="scope">
              <select-se-warehouse
                v-model="scope.row.warehouse_name"
                placeholder="请选择仓库"
                @onReturnData="(data) => handleWarehouseChange(data, scope.$index)"
              />
            </template>
          </el-table-column>

          <el-table-column label="供应商" width="150" prop="supplier_name">
            <template slot-scope="scope">
              <select-cp-supplier
                v-model="scope.row.supplier_name"
                placeholder="请选择供应商"
                @onReturnData="(data) => handleSupplierChange(data, scope.$index)"
              />
            </template>
          </el-table-column>

          <el-table-column label="项目编码" width="120" prop="project_code">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.project_code"
                placeholder="项目编码"
                size="small"
              />
            </template>
          </el-table-column>

          <el-table-column label="备注" prop="remark">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.remark"
                placeholder="备注"
                size="small"
              />
            </template>
          </el-table-column>

          <el-table-column label="操作" width="100" fixed="right">
            <template slot-scope="scope">
              <el-button
                type="danger"
                size="mini"
                @click="handleDeleteDetail(scope.$index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-form>

    <!-- 底部操作按钮 -->
    <div class="form-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="settings.loading" @click="handleSave">保存</el-button>
      <el-button type="success" :loading="settings.loading" @click="handleSubmit">提交</el-button>
    </div>
  </div>
</template>

<script>
import { validateApi } from '@/api/40_business/inplan/inplan'

export default {
  name: 'InPlanNew',
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    editStatus: {
      type: String,
      default: 'insert'
    },
    headInfo: {
      type: String,
      default: ''
    },
    canEdit: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      dataJson: {
        formData: {
          code: '', // 系统自动生成
          type: '', // 类型
          plan_time: '', // 计划时间
          over_receipt_rate: 0, // 超收比例
          owner_id: null, // 货主ID
          owner_name: '', // 货主名称
          consignor_id: null, // 委托方ID
          consignor_name: '', // 委托方名称
          remark: '', // 备注
          detailListData: [] // 明细数据
        }
      },
      settings: {
        loading: false
      },
      rules: {
        type: [
          { required: true, message: '请选择入库计划类型', trigger: 'change' }
        ],
        plan_time: [
          { required: true, message: '请选择计划时间', trigger: 'change' }
        ],
        owner_name: [
          { required: true, message: '请选择货主', trigger: 'change' }
        ],
        consignor_name: [
          { required: true, message: '请选择委托方', trigger: 'change' }
        ]
      }
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    /**
     * 初始化数据
     */
    initData () {
      // 初始化表单数据
      if (this.editStatus === 'insert') {
        // 新增模式，添加一行空明细
        this.handleAddDetail()
      }
    },

    /**
     * 货主选择变化
     */
    handleOwnerChange (data) {
      this.dataJson.formData.owner_id = data.id
      this.dataJson.formData.owner_code = data.code
    },

    /**
     * 委托方选择变化
     */
    handleConsignorChange (data) {
      this.dataJson.formData.consignor_id = data.id
      this.dataJson.formData.consignor_code = data.code
    },

    /**
     * 添加明细
     */
    handleAddDetail () {
      this.dataJson.formData.detailListData.push({
        no: this.dataJson.formData.detailListData.length + 1,
        goods_id: null,
        goods_code: '',
        goods_name: '',
        sku_id: null,
        sku_code: '',
        qty: 0,
        price: 0,
        weight: 0,
        volume: 0,
        warehouse_id: null,
        warehouse_name: '',
        supplier_id: null,
        supplier_name: '',
        supplier_code: '',
        project_code: '',
        remark: ''
      })
    },

    /**
     * 删除明细
     */
    handleDeleteDetail (index) {
      this.dataJson.formData.detailListData.splice(index, 1)
      // 重新排序
      this.dataJson.formData.detailListData.forEach((item, idx) => {
        item.no = idx + 1
      })
    },

    /**
     * 商品选择变化
     */
    handleGoodsChange (data, index) {
      const detail = this.dataJson.formData.detailListData[index]
      detail.goods_id = data.id
      detail.goods_code = data.code
      detail.goods_name = data.name
      // 清空SKU信息
      detail.sku_id = null
      detail.sku_code = ''
    },

    /**
     * SKU选择变化
     */
    handleSkuChange (data, index) {
      const detail = this.dataJson.formData.detailListData[index]
      detail.sku_id = data.id
      detail.sku_code = data.code
    },

    /**
     * 仓库选择变化
     */
    handleWarehouseChange (data, index) {
      const detail = this.dataJson.formData.detailListData[index]
      detail.warehouse_id = data.id
      detail.warehouse_name = data.name
    },

    /**
     * 供应商选择变化
     */
    handleSupplierChange (data, index) {
      const detail = this.dataJson.formData.detailListData[index]
      detail.supplier_id = data.id
      detail.supplier_code = data.code
      detail.supplier_name = data.name
    },

    /**
     * 计算金额
     */
    calculateAmount (index) {
      // const detail = this.dataJson.formData.detailListData[index]
      // 这里可以添加金额计算逻辑
      // detail.amount = detail.qty * detail.price
    },

    /**
     * 验证表单
     */
    validateForm () {
      return new Promise((resolve, reject) => {
        this.$refs.mainForm.validate((valid) => {
          if (!valid) {
            reject(new Error('表单验证失败'))
            return
          }

          // 验证明细数据
          if (!this.dataJson.formData.detailListData || this.dataJson.formData.detailListData.length === 0) {
            this.$message.error('请添加明细数据')
            reject(new Error('明细数据不能为空'))
            return
          }

          // 验证每个明细的必填字段
          for (let i = 0; i < this.dataJson.formData.detailListData.length; i++) {
            const detail = this.dataJson.formData.detailListData[i]
            if (!detail.goods_id) {
              this.$message.error(`第${i + 1}行商品不能为空`)
              reject(new Error('明细商品不能为空'))
              return
            }
            if (!detail.qty || detail.qty <= 0) {
              this.$message.error(`第${i + 1}行数量必须大于0`)
              reject(new Error('明细数量必须大于0'))
              return
            }
            if (!detail.warehouse_id) {
              this.$message.error(`第${i + 1}行仓库不能为空`)
              reject(new Error('明细仓库不能为空'))
              return
            }
            if (!detail.supplier_id) {
              this.$message.error(`第${i + 1}行供应商不能为空`)
              reject(new Error('明细供应商不能为空'))
              return
            }
          }

          resolve()
        })
      })
    },

    /**
     * 保存
     */
    async handleSave () {
      // try {
      //   await this.validateForm()
      //   this.settings.loading = true
      //
      //   const response = await insertApi(this.dataJson.formData)
      //
      //   this.$message.success('保存成功')
      //   this.$emit('closeMeOk', { success: true })
      // } catch (error) {
      //   console.error('保存失败:', error)
      // } finally {
      //   this.settings.loading = false
      // }
    },

    /**
     * 提交 - 启动审批流程
     */
    async handleSubmit () {
      try {
        await this.validateForm()
        this.startProcess()
      } catch (error) {
        console.error('表单验证失败:', error)
      }
    },

    /**
     * 校验数据并获取审批流程
     */
    startProcess () {
      this.settings.loading = true

      // 校验业务数据
      const tempData = { ...this.dataJson.formData }
      tempData.check_type = 'INSERT_CHECK_TYPE' // 新增验证类型

      validateApi(tempData).then(response => {
        if (response.success) {
          // 验证成功，启动审批流程
          this.doSubmitWithProcess()
        } else {
          this.settings.loading = false
          this.$notify({
            title: '数据验证失败',
            message: response.data?.message || '数据验证不通过',
            type: 'error',
            duration: 4000
          })
        }
      }).catch(error => {
        console.error('数据验证出错:', error)
        this.settings.loading = false
        this.$message.error('数据验证失败，请检查数据后重试')
      })
    },

    /**
     * 执行提交并启动审批流程
     */
    async doSubmitWithProcess () {
      // try {
      //   // 设置审批流程数据
      //   this.dataJson.formData.initial_process = 'start' // 启动流程
      //
      //   const response = await insertApi(this.dataJson.formData)
      //
      //   this.$message.success('提交成功，已进入审批流程')
      //   this.$emit('closeMeOk', { success: true })
      // } catch (error) {
      //   console.error('提交失败:', error)
      //   this.$message.error('提交失败：' + (error.message || '未知错误'))
      // } finally {
      //   this.settings.loading = false
      // }
    },

    /**
     * 取消
     */
    handleCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>

<style lang="scss" scoped>
.form-container {
  padding: 20px;
}

.card-container {
  margin-bottom: 20px;
}

.card-header {
  font-weight: bold;
}

.form-footer {
  text-align: center;
  padding: 20px;
  border-top: 1px solid #e6e6e6;
  margin-top: 20px;
}

.form-footer .el-button {
  margin: 0 10px;
}
</style>
