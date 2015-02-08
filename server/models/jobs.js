var mongoose = require('mongoose');
var uuid = require('node-uuid');

var schema = mongoose.Schema({
	name: String,
	publicId: String,
	privateId: String,
	progress: {type: Number, default: 0},
	value: Array,
	code: String 
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
	makeItem: function(name, value, code, cb){
		var pub = Math.random().toString(36).slice(2);
		var pri = Math.random().toString(36).slice(2);
		var splitVals = value.split('\n');
		for(var i = 0; i<splitVals.length; i++){
			splitVals[i] = splitVals[i].trim();
		}
		var NJ = new Job({name: name, publicId: pub, privateId: pri, value: splitVals, code: code});
		console.log(NJ);
		NJ.save(function(err, doc){
			if(err){
				cb(err);
			}
			else{
				console.log(doc);
				cb(null, doc);
			}
		});
	}
}