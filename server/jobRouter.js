
module.exports = {
  jobStart: start,
  incomingResult: onResult
}

/*
job has
  unsolved
  underWork
  finished      
*/

// all running jobs
var jobs = {};
var io;
function start(msg, rooms, ioR) {
  io = ioR;
  var room = rooms[msg.jobId]
  var leader = room.leader;
  console.log(msg);
  msg.data = msg.data.split(',');
  var job = {room: room, taskId: msg.jobId, unsolved: msg.data, underWork: {}, finished: []};
  jobs[msg.jobId] = job;
  // assign ids to pieces
  console.log(msg);
  console.log(typeof msg.data);
  for (i = 0; i < job.unsolved.length; i++) {
    job.unsolved[i] = {value: job.unsolved[i], pieceId: i}
  }
  console.log(job);

  var code = 'function remote_fn(n){' + msg.code + '}';
  
  console.log("the code we are running is " + code);

  var task = {taskID: msg.jobId, code: code, ret: 'result'};
  for (i = 0; i < job.room.workers.length; i++) {
	io.to(job.room.workers[i]).emit('initTask', task); 
   }
  var index = 0;
  for (i = 0, _len = job.unsolved.length; i < _len; i++) {
    // todo: schedule a timer here to remove the job if it timeouts and put it back in 
    // unsolved


    assignPiece(job.unsolved.pop(), job.room.workers[index], job);

    index++;
    if (job.room.workers.length <= index) index = 0;
  }
}

function reAssignPiece(job, task, worker) {
	var index = 0;
	for(var i = 0; i < job.room.workers.length; i++) {
		if(job.room.workers[i] === worker) {
			index = i;
			break;
		}
	}
	
	delete job.room.workers[i];

	if(job.room.workers.length > 0) {
		assignPiece(task, job.room.workers[0], job);	
	} else {
		//todo this job failed
	}	
}

function assignPiece(next, worker, job) {

  // send 1 item to solve
  io.to(worker).emit('taskPiece', {taskId: job.taskId, data: [next]}) 
  var timeout = setTimeout(function() {
      reAssignPiece(job, next, worker);
  }, 30000);
  job.underWork[next.pieceId] = {piece: next, assignedWorker: worker, timeout: timeout}
  //set timeout
  
}

function onResult(msg, worker) {
  console.log("ON RESULT");
  var job = jobs[msg.taskId];
  console.log(job.underWork);
  console.log(msg);
  if(job.underWork[msg.data[0].pieceId].assignedWorker !== worker) {
  //wrong worker
  return;
  }
  console.log('finished ' + worker);
  for (i = 0; i < msg.data.length; i++) {
    var finishedWork = job.underWork[msg.data.pieceId];
    clearTimeout(job.underWork[msg.data[i].pieceId].timeout);
    delete job.underWork[msg.data[i].pieceId];
    job.finished.push(msg.data[i]);
  }
  if (job.unsolved.length > 1) {
    assignPiece(job.unsolved.pop(), finishedWork.assignedWorker);
  } else if (job.unsolved.length <= 0 && Object.keys(job.underWork).length == 0) {
    
    // send results to leader
    io.to(job.room.leader).emit('finalResults', sortData(job.finished));
    var workers = job.room.workers;
    for (i = 0; i < workers; i++) {
      io.to(worker).emit('finishJob', job.taskId);
    }
    
    // TODO: send termination to every worker    
  }
}

function sortData(finals) {
  var results = new Array();
  for (i = 0; i < finals.length; i++) {
    results[finals[i].pieceId] = finals[i].value;
  }
  return results;
}
