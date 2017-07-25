const express = require('express');
const validate = require('express-validation');
const Joi = require('joi');
const patientController = require('../controllers/patient.controller');

const router = express.Router();

const paramSchema = {

  // POST /api/menu

};

// {METHOD} /api/patient
router.route('/')
  .get(patientController.getPatient);

module.exports = router;