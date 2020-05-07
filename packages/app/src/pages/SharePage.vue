/* eslint-disable no-console */
<template>

  <div class="q-mt-lg" style="width:599px;height:auto;">
    <div class="video-container">

      <vue-plyr
        style="padding: 0%;"
        muted
      >
        <video
          class="video"
          ref="videoPlayerShare"
          :srcObject.prop="sharingStream"
          @click="requestFullScreen"
          preload="auto"
          muted
          autoplay
          controls
        ></video>
      </vue-plyr>
    </div>
    <q-card-section class="text--primary">
      <q-input
        v-model="roomName"
        style="color: white;"
        autofocus
        text-weight-regular
        label="Name your room"
        outlined
        rounded
        :error="errorMessages.length > 0"
        v-show="!connectedRoom"
      >
        <template v-slot:append>
          <q-btn
            icon="mdi-cached"
            round
            flat
            @click="randomRoomName"
          />
        </template>
        <template v-slot:error>
          {{ errorMessages[0] }}
        </template>
      </q-input>
    </q-card-section>
    <q-card-actions
      style="padding: 20px"
      align="center"
    >
      <span v-show="connectedRoom">
        <q-icon
          large
          color="primary"
          name="mdi-account"
        ></q-icon>
        <span
          class="label-room-name ml-3"
          style="padding-right: 10px"
        >{{ this.peerCounter }} peers</span>
      </span>
      <q-btn
        @click="copyIdToClipboard"
        outlined
        rounded
        v-show="connectedRoom"
      >
        <q-icon
          color="primary"
          name="mdi-content-copy"
        />
      </q-btn>
      <q-btn
        @click="copyLinkToClipboard"
        outlined
        rounded
        v-show="connectedRoom"
      >
        <q-icon
          color="primary"
          name="mdi-earth"
        />
      </q-btn>
      <q-space />
      <q-btn
        @click="startCapture"
        class="btn-share pr-4"
        outline
        rounded
        :color='"primary"'
        height="42"
        v-show="sharingStream == null"
        :disabled="!roomNameValid || tooninHappening"
      >
        <toonin-icon />Share
      </q-btn>
      <q-btn
        @click="getUserVideo"
        disabled
        outlined
        rounded
      >
        <q-icon
          v-if="userVideo"
          color="warning"
          name="mdi-video"
        />
        <q-icon
          v-else
          color="primary"
          name="mdi-video"
        />
      </q-btn>
      <q-btn
        @click="getUserAudio"
        disabled
        outlined
        rounded
      >
        <q-icon
          v-if="userAudio"
          color="warning"
          name="mdi-microphone"
        ></q-icon>
        <q-icon
          v-else
          color="primary"
          name="mdi-microphone"
        ></q-icon>
      </q-btn>
      <q-btn
        @click="stopCapture"
        class="btn-share pr-4"
        height="42"
        outlined
        color="warning"
        rounded
        v-show="sharingStream !== null"
        icon="mdi-stop"
      > Disconnect
      </q-btn>
    </q-card-actions>
  </div>
</template>

<script>
import TooninIcon from '../components/TooninIcon'

function makeid (length) {
  var result = ''
  var characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}
const VALID_ROOM_REGEX = /^[a-z0-9_-]{4,16}$/

const copyToClipboard = (str) => {
  const el = document.createElement('textarea')
  el.value = str
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}
import { mapState } from 'vuex'
import { StartShare } from '../host'
export default {
  name: 'screen-cap',
  components: {
    TooninIcon
  },
  data: () => ({
    videoTag: null,
    roomName: '',
    roomNameInputErrorMessages: [],
    userVideo: null,
    userAudio: null
  }),
  computed: {
    cardTitle () {
      if (this.connectedRoom) {
        return `Personal room name is ${this.connectedRoom}`
      }
      return 'Create your room'
    },
    roomNameValid () {
      const valid = this.roomName.match(VALID_ROOM_REGEX)
      if (valid) {
        return true
      } else {
        return false
      }
    },
    errorMessages () {
      if (this.roomNameInputErrorMessages.length > 0) {
        return this.roomNameInputErrorMessages
      } else if (this.connectedStatus === 'connected') {
        return ['Already connected to a room.']
      } else {
        return []
      }
    },
    tooninHappening () {
      if (this.connectedStatus === 'connected') {
        return true
      }
      return false
    },
    peerCounter () {
      if (this.peers) {
        return this.peers.getPeerCount()
      } else {
        return 0
      }
    },
    ...mapState(['connectedRoom', 'connectedStatus', 'sharing', 'peers', 'sharingStream'])
  },
  watch: {
    sharingStream: function (newValue) {
      if (newValue) {
        this.shareVideo()
      } else {
        this.stopCapture()
      }
    }
  },
  methods: {
    shareVideo () {
      // eslint-disable-next-line no-console
      console.log('called shareVideo.')
      this.peers.getSocket().emit('create room', {
        room: this.roomName,
        isDistributed: true
      })
    },
    async startCapture () {
      var displayMediaOptions = {
        video: {
          cursor: 'motion'
        },
        audio: {
          sampleRate: 44100
        },
        videoConstraints: {
          mandatory: {
            minFrameRate: 60
          }
        }
      }
      let captureStream = null
      try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(
          displayMediaOptions
        )
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err)
        if (typeof window.orientation !== 'undefined') {
          this.roomNameInputErrorMessages.push(
            'Error: screen capture not available on mobile devices.'
          )
        }
        this.roomNameInputErrorMessages.push(
          'Error: screen capture not available. ' + err.message
        )
      }
      if (captureStream) {
        this.$store.dispatch('UPDATE_PEERS', new StartShare(this, true))
        this.roomNameInputErrorMessages = []
        if (captureStream.getAudioTracks() > 0) {
          var localStream = new MediaStream(captureStream.getAudioTracks())
          var audioContext = new AudioContext()
          var audioSourceNode = audioContext.createMediaStreamSource(localStream)
          var remoteDestination = audioContext.createMediaStreamDestination()
          audioSourceNode.connect(remoteDestination)
          const combined = new MediaStream([...captureStream.getVideoTracks(), ...localStream.getAudioTracks()])
          this.$store.dispatch('UPDATE_SHARING_STREAM', combined)
        } else {
          this.$store.dispatch('UPDATE_SHARING_STREAM', captureStream)
        }
      }
    },
    stopCapture () {
      if (this.sharingStream) {
        const tracks = this.sharingStream.getTracks()

        tracks.forEach((track) => track.stop())
        this.$store.dispatch('UPDATE_SHARING_STREAM', null)
      }
      this.disconnect()
    },
    async disconnect () {
      if (this.sharing) {
        await this.peers.removeAllPeersAndClose()
        this.$store.dispatch('UPDATE_CONNECTED_ROOM', null)
        this.$store.dispatch('UPDATE_SHARING', false)
        this.$store.dispatch('UPDATE_PEERS', null)
        this.roomName = ''
      }
    },
    requestFullScreen () {
      if (this.videoTag.requestFullscreen) {
        this.videoTag.requestFullscreen()
      } else if (this.videoTag.mozRequestFullScreen) {
        /* Firefox */
        this.videoTag.mozRequestFullScreen()
      } else if (this.videoTag.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.videoTag.webkitRequestFullscreen()
      } else if (this.videoTag.msRequestFullscreen) {
        /* IE/Edge */
        this.videoTag.msRequestFullscreen()
      }
    },
    randomRoomName () {
      const newname = makeid(8)
      this.roomName = newname
      this.roomNameInputErrorMessages = []
    },
    copyLinkToClipboard () {
      copyToClipboard(`${window.location.origin}/${this.connectedRoom}`)
    },
    copyIdToClipboard () {
      copyToClipboard(this.connectedRoom)
    },
    async getUserAudio () {
      if (!this.userAudio) {
        let stream = null

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true
          })
          /* use the stream */
        } catch (err) {
          // video: { facingMode: "user" }
          /* handle the error */
          // eslint-disable-next-line no-console
          console.log(err)
        }
        this.userAudio = stream
      } else {
        const tracks = this.userAudio.getTracks()

        tracks.forEach((track) => track.stop())
        this.userAudio = null
        // eslint-disable-next-line no-console
        console.log('Audio off')
      }
    },
    async getUserVideo () {
      if (!this.userVideo) {
        let stream = null

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' }
          })
          /* use the stream */
        } catch (err) {
          // video: { facingMode: "user" }
          /* handle the error */
          // eslint-disable-next-line no-console
          console.log(err)
        }
        this.userVideo = stream
      } else {
        const tracks = this.userVideo.getTracks()

        tracks.forEach((track) => track.stop())
        this.userVideo = null
        // eslint-disable-next-line no-console
        console.log('Video off')
      }
    }
  },
  mounted () {
    this.videoTag = this.$refs.videoPlayerShare
    window.onunload = () => {
      if (this.sharing) {
        this.peers.socket.emit('disconnect room', { room: this.connectedRoom })
      }
    }
  }
}
</script>

<style lang="sass" scoped>

.video-container
  border: 1.5px solid #4296bd
  border-radius: 16px
  width: 100%
  padding-top: 56.25%
  height: 0px
  position: relative

.video
  width: 100%
  height: 100%
  position: absolute
  top: 0
  left: 0
</style>
