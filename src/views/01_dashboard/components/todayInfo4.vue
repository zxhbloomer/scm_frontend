<template>
  <el-card>
    <div slot="header">
      <span class="el-card-title">今日信息统计</span>
      <i
        v-show="!isPanelSetIcon"
        class="el-icon-close"
        style="float: right; padding: 3px 0"
        @click="deletePanelItem"
      />
    </div>
    <el-row>
      <!-- 今日采购金额 -->
      <el-col :span="4">
        <div class="app-icon ">
          <svg-icon icon-class="po" class="app-svg" />
        </div>
      </el-col>
      <el-col
        :span="8"
      >
        <el-row>
          <el-col :span="24">
            <div class="app-title">今日采购金额</div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <div class="app-amount">¥{{ formatAmount(purchaseAmount) }}</div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <div
              class="app-change"
              :class="purchaseChange >= 0 ? 'positive-change' : 'negative-change'"
            >
              {{ formatPercentage(purchaseChange) }}
            </div>
          </el-col>
          <el-col :span="16">
            <div class="comparison-text">同比上周</div>
          </el-col>
        </el-row>
      </el-col>

      <!-- 今日销售金额 -->
      <el-col :span="4">
        <div class="app-icon ">
          <svg-icon icon-class="so" class="app-svg" />
        </div>
      </el-col>
      <el-col
        :span="8"
      >
        <el-row>
          <el-col :span="24">
            <div class="app-title">今日销售金额</div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <div class="app-amount">¥{{ formatAmount(salesAmount) }}</div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <div
              class="app-change"
              :class="salesChange >= 0 ? 'positive-change' : 'negative-change'"
            >
              {{ formatPercentage(salesChange) }}
            </div>
          </el-col>
          <el-col :span="16">
            <div class="comparison-text">同比上周</div>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <br>
    <el-row>
      <!-- 今日入库数量 -->
      <el-col :span="4">
        <div class="app-icon ">
          <svg-icon icon-class="inventory_in2" class="app-svg" />
        </div>
      </el-col>
      <el-col
        :span="8"
      >
        <el-row>
          <el-col :span="24">
            <div class="app-title">今日入库数量</div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <div class="app-amount">¥{{ formatAmount(purchaseAmount) }}</div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <div
              class="app-change"
              :class="purchaseChange >= 0 ? 'positive-change' : 'negative-change'"
            >
              {{ formatPercentage(purchaseChange) }}
            </div>
          </el-col>
          <el-col :span="16">
            <div class="comparison-text">同比上周</div>
          </el-col>
        </el-row>
      </el-col>

      <!-- 今日出库数量 -->
      <el-col :span="4">
        <div class="app-icon ">
          <svg-icon icon-class="inventory_out2" class="app-svg" />
        </div>
      </el-col>
      <el-col
        :span="8"
      >
        <el-row>
          <el-col :span="24">
            <div class="app-title">今日出库数量</div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <div class="app-amount">¥{{ formatAmount(salesAmount) }}</div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <div
              class="app-change"
              :class="salesChange >= 0 ? 'positive-change' : 'negative-change'"
            >
              {{ formatPercentage(salesChange) }}
            </div>
          </el-col>
          <el-col :span="16">
            <div class="comparison-text">同比上周</div>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
export default {
  props: {
    id: { type: [String, Number], required: true },
    panelSetIcon: { type: Boolean, default: false }
  },
  data () {
    return {
      panelId: this.id,
      isPanelSetIcon: this.panelSetIcon,
      purchaseAmount: 999999.99,
      purchaseChange: 0.1, // +10%
      salesAmount: 8888.88,
      salesChange: -0.05 // -5%
    }
  },
  methods: {
    deletePanelItem () {
      this.$emit('deletePanelItemEvent', this.panelId)
    },
    formatAmount (value) {
      return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    formatPercentage (value) {
      return `${(value * 100).toFixed(1)}%`
    }
  }
}
</script>

<style scoped>
.el-card {
  height: 100%;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.el-card-title {
  font-weight: 600;
  font-size: 16px;
  color: #2d3748;
}

.app-icon {
  position: relative;
  width: 40px;
  height: 60px;
  align-items: center;
  border-radius: 24px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  color: #ffffff;
  font-size: 70px;
}

.app-title {
  color: #718096;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.app-amount {
  color: #1a365d;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.app-change {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  margin: 4px 0;
}

.app-change::after {
  content: "";
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  margin-left: 4px;
}

.positive-change {
  color: #22c55e;
}
.positive-change::after {
  border-bottom: 8px solid currentColor;
}

.negative-change {
  color: #ef4444;
}
.negative-change::after {
  border-top: 8px solid currentColor;
}

.comparison-text {
  color: #a0aec0;
  font-size: 10px;
  margin-top: 4px;
  margin-left: 8px;
}

.el-icon-close {
  font-size: 1.2em;
  cursor: pointer;
}
</style>
