
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

function start(msg, rooms) {
  var room = rooms[msg.jobId]
  var leader = room.leader
  var job = {room: room, taskId: msg.jobId, unsolved: msg.data, underWork: {}, finished: []};
  jobs[msg.jobId] = job;
  // assign ids to pieces
  for (i = 0; i < job.unsolved.length; i++) {
    job.unsolved[i] = {value: job.unsolved[i], pieceId: i}
  }

  var code = 'function remote_fn(n){' + code + '}';
  var task = {taskID: msg.jobId, code: code};
  for (i = 0; i < job.room.workers.length; i++) {
	io.to(job.room.workers[i]).emit('initTask', task); 
   }
  var index = 0;
  for (i = 0; i < job.unsolved.length; i++) {
    // todo: schedule a timer here to remove the job if it timeouts and put it back in 
    // unsolved
    assignPiece(job.unsolved.pop(), job.room.workers[index]);
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
		assignPiece(task, job.room.workers[0]);	
	} else {
		//todo this job failed
	}	
}

function assignPiece(next, worker) {

  // send 1 item to solve
  io.to(worker).emit('taskPiece', {taskId: job.taskId, data: [next]}) 
  var timeout = setTimeout(function() {
      reAssignPiece(job, next, worker);
  }, 30000);
  job.underWork[next.pieceId] = {piece: next, assignedWorker: worker, timeout: timeout}
  //set timeout
  
}

function onResult(msg, worker) {

  if(job.underWork[msg.data.pieceId].assignedWorker !== worker) {
	//wrong worker
	return;
  }
  var job = jobs[msg.taskId];
  for (i = 0; i < msg.data.length; i++) {
    var finishedWork = job.underWork[msg.data.pieceId];
    clearTimeout(job.underWork[msg.data.pieceId].timeout);
    delete job.underWork[msg.data.pieceId];
    job.finished.push(msg.data[i]);
  }
  if (job.unsolved.length > 1) {
    assignPiece(job.unsolved.pop(), finishedWork.assignedWorker);
  } else if (job.unsolved.length <= 0 && Object.keys(job.underWork).length) {
    
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
