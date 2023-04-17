/*
 * @Author: yangss
 * @Position: 
 * @Date: 2023-04-15 10:50:49
 * @LastEditors: yangss
 * @LastEditTime: 2023-04-17 16:57:44
 * @FilePath: \node-wechaty-self\src\message\message.js
 */
import { FileBox } from 'file-box'
import path from 'path';
import lodash from 'lodash';
import openApi from 'openai-self'
import config from '../../config/config.js'
import { Message, botModelType, modelWelcome, typeWarnMsg } from '../common/enum.js'
const openai = new openApi(config.openai);
const { cloneDeep } = lodash;
const userTemp = {
  unique_key: 'name',
  unique_val: '',
  cur_model: 0, // 标记用户当前所使用的功能
  last_time: 0,
  warned: false,
  cleared: false
}
const userInfo = {}
let bot = {}
let intervalFunc = null

const leaveModel = (key) => {
  if (userInfo[key].cur_model === botModelType.gptChat || userInfo[key].cur_model === botModelType.transcription) {
    openai.clearContext(key)
  }
  userInfo[key].cur_model = botModelType.welcome
}

const getCurModelText = async (key, text) => {
  if (userInfo[key].cur_model === botModelType.daviceChat) {
    return await nomalCompletions(text)
  } else if (userInfo[key].cur_model === botModelType.gptChat) {
    return await chatCompletions(key, text)
  } else if (userInfo[key].cur_model === botModelType.generateImage) {
    return await generateImage(text)
  } else if (userInfo[key].cur_model === botModelType.transcription) {
    return typeWarnMsg.Audio
  } else {
    return welcomeMsg()
  }
}
const getCurModelAudio = async (key, file) => {
  if (userInfo[key].cur_model === botModelType.daviceChat || userInfo[key].cur_model === botModelType.gptChat || userInfo[key].cur_model === botModelType.generateImage) {
    return typeWarnMsg.Text
  } else if (userInfo[key].cur_model === botModelType.transcription) {
    return await createTranscription(key, file)
  } else {
    return welcomeMsg()
  }
}

const setModel = (key, text) => {
  const bottomTips = '提示：回复*可返回主菜单'
  if (text === botModelType.daviceChat.toString()) {
    userInfo[key].cur_model = botModelType.daviceChat
    return `${modelWelcome[botModelType.daviceChat]}\n\n${bottomTips}`
  } else if (text === botModelType.gptChat.toString()) {
    userInfo[key].cur_model = botModelType.gptChat
    return `${modelWelcome[botModelType.gptChat]}\n\n${bottomTips}`
  } else if (text === botModelType.generateImage.toString()) {
    userInfo[key].cur_model = botModelType.generateImage
    return `${modelWelcome[botModelType.generateImage]}\n\n${bottomTips}`
  } else if (text === botModelType.transcription.toString()) {
    userInfo[key].cur_model = botModelType.transcription
    return `${modelWelcome[botModelType.transcription]}\n\n${bottomTips}`
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
const createTranscription = async (key, stream) => {
  const res = await openai.createTranscription(stream)
  if (res.success) {
    const text = res.text  || ''
    return await chatCompletions(key, text)
  } else {
    return `Error: ${res.message}`
  }
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

const intervalDelete = async () => {
  if (Object.keys(userInfo).length) {
    const now = new Date().getTime()
    for (let key in userInfo) {
      if (userInfo[key] && userInfo[key].cur_model && userInfo[key].last_time  && now > userInfo[key].last_time && now - userInfo[key].last_time > parseInt(config.bot.warnTime) * 60000) {
        if (userInfo[key].warned) {
          if (now - userInfo[key].last_time > (parseInt(config.bot.warnTime) + parseInt(config.bot.clearTime)) * 60000) {
            if (userInfo[key].cur_model === botModelType.gptChat) {
              // 离开gpt聊天，清除聊天记录
              openai.clearContext(key)
            }
            delete userInfo[key]
          }
        } else {
          const contact = await bot.Contact.find({ name: key})
          if (contact) {
            const userMsg = `提示：您已经${config.bot.warnTime}分钟没说话了，如果需要继续当前功能（${botModelType[userInfo[key].cur_model]}），请回复任意内容，否则${config.puppet.name}将在${config.bot.clearTime}分钟后离开，离开之后您可回复任意内容唤醒${config.puppet.name}。`
            contact.say(userMsg)
          }
          userInfo[key].warned = true
        }
      }
    }
  }
}

const setBot = (val) => {
  bot = val
  openai.clearSourceDir()
}

const onMessage = async (msg) => {
  if (!msg.room() && !msg.self() && msg.age() < 180) {
    //  msg.talker().id || 
    // msg.talker().alise() || 
    const key = msg.talker().name()
    let messageStr = ''
    if (key) {
      if (userInfo[key]) {
        userInfo[key].last_time = new Date().getTime()
        userInfo[key].warned = false
        if (!intervalFunc) {
          intervalFunc = setInterval(intervalDelete, 60000)
        }
        if (msg.type() === Message.MessageType.Text) {
          const text = msg.text().toString()
          console.log(`[${key}]: ${msg.text()}`)
          if (text === '*') {
            leaveModel(key)
            messageStr = welcomeMsg()
          } else {
            if (userInfo[key].cur_model) {
              messageStr = await getCurModelText(key, text)
            } else {
              messageStr = setModel(key, text)
            }
          }
        } else if (msg.type() === Message.MessageType.Audio) {
          console.log(`[${key}]: [语音]`)
          if (userInfo[key].cur_model === botModelType.transcription) {
            if (openai.createInSourceDir('audio')) {
              const filebox = await msg.toFileBox()
              const savePath = path.resolve(openai.getSourceDir(), 'audio', `${key}-${new Date().getTime()}.mp3`)
              await filebox.toFile(savePath, true);
              messageStr = await getCurModelAudio(key, savePath)
            } else {
              messageStr = '创建audio文件失败'
            }
          } else {
            messageStr = userInfo[key].cur_model ? typeWarnMsg.Text : welcomeMsg()
          }
        } else {
          messageStr = userInfo[key].cur_model ? typeWarnMsg.Text : welcomeMsg()
        }
      } else {
        userInfo[key] = cloneDeep(userTemp)
        messageStr = welcomeMsg()
      }
    } else {
      messageStr = 'Error: Failed to obtain key, please contact the administrator by phone'
    }
    console.log(`[${config.puppet.name}]：${messageStr}`)
    if (messageStr) {
      try {
        await msg.say(messageStr)
      } catch (error) {
        await msg.say(`Error: ${error.message}`)
      }
    }
  }
}

export {
  setBot,
  onMessage
} 