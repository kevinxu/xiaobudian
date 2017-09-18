const request = require('request');
const debug = require('debug')('NURSE_TRAIN');
const Orders = require('../models/restaurant.order.model');
const Customer = require('../models/customer.model');
const Restaurant = require('../models/restaurant.model');
const wechatCustomer = require('./wechat-customer.controller');
const ERR_CODE = require('./constant');

// 环境变量
const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production' ? true : false;

//  APP 配置
const config = isProd ? require('../config.prod')
                      : require('../config');

function create(req, res, next) {

  const { openId, restaurantId, deskId, 
          customerName, customerMobile, customerAddr, 
          orderType, totalFee } = req.body;
  console.log("order create: " + JSON.stringify(req.body));
  var data = {};

  if (customerName) {
    data.realName = customerName;
  }
  if (customerMobile) {
    data.mobile = customerMobile;
  }
  if (customerAddr) {
    data.address = customerAddr;
  }

  Customer.updateOne(openId, data);

  var obj = req.body;
  var dishes = [];
  for (var i = 0;; i++) {
    var t1 = "dishes[" + i + "][dishId]";
    var t2 = "dishes[" + i + "][dishType]";
    var t3 = "dishes[" + i + "][dishName]";
    var t4 = "dishes[" + i + "][price]";
    var t5 = "dishes[" + i + "][count]";
    if (t1 in obj && t2 in obj && t3 in obj && t4 in obj && t5 in obj) {
      console.log("has property: " + obj[t1] + " " + obj[t2] + " " + obj[t3] + " " + obj[t4] + " " + obj[t5]);
      var dish = {
        'dishId': obj[t1],
        'dishType': obj[t2],
        'dishName': obj[t3],
        'price': obj[t4],
        'count': obj[t5]
      };
      dishes.push(dish);
    }
    else {
      break;
    }
  }

  Restaurant.get({'_id': restaurantId})
    .then(rest => {
      if (rest) {
        var deskName;
        var restaurantName = rest.restaurantName;

        for (var i = 0, len = rest.desks.length; i < len; i++) {
          if (deskId == rest.desks[i]._id) {
            deskName = rest.desks[i].name;
            break;
          }
        }

        if (i == len) {
          res.json({
            success: false,
            errMsg: "deskId不存在！",
            errCode: ERR_CODE.INVALID_PARAMETERS
          });
          return;      
        }

        var status = 1;
        const order = new Orders({
          openId,
          restaurantId,
          restaurantName,
          deskId,
          orderType,
          deskName,
          customerName,
          customerMobile,
          customerAddr,
          totalFee,
          status,
          dishes
        });

        console.log("create here.");

        order.save()
          .then(ret => {
              console.log("create order: " + JSON.stringify(ret));
              res.json({
                success: true,
                data: ret
              });
          })
          .catch(e => next(e));
      }
      else {
          res.json({
            success: false,
            errMsg: "餐馆不存在！",
            errCode: ERR_CODE.RESTAURANT_NOT_EXIST
          });        
      }
    });
}

function remove(req, res, next) {
  const { catalog } = req;

  catalog.remove()
    .then(oldCatalog => res.json({
      success: true,
      data: oldCatalog
    }))
    .catch(e => next(e));
}

function load(req, res, next, id) {
  Catalog.get(id)
    .then(catalog => {
      req.catalog = catalog;
      return next();
    })
    .catch(e => next(e));
}

function listOrders(req, res, next) {
  const { openId, restaurantId, pageSize, pageNum } = req.query;

  console.log("listOrders, openId: " + openId + " restaurantId: " + restaurantId + " pageSize: " + pageSize + " pageNum: " + pageNum);
  var filter = {};
  if (openId) {
    filter.openId = openId;
  }
  if (restaurantId) {
    filter.restaurantId = restaurantId;
  }
  var limit = parseInt(pageSize);
  var skip = limit * parseInt(pageNum);

  Orders.list(filter, {'createdTime': -1}, skip, limit).then(orders => {
        console.log(orders);
        var data = [];

        for (var i = 0, len = orders.length; i < len; i++) {
          data.push({
            'orderId': orders[i]._id,
            'orderDate': orders[i].createdTime,
            'status': orders[i].status,
            'totalFee': orders[i].totalFee,
            'dishes': orders[i].dishes,
            'deskName': orders[i].deskName
          });
        }

        res.json({
          success: true,
          page: { current: 1, total: data.length },
          data: data
        });
    })
    .catch(e => next(e));
}

function revokeOrder(req, res, next) {
  var orderId = req.params.orderId;
  var data = {
    'status': 4
  };

  Orders.updateOne(orderId, data)
    .then(order => {
        res.json({
          success: true
        });
    })
    .catch(e => next(e));
}

function confirmOrder(req, res, next) {
  var orderId = req.params.orderId;
  var data = {
    'status': 2
  };

  Orders.updateOne(orderId, data)
    .then(ret => {
        res.json({
          success: true
        });     
    })
    .catch(e => next(e));  
}

function cancelOrder(req, res, next) {
  var orderId = req.params.orderId;
  var data = {
    'status': 3,
    'comment': req.body.comment
  };

  Orders.updateOne(orderId, data)
    .then(order => {
        res.json({
          success: true
        });

        Orders.get({'_id': orderId})
          .then(order => {
            var msg = {
              'type': "cancel",
              'order': order
            };

            wechatCustomer.sendMessage(order.openId, msg);
        }); 
    })
    .catch(e => next(e)); 
}

function getCancelReason(req, res, next) {
  var orderId = req.params.orderId;
  console.log("getCancelReason, orderId: " + orderId);

  Orders.get({'_id': orderId})
    .then(order => {
      if (order) {
        res.json({
          success: true,
          data: order.comment
        });    
      }
      else {
        res.json({
          success: false,
          errMsg: "您查找的订单ID不存在！"
        })
      }
    })
    .catch(e => next(e));
}

function getOrderDetail(req, res, next) {
  const { orderId } = req.query;
  console.log("getOrderDetail, orderId: " + orderId);

  Orders.get({'_id': orderId})
    .then(order => {
      if (order) {
        res.json({
          success: true,
          data: order
        });    
      }
      else {
        res.json({
          success: false,
          errMsg: "您查找的订单ID不存在！"
        })
      }
    })
    .catch(e => next(e));  
}

module.exports = {
  create, remove, load, listOrders, revokeOrder, confirmOrder, cancelOrder, getCancelReason,
  getOrderDetail,
};
