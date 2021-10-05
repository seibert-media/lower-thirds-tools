import { io, Socket } from "socket.io-client"
import { createApp, ComponentPublicInstance } from "vue"

import {Channel, ChannelsData, ChannelStatus, LowerThird} from "./types"
import App from "/src/App.vue";
import PlayoutApp from "./PlayoutApp.vue";

export enum AppModes {
    'control_center',
    'playout',
}

export class LowerThirdsTool {
    channels: ChannelsData;
    app: InstanceType<typeof App> | InstanceType<typeof PlayoutApp>
    socket: Socket
    mode: AppModes
    appContainer: HTMLElement | null

    constructor(mode?: AppModes) {
        const _this = this;
        this.socket = io();
        this.appContainer = document.getElementById('app')

        if (mode === undefined) {
            if (_this.appContainer?.classList.contains('playout')) {
                mode = AppModes.playout
            } else {
                mode = AppModes.control_center
            }
        }
        this.mode = mode
        if (mode == AppModes.control_center) {
            this.app = createApp(App, {socket: this.socket}).mount('#app')
        } else if (mode == AppModes.playout) {
            this.app = createApp(PlayoutApp, {socket: this.socket}).mount('#app')
        } else {
            throw 'invalid mode'
        }

        this.channels = this.app.channels;

        this.socket.on('channels_data', (data: {channels: ChannelsData}) => {
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
            if (_this.app.currentChannel === null) {
                if (_this.mode == AppModes.control_center && window.location.hash && _this.channels[window.location.hash.substr(1)]) {
                    _this.app.selectChannel(_this.channels[window.location.hash.substr(1)])
                } else if (_this.mode == AppModes.playout && _this.appContainer?.dataset?.channelSlug && _this.channels[_this.appContainer?.dataset?.channelSlug]) {
                    _this.app.selectChannel(_this.channels[_this.appContainer?.dataset?.channelSlug])
                }

            }
        });

        this.socket.on('channel_status', (data: ChannelStatus & {channel: string}) => {
            console.log('received channels status update', data)
            if (_this.channels[data.channel].status === undefined) {
                _this.channels[data.channel].status = {
                    lower_third_visible: data.lower_third_visible,
                    current_lower_third: data.current_lower_third,
                }
            }
        });

        this.socket.on('show_lower_third', (data: LowerThird & {channel: string}) => {
            if (_this.app.currentChannel.slug !== data.channel) {
                console.warn('received show_lower_third event for channel [%s], that isn\'t the current channel:', data.channel, data)
                return
            }
            console.log('received show_lower_third event for channel [%s]:', data.channel, data)
            _this.app.showLowerThird({
                design: data.design,
                title: data.title,
                subtitle: data.subtitle,
                duration: data.duration,
            } as LowerThird)
        });

        this.socket.on('hide_lower_third', (data: {channel: string}) => {
            if (_this.app.currentChannel.slug !== data.channel) {
                console.warn('received hide_lower_third event for channel [%s], that isn\'t the current channel!', data.channel)
                return
            }
            console.log('received hide_lower_third event for channel [%s].', data.channel)
            _this.app.hideLowerThird()
        })

        this.socket.on('kill_lower_third', (data: {channel: string}) => {
            if (_this.app.currentChannel.slug !== data.channel) {
                console.warn('received kill_lower_third event for channel [%s], that isn\'t the current channel!', data.channel)
                return
            }
            console.log('received kill_lower_third event for channel [%s].', data.channel)
            _this.app.killLowerThird()
        });

        this.socket.on('connect', () => {
            if (_this.app.currentChannel) {
                this.socket.emit('join_channel', {channel: _this.app.currentChannel.slug})
            }
        })
    }
}


document.addEventListener("DOMContentLoaded", () => {
    let default_ini = new LowerThirdsTool();
    // @ts-ignore
    window.ltt = default_ini;
})
