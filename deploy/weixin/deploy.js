const fs = require('node:fs')
const path = require('node:path')
const process = require('node:process')
const { execSync } = require('node:child_process')
const JSON5 = require('json5')
const ci = require('miniprogram-ci')
const { Command } = require('commander')
const dayjs = require('dayjs')
const dotenv = require('dotenv')
const { version } = require('../../package.json')

const program = new Command()

// 切换小程序
program
  .command('toggle')
  .option('-a, --appid <type>', 'application id')
  .action((options) => {
    if (!options.appid) {
      console.error('请输入 application id')
      process.exit(1)
    }
    // 定义文件路径
    const filePath = path.join(__dirname, '../../src/manifest.json')
    // 读取 JSON 文件
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('读取文件失败:', err)
        return
      }

      try {
        // 解析 JSON 数据（支持注释）
        const jsonData = JSON5.parse(data)

        // 修改 appid 字段
        jsonData['mp-weixin'].appid = options.appid

        // 将修改后的 JSON 数据转换为字符串（支持注释格式）
        console.log(jsonData)
        const updatedData = JSON.stringify(jsonData, null, 2)
        console.log(updatedData)
        // 写入修改后的数据到 JSON 文件
        fs.writeFile(filePath, updatedData, 'utf8', (err) => {
          if (err) {
            console.error('写入文件失败:', err)
            return
          }
          console.log('文件已成功更新')
        })
      }
      catch (err) {
        console.error('解析 JSON 数据失败:', err)
      }
    })
  })

// 上传小程序
program
  .command('upload')
  .option('-a, --appid <type>', 'application id')
  .action((options) => {
    if (!options.appid) {
      console.error('请输入 application id')
      process.exit(1)
    }

    // 获取当前工作目录的父路径
    const projectDir = path.join(__dirname, '../../')

    const project = new ci.Project({
      appid: options.appid,
      type: 'miniProgram',
      projectPath: `${projectDir}/dist/build/mp-weixin`,
      privateKeyPath: `${projectDir}/deploy/weixin/private.${options.appid}.key`,
      // ignores: ['node_modules/**/*'],
    })
    ci.upload({
      project,
      version,
      desc: `CI机器人于${dayjs().format('YYYY-MM-DD HH:mm:ss')}上传`,
      setting: {
        es6: true,
        es7: true,
        minify: true,
        // autoPrefixWXSS: true,
        minifyWXML: true,
        minifyJS: true,
      },
    }).then((res) => {
      console.log(res)
      console.log('上传成功')
      process.exit(0)
    }).catch((error) => {
      if (error.errCode === -1) {
        console.log('上传成功')
        process.exit(0)
      }
      console.log(error)
      console.log('上传失败')
      process.exit(-1)
    })
  })

program.parse(process.argv)
