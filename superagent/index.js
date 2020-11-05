const superagent = require('./superagent');
const config = require('../config/index');
const cheerio = require('cheerio');
const { machineIdSync } = require('node-machine-id');
const crypto = require('crypto');



async function getONE(word){
  word = word.trim();
  const func = [history,rili,jiemeng, getQingYuke];
  for(let i =0;i<func.length;i++){
    let result = await func[i].call(this, word);
    let hasRes = !(result === false || result === undefined);
    if(hasRes){
      return p1(result);
    }
  }
  return '不知道呢';
}

// 兜底
async function getQingYuke(word) {
  // 获取每日一句
  try {
    let res = JSON.parse(
      (
        await superagent.req(
          'http://api.qingyunke.com/api.php?key=free&appid=0&msg=' +
            encodeURIComponent(word),
          'GET'
        )
      ).text
    );
    return res ? res.content : '不知道呢';
  } catch (err) {
    console.log('错误', err);
    return false;
  }
}

function p1(result) {
  return result
    .replace(/菲菲姐/g, '刘助理')
    .replace(/菲菲/g, '刘助理')
    .replace(/\{br\}/g, '\n');
}

//老黄历
async function rili(word) {
  if (word.includes('老黄历') || word.includes('黄历')) {
    try {
      const date = new Date();
      let dstr = date.getFullYear() + '-' + (date.getMonth() + 1) + "-" + date.getDate();
 
      let res = await superagent.req(
        `http://v.juhe.cn/laohuangli/d?date=${dstr}&key=7f31c864b61c272b5e90adf7ca0a3568`
      );
      let obj = JSON.parse(res.text).result;
      return Object.keys(obj)
        .map((k) => k + ':' + obj[k] + '\n')
        .join();
    } catch {
      return false;
    }
  }
  return false;
}

async function history(word){
  if (word.includes('历史的今天') || word.includes('历史上的今天') || word.includes('历史今天') ) {
    try {
      let res = await superagent.req(
        'https://api.asilu.com/today/'
      );
      let obj = JSON.parse(res.text);
      if(obj.code === 200 && obj.data.lenth !== 0){
        return obj.data.map((k) => k.year + '年:\n' + k.title + '\n' + k.link)
        .join('\n');
      }
    } catch {
    }
  }
}


// 解梦
async function jiemeng(word){
  if (word.includes('解梦') || word.includes('周公解梦')) {
    try {
      let res = await superagent.req(
        'http://v.juhe.cn/dream/query?cid=&full=&key=4214b27c051a4f1ac7f2551233790a19&q='+encodeURIComponent(word.replace(/解梦|周公解梦/g,''))
      );
      let obj = JSON.parse(res.text);
      if(obj.reason === 'successed' && obj.result !== null){
        console.log(obj.result)
        return obj.result.map((k) => k.title + ':\n' + k.des + '\n')
        .join('\n');
      }else{
        return await getQingYuke(word.replace('解梦',''))
      }
    } catch {
    }
  }
}

async function a() {
  console.log(await getONE('历史上的今天 黄斯蒂芬是的冯绍峰金'));
}
a();

module.exports = {
  getONE,
};
