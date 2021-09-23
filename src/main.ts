import { io, Socket } from "socket.io-client";


type Channel = {
    name: string;
    slug: string;
}

type ChannelsData = {
    [id: string] : Channel
}

export class LowerThirdsTool {
    constructor(socket: Socket) {
        socket.on('connect', () => {
            socket.emit('message', 'test message');
        })
        socket.on('channels_data', (data: ChannelsData) => {
            console.log('received channels data update');
            for (const [slug, name] of Object.entries(data)) {
                console.log(slug);
                console.log(name);
            }
        });
    }
}


document.addEventListener("DOMContentLoaded", () => {
    // @ts-ignore
    let socket = io();
    // @ts-ignore
    document.socket = socket;
    let default_ini = new LowerThirdsTool(socket);
})