const request = require('request');
const Patient = require('../models/patients.model');
const wechatPatient = require('./wechat-patient.controller');

// 环境变量
const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production' ? true : false;

//  APP 配置
const config = isProd ? require('../config.prod')
                      : require('../config');


function isPatientExist(openId) {
  return Patient.findOne({'openId': openId});
}

function getPatient(req, res, next) {
  const { openId } = req.query;

  console.log("getPatient openId: " + openId);
  Patient.get({'openId': openId})
    .then(p => {
    	if (p) {
        console.log(p);
	        var data = {
	        	'openId': openId,
	        	'hospitalId': p.hospitalId,
	        	'realName': p.realName,
	        	'inHospitalId': p.inHospitalId,
	        	'mobile': p.mobile,
	        	'bedNo': p.bedNo,
	        	'departmentId': p.departmentId,
	        	'departmentName': p.departmentName
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
  isPatientExist, getPatient,
};