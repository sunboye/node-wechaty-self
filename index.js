// Contact, Message,
import fs from 'fs'
import path from 'path'
import {ScanStatus, WechatyBuilder, log } from 'wechaty'
import qrcodeTerminal from 'qrcode-terminal'
import { puppetConf, qrcodeUrl } from './config/config.js'
import openApi from 'openai-self'
const openai = new openApi({
  apikey: process.env.OPENAI_API_KEY || '', // openai的api_Key：必填，可前往openai官网申请，sk-**
  // proxy: 'http://127.0.0.1:21882', // 代理服务器地址：非必填，科学上网时需要
  organizationId: '' // 组织机构Id：非必填
});
console.log(openai)
const contextTimeMap = {}
const warnMessageMap ={}
let intervalFunc = null
const clearTime = 13 //分钟, 不进行对话多少分钟后,清除聊天记录
const msgTime = 3 // 分钟, 在清除聊天记录多少分钟前，进行微信通知

// 获取当前登录用户自己的微信 ID
let selfWechat = ''

// console.log(await openai.createNomalCompletions('你好'))
function onScan (qrcode, status) {
  console.dir(qrcode)
  console.dir(status)
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    const qrcodeImageUrl = [qrcodeUrl, encodeURIComponent(qrcode)].join('')
    log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)
    qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console
  } else {
    log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
  }
}

function onLogin (user) {
  log.info('StarterBot', '%s login', user)
  initContextTime()
  console.log(user.id)
  selfWechat = user.id
}

function onLogout (user) {
  log.info('StarterBot', '%s logout', user)
}

async function onMessage (msg) {
  if (!msg.room() && !msg.self() && msg.age() < 180) {
    let repMsg = ''
    const fromName = await msg.talker().alias()
    //  || msg.talker().name()
    // console.dir(msg)
    // console.dir(msg.text())
    if (msg.type() === 7) {
      console.log(`【${fromName}】\n${msg.text().toString()}`)
      // 3.5模型
      const params = {
        max_tokens: 500,
        context: fromName
      }
      const repObj = await openai.createChatCompletions(msg.text().toString(), params)
      // 普通模型
      // const repObj = await openai.createNomalCompletions(msg.text().toString(), {max_tokens: 2000})
      repMsg = repObj && typeof repObj === 'object' && repObj.content ? repObj.content : repObj
    } else {
      repMsg = '暂时只支持文本对话哟！！！'
    }
    console.log(`【${puppetConf.name}】\n${repMsg}`)
    await msg.say(`【${puppetConf.name}】\n${repMsg.toString()}`)
    contextTimeMap[fromName] = new Date().getTime()
    warnMessageMap[fromName] = false
    if (!intervalFunc) {
      intervalFunc = setInterval(intervalDelete, 60000)
    }
  }
}


async function intervalDelete() {
  if (Object.keys(contextTimeMap).length) {
    const now = new Date().getTime()
    for (let key in contextTimeMap) {
      if (contextTimeMap[key]) {
        if (now > contextTimeMap[key] && now - contextTimeMap[key] > clearTime * 60000) {
          openai.deleteContext(key)
          contextTimeMap[key] && delete contextTimeMap[key]
          warnMessageMap[key] && delete warnMessageMap[key]
        } else if (now > contextTimeMap[key] && now - contextTimeMap[key] > (clearTime - msgTime) * 60000) {
          if (!warnMessageMap[key]) {
            const contact = await bot.Contact.find({alias: key})
            if (contact) {
              const userMsg = `【${puppetConf.name}】\n您与${puppetConf.name}已经${clearTime-msgTime}分钟没说话了，如果您需要继续聊天，请及时发送消息，否则${puppetConf.name}将在${msgTime}分钟之后离开，后续聊天将开启新的聊天。\n\n\n如果您暂时不需要机器人了，请忽略此条消息！！！`
              await contact.say(userMsg)
            }
            const selfMsg = `【${puppetConf.name}】\n与${key}的聊天记录即将删除`
            console.log(bot.currentUser)
            await bot.currentUser.say(selfMsg)
            warnMessageMap[key] = true
          }
        }
      }
    }
  } else {
    if (intervalFunc) {
      clearInterval(intervalFunc)
      intervalFunc = null
    }
  }
}

function initContextTime() {
  const files = fs.readdirSync(path.resolve('./source_context'))
  const now = new Date().getTime()
  files.forEach(key => {
    const filePath = path.resolve(`./source_context/${key}`)
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      contextTimeMap[key.slice(0, key.length - 5)] = now
    }
  })
}

const bot = WechatyBuilder.build(puppetConf)

bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('logout',  onLogout)
bot.on('message', onMessage)

bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))
