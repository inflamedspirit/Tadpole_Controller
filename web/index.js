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


io.on('connection', function(socket){
    console.log('a user connected');   
    // open new connection to tadpole server
    var client = new net.Socket();
    var name = 'anonymous';
    client.connect(13370, '127.0.0.1', function() {
	console.log('Connected to game server');
    });
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
	    client.destroy();
	}
    });
    // clean up when server closes connection
    client.on('close', function() {
	client.destroy();
	console.log('Connection closed');
    });
    
    // transmit button presses to tadpole server
    socket.on('action', function(msg){
	console.log('action: ' + msg);
	client.write(msg);
    });
    // chat room? why not.
    socket.on('chat message', function(newname){
	console.log('message: ' + newname);
	name = newname;
	client.write('K');
	client.end();
	setTimeout(function() {
	    console.log('killing socket');
	    client.destroy(); // kill socket
	    client = new net.Socket();
	    client.connect(13370, '127.0.0.1', function() {
		console.log('Connected to game server');
	    });
    // respond to commands from server 
	    // OMG THIS IS SO FUCKING KLUDGY WHAT AM I DOING!!!>??? but o
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
		    client.destroy();
		}
	    });
	    // clean up when server closes connection
	    client.on('close', function() {
		client.destroy();
		console.log('Connection closed');
	    });


	}, 1000);
	
    });
    socket.on('disconnect', function(){
	client.destroy(); // kill socket
	console.log('user disconnected');
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

