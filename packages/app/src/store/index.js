import Vue from 'vue'
import Vuex from 'vuex'
import VuePlyr from 'vue-plyr'

// import example from './module-example'

Vue.use(Vuex)
Vue.use(VuePlyr)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    state: {
      connectedStatus: 'disconnected',
      room: '',
      streamTitle: '',
      volume: 50,
      playing: false,
      rtcConn: null,
      peerID: null,
      audioStream: null,
      videoStream: null,
      name: '',
      connectedRoomName: null,
      sharing: false,
      peers: null,
      messages: [],
      sharingStream: null,
      unread: 0,
      shareAudio: false,
      shareVideo: false
    },
    mutations: {
      SET_CONNECTED_STATUS: (state, payload) => {
        state.connectedStatus = payload
      },
      SET_ROOM: (state, payload) => {
        state.room = payload
      },
      SET_STREAM_TITLE: (state, payload) => {
        state.streamTitle = payload
      },
      SET_VOLUME: (state, payload) => {
        state.volume = payload
      },
      SET_PLAYING: (state, payload) => {
        state.playing = payload
      },
      SET_RTCCONN: (state, payload) => {
        state.rtcConn = payload
      },
      SET_PEERID: (state, payload) => {
        state.peerID = payload
      },
      SET_AUDIO_STREAM: (state, payload) => {
        state.audioStream = payload
      },
      SET_VIDEO_STREAM: (state, payload) => {
        state.videoStream = payload
      },
      SET_NAME: (state, payload) => {
        state.name = payload
      },
      SET_CONNECTED_ROOM: (state, payload) => {
        state.connectedRoomName = payload
      },
      SET_SHARING: (state, payload) => {
        state.sharing = payload
      },
      SET_PEERS: (state, payload) => {
        state.peers = payload
      },
      SET_MESSAGE: (state, payload) => {
        state.messages.push(payload)
      },
      SET_SHARING_STREAM: (state, payload) => {
        state.sharingStream = payload
      },
      SET_UNREAD: (state, payload) => {
        state.unread = payload
      },
      SET_SHARE_AUDIO: (state, payload) => {
        state.shareAudio = payload
        state.peers.updatePeers({ type: 'audio', value: payload })
      },
      SET_SHARE_VIDEO: (state, payload) => {
        state.shareVideo = payload
        state.peers.updatePeers({ type: 'video', value: payload })
      }
    },
    actions: {
      UPDATE_CONNECTED_STATUS: (context, payload) => {
        context.commit('SET_CONNECTED_STATUS', payload)
      },
      UPDATE_ROOM: (context, payload) => {
        context.commit('SET_ROOM', payload)
      },
      UPDATE_STREAM_TITLE: (context, payload) => {
        context.commit('SET_STREAM_TITLE', payload)
      },
      UPDATE_VOLUME: (context, payload) => {
        context.commit('SET_VOLUME', payload)
      },
      UPDATE_PLAYING: (context, payload) => {
        context.commit('SET_PLAYING', payload)
      },
      UPDATE_RTCCONN: (context, payload) => {
        context.commit('SET_RTCCONN', payload)
      },
      UPDATE_PEERID: (context, payload) => {
        context.commit('SET_PEERID', payload)
      },
      UPDATE_AUDIO_STREAM: (context, payload) => {
        context.commit('SET_AUDIO_STREAM', payload)
      },
      UPDATE_VIDEO_STREAM: (context, payload) => {
        context.commit('SET_VIDEO_STREAM', payload)
      },
      UPDATE_NAME: (context, payload) => {
        context.commit('SET_NAME', payload)
      },
      UPDATE_CONNECTED_ROOM: (context, payload) => {
        context.commit('SET_CONNECTED_ROOM', payload)
      },
      UPDATE_SHARING: (context, payload) => {
        context.commit('SET_SHARING', payload)
      },
      UPDATE_PEERS: (context, payload) => {
        context.commit('SET_PEERS', payload)
      },
      UPDATE_MESSAGES: (context, payload) => {
        context.commit('SET_MESSAGE', payload)
      },
      UPDATE_SHARING_STREAM: (context, payload) => {
        context.commit('SET_SHARING_STREAM', payload)
      },
      UPDATE_UNREAD: (context, payload) => {
        context.commit('SET_UNREAD', payload)
      },
      UPDATE_SHARE_AUDIO: (context, payload) => {
        context.commit('SET_SHARE_AUDIO', payload)
      },
      UPDATE_SHARE_VIDEO: (context, payload) => {
        context.commit('SET_SHARE_VIDEO', payload)
      }
    },
    getters: {
      CONNECTEDSTATUS: (state) => {
        return state.connectedStatus
      },
      ROOM: (state) => {
        return state.room
      },
      STREAMTITLE: (state) => {
        return state.streamTitle
      },
      VOLUME: (state) => {
        return state.volume
      },
      PLAYING: (state) => {
        return state.playing
      },
      RTCCONN: (state) => {
        return state.rtcConn
      },
      PEERID: (state) => {
        return state.peerID
      },
      AUDIO_STREAM: (state) => {
        return state.audioStream
      },
      VIDEO_STREAM: (state) => {
        return state.videoStream
      },
      NAME: (state) => {
        return state.name
      },
      CONNECTED_ROOM: (state) => {
        return state.connectedRoomName
      },
      SHARING: (state) => {
        return state.sharing
      },
      PEERS: (state) => {
        return state.peers
      },
      MESSAGES: (state) => {
        return state.messages
      },
      SHARING_STREAM: (state) => {
        return state.sharingStream
      },
      UNREAD: (state) => {
        return state.unread
      },
      SHARE_AUDIO: (state) => {
        return state.shareAudio
      },
      SHARE_VIDEO: (state) => {
        return state.shareVideo
      }
    }
  })

  return Store
}
