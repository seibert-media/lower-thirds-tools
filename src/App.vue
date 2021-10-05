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
          <!--<img src="/static/insert_mittig.jpg" style="width: 100%; height: 100%;">-->
          <div class="lower-third">
            <insert_seibert_middle :title="currentInsertData.title" :subtitle="currentInsertData.subtitle" ref="currentInsertPreview"></insert_seibert_middle>
          </div>
          <div class="lower-third preview">
            <insert_seibert_middle :title="title" :subtitle="subtitle" edit-mode ref="previewInsert"></insert_seibert_middle>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import {Channel, ChannelsData, LowerThird} from "./types";
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
      subtitle: '',
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
      if (this.previewInsert?.animationRunning || this.currentInsertPreview?.animationRunning) {
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
      if (!this.currentChannel) return
      this.socket.emit('show_lower_third', {
        'channel': this.currentChannel.slug,
        'design': 'seibert_middle',
        'title': this.title,
        'subtitle': this.subtitle,
      }, (response: object) => {
        console.log('received show_lower_third ack', response)
      })
    },
    preview() {
      this.previewInsert?.show()
    },
    stop() {
      this.previewInsert?.abort()
    },
    reset() {
      this.title = ''
      this.subtitle = ''
    },
    async showLowerThird(lt: LowerThird) {
      this.currentInsertData.design = lt.design
      this.currentInsertData.title = lt.title
      this.currentInsertData.subtitle = lt.subtitle
      this.currentInsertData.duration = lt.duration
      await this.$forceUpdate()
      this.currentInsertPreview?.show()
    },
    hideLowerThird() {
      this.currentInsertPreview?.hide()
    },
    killLowerThird() {
      this.currentInsertPreview?.abort()
    },
  },
  setup() {
    const currentInsertPreview = ref<InstanceType<typeof SeibertMiddle>>()
    const previewInsert = ref<InstanceType<typeof SeibertMiddle>>()
    return { currentInsertPreview, previewInsert }
  },
})
</script>

<style scoped>

</style>