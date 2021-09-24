import { io, Socket } from "socket.io-client"
import { createApp, ComponentPublicInstance } from "vue"

import { Channel, ChannelsData } from "./types"
import App from "/src/App.vue";

export class LowerThirdsTool {
    channels: ChannelsData;
    app: ComponentPublicInstance
    socket: Socket

    constructor(socket: Socket) {
        let _this = this;
        this.socket = socket;
        this.app = createApp(App, {socket: socket}).mount('#app');

        // Without that typescript will complain that channels doesn't exist, even though it does.
        // I have no idea how to fix it and the sadly the Vue Typescript documentation is not help what so ever
        // @ts-ignore
        this.channels = this.app.channels;

        socket.on('channels_data', (data: {channels: ChannelsData}) => {
            console.log('received channels data update')
            let removed_channels = Object.keys(_this.channels)
            for (const [slug, channel] of Object.entries(data['channels'])) {
                if (_this.channels[slug] === undefined) {
                    _this.channels[slug] = {
                        name: channel.name,
                        slug: channel.slug
                    }
                } else {
                    _this.channels[slug].name = channel.name
                    _this.channels[slug].slug = channel.slug
                    if (removed_channels.includes(slug)) {
                        removed_channels.splice(removed_channels.indexOf(slug), 1)
                    }
                }
            }
            console.log(removed_channels)
            removed_channels.forEach(slug => {
                delete _this.channels[slug]
            })

        });
    }
}


document.addEventListener("DOMContentLoaded", () => {
    let socket = io();
    let default_ini = new LowerThirdsTool(socket);
    // @ts-ignore
    document.ltt = default_ini;
})