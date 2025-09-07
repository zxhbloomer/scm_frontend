<!--字典表数据显示组件，根据字典值显示对应名称-->
<template>
  <span>{{ displayText }}</span>
</template>

<script>
import { getDictDataApi } from '@/api/00_common/commonComponent'

export default {
  name: 'ShowDictComponent',
  props: {
    // 要显示的值
    value: {
      type: [Number, String],
      default: null
    },
    // 字典参数
    para: {
      type: String,
      default: ''
    },
    // 查询过滤的参数
    filterPara: {
      type: String,
      default: ''
    },
    // 默认显示文本
    defaultText: {
      type: String,
      default: '暂无'
    }
  },
  data () {
    return {
      dataJson: {
        dictOptions: [],
        settings: {
          loading: false
        }
      }
    }
  },
  computed: {
    displayText () {
      if (this.value === null || this.value === undefined || this.value === '') {
        return this.defaultText
      }

      const option = this.dataJson.dictOptions.find(item =>
        String(item.value) === String(this.value)
      )

      return option ? option.name : this.defaultText
    }
  },
  watch: {
    para: {
      handler (newVal) {
        if (newVal) {
          this.getDictData()
        }
      },
      immediate: true
    },
    filterPara: {
      handler () {
        if (this.para) {
          this.getDictData()
        }
      }
    }
  },
  methods: {
    // 获取字典数据
    getDictData () {
      if (!this.para) {
        return
      }

      this.dataJson.settings.loading = true
      const tempJson = {
        type_value: this.para
      }

      // 如果有过滤参数，添加到请求中
      if (this.filterPara) {
        tempJson.filter_para = this.filterPara
      }

      getDictDataApi(tempJson).then(response => {
        if (response && response.data) {
          this.dataJson.dictOptions = response.data.map(item => ({
            value: item.dict_value,
            name: item.dict_name
          }))
        }
      }).catch(error => {
        console.error('获取字典数据失败:', error)
        this.dataJson.dictOptions = []
      }).finally(() => {
        this.dataJson.settings.loading = false
      })
    }
  }
}
</script>
