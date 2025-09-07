// 简单的Vite ESLint插件
import { exec } from 'child_process'

export default function viteEslintPlugin() {
  return {
    name: 'vite-eslint',
    buildStart() {
      // 在构建开始时运行lint检查
      console.log('🔍 运行ESLint检查...')
      exec('npm run lint', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ ESLint检查发现问题:')
          console.error(stdout)
        } else {
          console.log('✅ ESLint检查通过')
        }
      })
    }
  }
}