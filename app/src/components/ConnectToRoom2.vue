<template>
  <div style="width: 556px;">

    <div class="row justify-space-between q-mt-lg">
      <q-input
        v-show="showInput"
        v-model="roomName"
        autofocus
        @keydown.enter="toonin"
        placeholder="Room Key"
        outlined
        rounded
        :error="errorMessages.length > 0"
        class="col-8 col-auto q-mr-lg input-room"
      >
        <template v-slot:error>
          {{ errorMessages[0] }}
        </template>
      </q-input>
      <q-btn
        @click="handleTooninButtonClick"
        class="btn-share col-3"
        :color='connectedStatus === "connected" ? "warning": "primary"'
        outline
        rounded
        :disabled="sharing"
      >
        <q-icon
          v-if="connectedStatus === 'connected'"
          name="mdi-stop"
          left
          class="q-mr-xs"
        />
        <toonin-icon
          v-else
          left
          class="q-mr-xs"
        ></toonin-icon>
        {{ buttonStatus }}
      </q-btn>
    </div>

    <ConnectionStatusTimeline />

  </div>
</template>

<script>
import { mapState } from 'vuex'
import { StartShare } from '../host'
import TooninIcon from './TooninIcon'
const SUCCESSFUL = 'connected'
const DISCONNECTED = 'disconnected'
const FAILED = 'failed'
import ConnectionStatusTimeline from "../components/ConnectionStatusTimeline"


/* eslint no-console: ["error", { allow: ["log"] }] */

export default {
  name: 'connect-to-room',
  props: {},
  components: {
    TooninIcon,
    ConnectionStatusTimeline
  },
  data () {
    return {
      roomName: null,
      targetHost: '',
      failedHosts: [],
      errors: []
    }
  },
  methods: {
    handleTooninButtonClick () {
      if (this.connectedStatus === 'connected') {
        this.disconnect()
      } else this.toonin()
    },
    toonin () {
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
      this.rtcConn.onicecandidate = event => {
        if (event.candidate) {
          console.log('sending ice')
          this.peers.getSocket().emit('peer new ice', {
            id: this.peerID,
            room: this.room,
            candidate: event.candidate,
            hostID: this.targetHost
          })
        }
      }

      this.rtcConn.onconnectionstatechange = () => {
        if (this.rtcConn.connectionState === SUCCESSFUL) {
          this.$store.dispatch('UPDATE_CONNECTED_STATUS', SUCCESSFUL)
          this.roomName = ''
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
          this.failedHosts.push(this.targetHost)
          this.peers.getSocket().emit('logoff', {
            room: this.$store.getters.ROOM,
            socketID: this.peers.getSocket().id,
            name: this.$store.getters.NAME
          })
          this.reconnect()

          this.$store.dispatch('UPDATE_CONNECTED_STATUS', DISCONNECTED)
          this.$store.dispatch('UPDATE_ROOM', '')
          this.$store.dispatch('UPDATE_PEERID', null)
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
      this.rtcConn.close()
      this.peers.removeAllPeersAndClose()
      this.$store.dispatch('UPDATE_AUDIO_STREAM', null)
      this.$store.dispatch('UPDATE_VIDEO_STREAM', null)
      this.$store.dispatch('UPDATE_PEERID', null)
      this.$store.dispatch('UPDATE_RTCCONN', null)

      var roomKey = this.$store.getters.ROOM
      this.roomName = roomKey
      this.connectToRoom(true)
    },
    async disconnect () {
      this.peers.getSocket().emit('logoff', {
        room: this.$store.getters.ROOM,
        socketID: this.peers.getSocket().id,
        name: this.$store.getters.NAME
      })
      this.rtcConn.close()
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
    }
  },
  computed: {
    showInput () {
      return this.connectedStatus === 'disconnected' || this.connectedStatus === 'failed'
    },
    buttonStatus () {
      if (this.connectedStatus === 'connected') {
        return 'Disconnect'
      }
      return 'Toonin'
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
      'peers'
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
.btn-share {
  height: 56px;
  font-size: 18px;
  text-transform: capitalize;
}
</style>