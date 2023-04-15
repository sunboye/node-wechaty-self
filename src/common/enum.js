/*
 * @Author: yangss
 * @Position: 
 * @Date: 2023-04-13 15:29:03
 * @LastEditors: yangss
 * @LastEditTime: 2023-04-15 21:41:25
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
    Attachment: 2,
    Audio: 3,
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
  0: 'welcome',
  1: 'daviceChat',
  2: 'gptChat',
  3: 'generateImage',
  welcome: 0,
  daviceChat: 1,
  gptChat: 2,
  generateImage: 3
}
export {
  Message,
  botModelType
}