const express = require('express');
const routes = require('./routes/routes');
const bb = require('express-busboy');
const mongoose = require('mongoose');
const cors = require('cors');

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
app.use(cors({
	origin: '*',
	withCredentials: false,
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

routes(app);

module.exports = app;