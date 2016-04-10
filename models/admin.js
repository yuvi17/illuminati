var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var adminSchema = new Schema({
	firstName:{ 
		type: String, 
		required: true 
	},
	lastName:{ 
		type: String, 
		required: true 
	},
	email:{ 
		type: String, 
		required: true,
		unique: true  
	},
	password:{ 
		type: String, 
		required: true,
	},
	phone:{ 
		type: Number, 
		required: true
	}
});

module.exports = mongoose.model('admin', adminSchema);