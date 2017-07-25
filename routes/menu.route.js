const express = require('express');
const validate = require('express-validation');
const Joi = require('joi');
const menuController = require('../controllers/menu.controller');

const router = express.Router();

const paramSchema = {

  // POST /api/menu
  createDish: {
    body: {
      hospitalId: Joi.string(),
      openId: Joi.string(),
      day: Joi.string(),
      meal: Joi.string(),
      dishType: Joi.string(),
      dishName: Joi.string(),
      price: Joi.number()
    },
    params: {
      hospitalId: Joi.string().required()
    }
  },

  // PUT /api/orders/:dishId
  updateDish: {
    body: {
      hospitalId: Joi.string(),
      openId: Joi.string(),
      day: Joi.string(),
      meal: Joi.string(),
      dishType: Joi.string(),
      dishName: Joi.string(),
      price: Joi.number()
    },
    params: {
      dishId: Joi.string().required()
    }
  }
};

// {METHOD} /api/menu
router.route('/')
  .get(menuController.listMenu);

// {METHOD} /api/menu
router.route('/:hospitalId')
  .post(validate(paramSchema.createDish), menuController.create);

// {METHOD} /api/menu/:orderId
router.route('/:dishId')
  .get(menuController.findOne)
  .put(validate(paramSchema.updateDish), menuController.update)
  .delete(menuController.remove);

module.exports = router;