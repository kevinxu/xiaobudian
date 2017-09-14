const express = require('express');
const validate = require('express-validation');
const Joi = require('joi');
const menuController = require('../controllers/restaurant.menu.controller');

const router = express.Router();

const paramSchema = {

  // POST /api/menu/addDish/:restaurantId
  createDish: {
    body: {
      restaurantId: Joi.string(),
      openId: Joi.string(),
      dishType: Joi.string(),
      dishName: Joi.string(),
      price: Joi.number(),
      photo: Joi.string()
    },
    params: {
      restaurantId: Joi.string().required()
    }
  },

  // POST /api/menu/addDishType/:restaurantId
  addDishType: {
    body: {
      restaurantId: Joi.string(),
      openId: Joi.string(),
      dishType: Joi.string()
    },
    params: {
      restaurantId: Joi.string().required()
    }
  },

  // PUT /api/menu/editDish/:dishId
  editDish: {
    body: {
      restaurantId: Joi.string(),
      openId: Joi.string(),
      dishName: Joi.string(),
      price: Joi.number()
    },
    params: {
      dishId: Joi.string().required()
    }
  },

  // PUT /api/menu/editDishType/:dishTypeId
  editDishType: {
    body: {
      restaurantId: Joi.string(),
      openId: Joi.string(),
      dishTypeId: Joi.string(),
      dishType: Joi.string(),
    },
    params: {
      dishTypeId: Joi.string().required()
    }
  }
};

// {METHOD} /api/menu/getList
router.route('/getList')
  .get(menuController.listMenu);

// {METHOD} /api/menu/addDish/:restaurantId
router.route('/addDish/:restaurantId')
  .post(validate(paramSchema.createDish), menuController.create);

// {METHOD} /api/menu/addDishType/:restaurantId
router.route('/addDishType/:restaurantId')
  .post(validate(paramSchema.addDishType), menuController.addDishType);

// {METHOD} /api/menu/getDishTypes
router.route('/getDishTypes')
  .get(menuController.getDishTypes);

// {METHOD} /api/menu/deleteDishType/:dishTypeId
router.route('/deleteDishType/:dishTypeId')
  .delete(menuController.deleteDishType);

// {METHOD} /api/menu/editDishType/:dishTypeId
router.route('/editDishType/:dishTypeId')
  .put(validate(paramSchema.editDishType), menuController.editDishType);

// {METHOD} /api/menu/deleteDish/:dishId
router.route('/deleteDish/:dishId')
  .delete(menuController.deleteDish);

// {METHOD} /api/menu/editDish/:dishId
router.route('/editDish/:dishId')
  .put(validate(paramSchema.editDish), menuController.editDish);

module.exports = router;