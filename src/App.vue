<template>
  <app_menu :channels="channels" :current-channel="currentChannel" @channelSelected="selectChannel"></app_menu>
  <main>
    <section class="hero is-fullheight-with-navbar" v-if="!currentChannel">
      <div class="hero-body">
        <div class="container has-text-centered">
          <p class="title">
            No Channel Selected
          </p>
          <p class="subtitle">
            Select a channel on the left to start
          </p>
        </div>
      </div>
    </section>
    <section class="columns is-desktop section is-variable is-6" v-if="currentChannel">
      <div class="control-panel column">
        <h4 class="title is-4">Controls</h4>
          <div class="field">
            <label class="label">Title</label>
            <div class="control">
              <input class="input" type="text" placeholder="Title" :disabled="isAnimationRunning" v-model="title">
            </div>
          </div>
          <div class="field">
            <label class="label">Subtitle</label>
            <div class="control">
              <input class="input" type="text" placeholder="Subtitle" :disabled="isAnimationRunning" v-model="subtitle">
            </div>
          </div>
          <div class="field is-grouped">
          <div class="control">
            <button class="button is-primary" :disabled="isAnimationRunning" @click="go">Go</button>
          </div>
          <div class="control">
            <button class="button is-primary" :disabled="isAnimationRunning" @click="preview">Preview</button>
          </div>
          <div class="control">
            <button class="button is-danger" @click="stop">STOP</button>
          </div>
          <div class="control">
            <button class="button is-danger" :disabled="isAnimationRunning" @click="reset">Reset</button>
          </div>
        </div>
        <h4 class="title is-4">Styles</h4>
        <div class="columns is-multiline is-mobile">
          <div class="column is-one-third" v-for="style in styles">
            <div class="card">
              <div class="card-image">
                <figure class="image is-16by9">
                  <img src="https://bulma.io/images/placeholders/1280x960.png" alt="Placeholder image">
                </figure>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="column">
        <div class="preview">
          <div class="lower-third">
            <insert_seibert_middle :title="title" :subtitle="subtitle" edit-mode ref="currentInsert"></insert_seibert_middle>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import {Channel, ChannelsData} from "./types";
import {Socket} from "socket.io-client";
import Menu from "./Menu.vue"
import SeibertMiddle from "./lower_thirds/SeibertMiddle.vue";

export default defineComponent({
  name: "App",
  components: {
    app_menu: Menu,
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
      styles: ['test', 'test', 'test', 'test', 'test', 'test',],
      title: '',
      subtitle: ''
    }
  },
  computed: {
    isAnimationRunning() {
      if (this.currentInsert?.animationRunning) {
        return true
      }
      return false
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
      window.location.hash = channel.slug
      this.socket.emit('join_channel', {channel: this.currentChannel.slug})
    },
    go() {
      this.currentInsert?.show()
    },
    preview() {
      this.currentInsert?.show()
    },
    stop() {
      this.currentInsert?.abort()
    },
    reset() {
      this.title = ''
      this.subtitle = ''
    }
  },
  setup() {
    const currentInsert = ref<InstanceType<typeof SeibertMiddle>>()
    return { currentInsert }
  },
})
</script>

<style scoped>

</style>