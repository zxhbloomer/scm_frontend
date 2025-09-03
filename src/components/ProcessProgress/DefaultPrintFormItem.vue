<template>
  <div>
    <img v-if="config.name === 'SignPanel' && data" style="width: 100px; height: 50px" :src="data">
    <template v-else-if="config.name === 'ImageUpload'">
      <img v-for="(img, i) in data || []" :key="i" style="width: 200px; height: 150px; padding: 2px" :src="$getRes(img.url)">
    </template>
    <template v-else-if="config.name === 'FileUpload'">
      <div v-for="(file, i) in data" :key="i">- {{ file.name }}</div>
    </template>
    <div v-else-if="config.name === 'DateTimeRange'">
      <div v-if="Array.isArray(data) && data.length === 2">
        {{ data[0] }} ~ {{ data[1] }}
      </div>
    </div>
    <template v-else-if="config.name === 'MultipleSelect'">
      <div v-if="Array.isArray(data)">{{ String(data) }}</div>
    </template>
    <template v-else-if="config.name === 'UserPicker' || config.name === 'DeptPicker'">
      <div v-if="Array.isArray(data)">
        {{ String(data.map((d) => d.name)) }}
      </div>
    </template>
    <template v-else-if="config.name === 'TableList'">
      <table border="0">
        <tr>
          <th v-for="col in config.props.columns" :key="col.id">{{ col.title }}</th>
        </tr>
        <tr v-for="(row, rowIndex) in data" :key="rowIndex">
          <td v-for="(column, colIndex) in config.props.columns" :key="colIndex">
            <default-print-item class="inner-item" :data="row[column.id]" :config="column" />
          </td>
        </tr>
      </table>
    </template>
    <div v-else>{{ data }}</div>
  </div>
</template>

<script>
export default {
  name: 'DefaultPrintItem',
  components: {},
  props: {
    config: {
      type: Object,
      required: true
    },
    data: {
      type: [Object, Array],
      required: true
    }
  },
  data () {
    return {}
  },
  methods: {}
}
</script>

<style lang="less" scoped>
table {
  width: 100%;
  border-collapse: collapse;
  th,
  td {
    text-align: left;
    border: 1px solid #464648;
    padding: 5px 10px;
  }
}
</style>
