<!--
 * @Author: yangss
 * @Position: 
 * @Date: 2023-03-31 10:24:59
 * @LastEditors: yangss
 * @LastEditTime: 2023-04-17 14:27:15
 * @FilePath: \node-wechaty-self\README.md
-->
# node-wechaty-self
node-wechaty-openai 实现微信机器人

### 前期准备

1. 获取OpenAI的apiKey，如果没有可前往[OpenAI官网](https://platform.openai.com/account/api-keys)获取
2. 打开项目下的config/config.json，设置openai的apiKey
3. 如果不能直连OpenAI，可能需要代理，打开项目下的config/config.json，设置proxy为本地代理（proxy格式：protocol://agent-ip:port；例：http://127.0.0.1:88888）
![Alt](./static/images/proxy.png#pic_center)
### 开始

 1. `npm install` 安装依赖
 2. `npm run start` 执行
 3. 执行成功后，控制台出现二维码，使用微信扫描二维码并确认登录
 4. 当控制台打印出ready-go时，代表微信加载完成，此时用另一个微信发给当前登录微信消息即可开始体验机器人功能






