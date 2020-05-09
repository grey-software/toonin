<template>
  <div style="width: 556px;">

    <div class="row justify-space-between q-mt-lg">
      <q-input
        v-if="!auth"
        v-model="roomName"
        autofocus
        @keydown.enter="toonin"
        placeholder="Room name"
        outlined
        rounded
        :disabled="isConnectedToRoom"
        :error="errorMessages.length > 0"
        class="col-7 col-auto q-mr-lg input-room"
        
      >
        <template v-slot:error>
          {{ errorMessages[0] }}
        </template>
      </q-input>
      <q-input
        v-else
        v-model="password"
        class="col-5 col-auto q-mr-lg input-room"
        @keydown.enter="toonin"
        placeholder="Room password"
        outlined
        rounded
        :error="errorMessages.length > 0"
        :type="isPwd ? 'password' : 'text'"
      >
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
        <template v-slot:error>
          {{ errorMessages[0] }}
        </template>
      </q-input>
      <q-btn
        @click="cancelAuth"
        class="btn-share col-3"
        outline
        rounded
        :disabled="sharing"
        v-show="auth"
      >
        Cancel
      </q-btn>
      <q-btn
        @click="disconnect"
        class="btn-share btn-disconnect col-4"
        outline
        rounded
        v-if="connectedStatus === 'connected' && !auth"
      >
        <q-icon
          name="mdi-stop"
          left
          class="q-mr-xs"
        />
        Disconnect
      </q-btn>
      <q-btn
        @click="toonin"
        class="btn-share col-3"
        outline
        rounded
        v-else
      >
        <q-icon
          :name="$q.dark.isActive ? 'app:toonin-dark' : 'app:toonin'"
          left
          class="q-mr-xs"
        />
        Toonin
      </q-btn>
    </div>

    <ConnectionStatusTimeline />

  </div>
</template>

<script>
import { mapState } from 'vuex'
import { StartShare } from '../host'
const SUCCESSFUL = 'connected'
const DISCONNECTED = 'disconnected'
const FAILED = 'failed'
import ConnectionStatusTimeline from "../components/ConnectionStatusTimeline"


/* eslint no-console: ["error", { allow: ["log"] }] */

export default {
  name: 'connect-to-room',
  props: {},
  components: {
    ConnectionStatusTimeline
  },
  data () {
    return {
      roomName: null,
      targetHost: '',
      failedHosts: [],
      errors: [],
      passwordRequired: false,
      password: '',
      auth: false,
      isPwd: true
    }
  },
  methods: {
    sendPassword () {
      if (this.password.length > 0) {
        this.errors = []
        this.peers.socket.emit('new peer password', { roomID: this.roomName, password: this.password })
      } else {
        this.errors.push('Password is required for this room.')
        this.password = ''
      }
    },
    cancelAuth () {
      this.auth = false
      this.password = ''
      this.disconnect()
    },
    toonin () {
      if (this.auth) {
        console.log('auth came')
        this.sendPassword()
        return
      }
      this.connectToRoom()
    },
    connectToRoom (reconnecting) {
      this.$store.dispatch('UPDATE_ROOM', this.roomName)
      if (!reconnecting) {
        this.$store.dispatch('UPDATE_PEERS', new StartShare(this, false))
      } else {
        this.peers.getSocket().emit('new peer', this.roomName)
      }
    },
    evaluateHosts (hostPool) {
      for (var i = 0; i < hostPool.length; i++) {
        if (!this.failedHosts.includes(hostPool[i].socketID)) {
          return { hostFound: true, selectedHost: hostPool[i].socketID }
        }
      }
    },
    attachRTCliteners () {
      this.rtcConn.onconnectionstatechange = () => {
        if (this.rtcConn.connectionState === SUCCESSFUL) {
          this.$store.dispatch('UPDATE_CONNECTED_STATUS', SUCCESSFUL)
          try {
            this.rtcConn.createDataChannel('mediaDescription')
          } catch (err) {
            console.log(err)
          }
        }

        if (
          this.rtcConn.connectionState === DISCONNECTED ||
          this.rtcConn.connectionState === FAILED
        ) {
          console.log('Connection failed')
          this.reconnect()

          this.$store.dispatch('UPDATE_CONNECTED_STATUS', DISCONNECTED)
          this.$store.dispatch('UPDATE_ROOM', '')
          this.$store.dispatch('UPDATE_STREAM_TITLE', '')
          this.$store.dispatch('UPDATE_PLAYING', false)
          this.$store.dispatch('UPDATE_RTCCONN', null)
          this.$store.dispatch('UPDATE_AUDIO_STREAM', null)
          this.$store.dispatch('UPDATE_VIDEO_STREAM', null)
          this.targetHost = ''
        }
      }

      this.rtcConn.ondatachannel = event => {
        var channel = event.channel
        channel.onmessage = this.onDataChannelMsg
      }

      this.rtcConn.ontrack = event => {
        var incomingStream = new MediaStream([event.track])
        this.peers.updateOutgoingTracks(event.track)

        var _iOSDevice = !!navigator.platform.match(
          /iPhone|iPod|iPad|Macintosh|MacIntel/
        )

        if (_iOSDevice) {
          this.$store.dispatch('UPDATE_CONNECTED_STATUS', SUCCESSFUL)
          this.$store.dispatch('UPDATE_PLAYING', false)

          if (incomingStream.getVideoTracks().length > 0) {
            this.$store.dispatch('UPDATE_VIDEO_STREAM', incomingStream)
          } else {
            this.$store.dispatch('UPDATE_AUDIO_STREAM', incomingStream)
          }
        } else {
          this.$store.dispatch('UPDATE_CONNECTED_STATUS', SUCCESSFUL)
          this.$store.dispatch('UPDATE_PLAYING', true)

          if (incomingStream.getVideoTracks().length > 0) {
            this.$store.dispatch('UPDATE_VIDEO_STREAM', incomingStream)
          } else {
            this.$store.dispatch('UPDATE_AUDIO_STREAM', incomingStream)
          }
        }
      }
    },
    onDataChannelMsg (messageEvent) {
      // data channel to recieve the media title
      try {
        if (messageEvent.data === 'close') {
          this.disconnect()
          return
        }
        this.peers.dataChannelMsgEvent(messageEvent.data)
        var mediaDescription = JSON.parse(messageEvent.data)
        this.$store.dispatch('UPDATE_STREAM_TITLE', mediaDescription.title)
      } catch (err) {
        this.logMessage()
      }
    },
    logMessage () {
      // continue regardless of error
    },
    reconnect () {
      if (this.rtcConn) {
        this.rtcConn.close()
      }
      this.peers.removeAllPeersAndClose()
      this.$store.dispatch('UPDATE_AUDIO_STREAM', null)
      this.$store.dispatch('UPDATE_VIDEO_STREAM', null)
      this.$store.dispatch('UPDATE_RTCCONN', null)

      var roomKey = this.$store.getters.ROOM
      this.roomName = roomKey
      this.passwordRequired = false
      this.connectToRoom(false)
    },
    async disconnect () {
      if (this.rtcConn) {
        this.rtcConn.close()
      }
      await this.peers.removeAllPeersAndClose()
      this.$store.dispatch('UPDATE_AUDIO_STREAM', null)
      this.$store.dispatch('UPDATE_VIDEO_STREAM', null)
      this.$store.dispatch('UPDATE_CONNECTED_STATUS', DISCONNECTED)
      this.$store.dispatch('UPDATE_ROOM', '')
      this.$store.dispatch('UPDATE_PEERID', null)
      this.$store.dispatch('UPDATE_STREAM_TITLE', '')
      this.$store.dispatch('UPDATE_PLAYING', false)
      this.$store.dispatch('UPDATE_RTCCONN', null)
      this.$store.dispatch('UPDATE_PEERS', null)
      this.targetHost = ''
      this.failedHosts = []
      this.roomName = ''
      this.passwordRequired = false
    }
  },
  computed: {
    isConnectedToRoom () {
      return this.connectedStatus === 'connected'
    },
    showInput () {
      return this.connectedStatus === 'disconnected' || this.connectedStatus === 'failed'
    },
    cardTitle () {
      if (this.connectedStatus === 'connected') {
        return `Connected to ${this.room}`
      }
      return 'Connect to a room'
    },
    errorMessages () {
      if (this.errors > 0) {
        return this.errors
      } else if (this.sharing) {
        return ['Already sharing in a room.']
      } else {
        return this.errors
      }
    },
    ...mapState([
      'room',
      'rtcConn',
      'streamTitle',
      'playing',
      'connectedStatus',
      'peerID',
      'audioStream',
      'videoStream',
      'sharing',
      'peers',
      'name'
    ])
  },
  mounted: function () {
    if (this.$route.params.room) {
      this.roomName = this.$route.params.room
      setTimeout(() => this.toonin(), 500)
    }
    window.onunload = () => {
      if (this.room) {
        this.peers.socket.emit('logoff', {
          room: this.$store.getters.ROOM,
          socketID: this.peers.getSocket().id,
          name: this.$store.getters.NAME
        })
      }
    }
  }
}
</script>


<style scoped>
.input-room {
  font-size: 16px;
  color: var(--q-color-primary);
}
.btn-share {
  height: 56px !important;
  font-size: 16px;
  margin-right: 10px;
  text-transform: capitalize;
  color: var(--q-color-primary);
}

.btn-disconnect {
  color: #ffc400;
}
.q-field--outlined .q-field__control {
  padding: 0 24px !important;
}
</style>

<style scoped>
.body--dark .btn-share {
  color: #b9bbbe;
}

.body--dark .input-room {
  color: #b9bbbe;
}

.body--dark .btn-disconnect {
  color: #f6d45a;
}
</style>