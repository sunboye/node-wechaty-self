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
import { botModelType } from '../common/enum.js'

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
  if (text === botModelType.daviceChat.toString()) {
    userInfo[key].cur_model = botModelType.daviceChat
    return `【${config.puppet.name}】\n你好，请问你有什么需要帮助的吗？`
  } else if (text === botModelType.gptChat.toString()) {
    userInfo[key].cur_model = botModelType.gptChat
    return `【${config.puppet.name}】\n你好，请问你有什么需要帮助的吗？`
  } else if (text === botModelType.generateImage.toString()) {
    userInfo[key].cur_model = botModelType.generateImage
    return `【${config.puppet.name}】\n欢迎使用图片生成功能，请发送图片要求。`
  } else {
    return welcomeMsg()
  }
}
const welcomeMsg = () => {
  const welcomeStr = `欢迎使用松松的机器人\n回复功能简介前的数字，开启对应功能：\n\n${botModelType.daviceChat} - 普通聊天机器人\n${botModelType.gptChat} - 高级聊天机器人\n${botModelType.generateImage} - 生成图片\n\n回复*返回主菜单`
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
    return res.message ? res.message : res.param
  }
}

const nomalCompletions = async (text) => {
  const params = {
    max_tokens: 800
  }
  const res = await openai.createNomalCompletions(text, params)
  if (res.success) {
    return res.choices && res.choices.length && res.choices[0] ? res.choices[0].text : res.toString()
  } else {
    return res.message ? res.message : res.param
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
    console.log(msg.text())
    const key = msg.talker().id || msg.talker().name()
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
            messageStr = `【${config.puppet.name}】\n暂不支持该类型对话`
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
    await msg.say(messageStr)
  }
}


export default onMessage