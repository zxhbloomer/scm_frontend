module.exports = {
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          javascriptEnabled: true
        },
        // 全局导入 BPM 主题变量，让所有LESS文件都能使用这些变量
        additionalData: `@import "@/assets/bpm/theme.less";`
      }
    }
  }
}