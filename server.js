'use strict';

const fs = require('fs');
const url = require('url');
const path = require('path');
const qs = require('qs');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const proxy = require('express-http-proxy');
const expressWinston = require('express-winston');
const winstonInstance = require('./logger');
const wechatHospital = require('./controllers/wechat-hospital.controller');
const wechatPatient = require('./controllers/wechat-patient.controller');
const wechatRestaurant = require('./controllers/wechat-restaurant.controller');
const qiniuController = require('./controllers/qiniu.controller');
const wechatCustomer = require('./controllers/wechat-customer.controller');

mongoose.Promise = global.Promise;
// 路由
const routes = require('./routes');

// 环境变量
const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production' ? true : false;

//  APP 配置
const config = isProd ? require('./config.prod.json')
                      : require('./config.json');

mongoose.connect(`mongodb://${config.dbIp}:${config.dbPort}/xiaobudian`, {useMongoClient:true})
  .then(() => { console.log('successfully connect to database.'); })
  .catch((err) => { console.error(err) });

// express 实例
const app = express();

// 设置安全的 HTTP Header
app.use(helmet());

// 开启 gzip 压缩
app.use(compression());

// 静态资源
app.use(express.static(path.join(__dirname, isProd ? 'www' : 'app')));

// 处理 http 请求
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 处理 cookie
app.use(cookieParser());

// 服务端模板采用 ejs
app.set('view engine', 'ejs');

// 模板目录
app.set('views', path.join(__dirname, 'views'));

// logger
expressWinston.requestWhitelist.push('body');
expressWinston.responseWhitelist.push('body');
app.use(expressWinston.logger({
  winstonInstance,
  meta: isProd ? true : false, // optional: log meta data about request (defaults to true)
  msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
  colorStatus: true // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
}));

// 接口
app.use('/api', routes);

// 全局变量
app.locals.isProd = isProd;

if (isProd) {
  const manifest = require('./www/rev-manifest.json');
  app.locals.assetsCss = manifest['build/app.css'];
  app.locals.assetsJs = manifest['build/main.js'];
  app.locals.version = require('./package.json').version;
}

app.use(routes);

app.use(expressWinston.errorLogger({
  winstonInstance
}));

if (config.mode == 1) {
  // restaurant mode
  wechatRestaurant.init();
  qiniuController.init();
  wechatCustomer.init();
}
else if (config.mode == 0) {
  // hospital mode
  wechatHospital.init();
  wechatPatient.init();  
}

app.listen(config.port, '0.0.0.0', () => {
  console.log(`🌎  => Server is running on port ${config.port}`);
});
