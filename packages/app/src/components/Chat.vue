<template>
  <div>
    <div class="toonin-title">{{ cardTitle }}</div>
    <q-card class="main-card">
      <q-card-section>
         <q-scroll-area
          ref="chat"
          class="logs"
        >
          <template v-for="(item, index) in messages">
             <div
              v-if="item.name === 'Admin'"
              :key="index"
              class="text-body1"
            >{{ item.message }}</div>
            <q-chat-message
              v-else-if="item.name === 'me'"
              sent
              :key="index"
              :name="item.name"
              :stamp="item.time"
              text-color="white"
              bg-color="primary"
            >{{ item.message }}</q-chat-message>
            <q-chat-message
              v-else
              :key="index"
              :name="item.name"
              bg-color="amber"
              :stamp="item.time"
            >{{ item.message }}</q-chat-message>
          </template>
        </q-scroll-area>
      </q-card-section>
      <q-card-section class="text--primary">
        <q-input
          v-model="message"
          style="color: white;"
          label="Messages"
          outlined
          rounded
          autofocus
          @keydown.enter="sendMessage"
          :error="errorMessages.length > 0"
        >
        <template v-slot:append>
            <q-btn
              icon="mdi-send-circle"
              round
              flat
              @click="sendMessage"
            />
          </template>
          <template v-slot:error>
            {{ errorMessages[0] }}
          </template>
          </q-input>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Chat',
  data: () => ({
    message: '',
    errors: []
  }),
  computed: {
    cardTitle () {
      return 'Messages'
    },
    errorMessages () {
      if (this.errors > 0) {
        return this.errors
      } else if (!this.connectedRoomName && this.connectedStatus !== 'connected') {
        return ['Not Connected to a room.']
      } else {
        return this.errors
      }
    },
    roomname () {
      if (this.connectedRoomName) {
        return this.connectedRoomName
      }
      if (this.room.length > 0) {
        return this.room
      }
      return ''
    },
    ...mapState([
      'name',
      'connectedStatus',
      'room',
      'connectedRoomName',
      'peers',
      'messages'
    ])
  },
  watch: {
    messages () {
      var el = this.$refs.chat
      el.setScrollPosition(el.getScrollTarget().scrollHeight, 1)
    }
  },
  methods: {
    sendMessage () {
      if (this.message === 'logoff') {
        this.peers.socket.emit('disconnect room', {
          room: this.roomname
        })
        this.message = ''
        return
      }
      if (this.message.length < 1) {
        this.errors.push('Invalid message')
      } else if (!this.name) {
        this.errors.push('name not defined.')
      } else {
        // eslint-disable-next-line no-console
        this.errors = []
        if (this.peers) {
          this.peers.socket.emit('message', {
            room: this.roomname,
            message: this.message,
            name: this.name
          })
          this.$store.dispatch('UPDATE_MESSAGES', { message: this.message, name: 'me', time: new Date().toLocaleTimeString('en-US') })
          this.message = ''
        }
      }
    }
  },
  mounted () {
    var el = this.$refs.chat
    el.setScrollPosition(el.getScrollTarget().scrollHeight, 1)
    this.$store.dispatch('UPDATE_UNREAD', 0)
  }
}
</script>

<style lang="sass">
.logs
  height: 300px
  max-width: 100%
  overflow-y: auto
  overflow-x: hidden
  font-size: 12px !important
</style>
