/* eslint no-console: ["error", { allow: ["log"] }] */
const servers = {
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302"
        ]
      }
    ]
};

export function startShare(peerID, _this) {
    console.log("Starting new connection for peer: " + peerID);
    var videoStream = _this.$store.getters.VIDEO_STREAM;
    var audioStream = _this.$store.getters.AUDIO_STREAM;

    const rtcConn = new RTCPeerConnection(servers, {
        optional: [
            {
                RtpDataChannels: true
            }
        ]
    });

    if(videoStream) { rtcConn.addTrack(videoStream.getVideoTracks()[0]); }
    rtcConn.addTrack(audioStream.getAudioTracks()[0]);

    _this.peers[peerID].rtcConn = rtcConn;
    _this.peers[peerID].dataChannel = _this.peers[peerID].rtcConn.createDataChannel('mediaDescription');

    _this.peers[peerID].rtcConn.onconnectionstatechange = () => {
        Object.keys(_this.peers).forEach(key => {
            if (_this.peers[key].rtcConn.connectionState=="failed" || 
            _this.peers[key].rtcConn.connectionState=="disconnected") {
                // notify backend of client leaving/failure to make sure that
                // network tree is updated correctly
                _this.$socket.client.emit('logoff', { 
                    room: _this.$store.getters.ROOM, 
                    socketID: key 
                });

                delete _this.peers[key]; 
            }
        });

        Object.keys(_this.peers).forEach(key => {
            if (_this.peers[key].dataChannel.readyState=="closed") {
                _this.$socket.client.emit("title", {
                    id: key,
                    title: _this.$store.getters.STREAMTITLE
                });
            }
            
        });
    };

    _this.peers[peerID].rtcConn.onicecandidate = function (event) {
        if (! event.candidate) {
            console.log("No candidate for RTC connection");
            return;
        }
        _this.peers[peerID].iceCandidates.push(event.candidate);
        _this.$socket.client.emit("src new ice", {
            id: peerID,
            room: _this.$store.getters.ROOM,
            candidate: event.candidate
        });
    };

    rtcConn.createOffer({ offerToReceiveAudio: 1 }).then((desc) => {
        // opus.preferOpus(desc.sdp);
        rtcConn.setLocalDescription(new RTCSessionDescription(desc)).then(function () {
            _this.peers[peerID].localDesc = desc;
            _this.$socket.client.emit("src new desc", {
                id: peerID,
                room: _this.$store.getters.ROOM,
                desc: desc
            });
        });
    });

    _this.peers[peerID].dataChannel.addEventListener("open", () => {
        console.log("sending title to new peer");
        _this.peers[peerID].dataChannel.send(
            JSON.stringify({"title": _this.$store.getters.STREAMTITLE })
        );
    });
}

