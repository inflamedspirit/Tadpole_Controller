var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var net = require('net');

// Do really dumb error handling (basically prevent crashes!)
process.on('uncaughtException',function(err){
    console.log('something terrible happened..')
})

// Serve html
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/virtualjoystick.js', function(req, res){
  res.sendFile(__dirname + '/virtualjoystick.js');
});


io.on('connection', function(socket){
    console.log('a user connected');   
    // open new connection to tadpole server

    var name = 'anonymous';

    socket.on('chat message', function(newname){
	console.log('message: ' + newname);
	name = newname;
//	client.write('K');
//	client.end();
//	setTimeout(function() {
//	    console.log('killing socket');
//	    client.destroy(); // kill socket
//	    client = new net.Socket();
//	    client.connect(13370, '127.0.0.1', function() {
//		console.log('Connected to game server');
    });

    setTimeout(function() {
	// transmit button presses to tadpole server
	var client = new net.Socket();
	client.connect(13370, '127.0.0.1', function() {
	    console.log('Connected to game server');
	});

	setTimeout(function() {
	    socket.on('action', function(msg){
		console.log('action: ' + msg);
		client.write(msg);
	    });
	},200);

    // respond to commands from server
	client.on('data', function(data) {
	    var chr = String.fromCharCode(data[0]); 
	    console.log("got some data:" + data)
	    if( chr === 'N' ){
		console.log("connection is legit, sending name");
		client.write(name);
	    }
	    if( chr === 'X' ){
		console.log("there ain't no room, dropping");
		client.destroy();
	    }
	    if( chr === 'S' ){
		console.log("connection invalid, dropping");
		client.destroy();
	    }
	    if( chr === 'D' ){
		console.log("server is terminating us");
		client.destroy();
	    }
	    if( chr === 'K' ){
		console.log("YOU DIED!");
		socket.emit('hp', '0');
		client.destroy();
	    }

	    if( chr === 'H' ){
		//		hp = parseInt(data.slice(1,2))
		hp = parseInt(String.fromCharCode(data[1]) + String.fromCharCode(data[2]));
		socket.emit('hp', hp);
		console.log(hp);
	    }

	    if( chr === 'R' ){
		color = '#' + String.fromCharCode(data[3]) + String.fromCharCode(data[4]) + String.fromCharCode(data[5]) + String.fromCharCode(data[6]) + String.fromCharCode(data[7]) + String.fromCharCode(data[8]);
		socket.emit('color', color);
	    }


	    //socket.on('hp', function (data) {
//	    console.log(data)
//	}


	});

	// clean up when server closes connection
	client.on('close', function() {
	    client.destroy();
	    console.log('Connection closed');
	});
	
	socket.on('disconnect', function(){
	    //	client.destroy(); // kill socket, probably should have it
	    console.log('user disconnected');
	});
    },2000);
    
});


http.listen(3000, function(){
    console.log('listening on *:3000');
});

