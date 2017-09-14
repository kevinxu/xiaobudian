const request = require('request');
const Menu = require('../models/restaurant.menu.model');
const Managers = require('../models/restaurant-managers.model');
const DishType = require('../models/restaurant.dishtype.model');
const ERR_CODE = require('./constant');
const Utils = require('./utils');

// 环境变量
const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production' ? true : false;

//  APP 配置
const config = isProd ? require('../config.prod')
                      : require('../config');

function create(req, res, next) {
  var restaurantId = req.params.restaurantId;
  const { openId, dishTypeId, dishType, dishName, price } = req.body;
  var photo = config.qiniu.domain + req.body.photo;

  const menu = new Menu({
    restaurantId,
    openId,
    dishTypeId,
    dishType,
    dishName,
    price,
    photo
  });
  console.log("create menu here.");

  menu.save()
    .then(newDish => {
      Menu.list(restaurantId, dishType)
        .then(dishes => {
          res.json({
            success: true,
            data: dishes,
            page: {current: 1, total: dishes.length}
          })
        });
    })
    .catch(e => next(e));

}

function addDishType(req, res, next) {
  var restaurantId = req.params.restaurantId;
  const { openId, dishType } = req.body;

  DishType.get({
    'restaurantId': restaurantId,
    'dishType': dishType
  }).then(type => {
    if (type) {
      res.json({
        success: false,
        errMsg: "您添加的菜品类型已存在！",
        errCode: ERR_CODE.DISH_TYPE_ALREADY_EXIST
      });
    }
  })
  .catch(e => next(e));

  const type = new DishType({
    restaurantId,
    openId,
    dishType
  });
  console.log("create dish type here.");

  type.save()
    .then(result => {
      console.log(JSON.stringify(result));
      res.json({
        success: true
      });
    })
    .catch(e => next(e));  
}

function getDishTypes(req, res, next) {
  const { restaurantId, size = 10, page = 1 } = req.query;

  console.log("getDishTypes restaurantId:" + restaurantId);
  var filter = new Object();
  if (restaurantId) {
    filter.restaurantId = restaurantId;
  }

  DishType.list(filter)
    .then(list => {
        console.log(list);
        var data = [];

        for (var i = 0, len = list.length; i < len; i++) {
          data.push({
            'id': list[i]._id,
            'dishType': list[i].dishType
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

function deleteDishType(req, res, next) {
  var dishTypeId = req.params.dishTypeId;

  Menu.list({
    'dishTypeId': dishTypeId
  }).then(list => {

    if (list && list.length > 0) {
      res.json({
        success: false,
        errMsg: "删除菜品类型失败，请先清空该类型下的菜品！",
        errCode: ERR_CODE.DELETE_DISH_TYPE_FAILED
      });

      return;
    }

    DishType.remove({"_id": dishTypeId})
     .then(oldDishType => res.json({
       success: true,
       data: oldDishType
     }))
     .catch(e => next(e)); 
  })
  .catch(e => next(e));  
}

function editDishType(req, res, next) {
  var dishTypeId = req.params.dishTypeId;
  const { restaurantId, openId, dishType } = req.body;
  var time = new Date();
  var data = {
    'restaurantId': restaurantId,
    'openId': openId,
    'dishType': dishType,
    'updateTime': time.format("yyyy-MM-dd hh:mm:ss"),
  };

  console.log("dishTypeId: " + dishTypeId);

  DishType.updateOne(dishTypeId, data)
    .then(dishes => {
        Menu.updateMulti({
          'dishTypeId': dishTypeId
        }, {
          'dishType': dishType
        }).then(multi => {
          console.log("updatemulti: " + JSON.stringify(multi));
        });
        res.json({
          success: true
        });
    })
    .catch(e => next(e));
}

function deleteDish(req, res, next) {
  var dishId = req.params.dishId;

  if (!dishId) {
    res.json({
      success: false,
      errMsg: "无效参数",
      errCode: ERR_CODE.INVALID_PARAMETERS
    });

    return;
  }

  Menu.remove({"_id": dishId})
    .then(oldDish => res.json({
      success: true,
      data: oldDish
    }))
    .catch(e => next(e));
}

function editDish(req, res, next) {
  var dishId = req.params.dishId;
  const { restaurantId, openId, dishName, price } = req.body;
  var photo;
  if (req.body.photo) {
    photo = config.qiniu.domain + req.body.photo;
  }
  
  var data = {
    'openId': openId,
    'dishName': dishName,
    'price': price,
    'photo': photo
  };

  console.log("dishId: " + dishId);

  if (!dishId) {
    res.json({
      success: false,
      errMsg: "无效参数",
      errCode: ERR_CODE.INVALID_PARAMETERS
    });

    return;
  }

  Menu.updateOne({
    '_id': dishId
  }, data)
    .then(dishes => {
        res.json({
          success: true
        });
    })
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

function findOne(req, res) {
  return res.json({success: true, data: req.catalog});
}

function listMenu(req, res, next) {
  const { restaurantId, size = 10, page = 1 } = req.query;

  console.log("listMenu restaurantId:" + restaurantId);
  var filter = new Object();
  if (restaurantId) {
    filter.restaurantId = restaurantId;
  }

  Menu.list(filter)
    .then(menu => {
        console.log(menu);
        res.json({
          success: true,
          page: { current: 1, total: menu.length },
          data: menu
        });
    })
    .catch(e => next(e));

}

module.exports = {
  create,
  load,
  findOne,
  listMenu,
  addDishType,
  getDishTypes,
  deleteDishType,
  editDishType,
  deleteDish,
  editDish,
};
