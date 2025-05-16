### 分支说明

- release 发版分支，开发完成后，需要汇集到该分支，并执行release命令更新版本号
- dev 开发分支，web环境专用，提交后将自动部署到`http://test.app.mulelink.com/`
- web 正式分支，web环境专用，提交后将自动部署到`https://app.mulelink.com/`
- master 正式分支，小程序专用，提交后自动部署到各小程序平台体验版等待发布。注意版本号不能与之前版本重复，否则上传会失败。

### 安装

本项目需要安装pnpm。

`pnpm i`

### 调试

`pnpm dev:mp-weixin`

### 发布

首先要更新版本号：

`pnpm release`

如果更新的所有提交中不存在包含`feat`的标记，默认只会更新patch版本号。

比如`1.1.0`会自动变成`1.1.1`。

如果存在`feat`标记，则会自动更新minor版本号。

比如`1.1.0`会自动变成`1.2.0`。

如果需要强制更新minor版本号，就执行:

`pnpm release:minor`

然后提交master分支即可。

### 后续自动化部署

将会执行deploy中的命令。

先修改appId，然后build打包，最后上传到微信小程序后台。

### 发布新小程序步骤

- 在新小程序的微信管理后台-开发设置中，添加以下服务器域名：

```
   https://api.bi.tengyouhy.cn;
   https://api.mulelink.com;
   https://forward.n.mulelink.com;
   https://www.mulelink.com;
```
- 在开发设置中，添加以下业务域名：

```
    www.mulelink.com
```
需要先下载校验文件，打开1panel——网站——root目录——上传，放置到www.mulelink.com对应的目录下。

- 更新隐私协议

剪贴板(`自动识别寄件或收件地址`)
地址(`快速填写寄件或收件地址`)
手机号 (`下单寄件`)
自定义 姓名等用户信息(`下单寄件`)

邮箱`sigma@mulelink.com`。

- 在新小程序的微信管理后台获取AppId与AppSecret
- 下载代码上传的私钥文件放置到deploy目录下，并设置IP白名单
```
47.94.150.88
47.94.150.17
47.93.89.246
123.56.255.38
112.126.70.240
```
- 配置企业微信客服

```
ww39bc8534f5bc18bb
```
- 提审文案
```
本应用主要用于提供快递寄件服务。用户可在小程序中选择最符合需求的运力产品并下单寄件，同时可以在订单列表中查看历史记录。
```
- 订单页面地址
```
pages/order/list
```
- 在运营后台先后创建渠道、应用，获得应用Id也就是`VITE_APP_MARK_PROD`和`VITE_APP_MARK_DEV`，分别对应正式环境和测试环境
- 联系BI后台创建应用，获得应用标识也就是`VITE_REPORT_APP_KEY`
- 创建新的.env文件，填入所有信息
- 在package.json中创建对应的dev和build命令
- 在deploy目录下创建对应的打包指令
- 在云效Flow中，复制现有的步骤并修改相关的改动。
