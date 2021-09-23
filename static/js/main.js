document.addEventListener("DOMContentLoaded", function () {
    // @ts-ignore
    var socket = io();
    // @ts-ignore
    document.socket = socket;
    socket.on('connect', function () {
        socket.emit('message', 'test message');
    });
    socket.on('channels_data', function (data) {
        console.log('received channel update');
        console.log(data);
    });
});
