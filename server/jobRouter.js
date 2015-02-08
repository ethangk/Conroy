
module.exports = {
  jobStart: start
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
  var job = {unsolved: msg.data, underWork: {}, finished: []};
  jobs[msg.taskId] = job;
  // assign ids to pieces
  for (i = 0; i < job.unsolved.length; i++) {
    job.unsolved[i] = {value: job.unsolved[i], pieceId: i}
  }
 
  var workers = rooms[msg.taskId].workers
  for (i = 0; i < workers.length; i++) {
    var next = job.unsolved.pop() 
    workers[i].emit('taskPiece', [next]) // send 1 item to solve
    job.underWork[next.pieceId] = next 
    // todo: schedule a timer here to remove the job if it timeouts and put it back in 
    // unsolved
    if (job.unsolved.length <= 0) break;
  }
}

function onResult(msg) {
  for (i = 0; i < msg.length; i++) {
    delete job.underWork[msg.pieceId];
     
  }
