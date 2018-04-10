const express = require('express');
const fileUpload = require('express-fileupload');
// const mongoose = require('mongoose');

// const dotenv = require('dotenv');

const path = require('path');
var port = process.env.PORT || 8000

const cnpjController = require('./controllers/cnpj');
const homeController = require('./controllers/home');
const uploadController = require('./controllers/upload');


const app = express();


/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
// dotenv.load({ path: '.env' });

/**
 * Connect to MongoDB.
 */
// mongoose.Promise = global.Promise;
// mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });




app.set('views', path.join(__dirname, 'views'));




app.use(fileUpload());

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.get('/', homeController.index);


app.get('/check/:cnpj', uploadController.check);





app.listen(port, function() {
    console.log("App is running on port " + port);
});