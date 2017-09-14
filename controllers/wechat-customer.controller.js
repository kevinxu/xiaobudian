const request = require('request');
const crypto = require('crypto');
const redis = require('redis');
const wechat = require('wechat');
const Restaurant = require('../models/restaurant.model');
const Customer = require('../models/customer.model');
const WechatCommon = require('./wechat.common');
const Utils = require('./utils');

// 环境变量
const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production' ? true : false;

//  APP 配置
const config = isProd ? require('../config.prod')
                      : require('../config');

const wechatToken ="WECHAT-CUSTOMER-ACCESS-TOKEN";

var wechatAccessToken;
var menuCreated = 0;
var wechatApi;

function saveToken() {
    WechatCommon.getToken(config.wechatCustomer.appId, config.wechatCustomer.appSecret)
    .then(res => {
      console.log("wechat token is: " + res);
      wechatAccessToken = res;
      if (menuCreated == 0) {
        WechatCommon.createMenu(config.wechatCustomer.appId, wechatAccessToken, config.wechatMenuCustomer);
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

function getDeskQrCode(restId, deskId) {
  var sceneStr = restId + "$" + deskId;
  return WechatCommon.getQrCode(wechatAccessToken, sceneStr, 0);
}

function all(req, res, next) {
  console.log("wechat callback for customer");
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
    // 扫描餐桌二维码，或者公众号直接进入
    if (message.EventKey) {
      // 通过餐桌二维码扫码
      var qrscene = message.EventKey;
      // skip qrscene_
      qrscene = qrscene.substring(8);
      var v = parseQrCode(qrscene);

      Restaurant.get({'_id': v.restaurantId})
        .then(rest => {
          if (rest) {
            console.log("get restaurant with id: " + v.restaurantId);
            console.log(rest);
            var restaurantName = rest.restaurantName;
            strReply = "欢迎来到" + restaurantName + "自助点餐系统！";
            res.reply(strReply);

            var desks = rest.desks;
            for (var i = 0, len = desks.length; i < len; i++) {
              if (deskId == desks[i]._id) {
                break;
              }
            }

            if (i == len) {
              console.log("此桌号ID不存在！");
              return;
            }

            deskName = desks[i].name;

            updateCustomerInfo(openId, result, v.restaurantId, v.deskId, deskName);
          }
          else {
            console.log("此医院ID不存在！");
            updateCustomerInfo(openId, result);
          }
      });
    }
    else {
      // 通过公众号进入
      updateCustomerInfo(openId, result);
    }
  });
}

function unsubscribe(message, req, res) {
  var openId = message.FromUserName;
  var data = {
    "subscribeStatus": 2
  };
  Customer.updateOne(openId, data);
  res.reply('Byebye，欢迎下次继续光临！');
  return;
}

function parseQrCode(eventKey) {

  var arr = eventKey.split("$");

  return {
    'restaurantId': arr[0],
    'deskId': arr[1]
  };
}

function updateCustomerInfo(openId, wechatInfo, restaurantId, deskId, deskName) {
  Customer.findOne({'openId': openId})
    .then(p => {
      var nickName = wechatInfo.nickname;
      var sex = wechatInfo.sex;
      var city = wechatInfo.city;
      var country = wechatInfo.country;
      var province = wechatInfo.province;
      var headImgUrl = wechatInfo.headimgurl;
      var remark = wechatInfo.remark;
      var subscribeStatus = 1;
      var disabled = 0;
      var data = {
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

      if (restaurantId) {
        data.restaurantId = restaurantId;
      }
      if (deskId) {
        data.deskId = deskId;
      }
      if (deskName) {
        data.deskName = deskName;
      }

      if (p) {
        console.log("The customer with openid " + openId + " exists.");

        Customer.updateOne(openId, data);
      }
      else {
        console.log("new customer openId: " + openId);
        const customer = new Customer({
          openId,
          nickName,
          subscribeStatus,
          sex,
          city,
          province,
          country,
          headImgUrl,
          remark,
          disabled,
          restaurantId,
          deskId,
          deskName
        });

        customer.save();
      }
    }); 
}

function scan(message, req, res) {
  var openId = message.FromUserName;

  console.log("wechat scan openId: " + openId);
  WechatCommon.getUserInfo(wechatAccessToken, openId).then(result => {
    // 扫描餐桌二维码，或者公众号直接进入
    if (message.EventKey) {
      // 通过餐桌二维码扫码
      var v = parseQrCode(message.EventKey);

      Restaurant.get({'_id': v.restaurantId})
        .then(rest => {
          if (rest) {
            console.log("get restaurant with id: " + v.restaurantId);
            console.log(rest);
            var restaurantName = rest.restaurantName;
            strReply = "欢迎来到" + restaurantName + "自助点餐系统！";
            res.reply(strReply);

            var desks = rest.desks;
            for (var i = 0, len = desks.length; i < len; i++) {
              if (v.deskId == desks[i]._id) {
                break;
              }
            }

            if (i == len) {
              console.log("此桌号ID不存在！");
              return;
            }

            deskName = desks[i].name;

            updateCustomerInfo(openId, result, v.restaurantId, v.deskId, deskName);
          }
          else {
            console.log("此医院ID不存在！");
            updateCustomerInfo(openId, result);
          }
      });
    }
    else {
      // 通过公众号进入
      updateCustomerInfo(openId, result);
    }
  });
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
  return WechatCommon.getAccessUserOpenId(config.wechatCustomer.appId, config.wechatCustomer.appSecret, code);
}

function sendMessage(openId, msg) {
  var time = new Date();
  var meal = "早餐";
  if (msg.order.orderMealType == "breakfast") {
    meal = "早餐";
  }
  else if (msg.order.orderMealType == "lunch") {
    meal = "午餐";
  }
  else if (msg.order.orderMealType == "dinner") {
    meal = "晚餐";
  }
  else {
    console.log("invalid meal type: " + msg.order.orderMealType);
  }

  if (msg.type == "confirm") {
    console.log("send confirm msg");
    var url = config.wechatMenuPatient[1].url;

    var data = {
      'first': {
        'value': "您预订的" + msg.order.orderDate + meal + "已确认，预计送达时间" + msg.order.orderTimeTips.shippingStart,
        'color': "#173177"
      },
      'department': {
        'value': msg.order.departmentName,
        'color': "#173177"
      },
      'time': {
        'value': time.format("yyyy-MM-dd hh:mm:ss"),
        'color': "#173177"
      }
    };

    WechatCommon.sendTemplateMessage(wechatApi, openId, config.wechatCustomer.templateId, url, data, function(res) {
      console.log("wechat send msg response: " + res);
    });
  }
  else if (msg.type == "cancel") {
    console.log("send cancel msg");
    var url = config.wechatMenuCustomer[0].url;

    var data = {
      'first': {
        'value': "您预订的" + msg.order.orderDate + meal + "被退订！",
        'color': "#ff0000"
      },
      'department': {
        'value': msg.order.departmentName,
        'color': "#173177"
      },
      'time': {
        'value': time.format("yyyy-MM-dd hh:mm:ss"),
        'color': "#173177"
      },
      'remark': {
        'value': msg.order.comment,
        'color': "#ff0000"
      }
    };

    WechatCommon.sendTemplateMessage(wechatApi, openId, config.wechatCustomer.templateId, url, data, function(res) {
      console.log("wechat send msg response: " + res);
    });    
  }
  else if (msg.type == "remind") {
    console.log("send remind msg");
    var url = config.wechatMenuPatient[0].url;

    var data = {
      'first': {
        'value': msg.order.orderDate + meal + "开始预订，请点击预订！",
        'color': "#173177"
      },
      'department': {
        'value': msg.order.departmentName,
        'color': "#173177"
      },
      'time': {
        'value': time.format("yyyy-MM-dd hh:mm:ss"),
        'color': "#173177"
      }
    };

    WechatCommon.sendTemplateMessage(wechatApi, openId, config.wechatCustomer.templateId, url, data, function(res) {
      console.log("wechat send msg response: " + res);
    });    
  }
  else {
    console.log("unsupported msg type: " + msg.type);
  }
}

function init() {
  refreshToken();
  wechatApi = WechatCommon.createApiInstance(config.wechatCustomer.appId, config.wechatCustomer.appSecret);
}

module.exports = {
  init, getDeskQrCode, all, getAccessUserOpenId, sendMessage,
};
