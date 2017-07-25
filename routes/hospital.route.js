const express = require('express');
const validate = require('express-validation');
const Joi = require('joi');
const hospitalController = require('../controllers/hospital.controller');

const router = express.Router();

const paramSchema = {

  // POST /api/hospital/apply
  createHospital: {
    body: {
      openId: Joi.string(),
      hospitalName: Joi.string(),
      contactName: Joi.string(),
      contactPhone: Joi.number()
    }
  },

  // PUT /api/hospital
  updateHospital: {
    body: {
      openId: Joi.string(),
      hospitalName: Joi.string()
    },
    params: {
      hospitalId: Joi.string().required()
    }
  },

  // POST /api/hospital/addDept
  addDepartment: {
    body: {
      openId: Joi.string(),
      deptName: Joi.string()
    },
    params: {
      hospitalId: Joi.string().required()
    }
  },

  // PUT /api/hospital/editDept
  editDepartment: {
    body: {
      oldDeptName: Joi.string(),
      newDeptName: Joi.string()
    },
    params: {
      hospitalId: Joi.string().required()
    }
  },

  // PUT /api/hospital/unbindManager
  unbindManager: {
    body: {
      hospitalId: Joi.string(),
      openIdManager: Joi.string()
    },
    params: {
      hospitalId: Joi.string().required()
    }
  },

  // PUT /api/hospital/remarkManagerName
  remarkManagerName: {
    body: {
      hospitalId: Joi.string(),
      openIdManager: Joi.string(),
      newRemarkName: Joi.string()
    },
    params: {
      hospitalId: Joi.string().required()
    }
  },

  // PUT /api/hospital/updateOrderTime
  updateOrderTime: {
    body: {
      hospitalId: Joi.string(),
      // 0 - breakfast; 1 - lunch; 2 - dinner
      mealType: Joi.number().integer().min(0).max(2),
      // 0 - last day; 1 - today
      reminderDay: Joi.number().integer().min(0).max(1),
      reminderTime: Joi.string(),
      shippingTimeStart: Joi.string(),
      shippingTimeEnd: Joi.string()
    },
    params: {
      hospitalId: Joi.string().required()
    }
  }
};

// {METHOD} /api/hospital
router.route('/')
  .get(hospitalController.findOne);

// {METHOD} /api/hospital/deptList/:openId
router.route('/deptList')
  .get(hospitalController.getDeptList);

// {METHOD} /api/hospital/managers
router.route('/managers')
  .get(hospitalController.getManagers);

// {METHOD} /api/hospital/:hospitalId
router.route('/:hospitalId')
  .put(validate(paramSchema.updateHospital), hospitalController.update);

// {METHOD} /api/hospital/apply
router.route('/apply')
  .post(validate(paramSchema.createHospital), hospitalController.create);

// {METHOD} /api/hospital/addDept
router.route('/addDept/:hospitalId')
  .post(validate(paramSchema.addDepartment), hospitalController.addDepartment);

// {METHOD} /api/hospital/editDept
router.route('/editDept/:hospitalId')
  .put(validate(paramSchema.editDepartment), hospitalController.editDepartment);

// {METHOD} /api/hospital/unbindManager
router.route('/unbindManager/:hospitalId')
  .put(validate(paramSchema.unbindManager), hospitalController.unbindManager);

// {METHOD} /api/hospital/remarkManagerName
router.route('/remarkManagerName/:hospitalId')
  .put(validate(paramSchema.remarkManagerName), hospitalController.remarkManagerName);

// {METHOD} /api/hospital/updateOrderTime
router.route('/updateOrderTime/:hospitalId')
  .put(validate(paramSchema.updateOrderTime), hospitalController.updateOrderTime);

// {METHOD} /api/hospital/dept
router.route('/dept')
  .get(hospitalController.getDept);

module.exports = router;