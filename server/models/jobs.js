var mongoose = require('mongoose');
var uuid = require('node-uuid');

var schema = mongoose.Schema({
	name: String,
	publicId: String,
	privateId: String,
	progress: {type: Number, default: 0},
	value: Array,
	code: String,
  language: String,
	reduceCode: String,
	dataLen: Number
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
				console.log("LOADED ITEM " + doc);
				cb(null, doc);
			}
		});
	},
	makeItem: function(name, value, code, language, reduceCode, cb){
		var pub = Math.random().toString(36).slice(2);
		var pri = Math.random().toString(36).slice(2);
		var splitVals = value.split('\n');
		for(var i = 0; i<splitVals.length; i++){
			splitVals[i] = splitVals[i].trim();
		}
		//console.log(NJ);
		var NJ = new Job({name: name, publicId: pub, privateId: pri, value: splitVals, code: code, dataLen: splitVals.length, language: language, reduceCode: reduceCode});
		console.log(NJ);
		NJ.save(function(err, doc){
			if(err){
				cb(err);
			}
			else{
				console.log("AFTER SAVE " + doc);
				cb(null, doc);
			}
		});
	}
}
