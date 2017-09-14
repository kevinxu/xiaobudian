const request = require('request');
const crypto = require('crypto');
const redis = require('redis');
const wechat = require('wechat');
const WechatAPI = require('wechat-api');
const Patient = require('../models/patients.model');
const Utils = require('./utils');

// 环境变量
const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production' ? true : false;

//  APP 配置
const config = isProd ? require('../config.prod')
                      : require('../config');

const redisClient = redis.createClient({
  "host": config.redis.host,
  "port": config.redis.port
});

redisClient.debug_mode = true;

redisClient.on("connect", function () {
  console.log("Redis connect success.");
});

redisClient.on("error", function (err) {
  console.log("Redis error: " + err);
});

function getToken(appid, appsecret) {
  var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + 
              appid + "&secret=" + appsecret;

  var options = {
    method: 'GET',
    url: url
  };

  console.log("getToken url: " + url);

  return new Promise((resolve, reject) => {
    request(options, function(err, res, body) {
      if (res) {
        var ret = JSON.parse(body);
        resolve(ret.access_token);
      }
      else {
        reject(err);
      }
    });
  });
}

function saveToRedis(key, value) {
  redisClient.set(key, value);
}

function sha1(str) {
  var md5sum = crypto.createHash("sha1");
  md5sum.update(str);
  str = md5sum.digest("hex");
  return str;
}

function auth(req, res, next) {

  var token = config.wechatPatient.token;
  var signature = req.query.signature;
  var timestamp = req.query.timestamp;
  var echostr = req.query.echostr;
  var nonce = req.query.nonce;
  var oriArray = new Array();

  oriArray[0] = nonce;
  oriArray[1] = timestamp;
  oriArray[2] = token;
  oriArray.sort();

  var original = oriArray.join('');
  console.log("Original string: " + original);
  console.log("Signature: " + signature);

  var scyptoString = sha1(original);

  if (signature == scyptoString) {
    res.end(echostr);
    console.log("Wechat auth success.");
  }
  else {
    res.end("false");
    console.log("Wechat auth failed.");
  }
}

function getQrCode(accessToken, sceneStr, isTempQrCode) {

  var url = "https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=" + accessToken;
  var reqbody;

  if (isTempQrCode) {
    reqbody = {
      "expire_seconds": 1728000, // 20 days
      "action_name": "QR_STR_SCENE",
      "action_info": {
        "scene": {
          "scene_str": sceneStr
        }
      }
    };
  }
  else {
    reqbody = {
      "action_name": "QR_LIMIT_STR_SCENE",
      "action_info": {
        "scene": {
          "scene_str": sceneStr
        }
      }
    };
  }

  var options = {
    method: 'POST',
    url: url,
    body: JSON.stringify(reqbody)
  };

  console.log("getQrCode url: " + url);
  console.log(reqbody);

  return new Promise((resolve, reject) => {
    request(options, function(err, res, body) {
      if (res) {
          var result = JSON.parse(body);
          var ret = {
            urlQrCode: "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=" + result.ticket
          };
          if (result.expire_seconds) {
            var now = new Date();
            now.setDate(now.getDate() + (result.expire_seconds / (3600 * 24)));
            ret.expireDate = now.format("yyyy-MM-dd");
          }
          resolve(ret);
      }
      else {
        reject(err);
      }
    });
  });
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
  var qrscene = message.EventKey;
  // skip qrscene_
  var hospitalId = qrscene.substring(8);
  var arr = hospitalId.split("$");
  hospitalId = arr[0];
  var departmentId = arr[1];

  console.log("openId: " + openId + " hospitalId: " + hospitalId + " departmentId: " + departmentId);

  getUserInfo(openId).then(result => {
    var nickName = result.nickname;
    var sex = result.sex;
    var city = result.city;
    var country = result.country;
    var province = result.province;
    var headImgUrl = result.headimgurl;
    var remark = result.remark;

    console.log(JSON.stringify(result));
    if (result.subscribe == 0) {
      console.log("该用户已经取消关注。");
      return;
    }

    const patient = new Patient({
      openId,
      hospitalId,
      departmentId,
      nickName,
      sex,
      city,
      province,
      country,
      headImgUrl,
      remark
    });

    Patient.findOne({'openId': openId})
      .exec()
      .then(createdOne => {
          if (createdOne) {
            console.log("The openId: " + openId + " exists.");
            var data = {
              "hospitalId": hospitalId,
              "departmentId": departmentId,
              "subscribeStatus": 1,
              "nickName": nickName,
              "sex": sex,
              "city": city,
              "province": province,
              "country": country,
              "headImgUrl": headImgUrl,
              "remark": remark
            };
            Patient.updateOne(openId, data);
            res.reply('欢迎再次关注');
            return;
          }

          patient.save()
            .then(newPatient => {
                res.reply('欢迎关注');
            })
            .catch(e => next(e));
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

function getUserInfo(accessToken, openId) {
  var url = "https://api.weixin.qq.com/cgi-bin/user/info?access_token=" + accessToken + 
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

function createMenu(appId, accessToken, buttons) {
  var url = "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=" + accessToken;
  var reqbody = {
    "button": buttons
  };

  // OAuth
  for (var i = 0, len = buttons.length; i < len; i++) {
    var oauthUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" +
              appId + "&redirect_uri=" + config.domain +
              buttons[i].url + "&response_type=code&scope=snsapi_base#wechat_redirect";
    reqbody.button[i].url = oauthUrl;
  }

  var options = {
    method: 'POST',
    url: url,
    body: JSON.stringify(reqbody)
  };

  console.log("createMenu url: " + url);
  console.log(reqbody);

  request(options, function(err, res, body) {
    if (res) {
      var ret = JSON.parse(body);
      if (ret.errcode == 0) {
        console.log("createMenu success.");
      }
      else {
        console.log("createMenu failed with res not null: " + ret.errmsg);
      }
    }
    else {
      console.log("createMenu failed: " + err);
    }
  });
}

function getAccessUserOpenId(appId, appSecret, code) {
  var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + 
              appId + "&secret=" + appSecret + "&code=" + code + "&grant_type=authorization_code";

  var options = {
    method: 'GET',
    url: url
  };

  console.log("getAccessUserOpenId url: " + url);

  return new Promise((resolve, reject) => {
    request(options, function(err, res, body) {
      if (res) {
        var ret = JSON.parse(body);
        resolve(ret.openid);
      }
      else {
        reject(err);
      }
    });
  });
}

function sendTemplateMessage(wechatApi, openId, templateId, url, data, callback) {
  var topColor = '#FF0000';

  console.log("sendTemplateMessage openId: " + openId);
  wechatApi.sendTemplate(openId, templateId, url, topColor, data, function(err, result) {
    if (!err) {
      callback && callback(result);
    }
    else {
      console.log("wechat send template message failed: " + err);
    }
  });
}

function createApiInstance(appId, appSecret) {
  var wechatApi = new WechatAPI(appId, appSecret);
  return wechatApi;
}

module.exports = {
  auth, getToken, saveToRedis, createMenu, getQrCode, getUserInfo, all, getAccessUserOpenId, sendTemplateMessage, createApiInstance,
};
