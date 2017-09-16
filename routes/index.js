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

const restaurantRoutes = require('./restaurant.route');
const restaurantController = require('../controllers/restaurant.controller');
const wechatRestaurantController = require('../controllers/wechat-restaurant.controller');
const wechatCustomerController = require('../controllers/wechat-customer.controller');
const restaurantMenuRoutes = require('./restaurant.menu.route');
const customerController = require('../controllers/customer.controller');
const qiniuRoutes = require('./qiniu.route');
const customerRoutes = require('./customer.route');
const restaurantOrders = require('./restaurant.order.route');

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
      restaurantId: '',
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
          if (mgr && mgr.hospitalId && (mgr.disabled == 0)) {
            console.log("The manager exists: " + mgr);
            res.render('index', {
              title: '订单管理',
              entry: 'hospital_order',
              openId: ret,
              hospitalId: mgr.hospitalId,
              restaurantId: '',
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
            restaurantId: '',
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
      restaurantId: '',
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
          if (mgr && mgr.hospitalId && (mgr.disabled == 0)) {
            console.log("The manager exists: " + mgr);
            res.render('index', {
              title: '膳食菜谱',
              entry: 'hospital_menu_setting',
              openId: ret,
              hospitalId: mgr.hospitalId,
              restaurantId: '',
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
            restaurantId: '',
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
      restaurantId: '',
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
          if (mgr && mgr.hospitalId && (mgr.disabled == 0)) {
            console.log("The manager exists: " + mgr);
            res.render('index', {
              title: '医院设置',
              entry: 'hospital_setting',
              openId: ret,
              hospitalId: mgr.hospitalId,
              restaurantId: '',
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
            restaurantId: '',
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
      restaurantId: '',
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
              restaurantId: '',
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
            restaurantId: '',
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
      restaurantId: '',
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
              restaurantId: '',
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
            restaurantId: '',
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
      restaurantId: '',
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
              restaurantId: '',
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
            restaurantId: '',
            departmentId: '',
            originPath: originPath
            });
          }
        });
  });
});


// -------------餐馆端--------------
router.get('/restaurantSetting', (req, res) => {
  console.log('---------------------------restaurantSetting');
  const originPath = req.query.originPath || '';
  var ua = req.get('User-Agent');

  if (config.pcDebug.debug == 1 && !accessFromWechat(ua)) {
    console.log("It's PC debug mode.");
    restaurantController.isManagerExist(config.pcDebug.debugManagerOpenId)
      .then(mgr => {
        if (mgr && mgr.restaurantId && (mgr.disabled == 0)) {
            res.render('index', {
              title: '餐馆设置',
              entry: 'restaurant_setting',
              openId: config.pcDebug.debugManagerOpenId,
              restaurantId: config.pcDebug.debugRestaurantId,
              hospitalId: '',
              departmentId: '',
              originPath: originPath
            });         
        }
        else {
          res.render('index', {
            title: '小不点云点餐',
            entry: 'restaurant_no_setting',
            openId: config.pcDebug.debugManagerOpenId,
            restaurantId: '',
            hospitalId: '',
            departmentId: '',
            originPath: originPath
          });          
        }
      });

    return;
  }

  wechatRestaurantController.getAccessUserOpenId(req.query.code)
    .then(ret => {
      console.log("access user openid is: " + ret);

      restaurantController.isManagerExist(ret)
        .then(mgr => {
          if (mgr && mgr.restaurantId && (mgr.disabled == 0)) {
            console.log("The manager exists: " + mgr);
            res.render('index', {
              title: '餐馆设置',
              entry: 'restaurant_setting',
              openId: ret,
              restaurantId: mgr.restaurantId,
              hospitalId: '',
              departmentId: '',
              originPath: originPath
            });
          }
          else {
           res.render('index', {
            title: '小不点云点餐',
            entry: 'restaurant_no_setting',
            openId: ret,
            restaurantId: '',
            hospitalId: '',
            departmentId: '',
            originPath: originPath
            });
          }
        });
  });
});

router.get('/restaurantMenuSetting', (req, res) => {
  console.log('---------------------------restaurantMenuSetting query: ' + JSON.stringify(req.query));
  const originPath = req.query.originPath || '';
  var ua = req.get('User-Agent');

  if (config.pcDebug.debug == 1 && !accessFromWechat(ua)) {
    console.log("It's PC debug mode.");
    restaurantController.isManagerExist(config.pcDebug.debugManagerOpenId)
      .then(mgr => {
        if (mgr && mgr.restaurantId && (mgr.disabled == 0)) {
          res.render('index', {
            title: '菜单设置',
            entry: 'restaurant_menu_setting',
            openId: config.pcDebug.debugManagerOpenId,
            restaurantId: config.pcDebug.debugRestaurantId,
            hospitalId: '',
            departmentId: '',
            originPath: originPath
          });          
        }
        else {
          res.render('index', {
            title: '小不点云点餐',
            entry: 'restaurant_no_setting',
            openId: config.pcDebug.debugManagerOpenId,
            restaurantId: '',
            hospitalId: '',
            departmentId: '',
            originPath: originPath
          });          
        }
      });
    return;
  }

  wechatRestaurantController.getAccessUserOpenId(req.query.code)
    .then(ret => {
      console.log("access user openid is: " + ret);

      restaurantController.isManagerExist(ret)
        .then(mgr => {
          if (mgr && mgr.restaurantId && (mgr.disabled == 0)) {
            console.log("The manager exists: " + mgr);
            res.render('index', {
              title: '菜单设置',
              entry: 'restaurant_menu_setting',
              openId: ret,
              restaurantId: mgr.restaurantId,
              hospitalId: '',
              departmentId: '',
              originPath: originPath
            });
          }
          else {
           res.render('index', {
            title: '小不点云点餐',
            entry: 'restaurant_no_setting',
            openId: ret,
            restaurantId: '',
            hospitalId: '',
            departmentId: '',
            originPath: originPath
            });
          }
        });
  });
});

router.get('/restaurantOrder', (req, res) => {
  console.log('---------------------------restaurantOrder');
  const originPath = req.query.originPath || '';
  var ua = req.get('User-Agent');

  if (config.pcDebug.debug == 1 && !accessFromWechat(ua)) {
    console.log("It's PC debug mode.");
    res.render('index', {
      title: '订单管理',
      entry: 'restaurant_order',
      openId: config.pcDebug.debugManagerOpenId,
      restaurantId: config.pcDebug.debugRestaurantId,
      hospitalId: '',
      departmentId: '',
      originPath: originPath
    });
    return;
  }

  wechatRestaurantController.getAccessUserOpenId(req.query.code)
    .then(ret => {
      console.log("access user openid is: " + ret);

      restaurantController.isManagerExist(ret)
        .then(mgr => {
          if (mgr && mgr.restaurantId && (mgr.disabled == 0)) {
            console.log("The manager exists: " + mgr);
            res.render('index', {
              title: '订单管理',
              entry: 'restaurant_order',
              openId: ret,
              restaurantId: mgr.restaurantId,
              hospitalId: '',
              restaurantId: '',
              departmentId: '',
              originPath: originPath
            });
          }
          else {
           res.render('index', {
            title: '小不点云点餐',
            entry: 'restaurant_no_setting',
            openId: ret,
            hospitalId: '',
            restaurantId: '',
            departmentId: '',
            originPath: originPath
            });
          }
        });
  });
});

// -------------餐馆客户端--------------

router.get('/customerOnlineOrder', (req, res) => {
  console.log('---------------------------customerOnlineOrder');
  const originPath = req.query.originPath || '';
  var ua = req.get('User-Agent');

  if (config.pcDebug.debug == 1 && !accessFromWechat(ua)) {
    console.log("It's PC debug mode.");
    res.render('index', {
      title: '在线点餐',
      entry: 'customer_online_order',
      openId: config.pcDebug.debugCustomerOpenId,
      restaurantId: config.pcDebug.debugRestaurantId,
      hospitalId: '',
      departmentId: '',
      originPath: originPath
    });
    return;
  }

  wechatCustomerController.getAccessUserOpenId(req.query.code)
    .then(ret => {
      console.log("access user openid is: " + ret);

      customerController.isCustomerExist(ret)
        .then(p => {
          if (p && p.restaurantId) {
            console.log("The customer exists: " + p);
            res.render('index', {
              title: '在线点餐',
              entry: 'customer_online_order',
              openId: ret,
              restaurantId: p.restaurantId,
              hospitalId: '',
              departmentId: '',
              originPath: originPath
            });
          }
          else {
           res.render('index', {
            title: '小不点云点餐',
            entry: 'customer_no_setting',
            openId: ret,
            restaurantId: '',
            hospitalId: '',
            departmentId: '',
            originPath: originPath
            });
          }
        });
  });
});

router.get('/customerMyOrder', (req, res) => {
  console.log('---------------------------customerMyOrder query: ' + JSON.stringify(req.query));
  const originPath = req.query.originPath || '';
  var ua = req.get('User-Agent');

  if (config.pcDebug.debug == 1 && !accessFromWechat(ua)) {
    console.log("It's PC debug mode.");
    res.render('index', {
      title: '我的订单',
      entry: 'customer_my_order',
      openId: config.pcDebug.debugCustomerOpenId,
      restaurantId: config.pcDebug.debugRestaurantId,
      hospitalId: '',
      departmentId: '',
      originPath: originPath
    });
    return;
  }

  wechatCustomerController.getAccessUserOpenId(req.query.code)
    .then(ret => {
      console.log("access user openid is: " + ret);

      customerController.isCustomerExist(ret)
        .then(p => {
          if (p && p.restaurantId) {
            console.log("The customer exists: " + p);
            res.render('index', {
              title: '我的订单',
              entry: 'customer_my_order',
              openId: ret,
              restaurantId: p.restaurantId,
              hospitalId: '',
              departmentId: '',
              originPath: originPath
            });
          }
          else {
           res.render('index', {
            title: '小不点云点餐',
            entry: 'customer_no_setting',
            openId: ret,
            restaurantId: '',
            hospitalId: '',
            departmentId: '',
            originPath: originPath
            });
          }
        });
  });
});

router.get('/customerReadme', (req, res) => {
  console.log('---------------------------customerReadme');
  const originPath = req.query.originPath || '';
  var ua = req.get('User-Agent');

  if (config.pcDebug.debug == 1 && !accessFromWechat(ua)) {
    console.log("It's PC debug mode.");
    res.render('index', {
      title: '点餐须知',
      entry: 'customer_read_me',
      openId: config.pcDebug.debugCustomerOpenId,
      restaurantId: config.pcDebug.debugRestaurantId,
      hospitalId: '',
      departmentId: '',
      originPath: originPath
    });
    return;
  }

  wechatCustomerController.getAccessUserOpenId(req.query.code)
    .then(ret => {
      console.log("access user openid is: " + ret);

      customerController.isCustomerExist(ret)
        .then(p => {
          if (p && p.restaurantId) {
            console.log("The customer exists: " + p);
            res.render('index', {
              title: '点餐须知',
              entry: 'customer_read_me',
              openId: ret,
              restaurantId: p.restaurantId,
              hospitalId: '',
              departmentId: '',
              originPath: originPath
            });
          }
          else {
           res.render('index', {
            title: '小不点云点餐',
            entry: 'customer_no_setting',
            openId: ret,
            hospitalId: '',
            restaurantId: '',
            departmentId: '',
            originPath: originPath
            });
          }
        });
  });
});


//API路由
if (config.mode == 1) {
  // restaurant mode
  var wxconfigRestaurant = {
    token: config.wechatRestaurant.token,
    appid: config.wechatRestaurant.appId,
    encodingAESKey: ""  
  };

  var wxconfigCustomer = {
    token: config.wechatCustomer.token,
    appid: config.wechatCustomer.appId,
    encodingAESKey: ""  
  };

  router.use('/api/restaurant', restaurantRoutes);
  router.use('/api/wechat/restaurant/interface', wechat(wxconfigRestaurant, wechatRestaurantController.all));
  router.use('/api/wechat/customer/interface', wechat(wxconfigCustomer, wechatCustomerController.all));
  router.use('/api/menu', restaurantMenuRoutes);
  router.use('/api/qiniu', qiniuRoutes);
  router.use('/api/customer', customerRoutes);
  router.use('/api/orders', restaurantOrders);
}
else if (config.mode == 0) {
  // hospital mode
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

  router.use('/api/orders', orderRoutes);
  router.use('/api/menu', menuRoutes);
  router.use('/api/hospital', hospitalRoutes);
  router.use('/api/wechat/hospital/interface', wechat(wxconfigHospital, wechatHospitalController.all));
  router.use('/api/wechat/patient/interface', wechat(wxconfigPatient, wechatPatientController.all));
  router.use('/api/patient', patientRoutes);
}


module.exports = router;
