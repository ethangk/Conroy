var socket = io('http://localhost:12345');

console.log("running job runner");

var runningJobs = {};

socket.on('connect', function(){
  console.log("connection received");
});

socket.on('initTask', function(task) {
  runningJobs[task.taskId] = task; // new task to work on
});

socket.on('taskPiece', function(taskPiece) {

  var task = runningJobs[taskPiece.taskId];
  if (task !== undefined) {
	var data = [];
	for(var i = 0; i < taskPiece.data.length; i++) {
		data.push(taskPiece.data[i].value);
	}
    	var p = new Parallel(data);
	eval(task.code);	
	function ret() {
		var ret_data = [];
		for(var i = 0; i < arguments[0].length; i++) {
			console.log(arguments[0][i]);
			ret_data.push({value: arguments[0][i], pieceId: taskPiece.data[i].pieceId});
		}
		socket.emit(task.ret, {taskId: taskPiece.taskId, data:ret_data});
	}
	p.map(remote_fn).then(ret);	
  } else {
    console.log("non-existing job for that piece. ignore");
  }

});

socket.on('disconnect', function(){
  console.log("disconnect happened");

});
