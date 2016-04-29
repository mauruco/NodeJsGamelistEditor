var express = require('express');

var app = express();

app.use('/', require('../../routes/routes'));

var server = app.listen(3000, function(){

    console.log('server listening at port 3000');
});

module.exports = app;