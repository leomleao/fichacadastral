const express = require('express');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;

if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const path = require('path');
var port = process.env.PORT || 8000

const cnpjController = require('./controllers/cnpj');
const homeController = require('./controllers/home');
const uploadController = require('./controllers/upload');


/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, function(error) {
	var gfs = Grid(mongoose.db); 
});


const app = express();

app.set('views', path.join(__dirname, 'views'));

app.use(fileUpload());

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');



app.get('/', homeController.index);

app.get('/check/:cnpj', uploadController.check);

app.post('/uploadFile', uploadController.uploadFile );



app.listen(port, function() {
    console.log("App is running on port " + port);
});