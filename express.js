var express = require('express'),
path = require('path'),
pug = require('pug'),
routes =  require('./routes/routes');

var app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

app.use('/', routes);

app.use(function(req, res, next){

    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next){

    res.status(err.status || 500).json({err: err.message});
});

var server = app.listen(3000, function(){

    console.log('server listening at port 3000');
});

module.exports = app;