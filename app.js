var express = require('express');  // include express module
 
var app = express();    /// use express module

var bodyParser = require("body-parser");  // include body-parser

var fs = require('fs');					// include fs for file handling

var mongoose = require('mongoose');     // include mongoose for database connection

var session = require('express-session');  // include session handling module

var path = require('path');     // include path handling module
 
var favicon = require('serve-favicon'); // include favicon module

var logger = require('morgan');  // include logging module

var swig = require('swig'); // include swig as template engine

var flash = require('connect-flash'); // include flash message module

var cookieParser = require('cookie-parser');  // include cookie parser

var passport = require('passport'); // passport module for authentication.

var moment = require('moment');  // moment library for time


// initialize express session before passport session.

app.use(session(
  {
    secret:"hY797S2APCzSkjhgndFbsngMSd7dy",   // secret key for session handling
    resave: true,
    saveUninitialized: true 
  }
)); 

// use of passport module for authentication

app.use(passport.initialize());

app.use(passport.session());  // initialize passport session

/** passport code ends **/

/* database connection */

mongoose.connect('mongodb://localhost:27017/illuminati');  // DB name = "theKnow"

mongoose.connection.once('open', function() {

  console.log("database connection open success"); // connected to database successfully

});

// setups required

app.set('views', path.join(__dirname, 'views'));   // set up view engine as swig

app.engine('html', swig.renderFile);

app.set('view engine', 'html');

app.use(bodyParser.urlencoded({extended : true})) // enable urlencoded format.

app.use(bodyParser.json());   // use json format

app.use(flash());  // use flash messages.

app.use(express.static('assets')); // path for static files(css,js etc.)



// code to include models and controllers and views

var models_path='./models';

fs.readdirSync(models_path).forEach(function(file) {    // including models in the app
	if(~file.indexOf('js'))
		require(models_path+'/'+file);
});

// code to include controllers
var user    = require('./controllers/user');
var admin   = require('./controllers/admin');
var contest = require('./controllers/contest');

/* Use all controllers */

// for user
app.use('/user', user);
// for admin
app.use('/admin',admin);
// for contests
app.use ('/contest',contest);
/* Add public directoy for css,js etc.*/

// for user
app.use('/user',express.static(path.join(__dirname, 'assets')));
// for admin
/*
app.use('/admin',express.static(path.join(__dirname,'assets')));

*/
app.get('', function (request, response){
	response.render('index.html',{err:null});

});

// command to start the server at port 8080, any port can be used if free.

app.listen(8000, function(){
	console.log("Node Server Using Express Running at Port 8000"); // server started successfully
});


module.exports = app;
