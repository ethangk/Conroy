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
    	var p = new Parallel(taskPiece.data);
	eval(task.code);	
	function ret() {
		socket.emit(task.ret, arguments);
	}
	p.map(remote_fn).then(ret);	
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
