var express = require('express');
var routes = express.Router();
var config = require('config');

function revalidate(res){

    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');    
}

routes.get('/favicon.ico', function(req, res){

    res.writeHead(200, {'Content-Type': 'image/x-icon'});
    res.end();
});

routes.get('/', function(req, res){

    // revalidate(res);
    res.render('index', require('../controllers/index')());
});

module.exports = routes;