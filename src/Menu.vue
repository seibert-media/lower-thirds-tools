<template>
  <aside class="menu side-menu">
    <p class="menu-label">
      Channels
    </p>
    <ul class="menu-list">
      <li v-for="channel in channelsSorted" :key="channel.slug">
        <a :class="{ 'is-active': channel.slug === selectedChannel }" @click="selectChannel(channel.slug)">{{channel.name}}</a>
      </li>
    </ul>
  </aside>

</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import {Channel, ChannelsData} from "./types";

export default defineComponent({
  name: "Menu",
  data: () => {
    return {
      selectedChannel: '',
    }
  },
  props: {
    'channels': {
      type: Object as PropType<ChannelsData>,
      required: true,
    }
  },
  computed: {
    channelsSorted () {
      const sorted: Channel[] = Object.values(this.channels)
      sorted.sort((a, b) => {
        let nameA = a.name.toLocaleUpperCase()
        let nameB = b.name.toLocaleUpperCase()
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        // names must be equal
        return 0;
      })
      return sorted
    }
  },
  methods: {
    selectChannel(slug: string) {
      if (this.channels[slug] === undefined) {
        console.error('tried to select invalid channel')
      } else {
        this.selectedChannel = slug
        this.$emit('channelSelected', this.channels[slug])
      }
    }
  },
  emits: {
    channelSelected: (channel: Channel) => {
      return !!channel;
    },
  }
});
</script>

<style scoped>

</style>