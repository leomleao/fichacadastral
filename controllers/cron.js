/**
 * GET /
 * send emails job
 */
exports.email = (req, res) => {
	return res.status(200).send('"success"');
	


	function sendEmail(){
		var date = new Date();
		var current_hour = date.getHours();
		var time;

		if (current_hour <= 11 && current_hour >= 6) {
			time = 'morning'
		} else if (current_hour >= 12 && current_hour <= 18) {
			time = 'afternoon'
		} else {
			time = 'night'
		}
		var file = fs.readFileSync(destinationPDF);
		var base64File = new Buffer(formPDF).toString('base64');

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

			sgMail
			    .send(msg)
			    .then((result) => {console.log('Mail sent successfully');
			  		return true;  
			  	})
			    .catch(error => console.error(error.toString()));
		               		
		});
	}
  
};



// /**
//  * GET /
//  * fill forms job
//  */
// exports.fillForms = (req, res) => {
  
// };


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


