'use strict';

var express = require('express');

var app = express();

app.get('/api', function (req, res) {
    res.send("Server is up and running");
});

module.exports = app;
//# sourceMappingURL=app.js.map