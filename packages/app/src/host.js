/* eslint-disable no-console */
/* eslint no-console: ["error", { allow: ["log"] }] */
const servers = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302'
      ]
    }
  ]
}

import io from 'socket.io-client'
import opus from './opus'

class Peer {
  constructor (peerData) {
    this.id = peerData.id
    this.room = peerData.room
    this.rtcConn = null
    this.dataChannel = null
  }

  /**
   * Adds Peer RTCIceCandidate.
   * @param {RTCIceCandidate} iceData RTCIceCandidate
   */
  addIceCandidate (iceData) {
    this.rtcConn
      .addIceCandidate(new RTCIceCandidate(iceData.candidate))
      .then(
        console.log('Ice Candidate added successfully for me: ' + this.id)
      )
      .catch(function (err) {
        console.log('Error on addIceCandidate: ' + err)
      })
  }

  /**
   * Adds Peer RTCSessionDescription.
   * @param {RTCSessionDescription} descData RTCSessionDescription
   */
  addRemoteDesc (descData) {
    this.rtcConn
      .setRemoteDescription(new RTCSessionDescription(descData.desc))
      .then(function () {
        console.log(
          'Remote description set successfully for peer: ' + descData.id
        )
      })
      .catch(function (err) {
        console.log('Error on setRemoteDescription: ' + err)
      })
  }

  /**
   * Adds Audio only track to Peer RTC or update an older track with new track.
   * @param {MediaStreamTrack} track
   * @param {Boolean} value if the track type should be enabled/disabled.
   */
  updateOutgoingAudioTrack (track, value) {
    var senders = this.rtcConn.getSenders()
    var sent = false
    if (senders && senders.length > 0) {
      senders.forEach(sender => {
        if (sender.track && sender.track.kind === 'audio') {
          if (value) {
            sender.track.enabled = value
            sender.replaceTrack(track)
            sent = true
          } else {
            sender.track.enabled = value
          }
        }
      })
    }
    if (!sent && value) {
      this.rtcConn.addTrack(track)
    }
  }

  /**
   * Adds Video only track to Peer RTC or update an older track with new track.
   * @param {MediaStreamTrack} track
   * @param {Boolean} value if the track type should be enabled/disabled.
   */
  updateOutgoingVideoTrack (track, value) {
    var senders = this.rtcConn.getSenders()
    var sent = false
    if (senders && senders.length > 0) {
      console.log(senders.length)
      senders.forEach(sender => {
        if (sender.track && sender.track.kind === 'video') {
          if (value) {
            sender.track.enabled = value
            sender.replaceTrack(track)
            sent = true
          } else {
            console.log('track enabled ' + value)
            sender.track.enabled = value
          }
        }
      })
    }
    if (!sent && value) {
      this.rtcConn.addTrack(track)
    }
  }

  /**
   * Update all Tracks to Peer RTC based on type and value.
   * @param {MediaStreamTrack} track
   * @param {Boolean} value if the track type should be enabled/disabled.
   */
  updateTracks (track, value) {
    if (track.kind === 'audio') {
      this.updateOutgoingAudioTrack(track, value)
    }
    if (track.kind === 'video') {
      this.updateOutgoingVideoTrack(track, value)
    }
  }

  /**
   * Send data over
   * @param {Object} data data to send over RTCDataChannel
   */
  sendDCData (data) {
    this.dataChannel.send(data)
  }
}

class StartShare {
  constructor (app, share) {
    this.app = app
    this.peers = []
    this.peerCount = 0
    this.socket = null
    this.sharing = share
    this.initSocket()
  }

  /**
   * Initialize socket connection
   */
  async initSocket () {
    this.socket = await io('localhost:8443')
    if (this.socket && this.sharing) {
      this.setSocketListenersSharing()
      this.socket.emit('create room', {
        room: this.app.roomName,
        isDistributed: true,
        password: this.app.password
      })
    }
    if (this.socket && !this.sharing) {
      this.setSocketListenersToonin()
    }
  }

  /**
   * Set Socket listeners for when Toonin socket connection is started.
   */
  setSocketListenersToonin () {
    this.socket.on('connect', () => {
      this.app.$store.dispatch('UPDATE_PEERID', this.socket.id)
      this.socket.emit('new peer', this.app.roomName)
    })

    this.socket.on('require-password', () => {
      if (this.app.passwordRequired) {
        this.app.errors.push('Incorrect Password')
      }
      this.app.passwordRequired = true
      this.app.auth = true
    })

    this.socket.on('room null', () => {
      this.app.roomName = ''
      this.app.errors.push('Room name is invalid.')
      this.app.$store.dispatch('UPDATE_ROOM', '')
    })

    this.socket.on('host pool', (hostPool) => {
      this.app.errors = []
      this.app.password = ''
      this.app.auth = false
      console.log('recieved host pool to evaluate')
      console.log(hostPool)
      const evalResult = this.app.evaluateHosts(hostPool.potentialHosts)
      evalResult.room = hostPool.roomID
      console.log(evalResult)
      if (evalResult.hostFound) {
        console.log('sending eval result')
        this.socket.emit('host eval res', {
          evalResult,
          name: this.app.$store.getters.NAME
        })
        this.app.targetHost = evalResult.selectedHost
      }
    })

    this.socket.on('src ice', (iceData) => {
      console.log('src ice message came')
      if (
        iceData.room !== this.app.$store.getters.ROOM ||
                iceData.id !== this.app.$store.getters.PEERID
      ) {
        console.log('ice not for me.')
        return
      }
      this.app.$store.getters.RTCCONN.addIceCandidate(
        new RTCIceCandidate(iceData.candidate)
      )
    })

    this.socket.on('src desc', (descData) => {
      console.log('src desc message came')
      var firstTime = false
      if (!this.app.$store.getters.RTCCONN) {
        firstTime = true
        const rtc = new RTCPeerConnection(servers, {
          optional: [{ RtpDataChannels: true }]
        })
        rtc.onicecandidate = event => {
          if (event.candidate) {
            console.log('sending ice')
            this.socket.emit('peer new ice', {
              id: this.socket.id,
              room: this.app.$store.getters.ROOM,
              candidate: event.candidate,
              hostID: this.app.targetHost
            })
          }
        }
        this.app.$store.dispatch('UPDATE_RTCCONN', rtc)
        this.app.attachRTCliteners()
        console.log('first time ')
      }

      this.app.$store.getters.RTCCONN.setRemoteDescription(
        new RTCSessionDescription(descData.desc)
      )
        .then(() => this.app.$store.getters.RTCCONN.createAnswer())
        .then((answer) =>
          this.app.$store.getters.RTCCONN.setLocalDescription(answer)
        )
        .then(() => {
          this.socket.emit('peer new desc', {
            id: this.app.$store.getters.PEERID,
            room: this.app.$store.getters.ROOM,
            desc: this.app.$store.getters.RTCCONN.localDescription,
            selectedHost: this.app.targetHost,
            renegotiation: firstTime
          })
          console.log(
            'sending answer now' +
                        this.app.$store.getters.RTCCONN.localDescription
          )
        })
    })

    this.socket.on('title', (title) => {
      this.app.$store.dispatch('UPDATE_STREAM_TITLE', title)
    })

    /* Listeners to convert this client into host for new peers */

    this.socket.on('peer joined', (peerData) => {
      if (peerData.hostID !== this.socket.id) {
        console.log('peer not for me')
        return
      }
      this.initPeer(peerData)
    })

    this.socket.on('peer ice', (iceData) => {
      console.log(
        'Ice Candidate for me: ' + iceData.hostID + ' in room: ' + iceData.room
      )
      this.addPeerIceCandidate(iceData)
    })

    this.socket.on('peer desc', (descData) => {
      console.log(
        'Answer description from peer: ' +
                descData.id +
                ' for id: ' +
                descData.selectedHost
      )
      this.addPeerDesc(descData)
    })

    this.socket.on('reconnect', (req) => {
      if (req.socketIDs.includes(this.socket.id)) {
        console.log('reconnect req came.')
        this.app.reconnect()
      }
    })

    // this.socket.on('disconnect', () => {
    //   console.log('user disconnected from server.')
    //   this.app.disconnect()
    // })

    this.socket.on('chatIncoming', (message) => {
      // eslint-disable-next-line no-console
      this.app.$store.dispatch(
        'UPDATE_MESSAGES', { message: message.message, name: message.name, time: new Date().toLocaleTimeString('en-US') }
      )
      this.app.$store.dispatch('UPDATE_UNREAD', this.app.$store.getters.UNREAD + 1)
    })

    this.socket.on('chatFromServer', (message) => {
      this.app.$store.dispatch('UPDATE_MESSAGES', { message: message, name: 'Admin', time: new Date().toLocaleTimeString('en-US') })
      this.app.$store.dispatch('UPDATE_UNREAD', this.app.$store.getters.UNREAD + 1)
      if (message === 'room being closed.') {
        this.app.disconnect()
      }
    })
  }

  /**
   * Set Socket listeners for when Sharing socket connection is started.
   */
  setSocketListenersSharing () {
    this.socket.on('room created', (newRoomID) => {
      // eslint-disable-next-line no-console
      console.log('New room created with ID: ' + newRoomID)
      this.app.$store.dispatch('UPDATE_CONNECTED_ROOM', newRoomID)
      this.app.$store.dispatch('UPDATE_MESSAGES', { message: 'Room created successfully.', name: 'Admin', time: new Date().toLocaleTimeString('en-US') })
      this.app.$store.dispatch('UPDATE_UNREAD', this.app.$store.getters.UNREAD + 1)
    })

    this.socket.on('room creation failed', (reason) => {
      // eslint-disable-next-line no-console
      console.log(reason)
      this.app.roomNameInputErrorMessages.push(
        'Error creating room ' + reason + '.'
      )
      this.app.disconnect()
    })

    // new peer connection
    this.socket.on('peer joined', (peerData) => {
      if (peerData.hostID && peerData.hostID !== this.socket.id) {
        // eslint-disable-next-line no-console
        console.log('peer not for me')
      } else {
        // eslint-disable-next-line no-console
        console.log('New peer has joined the room')
        this.initPeerSharing(peerData)
      }
    })

    this.socket.on('peer ice', (iceData) => {
      // eslint-disable-next-line no-console
      console.log('Ice Candidate from peer.')

      // check if this ice data is for us
      if (
        this.app.$store.getters.CONNECTED_ROOM !== iceData.room ||
                iceData.hostID !== this.socket.id
      ) {
        // eslint-disable-next-line no-console
        console.log('Ice Candidate not for me')
      }
      this.addPeerIceCandidate(iceData)
    })

    this.socket.on('peer desc', (descData) => {
      // eslint-disable-next-line no-console
      console.log('Answer description: ' + descData.desc)
      if (this.app.$store.getters.CONNECTED_ROOM !== descData.room) {
        // eslint-disable-next-line no-console
        console.log('Answer Description not for me')
      }
      this.addPeerDesc(descData)
    })

    this.socket.on('disconnect', () => {
      console.log('user disconnected from server.')
    })

    this.socket.on('chatIncoming', (message) => {
      // eslint-disable-next-line no-console
      this.app.$store.dispatch(
        'UPDATE_MESSAGES', { message: message.message, name: message.name, time: new Date().toLocaleTimeString('en-US') }
      )
      this.app.$store.dispatch('UPDATE_UNREAD', this.app.$store.getters.UNREAD + 1)
    })

    this.socket.on('chatFromServer', (message) => {
      this.app.$store.dispatch('UPDATE_MESSAGES', { message: message, name: 'Admin', time: new Date().toLocaleTimeString('en-US') })
      this.app.$store.dispatch('UPDATE_UNREAD', this.app.$store.getters.UNREAD + 1)
    })

    /* Listener to manage peer count */

    this.socket.on('PeerCount', (count) => {
      this.peerCount = count
    })
  }

  /**
   * Initialize a Peer connection to a Toonined in Peer.
   * @param {Object} peerData
   */
  initPeer (peerData) {
    console.log('Starting new connection for peer: ' + peerData.id)

    const peer = new Peer(peerData)

    const rtcConn = new RTCPeerConnection(servers, {
      optional: [
        {
          RtpDataChannels: true
        }
      ]
    })

    if (this.app.$store.getters.VIDEO_STREAM) {
      rtcConn.addTrack(
        this.app.$store.getters.VIDEO_STREAM.getVideoTracks()[0]
      )
    }
    if (this.app.$store.getters.AUDIO_STREAM) {
      rtcConn.addTrack(
        this.app.$store.getters.AUDIO_STREAM.getAudioTracks()[0]
      )
    }

    peer.rtcConn = rtcConn
    try {
      peer.dataChannel = peer.rtcConn.createDataChannel('mediaDescription')
    } catch (err) {
      console.log(err)
    }

    peer.rtcConn.onconnectionstatechange = () => {
      if (peer.dataChannel.readyState === 'closed') {
        this.app.$socket.emit('title', {
          id: peer,
          title: this.app.$store.getters.STREAMTITLE
        })
      }
      if (
        peer.rtcConn.connectionState === 'failed' ||
                peer.rtcConn.connectionState === 'disconnected'
      ) {
        this.peers = this.peers.filter((pr) => pr.id !== peer.id)
      }
    }

    peer.rtcConn.onicecandidate = (event) => {
      if (!event.candidate) {
        console.log('No candidate for RTC connection')
        return
      }
      this.socket.emit('src new ice', {
        id: peer.id,
        room: this.app.$store.getters.ROOM,
        candidate: event.candidate
      })
    }

    peer.rtcConn
      .createOffer({ offerToReceiveAudio: 1 })
      .then((offer) => {
        opus.preferOpus(offer.sdp)
        return peer.rtcConn.setLocalDescription(offer)
      })
      .then(() => {
        this.socket.emit('src new desc', {
          id: peer.id,
          room: this.app.$store.getters.ROOM,
          desc: peer.rtcConn.localDescription
        })
        console.log('sending desc now' + peer.rtcConn.localDescription)
      })

    peer.dataChannel.addEventListener('open', () => {
      console.log('sending title to new peer')
      peer.dataChannel.send(
        JSON.stringify({ title: this.app.$store.getters.STREAMTITLE })
      )
    })

    this.peers.push(peer)
  }

  /**
   * Initialize a Peer connecting to Root/Host Node.
   * @param {Object} peerData
   */
  initPeerSharing (peerData) {
    console.log('Starting new connection for sharing peer: ' + peerData.id)

    const peer = new Peer(peerData)

    const rtcConn = new RTCPeerConnection(servers, {
      optional: [
        {
          RtpDataChannels: true
        }
      ]
    })

    // if (this.app.$store.getters.SHARING_STREAM.getAudioTracks().length > 0) {
    //   rtcConn.addTrack(this.app.$store.getters.SHARING_STREAM.getAudioTracks()[0])
    // }

    peer.rtcConn = rtcConn
    this.peers.push(peer)
    if (this.app.$store.getters.SHARING_STREAM) {
      var stream = this.app.$store.getters.SHARING_STREAM
      // rtcConn.addTrack(this.app.$store.getters.SHARING_STREAM.getVideoTracks()[0])
      stream.getTracks().forEach(track => {
        if (track.kind === 'video' && this.app.$store.getters.SHARE_VIDEO) {
          peer.updateOutgoingVideoTrack(track, this.app.$store.getters.SHARE_VIDEO)
        }
        if (track.kind === 'audio' && this.app.$store.getters.SHARE_AUDIO) {
          peer.updateOutgoingAudioTrack(track, this.app.$store.getters.SHARE_AUDIO)
        }
      })
    }

    try {
      peer.dataChannel = peer.rtcConn.createDataChannel('mediaDescription')
    } catch (err) {
      console.log(err)
    }

    peer.rtcConn.onconnectionstatechange = () => {
      if (peer.dataChannel.readyState === 'closed') {
        this.socket.emit('title', {
          id: peer,
          title: this.app.$store.getters.STREAMTITLE
        })
      }
      if (
        peer.rtcConn.connectionState === 'failed' ||
                peer.rtcConn.connectionState === 'disconnected'
      ) {
        console.log('deleting peer ' + peer.id)
        this.peers = this.peers.filter((pr) => pr.id !== peer.id)
      }
    }

    peer.rtcConn.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('src new ice', {
          id: peer.id,
          room: this.app.$store.getters.CONNECTED_ROOM,
          candidate: event.candidate
        })
      }
    }

    peer.dataChannel.addEventListener('open', () => {
      console.log('sending title to new peer')
      peer.dataChannel.send(JSON.stringify({ title: 'Title from host dc.' }))
    })

    peer.rtcConn.onnegotiationneeded = async () => {
      console.log('negotiationneeded')
      if (peer.rtcConn.signalingState !== 'stable') {
        console.log('connection not stable yet.')
        return
      }
      peer.rtcConn
        .createOffer({ offerToReceiveAudio: 1, offerToReceiveVideo: 1 })
        .then((offer) => {
          opus.preferOpus(offer.sdp)
          return peer.rtcConn.setLocalDescription(offer)
        })
        .then(() => {
          this.socket.emit('src new desc', {
            id: peer.id,
            room: this.app.$store.getters.CONNECTED_ROOM,
            desc: peer.rtcConn.localDescription
          })
          console.log('sending desc now' + peer.rtcConn.localDescription)
        })
    }
  }

  /**
   * Add IceCandidate for its respective RTCPeerConnection.
   * @param {RTCIceCandidate} iceData
   */
  addPeerIceCandidate (iceData) {
    new Promise((resolve, reject) => {
      const el = this.peers.find((peer) => peer.id === iceData.id)
      if (el) {
        resolve(el)
      } else {
        reject(new Error('icedata not for our peer.'))
      }
    })
      .then((peer) => {
        peer.addIceCandidate(iceData)
      })
      .catch((err) => console.log(err))
  }

  /**
   * Add SessionDescription for its respective RTCPeerConnection.
   * @param {RTCSessionDescription} descData
   */
  addPeerDesc (descData) {
    new Promise((resolve, reject) => {
      const el = this.peers.find((peer) => peer.id === descData.id)
      if (el) {
        resolve(el)
      } else {
        reject(new Error('peer desc not for our peer.'))
      }
    })
      .then((peer) => {
        peer.addRemoteDesc(descData)
      })
      .catch((err) => console.log(err))
  }

  /**
   * Update Tracks for all Peer Connections.
   * @param {MediaStreamTrack} track
   */
  updateOutgoingTracks (track) {
    if (this.getPeerCount() > 0) {
      if (track.kind === 'audio') {
        this.peers.forEach((peer) => peer.updateOutgoingAudioTrack(track))
      } else {
        this.peers.forEach((peer) => peer.updateOutgoingVideoTrack(track))
      }
    }
  }

  /**
   * Method called when a message needs to be sent to all Peers over RTCDataChannel.
   * @param {Object} data
   */
  dataChannelMsgEvent (data) {
    if (this.getPeerCount() > 0) {
      this.peers.forEach((peer) => peer.sendDCData(data))
    }
  }

  /**
   * Close all RTCPeerConnections and close the room if Host called this method.
   */
  async removeAllPeersAndClose () {
    if (this.getPeerCount() > 0) {
      this.peers.forEach((peer) => peer.rtcConn.close())
      this.peers.length = 0
    }
    if (this.app.$store.getters.SHARING) {
      await this.socket.emit('disconnect room', {
        room: this.app.$store.getters.CONNECTED_ROOM
      })
    }
    this.socket.close()
    this.socket = null
    console.log('All peers removed: ' + this.peers.length)
  }

  /**
   * Get peer count.
   * @return {number} number of peers connected to Root Node.
   */
  getPeerCount () {
    return this.peerCount
  }

  /**
   * Get current socket connection
   * @return {socket} the current Socket object
   */
  getSocket () {
    if (this.socket) {
      return this.socket
    }
  }

  /**
   * Update Peer connection state with Tracks either to remove or add.
   * @param {Object} params type property either 'video' or 'audio' and whether true or false.
   */
  updatePeers (params) {
    var stream = this.app.$store.getters.SHARING_STREAM
    if (stream) {
      this.peers.forEach(peer => {
        stream.getTracks().forEach(track => {
          if (track.kind === 'video' && params.type === 'video') {
            peer.updateTracks(track, params.value)
          }
          if (track.kind === 'audio' && params.type === 'audio') {
            peer.updateTracks(track, params.value)
          }
        })
      })
    }
  }
}

const _StartShare = StartShare
export { _StartShare as StartShare }
