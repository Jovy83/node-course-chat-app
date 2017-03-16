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
socket.on('newMessage', function (message) {
    console.log('newMessage', message);

    var li = jQuery('<li></li>'); // create a new element using jQuery
    li.text(`${message.from}: ${message.text}`); // edit its text property
    jQuery('#messages').append(li); // append this new li to our ol in index.html
});

// custom form handler using jQuery
jQuery('#message-form').on('submit', function (e) {
    e.preventDefault(); // prevents the default behavior for the event which reloads the entire page and appending the query to the address. 

    // emit createMessage here because the user pressed the send button. 
    socket.emit('createMessage', {
        from: 'User',
        text: jQuery('[name=message]').val() // select the element with a name of 'message' which is our textfield
    }, function () {
        // acknowledgement to be filled later if needed. 
    });
});