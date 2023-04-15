/*
 * @Author: yangss
 * @Position: 
 * @Date: 2023-04-15 13:21:25
 * @LastEditors: yangss
 * @LastEditTime: 2023-04-15 14:48:57
 * @FilePath: \node-wechaty-self\src\common\util.js
 */
import fs from 'fs'
import path from 'path'
import config from '../../config/config.js'


async function intervalDelete() {
  if (Object.keys(contextTimeMap).length) {
    const now = new Date().getTime()
    for (let key in contextTimeMap) {
      if (contextTimeMap[key]) {
        if (now > contextTimeMap[key] && now - contextTimeMap[key] > clearTime * 60000) {
          openai.clearContext(key)
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
            // console.log(bot.currentUser)
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
  const contextDir = path.resolve(`${sourceDir}/context`)
  if (fs.existsSync(contextDir)) {
    const files = fs.readdirSync(contextDir)
    const now = new Date().getTime()
    files.forEach(key => {
      const filePath = path.resolve(`${sourceDir}/${key}`)
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        contextTimeMap[key.slice(0, key.length - 5)] = now
      }
    })
  }
}
