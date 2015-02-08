var bodyParser = require('body-parser');
var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var path = require('path');
var jobs = require('./models/jobs.js');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

var jobHandler = require('./jobHandler.js');

var roomsStructure = {};

// parse application/json
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

mongoose.connect("mongodb://efuser:password123@ds041841.mongolab.com:41841/efhackathon");

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
	res.render("createJob");
});

app.post('/createJob', function(req,res){

	//console.log(req.body);
	jobs.makeItem(req.body.name, function(err, doc){
		if(err){
			console.log(err);
			res.send("Error");
		}
		else{
			res.writeHead(302, {'Location': '/viewJob/'+doc.privateId});
			res.end();
			//res.send({redirect: "/"});
			console.log("Done");
		}
	});
});

app.get("/viewJob/:privateId", function(req, res) {
	var id = req.params.privateId;
	jobs.getItem(id, function(err, doc){
		if (err){
			res.send("Error");
		}
		else{
			res.render("viewJob",{job: doc});
		}
	});
})


io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('testEvent', function(msg){
		console.log(msg);
	});

	socket.on('disconnect', function(msg){
		jobHandler.leaveJob(msg, socket, roomsStructure);
	});

	socket.on('joinJob', function(msg){
		jobHandler.joinJob(msg, socket, roomsStructure);
	});
});

var port = 12345;

http.listen(port, function(){
  console.log('listening on *:',port);
});