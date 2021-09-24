<template>
<ul>
  <li v-for="channel in channels">{{ channel.name }}</li>
</ul>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ChannelsData } from "./types";
import {Socket} from "socket.io-client";

export default defineComponent({
  name: "App",
  props: {
    'socket': {
      type: Object as PropType<Socket>,
      required: true,
    }
  },
  data: () => {
    return {
      channels: {} as ChannelsData,
    }
  },
  created() {
    this.channels
  }
})
</script>

<style scoped>

</style>