// initiate socket connection
var socket = io();
// below will fire if client establishes a connection with the server
socket.on('connect', function () {
    // we don't need access to a socket arg since we already have it above 
    console.log('Connected to server');
});

// below will fire if whenever the connection drops
socket.on('disconnect', function () {
    console.log('Disconnected from server');
});


// newMessage listener
socket.on('newMessage', function(message) {
   console.log('newMessage', message);
});

