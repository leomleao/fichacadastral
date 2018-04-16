const uuidv4  = require('uuid/v4');
const path    = require('path');
const request = require('request'); // https://www.npmjs.com/package/request


const Sequelize = require('sequelize'); 
// Or you can simply use a connection uri

// const sequelize = new Sequelize(process.env.SQL_DATABASE, process.env.SQL_USER, process.env.SQL_PASSWORD, {
//   dialect: 'mysql',
//   operatorsAliases: false,
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   },
// });

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


	const sequelize = new Sequelize('mysql://'+ process.env.SQL_USER + ':' + process.env.SQL_PASSWORD + '@127.0.0.1:3306/' + process.env.SQL_DATABASE);
	const company = sequelize.import(path.join(__dirname, '../models/company'));

	// sequelize
	//   .authenticate()
	//   .then(() => {
	//     console.log('Connection has been established successfully.');
	//   })
	//   .catch(err => {
	//     console.error('Unable to connect to the database:', err);
	// });
	//   Post.findAll({
	//   where: {
	//     authorId: 2
	//   }
	// });
	const config = sequelize.import(path.join(__dirname, '../models/configuration'));

	// force: true will drop the table if it already exists
	config.sync({force: true}).then(() => {	  // Table created
	  return config.create({
		    type: 'email',
		    value: 'leonardo.leao@wago.com'
		  });
	});

	// company.findOne({
	// 	  where: {
	// 	    uuid: '91ui2jd9u12hd9u12dh8129udsh9u12hdd912hd912d'
	// 	  }
	// 	}).then(users => {
	//   console.log(users)
	//   sequelize.close();
	// })



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

/**
 * GET /
 * Home page.
 */
exports.test2 = (req, res) => {

	const sequelize = new Sequelize(process.env.SQL_DATABASE, process.env.SQL_USER, process.env.SQL_PASSWORD, {
		dialect: 'mysql',
		dialectOptions: {	      
	    	socketPath: '/cloudsql/omega-zeta:southamerica-east1:mount-cylene'
	    },
	    port: 5432	
	});

	sequelize
	  .authenticate()
	  .then(() => {
	    console.log('Connection has been established successfully.');
	  })
	  .catch(err => {
	    console.error('Unable to connect to the database:', err);
	});

return res.status(200).send('teste');

    
};




 	