module.exports = {
  presets: [
    ['@vue/cli-plugin-babel/preset', { useBuiltIns: 'usage', corejs: 3 }],
    // 关闭自动注入 h，避免和显式 h 参数重复
    ['@vue/babel-preset-jsx', { injectH: false }]
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator'
  ]
}
