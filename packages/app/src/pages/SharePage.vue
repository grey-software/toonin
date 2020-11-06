
/* eslint-disable no-console */
<template>

  <div class="share-container">
    <div class="row justify-space-between">

      <q-input
        v-model="roomName"
        autofocus
        :label="!connectedRoomName ? 'Name your room': connectedRoomName"
        @keydown.enter="createRoom"
        outlined
        rounded
        v-show="!connectedRoomName"
        :error="errorMessages.length > 0"
        class="col-7 col-auto q-mr-lg input-room"
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
      <q-input
        v-model="isConnectedToRoom"
        outlined
        rounded
        disabled
        class="col-5 q-mr-lg input-room"
        v-show="connectedRoomName"
      />
      <q-btn
        @click="createRoom"
        class="btn-share col-4"
        outline
        rounded
        v-if="!sharingStream"
      >
        <q-icon
          :name="$q.dark.isActive ? 'app:toonin-dark' : 'app:toonin'"
          left
          class="q-mr-xs"
        />
        Share
      </q-btn>
      <q-btn
        @click="stopCapture"
        class="btn-share btn-disconnect col-4"
        outline
        rounded
        v-else
      >
        <q-icon
          name="mdi-stop"
          left
          class="q-mr-xs"
        />
        Stop Sharing
      </q-btn>
      <q-input
        v-model="password"
        v-show="!connectedRoomName"
        placeholder="Password (Optional)"
        class="col-5 q-mr-lg input-room"
        outlined
        rounded
        :type="revealPassword ? 'password' : 'text'"
      >
        <template v-slot:append>
          <q-icon
            :name="revealPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="revealPassword = !revealPassword"
          />
        </template>
      </q-input>
      <q-btn
        @click="disconnect"
        class="btn-share col-2"
        outline
        rounded
        v-show="connectedRoomName"
      >Disconnect
      </q-btn>
    </div>

    <div class="row items-center q-py-lg q-px-lg">
      <span v-show="connectedRoomName">
        <q-icon
          color="primary"
          name="mdi-account"
          class="peer-count-icon"
        ></q-icon>
        <span class="peer-count-text q-mt-xs">{{ this.peerCounter }} peers</span>
      </span>
      <q-btn
        @click="copyLinkToClipboard"
        outlined
        rounded
        flat
        v-show="connectedRoomName"
      >
        <q-icon
          color="primary"
          name="mdi-content-copy"
        />
      </q-btn>
      <q-space />

      <q-checkbox
        v-model="sendAudio"
        color="secondary"
        label="Share Audio"
        v-show="sharingStream"
        :disabled="sharingStream ? sharingStream.getAudioTracks().length === 0 : true"
      />
      <q-checkbox
        v-model="sendVideo"
        color="secondary"
        label="Share Video"
        v-show="sharingStream"
      />

    </div>

    <div
      class="video-container"
      v-if="sharing"
    >

      <vue-plyr
        style="padding: 0%;"
        ref="videoPlayer"
      >
        <video
          class="video"
          ref="videoTag"
          :srcObject.prop="sharingStream"
          autoplay
          controls
        ></video>
      </vue-plyr>
    </div>

  </div>
</template>

<script>

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
  data: () => ({
    videoTag: null,
    videoPlayer: null,
    roomName: '',
    roomNameInputErrorMessages: [],
    userVideo: null,
    userAudio: null,
    password: '',
    revealPassword: true
  }),
  computed: {
    isConnectedToRoom () {
      this.roomNameInputErrorMessages = []
      return "Connected to " + this.connectedRoomName
    },
    roomNameValid () {
      return this.roomName.match(VALID_ROOM_REGEX)
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
    peerCounter () {
      return this.peers ? this.peers.getPeerCount() : 0
    },
    sendAudio: {
      get () {
        return this.shareAudio
      },
      set (value) {
        this.$store.dispatch('UPDATE_SHARE_AUDIO', value)
      }
    },
    sendVideo: {
      get () {
        return this.shareVideo
      },
      set (value) {
        this.$store.dispatch('UPDATE_SHARE_VIDEO', value)
      }
    },
    ...mapState(['connectedRoomName', 'connectedStatus', 'sharing', 'peers', 'sharingStream', 'shareAudio', 'shareVideo'])
  },
  watch: {
    connectedRoomName: function (newValue) {
      if (newValue) {
        this.startCapture()
      }
    }
  },
  methods: {
    createRoom () {
      if (!this.peers) {
        this.roomNameInputErrorMessages = []
        this.$store.dispatch('UPDATE_PEERS', new StartShare(this, true))
      } else {
        this.startCapture()
      }
    },
    async startCapture () {
      if (this.connectedRoomName) {
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
          this.roomNameInputErrorMessages.push(
            'Error: screen capture not available. ' + err.message
          )
        }
        if (!captureStream) {
          return
        }
        this.roomNameInputErrorMessages = []
        this.$store.dispatch('UPDATE_SHARING', true)
        if (captureStream.getAudioTracks().length > 0) {
          const localStream = new MediaStream(captureStream.getAudioTracks())
          const audioContext = new AudioContext()
          const audioSourceNode = audioContext.createMediaStreamSource(localStream)
          const remoteDestination = audioContext.createMediaStreamDestination()
          audioSourceNode.connect(remoteDestination)
          const combined = new MediaStream([...captureStream.getVideoTracks(), ...localStream.getAudioTracks()])
          this.$store.dispatch('UPDATE_SHARING_STREAM', combined)
          this.$store.dispatch('UPDATE_SHARE_AUDIO', true)
          this.$store.dispatch('UPDATE_SHARE_VIDEO', true)
          this.videoPlayer.increaseVolume()
        } else {
          this.$store.dispatch('UPDATE_SHARING_STREAM', captureStream)
          this.$store.dispatch('UPDATE_SHARE_VIDEO', true)
        }
      }
    },
    stopCapture () {
      if (!this.sharingStream) {
        return
      }
      this.$store.dispatch('UPDATE_SHARE_AUDIO', false)
      this.$store.dispatch('UPDATE_SHARE_VIDEO', false)
      const tracks = this.sharingStream.getTracks()
      tracks.forEach((track) => track.enabled = false)
      setTimeout(function () { tracks.forEach((track) => track.stop()) }, 1000);
      this.$store.dispatch('UPDATE_SHARING_STREAM', null)
      this.$store.dispatch('UPDATE_SHARING', false)
    },
    async disconnect () {
      if (!this.connectedRoomName) {
        return
      }
      await this.peers.removeAllPeersAndClose()
      this.$store.dispatch('UPDATE_CONNECTED_ROOM', null)
      this.$store.dispatch('UPDATE_PEERS', null)
      this.roomName = ''
      this.stopCapture()
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
      copyToClipboard(`${window.location.origin}/?room=${this.connectedRoomName}`)
    },
    mounted () {
      this.videoTag = this.$refs.videoTag
      this.videoPlayer = this.$refs.videoPlayer
      window.onunload = () => {
        if (this.sharing) {
          this.peers.socket.emit('disconnect room', { room: this.connectedRoomName })
        }
      }
    }
  }
}
</script>

<style scoped>
.share-container {
  width: 599px;
  height: auto;
}

.peer-count-icon {
  font-size: 28px;
}

.peer-count-text {
  padding: 0px 8px;
  font-size: 18px;
  font-family: "TooninTitle";
  color: #696969;
}

.plyr {
  margin: 0px 20px;
  border-radius: 4px;
}

.video-player {
  border-radius: 16px;
  width: 599px;
}

.input-room {
  font-size: 16px;
  color: var(--q-color-primary);
}

.btn-share {
  height: 56px !important;
  font-size: 16px;
  text-transform: capitalize;
  margin-right: 10px;
  color: var(--q-color-primary);
}
</style>

<style>
.q-field__control {
  padding: 0px 20px !important;
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
