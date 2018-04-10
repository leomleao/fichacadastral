
const mongoose = require('mongoose');

const dotenv = require('dotenv');

const path = require('path');

const Cnpj = require('./models/Cnpj');

const CNPJValidator = require("cpf_cnpj").CNPJ;

const request = require('request');

const async = require('async'); 




/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env' });

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });

var validCnpjs = [];

var cnpjs = Cnpj.find({status: null}).cursor();

cnpjs.on('data', function(doc) {
  // Called once for every document
  // console.info(doc);
  validCnpjs.push(doc);
});

cnpjs.on('close', function(doc) {
  // Called once for every document
  console.info('done');
  var myUrls = [];
	for (var i = validCnpjs.length - 1; i >= 0; i--) {
		
		myUrls.push('http://www.receitaws.com.br/v1/cnpj/' + CNPJValidator.strip(validCnpjs[i]))
				
	}

	console.info("about to process");
	console.info(myUrls.length);


	async.mapLimit(myUrls, 1,function(url, callback2) {
		var test22 = false;

		async.until(
		    function() { return test22; },
		    function(callback) {
		        var r = request(url, function(error, response, body) {
			    // Some processing is happening here before the callback is invoked
			    if (!error){
			    	console.info(response.body);  
			    	console.info(response.statusCode);
			    }
			    	if (!error && response.statusCode === 200 && body != "Too many requests, please try again later.") {	
						test22 = true;
				        callback(error, response, body);
			    	} else if (!error && response.statusCode === 504){			    		
						test22 = true;
			    		callback(error, null);

			    	} else {
			    		callback(error, null);
				      // some code   
			    	}
						    		    

			  })
		    },
		    function (err, response) {
		    	callback2(err, response); 		       
		    }
		);


	}, function(err, results) {

		try
	    {
	        for (var i = results.length - 1; i >= 0; i--) {
	        	if (results[i]){

					const regex = /\d{14}/g;
				    // console.info(currentCpnj[0]);
				    console.info(i);
				    try {	
				        let currentCpnj = regex.exec(results[i].socket._httpMessage.path);
			        	var resp = JSON.parse(results[i].body);
				    } catch (e) {
				        var resp = false;
				        console.info("deu ruim");
				        console.info(e);
				        console.info(results[i].body);

				    }
				    if (resp && resp.status == "OK"){			    	


				    	Cnpj.findOne({ cnpj: CNPJValidator.strip(resp.cnpj)}, function (err, doc){
							doc.cnpjFormatted          = resp.cnpj;
							doc.status                 = resp.status;
							doc.ultima_atualizacao     = resp.ultima_atualizacao;
							doc.tipo                   = resp.tipo;
							doc.abertura               = resp.abertura;
							doc.nome                   = resp.nome;
							doc.fantasia               = resp.fantasia;
							doc.atividade_principal[0] = resp.atividade_principal.code;
							doc.atividade_principal[1] = resp.atividade_principal.text;
							doc.natureza_juridica      = resp.natureza_juridica;
							doc.logradouro             = resp.logradouro;
							doc.numero                 = resp.numero;
							doc.complemento            = resp.complemento;
							doc.cep                    = resp.cep;
							doc.bairro                 = resp.bairro;
							doc.municipio              = resp.municipio;
							doc.uf                     = resp.uf;
							doc.email                  = resp.email;
							doc.telefone               = resp.telefone;
							doc.efr                    = resp.efr;
							doc.situacao               = resp.situacao;
							doc.data_situacao          = resp.data_situacao;
							doc.motivo_situacao        = resp.motivo_situacao;
							doc.situacao_especial      = resp.situacao_especial;
							doc.data_situacao_especial = resp.data_situacao_especial;
							doc.capital_social         = resp.capital_social;
							doc.qsa                    = resp.qsa;
							doc.atividades_secundarias = resp.atividades_secundarias;

							// doc.visits.$inc();
  							doc.save(function (err) {
							  if (err) 
							  {
							  	console.error("deu muito ruim");
							  	console.error(err);
							  }
							  	console.error("deu bom");
							  // saved!
							});
				        


				    	});	


				   //  	conditions = { cnpj: CNPJValidator.strip(resp.cnpj) }

				   //  	options = {};


				   //  	data = {

							//  cnpj                   : resp.cnpj,                                      
							// 	status                 : resp.status,                                    
							// 	ultima_atualizacao     : resp.ultima_atualizacao,            
							// 	tipo                   : resp.tipo,                                        
							// 	abertura               : resp.abertura,                                
							// 	nome                   : resp.nome,                                        
							// 	fantasia               : resp.fantasia,                                
							// 	atividade_principal    : resp.atividade_principal,
							// 	natureza_juridica      : resp.natureza_juridica,              
							// 	logradouro             : resp.logradouro,                            
							// 	numero                 : resp.numero,                                    
							// 	complemento            : resp.complemento,                          
							// 	cep                    : resp.cep,                                          
							// 	bairro                 : resp.bairro,                                    
							// 	municipio              : resp.municipio,                              
							// 	uf                     : resp.uf,                                            
							// 	email                  : resp.email,                                      
							// 	telefone               : resp.telefone,                                
							// 	efr                    : resp.efr,                                          
							// 	situacao               : resp.situacao,                                
							// 	data_situacao          : resp.data_situacao,                                              
							// 	motivo_situacao        : resp.motivo_situacao,                                          
							// 	situacao_especial      : resp.situacao_especial,                                      
							// 	data_situacao_especial : resp.data_situacao_especial,    
							// 	capital_social         : resp.capital_social,                    
							// 	qsa                    : resp.qsa,                                          
							// 	atividades_secundarias : resp.atividades_secundarias

							// }; 

				   //  		Cnpj.update(conditions, options , data , function (err, numAffected) {
				   //  			console.info("############");
				   //  			console.info(numAffected);
				   //  			console.info(CNPJValidator.strip(resp.cnpj));				    			
				   //  			console.info("############");
							//   // numAffected is the number of updated documents
							// });		    			   

				    } 
				}
			}
	    }
	    catch( err ) {
	        // Return the error as JSON
	        console.error(err); 
	    }
	});

});

