import { io, Socket } from "socket.io-client"
import { createApp, ComponentPublicInstance } from "vue"

import {Channel, ChannelsData, ChannelStatus, LowerThird} from "./types"
import App from "/src/App.vue";

export class LowerThirdsTool {
    channels: ChannelsData;
    app: InstanceType<typeof App>
    socket: Socket

    constructor(socket: Socket) {
        let _this = this;
        this.socket = socket;
        this.app = createApp(App, {socket: socket}).mount('#app')

        // Without that typescript will complain that channels doesn't exist, even though it does.
        // I have no idea how to fix it and the sadly the Vue Typescript documentation is not help what so ever
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
            removed_channels.forEach(slug => {
                delete _this.channels[slug]
            })
            if (_this.app.currentChannel === null && window.location.hash && _this.channels[window.location.hash.substr(1)]) {
                _this.app.selectChannel(_this.channels[window.location.hash.substr(1)])
            }
        });

        socket.on('channel_status', (data: ChannelStatus & {channel: string}) => {
            console.log('received channels status update', data)
            if (_this.channels[data.channel].status === undefined) {
                _this.channels[data.channel].status = {
                    lower_third_visible: data.lower_third_visible,
                    current_lower_third: data.current_lower_third,
                }
            }
        });

        socket.on('show_lower_third', (data: LowerThird & {channel: string}) => {
            console.log('received show_lower_third event for channel', data.channel, data)
            _this.app.showLowerThird({
                design: data.design,
                title: data.title,
                subtitle: data.subtitle,
                duration: data.duration,
            } as LowerThird)
        });

        socket.on('connect', () => {
            if (_this.app.currentChannel) {
                this.socket.emit('join_channel', {channel: _this.app.currentChannel.slug})
            }
        })
    }
}


document.addEventListener("DOMContentLoaded", () => {
    let socket = io();
    let default_ini = new LowerThirdsTool(socket);
    // @ts-ignore
    window.ltt = default_ini;
})
