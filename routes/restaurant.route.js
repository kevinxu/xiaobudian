const express = require('express');
const validate = require('express-validation');
const Joi = require('joi');
const restaurantController = require('../controllers/restaurant.controller');

const router = express.Router();

const paramSchema = {

  // POST /api/restaurant/apply
  createRestaurant: {
    body: {
      openId: Joi.string(),
      restaurantName: Joi.string(),
      contactName: Joi.string(),
      contactPhone: Joi.number()
    }
  },

  // POST /api/restaurant/addDesk
  addDesk: {
    body: {
      openId: Joi.string(),
      deskName: Joi.string()
    },
    params: {
      restaurantId: Joi.string().required()
    }
  },

  // PUT /api/restaurant/updateName/:restaurantId
  updateRestaurant: {
    body: {
      openId: Joi.string(),
      restaurantName: Joi.string()
    },
    params: {
      restaurantId: Joi.string().required()
    }
  },

  // PUT /api/restaurant/editDesk
  editDesk: {
    body: {
      oldDeskName: Joi.string(),
      newDeskName: Joi.string()
    },
    params: {
      restaurantId: Joi.string().required()
    }
  },

  // PUT /api/restaurant/remarkManagerName
  remarkManagerName: {
    body: {
      restaurantId: Joi.string(),
      openIdManager: Joi.string(),
      newRemarkName: Joi.string()
    },
    params: {
      restaurantId: Joi.string().required()
    }
  },

  // PUT /api/restaurant/unbindManager
  unbindManager: {
    body: {
      restaurantId: Joi.string(),
      openIdManager: Joi.string()
    },
    params: {
      restaurantId: Joi.string().required()
    }
  },

  // PUT /api/restaurant/authManager
  authManager: {
    body: {
      restaurantId: Joi.string(),
      fromOpenId: Joi.string(),
      toOpenId: Joi.string()
    },
    params: {
      restaurantId: Joi.string().required()
    }
  }
};


// {METHOD} /api/restaurant/apply
router.route('/apply')
  .post(validate(paramSchema.createRestaurant), restaurantController.create);

// {METHOD} /api/restaurant/getInfo
router.route('/getInfo')
  .get(restaurantController.getRestaurantDetails);

// {METHOD} /api/restaurant/getQrcode
router.route('/getQrcode')
  .get(restaurantController.getRestaurantQrCode);

// {METHOD} /api/restaurant/addDesk
router.route('/addDesk/:restaurantId')
  .post(validate(paramSchema.addDesk), restaurantController.addDesk);

// {METHOD} /api/restaurant/updateName
router.route('/updateName/:restaurantId')
  .put(validate(paramSchema.updateRestaurant), restaurantController.updateRestaurant);

// {METHOD} /api/restaurant/editDesk
router.route('/editDesk/:restaurantId')
  .put(validate(paramSchema.editDesk), restaurantController.editDesk);

// {METHOD} /api/restaurant/remarkManagerName
router.route('/remarkManagerName/:restaurantId')
  .put(validate(paramSchema.remarkManagerName), restaurantController.remarkManagerName);

// {METHOD} /api/restaurant/unbindManager
router.route('/unbindManager/:hospitalId')
  .put(validate(paramSchema.unbindManager), restaurantController.unbindManager);

// {METHOD} /api/restaurant/managers
router.route('/managers')
  .get(restaurantController.getManagers);

// {METHOD} /api/restaurant/authManager
router.route('/authManager/:hospitalId')
  .put(validate(paramSchema.authManager), restaurantController.authManager);

// {METHOD} /api/restaurant/getName
router.route('/getName')
  .get(restaurantController.getRestaurantName);

module.exports = router;