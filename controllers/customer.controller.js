const request = require('request');
const Customer = require('../models/customer.model');
const wechatCustomer = require('./wechat-customer.controller');

// 环境变量
const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production' ? true : false;

//  APP 配置
const config = isProd ? require('../config.prod')
                      : require('../config');


function isCustomerExist(openId) {
  return Customer.get({'openId': openId});
}

function getCustomer(req, res, next) {
  const { openId, restaurantId } = req.query;

  console.log("getCustomer openId: " + openId + " restaurantId: " + restaurantId);
  Customer.get({
    'openId': openId,
    'restaurantId': restaurantId
  }).then(p => {
    	if (p) {
        console.log(p);
	        var data = {
	        	'openId': openId,
	        	'restaurantId': p.restaurantId,
	        	'realName': p.realName,
	        	'mobile': p.mobile,
	        	'deskName': p.deskName,
            'address': p.address,
            'deskId': p.deskId
	        };

	        res.json({
	          success: true,
	          data: data
	        });
    	}
    	else {
    		res.json({
    			success: false,
    			errMsg: "此病人不存在"
    		})
    	}
    })
    .catch(e => next(e));
}

module.exports = {
  isCustomerExist, getCustomer,
};