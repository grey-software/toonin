<template>
  <q-card
    class="mx-auto"
    max-width="900px"
    :elevation="40"
  >
    <q-card-section class="toonin-title">{{ cardTitle }}</q-card-section>
    <q-container fluid>
      <q-card>
        <q-card-section>
          <q-list
            ref="chat"
            id="logs"
          >
            <template q-for="(item, index) in messages">
              <div
                q-if="item"
                :key="index"
                class="text-body1"
              >{{ item }}</div>
            </template>
          </q-list>
        </q-card-section>
      </q-card>
      <q-card-actions>
        <q-input
          q-model="message"
          style="color: white;"
          label="Messages"
          outlined
          rounded
          autofocus
          append-icon="mdi-send-circle"
          @click:append="sendMessage"
          @keydown.enter="sendMessage"
          :error-messages="errorMessages"
        />
      </q-card-actions>
    </q-container>
  </q-card>
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
      } else if (!this.sharing && this.connectedStatus !== 'connected') {
        return ['Not Connected to a room.']
      } else {
        return this.errors
      }
    },
    roomname () {
      if (this.sharing) {
        return this.connectedRoom
      }
      if (this.room.length > 0) {
        return this.room
      }
      return ''
    },
    ...mapState([
      'sharing',
      'name',
      'connectedStatus',
      'room',
      'connectedRoom',
      'peers',
      'messages'
    ])
  },
  watch: {
    messages () {
      setTimeout(() => {
        this.$refs.chat.$el.scrollTop = this.$refs.chat.$el.scrollHeight
      }, 0)
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
          this.$store.dispatch('UPDATE_MESSAGES', 'You: ' + this.message)
          this.message = ''
        }
      }
    }
  },
  mounted () { }
}
</script>

<style>
#logs {
  height: 300px;
  overflow: auto;
}
</style>
