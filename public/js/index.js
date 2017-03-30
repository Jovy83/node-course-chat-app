var socket = io();

// this is called immediately when the user goes to localhost:3000. because user connects, connect event in server.js triggers, which then triggers the roomList emit, which causes the below listener to fire. 
socket.on('roomList', function (roomList) {
    roomList.forEach(function (roomName) {
        // update our select html element
        jQuery('#select').append(`<option value="${roomName}">${roomName}</option>`);
    })
});

// this fires each time the user selects something from the dropdown menu
$('#select').on('change', function () {
    // clear the previous value associated with the room element
    $('#room').val("");
    
    // get the value for the selected row
    var room = $(this)
        .find(':selected')
        .val();

    // set the room element value to the selected value
    $('#room')
        .val(room);
});