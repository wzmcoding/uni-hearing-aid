const fs = require('node:fs')
const path = require('node:path')
const process = require('node:process')
const { execSync } = require('node:child_process')
const { version } = require('../package.json')

// 同步版本号
const envPath = path.resolve(__dirname, '../.env')
// 读取 .env 文件的内容
const envContent = fs.readFileSync(envPath, 'utf8')

// 分割每一行
const lines = envContent.split('\n')

// 定义新的内容数组
const newLines = []

// 遍历每一行，查找并修改 VITE_APP_VERSION 的值
lines.forEach((line) => {
  if (line.startsWith('VITE_APP_VERSION=')) {
    newLines.push(`VITE_APP_VERSION=${version}`)
  }
  else {
    newLines.push(line) // 保留其他行，包括注释
  }
})

// 将修改后的内容写回 .env 文件
fs.writeFileSync(envPath, newLines.join('\n'))

// 添加文件到暂存区
execSync(`git add ${envPath}`)

// 获取前一次提交的标签
let tag
try {
  tag = execSync('git describe --tags --abbrev=0').toString().trim()
}
catch (error) {
  console.error('没有找到标签')
  process.exit(1)
}

// 将当前暂存区的改动追加到前一次提交中
execSync('git commit --amend --no-edit')

// 删除旧的标签
execSync(`git tag -d ${tag}`)

// 将标签移动到新的提交
execSync(`git tag ${tag}`)
