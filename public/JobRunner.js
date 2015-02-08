var socket = io();

console.log("running job runner");

var runningJobs = {};

socket.on('connect', function(){
  console.log("connection received");
});

socket.on('initTask', function(task) {
  console.log('received', task);
  runningJobs[task.taskID] = task; // new task to work on
});

socket.on('taskPiece', function(taskPiece) {
  var task = runningJobs[taskPiece.taskId];
  if (task !== undefined) {
	var data = [];
	for(var i = 0; i < taskPiece.data.length; i++) {
		var item = taskPiece.data[i];
    		var p = new Parallel(item, {
			env: {
				remote_code:task.code
			}
		});

		p.spawn(function(data) {
			console.log(data);
			var fn = new Function("n", "return (" + global.env.remote_code + ")(n);");
			return {pieceId: data.pieceId, value: fn(data.value)};
		}).then(function(data) {
			console.log(data);
			socket.emit(task.ret, data, taskPiece.taskId);
		});	
	}
  	} else {
    		console.log("non-existing job for that piece. ignore");
  	}

});


socket.on('finishJob', function (taskId)  {
  delete runningJobs[taskId]
});

socket.on('disconnect', function(){
  console.log("disconnect happened");

});
