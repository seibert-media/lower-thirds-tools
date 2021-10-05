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
              <input class="input" type="text" placeholder="Title" :disabled="isInputLocked" v-model="title">
            </div>
          </div>
          <div class="field">
            <label class="label">Subtitle</label>
            <div class="control">
              <input class="input" type="text" placeholder="Subtitle" :disabled="isInputLocked" v-model="subtitle">
            </div>
          </div>
          <div class="field">
            <label class="label">Duration</label>
            <div class="control">
              <input class="input" type="number" min="0" max="30" step="0.5" placeholder="Duration" :disabled="isInputLocked" v-model="duration">
            </div>
            <p class="help">Leave empty for automatic mode. Set to 0 to show the lower third until it is manually hidden.</p>
          </div>
          <div class="field is-grouped">
          <div class="control">
            <button class="button is-primary" :disabled="isAnimationRunning" @click="go">Go</button>
          </div>
          <div class="control">
            <button class="button is-primary" :disabled="isInputLocked" @click="preview">Preview</button>
          </div>
          <div class="control">
            <button class="button is-danger" :disabled="!isAnimationRunning" @click="hide">HIDE</button>
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
          <div class="column is-one-third styles-list" v-for="(style, slug) in styles" :key="slug">
            <div :class="['card', 'style', {'is-active': insertDesign === slug}]" @click="insertDesign = slug">
              <div class="card-image">
                <figure class="image is-16by9">
                  <img :src="style.thumbnail" :alt="style.name" >
                </figure>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="column">
        <div class="preview">
          <div class="lower-third">
            <keep-alive>
              <component :is="liveInsertComponent" :title="currentInsertData.title" :subtitle="currentInsertData.subtitle" ref="liveInsertPreview"></component>
            </keep-alive>
          </div>
          <div class="lower-third lower-third-preview">
            <keep-alive>
              <component :is="previewInsertComponent" :title="title" :subtitle="subtitle" edit-mode ref="previewInsert" v-show="!isPreviewHidden"></component>
            </keep-alive>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import {Channel, ChannelsData, InsertDesigns, LowerThird} from "./types";
import {Socket} from "socket.io-client";
import Menu from "./Menu.vue"
import Seibert from "./lower_thirds/Seibert.vue";
import SeibertMiddle from "./lower_thirds/SeibertMiddle.vue";

export default defineComponent({
  name: "App",
  components: {
    app_menu: Menu,
    insert_seibert: Seibert,
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
      styles: {
        seibert: {
          name: 'Seibert Bauchbinde',
          component_name: 'insert_seibert',
          thumbnail: require('./lower_thirds/Seibert.png')
        },
        seibert_middle: {
          name: 'Seibert Bauchbinde Mitte',
          component_name: 'insert_seibert_middle',
          thumbnail: require('./lower_thirds/SeibertMiddle.png')
        }
      } as InsertDesigns,
      insertDesign: '',
      title: '',
      subtitle: '',
      duration: null as number | null,
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
      if (this.previewInsert?.animationRunning || this.liveInsertPreview?.animationRunning) {
        return true
      }
      return false
    },
    isInputLocked() {
      return !!this.previewInsert?.animationRunning
    },
    isPreviewHidden() {
      return !!this.liveInsertPreview?.animationRunning
    },
    previewInsertComponent() {
      if (this.insertDesign) {
        return this.styles[this.insertDesign]?.component_name
      } else {
        return this.styles[Object.keys(this.styles)[0]].component_name
      }
    },
    liveInsertComponent() {
      if (this.currentInsertData.design) {
        return this.styles[this.currentInsertData.design]?.component_name
      } else {
        return this.styles[Object.keys(this.styles)[0]].component_name
      }
    }
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
        channel: this.currentChannel.slug,
        design: this.insertDesign,
        title: this.title,
        subtitle: this.subtitle,
        duration: (this.duration || this.duration === 0) ? this.duration : undefined
      }, (response: object) => {
        console.log('received show_lower_third ack', response)
      })
    },
    preview() {
      this.previewInsert?.show((this.duration || this.duration === 0) ? this.duration : undefined)
    },
    hide() {
      if (this.previewInsert?.animationRunning) {
        this.previewInsert?.hide()
      } else if (this.currentChannel) {
        this.socket.emit('hide_lower_third', {
          'channel': this.currentChannel.slug,
        }, (response: object) => {
          console.log('received hide_lower_third ack', response)
        })
      }
    },
    stop() {
      if (this.previewInsert?.animationRunning) {
        this.previewInsert?.abort()
      } else if (this.currentChannel) {
        this.socket.emit('kill_lower_third', {
          'channel': this.currentChannel.slug,
        }, (response: object) => {
          console.log('received kill_lower_third ack', response)
        })
      }
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
      this.liveInsertPreview?.show((lt.duration || lt.duration === 0) ? lt.duration : undefined)
    },
    hideLowerThird() {
      this.liveInsertPreview?.hide()
    },
    killLowerThird() {
      this.liveInsertPreview?.abort()
    },
  },
  setup() {
    const liveInsertPreview = ref<InstanceType<typeof SeibertMiddle>>()
    const previewInsert = ref<InstanceType<typeof SeibertMiddle>>()
    return { liveInsertPreview, previewInsert }
  },
  mounted() {
    this.insertDesign = Object.keys(this.styles)[0]
  }
})
</script>

<style scoped>

</style>