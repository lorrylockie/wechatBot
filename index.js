/**
 * WechatBot
 *  - https://github.com/gengchen528/wechatBot
 */
const { Wechaty } = require('wechaty');
const superagent = require('./superagent/index');

// 延时函数，防止检测出类似机器人行为操作
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

//  二维码生成
function onScan(qrcode, status) {
  require('qrcode-terminal').generate(qrcode); // 在console端显示二维码
  const qrcodeImageUrl = [
    'https://api.qrserver.com/v1/create-qr-code/?data=',
    encodeURIComponent(qrcode)
  ].join('');
  console.log(qrcodeImageUrl);
}

// 登录
async function onLogin(user) {
  
}

//登出
function onLogout(user) {
  console.log(`小助手${user} 已经登出`);
}


// 监听对话
async function onMessage(msg) {
  const contact = msg.from(); // 发消息人
  const content = msg.text().trim(); // 消息内容
  const room = msg.room(); // 是否是群消息
  const alias = await contact.alias(); // 发消息人备注
  const isText = msg.type() === bot.Message.Type.Text;

  const needDeal = content.includes('刘助理');
  const requestContent = content.replace('刘助理','');

  if(!needDeal){
    return;
  }

  if (room && isText) {
    room.say(await superagent.getONE(requestContent));
  } else if (isText || msg.self()) {
    contact.say(await superagent.getONE(requestContent));
  }
}


const bot = new Wechaty({ name: 'WechatEveryDay' });

bot.on('scan', onScan);
bot.on('login', onLogin);
bot.on('logout', onLogout);
bot.on('message', onMessage);

bot
  .start()
  .then(() => console.log('开始登陆微信'))
  .catch(e => console.error(e));
