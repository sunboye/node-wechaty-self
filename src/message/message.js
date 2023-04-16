/*
 * @Author: yangss
 * @Position: 
 * @Date: 2023-04-15 10:50:49
 * @LastEditors: yangss
 * @LastEditTime: 2023-04-16 01:10:12
 * @FilePath: \node-wechaty-self\src\message\message.js
 */
import { FileBox } from 'file-box'
import lodash from 'lodash';
import openApi from 'openai-self'
import config from '../../config/config.js'
import { botModelType, modelWelcome } from '../common/enum.js'

const openai = new openApi(config.openai);
const { cloneDeep } = lodash;
const userTemp = {
  unique_key: 'id',
  unique_val: '',
  cur_model: 0,
  warned: false,
  cleared: false
}
const userInfo = {}

const setModel = (key, text) => {
  const bottomTips = '【回复*可返回主菜单】'
  if (text === botModelType.daviceChat.toString()) {
    userInfo[key].cur_model = botModelType.daviceChat
    return `${modelWelcome[botModelType.daviceChat]}\n\n${bottomTips}`
  } else if (text === botModelType.gptChat.toString()) {
    userInfo[key].cur_model = botModelType.gptChat
    return `${modelWelcome[botModelType.gptChat]}\n\n${bottomTips}`
  } else if (text === botModelType.generateImage.toString()) {
    userInfo[key].cur_model = botModelType.generateImage
    return `${modelWelcome[botModelType.generateImage]}\n\n${bottomTips}`
  } else {
    return welcomeMsg()
  }
}
const welcomeMsg = () => {
  let modelStr = ''
  Object.keys(botModelType).forEach(item => {
    if (item && !isNaN(item) && parseInt(item)) {
      modelStr += `${item} - ${botModelType[item]}\n`
    }
  })
  const welcomeStr = `${modelWelcome[botModelType.welcome]}\n\n${modelStr}`
  return welcomeStr
}

const chatCompletions = async (key, text) => {
  // 3.5模型
  const params = {
    max_tokens: 800,
    context: key
  }
  const res = await openai.createChatCompletions(text, params)
  if (res.success) {
    return res.choices && res.choices.length && res.choices[0].message ? res.choices[0].message.content : ''
  } else {
    return `Error: ${res.message}`
  }
}

const nomalCompletions = async (text) => {
  const params = {
    max_tokens: 800
  }
  const res = await openai.createNomalCompletions(text, params)
  if (res.success) {
    return res.choices && res.choices.length && res.choices[0] ? res.choices[0].text :''
  } else {
    return  `Error: ${res.message}`
  }
}

const generateImage = async (text) => {
  // 生成图片功能
  const res = await openai.generateImage(text)
  const fileBox = res.success && res.data && res.data[0].url ? FileBox.fromUrl(res.data[0].url) : res.message
  return fileBox
}

const onMessage = async (msg) => {
  if (!msg.room() && !msg.self() && msg.age() < 180) {
    const key = msg.talker().id || msg.talker().name()
    console.log(`[${key}]: ${msg.text()}`)
    let messageStr = ''
    if (key) {
      if (userInfo[key]) {
        if (msg.type() === 7) {
          const text = msg.text().toString()
          if (text === '*') {
            userInfo[key].cur_model = botModelType.welcome
            messageStr = welcomeMsg()
          } else {
            if (userInfo[key].cur_model) {
              if (userInfo[key].cur_model === botModelType.daviceChat) {
                messageStr = await nomalCompletions(text)
              } else if (userInfo[key].cur_model === botModelType.gptChat) {
                messageStr = await chatCompletions(key, text)
              } else if (userInfo[key].cur_model === botModelType.generateImage) {
                messageStr = await generateImage(text)
              }
            } else {
              messageStr = setModel(key, text)
            }
          }
        } else {
          if (userInfo[key].cur_model) {
            messageStr = '暂不支持该类型，请使用文本类型进行对话。'
          } else {
            messageStr = welcomeMsg()
          }
        }
      } else {
        if (Object.keys(userInfo) < 1) {
          openai.clearSourceDir()
        }
        userInfo[key] = cloneDeep(userTemp)
        messageStr = welcomeMsg()
      }
    } else {
      messageStr = 'Error: Failed to obtain key, please contact the administrator by phone'
    }
    messageStr && await msg.say(messageStr)
  }
}


export default onMessage