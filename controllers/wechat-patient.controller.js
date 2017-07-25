const request = require('request');
const crypto = require('crypto');
const redis = require('redis');
const wechat = require('wechat');
const Hospital = require('../models/hospital.model');
const Patient = require('../models/patients.model');
const WechatCommon = require('./wechat.common');

// 环境变量
const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production' ? true : false;

//  APP 配置
const config = isProd ? require('../config.prod')
                      : require('../config');

const wechatToken ="WECHAT-PATIENT-ACCESS-TOKEN";

var wechatAccessToken;
var menuCreated = 0;
var wechatApi;

function saveToken() {
    WechatCommon.getToken(config.wechatPatient.appId, config.wechatPatient.appSecret)
    .then(res => {
      console.log("wechat token is: " + res);
      wechatAccessToken = res;
      if (menuCreated == 0) {
        WechatCommon.createMenu(config.wechatPatient.appId, wechatAccessToken, config.wechatMenuPatient);
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
  console.log("wechat callback for patient");
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
    var subscribeStatus = 1;
    var disabled = 0;
    var hospitalId = "";
    var departmentId = "";
    var departmentName = "";
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
          strReply = "欢迎来到" + hospitalName + "自助点餐系统！" +
                            "住院期间，您可以在此预约您的住院膳食！";
          res.reply(strReply);

          var departments = hosp.departments;
          for (var i = 0, len = departments.length; i < len; i++) {
            if (departmentId == departments[i]._id) {
              break;
            }
          }
          departmentName = departments[i].name;
      });
    }
    else {
      console.log("从公众号直接扫描进入");
      strReply = "欢迎来到自助点餐系统！如需点餐，请联系住院部医护人员！留在这里，您将获取到更多营养健康知识！";
      res.reply(strReply);
    }

    Patient.findOne({'openId': openId})
      .then(p => {
        if (p) {
          console.log("The patient with openid " + openId + " exists.");
          if (hospitalId && departmentId) {
            var data;
            data = {
              hospitalId: hospitalId,
              departmentId: departmentId,
              departmentName: departmentName,
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

          Patient.updateOne(openId, data);
        }
        else {
          console.log("new patient");
          const patient = new Patient({
            openId,
            hospitalId,
            departmentId,
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

          patient.save();
        }
      });
  });
}

function unsubscribe(message, req, res) {
  var openId = message.FromUserName;
  var data = {
    "subscribeStatus": 2
  };
  Patient.updateOne(openId, data);
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

function getUserInfo(openId) {
  var url = "https://api.weixin.qq.com/cgi-bin/user/info?access_token=" + wechatAccessToken + 
              "&openid=" + openId + "&lang=zh_CN";

  var options = {
    method: 'GET',
    url: url
  };

  console.log("getUserInfo url: " + url);

  return new Promise((resolve, reject) => {
    request(options, function(err, res, body) {
      if (res) {
        resolve(JSON.parse(body));
      }
      else {
        reject(err);
      }
    });
  });  
}

function getAccessUserOpenId(code) {
  return WechatCommon.getAccessUserOpenId(config.wechatPatient.appId, config.wechatPatient.appSecret, code);
}

Date.prototype.format = function (format) {
  var date = {
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'h+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'q+': Math.floor((this.getMonth() + 3) / 3),
    'S+': this.getMilliseconds()
  };
  if (/(y+)/i.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in date) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1
      ? date[k] : ('00' + date[k]).substr(('' + date[k]).length));
    }
  }
  return format;
};

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

    WechatCommon.sendTemplateMessage(wechatApi, openId, config.wechatPatient.templateId, url, data, function(res) {
      console.log("wechat send msg response: " + res);
    });
  }
  else if (msg.type == "cancel") {
    console.log("send cancel msg");
    var url = config.wechatMenuPatient[0].url;

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

    WechatCommon.sendTemplateMessage(wechatApi, openId, config.wechatPatient.templateId, url, data, function(res) {
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

    WechatCommon.sendTemplateMessage(wechatApi, openId, config.wechatPatient.templateId, url, data, function(res) {
      console.log("wechat send msg response: " + res);
    });    
  }
  else {
    console.log("unsupported msg type: " + msg.type);
  }
}

function init() {
  refreshToken();
  wechatApi = WechatCommon.createApiInstance(config.wechatPatient.appId, config.wechatPatient.appSecret);
}

module.exports = {
  init, getDeptQrCode, all, getAccessUserOpenId, sendMessage,
};
