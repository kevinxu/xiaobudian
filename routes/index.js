const request = require('request');
const express = require('express');
const router = express.Router();

const orderRoutes = require('./order.route');
const menuRoutes = require('./menu.route');
const hospitalRoutes = require('./hospital.route');
const patientRoutes = require('./patient.route');

const wechat = require('wechat');
const wechatHospitalController = require('../controllers/wechat-hospital.controller');
const wechatPatientController = require('../controllers/wechat-patient.controller');
const hospitalController = require('../controllers/hospital.controller');
const patientController = require('../controllers/patient.controller');

// 环境变量
const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production' ? true : false;

//  APP 配置
const config = isProd ? require('../config.prod.json')
                      : require('../config.json');

function accessFromWechat(userAgent) {
  var ua = userAgent.toLowerCase();

  if (ua.match(/MicroMessenger/i) == "micromessenger") {
    console.log("access from wechat browser.");
    return true;
  }
  else {
    console.log("access from other browser.");
    return false;
  }
}

// -------------医院端--------------

router.get('/hospitalOrder', (req, res) => {
  console.log('---------------------------hospitalOrder');
  const originPath = req.query.originPath || '';
  var ua = req.get('User-Agent');

  if (config.pcDebug.debug == 1 && !accessFromWechat(ua)) {
    console.log("It's PC debug mode.");
    res.render('index', {
      title: '订单管理',
      entry: 'hospital_order',
      openId: config.pcDebug.debugManagerOpenId,
      hospitalId: config.pcDebug.debugHospitalId,
      departmentId: '',
      originPath: originPath
    });
    return;
  }

  wechatHospitalController.getAccessUserOpenId(req.query.code)
    .then(ret => {
      console.log("access user openid is: " + ret);

      hospitalController.isManagerExist(ret)
        .then(mgr => {
          if (mgr && mgr.hospitalId) {
            console.log("The manager exists: " + mgr);
            res.render('index', {
              title: '订单管理',
              entry: 'hospital_order',
              openId: ret,
              hospitalId: mgr.hospitalId,
              departmentId: '',
              originPath: originPath
            });
          }
          else {
           res.render('index', {
            title: '小不点云点餐',
            entry: 'hospital_no_setting',
            openId: ret,
            hospitalId: '',
            departmentId: '',
            originPath: originPath
            });
          }
        });
  });
});

router.get('/hospitalMenuSetting', (req, res) => {
  console.log('---------------------------hospitalMenuSetting query: ' + JSON.stringify(req.query));
  const originPath = req.query.originPath || '';
  var ua = req.get('User-Agent');

  if (config.pcDebug.debug == 1 && !accessFromWechat(ua)) {
    console.log("It's PC debug mode.");
    res.render('index', {
      title: '膳食菜谱',
      entry: 'hospital_menu_setting',
      openId: config.pcDebug.debugManagerOpenId,
      hospitalId: config.pcDebug.debugHospitalId,
      departmentId: '',
      originPath: originPath
    });
    return;
  }

  wechatHospitalController.getAccessUserOpenId(req.query.code)
    .then(ret => {
      console.log("access user openid is: " + ret);

      hospitalController.isManagerExist(ret)
        .then(mgr => {
          if (mgr && mgr.hospitalId) {
            console.log("The manager exists: " + mgr);
            res.render('index', {
              title: '膳食菜谱',
              entry: 'hospital_menu_setting',
              openId: ret,
              hospitalId: mgr.hospitalId,
              departmentId: '',
              originPath: originPath
            });
          }
          else {
           res.render('index', {
            title: '小不点云点餐',
            entry: 'hospital_no_setting',
            openId: ret,
            hospitalId: '',
            departmentId: '',
            originPath: originPath
            });
          }
        });
  });
});
router.get('/hospitalSetting', (req, res) => {
  console.log('---------------------------hospitalSetting');
  const originPath = req.query.originPath || '';
  var ua = req.get('User-Agent');

  if (config.pcDebug.debug == 1 && !accessFromWechat(ua)) {
    console.log("It's PC debug mode.");
    res.render('index', {
      title: '医院设置',
      entry: 'hospital_setting',
      openId: config.pcDebug.debugManagerOpenId,
      hospitalId: config.pcDebug.debugHospitalId,
      departmentId: '',
      originPath: originPath
    });
    return;
  }

  wechatHospitalController.getAccessUserOpenId(req.query.code)
    .then(ret => {
      console.log("access user openid is: " + ret);

      hospitalController.isManagerExist(ret)
        .then(mgr => {
          if (mgr && mgr.hospitalId) {
            console.log("The manager exists: " + mgr);
            res.render('index', {
              title: '医院设置',
              entry: 'hospital_setting',
              openId: ret,
              hospitalId: mgr.hospitalId,
              departmentId: '',
              originPath: originPath
            });
          }
          else {
           res.render('index', {
            title: '小不点云点餐',
            entry: 'hospital_no_setting',
            openId: ret,
            hospitalId: '',
            departmentId: '',
            originPath: originPath
            });
          }
        });
  });
});


// -------------患者端--------------

router.get('/patientOnlineOrder', (req, res) => {
  console.log('---------------------------patientOnlineOrder');
  const originPath = req.query.originPath || '';
  var ua = req.get('User-Agent');

  if (config.pcDebug.debug == 1 && !accessFromWechat(ua)) {
    console.log("It's PC debug mode.");
    res.render('index', {
      title: '食堂点餐',
      entry: 'patient_order',
      openId: config.pcDebug.debugPatientOpenId,
      hospitalId: config.pcDebug.debugHospitalId,
      departmentId: config.pcDebug.debugDeptId,
      originPath: originPath
    });
    return;
  }

  wechatPatientController.getAccessUserOpenId(req.query.code)
    .then(ret => {
      console.log("access user openid is: " + ret);

      patientController.isPatientExist(ret)
        .then(p => {
          if (p && p.hospitalId) {
            console.log("The patient exists: " + p);
            res.render('index', {
              title: '食堂点餐',
              entry: 'patient_order',
              openId: ret,
              hospitalId: p.hospitalId,
              departmentId: p.departmentId,
              originPath: originPath
            });
          }
          else {
           res.render('index', {
            title: '小不点云点餐',
            entry: 'patient_no_setting',
            openId: ret,
            hospitalId: '',
            departmentId: '',
            originPath: originPath
            });
          }
        });
  });
});

router.get('/patientMyOrder', (req, res) => {
  console.log('---------------------------patientMyOrder query: ' + JSON.stringify(req.query));
  const originPath = req.query.originPath || '';
  var ua = req.get('User-Agent');

  if (config.pcDebug.debug == 1 && !accessFromWechat(ua)) {
    console.log("It's PC debug mode.");
    res.render('index', {
      title: '我的订单',
      entry: 'patient_my_order',
      openId: config.pcDebug.debugPatientOpenId,
      hospitalId: config.pcDebug.debugHospitalId,
      departmentId: config.pcDebug.debugDeptId,
      originPath: originPath
    });
    return;
  }

  wechatPatientController.getAccessUserOpenId(req.query.code)
    .then(ret => {
      console.log("access user openid is: " + ret);

      patientController.isPatientExist(ret)
        .then(p => {
          if (p && p.hospitalId) {
            console.log("The patient exists: " + p);
            res.render('index', {
              title: '我的订单',
              entry: 'patient_my_order',
              openId: ret,
              hospitalId: p.hospitalId,
              departmentId: p.departmentId,
              originPath: originPath
            });
          }
          else {
           res.render('index', {
            title: '小不点云点餐',
            entry: 'patient_no_setting',
            openId: ret,
            hospitalId: '',
            departmentId: '',
            originPath: originPath
            });
          }
        });
  });
});
router.get('/patientReadme', (req, res) => {
  console.log('---------------------------patientReadme');
  const originPath = req.query.originPath || '';
  var ua = req.get('User-Agent');

  if (config.pcDebug.debug == 1 && !accessFromWechat(ua)) {
    console.log("It's PC debug mode.");
    res.render('index', {
      title: '点餐须知',
      entry: 'patient_read_me',
      openId: config.pcDebug.debugPatientOpenId,
      hospitalId: config.pcDebug.debugHospitalId,
      departmentId: config.pcDebug.debugDeptId,
      originPath: originPath
    });
    return;
  }

  wechatPatientController.getAccessUserOpenId(req.query.code)
    .then(ret => {
      console.log("access user openid is: " + ret);

      patientController.isPatientExist(ret)
        .then(p => {
          if (p && p.hospitalId) {
            console.log("The patient exists: " + p);
            res.render('index', {
              title: '点餐须知',
              entry: 'patient_read_me',
              openId: ret,
              hospitalId: p.hospitalId,
              departmentId: p.departmentId,
              originPath: originPath
            });
          }
          else {
           res.render('index', {
            title: '小不点云点餐',
            entry: 'patient_no_setting',
            openId: ret,
            hospitalId: '',
            departmentId: '',
            originPath: originPath
            });
          }
        });
  });
});

var wxconfigPatient = {
  token: config.wechatPatient.token,
  appid: config.wechatPatient.appId,
  encodingAESKey: ""
};

var wxconfigHospital = {
  token: config.wechatHospital.token,
  appid: config.wechatHospital.appId,
  encodingAESKey: ""
};

//API路由
router.use('/api/orders', orderRoutes);
router.use('/api/menu', menuRoutes);
router.use('/api/hospital', hospitalRoutes);
router.use('/api/wechat/hospital/interface', wechat(wxconfigHospital, wechatHospitalController.all));
router.use('/api/wechat/patient/interface', wechat(wxconfigPatient, wechatPatientController.all));
router.use('/api/patient', patientRoutes);

module.exports = router;
