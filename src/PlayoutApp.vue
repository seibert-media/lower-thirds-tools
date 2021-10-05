<template>
  <div class="lower-third lower-third-live">
    <insert_seibert_middle :title="currentInsertData.title" :subtitle="currentInsertData.subtitle" ref="currentInsert"></insert_seibert_middle>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import {Channel, ChannelsData, LowerThird} from "./types";
import {Socket} from "socket.io-client";
import SeibertMiddle from "./lower_thirds/SeibertMiddle.vue";

export default defineComponent({
  name: "PlayoutApp",
  components: {
    insert_seibert_middle: SeibertMiddle,
  },
  props: {
    'socket': {
      type: Object as PropType<Socket>,
      required: true,
    }
  },
  data: () => {
    return {
      channels: {} as ChannelsData,
      currentChannel: null as Channel | null,
      currentInsertData: {
        design: '',
        title: '',
        subtitle: '',
        duration: null,
      } as LowerThird
    }
  },
  computed: {
    isAnimationRunning() {
      return !!this.currentInsert?.animationRunning;

    },
  },
  methods: {
    selectChannel(channel: string | Channel) {
      if (typeof channel === "string") {
        channel = this.channels[channel]
        if (channel === undefined) {
          throw "Invalid channel"
        }
      }
      console.log('channel "%s" selected:', channel.name, channel)
      if (this.currentChannel) {
        this.socket.emit('leave_channel', {channel: this.currentChannel.slug})
      }
      this.currentChannel = channel
      this.socket.emit('join_channel', {channel: this.currentChannel.slug})
    },
    async showLowerThird(lt: LowerThird) {
      this.currentInsertData.design = lt.design
      this.currentInsertData.title = lt.title
      this.currentInsertData.subtitle = lt.subtitle
      this.currentInsertData.duration = lt.duration
      await this.$forceUpdate()
      this.currentInsert?.show((lt.duration || lt.duration === 0) ? lt.duration : undefined)
    },
    hideLowerThird() {
      this.currentInsert?.hide()
    },
    killLowerThird() {
      this.currentInsert?.abort()
    },
  },
  setup() {
    const currentInsert = ref<InstanceType<typeof SeibertMiddle>>()
    return { currentInsert }
  },
})
</script>

<style scoped>

</style>