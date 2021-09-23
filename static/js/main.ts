document.addEventListener("DOMContentLoaded", () => {
    // @ts-ignore
    let socket = io();
    // @ts-ignore
    document.socket = socket;
    socket.on('connect', () => {
        socket.emit('message', 'test message');
    })
    socket.on('channels_data', data => {
        console.log('received channel update');
        console.log(data);
    });
})