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
		var len = uuid.v4();
		var pub = uuid.v4().slice(0, len/2);
		var pri = uuid.v4().slice(0, len/2);
		var NJ = new Job({name: name, publicId: pub, privateId: pri});
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