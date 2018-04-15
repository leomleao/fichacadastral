const uuidv4            = require('uuid/v4');
const { StringDecoder } = require('string_decoder');
const decoder           = new StringDecoder('utf8');
const fs                = require('fs');
const path              = require('path');
const request           = require('request'); // https://www.npmjs.com/package/request
const ejs               = require('ejs');


// using SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// Connection to database
const Sequelize = require('sequelize'); 
// const sequelize = new Sequelize('mysql://'+ process.env.SQL_USER + ':' + process.env.SQL_PASSWORD + '@127.0.0.1:3306/' + process.env.SQL_DATABASE, { operatorsAliases: false });
// const company   = sequelize.import(path.join(__dirname, '../models/company'));



// Imports the Google Cloud client library
const Storage = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();

// The name the bucket
const bucketName = 'olympus-db';


/**
 * GET /
 * upload page.
 */
exports.index = (req, res) => {
  res.render('pages/upload', {
    title: 'upload'
  });
};


// /**
//  * GET /
//  * file page.
//  */
// exports.file = (req, res) => {
//  	let uuid = req.params.uuid; 	
//  	var file = path.resolve(__dirname, '../files/' + uuid + '.xlsx')
//     res.download(file); // Set disposition and send it.
// };


/**
 * GET /
 * check page.
 */
exports.check = (req, res) => {
 	let cnpj = req.params.cnpj;
 	let url = 'http://www.receitaws.com.br/v1/cnpj/' + cnpj;

    request(url, function(err, response, body) {
	    // Some processing is happening here before the callback is invoked		    
		    if (!err && response.statusCode == '200'){
		    	try {		       
	        	var resp = JSON.parse(response.body);
			    } catch (e) {
			        var resp = false;
			        console.info('deu ruim');
			        console.info(e);
			        return res.status(500).send(e);
			    }
		    	console.info(resp.status);

		    	if (resp.status == 'OK'){
		    		return res.status(200).send(resp);
		    	}

		    }  	else {		    		
		    	console.info(err);
		    	console.info(response);
		    	console.info(body);
		    	return res.status(500).send(err);
					
		      // some code   
	    	}
	  });   
};


/**
 * POST /
 * upload form data and save it DB.
 */
exports.form = (req, res) => {
	const pdfFiller   = require('pdffiller'); 
	let fullUrl = req.protocol + '://' + req.get('host');
	

	const sequelize = new Sequelize('mysql://'+ process.env.SQL_USER + ':' + process.env.SQL_PASSWORD + '@127.0.0.1:3306/' + process.env.SQL_DATABASE, { operatorsAliases: false });
	const company = sequelize.import(path.join(__dirname, '../models/company'));

	var data = req.body;

	var test = 0;

	console.info(test);

	company
  		.findOrCreate({
  			where: {
  				uuid: data.uuid
  			},
  			defaults: data		  				
  			
  		})
  		.spread((company, created) => {
   		 	// if (!created){
   		 	// 	throw new Error('duplicate');
   		 	// 	console.info('larou');
   		 	// }
   		 	return company
	
		}).then((company) => {
			test++;
			console.info('1');			
			console.info(test);

			console.info(data);

			fillForm(data, callback2)

			function callback2(status){
				test++;
				console.info('2');
				console.info(test);
				if (status) {
					throw new Error('formError');	
				} 
				company.update({
					pdfCreated: data.uuid + '_#_ficha-cadastral.pdf'
				}).then(() => {
					sequelize.close();
				})
				return true
			}

			
		}).then((fillForm) => {
			test++;
			console.info('3');
			console.info(test);
			copyFormToCloud(data, callback);

			function callback(formUrl){
				test++;
				console.info('4');
				console.info(test);
				console.info(formUrl);
				if (formUrl){					
					return res.status(200).send(JSON.stringify({
								'status' : 'success',
								'message' : 'Saved in database!',
								'formURL' : formUrl
					}));
				} else {
					return res.status(200).send(JSON.stringify({
								'status' : 'success',
								'message' : 'Saved in database!'
					}));
	  			}
  			}
			
		}).catch((error) => {
			console.log(error.name);
			console.log(error.message);
			if (error.message === 'duplicate'){
				return res.status(400).send(JSON.stringify({
						    'status' : 'error',
						    'message' : 'Duplicate entry!'
				}));
			} else 	if (error.name === 'formError'){
				return res.status(400).send(JSON.stringify({
						    'status' : 'error',
						    'message' : 'Form not created!'
				}));
			} else {
				return res.status(500).send(JSON.stringify({
						    'status' : 'error',
						    'message' : 'We don\'t know what happened, but it happened!',
						    'errorMessage': error
				}));
			}
		});


	function copyFormToCloud(formData, callback){
		var filename = formData.uuid + '_#_ficha-cadastral.pdf';
		var destinationPDF =  path.resolve(__dirname, '../files/' + filename);
			storage
			    .bucket(bucketName)
			    .upload(destinationPDF)
			    .then(() => {
				    storage
				  		.bucket(bucketName)
				  		.file(formData.uuid + '_#_ficha-cadastral.pdf')
				  		.makePublic()
					  	.then(() => {
					   		console.log(`gs://${bucketName}/${filename} is now public.`);
					    	return callback (`https://storage.googleapis.com/${bucketName}/${filename}`);
					    })
					    .catch(err => {
					    	console.error('ERROR with form upload:', err);
					    	return callback (false);
						});	

			}) 
		    .catch(err => {
		    	console.error('ERROR with form upload:', err);
		    	return callback (false);
		  	});	


	}


	function fillForm(formData, callback){

		var sourcePDF = path.resolve(__dirname, '../public/form-ficha-cadastral-WAGO.pdf');
		var destinationPDF =  path.resolve(__dirname, '../files/' + formData.uuid + '_#_ficha-cadastral.pdf');
		
		if ('atividade_principal' in formData) {
			formData.atividade_principal = formData.atividade_principal[0].code + ' - ' + formData.atividade_principal[0].text;
		}
		pdfFiller.fillFormWithOptions( sourcePDF, destinationPDF, formData, true, './files/temp', function(err) {

		    if (err) return callback(true);		    

		    return callback(false);

		});
	}

	function cleanData(dataObj, model){

		for( let key in dataObj.rawAttributes ){
	    	var test = false;
	    	for( let secKey in model.rawAttributes ){
	    		(key != secKey) ? test = true : test = false;	    	
			}
			if (test) delete dataObj.key
		}

		return dataObj
	}


}





/**
 * POST /
 * upload file.
 */
exports.uploadFile = (req, res) => {
	let fullUrl = req.protocol + '://' + req.get('host');
  	if (!req.files)
		return res.status(400).send(JSON.stringify({
					'status' : 'error',
					'message' : 'No files were uploaded.'
		}));
	// The name of the input field (i.e. 'sampleFile') is used to retrieve the uploaded file
	let uploadedFile = req.files.file;

	// // Use the mv() method to place the file somewhere on your server
	let folderDest = path.resolve(__dirname, '../files/' + uploadedFile.name );

	  				

	uploadedFile.mv(folderDest, function(err) {
		if (err) {
			return res.status(500).send(JSON.stringify({
					'status' : 'error',
					'message' : err
			}));
		} else {	
				
			//Uploads a local file to the bucket
			storage
			  .bucket(bucketName)
			  .upload(folderDest)
			  .then(() => {
			    console.log(`${uploadedFile.name} uploaded to ${bucketName}.`);
			  })
			  .catch(err => {
			    console.error('ERROR:', err);
			});	
			
				
			return res.status(200).send(JSON.stringify({
					'status' : 'sucess',
					'message' : 'Arquivo recebido!'
			}));
		}

	});

};



// function sendUploadToGCS (req, res, next) {
//   if (!req.file) {
//     return next();
//   }

//   const gcsname = Date.now() + req.file.originalname;
//   const file = bucket.file(gcsname);

//   const stream = file.createWriteStream({
//     metadata: {
//       contentType: req.file.mimetype
//     }
//   });

//   stream.on('error', (err) => {
//     req.file.cloudStorageError = err;
//     next(err);
//   });

//   stream.on('finish', () => {
//     req.file.cloudStorageObject = gcsname;
//     file.makePublic().then(() => {
//       req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
//       next();
//     });
//   });

//   stream.end(req.file.buffer);
// }
