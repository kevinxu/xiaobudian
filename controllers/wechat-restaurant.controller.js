const request = require('request');
const crypto = require('crypto');
const redis = require('redis');
const wechat = require('wechat');
const Restaurant = require('../models/restaurant.model');
const Managers = require('../models/restaurant-managers.model')
const WechatCommon = require('./wechat.common');
const Utils = require('./utils');

// 环境变量
const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production' ? true : false;

//  APP 配置
const config = isProd ? require('../config.prod')
                      : require('../config');

const wechatToken ="WECHAT-RESTAURANT-ACCESS-TOKEN";

var wechatAccessToken;
var menuCreated = 0;
var wechatApi;

function saveToken() {
    WechatCommon.getToken(config.wechatRestaurant.appId, config.wechatRestaurant.appSecret)
    .then(res => {
      console.log("wechat token is: " + res);
      wechatAccessToken = res;
      if (menuCreated == 0) {
        WechatCommon.createMenu(config.wechatRestaurant.appId, wechatAccessToken, config.wechatMenuRestaurant);
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

function getDeskQrCode(hospId, deskId) {
  var sceneStr = "channel1-" + hospId + "$" + deskId;
  return WechatCommon.getQrCode(wechatAccessToken, sceneStr, 0);
}

function getRestaurantQrCode(restId, managerOpenId) {
  var sceneStr = "channel2-" + restId + "$" + managerOpenId;
  return WechatCommon.getQrCode(wechatAccessToken, sceneStr, 1);
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

function handleManager(openId, eventKey, res, restId, isSupperMgr) {

  WechatCommon.getUserInfo(wechatAccessToken, openId).then(result => {
    var nickName = result.nickname;
    var sex = result.sex;
    var city = result.city;
    var country = result.country;
    var province = result.province;
    var headImgUrl = result.headimgurl;
    var remark = result.remark;
    var subscribeStatus = 1;
    var superManager = 0;
    var disabled;
    var restaurantId = "";
    var departmentId = "";
    var recommendHospitalId = "";
    var recommendOpenId = "";
    var strReply;

    console.log(JSON.stringify(result));
    if (result.subscribe == 0) {
      console.log("该用户已经取消关注。");
      return;
    }

    if (eventKey) {
      var channel = eventKey.substr(0, 9);
      // skip channel1-
      var tmpStr = eventKey.substring(9);
      console.log("qrscene: " + eventKey + " tmpStr: " + tmpStr + " channel: " + channel);

      if (channel == "channel1-") {
        var arr = tmpStr.split("$");
        restaurantId = arr[0];
        departmentId = arr[1];
        disabled = 0;

        console.log("openId: " + openId + " restaurantId: " + restaurantId + " departmentId: " + departmentId);
      }
      else if (channel == "channel2-") {
        console.log("从分享渠道扫码进入");
        var arr = tmpStr.split("$");
        recommendHospitalId = arr[0];
        recommendOpenId = arr[1];

        console.log("recommend hospitalId: " + recommendHospitalId + " openId: " + recommendOpenId);
      }
      else {
        console.log("从未知渠道扫码进入, channel: " + channel);
      }

    }
    else {
      console.log("从公众号直接扫描进入");
    }

    Managers.get({'openId': openId})
      .then(mgr => {
        if (mgr) {
          console.log("The manager with openid " + openId + " exists.");
          var data = {
              nickName: nickName,
              subscribeStatus: subscribeStatus,
              sex: sex,
              city: city,
              province: province,
              country: country,
              headImgUrl: headImgUrl,
              remark: remark,
          };


          if (restaurantId) {
            // 从医院二维码进来
            if (mgr.restaurantId == restaurantId && mgr.disabled == 0) {
              // 扫码同一个医院二维码
              if (res) {
                strReply = "欢迎回来！";
                res.reply(strReply);
              }
            }
            else {
              // 切换医院
              Restaurant.get({'_id': restaurantId})
                .then(rest => {
                  console.log("get restaurant with id: " + restaurantId);
                  console.log(rest);
                  var restaurantName = rest.restaurantName;
                  if (res) {
                    strReply = "恭喜您成为" + restaurantName + "点餐管理员！" +
                            "三分钟学会操作，请点击<a href='http://www.baidu.com'>《新手帮助》</a>";
                    res.reply(strReply);
                  }
              });

              data.disabled = 0;
              data.restaurantId = restaurantId;
              // 切换医院，清除超管权限
              data.superManager = 0;
            }
          }
          else {
            // 从其他渠道进来
            if (res) {
              strReply = "欢迎免费使用！三分钟学会操作，请点击<a href='http://www.baidu.com'>《新手帮助》</a>";
              res.reply(strReply);             
            }
          }

          if (departmentId) {
            data.departmentId = departmentId;
          }

          if (recommendHospitalId) {
            data.recommendHospitalId = recommendHospitalId;
          }

          if (recommendOpenId) {
            data.recommendOpenId = recommendOpenId;
          }

          Managers.updateOne(openId, data);
        }
        else {
          console.log("new manager");
          if(restaurantId) {
              Restaurant.get({'_id': restaurantId})
                .then(rest => {
                  console.log("get restaurant with id: " + restaurantId);
                  console.log(rest);
                  var restaurantName = rest.restaurantName;
                  if (res) {
                    strReply = "恭喜您成为" + restaurantName + "点餐管理员！" +
                            "三分钟学会操作，请点击<a href='http://www.baidu.com'>《新手帮助》</a>";
                    res.reply(strReply);                   
                  }
              });           
          }
          else {
            // 从其他渠道进来
            if (res) {
              strReply = "欢迎免费使用！三分钟学会操作，请点击<a href='http://www.baidu.com'>《新手帮助》</a>";
              res.reply(strReply);
            }
          }

          if (restId) {
            restaurantId = restId;
          }
          if (isSupperMgr) {
            superManager = 1;
            disabled = 0;
          }

          const manager = new Managers({
            openId,
            restaurantId,
            superManager,
            departmentId,
            nickName,
            subscribeStatus,
            sex,
            city,
            province,
            country,
            headImgUrl,
            remark,
            disabled,
            recommendHospitalId,
            recommendOpenId
          });

          manager.save();
        }
      });
  });
}

function subscribe(message, req, res) {

  var openId = message.FromUserName;
  var qrscene = message.EventKey;
  // skip qrscene_
  qrscene = qrscene.substring(8);

  handleManager(openId, qrscene, res);
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

  Managers.get({
    'openId': openId
  }).then(mgr => {
    if (mgr) {
      if (message.EventKey) {
        console.log("EventKey: " + message.EventKey);
        handleManager(openId, message.EventKey, res);
      }
    }
    else {
      //res.reply('此管理员不存在！');
      // Create a new manager
      if (message.EventKey) {
        console.log("EventKey: " + message.EventKey);
        handleManager(openId, message.EventKey, res);
      }
    }
  })
  .catch(e => next(e));
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
  return WechatCommon.getAccessUserOpenId(config.wechatRestaurant.appId, config.wechatRestaurant.appSecret, code);
}

function sendMessage(openId, msg) {
  var time = new Date();
  var data = {
    'first': {
      'value': "您已被餐馆超级管理员解除" + msg.restaurantName + "管理员权限！",
      'color': "#173177"
    },
    'restaurant': {
      'value': msg.restaurantName,
      'color': "#173177"
    },
    'time': {
      'value': time.format("yyyy-MM-dd hh:mm:ss"),
      'color': "#173177"
    }
  };

  WechatCommon.sendTemplateMessage(wechatApi, openId, config.wechatRestaurant.templateId, "", data, function(res) {
    console.log("wechat send msg response: " + res);
  });
}

function init() {
  refreshToken();
  wechatApi = WechatCommon.createApiInstance(config.wechatRestaurant.appId, config.wechatRestaurant.appSecret);
}

function createManager(openId, restaurantId, isSupperMgr) {
  handleManager(openId, null, null, restaurantId, isSupperMgr);
}

module.exports = {
  init, getDeskQrCode, all, getAccessUserOpenId, getRestaurantQrCode, sendMessage, createManager,
};
