const request = require('request');
const Menu = require('../models/menu.model');
const Managers = require('../models/hospital-managers.model');

// 环境变量
const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production' ? true : false;

//  APP 配置
const config = isProd ? require('../config.prod')
                      : require('../config');

function create(req, res, next) {
  var hospitalId = req.params.hospitalId;
  const { openId, day, meal, dishType, dishName, price } = req.body;

  const menu = new Menu({
    hospitalId,
    openId,
    day,
    meal,
    dishType,
    dishName,
    price
  });
  console.log("create menu here.");

  menu.save()
    .then(newDish => {
      Menu.list(hospitalId, day, meal, dishType)
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

function remove(req, res, next) {
  var dishId = req.params.dishId;

  Menu.remove({"_id": dishId})
    .then(oldDish => res.json({
      success: true,
      data: oldDish
    }))
    .catch(e => next(e));
}

function update(req, res, next) {
  var dishId = req.params.dishId;
  var data = req.body;

  console.log("dishId: " + dishId);

  Menu.updateOne(dishId, data)
    .then(dishes => {
        res.json({
          success: true,
          page: { current: 1, total: dishes.length },
          data: dishes
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
  const { hospitalId, day, mealType, dishType, size = 10, page = 1 } = req.query;

  console.log("listMenu hospitalId:" + hospitalId + " day: " + day + " mealType: " + mealType + " dishType: " + dishType);
  var filter = new Object();
  if (hospitalId) {
    filter.hospitalId = hospitalId;
  }
  if (day) {
    filter.day = day;
  }
  if (mealType) {
    filter.meal = mealType;
  }
  if (dishType) {
    filter.dishType = dishType;
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
  create, remove, update, load, findOne, listMenu,
};
