var mongoose = require('mongoose');
var uuid = require('node-uuid');

var schema = mongoose.Schema({
	name: String,
	publicId: String,
	privateId: String,
	progress: {type: Number, default: 0} 
});

var Job = mongoose.model("jobs", schema);

module.exports = {
	getItem: function(privateId, cb){
		Job.findOne({privateId: privateId}, function(err, doc){
			if (err) {
				cb(err);
			}
			else{
				console.log("got item");
				console.log(doc);
				cb(null, doc);
			}
		});
	},
	makeItem: function(name, cb){
		var NJ = new Job({name: name, publicId: uuid.v4(), privateId: uuid.v4()});
		NJ.save(function(err, doc){
			if(err){
				cb(err);
			}
			else{
				cb(null, doc);
			}
		});
	}
}