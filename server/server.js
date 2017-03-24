const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '/../public'); // much cleaner way using the built-in path module so use this instead

var app = express();
var server = http.createServer(app); // this is to add socketIO support. we've actually used this method already. when we call app.listen in express, it literally calls the createServer method behind the scenes. 
var io = socketIO(server); // pass in the server we want to use with web sockets. this returns a web sockets server so that we can emit or listen to events. this is how we're going to communicate between server/client

var users = new Users(); // this will hold our some sort of singleton for Users. 

// console.log(__dirname + '/../public'); // old way we used to navigate to another folder. if we log this, you can see that the path is not clean as it goes to server, then back out, before finally getting to the public folder. this is unnecessary. 
// console.log(publicPath); 

app.use(express.static(publicPath));

// this lets us register an event listener. we can listen for a specific event and do something when that event happens. one built in event that we're going to use is called `connection` which lets us listen for a new connection, meaning a client connected to the server and lets us do something when that connection comes in. 
io.on('connection', (socket) => {
    // this socket arg is similar to the socket we have access to in our chat.html file. this represent the individual socket as opposed to all of the users connected to the server
    console.log('New user connected');

    // join listener
    socket.on('join', (params, callback) => {

        // UPDATE CHALLENGE: convert the room name to lower case to make the chatroom name non-case sensitive
        const theRoomName = params.room.toLowerCase(); 

        if (!isRealString(params.name) || !isRealString(theRoomName)) {
            return callback('Name and room name are required'); // pass an error if validation failed
        }

        // UPDATE CHALLENGE: check if username is existing already
        if(users.isUserExistingAlready(params.name)) {
            return callback('Username already exists. Please choose a different username.');
        }

        // list of emits we've done in the server so far
        // io.emit = emits to every single connected user
        // socket.broadcast.emit = send the message to everyone except for the sender
        // socket.emit = emits event specifically to one user

        // these emits have a room counterpart which means you can choose to only emit to certain users in a certain room. 
        // io.to('roomName').emit = emits to everyone in that room
        // socket.broadcast.to('roomName').emit = emits to everyone in that room except the sender
        // it's the same for socket.emit since we're sending a message to one specific user anyway

        socket.join(theRoomName); // have the client join the room name they specified
        // socket.leave('roomName') // this leaves the room 

        // when the user joins, add them to our users array
        // to make sure there's no duplicate user in our array, remove users each time they join, if they're in the array, before adding them to the array 
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, theRoomName);
        // broadcast to everyone inside the room that this user has joined so that they can have their people list updated
        io.to(theRoomName).emit('updateUserList', users.getUserList(theRoomName));

        // socket.emit from Admin text Welcome to the chat app
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
        // socket.broadcast.emit from Admin text New user joined (aka broadcast to everyone in the room except this socket/ourselves)
        socket.broadcast.to(theRoomName).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));

        callback(); // don't pass any errors if string validation passed
    });

    // createMessage listener
    socket.on('createMessage', function (message, callback) {
        console.log('createMessage', message);

        var user = users.getUser(socket.id);
        if (user && isRealString(message.text)) {
            // verify if user exists and if the message is not just a bunch of empty spaces
            // newMessage emitter
            //io.emit('newMessage', generateMessage(message.from, message.text));
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
        }
        callback('This is from the server');

        // we generate createdAt on the server side so that the client can't spoof this data
    });

    // listener for the user location
    socket.on('createLocationMessage', (coords) => {
        var user = users.getUser(socket.id);
        if (user) {
            // notify all users by using io.emit
            //io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
        }

    });

    socket.on('disconnect', () => {
        console.log('User was disconnected');
        // when the user disconnects, remove him from our users array
        // then emit to everyone in the room that the said user has left the room/disconnected 
        var user = users.removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room)); // update the user list
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`)); // will print 'user' has left the room
        }
    });

});

server.listen(port, () => {
    console.log(`Server started on port ${port}`);
});  