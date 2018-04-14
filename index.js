const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');


if (process.env.GCLOUD !== 'nope' && process.env.USERDOMAIN_ROAMINGPROFILE !== 'DESKTOP-A7H495I' && process.env.COMPUTERNAME !== 'PC226276' ) {
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage();

  const bucketName = 'secrets-of-olympus';
  const srcFilename = '.env';
  const destFilename = './env.env';

  const options = {
    // The path to which the file should be downloaded, e.g. "./file.txt"
    destination: destFilename,
  };

  // Downloads the file
  storage
    .bucket(bucketName)
    .file(srcFilename)
    .download(options)
    .then(() => {
      console.log(
        `gs://${bucketName}/${srcFilename} downloaded to ${destFilename}.`
      );
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END storage_download_file]
}

if (process.env.NODE_ENV !== 'production') require('dotenv').config({path: './env.env'})


const path = require('path');
var port = process.env.PORT || 8000

const cnpjController = require('./controllers/cnpj');
const homeController = require('./controllers/home');
const uploadController = require('./controllers/upload');



const app = express();

app.use(fileUpload());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');


// create application/x-www-form-urlencoded parser
// var urlencodedParser = bodyParser.urlencoded({ extended: false })



app.get('/', homeController.index);

app.get('/check/:cnpj', uploadController.check);

app.post('/uploadFile', uploadController.uploadFile );

app.post('/form',  uploadController.form );

app.get('/test',  homeController.test );
app.get('/pageReview',  homeController.pageReview );



app.listen(port, function() {
    console.log("App is running on port " + port);
});