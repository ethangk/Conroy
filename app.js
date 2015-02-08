var bodyParser = require('body-parser');
var express = require('express');
var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var path = require('path');
var jobs = require('./models/jobs.js');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

var jobHandler = require('./jobHandler.js');
var jobRouter = require('./jobRouter.js');
var transform = require('./codeTransform.js')


var roomsStructure = {};

// parse application/json
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.set('port', (process.env.PORT || 5000));

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

  console.log("PROGRAMMING language of choice is " + req.body.language);

	jobs.makeItem(req.body.name, req.body.jobValue, req.body.jobCode, req.body.language, req.body.reduceCode, function(err, doc){
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
			doc.code = escape(doc.code);
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
		console.log(roomsStructure);
		jobHandler.joinJob(msg, socket, roomsStructure);
	});

  socket.on('startJob', function(msg) {
    console.log("RECEIVED START JOB");

    console.log(roomsStructure);
    msg.code = unescape(msg.code);
    console.log(msg);
    transform.transformCode(msg.language, msg.code, function (transformedCode) {
       msg.code = transformedCode;
      jobRouter.jobStart(msg, roomsStructure, io);
    });
  });

  socket.on('result', function(msg, id) {jobRouter.incomingResult(msg, socket.id, id);});
});

var port = 12345;

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
