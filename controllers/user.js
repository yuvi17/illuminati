var express = require('express');
var router = express.Router();
var passport = require('./auth.js');
var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
var flash = require('connect-flash');
var multer = require('multer'); // module for file upload
var fs = require('fs');
var path = require('path');
var moment = require('moment');
var users = mongoose.model('user');
var nodemailer = require('nodemailer');
var website = 'http://localhost:8000/'
// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport(
	'smtps://kumaryuvraj118%40gmail.com:yashuvashu@smtp.gmail.com');

// route to go to login page
router.get('/login', function(req,res,next){
	res.render('user/login.html',{
		error : req.flash('error'), success : req.flash('success')
	});
});

// route to check login page credentials

router.post('/login', passport.authenticate('userlogin', {
    successRedirect: '/user/home',
    failureRedirect: '/user/login',
    failureFlash:true })
);

// route to go to registration page
router.get('/',function(req, res, next){
	res.render('user/register.html',
		{error:req.flash('error'),success:req.flash('success')});
});
router.get('/register',function(req, res, next){
	res.render('user/register.html',
		{error:req.flash('error'),success:req.flash('success')});
});

// router to go to home page

router.get('/home', userValidate, function(req,res,next){
	res.render('user/home.html',{user : req.session.user});
});
// router to register a user

router.post('/register', function(req, res , next){
	var nick = req.body.nick;
	var password = req.body.password;
	var confirmPassword = req.body.confirmPassword;
	var email = req.body.email;
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	if(password.localeCompare(confirmPassword)!=0){ 
		// compare passwords
	  	req.flash('error','Passwords do not match. Please Check again.');
	  	res.redirect('/user/register');
  	}
  	else{
  		// if email exists in database, notify user.
  		var query = users.findOne({});
  		query.or([{'email':email},{'nick':nick}]);
  		query.exec(function(err, user) {
	  		if(user!=null){
	  			console.log(user);
	  			if(user.email == email){
	  				req.flash('error','E-mail is already registered. Please Register using a different E-mail or use Forgot Password for password recovery.');
	  			}
	  			else if(user.nick == nick){
	  				req.flash('error','The Nick is already taken');
	  			}
	  			res.redirect('/user/register');
	  		}
	  		else{
	  		// if no email exits, enter information to database.
	  		  
			  var newUser = new users({
			  	firstName 	: 	firstName,
			  	lastName 	: 	lastName,
			  	email 		:   email,
			  	password 	:   createHash(password),
			  	nick 		: 	nick
			  });
			  newUser.save(function(err, user) {
			  	if (err){
			  		console.log(err);
			  		req.flash('error','Database Error. Please Try again or Contact Admin if it persists.');
			  		res.redirect('/user/register');
			  	}
			  	else{
			  		// send success email to user
			  		req.flash('success','Registration Successfull. Please Login to Continue.');
			  		var mailOptions = {
					    from: 'kumaryuvraj118@gmail.com', // sender address
					    to: email, // list of receivers
					    subject: 'Welcome to QBIT', // Subject line
					    text: '<h2>Welcome to QBIT</h2>Hello '+firstName+
					    '<br>Thank You for signing up for QBIT. You can login after verifying your email by clicking '+
					    '<a href="'+website+'user/confirm/'+user._id+'">here</a>.<br>'+ 'You can also paste the link below in your browser to confirm.<br>'+
					    '<a href="'+website+'user/confirm/'+user._id+'">'+website+'user/confirm'+user._id+'</a><br><br>Regards,<br>Webmaster<br>QBIT', // plaintext body
					    html: '<h2>Welcome to QBIT</h2>Hello '+firstName+
					    '<br>Thank You for signing up for QBIT. You can login after verifying your email by clicking '+
					    '<a href="'+website+'user/confirm/'+user._id+'">here</a>.<br>'+ 'You can also paste the link below in your browser to confirm.<br>'+
					    '<a href="'+website+'user/confirm/'+user._id+'">'+website+'user/confirm'+user._id+'</a><br><br>Regards,<br>Webmaster<br>QBIT' // html body
					};

					// send a mail to admin about the new user
					var adminMailOptions = {
					    from: 'kumaryuvraj118@gmail.com', // sender address
					    to:'kumaryuvraj118@gmail.com', // list of receivers
					    subject: 'New user Registration.', // Subject line
					    text: 'Hello Admin,'+
					    'New Employer '+firstName+' '+lastName+
					    ' Has registered with the Email '+email+'.',// plaintext body
					    html: 'Hello Admin,<br>'+'New User '+firstName+' '+
					    	   lastName+' Has registered with the Email '+email+'.' // html body
					};

					// send mail with defined transport object
					transporter.sendMail(mailOptions, function(error, info){
						if(error){
							console.log(error);
						}else{
							console.log('Message sent: ' + info.response);
						}
					});
					transporter.sendMail(adminMailOptions, function(error, info){
						if(error){
							console.log(error);
						}else{
							console.log('Message sent: ' + info.response);
						}
					});
		  			res.redirect('/user/register');
			  	}
			  });
			}
		});
  	}
});

// route to verify email id
router.get('/confirm/:id', function(req, res, next) {
	users.update({_id: req.params.id},{
	  	$set:{
	  		emailVerified:true     // set emailVerified as true
	  	}
  	},function(err){
        if(err){
                console.log(err);
                req.flash('error','Invalid User. Please try Again');
                res.redirect('/');
        }
	});
	req.flash('error','Email Id Comfirmed. Please Login to Continue.');
	res.redirect('/user/login');
});

// function to create hash of passwords.
var createHash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

// function to check if the user is logged in
function userValidate(req,res,next){
	users.findById(req.user,function(err, user) {
		if(user!=null){
			req.session.user = user;
			next();
		}
		else {
			req.flash('Please Login to Continue');
      		res.redirect("/user/login");
		}
	});
}

module.exports = router;