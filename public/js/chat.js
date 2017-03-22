// initiate socket connection
var socket = io();
// below will fire if client establishes a connection with the server
socket.on('connect', function () {
    // we don't need access to a socket arg since we already have it above 
    console.log('Connected to server');

    const params = jQuery.deparam(window.location.search);
    socket.emit('join', params, function (err) {
        if (err) {
            // will trigger if string validation failed
            alert(err); // display an alertbox
            window.location.href = '/'; // send them back to the root page 
        } else {
            console.log('No errors');
        }
    });
});

// below will fire if whenever the connection drops
socket.on('disconnect', function () {
    console.log('Disconnected from server');
});

// updateUserList listener
socket.on('updateUserList', function(users) {
    // console.log('Users list', users);

    var ol = jQuery('<ol></ol>'); // create an ordered list
    users.forEach(function(user) { // iterate through our users array
        ol.append(jQuery('<li></li>').text(user)); // create a list item for each element and set the text of the list item to the user (which is the user.name property)
    });

    jQuery('#users').html(ol); // render by adding it to the DOM. Select the element called users then set its html property equal to our ordered list above. 
});

// newMessage listener
socket.on('newMessage', function (message) {
    console.log('newMessage', message);
    const formattedTime = moment(message.createdAt).format('h:mm a');

    // rendering method using mustache templating
    var template = jQuery('#message-template').html(); // html returns the markup inside of the message-template
    var html = Mustache.render(template, { // this object is passed into index.html so we could use {{text}}, etc 
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });
    jQuery('#messages').append(html);

    scrollToBottom();

    // rendering method using pure jquery
    // var li = jQuery('<li></li>'); // create a new element (list item) using jQuery
    // li.text(`${message.from} <${formattedTime}>: ${message.text}`); // edit its text property
    // jQuery('#messages').append(li); // append this new li to our ol in index.html
});

// newLocationMessage listener
socket.on('newLocationMessage', function (message) {
    const formattedTime = moment(message.createdAt).format('h:mm a');

    // rendering method using mustache templating
    var template = jQuery('#location-message-template').html();
    var html = Mustache.render(template, {
        from: message.from,
        url: message.url,
        createdAt: formattedTime
    });
    jQuery('#messages').append(html);

    scrollToBottom();

    // rendering method using pure jQuery
    // var li = jQuery('<li></li>'); // create a new list item
    // var a = jQuery('<a target="_blank">My current location</a>'); // create an anchor. target = _blank means open in a new tab 
    // li.text(`${message.from} <${formattedTime}>: `);
    // a.attr('href', message.url); // attr can get or set attributes of tags. To get, supply the attr name. To set, supply attr name and the new value
    // li.append(a); // append the link to the <user>: string we currently have 
    // jQuery('#messages').append(li); // append this new li to our ol in index.html
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

function scrollToBottom() {
    // we're going to scrollToBottom everytime we add a new message to the chat area
    // Selectors
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child'); // select a child that is of type <li> then filter with last-child to get the very last li in the ordered list. 
    // Heights
    var clientHeight = messages.prop('clientHeight'); // prop is a cross platform browser way to fetch a property. this is a jquery alternative to doing it w/o jquery to make sure it works across all browsers
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight(); // will calculate the height of the message taking into account the padding that we also applied via css

    // it turns out we don't need lastMessageHeight in the calculation because it is part of the clientHeight already (look at the diagram) -- edit, it seems we need it -- waiting for response -- we need it because without it, autoscrolling wont' work for firefox and edge and chrome(if zoomed). 
    var lastMessageHeight = newMessage.prev().innerHeight(); // prev gets the previous li in the ol so we can just use that to get the previous message. then we just call innerHeight to get the height of the message. 

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        console.log(clientHeight + scrollTop + newMessageHeight + lastMessageHeight, scrollHeight);
        messages.scrollTop(scrollHeight); // scrolltop() let's you set the scrollTop value. in this case, we'll be setting it to scrollHeight which effectively scrolls it to the bottom

    }
}