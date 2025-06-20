// // eslint-disable-next-line no-extend-native
// Array.prototype.remove = function remove (value) {
//   const index = this.indexOf(value)
//   if (index > -1) {
//     this.splice(index, 1)
//   }
//   return index
// }
//
// // 移除对象数组，匹配唯一key
// // eslint-disable-next-line no-extend-native
// Array.prototype.removeByKey = function removeByKey (key, val) {
//   const index = this.findIndex(value => value[key] === val)
//   if (index > -1) {
//     this.splice(index, 1)
//   }
//   return index
// }
//
// // 对象数组转map
// // eslint-disable-next-line no-extend-native
// Array.prototype.toMap = function toMap (key) {
//   const map = new Map()
//   this.forEach(v => map.set(v[key], v))
//   return map
// }
//
