
/**
 * Import Files
 */
var webhookRoute = require("./app/webhook.route.js");
var corsFilter = require("./common/cors.filter");
var logger = require("./common/logger.js");

/**
 * Set up npm modules
 */
var bodyParser = require("body-parser");
var morganLogger = require("morgan");
var express = require("express");
var router = express.Router();
var fs = require('fs');
var app = express();

/**
 * HTTP request logger middleware for node.js
 */
app.use(morganLogger('dev'));
// Create the log directory if it does not exist
if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs");
}

/**
 * Setting Limits
 */
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', "extended": false }));

/**
 * Cross-Origin Resource Sharing (CORS) to gives web servers cross-domain access controls, which enable secure cross-domain data transfers.
 */
corsFilter(router);

/**
 * Endpoint for Our Custom Services
 * Defining routes
 */
app.use('/v1/apiai/apis', router);
webhookRoute.init(router);

/**
 * Error handler if something breaks
 */
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke in the server!');
});

/**
 * This function starts the express server
 */
function start() {
  logger.info("Starting the server using startup function");
  var port = process.env.PORT || 9002;
  app.listen(port, '0.0.0.0', function() {
    logger.info("Listening on : ", port);
  });
  logger.info("Express server listening on port %d ", port);
}

/**
 * Calling the startup function to start the application
 */
start();

