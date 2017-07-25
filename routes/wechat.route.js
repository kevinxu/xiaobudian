const express = require('express');
const validate = require('express-validation');
const Joi = require('joi');
const wechat = require('wechat');
const wechatController = require('../controllers/wechat.controller');

const router = express.Router();

const paramSchema = {

};

// {METHOD} /api/wechat/interface
router.route('/interface')
  .get(wechatController.auth)
  .post(wechatController.all);


module.exports = router;