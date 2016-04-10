var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var contestSchema = new Schema({
	date : {
		type : String
	},
	time : {
		type : String
	},
	images : [{}],
	answer : {
		type : String,
		required : true
	},
	title : {
		type: String,
		required : true
	},
	caption : {
		type : String,
		required : true
	},
	answeredBy : [{
	}],
	difficulty : {
		type : String
	},
	score : {
		type : Number
	},
	duration : {
		type: Number
	},
	status :{
		type: Number,
		default : 1   // 1 : to be held, 2 : live, 3 : completed 
	}
});

module.exports = mongoose.model('contest', contestSchema);