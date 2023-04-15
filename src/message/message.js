/*
 * @Author: yangss
 * @Position: 
 * @Date: 2023-04-15 10:50:49
 * @LastEditors: yangss
 * @LastEditTime: 2023-04-15 15:57:55
 * @FilePath: \node-wechaty-self\src\message\message.js
 */
import { FileBox } from 'file-box'
import openApi from 'openai-self'
import config from '../../config/config.js'
const openai = new openApi(config.openai);

const onMessage = async (msg) => {
  if (!msg.room() && !msg.self() && msg.age() < 180) {
    let repMsg = ''
    const fromName = await msg.talker().alias() 
    //  || msg.talker().name()
    // console.dir(msg)
    console.dir(msg.type())
    if (msg.type() === 7) {
      console.log(`【${fromName}】\n${msg.text().toString()}`)
      // 3.5模型
      // const params = {
      //   max_tokens: 800,
      //   context: fromName
      // }
      const repObj = await openai.createChatCompletions(msg.text().toString(), params)
      // 生成图片功能
      // const repObj = await openai.generateImage(msg.text().toString())
      // console.dir(repObj)
      // const fileBox = FileBox.fromUrl(repObj[0])
      // await msg.say(fileBox)
      // 普通模型
      // const repObj = await openai.createNomalCompletions(msg.text().toString(), {max_tokens: 2000})
      repMsg = repObj && typeof repObj === 'object' && repObj.content ? repObj.content : repObj
    } else {
      console.dir(msg)
      repMsg = '暂时只支持文本对话哟！！！'
    }

    // console.log(`【${puppetConf.name}】\n${repMsg}`)
    await msg.say(`【${puppetConf.name}】\n${repMsg.toString()}`)
    // contextTimeMap[fromName] = new Date().getTime()
    // warnMessageMap[fromName] = false
    // if (!intervalFunc) {
    //   intervalFunc = setInterval(intervalDelete, 60000)
    // }
  }
}


export default onMessage