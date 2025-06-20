const TextInput = () => import('./components/TextInput.vue')
const NumberInput = () => import('./components/NumberInput.vue')
const AmountInput = () => import('./components/AmountInput.vue')
const TextareaInput = () => import('./components/TextareaInput.vue')
const SelectInput = () => import('./components/SelectInput.vue')
const MultipleSelect = () => import('./components/MultipleSelect.vue')
const DateTime = () => import('./components/DateTime.vue')
const DateTimeRange = () => import('./components/DateTimeRange.vue')
const TimePicker = () => import('./components/TimePicker.vue')
const TimeRangePicker = () => import('./components/TimeRangePicker.vue')
const Description = () => import('./components/Description.vue')
const ImageUpload = () => import('./components/ImageUpload.vue')
const FileUpload = () => import('./components/FileUpload.vue')
const MoneyInput = () => import('./components/MoneyInput.vue')
const DeptPicker = () => import('./components/DeptPicker.vue')
const UserPicker = () => import('./components/UserPicker.vue')
const SignPanel = () => import('./components/SignPanel.vue')
const Score = () => import('./components/Score.vue')

const SpanLayout = () => import('./components/SpanLayout.vue')
const TableList = () => import('./components/TableList.vue')
const Location = () => import('./components/Location.vue')
const Provinces = () => import('./components/Provinces.vue')
const WebIframe = () => import('./components/WebIframe.vue')
const CalcFormula = () => import('./components/CalcFormula.vue')
const ProcessIndex = () => import('./components/ProcessIndex.vue')
const VueContainer = () => import('./components/VueContainer.vue')

export default {
  // 基础组件
  TextInput, NumberInput, AmountInput, TextareaInput, SelectInput, MultipleSelect,
  DateTime, DateTimeRange, UserPicker, DeptPicker, TimePicker, TimeRangePicker,
  // 高级组件
  Description, FileUpload, ImageUpload, MoneyInput, Location, SignPanel, CalcFormula,
  SpanLayout, TableList, Provinces, Score, WebIframe, VueContainer, ProcessIndex
}
