export interface Channel {
    name: string;
    slug: string;
}

export type ChannelsData = {
    [id: string] : Channel
}