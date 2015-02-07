var socket = io('http://localhost');
socket.on('connect', function(){
  console.log("connection received");
});

socket.on('event', function(job) {
  console.log("job received");
 
});

socket.on('disconnect', function(){
  console.log("disconnect happened");

});
