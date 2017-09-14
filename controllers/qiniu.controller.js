const request = require('request');
const crypto = require('crypto');
const redis = require('redis');
const qiniu = require('qiniu');
const Utils = require('./utils');

// 环境变量
const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production' ? true : false;

//  APP 配置
const config = isProd ? require('../config.prod')
                      : require('../config');

qiniu.conf.ACCESS_KEY = config.qiniu.accessKey;
qiniu.conf.SECRET_KEY = config.qiniu.secretKey;

var bucket = config.qiniu.bucket;

var uploadToken;

function qiniuCallback(req, res, next) {

  console.log("qiniuCallback");
}

function getToken(req, res, next) {

  res.json({
    success: true,
    uptoken: uploadToken
  });
}

function saveToken() {

  var callbackUrl = config.domain + '/api/qiniu/upload/callback';
  var putPolicy = new qiniu.rs.PutPolicy(bucket);

  //putPolicy.callbackUrl = callbackUrl;
  uploadToken = putPolicy.token();
  console.log("get qiniu upload token: " + uploadToken);
}

function refreshToken() {
  saveToken();
  setInterval(function() {
    saveToken();
  }, 7000*1000);
}

function init() {
  refreshToken();
}

module.exports = {
  init,
  getToken,
  qiniuCallback,
};
