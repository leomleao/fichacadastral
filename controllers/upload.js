const uuidv4            = require('uuid/v4');
const { StringDecoder } = require('string_decoder');
const decoder           = new StringDecoder('utf8');
const fs                = require('fs');
const path              = require('path');
const request           = require('request'); // https://www.npmjs.com/package/request
var ejs                 = require('ejs');




// Imports the Google Cloud client library
const Storage = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();

// The name for the new bucket
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
//  * upload page.
//  */
// exports.test = (req, res) => {

// 	test++;
// 	if (test == 5){
// 		test = 0
//  		res.send(wago);
// 	} else {
//  		res.send("Too many requests, please try again later.");		
// 	}
// 	console.info(test);
			
// };


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
		    if (!err && response.statusCode == "200"){
		    	try {		       
	        	var resp = JSON.parse(response.body);
			    } catch (e) {
			        var resp = false;
			        console.info("deu ruim");
			        console.info(e);
			        return res.status(500).send(e);
			    }
		    	console.info(resp.status);

		    	if (resp.status == "OK"){
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
	// var jsonParser = bodyParser.json()
	let fullUrl = req.protocol + '://' + req.get('host');

	// if (!req.body) return res.sendStatus(400)
	console.info(req.body);
	

	var pdfFiller   = require('pdffiller'); 
	var sourcePDF = path.resolve(__dirname, '../public/form-ficha-cadastral-WAGO.pdf');
	var destinationPDF =  path.resolve(__dirname, '../files/' + req.body.uuid + '_#_ficha-cadastral.pdf'); ;

	var data = req.body;

	data.atividade_principal = req.body.atividade_principal[0].code + " - " + req.body.atividade_principal[0].text;


	var date = new Date();
	var current_hour = date.getHours();

	console.error(current_hour);

	var time;

	if (current_hour <= 11 && current_hour >= 6) {
		time = 'morning'
	} else if (current_hour >= 12 && current_hour <= 18) {
		time = 'afternoon'
	} else {
		time = 'night'
	}


	pdfFiller.fillFormWithOptions( sourcePDF, destinationPDF, data, true, './files/temp', function(err) {
	    // if (err) throw err;

		// using SendGrid's v3 Node.js Library
		// https://github.com/sendgrid/sendgrid-nodejs
		const sgMail = require('@sendgrid/mail');

		sgMail.setApiKey(process.env.SENDGRID_API_KEY);

		var file = fs.readFileSync(destinationPDF);
		var base64File = new Buffer(file).toString('base64');

		const template = path.join(__dirname, '../views/pages/template-email.ejs');

		ejs.renderFile(template, {time:time,data:data},function (err, html) {

	        if (err) {
	            console.log("ERROR: " + err);
	            return false;
	        }

			var msg = {
			  to: 'leonardo.leao@wago.com',
			  from: 'test@example.com',
			  subject: 'Ficha cadastral do cliente ' + req.body.cnpj,
			  html: html,
			  reply_to: {
			  	email: 'adm.br@wago.com'
			  },
			  attachments:[
				  {
			  		content: base64File,
			  		type: 'application/pdf',
			  		filename: 'ficha-cadastral.pdf'		  		
				  }
			  ]
			};
			sgMail.send(msg);

		    return res.status(200).send(JSON.stringify('success'));       
	         
    	})

	});
  	
}


// function addAttachment (filePath)



/**
 * POST /
 * upload file.
 */
exports.uploadFile = (req, res) => {
	let fullUrl = req.protocol + '://' + req.get('host');
  	if (!req.files)
		return res.status(400).send('No files were uploaded.');

	// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
	let uploadedFile = req.files.file;

	// // Use the mv() method to place the file somewhere on your server
	let folderDest = path.resolve(__dirname, '../files/' + uploadedFile.name );

	  				

	uploadedFile.mv(folderDest, function(err) {
		if (err) {
			return res.status(500).send(err);
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

			  sendMail();
			
				
			return res.status(200).send('Arquivo recebido!');
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
