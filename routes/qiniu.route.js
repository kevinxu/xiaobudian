const express = require('express');
const validate = require('express-validation');
const Joi = require('joi');
const qiniuController = require('../controllers/qiniu.controller');

const router = express.Router();

const paramSchema = {

};

// {METHOD} /api/qiniu/getToken
router.route('/getToken')
  .get(qiniuController.getToken);

// {METHOD} /api/qiniu/upload/callback
router.route('/upload/callback')
  .get(qiniuController.qiniuCallback);

module.exports = router;