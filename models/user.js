var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
	firstName : { 
		type  : String,
		required : true
	},
	lastName : {
		type : String,
		required : true
	},
	email : {
		type : String,
		required : true
	},
	nick : {
		type : String,
		required : true
	},
	password : {
		type : String,
		required : true
	},
	emailVerified : {
		type : Boolean,
		default : false
	}
});


module.exports = mongoose.model('user', userSchema);