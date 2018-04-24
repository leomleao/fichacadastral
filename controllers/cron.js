const request = require('request'); // https://www.npmjs.com/package/request
const path    = require('path');
const ejs     = require('ejs');
const fs      = require('fs');


// Imports the Google Cloud client library
const Storage    = require('@google-cloud/storage');

// Creates a client
const storage    = new Storage();

// The name the bucket
const bucketName = 'olympus-db';

// using SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail     = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// Connection to database
const Sequelize  = require('sequelize'); 


const sequelize = new Sequelize(process.env.SQL_DATABASE, process.env.SQL_USER, process.env.SQL_PASSWORD, {
	dialect: 'mysql',
	dialectOptions: {	      
    	socketPath: '/cloudsql/omega-zeta:southamerica-east1:mount-cylene'
    },
    port: 5432	
});

//PROMISE WITH TWO FUNCTIONS MIGHT BE USEFUL 

// function getExample() {
//     var a = promiseA(…);
//     var b = a.then(function(resultA) {
//         // some processing
//         return promiseB(…);
//     });
//     return Promise.all([a, b]).then(function([resultA, resultB]) {
//         // more processing
//         return // something using both resultA and resultB
//     });
// }


/**
 * GET /
 * send emails job
 */
exports.email = (req, res) => {

	// const sequelize = new Sequelize('mysql://'+ process.env.SQL_USER + ':' + process.env.SQL_PASSWORD + '@127.0.0.1:3306/' + process.env.SQL_DATABASE, { operatorsAliases: false });


	const company   = sequelize.import(path.join(__dirname, '../models/company'));
	const file      = sequelize.import(path.join(__dirname, '../models/file'));
	const config    = sequelize.import(path.join(__dirname, '../models/configuration'));


	const date = new Date();
	const current_hour = date.getHours();
	var time;

	if (current_hour <= 11 && current_hour >= 6) {
		time = 'morning'
	} else if (current_hour >= 12 && current_hour <= 18) {
		time = 'afternoon'
	} else {
		time = 'night'
	}



		// const formPDF = fs.readFileSync(destinationPDF);
		// const base64File = new Buffer(formPDF).toString('base64');

	initialize()								// {'emailRecipients':'emailRecipients'}
	.then(chainObj => getCompanies (chainObj))	// {'emailRecipients':'emailRecipients', 'companies': 'query from Sequelize'}
	// .then(chainObj => getFiles (chainObj)) 		// {'emailRecipients':'emailRecipients', 'companies': 'query from Sequelize', 'files'" @array with files name"}
	.then(chainObj => queueMails(chainObj))
	.then((response) =>{
		if(!response) {
			console.info("All mail have been sent!")
			return res.status(200).send(JSON.stringify({
						    'status' : 'success',
						    'message' : 'All mails have already been sent!'
			}));
		}		
		return res.status(200).send(JSON.stringify({
		    'status' : 'success',
		    'message' : response
		}));
	})
	.catch(err =>{
		console.info(err);		
		return res.status(500).send(JSON.stringify({
				    'status' : 'error',
				    'message' : 'Bad stuff happens! :/ ',
				    'errorMessage': err
		}));		

	});

	// var test = ['58cec16b-5868-4b09-98ae-87c842e704fd_#_Certificates.pdf' , '58cec16b-5868-4b09-98ae-87c842e704fd_#_ficha-cadastral.pdf']
	

	// prepareAttachments(test);

	function queueMails(chainObj) {
		if (!chainObj.companies || chainObj.companies.length === 0) {		
			return false
		} else {
			return new Promise(function(resolve) {
				var mailQueue = [];	
				console.info('Start of list - Mails about to be sent!')	
				for (var i = chainObj.companies.length - 1; i >= 0; i--) {
					console.info(chainObj.companies[i].dataValues.nome);
					mailQueue.push(sendMail(chainObj.emailRecipients, chainObj.companies[i].dataValues));
				}
				console.info('End of list - Mails about to be sent!')				
				Promise.all(mailQueue)
					.then(() => {
						resolve('Mails sent successfully!');
					})
					.catch(err => {
						console.error(err);
					})
			})
		}
	}


	function initialize() {
		return new Promise(function(resolve) {
	     // Do async job
	        config.findOne({
			  where: {
			    type: 'email'
			  }
			})
			.then((config) =>{
				resolve({'emailRecipients':config.dataValues.value.split(';')});
			})
			.catch(err => {
				console.error(err);
			});
		})
	}



	function getCompanies(chainObj) {
	    // Return new promise 
	    return new Promise(function(resolve, reject) {
	     // Do async job
	        company.findAll({
			  where: {
			    emailSent: null
			  }
			})
			.then((companies) =>{				
				chainObj.companies = companies;
				resolve(chainObj);					
				
			})
			.catch(err => {
				console.error(err);
			});
		})
	}



	function getFiles(uuid) {
	    
	    return new Promise(function(resolve) {	    	

	    	file.findAll({
			  where: {
			    uuid: uuid
			  }
			})
			.then((files) => {
				console.info('Start of list - Files about to be downloaded:');
				var downloadQueue = [];

				for (var i = files.length - 1; i >= 0; i--) {
					console.info(files[i].dataValues.filename);
					downloadQueue.push(downloadFile(files[i].dataValues.filename));
				}

				console.info('End of list - Files about to be downloaded.');
							
				Promise.all(downloadQueue)
					.then((filesDownloaded) => {
						resolve(filesDownloaded);		
					})
					.catch(err => {
						console.error(err);
					})
			})
			.catch(err => {
				console.error(err);
			});  
	    })
	}



	//
	// @array Email recipients
	// @object form data
	//
	function sendMail(mailRecipients, data){	

		return new Promise(function(resolve) {	
			const template = path.join(__dirname, '../views/pages/template-email.ejs');
			var attachments = [];
			getFiles(data.uuid)
				// @array of files
				.then((files) => prepareAttachments(files))
				.then((result) => {
					attachments = result;

					ejs.renderFile(template, {
						time: time,
						data: data
					})
					.then((html) => {
						// A PROMISE THAT IS STARTING TO BECOME A CALLBACK HELL WTF
						var msg = {
						  to: mailRecipients,
						  from: 'cadastro@identificacaowago.com.br',
						  subject: 'Ficha cadastral do cliente ' + data.nome ,
						  html: html,
						  reply_to: {
						  	email: 'adm.br@wago.com'
						  },
						  attachments: attachments
						};

						sgMail
						    .send(msg)
						    .then((result) => {
						    	console.log('Mail sent successfully');
						    	// console.log(result[0].caseless.dict['x-message-id']);
						    	company.findOne({
						    		where: {
						    			uuid: data.uuid
						    		}
						    	}).then((company) => {
						    		company.update({
									    emailSent: result[0].caseless.dict['x-message-id']
									}).then(() => {
										resolve();
									})
						    	}) 
						  	})
						    .catch(err => {
						    	console.error("ERROR: " + err);
						    });

					})
					.catch(err =>{
						console.error("ERROR: " + err);
					});
				})
				.catch(err =>{
					console.error("ERROR: " + err);
				});
		});  		  
	}






	//  get @array of filenames and return array of attachemtns with objects:
	//   attachments:[
	//	 	  {
	//	   	      content:  @base64 encodede file,
	//	   		  type: 'application/pdf',
	//		   	  filename: @filename		  		
	//	 	  }
	//   ]





	function encodeBase64(file) {
		var filePath =  path.resolve(__dirname, '../files/' + file);
		var readFile = fs.readFileSync(filePath);		
		return new Promise((resolve) => {
			var base64File = new Buffer(readFile).toString('base64');
			// resolve(base64File)
			resolve({content: base64File, filename: file});
		});
	}


	function prepareAttachments(files) {
		return new Promise((resolve) => {
				var codingQueue = [];

				for (var i = files.length - 1; i >= 0; i--) {
					console.info(files[i]);
					console.info('for123');					
					files.push(files[i]);
					codingQueue.push(encodeBase64(files[i]));
				}
				Promise.all(codingQueue)
					.then((results) => {							
						resolve(results);		
					})
					.catch(err => {
						console.error(err);
					})


		});

		return new Buffer(file).toString('base64');
	}



	function downloadFile(filename) {
		return new Promise((resolve) => {
			const options = {
			    // The path to which the file should be downloaded, e.g. "./file.txt"
			    destination: path.resolve(__dirname, '../files/' + filename)
			};

		 	storage
    			.bucket(bucketName)
		    	.file(filename)
		    	.download(options)
			    .then(() => {
				    console.info('yay, file downloaded:');
				    console.info(filename);
				    resolve(filename);
	  			})
			.catch(err => {
			  console.error('ERROR:', err);

			});			
		});
	}


	

	
  
};


/**
 * GET /
 * verify status of sent mails job
 */
exports.checkSentMails = (req, res) => {
	return res.status(200).send('"success"');
	
	console.info(id);
	console.info('functionm');

	var options = {
  		url: 'https://api.sendgrid.com/v3/messages?limit=1&msg_id%3D%22' + id + '%22' ,
		headers: {
		  'Authorization': 'Bearer ' +  process.env.SENDGRID_API_KEY
		}
	};
	console.info(options.url);

    request(options, function(err, response, body) {
	    // Some processing is happening here before the callback is invoked	
	           
        	
		    
	}).on('response', function(response) {
		var resp = JSON.parse(response.body);
    	console.info(resp);
  	}); 
  
};


