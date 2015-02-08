
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
  if(!job.room.workers || job.room.workers.length <= 0) {
    	io.to(job.room.leader).emit('finalResults', []);
	console.log('job has failed: no workers');
	return;
  }


  // assign ids to pieces


  console.log(msg);
  console.log(typeof msg.data);
  for (i = 0; i < job.unsolved.length; i++) {
    job.unsolved[i] = {value: job.unsolved[i], pieceId: i}
  }
  console.log(job);

  var code = msg.code;
  var task = {taskID: msg.jobId, code: code, ret: 'result'};
  for (i = 0; i < job.room.workers.length; i++) {
	io.to(job.room.workers[i]).emit('initTask', task); 
   }
  var index = 0;

  var indices = [];
  var w_len = job.room.workers.length;
  
  var per_w = Math.ceil(job.unsolved.length/w_len);
  var total_jobs = job.unsolved.length;
  var prev = 0;
  for(var i = 0; i < job.room.workers.length; i++) {
    if(total_jobs <= per_w) {
      indices[i] = prev;
      break;
    }
    else {
      indices[i] = prev;
      total_jobs -= per_w;
      if(total_jobs <= per_w) {
	prev += total_jobs;
	total_jobs = 0;
      }
      prev = indices[i] + per_w;
    }
  }
  console.log(indices);

 for(var i = 0; i < indices.length; i++) {
    // todo: schedule a timer here to remove the job if it timeouts and put it back in 
    // unsolved
   
    var piece;
    if(i === indices.length - 1) {
	piece = job.unsolved.slice(indices[i]);
    } else {
    	piece = job.unsolved.slice(indices[i], indices[i+1]);
    }
    assignPiece(piece, job.room.workers[i], job);
    console.log(piece);
  }
  job.unsolved = [];
}

function reAssignPiece(job, task, worker) {
	var index = 0;
	for(var i = 0; i < job.room.workers.length; i++) {
		if(job.room.workers[i] === worker) {
			index = i;
			break;
		}
	}
	
	job.room.workers.splice(i,1);

	if(job.room.workers.length > 0) {
		assignPiece([task], job.room.workers[0], job);	
	} else {
		console.log('job has failed due to no more workers');
    		io.to(job.room.leader).emit('finalResults', []);
		//todo this job failed
	}	
}

function assignPiece(next, worker, job) {

  // send 1 item to solve
  io.to(worker).emit('taskPiece', {taskId: job.taskId, data: next}) 
  var timeout = setTimeout(function() {
      console.log('reassigned');
      reAssignPiece(job, next, worker);
  }, 30000);
  for(var i = 0; i < next.length; i++) {
  	job.underWork[next[i].pieceId] = {piece: next[i], assignedWorker: worker, timeout: timeout}
  }
  //set timeout
  
}

function onResult(msg, worker, taskId) {
  console.log("ON RESULT");
  console.log(msg);
  var job = jobs[taskId];
  //console.log(job.underWork);
  if(!job.underWork[msg.pieceId] || job.underWork[msg.pieceId].assignedWorker !== worker) {
  //wrong worker
  return;
  }
  console.log('finished ' + worker);

  // io.to(job.room.leader).emit('jobStatus', {percentage: job});
    var finishedWork = job.underWork[msg.pieceId];
    clearTimeout(job.underWork[msg.pieceId].timeout);
    delete job.underWork[msg.pieceId];
    job.finished.push(msg);
  if (job.unsolved.length > 1) {
    console.log(job.unsolved);
    assignPiece(job.unsolved.pop(), finishedWork.assignedWorker, job);
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
