function dumpRoomInfo(rooms, roomid){
	console.log("Room leader", rooms[roomid].leader);
	console.log("Room workers", rooms[roomid].workers);
}

module.exports = {
	joinJob: function(msg, socket, rooms){
		console.log("Joined job",msg.jobId);
		socket.join(msg.jobId);
		socket.roomName = msg.jobId;
		socket.broadcast.emit('clientConnect', {id: socket.id});
		//create the room if it doesn't exist
		if(!rooms[socket.roomName]){
			rooms[socket.roomName] = {};
		}

		//define the leader
		if(msg.role === "leader"){
			rooms[socket.roomName].leader = socket.id;
		}
		else{
			if(!rooms[socket.roomName].workers || rooms[socket.roomName].workers.constructor !== Array){
				rooms[socket.roomName].workers = [];
			}

			rooms[socket.roomName].workers.push(socket.id);
		}
		dumpRoomInfo(rooms, socket.roomName);
	},

	leaveJob: function(msg, socket, rooms) {
		console.log('Got disconnect, leaving', socket.roomName);
		socket.broadcast.to(socket.roomName).emit('clientDiconnect', {id: socket.id});

		if(rooms[socket.roomName] === undefined){
			console.log("Room doesn't exist");
			return;
		}

		if(socket.id == rooms[socket.roomName].leader){
			//we got a big problem...
			console.log("LEADER HAS LEFT THE BUILDING");
		}
		else{
			var index = rooms[socket.roomName].workers.indexOf(socket.id);
			// console.log("Found index", index, "for worker",socket.id);
			if(index > -1){
				rooms[socket.roomName].workers.splice(index, 1);
			}
		}


		dumpRoomInfo(rooms, socket.roomName);
		// socket.broadcast.emit('clientDisconnect', {id: socket.id});
	}
}
