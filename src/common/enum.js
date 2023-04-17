/*
 * @Author: yangss
 * @Position: 
 * @Date: 2023-04-13 15:29:03
 * @LastEditors: yangss
 * @LastEditTime: 2023-04-17 17:56:39
 * @FilePath: \node-wechaty-self\src\common\enum.js
 */

const Message = {
  MessageStatus: {
    Unknown: 0, // 表示未知状态
    Pending: 1, // 表示消息等待发送
    Sent: 2,    // 表示已发送消息
    Failed: 3,  // 表示消息发送失败
    Delivered: 4,// 表示消息已被成功发送到接收方
    Read: 5 // 表示消息已经被接收方阅读
  },
  MessageType: {
    Unknown: 1,
    Audio: 2,
    Attachment: 3,
    Contact: 4,
    Emoticon: 5,
    Image: 6,
    Text: 7,
    Video: 8,
    Url: 9,
    ChatHistory: 10,
    MiniProgram: 11,
    App: 12,
    Location: 13,
    Quote: 14
  }
}

const botModelType = {
  0: '欢迎页',
  1: '不太聪明的聊天机器人',
  2: '智能聊天机器人',
  3: '生成图片',
  welcome: 0,
  daviceChat: 1,
  gptChat: 2,
  generateImage: 3
}

const modelWelcome = {
  0: '欢迎使用松松的机器人\n\n回复功能简介前的数字，开启对应功能：',
  1: '你好，你现在可以开始和我聊天，请问你有什么需要帮助的吗？',
  2: '你好，你现在可以开始和我聊天，请问你有什么需要帮助的吗？',
  3: '欢迎使用图片生成功能，请发送图片要求或者描述。'
}

export {
  Message,
  botModelType,
  modelWelcome
}