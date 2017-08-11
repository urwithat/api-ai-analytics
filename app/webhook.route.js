/**
 * Importing required
 */
var products = require('../data/products.json')
var logger = require("../common/logger.js");
var Promise = require("bluebird");
var path = require('path');
var fs = require("fs");
var _ = require('underscore');
var ua = require('universal-analytics');

// Creating the object to be exported.
function init(router) {
    router.route('/webhook').post(getWebhook);
    router.route('/logs').get(getLogs);
    router.route('/logs/:fileId').get(getLogs);
};

function getWebhook(req, res) {
    var response = "";
    var params = {};
    var productName = req.body.result.parameters["productName"];
    logger.info("productName :: " + productName);
    if(productName !== undefined && productName !== "") {
        var product = _.find(products, function(data, i) {
            if(data.name.toLowerCase().indexOf(productName.toLowerCase()) !== -1) {
                return data;
            }
        });
        if(product) {
            response = product.description;
            params = {
                ec: "Get Products",
                ea: response,
                el: "ProductName",
                ev: productName
            }
            logger.info("Product :" + productName + " found.");
        } else {
            response = "Could not find product '" + productName + "'";
            params = {
                ec: "Get Products",
                ea: response,
                el: "ProductName",
                ev: productName
            }
            logger.info("Could not find product '" + productName + "'");
        }
    } else {
        response = "Product Name not shared";
        params = {
            ec: "Get Products",
            ea: response,
            el: "ProductName",
            ev: productName
        }
    }

    // Universal Analytics
    var visitor = ua('UA-104398692-1');
    
    visitor.event(params).send();

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ 'speech': response, 'displayText': response }));
};

function getLogs(req, res) {
    var fileId = req.params.fileId;
    if(fileId) {
        var files = allFilesFromFolder(path.join("./logs/"));
        if(fileId < files.length) {
            var file = path.join("./logs/" + files[fileId].fileName);
            res.download(file);
        } else {
            res.send(JSON.parse('{"status" : "Requested files does not exist"}'));
        }
    } else {
        var files = allFilesFromFolder(path.join("./logs/"));
        res.send(files);
    }
};

function allFilesFromFolder(dir) {
    var results = [];
    fs.readdirSync(dir).forEach(function(file, i) {
        results.push(JSON.parse('{"index" : "' + i + '", "fileName": "' + file + '"}'));
    });
    return results;
};


module.exports.init = init;