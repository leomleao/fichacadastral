const uuidv4 = require('uuid/v4');
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');
// const Cnpj = require('../models/Cnpj');
const fs = require('fs');
const path = require('path');
// const CNPJ = require("cpf_cnpj").CNPJ;
// const Excel = require('exceljs');
const request = require('request'); // https://www.npmjs.com/package/request
var grid = require('gridfs-stream');
    // , async = require('async'); // https://www.npmjs.com/package/asyn

// var wago = JSON.parse(fs.readFileSync('test.json', 'utf8'));

var company = require('../models/company');

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


// validCnpjs.push(cnpjsArray[i]);

// 			var company = new Empresa({
// 			  uuid: uuid,
// 			  ie: cnpjsArray[i]
// 			});

// 			company.save(function(err) {
// 			  if (err) throw err;
// 			  savedCnpjs.push(cnpjsArray[i]);

// 			  console.log("saved " + savedCnpjs.length + " out of " + cnpjsArray.length)


// 			  console.log('Cnpj saved successfully!', cnpjsArray[i]);
// 			  if(i=0){
// 			  console.log('Done');


// 			  }
// 			});
			// console.log('File uploaded : ' + files.file.path);
   //        	grid.mongo = mongoose.mongo;
   //        	var conn = mongoose.createConnection('..mongo connection string..');
   //        	conn.once('open', function () {
   //        	var gfs = grid(conn.db);

   //        	var writestream = gfs.createWriteStream({
   //            filename: files.file.name
   //        	});

   //        	fs.createReadStream(files.file.path).pipe(writestream);
  	// 	 	});


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
				var writestream = grid.createWriteStream({
	               filename: uploadedFile.name,
	               root: 'company'
	          	});
				fs.createReadStream(folderDest).pipe(writestream);	

			return res.status(200).send('Arquivo recebido!');
		}

	});

};
