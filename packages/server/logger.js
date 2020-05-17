const winston = require('winston')

const logger = new winston.createLogger({
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
            json: true,
            colorize: true,
        })
    ],
    exitOnError: false, // do not exit on handled exceptions
});

module.exports = logger