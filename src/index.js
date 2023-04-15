/*
 * @Author: yangss
 * @Position: 
 * @Date: 2023-04-15 13:21:25
 * @LastEditors: yangss
 * @LastEditTime: 2023-04-15 14:47:40
 * @FilePath: \node-wechaty-self\src\index.js
 */

// Contact, Message,
import { WechatyBuilder } from 'wechaty'
import config from '../config/config.js'
import onScan from './scan/scan.js'
import onLogin from './login/login.js'
import onLogout from './logout/logout.js'
import onMessage from './message/message.js'
import onFriendship from './friend/friendship.js'
import onRoomInvite from './room/invite.js'

const bot = WechatyBuilder.build(config.puppet)
bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('logout',  onLogout)
bot.on('ready', () => {
  bot.on('message', onMessage)
  bot.on('friendship',  onFriendship)
  bot.on('room-invite', onRoomInvite)
  console.log('ready-go!!!')
})
bot.start()
  .then(() => console.log(`Starter Bot Started.`))
  .catch(e => console.error(`StarterBot: ${e}`))
