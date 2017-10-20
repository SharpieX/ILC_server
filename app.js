const express = require('express');
const routes  = require('./routes/routes');
const bb = require('express-busboy');
const mongoose = require('mongoose');

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/EduMentor', {useMongoClient: true});
mongoose.connection
    .once('open', () => {
        console.log('Connection Successful');
    })
    .on('error', (error) => {
        console.warn('Warning', error);
    });


bb.extend(app, {
    upload: true
});

routes(app);

module.exports = app;