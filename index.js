const express = require('express');
const fileUpload = require('express-fileupload');
// const mongoose = require('mongoose');

// const dotenv = require('dotenv');

const path = require('path');
const PORT = process.env.PORT || 5000;

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

app.get('/upload', uploadController.index);

app.get('/test', uploadController.test);

app.get('/result/:uuid', uploadController.file);

app.get('/check/:cnpj', uploadController.check);


app.post('/upload', uploadController.upload );



app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
