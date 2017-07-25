const request = require('request');
const crypto = require('crypto');
const redis = require('redis');
const wechat = require('wechat');
const Hospital = require('../models/hospital.model');
const Managers = require('../models/hospital-managers.model')
const WechatCommon = require('./wechat.common');

// 环境变量
const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production' ? true : false;

//  APP 配置
const config = isProd ? require('../config.prod')
                      : require('../config');

const wechatToken ="WECHAT-HOSPITAL-ACCESS-TOKEN";

var wechatAccessToken;
var menuCreated = 0;

function saveToken() {
    WechatCommon.getToken(config.wechatHospital.appId, config.wechatHospital.appSecret)
    .then(res => {
      console.log("wechat token is: " + res);
      wechatAccessToken = res;
      if (menuCreated == 0) {
        WechatCommon.createMenu(config.wechatHospital.appId, wechatAccessToken, config.wechatMenuHospital);
        menuCreated = 1;
      }

      WechatCommon.saveToRedis(wechatToken, res);
  });  
}

function refreshToken() {
  saveToken();
  setInterval(function() {
    saveToken();
  }, 7000*1000);
}

function getDeptQrCode(hospId, deptId) {

  return WechatCommon.getQrCode(wechatAccessToken, hospId, deptId);
}

function all(req, res, next) {
  console.log("wechat callback.");
  var message = req.weixin;

  console.log(JSON.stringify(message));
  switch (message.MsgType) {
    case "event": 
      console.log("It's event msg: " + message.Event);
      (EventFunction[message.Event] || function() { console.log("unhandled event: " + message.Event)})(message, req, res);

      break;
    case "text":
      break;
    case "image":
      break;
    case "voice":
      break;
    case "video":
      break;
    case "shortvideo":
      break;
    case "location":
      break;
    case "link":
      break;
    default:
      console.log("Unknown MsgType: " + message.MsgType);
  }

}

var EventFunction = {
  //关注
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  SCAN: scan,
  CLICK: eventClick,
  VIEW: eventView
};

function subscribe(message, req, res) {

  var openId = message.FromUserName;

  WechatCommon.getUserInfo(wechatAccessToken, openId).then(result => {
    var nickName = result.nickname;
    var sex = result.sex;
    var city = result.city;
    var country = result.country;
    var province = result.province;
    var headImgUrl = result.headimgurl;
    var remark = result.remark;
    var superManager = 0;
    var subscribeStatus = 1;
    var disabled = 0;
    var hospitalId = "";
    var departmentId = "";
    var strReply;

    console.log(JSON.stringify(result));
    if (result.subscribe == 0) {
      console.log("该用户已经取消关注。");
      return;
    }

    if (message.EventKey) {
      var qrscene = message.EventKey;
      // skip qrscene_
      hospitalId = qrscene.substring(8);
      var arr = hospitalId.split("$");
      hospitalId = arr[0];
      departmentId = arr[1];

      console.log("openId: " + openId + " hospitalId: " + hospitalId + " departmentId: " + departmentId);

      Hospital.get({'_id': hospitalId})
        .then(hosp => {
          console.log("get hospital with id: " + hospitalId);
          console.log(hosp);
          var hospitalName = hosp.hospitalName;
          strReply = "恭喜您成为" + hospitalName + "点餐管理员！" +
                  "三分钟学会操作，请点击<a href='http://www.baidu.com'>《新手帮助》</a>";
          res.reply(strReply);
      });
    }
    else {
      console.log("从公众号直接扫描进入");
      strReply = "欢迎免费使用！三分钟学会操作，请点击<a href='http://www.baidu.com'>《新手帮助》</a>";
      res.reply(strReply);
    }

    Managers.findOne({'openId': openId})
      .then(mgr => {
        if (mgr) {
          console.log("The manager with openid " + openId + " exists.");
          if (hospitalId) {
            var data;
            data = {
              hospitalId: hospitalId,
              superManager: superManager,
              nickName: nickName,
              subscribeStatus: subscribeStatus,
              sex: sex,
              city: city,
              province: province,
              country: country,
              headImgUrl: headImgUrl,
              remark: remark,
              disabled: disabled
            };
          }
          else {
            data = {
              superManager: superManager,
              nickName: nickName,
              subscribeStatus: subscribeStatus,
              sex: sex,
              city: city,
              province: province,
              country: country,
              headImgUrl: headImgUrl,
              remark: remark,
              disabled: disabled
            };
          }

          Managers.updateOne(openId, data)
        }
        else {
          console.log("new manager");
          const manager = new Managers({
            openId,
            hospitalId,
            superManager,
            nickName,
            subscribeStatus,
            sex,
            city,
            province,
            country,
            headImgUrl,
            remark,
            disabled
          });

          manager.save();
        }
      });
  });
}

function unsubscribe(message, req, res) {
  var openId = message.FromUserName;
  var data = {
    "subscribeStatus": 2
  };
  //Patient.updateOne(openId, data);
  res.reply('Byebye，欢迎下次继续光临！');
  return;
}

function scan(message, req, res) {
  var openId = message.FromUserName;
  res.reply('欢迎再次光临');
}

function eventClick(message, req, res) {
  var openId = message.FromUserName;
  var eventKey = message.EventKey;

  if (eventKey == "V1001_ORDER_MANAGEMENT") {

  }
  else if (eventKey == "V1001_MENU_MANAGEMENT") {

  }
  else if (eventKey == "V1001_HOSPITAL_SETTING") {

  }
  else {
    console.log("invalid eventkey: " + eventKey);
  }
}

function eventView(message, req, res) {
  var openId = message.FromUserName;
  var url = message.EventKey;

  res.reply("success");
}

function getAccessUserOpenId(code) {
  return WechatCommon.getAccessUserOpenId(config.wechatHospital.appId, config.wechatHospital.appSecret, code);
}

function init() {
  refreshToken();
}

module.exports = {
  init, getDeptQrCode, all, getAccessUserOpenId,
};
