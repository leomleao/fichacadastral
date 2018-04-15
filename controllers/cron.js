const request    = require('request'); // https://www.npmjs.com/package/request
const path       = require('path');


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


/**
 * GET /
 * send emails job
 */
exports.email = (req, res) => {


	const sequelize = new Sequelize('mysql://'+ process.env.SQL_USER + ':' + process.env.SQL_PASSWORD + '@127.0.0.1:3306/' + process.env.SQL_DATABASE, { operatorsAliases: false });
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

	// initialize()								// {'emailRecipients':'emailRecipients'}
	// .then(chainObj => getCompanies (chainObj))	// {'emailRecipients':'emailRecipients', 'companies': 'query from Sequelize'}
	// .then(chainObj => getFiles (chainObj)) 		// {'emailRecipients':'emailRecipients', 'companies': 'query from Sequelize', 'files'" @array with files name"}
	// .then(chainObj => sendMail (chainObj))
	// // .then(results => test7 (results))
	// // .then(results => test1 (results))
	// .then((test) =>{
	// 	console.info(test);
	// })
	// .catch(err =>{
	// 	console.info(err);

	// });

	sendEmail();


	function initialize() {
		return new Promise(function(resolve, reject) {
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



	function getFiles(chainObj) {
		companies = chainObj.companies;
		query = [];		    
	    // Return new promise 
	    return new Promise(function(resolve) {
	    	for (var i = companies.length - 1; i >= 0; i--) {
	    		console.info(companies[i].dataValues.uuid);
	    		query.push(companies[i].dataValues.uuid);
	    	}
	    	console.info(query);

	    	file.findAll({
			  where: {
			    uuid: query
			  }
			})
			.then((files) => {
				console.info('Start of list - Files about to be downloaded:');
				var downloadQueue = [];
				var files = [];

				for (var i = files.length - 1; i >= 0; i--) {
					console.info(files[i].dataValues.filename);
					files.push(files[i].dataValues.filename);
					downloadQueue.push(downloadFile(files[i].dataValues.filename));
				}
				console.info('End of list - Files about to be downloaded.')				
				Promise.all(downloadQueue)
					.then(() => {
						chainObj.files = files;
						resolve(chainObj);		
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


	function sendEmail(chainObj){	

		return new Promise(function(resolve) {	

			const template = path.join(__dirname, '../views/pages/template-email.ejs');

			ejs.renderFile(template, {
				time:time,
				data:data
			})
			.then((html) => {


			})
			.catch(err =>{
				console.error("ERROR: " + err);
			});

		});
	      

			// var msg = {
			//   to: 'leonardo.leao@wago.com',
			//   from: 'test@example.com',
			//   subject: 'Ficha cadastral do cliente ' + req.body.cnpj,
			//   html: html,
			//   reply_to: {
			//   	email: 'adm.br@wago.com'
			//   },
			//   attachments:[
			// 	  {
			//   		content: base64File,
			//   		type: 'application/pdf',
			//   		filename: 'ficha-cadastral.pdf'		  		
			// 	  }
			//   ]
			// };

			// sgMail
			//     .send(msg)
			//     .then((result) => {console.log('Mail sent successfully');
			//   		return true;  
			//   	})
			//     .catch(error => console.error(error.toString()));
		  
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
		var file = fs.readFileSync(filePath);		
		return new Promise((resolve) => {
			var base64File = new Buffer(formPDF).toString('base64');
			// resolve(base64File)
			resolve(file);
		});
	}



	function prepareAttachments(files) {
		return new Promise((resolve) => {
				var codingQueue = [];

				for (var i = files.length - 1; i >= 0; i--) {
					console.info(files[i]);
					files.push(files[i].dataValues.filename);
					codingQueue.push(encodeBase64(files[i].dataValues.filename));
				}
				Promise.all(codingQueue)
					.then((results) => {
						// chainObj.files = files;
						console.info(results);		
						// resolve(results);		
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


