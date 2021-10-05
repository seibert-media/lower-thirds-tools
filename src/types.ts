export interface LowerThird {
    design: string
    title: string
    subtitle: string | null
    duration: number | null
}

export interface ChannelStatus {
    lower_third_visible: string
    current_lower_third: LowerThird
}

export interface Channel {
    name: string
    slug: string
    status?: ChannelStatus
}

export type ChannelsData = {
    [id: string] : Channel
}