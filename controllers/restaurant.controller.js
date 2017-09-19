const request = require('request');
const Restaurant = require('../models/restaurant.model');
const Managers = require('../models/restaurant-managers.model');
const wechatRestaurant = require('./wechat-restaurant.controller');
const wechatCustomer = require('./wechat-customer.controller');
const Util = require('./utils');
const ERR_CODE = require('./constant');

// 环境变量
const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production' ? true : false;

//  APP 配置
const config = isProd ? require('../config.prod')
                      : require('../config');

function create(req, res, next) {
  const { openId, restaurantName, contactName, contactPhone } = req.body;
  var createrOpenId = openId;

  const restaurant = new Restaurant({
    createrOpenId,
    restaurantName,
    contactName,
    contactPhone
  });
  console.log("create restaurant here.");

  Restaurant.get({'restaurantName': restaurantName})
    .then(createdOne => {
        if (createdOne) {
          console.log("The restaurant: " + restaurantName + " exists.");
          res.json({
            success: false,
            errMsg: "您创建的餐馆名称已存在，请重新取一个名称！",
            errCode: ERR_CODE.RESTAURANT_ALREADY_EXIST
          });
          return;
        }

        restaurant.save()
          .then(newRestaurant => {
              var restaurantId = newRestaurant._id;

              Managers.get({'openId': openId}).then (mgr => {
                if (mgr) {
                  // 管理员进来的入口有：
                  // 1. 通过餐馆的邀请二维码，直接扫描关注公众号后成为相应餐馆的管理员；
                  // 2. 通过搜索公众号关注，如果此微信号是一个新的关注者，会走餐馆开通流程；
                  // 3. 通过邀请渠道二维码，如果此微信号是一个新的关注者，会走餐馆开通流程；
                  // 管理员都是在用户扫码关注的时候创建的，这里只要更新对应信息即可；
                  Managers.updateOne(openId, {
                    superManager: 1,
                    disabled: 0,
                    restaurantId: restaurantId
                  }).then(mgr => {
                    res.json({
                      success: true,
                      data: newRestaurant
                    });
                  })
                  .catch(e => next(e));
                }
                else {
                  // Manager doens't exist, create a new one.
                  wechatRestaurant.createManager(openId, restaurantId, 1);
                  res.json({
                    success: true,
                    data: {'_id': newRestaurant._id}
                  });
                }
              })
              .catch(e => next(e));
          })
          .catch(e => next(e));
      });
}

function isManagerExist(openId) {
  return Managers.findOne({'openId': openId});
}

function getRestaurantDetails(req, res, next) {
  const { restaurantId } = req.query;

  console.log("restaurantId: " + restaurantId);
  if (!restaurantId) {
    res.json({
      success: false,
      errMsg: "无效的参数！",
      errCode: ERR_CODE.INVALID_PARAMETERS
    });

    return;
  }

  Restaurant.get({'_id': restaurantId})
    .then(rest => {
        if (rest) {
          console.log(rest);
          Managers.get({
            'restaurantId': restaurantId
          }).then(mgr => {
            if (mgr) {
              var data = {
                'restaurantName': rest.restaurantName,
                'desks': rest.desks,
                'isSuperManager': mgr.superManager
              };

              // Get all managers
              Managers.list({
                'restaurantId': restaurantId,
                'disabled': 0
              }).then(mgrs => {
                if (mgrs) {
                  var list = [];

                  for (var i = 0, len = mgrs.length; i < len; i++) {
                    list.push({
                      'nickName': mgrs[i].nickName,
                      'remarkName': mgrs[i].remarkName,
                      'openId': mgrs[i].openId
                    });
                  }

                  data.managers = list;
                  res.json({
                    success: true,
                    data: data
                  });
                }
                else {
                  res.json({
                    success: false,
                    errMsg: "此餐馆没有管理员！",
                    errCode: ERR_CODE.NO_MANAGERS_IN_RESTAURANT
                  });
                }
              })
              .catch(e => next(e));
            }
            else {
              res.json({
                success: false,
                errMsg: "此餐馆不存在这个管理员！",
                errCode: ERR_CODE.MANAGER_NOT_BELONGED_TO_RESTAURANT
              });
            }
          })
          .catch(e => next(e));       
        }
        else {
          res.json({
            success: false,
            errMsg: "此餐馆不存在！",
            errCode: ERR_CODE.RESTAURANT_NOT_EXIST
          });
        }
    })
    .catch(e => next(e));
}

function getRestaurantQrCode(req, res, next) {
  const { restaurantId, openId } = req.query;

  console.log("getRestaurantQrCode restaurantId: " + restaurantId + " openId: " + openId);
  Managers.get({
    'restaurantId': restaurantId,
    'openId': openId
  }).then(mgr => {
    if (mgr) {
        console.log(mgr);
        var data = {
          'restaurantId': restaurantId,
          'openId': openId
        };

        var refreshQrCode = 0;
        if (!mgr.restaurantQrCode) {
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
          wechatRestaurant.getRestaurantQrCode(restaurantId, openId)
            .then(result => {
              if (result) {
                data.restaurantQrCode = result.urlQrCode;

                res.json({
                  success: true,
                  data: data
                });

                Managers.updateOne(openId, {
                  'restaurantQrCode': result.urlQrCode,
                  'qrCodeExpireDate': result.expireDate
                });
              }
            });
        }
        else {
          data.restaurantQrCode = mgr.restaurantQrCode;
          res.json({
            success: true,
            data: data
          }); 
        }     
    }
    else {
      res.json({
        success: false,
        errMsg: "此管理员不存在！",
        errCode: ERR_CODE.MANAGER_NOT_EXIST
      })
    }

    })
    .catch(e => next(e)); 
}

function addDesk(req, res, next) {
  var restaurantId = req.params.restaurantId;
  var data = req.body;

  console.log("restaurantId: " + restaurantId);

  Restaurant.get({'_id': restaurantId})
    .then(rest => {
      if (rest) {
        console.log(rest);
        var deskList = rest.desks;
        var i;
        var len;

        for (i = 0, len = deskList.length; i < len; i++) {
          if (data.deskName == deskList[i].name) {
            break;
          }
        }

        if (i < len) {
          console.log("department " + data.deskName + " 已存在");
          res.json({
            success: false,
            errMsg: "您输入的餐桌名已存在！",
            errCode: ERR_CODE.DESK_NAME_ALREADY_EXIST
          });

          return;     
        }

        deskList.push({'name': data.deskName, 'manager': ""});

        Restaurant.updateOne(restaurantId, {'desks': deskList})
          .then(result => {
              Restaurant.get({'_id': restaurantId})
                .then(rest => {
                  var deskList = rest.desks;
                  var i;
                  var len;

                  for (i = 0, len = deskList.length; i < len; i++) {
                    if (data.deskName == deskList[i].name) {
                      break;
                    }
                  }

                  if (i == len) {
                    res.json({
                      success: false,
                      errMsg: "餐桌创建失败！",
                      errCode: ERR_CODE.DESK_CREATE_FAILED
                    });

                    return;                    
                  }

                  if (i < len) {
                    wechatRestaurant.getDeskQrCode(restaurantId, deskList[i]._id)
                    .then(result => {

                        console.log("Wechat Qr Code URL for restaurant: " + result.urlQrCode);

                        deskList[i].qrCodeRestaurant = result.urlQrCode;
                        wechatCustomer.getDeskQrCode(restaurantId, deskList[i]._id)
                        .then(ret => {
                          var tick = ret.urlQrCode;
                          deskList[i].qrCodeCustomer = tick;

                          console.log("Wechat Qr Code URL for customer: " + deskList[i].qrCodeCustomer);

                          Restaurant.updateOne(restaurantId, {'desks': deskList})
                          .then(rest => {
                              res.json({
                                success: true
                            });                          
                          })
                          .catch(e => next(e));
                        })
                    });
                  }          
                });
          })
          .catch(e => next(e)); 
      }
      else {
          res.json({
            success: false,
            errMsg: "餐桌ID不存在！",
            errCode: ERR_CODE.INVALID_PARAMETERS
          });
      }       
    })
    .catch(e => next(e));
}

function updateRestaurant(req, res, next) {
  var restaurantId = req.params.restaurantId;
  var data = req.body;

  console.log("restaurantId: " + restaurantId + " new name: " + data.restaurantName);
  Restaurant.get({'restaurantName': data.restaurantName})
    .then(result => {
      if (result) {
        console.log("The restaurant name exists.");
        res.json({
          success: false,
          errMsg: "指定的餐馆名称已存在！",
          errCode: ERR_CODE.RESTAURANT_ALREADY_EXIST
        })

        return;
      }

      Restaurant.updateOne(restaurantId, data)
        .then(newHospital => {
            res.json({
              success: true
            });
        })
        .catch(e => next(e));      
    });
}

function editDesk(req, res, next) {
  var restaurantId = req.params.restaurantId;
  var deskId = req.body.deskId;
  var oldDeskName = req.body.oldDeskName;
  var newDeskName = req.body.newDeskName;

  console.log("restaurantId: " + restaurantId);
  console.log("deskId: " + deskId);
  console.log("old desk name: " + oldDeskName);
  console.log("new desk name: " + newDeskName);

  Restaurant.get({'_id': restaurantId})
    .then(rest => {
        console.log(rest);
        var deskList = rest.desks;
        var i;
        var len;

        for (i = 0, len = deskList.length; i < len; i++) {
          console.log("dept name: " + deskList[i].name);
          if (newDeskName == deskList[i].name) {
            console.log("The new desk name exists.");
            res.json({
              success: false,
              errMsg: "指定的餐桌名称已存在！",
              errCode: ERR_CODE.DESK_NAME_ALREADY_EXIST
            });
            return;
          }
        }

        for (i = 0, len = deskList.length; i < len; i++) {
          console.log("desk id: " + deskList[i]._id);
          if (deskId == deskList[i]._id) {
            deskList[i].name = newDeskName;
            break;
          }
        }

        console.log("index i: " + i + " length: " + len);

        if (i < len) {
          console.log("Updated desk name: " + newDeskName);
           Restaurant.updateOne(restaurantId, {'desks': deskList})
            .then(newHospital => {
                res.json({
                  success: true
                });
            })
            .catch(e => next(e));           
        }
        else {
          res.json({
            success: false,
            errMsg: "无效的参数，餐桌ID不存在！",
            errCode: ERR_CODE.INVALID_PARAMETERS
        });
      }
    })
    .catch(e => next(e));
}

function remarkManagerName(req, res, next) {
  var restaurantId = req.params.restaurantId;
  var openIdManager = req.body.openIdManager;
  var remarkName = req.body.newRemarkName;

  console.log("body: " + JSON.stringify(req.body));
  console.log("restaurantId: " + restaurantId);
  console.log("manager openid: " + openIdManager);

  Managers.updateOne(openIdManager, {
    'remarkName': remarkName
  }).then(mgr => {
     res.json({
      success: true
    });
  })
  .catch(e => next(e));
}

function unbindManager(req, res, next) {
  var restaurantId = req.params.restaurantId;
  var openIdManager = req.body.openIdManager;

  console.log("body: " + JSON.stringify(req.body));
  console.log("restaurantId: " + restaurantId);
  console.log("manager openid: " + openIdManager);

  Managers.get({
    'openId': openIdManager,
    'restaurantId': restaurantId,
    'superManager': 1
  }).then(mgr => {
    if (mgr) {
       res.json({
        success: false,
        errMsg: "您正在解绑餐馆超级管理员，请先转移超管权限！",
        errCode: ERR_CODE.UNBIND_SUPPER_MANAGER_NOT_ALLOWED
      });

      return;     
    }

    Restaurant.get({
      '_id': restaurantId
    }).then(rest => {
      if (rest) {

        Managers.updateOne(openIdManager, {
          disabled: 1
        }).then(mgr => {
          if (mgr) {
            res.json({
              success: true
            });

            wechatRestaurant.sendMessage(openIdManager, {
              'restaurantName': rest.restaurantName
            });
          }
        })
        .catch(e => next(e));
      }
      else {
        res.json({
          success: false,
          errMsg: "此医院不存在！",
          errCode: ERR_CODE.RESTAURANT_NOT_EXIST
        });
      }
    })
    .catch(e => next(e));
  });
}

function getManagers(req, res, next) {
  const { restaurantId } = req.query;

  console.log("getManagers restaurantId: " + restaurantId);
  Managers.list({
    'restaurantId': restaurantId
  }).then(mgrs => {
      if (mgrs) {
        console.log(mgrs);
        res.json({
          success: true,
          page: { current: 1, total: mgrs.length },
          data: mgrs
        });       
      }
      else {
        res.json({
          success: false,
          errMsg: "此医院不存在任何管理员！",
          errCode: ERR_CODE.NO_MANAGERS_IN_RESTAURANT
        });
      }
    })
    .catch(e => next(e));  
}

function authManager(req, res, next) {
  var restaurantId = req.params.restaurantId;
  var fromOpenId = req.body.fromOpenId;
  var toOpenId = req.body.toOpenId;

  console.log("restaurantId: " + restaurantId + " fromOpenId: " + fromOpenId + " toOpenId: " + toOpenId);

  Managers.get({
    'restaurantId': restaurantId,
    'openId': toOpenId
  }).then(mgr => {
    if (mgr) {
      Managers.updateOne(toOpenId, {
        'superManager': 1
      }).then(result => {
        console.log(result);
        if (result.ok == 1) {
          Managers.updateOne(fromOpenId, {
            'superManager': 0
          }).then(result => {
            if (result.ok == 1) {
              res.json({
                success: true,
                data: result
              });
            }
            else {
              res.json({
                success: false,
                errCode: ERR_CODE.AUTH_MANAGER_FAILED,
                errMsg: "授权管理员失败"
              });
            }
          })
        }
        else {
          res.json({
            success: false,
            errCode: ERR_CODE.AUTH_MANAGER_FAILED,
            errMsg: "授权管理员失败"
          });
        }
      })
      .catch(e => next(e));
    }
    else {
      res.json({
        success: false,
        errMsg: "目标管理员不存在！",
        errCode: ERR_CODE.MANAGER_NOT_EXIST
      });
    }
  })
  .catch(e => next(e));
}

function getRestaurantName(req, res, next) {
  const { restaurantId } = req.query;

  console.log("restaurantId: " + restaurantId);
  if (!restaurantId) {
    res.json({
      success: false,
      errMsg: "无效的参数！",
      errCode: ERR_CODE.INVALID_PARAMETERS
    });

    return;
  }

  Restaurant.get({'_id': restaurantId})
    .then(rest => {
        if (rest) {
          console.log(rest);
          var data = {
            'restaurantName': rest.restaurantName
          };
          
          res.json({
            success: true,
            data: data
          });
        }
        else {
          res.json({
            success: false,
            errMsg: "此餐馆不存在！",
            errCode: ERR_CODE.RESTAURANT_NOT_EXIST
          });
        }
    })
    .catch(e => next(e));  
}

module.exports = {
  create,
  isManagerExist,
  getRestaurantDetails,
  getRestaurantQrCode,
  addDesk,
  updateRestaurant,
  editDesk,
  remarkManagerName,
  unbindManager,
  getManagers,
  authManager,
  getRestaurantName,
};
