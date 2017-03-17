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

    var li = jQuery('<li></li>'); // create a new element (list item) using jQuery
    li.text(`${message.from}: ${message.text}`); // edit its text property
    jQuery('#messages').append(li); // append this new li to our ol in index.html
});

// newLocationMessage listener
socket.on('newLocationMessage', function (message) {
    var li = jQuery('<li></li>'); // create a new list item
    var a = jQuery('<a target="_blank">My current location</a>'); // create an anchor. target = _blank means open in a new tab 
    li.text(`${message.from}: `);
    a.attr('href', message.url); // attr can get or set attributes of tags. To get, supply the attr name. To set, supply attr name and the new value
    li.append(a); // append the link to the <user>: string we currently have 
    jQuery('#messages').append(li); // append this new li to our ol in index.html
});

// custom form handler using jQuery
jQuery('#message-form').on('submit', function (e) {
    e.preventDefault(); // prevents the default behavior for the event which reloads the entire page and appending the query to the address. 

    var messageTextbox = jQuery('[name=message]');

    // emit createMessage here because the user pressed the send button. 
    socket.emit('createMessage', {
        from: 'User',
        text: messageTextbox.val() // select the element with a name of 'message' which is our textfield
    }, function () {
        // acknowledgement to be filled later if needed. 
        // clear the textbox once the message sent out successfully
        messageTextbox.val(''); // supply no arg to get, supply arg to set. 
    });
});

var locationButton = jQuery('#send-location'); // get a reference to the send-location button in index.html
locationButton.on('click', function () { // attach a listener for the button. it's better to reference the button if you're going to use it in multiple places because each jQuery DOM manipulation is expensive for memory/resource. 

    // this callback gets triggered each time this button is pressed. 
    // first check if the client browser has access to the geolocation API
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser'); // show an alert which is available on all browsers
    }

    locationButton.attr('disabled', 'disabled').text('Sending location...'); // disable the button when user requests for user location

    // start the process of getting the user's coordinates
    navigator.geolocation.getCurrentPosition(function (position) {
        // success case. emit an event here
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });

        locationButton.removeAttr('disabled').text('Send location'); // re-enable the button once we get a result for the location
    }, function () {
        // fail case
        alert('Unable to fetch location'); // this is usually called if the user denies permission
        locationButton.removeAttr('disabled').text('Send location'); // re-enable the button once we get a result for the location
    });

    // getting location mostly work on all browsers. Some browsers or mobile require an https connection to be able to share location. take note of that. The only exception is if you run http that's on localhost. that's ok. 
});