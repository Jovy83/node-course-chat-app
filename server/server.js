const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const {generateMessage, generateLocationMessage} = require('./utils/message');

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '/../public'); // much cleaner way using the built-in path module so use this instead

var app = express();
var server = http.createServer(app); // this is to add socketIO support. we've actually used this method already. when we call app.listen in express, it literally calls the createServer method behind the scenes. 
var io = socketIO(server); // pass in the server we want to use with web sockets. this returns a web sockets server so that we can emit or listen to events. this is how we're going to communicate between server/client


// console.log(__dirname + '/../public'); // old way we used to navigate to another folder. if we log this, you can see that the path is not clean as it goes to server, then back out, before finally getting to the public folder. this is unnecessary. 
// console.log(publicPath); 

app.use(express.static(publicPath));

// this lets us register an event listener. we can listen for a specific event and do something when that event happens. one built in event that we're going to use is called `connection` which lets us listen for a new connection, meaning a client connected to the server and let's us do something when that connection comes in. 
io.on('connection', (socket) => {
    // this socket arg is similar to the socket we have access to in our index.html file. this represent the individual socket as opposed to all of the users connected to the server
    console.log('New user connected');


    // socket.emit from Admin text Welcome to the chat app
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
    // socket.broadcast.emit from Admin text New user joined (aka broadcast to everyone except this socket/ourselves)
    socket.broadcast.emit('newMessage', generateMessage('Admin', 'New user joined'));

    // createMessage listener
    socket.on('createMessage', function (message, callback) {
        console.log('createMessage', message);

        // newMessage emitter
        io.emit('newMessage', generateMessage(message.from, message.text));

        callback('This is from the server');

        // we generate createdAt on the server side so that the client can't spoof this data
    });

    // listener for the user location
    socket.on('createLocationMessage', (coords) => {
        // notify all users by using io.emit
        io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
    });

    socket.on('disconnect', () => {
        console.log('User was disconnected');
    });

});

server.listen(port, () => {
    console.log(`Server started on port ${port}`);
});  