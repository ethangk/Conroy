
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
var jobs = {}

function start(msg, rooms) {
  var room = rooms[msg.taskId]
  var leader = room.leader
  var job = {room: room, taskId: msg.taskId, unsolved: msg.data, underWork: {}, finished: []};
  jobs[msg.taskId] = job;
  // assign ids to pieces
  for (i = 0; i < job.unsolved.length; i++) {
    job.unsolved[i] = {value: job.unsolved[i], pieceId: i}
  }
 
  for (i = 0; i < workers.length; i++) {
    // todo: schedule a timer here to remove the job if it timeouts and put it back in 
    // unsolved
    assignPiece(job, workers[i]);
    if (job.unsolved.length <= 0) break;
  }
}

function assignPiece(job, worker) {
  var next = job.unsolved.pop() 

  // send 1 item to solve
  io.to(worker).emit('taskPiece', {taskId: job.taskId, data: [next]}) 

  job.underWork[next.pieceId] = {piece: next, assignedWorker: worker}
}

function onResult(msg) {
  var job = jobs[msg.taskId];
  for (i = 0; i < msg.data.length; i++) {
    var finishedWork = job.underWork[msg.data.pieceId];
    delete job.underWork[msg.data.pieceId];
    job.finished.push(msg.data[i]);
  }
  if (job.unsolved.length > 1) {
    assignPiece(job, finishedWork.assignedWorker);
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
