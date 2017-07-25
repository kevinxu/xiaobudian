const winston = require('winston');

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'error.log',
      level: 'error'
    })
  ]
});

module.exports = logger;
