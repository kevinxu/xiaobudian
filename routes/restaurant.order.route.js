const express = require('express');
const validate = require('express-validation');
const Joi = require('joi');
const orderController = require('../controllers/restaurant.order.controller');

const router = express.Router();

const paramSchema = {

  // POST /api/orders/create
  createOrder: {
    body: {
      openId: Joi.string(),
      restaurantId: Joi.string(),
      deskId: Joi.string(),
      customerName: Joi.string(),
      customerMobile: Joi.number(),
      customerAddr: Joi.string(),
      orderType: Joi.number(),
      totalFee: Joi.number(),
      dishes: [{
        dishId: Joi.string(),
        dishType: Joi.string(),
        dishName: Joi.string(),
        price: Joi.number(),
        count: Joi.number()
      }],
    }
  },

  // PUT /api/orders/:orderId
  updateOrder: {
    body: {
      comment: Joi.string()
    },
    params: {
      orderId: Joi.string().required()
    }
  },

  // PUT /api/orders/revoke/:orderId
  revokeOrder: {
    body: {
      orderId: Joi.string()
    },
    params: {
      orderId: Joi.string().required()
    }
  }
};

// {METHOD} /api/orders/getOrders
router.route('/getOrders')
  .get(orderController.listOrders);

// {METHOD} /api/orders/getOrderDetail
router.route('/getOrderDetail')
  .get(orderController.getOrderDetail);

// {METHOD} /api/orders/create
router.route('/create')
  .post(validate(paramSchema.createOrder), orderController.create);

// {METHOD} /api/orders/:orderId
router.route('/:orderId')
  .delete(orderController.remove);

// {METHOD} /api/orders/:orderId
router.route('/revoke/:orderId')
  .put(validate(paramSchema.revokeOrder), orderController.revokeOrder);

// {METHOD} /api/orders/confirm/:orderId
router.route('/confirm/:orderId')
  .put(validate(paramSchema.updateOrder), orderController.confirmOrder);

// {METHOD} /api/orders/cancel/:orderId
router.route('/cancel/:orderId')
  .put(validate(paramSchema.updateOrder), orderController.cancelOrder)
  .get(orderController.getCancelReason);

module.exports = router;