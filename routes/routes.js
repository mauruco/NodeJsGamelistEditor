var express = require('express');
var routes = express.Router();
var config = require('config');

routes.get('/favicon.ico', function(req, res){

    res.writeHead(200, {'Content-Type': 'image/x-icon'});
    res.end();
});

routes.get('/', function(req, res){

    res.send('hello world');
});


module.exports = routes;