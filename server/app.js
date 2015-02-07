var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

var jobs = require('./models/jobs.js');

var jobHandler = require('./jobHandler.js');

mongoose.connect("mongodb://efuser:password123@ds041841.mongolab.com:41841/efhackathon")

app.set('view engine', 'ejs');  

app.get('/', function(req, res){
  res.sendFile((__dirname+'/index.html'));
});

app.get('/joinJob/:jobId', function(req,res){
	console.log(req.params.jobId);
	// res.send(req.params.jobId);
	res.render("job", {jobId: req.params.jobId});
});

app.get('/createJob', function(req,res){
	jobs.makeItem(function(err, doc){
		if(err){
			console.log(err);
			res.send("Error");
		}
		else{
			res.send("Done");
			console.log("Done");
		}
	});
});

app.post('/createJob', function(req,res){
	jobs.makeItem(function(err, doc){
		if(err){
			console.log(err);
			res.send("Error");
		}
		else{
			res.send("Done");
			console.log("Done");
		}
	});
});

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('testEvent', function(msg){
		console.log(msg);
	});

	socket.on('disconnect', function(msg){
		jobHandler.leaveJob(msg, socket);
	});

	socket.on('joinJob', function(msg){
		jobHandler.joinJob(msg, socket);
	});
});

var port = 12345;

http.listen(port, function(){
  console.log('listening on *:',port);
});