module.exports = {
	joinJob: function(msg){
		console.log("Joined job",msg.jobId);
		socket.join(msg.jobId);
		socket.roomName = msg.jobId;
		socket.broadcast.emit('clientConnect', {id: socket.id});
	},

	leaveJob: function() {
		console.log('Got disconnect!');


		socket.broadcast.to(socket.roomName).emit('clientDiconnect', {id: socket.id});
		// socket.broadcast.emit('clientDisconnect', {id: socket.id});
	}
}