const uuidv4            = require('uuid/v4');
const { StringDecoder } = require('string_decoder');
const decoder           = new StringDecoder('utf8');
const fs                = require('fs');
const path              = require('path');
const request           = require('request'); // https://www.npmjs.com/package/request



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
	// var sourcePDF = './public/form-ficha-cadastral-WAGO.pdf';
	var destinationPDF =  path.resolve(__dirname, '../files/' + req.body.uuid + '_#_ficha-cadastral.pdf'); ;
	// var destinationPDF =  path.resolve(__dirname, '../files/larou.pdf'); 
	// var destinationPDF =  './files/larou.pdf'; 



	var data = {
	    'nome': req.body.nome,
	    'fantasia': req.body.fantasia,
	    'cnpj': req.body.cnpj,
	    // 'ie': req.body.ie,
	    'aplicacao': req.body.aplicacao,
	    'im': req.body.im,
	    // 'icms': req.body.icms,
	    // 'suframa': req.body.suframa,
	    'emailXML': req.body.emailXML,
	    'atividade_principal': req.body['atividade_principal[0][code]'] + " - " + req.body['atividade_principal[0][text]'],
	    'logradouro': req.body.logradouro,
	    'numero': req.body.numero,
	    'cep': req.body.cep,
	    'bairro': req.body.bairro,
	    'municipio': req.body.municipio,
	    'uf': req.body.uf,
	    'nomeFinanceiro': req.body.nomeFinanceiro,
	    'telFinanceiro': req.body.telFinanceiro,
	    'emailFinanceiro': req.body.emailFinanceiro

	};
	 
	pdfFiller.fillFormWithOptions( sourcePDF, destinationPDF, data, false, './files/temp', function(err) {
	    // if (err) throw err;

		// using SendGrid's v3 Node.js Library
		// https://github.com/sendgrid/sendgrid-nodejs
		const sgMail = require('@sendgrid/mail');
		sgMail.setApiKey(process.env.SENDGRID_API_KEY);
		const msg = {
		  to: 'leonardo.leao@wago.com',
		  from: 'test@example.com',
		  subject: 'Ficha cadastral do cliente ' + req.body.cnpj,
		  text: req.body.nome,
		  html: '<strong>'req.body.nome'</strong>',
		};
		sgMail.send(msg);

	    return res.status(200).send('Deu tudo certo parça!');
	});
  	
}



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

function sendMail(){
	// using SendGrid's v3 Node.js Library
	// https://github.com/sendgrid/sendgrid-nodejs
	const sgMail = require('@sendgrid/mail');
	sgMail.setApiKey(process.env.SENDGRID_API_KEY);
	const msg = {
	  to: 'test@example.com',
	  from: 'test@example.com',
	  subject: 'Sending with SendGrid is Fun',
	  text: 'and easy to do anywhere, even with Node.js',
	  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
	};
	sgMail.send(msg);

}


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
