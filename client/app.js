var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile((__dirname+'/index.html'));
});

app.use(express.static(__dirname + "/public"));

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('testEvent', function(msg){
		console.log(msg);
	});

  socket.emit('taskRequest', { code: 'console.log("wtf man this is code"); return 6666;' });
});

var port = 12345;

http.listen(port, function(){
  console.log('listening on *:',port);
});
