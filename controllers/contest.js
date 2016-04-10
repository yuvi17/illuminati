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
var contests = mongoose.model('contest');
var admin = mongoose.model('admin');
var nodemailer = require('nodemailer');
var website = 'http://localhost:8000/'
var moment = require('moment');

moment().format();
// route to go view create contest page
router.get('/create', adminValidate, function(req,res,next){
	res.render('admin/createContest.html',{error : req.flash('error'),
							user:req.session.user,success : req.flash('success')});
});

// route to create new contest

router.post('/create', adminValidate , function(req,res,next){
	var date = req.body.date;
	var time = req.body.time;
	var answer = req.body.answer;
	var confirmAnswer = req.body.confirmAnswer;
	var duration = req.body.duration;
	var title = req.body.title;
	var caption = req.body.caption;
	if(answer.localeCompare(confirmAnswer)!= 0){
		// compare passwords
	  	req.flash('error','Answers do not match. Please Check again.');
	  	res.redirect('/contest/create');
	}
	else{
		var newContest = new contests({
			title 	: title,
			caption : caption,
			date	: date,
			time	: time,
			answer 	: answer,
			duration: duration
		});
		newContest.save(function(err,contest){
			if(err){
				console.log(error);
				req.flash('error',"Some internal error occoured");
				res.redirect('/contest/create');
			}
			else{
				req.flash('success',"Contest created, Upload Quesiton Images");
				req.flash('contestId',contest._id);
				res.redirect('/contest/upload/'+contest._id);
			}
		});
	}
});

// route to go to upload page
router.get('/upload/:id', adminValidate, function (req,res,next){
	res.render('admin/upload.html',{error : req.flash('error'),
		contest : req.params.id,success : req.flash('success'),
		user:req.session.user});
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null,'/projects/illuminati/assets/images/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, req.user + path.extname(file.originalname))
  }
})

// function to upload images
var uploads = multer({storage : storage});

var upload = uploads.any();

// function to store path of uploaded images in database
router.post('/upload/:id',adminValidate,function(req,res,next){
	upload(req,res,function(err){
		if(err){
			console.log(err);
			req.flash('error',"Error in Uploading");
		}
		else{
			console.log(req.file);
			req.flash('success',"Image Uploaded Successfully");
			res.redirect('/contest/upload/'+req.params.id);
		}
	});
});

// function to make a contest live
router.get('/check', function(req,res,next){
	contests.find(function(err, users){
		if(err){
			console.log(err);
		}
		else{
			var length = users.length;
			for(var i = 0 ; i<length ; i++){
				var contest = users[i];
				var datecontest = {
					date 	:	moment(contest.date,"DD MMM YYYY").get('date'),
					month 	:	moment(contest.date,"DD MMM YYYY").get('month'),
					year 	:  	moment(contest.date,"DD MMM YYYY").get('year'),
					hour	: 	moment(contest.time,"h hh a").get('hour'),
					minutes : 	moment(contest.time,"h hh a").get('minutes')
				}
				var today 	= {
					date 	:	moment().get('date'),
					month 	:	moment().get('month'),
					year 	:  	moment().get('year'),
					hour	: 	moment().get('hour'),
					minutes : 	moment().get('minutes')
				}
				console.log(datecontest);
				console.log(today);
				if(datecontest.date == today.date &&
					datecontest.month == today.month &&
					datecontest.year == today.year){
						var contestTime = datecontest.hour*100 + datecontest.minutes;
						var localTime = today.hour*100 + today.minutes;
						var duration =  contest.duration*100;
						console.log(localTime);
						console.log(contestTime);
						console.log(duration);
						if(Math.abs(localTime - contestTime) < duration){
							contests.findByIdAndUpdate(contest._id,{
								$set : {
									status : 2 // 2 means a live contest
									}
								},function(err,user){
									if(err){
										console.log(err);
									}
									else{
										console.log("live contest");
																				res.end();
									}
								}
							);
						}
						else if((localTime - contestTime) > duration){
							contests.findByIdAndUpdate(contest._id,{
								$set : {
									status : 3 // 3 means a completed contest
									}
								},function(err,user){
									if(err){
										console.log(err);
									}
									else{
										
									}
								}
							);
							console.log("contest is done");
						}
						else{
							console.log("Not started");
						}
				}
				else{
					console.log("date ahead");
				}
				res.send();
			}
		}
	});
});
//router to get all live contests

router.get('/live', userValidate , function(req,res,next){
	contests.findOne({'status' : 2}, function(err, contestData){
		if(err){
			console.log(err);
			req.flash('error', "Some error has occoured");
			res.redirect('/user/home');
		}
		else{
		res.render('user/live.html',{error : req.flash('error'),
					success : req.flash('success'),contest : contestData });
		}
	});
});

// router to get completed contest

router.get('/upcoming', userValidate , function(req,res,next){
	contests.find({'status' : 1}, function(err, contestData) {
		if(err){
			console.log(err);
			req.flash('error',"Some error has occoured");
			res.redirect('/user/home');
		}
		else{
			res.render('user/upcoming.html',{error : req.flash('error'),
				contests : contestData});
		}
	});
});

// to check if user is an admin
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

// to check if user is logged in
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
