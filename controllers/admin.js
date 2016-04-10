var express = require('express');
var router = express.Router();
var passport = require('./auth.js');
var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
var flash = require('connect-flash');
var path = require('path');
var moment = require('moment');
var admin = mongoose.model('admin');
var users = mongoose.model('user');
var website = "http://localhost:8000/"
var nodemailer = require('nodemailer');
// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport(
	'smtps://kumaryuvraj118%40gmail.com:yashuvashu@smtp.gmail.com');

/*routes */

// route to go to login page
router.get('/login', function(req,res,next){
	res.render('admin/login.html',{
		error : req.flash('error'), success : req.flash('success')
	});
});

// route to check login page credentials

router.post('/login', passport.authenticate('adminlogin', {
    successRedirect: '/admin/home',
    failureRedirect: '/admin/login',
    failureFlash:true
}));

// router to logout an admin

router.get('/logout', function(req, res) {
	req.logout();
  	req.session.destroy()
	res.redirect('/');
});


// routes to create new admin

router.get('/create', adminValidate , function(req,res,next){
	res.render('admin/create.html',
		{error : req.flash('error'),success:req.flash('success'),user: req.session.user});
});

// route to get all users 

router.get('/users', adminValidate, function(req, res, next){
	users.find(function(err, users){
		if(err){
			console.log(err);
			req.flash('error',"Contact Webmaster for more help");
			res.render('admin/users.html',{
				error:req.flash('error'),
				user :req.session.user 		
			});
		}
		else{
			res.render('admin/users.html',{
				error:req.flash('error'),
				userData : users,
				user : req.session.user
			})
			console.log(users);
		}
	})
});


// route to create new admin

router.post('/create', adminValidate, function(req,res,next){
	var phone = req.body.phone;
	var password = req.body.password;
	var confirmPassword = req.body.confirmPassword;
	var email = req.body.email;
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	if(password.localeCompare(confirmPassword)!=0){ 
		// compare passwords
	  	req.flash('error','Passwords do not match. Please Check again.');
	  	res.redirect('/admin/create');
  	}
  	else{
  		// if email exists in database, notify user.
  		admin.findOne({'email':email},function(err, user) {
	  		if(user!=null){
	  			req.flash('error','E-mail already registered. Please Register using a different E-mail or use Forgot Password for password recovery.');
	  			res.redirect('/admin/create');
	  		}
	  		else{
	  		// if no email exits, enter information to database.
	  		  
			  var newAdmin = new admin({
			  	firstName 	: 	firstName,
			  	lastName 	: 	lastName,
			  	email 		:   email,
			  	password 	:   createHash(password),
			  	phone 		: 	phone
			  });
			  newAdmin.save(function(err, user) {
			  	if (err){
			  		console.log(err);
			  		req.flash('error','Database Error. Please Try again or Contact Admin if it persists.');
			  		res.redirect('/admin');
			  	}
			  	else{
			  		// send success email to user
			  		req.flash('success','Admin created successfully');
			  		var mailOptions = {
					    from: 'kumaryuvraj118@gmail.com', // sender address
					    to: email, // list of receivers
					    subject: 'Welcome to QBIT', // Subject line
					    text: '<h2>Welcome to QBIT</h2>Hello '+firstName+
					    '<br>You have been made an Admin for QBIT. You can login after verifying your email by clicking '+
					    '<a href="'+website+'admin/confirm/'+user._id+'">here</a>.<br>'+ 'You can also paste the link below in your browser to confirm.<br>'+
					    '<a href="'+website+'admin/confirm/'+user._id+'">'+website+'admin/confirm'+user._id+'</a><br><br>Regards,<br>Webmaster<br>QBIT', // plaintext body
					    html: '<h2>Welcome to QBIT</h2>Hello '+firstName+
					    '<br>You have been made an Admin for QBIT. You can login after verifying your email by clicking '+
					    '<a href="'+website+'admin/confirm/'+user._id+'">here</a>.<br>'+ 'You can also paste the link below in your browser to confirm.<br>'+
					    '<a href="'+website+'admin/confirm/'+user._id+'">'+website+'admin/confirm'+user._id+'</a><br><br>Regards,<br>Webmaster<br>QBIT' // html body
					};

					// send a mail to admin about the new user
					var adminMailOptions = {
					    from: 'kumaryuvraj118@gmail.com', // sender address
					    to:'kumaryuvraj118@gmail.com', // list of receivers
					    subject: 'New user Registration.', // Subject line
					    text: 'Hello Admin,'+
					    'You have created New admin'+firstName+' '+lastName+
					    ' with the Email '+email+'.',// plaintext body
					    html: 'Hello Admin,<br>'+'You have created new Admin '+firstName+' '+
					    	   lastName+'with the Email '+email+'.' // html body
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
		  			res.redirect('/admin/create');
			  	}
			  });
			}
		});
  	}
  });

// route to go to home page
router.get('/home', adminValidate, function(req, res, next){
	res.render('admin/home.html',{error:req.flash('error'),
						user:req.session.user});
});


// route to create a new summer slam contest


// function to create hash of passwords.
var createHash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

// function to validate if admin is logged in

function adminValidate(req,res,next){
	admin.findById(req.user,function(err, user) {
		if(user!=null){
			req.session.user = user; //if logged in,assign data in session
			next();
		}else{
			req.flash('error',"Please Login to Continue");
			res.redirect('/admin/login');	 // redirect to login page			
		}
	});
}

module.exports = router;
