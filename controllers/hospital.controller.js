const request = require('request');
const Hospital = require('../models/hospital.model');
const Managers = require('../models/hospital-managers.model');
const wechatHospital = require('./wechat-hospital.controller');
const wechatPatient = require('./wechat-patient.controller');
const Util = require('./utils');

// 环境变量
const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production' ? true : false;

//  APP 配置
const config = isProd ? require('../config.prod')
                      : require('../config');

function create(req, res, next) {
  const { openId, hospitalName, contactName, contactPhone } = req.body;

  const hospital = new Hospital({
    openId,
    hospitalName,
    contactName,
    contactPhone
  });
  console.log("create hospital here.");

  Hospital.findOne({'hospitalName': hospitalName})
    .exec()
    .then(createdOne => {
        if (createdOne) {
          console.log("The hospital: " + hospitalName + " exists.");
          res.json({
            success: false,
            message: "您创建的医院已存在！"
          });
          return;
        }

        hospital.save()
          .then(newHospital => {
              var hospitalId = newHospital._id;

              Managers.updateOne(openId, {
                superManager: 1,
                hospitalId: hospitalId
              }).then(mgr => {
                res.json({
                  success: true,
                  data: newHospital
                });
              })
              .catch(e => next(e));
          })
          .catch(e => next(e));
      });
}

function findOne(req, res, next) {
  const { hospitalId } = req.query;

  console.log("hospitalId: " + hospitalId);
  Hospital.get({'_id': hospitalId})
    .then(hosp => {
        console.log(hosp);
        res.json({
          success: true,
          page: { current: 1, total: hosp.length },
          data: hosp
        });
    })
    .catch(e => next(e));
}

function getDeptList(req, res, next) {
  const { hospitalId } = req.query;

  Hospital.get({'_id': hospitalId})
    .then(hosp => {
        if (hosp) {
          console.log(hosp);
          var data = {
            departments: hosp.departments
          };
          res.json({
            success: true,
            page: { current: 1, total: hosp.length },
            data: data
          });          
        }
        else {
          res.json({
            success: false,
            errMsg: "该医院不存在！"
          })
        }
    })
    .catch(e => next(e));
}

function getManagers(req, res, next) {
  const { hospitalId } = req.query;

  console.log("getManagers hospitalId: " + hospitalId);
  Managers.list({
    'hospitalId': hospitalId
  }).then(mgrs => {
        console.log(mgrs);
        res.json({
          success: true,
          page: { current: 1, total: mgrs.length },
          data: mgrs
        });
    })
    .catch(e => next(e));  
}

function getHospitalQrCode(req, res, next) {
  const { hospitalId, openId } = req.query;

  console.log("getHospitalQrCode hospitalId: " + hospitalId + " openId: " + openId);
  Managers.get({
    'hospitalId': hospitalId,
    'openId': openId
  }).then(mgr => {
    if (mgr) {
        console.log(mgr);
        var data = {
          'hospitalId': hospitalId,
          'openId': openId
        };

        var refreshQrCode = 0;
        if (!mgr.hospitalQrCode) {
          refreshQrCode = 1;
        }
        if (mgr.qrCodeExpireDate) {
          var qrCodeExpireDate = new Date(mgr.qrCodeExpireDate);
          var today = new Date();

          if (today >= qrCodeExpireDate) {
            refreshQrCode = 1;
          }
        }
        if (refreshQrCode) {
          wechatHospital.getHospitalQrCode(hospitalId, openId)
            .then(result => {
              if (result) {
                data.hospitalQrCode = result.urlQrCode;

                res.json({
                  success: true,
                  data: data
                });

                Managers.updateOne(openId, {
                  'hospitalQrCode': result.urlQrCode,
                  'qrCodeExpireDate': result.expireDate
                });
              }
            });
        }
        else {
          data.hospitalQrCode = mgr.hospitalQrCode;
          res.json({
            success: true,
            data: data
          }); 
        }     
    }
    else {
      res.json({
        success: false,
        errMsg: "此管理员不存在！"
      })
    }

    })
    .catch(e => next(e)); 
}

function update(req, res, next) {
  var hospitalId = req.params.hospitalId;
  var data = req.body;

  console.log("hospitalId: " + hospitalId);

  Hospital.updateOne(hospitalId, data)
    .then(newHospital => {
        res.json({
          success: true,
          page: { current: 1, total: newHospital.length },
          data: newHospital
        });
    })
    .catch(e => next(e));
}

function addDepartment(req, res, next) {
  var hospitalId = req.params.hospitalId;
  var data = req.body;

  console.log("hospitalId: " + hospitalId);

  Hospital.get({'_id': hospitalId})
    .then(hosp => {
        console.log(hosp);
        var deptList = hosp.departments;
        var i;
        var len;

        for (i = 0, len = deptList.length; i < len; i++) {
          if (data.deptName == deptList[i].name) {
            break;
          }
        }

        if (i < len) {
          console.log("department " + data.deptName + " 已存在");
          res.json({
            success: false,
            errMsg: "您输入的科室病区名已存在！"
          });

          return;     
        }

        deptList.push({'name': data.deptName, 'manager': ""});

        Hospital.updateOne(hospitalId, {'departments': deptList})
          .then(newHospital => {
              Hospital.get({'_id': hospitalId})
                .then(hosp => {
                  var deptList = hosp.departments;
                  var i;
                  var len;

                  for (i = 0, len = deptList.length; i < len; i++) {
                    if (data.deptName == deptList[i].name) {
                      break;
                    }
                  }

                  if (i == len) {
                    res.json({
                      success: false,
                      errMsg: "科室病区创建失败！"
                    });

                    return;                    
                  }

                  if (i < len) {
                    wechatHospital.getDeptQrCode(hospitalId, deptList[i]._id)
                    .then(result => {

                        console.log("Wechat Qr Code URL for hospital: " + result.urlQrCode);

                        deptList[i].qrCodeHospital = result.urlQrCode;
                        wechatPatient.getDeptQrCode(hospitalId, deptList[i]._id)
                        .then(ret => {
                          var tick = ret.urlQrCode;
                          deptList[i].qrCodePatient = tick;

                          console.log("Wechat Qr Code URL for patient: " + deptList[i].qrCodePatient);

                          Hospital.updateOne(hospitalId, {'departments': deptList})
                          .then(hosp => {
                              res.json({
                                success: true,
                                page: { current: 1, total: hosp.length },
                                data: hosp
                            });                          
                          })
                          .catch(e => next(e));
                        })
                    });
                  }          
                });
          })
          .catch(e => next(e));        
    })
    .catch(e => next(e));
}

function editDepartment(req, res, next) {
  var hospitalId = req.params.hospitalId;
  var oldDeptName = req.body.oldDeptName;
  var newDeptName = req.body.newDeptName;

  console.log("hospitalId: " + hospitalId);
  console.log("old dept name: " + oldDeptName);
  console.log("new dept name: " + newDeptName);

  Hospital.get({'_id': hospitalId})
    .then(hosp => {
        console.log(hosp);
        var deptList = hosp.departments;
        var i;
        var len;

        for (i = 0, len = deptList.length; i < len; i++) {
          console.log("dept name: " + deptList[i].name);
          if (oldDeptName == deptList[i].name) {

            deptList[i].name = newDeptName;
            break;
          }
        }

        console.log("index i: " + i + " length: " + len);

        if (i < len) {
          console.log("Updated dept name: " + newDeptName);
           Hospital.updateOne(hospitalId, {'departments': deptList})
            .then(newHospital => {
                res.json({
                  success: true,
                  page: { current: 1, total: newHospital.length },
                  data: newHospital
                });
            })
            .catch(e => next(e));           
        }
        else {
          res.json({
            success: false,
            errMsg: "原始的科室病区名不存在！"
        });
        }
      
    })
    .catch(e => next(e));
}

function unbindManager(req, res, next) {
  var hospitalId = req.params.hospitalId;
  var openIdManager = req.body.openIdManager;

  console.log("body: " + JSON.stringify(req.body));
  console.log("hospitalId: " + hospitalId);
  console.log("manager openid: " + openIdManager);

  Managers.updateOne(openIdManager, {
    disabled: 1
  }).then(mgr => {
    if (mgr) {
      res.json({
        success: true,
        page: { current: 1, total: mgr.length },
        data: mgr
      });
    }
    else {
      res.json({
          success: false,
          errMsg: "此管理员不存在！"
      });     
    }
  })
  .catch(e => next(e));
}

function remarkManagerName(req, res, next) {
  var hospitalId = req.params.hospitalId;
  var openIdManager = req.body.openIdManager;
  var remarkName = req.body.newRemarkName;

  console.log("body: " + JSON.stringify(req.body));
  console.log("hospitalId: " + hospitalId);
  console.log("manager openid: " + openIdManager);

  Managers.updateOne(openIdManager, {
    'remarkName': remarkName
  }).then(mgr => {
    if (mgr) {
       res.json({
        success: true,
        page: { current: 1, total: mgr.length },
        data: mgr
      });
    }
    else {
      res.json({
        success: false,
        errMsg: "此管理员不存在！"
      })
    }
  })
  .catch(e => next(e));
}

function updateOrderTime(req, res, next) {
  var hospitalId = req.params.hospitalId;
  var mealType = req.body.mealType;
  var reminderDay = req.body.reminderDay;
  var reminderTime = req.body.reminderTime;
  var shippingTimeStart = req.body.shippingTimeStart;
  var shippingTimeEnd = req.body.shippingTimeEnd;

  console.log("body: " + JSON.stringify(req.body));
  console.log("hospitalId: " + hospitalId);

  Hospital.get({'_id': hospitalId})
    .then(hosp => {
        console.log(hosp);
        var orderTime = hosp.orderTime;

        if (mealType == 0) {
          orderTime.breakfast.reminderDay = reminderDay;
          orderTime.breakfast.reminderTime = reminderTime;
          orderTime.breakfast.shippingStart = shippingTimeStart;
          orderTime.breakfast.shippingEnd = shippingTimeEnd; 
        }
        else if (mealType == 1) {
          orderTime.lunch.reminderDay = reminderDay;
          orderTime.lunch.reminderTime = reminderTime;
          orderTime.lunch.shippingStart = shippingTimeStart;
          orderTime.lunch.shippingEnd = shippingTimeEnd;
        }
        else if (mealType == 2) {
          orderTime.dinner.reminderDay = reminderDay;
          orderTime.dinner.reminderTime = reminderTime;
          orderTime.dinner.shippingStart = shippingTimeStart;
          orderTime.dinner.shippingEnd = shippingTimeEnd;
        }
        else {
          console.log("Invalid meal type: " + mealType);
          res.json({
            success: false,
            errMsg: "无效的参数"
          });
        }

       Hospital.updateOne(hospitalId, {'orderTime': orderTime})
        .then(newHospital => {
            res.json({
              success: true,
              page: { current: 1, total: newHospital.length },
              data: newHospital
            });
        })
        .catch(e => next(e));           
   
    })
    .catch(e => next(e));
}

function isManagerExist(openId) {
  return Managers.findOne({'openId': openId});
}

function getDept(req, res, next) {
  const { hospitalId, departmentId } = req.query;

  console.log("hospitalId: " + hospitalId + " departmentId: " + departmentId);
  Hospital.get({'_id': hospitalId})
    .then(hosp => {
      if (hosp) {
        console.log(hosp);
        var i = 0;
        var len = hosp.departments.length;
        for (i = 0; i < len; i++) {
          if (departmentId == hosp.departments[i]._id) {
            break;
          }
        }

        if (i == len) {
          res.json({
            success: false,
            errMsg: "此科室病区不存在！"
          });
          return;
        }

        var data = {
          'hospitalId': hospitalId,
          'hospitalName': hosp.hospitalName,
          'departmentId': departmentId,
          'departmentName': hosp.departments[i].name,
          'orderTime': hosp.orderTime
        }
        res.json({
          success: true,
          data: data
        });        
      }
      else {
        res.json({
          success: false,
          errMsg: "此医院不存在！"
        });
      }
    })
    .catch(e => next(e));
}

module.exports = {
  create, getDeptList, getManagers, findOne, update, addDepartment, editDepartment, unbindManager, remarkManagerName, updateOrderTime, isManagerExist, getDept, getHospitalQrCode,
};
