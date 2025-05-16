const fs = require('node:fs')
const path = require('node:path')
const process = require('node:process')
const { execSync } = require('node:child_process')
const JSON5 = require('json5')
const tma = require('tt-ide-cli')
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
        jsonData['mp-toutiao'].appid = options.appid

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
    const token = fs.readFileSync(`${projectDir}/deploy/toutiao/${options.appid}.token`, 'utf8')

    tma.setAppConfig({
      appid: options.appid,
      config: {
        token: token.trim(),
      },
    })
    tma.upload({
      project: {
        path: `${projectDir}/dist/build/mp-toutiao`, // 项目地址
      },
      qrcode: {
        format: 'null', // imageSVG | imageFile | null | terminal
        // imageSVG 用于产出二维码 SVG
        // imageFile 用于将二维码存储到某个路径
        // terminal 用于将二维码在控制台输出
        // null 则不产出二维码
        output: '', // 只在 imageFile 生效，填写图片输出绝对路径
        options: {
          small: false, // 使用小二维码，主要用于 terminal
        },
      },
      copyToClipboard: false, // 是否将产出的二维码链接复制到剪切板
      changeLog: `CI机器人于${dayjs().format('YYYY-MM-DD HH:mm:ss')}上传`,
      version, // 本次更新版本，可选参数，默认值为前序版本号末位加一
      needUploadSourcemap: true, // 是否上传后生成 sourcemap，推荐使用 true，否则开发者后台解析错误时将不能展示原始代码
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
