const uuidv4 = require('uuid/v4');
const path   = require('path');



/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  let uuid = uuidv4();
  res.render('pages/index', {
    title: 'Home',
    uuid: uuid
  });
};


/**
 * GET /
 * Home page.
 */
exports.pageReview = (req, res) => {
  	let uuid = uuidv4();
  	var date = new Date();
	var current_hour = date.getHours();

	console.error(current_hour);

	var time;
	var data = {  
	   nome:'WAGO ELETROELETRONICOS LTDA.',
	   uf:'SP',
	   situacao:'ATIVA',   
	   municipio:'JUNDIAI',   
	   fantasia:'WAGO',
	   cnpj:'07.384.827/0001-95',   
	   capital_social:'24737500.00'
	};

	if (current_hour <= 11 && current_hour >= 6) {
		time = 'morning'
	} else if (current_hour >= 12 && current_hour <= 18) {
		time = 'afternoon'
	} else {
		time = 'night'
	}

  res.render('pages/template-email', {
    time: time,
    data: data
  });
};


/**
 * GET /
 * Home page.
 */
exports.test = (req, res) => {
	
	var ejs  = require('ejs');
	var fs   = require('fs');
	var data = {} // put your data here.
	var pdf = require('html-pdf');


	console.error(path.join(__dirname, '../public'))

	var config = {

	 
	  "format": "A4",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
	  "orientation": "portrait", // portrait or landscape
	 
	  // Page options
	  "border": "40px",             // default is 0, units: mm, cm, in, px
	  	 
	 
	  // Rendering options
	  // "logo": "file://" + path.join(__dirname, '../public/logo.png'), // Base path that's used to load files (images, css, js) when they aren't referenced using a host
	 
	 	 
	}


	const template = path.join(__dirname, '../views/pages/template-form.ejs');

	ejs.renderFile(template, function (err, html) {
        if (err) {
            console.log("ERROR: " + err);
            return false;
        }

        html = html.replace('{{logo}}', `file:///${require.resolve('../public/logo.png')}`);
        html = html.replace('{{css}}', `file:///${require.resolve('../public/css/template-form.css')}`);
    
        res.send(html);


        pdf.create(html, config).toFile('./businesscard.pdf', function(err, res) {
		  if (err) return console.log(err);
		  console.log(res); // { filename: '/app/businesscard.pdf' }
		})        

    })


	// var options = {
	// 	root: path.join(__dirname, '../views/'),
	// 	debug: true
	// }
	
	// var html = ejs.render(viewsDir, options, function (err, html) {
 //        if (err) {
 //            console.log("ERROR: " + err);
 //            return false;
 //        }
	// 	// pdf.create(html, config).toFile('./businesscard.pdf', function(err, res) {
	// 	//   if (err) return console.log(err);
	// 	//   console.log(res); // { filename: '/app/businesscard.pdf' }
	// 	// });      


 //    });

};
