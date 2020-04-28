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

  addIceCandidate (iceData) {
    this.rtcConn
      .addIceCandidate(new RTCIceCandidate(iceData.candidate))
      .then(
        console.log('Ice Candidate added successfully for peer: ' + this.id)
      )
      .catch(function (err) {
        console.log('Error on addIceCandidate: ' + err)
      })
  }

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

  updateOutgoingAudioTrack (track) {
    var senders = this.rtcConn.getSenders()
    if (senders[0].track.kind === 'audio') {
      senders[0].replaceTrack(track)
    } else {
      senders[1].replaceTrack(track)
    }
  }

  updateOutgoingVideoTrack (track) {
    var senders = this.rtcConn.getSenders()
    if (senders[0].track.kind === 'video') {
      senders[0].replaceTrack(track)
    } else {
      senders[1].replaceTrack(track)
    }
  }

  sendDCData (data) {
    this.dataChannel.send(data)
  }
}

class StartShare {
  constructor (app, share) {
    this.app = app
    this.peers = []
    this.peerCount = 0;
    this.socket = null
    this.sharing = share
    this.initSocket()
  }

  async initSocket () {
    // console.log(window);
    this.socket = await io(window.location.hostname + ':8443')
    if (this.socket && this.sharing) {
      this.setSocketListeners()
    }
    if (this.socket && !this.sharing) {
      this.setSocketListenersToonin()
    }
  }

  setSocketListenersToonin () {
    this.socket.on('connect', () => {
      this.app.$store.dispatch('UPDATE_PEERID', this.socket.id)
      this.socket.emit('new peer', this.app.roomName)
    })

    this.socket.on('room null', () => {
      this.app.roomName = ''
      this.app.errors.push('Room name is invalid.')
      this.app.$store.dispatch('UPDATE_ROOM', '')
    })

    this.socket.on('host pool', (hostPool) => {
      this.app.errors = []
      console.log('recieved host pool to evaluate')
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
        return
      }
      this.app.$store.getters.RTCCONN.addIceCandidate(
        new RTCIceCandidate(iceData.candidate)
      )
    })

    this.socket.on('src desc', (descData) => {
      console.log('src desc message came')
      if (
        descData.room !== this.app.$store.getters.ROOM ||
                descData.id !== this.app.$store.getters.PEERID
      ) {
        return
      }
      const rtc = new RTCPeerConnection(servers, {
        optional: [{ RtpDataChannels: true }]
      })
      this.app.$store.dispatch('UPDATE_RTCCONN', rtc)
      this.app.attachRTCliteners()
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
            selectedHost: this.app.targetHost
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
        'Ice Candidate from peer: ' + iceData.id + ' in room: ' + iceData.room
      )
      console.log('Ice Candidate: ' + iceData.candidate)

      // check if this ice data is for us or someone else in the room
      if (
        this.app.$store.getters.ROOM !== iceData.room ||
                iceData.hostID !== this.socket.id
      ) {
        console.log('Ice Candidate not for me')
      }
      this.addPeerIceCandidate(iceData)
    })

    this.socket.on('peer desc', (descData) => {
      console.log(
        'Answer description from peer: ' +
                descData.id +
                ' in room: ' +
                descData.room
      )
      console.log('Answer description: ' + descData.desc)
      if (this.app.$store.getters.ROOM !== descData.room) {
        console.log('Answer Description not for me')
      }
      this.addPeerDesc(descData)
    })

    this.socket.on('reconnect', (req) => {
      if (req.socketIDs.includes(this.socket.id)) {
        this.app.reconnect()
      }
    })

    this.socket.on('disconnect', () => {
      console.log('user disconnected from server.')
      this.app.disconnect()
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
      if (message === 'room being closed.') {
        this.app.disconnect()
      }
    })
  }

  setSocketListeners () {
    this.socket.on('room created', (newRoomID) => {
      // eslint-disable-next-line no-console
      console.log('New room created with ID: ' + newRoomID)
      this.app.$store.dispatch('UPDATE_CONNECTED_ROOM', newRoomID)
      this.app.$store.dispatch('UPDATE_SHARING', true)
      this.app.$store.dispatch('UPDATE_MESSAGES', { message: 'Room created successfully.', name: 'Admin', time: new Date().toLocaleTimeString('en-US') })
      this.app.$store.dispatch('UPDATE_UNREAD', this.app.$store.getters.UNREAD + 1)
    });

    this.socket.on('room creation failed', (reason) => {
      // eslint-disable-next-line no-console
      console.log(reason)
      this.app.roomNameInputErrorMessages.push(
        'Error creating room ' + reason + '.'
      )
      this.app.$store.dispatch('UPDATE_CONNECTED_ROOM', null)
      this.app.$store.dispatch('UPDATE_SHARING', false)
      this.app.stopCapture()
    });

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
    });

    this.socket.on('peer ice', (iceData) => {
      // eslint-disable-next-line no-console
      // console.log(
      //   "Ice Candidate from peer: " + iceData.id + " in room: " + iceData.room
      // );
      // eslint-disable-next-line no-console
      console.log('Ice Candidate: ' + iceData.candidate)

      // check if this ice data is for us
      if (
        this.app.$store.getters.CONNECTED_ROOM !== iceData.room ||
                iceData.hostID !== this.socket.id
      ) {
        // eslint-disable-next-line no-console
        console.log('Ice Candidate not for me')
      }
      this.addPeerIceCandidate(iceData)
    });

    this.socket.on('peer desc', (descData) => {
      // eslint-disable-next-line no-console
      // console.log(
      //   "Answer description from peer: " +
      //     descData.id +
      //     " in room: " +
      //     descData.room
      // );
      // eslint-disable-next-line no-console
      console.log('Answer description: ' + descData.desc)
      if (this.app.$store.getters.CONNECTED_ROOM !== descData.room) {
        // eslint-disable-next-line no-console
        console.log('Answer Description not for me')
      }
      this.addPeerDesc(descData)
    });

    this.socket.on('disconnect', () => {
      console.log('user disconnected from server.')
    });

    this.socket.on('chatIncoming', (message) => {
      // eslint-disable-next-line no-console
      this.app.$store.dispatch(
        'UPDATE_MESSAGES', { message: message.message, name: message.name, time: new Date().toLocaleTimeString('en-US') }
      )
      this.app.$store.dispatch('UPDATE_UNREAD', this.app.$store.getters.UNREAD + 1)
    });

    this.socket.on('chatFromServer', (message) => {
      this.app.$store.dispatch('UPDATE_MESSAGES', { message: message, name: 'Admin', time: new Date().toLocaleTimeString('en-US') })
      this.app.$store.dispatch('UPDATE_UNREAD', this.app.$store.getters.UNREAD + 1)
    });

    /* Listeners to manage peer count */

    this.socket.on("incrementPeerCount", () => {
      this.peerCount++;
    });

    this.socket.on("decrementPeerCount", () => {
      this.peerCount--;
    });
  }

  /**
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
        this.socket.emit('logoff', {
          room: this.app.$store.getters.ROOM,
          socketID: peer.id,
          name: this.app.$store.getters.NAME
        })
        this.peers = this.peers.filter((pr) => pr.id !== peer.id)
      }
    }

    peer.rtcConn.onicecandidate = (event) => {
      if (!event.candidate) {
        console.log('No candidate for RTC connection')
        return
      }
      // peer.iceCandidates.push(event.candidate);
      // peer.rtcConn.addIceCandidate(new RTCIceCandidate(event.candidate));
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

    if (this.app.$store.getters.SHARING_STREAM.getVideoTracks().length > 0) {
      this.app.$store.getters.SHARING_STREAM.getTracks().forEach(track => rtcConn.addTrack(track, this.app.$store.getters.SHARING_STREAM))
      // rtcConn.addTrack(this.app.$store.getters.SHARING_STREAM.getVideoTracks()[0])
    }
    // if (this.app.$store.getters.SHARING_STREAM.getAudioTracks().length > 0) {
    //   rtcConn.addTrack(this.app.$store.getters.SHARING_STREAM.getAudioTracks()[0])
    // }

    peer.rtcConn = rtcConn
    this.peers.push(peer)
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

    peer.rtcConn
      .createOffer({ offerToReceiveAudio: 1 })
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

    peer.dataChannel.addEventListener('open', () => {
      console.log('sending title to new peer')
      peer.dataChannel.send(JSON.stringify({ title: 'Title from host dc.' }))
    })
  }

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

  updateOutgoingTracks (track) {
    if (this.getPeerCount() > 0) {
      if (track.kind === 'audio') {
        this.peers.forEach((peer) => peer.updateOutgoingAudioTrack(track))
      } else {
        this.peers.forEach((peer) => peer.updateOutgoingVideoTrack(track))
      }
    }
  }

  dataChannelMsgEvent (data) {
    if (this.getPeerCount() > 0) {
      this.peers.forEach((peer) => peer.sendDCData(data))
    }
  }

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
    console.log('All peers removed: ' + this.peers.length)
  }

  getPeerCount () {
    return this.peerCount;
  }

  getSocket () {
    if (this.socket) {
      return this.socket
    }
  }
}

const _StartShare = StartShare
export { _StartShare as StartShare }
