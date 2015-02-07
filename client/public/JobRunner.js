var socket = io('http://localhost:12345');

console.log("running job runner");

socket.on('connect', function(){
  console.log("connection received");
});

socket.on('taskRequest', function(job) {
  console.log("job received " +  JSON.stringify(job));
  var worker = new Worker("Worker.js"); 
  worker.postMessage(job.code);
  worker.onmessage = function (r) {
   console.log("result is " + JSON.stringify(r));
  }
});

socket.on('disconnect', function(){
  console.log("disconnect happened");

});
