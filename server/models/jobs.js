var mongoose = require('mongoose');

var schema = mongoose.Schema({
	name: String
});

var Job = mongoose.model("jobs", schema);

module.exports = {
	getItem: function(){

	},
	makeItem: function(cb){
		var NJ = new Job({name: "Test"});
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