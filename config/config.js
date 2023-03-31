const qrcodeUrl = 'https://wechaty.js.org/qrcode/'
const puppetConf = {
  name: '机器人',
  // puppet: 'wechaty-puppet-padlocal',
  // puppetOptions: {
  //   token: 'puppet_padlocal_814992bcb1bb4721826d19f4b5a11b2d',
  // }
  // name: botName,
  puppet: 'wechaty-puppet-wechat',
  puppetOptions: {
    uos: true
  }
}

export {
  qrcodeUrl,
  puppetConf
}