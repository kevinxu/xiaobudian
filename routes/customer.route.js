const express = require('express');
const validate = require('express-validation');
const Joi = require('joi');
const customerController = require('../controllers/customer.controller');

const router = express.Router();

const paramSchema = {

  // POST /api/customer

};

// {METHOD} /api/customer/getInfo
router.route('/getInfo')
  .get(customerController.getCustomer);

module.exports = router;