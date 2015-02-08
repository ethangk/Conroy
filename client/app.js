var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

var job_code = fs.readFileSync('./public/job.js', {encoding:'utf8'});

app.get('/', function(req, res){
  res.sendFile((__dirname+'/index.html'));
});

app.use(express.static(__dirname + "/public"));

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('testEvent', function(msg){
		console.log(msg);
	});

  socket.on('result', function(result) {
    console.log("result received " + JSON.stringify(result));
  })

  var taskId = "myid";
  socket.emit('initTask', {taskId: taskId,
                           code: job_code,
			   ret: 'returnFn'
			});
  var x = [{value:'a', pieceId:1}, {value:'aa', pieceId:2},{value:'aaa', pieceId:3}];
  socket.emit('taskPiece', {taskId: taskId, data: x});

  socket.on('returnFn',function(arr, pieceId) {
	console.log(arr);
  });

})

var port = 12345;

http.listen(port, function(){
  console.log('listening on *:',port);
});
