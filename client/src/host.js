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

export function startShare(peerID, vueRef) {
    console.log("Starting new connection for peer: " + peerID);
    var videoStream = vueRef.$store.getters.VIDEO_STREAM;
    var audioStream = vueRef.$store.getters.AUDIO_STREAM;

    const rtcConn = new RTCPeerConnection(servers, {
        optional: [
            {
                RtpDataChannels: true
            }
        ]
    });

    if(videoStream) { rtcConn.addTrack(videoStream.getVideoTracks()[0]); }
    rtcConn.addTrack(audioStream.getAudioTracks()[0]);

    vueRef.peers[peerID].rtcConn = rtcConn;
    vueRef.peers[peerID].dataChannel = vueRef.peers[peerID].rtcConn.createDataChannel('mediaDescription');

    vueRef.peers[peerID].rtcConn.onconnectionstatechange = () => {
        Object.keys(vueRef.peers).forEach(key => {
            if (vueRef.peers[key].rtcConn.connectionState=="failed" || 
            vueRef.peers[key].rtcConn.connectionState=="disconnected") delete vueRef.peers[key];
        });

        Object.keys(vueRef.peers).forEach(key => {
            if (vueRef.peers[key].dataChannel.readyState=="closed") {
                vueRef.$socket.client.emit("title", {
                    id: key,
                    title: vueRef.$store.getters.STREAMTITLE
                });
            }
            
        });
    };

    vueRef.peers[peerID].rtcConn.onicecandidate = function (event) {
        if (! event.candidate) {
            console.log("No candidate for RTC connection");
            return;
        }
        vueRef.peers[peerID].iceCandidates.push(event.candidate);
        vueRef.$socket.client.emit("src new ice", {
            id: peerID,
            room: vueRef.$store.getters.ROOM,
            candidate: event.candidate
        });
    };

    rtcConn.createOffer({ offerToReceiveAudio: 1 }).then((desc) => {
        // opus.preferOpus(desc.sdp);
        rtcConn.setLocalDescription(new RTCSessionDescription(desc)).then(function () {
            vueRef.peers[peerID].localDesc = desc;
            vueRef.$socket.client.emit("src new desc", {
                id: peerID,
                room: vueRef.$store.getters.ROOM,
                desc: desc
            });
        });
    });

    vueRef.peers[peerID].dataChannel.addEventListener("open", () => {
        console.log("sending title to new peer");
        vueRef.peers[peerID].dataChannel.send(
            JSON.stringify({"title": vueRef.$store.getters.STREAMTITLE })
        );
    });
}

