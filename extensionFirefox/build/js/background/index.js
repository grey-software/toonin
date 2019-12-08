// used by client.
import opus from './opus';
import io from './socket.io';

var remoteDestination,
    audioSourceNode,
    gainNode;
var streamFromTab;
const constraints = {
    audio: true
};
// keep track of tab on which the extension is active.
var state = "HOME";
var tabID;
var port;
var audioContext;
var peerCounter = 0;
var title;
var tabmuted = false;
// last mute state
var muteState = false;
// used by host

var rtcConnIncoming = null;
var audioElement = document.createElement('audio');
audioElement.setAttribute("preload", "auto");
audioElement.load;


// used by Gain Node
var volume = 1;
browser.runtime.onConnect.addListener(function (p) {
    port = p;
    p.onMessage.addListener(function (msg) {
        if (msg.type === "init") {
            // optional parameter roomName.
            socket.emit("create room", msg.roomName);
            addTitleListener();
        }
        if (msg.type === "requestState") {
            sendState()
        }
        if (msg.type == "stopToonin") {
            stopListening();
        }
        if (msg.type == "stopSharing") {
            disconnect();
        }
        if (msg.type == "toggleMute") {
            muteState = ! msg.value;
            if (muteState) {
                Object.keys(peers).forEach(function (peer) {
                    var rc = peers[peer].rtcConn;
                    rc.removeTrack(rc.getSenders()[0]);
                });
            } else {
                Object.keys(peers).forEach(function (peer) {
                    var rc = peers[peer].rtcConn;
                    rc.getSenders()[0].replaceTrack(remoteDestination.stream.getAudioTracks()[0]);
                });
            }
        }
        if (msg.type == "volume") {
            changeVolume(msg.value);
        }
        if (msg.type == "stateUpdate") {
            state = msg.state.state;
        }
    });
});
browser.tabs.onRemoved.addListener(function (tabId, removed) {
    if (tabId === tabID) {
        disconnect();
    }
});
function addTitleListener() {
    browser.tabs.onUpdated.addListener(function (tabId, changeInfo) {
        if (changeInfo.title && tabId === tabID) {
            console.log(changeInfo.title);
            title = changeInfo.title;
            sendMediaDescription();
            sendState();
        }
    });
}


function disconnect() {
    var roomCurrent = roomID;
    socket.emit("disconnect room", {room: roomCurrent});
    // stops tabCapture
    localAudioStream.getAudioTracks()[0].stop();
    var peerIDs = Object.keys(peers);
    for (var i = 0; i < peerIDs.length; i++) {
        peers[peerIDs[i]].rtcConn.close();
        delete peers[peerIDs[i]];
    }
    peers = {};
    localAudioStream = null;
    peerCounter = Object.keys(peers).length;
}
// sets the volume
function changeVolume(value) {
    var fraction = parseInt(value, 10) / parseInt(100, 10);
    volume = fraction * fraction;
    console.log(fraction);
    if (! tabmuted && ! rtcConnIncoming) {
        gainNode.gain.value = volume;
    } else if (rtcConnIncoming) {
        audioElement.volume = volume;
    }
}
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "extension-state") {
        sendState();
    }
});

/**
 * allow user to mute/unmute the tab on which extension is running
 */
browser.tabs.onUpdated.addListener(function (currentTab, changeInfo) {
    if (changeInfo.mutedInfo && currentTab === tabID) {
        if (changeInfo.mutedInfo.muted) {
            tabmuted = true;
            gainNode.gain.value = 0;
        } else {
            tabmuted = false;
            gainNode.gain.value = volume;
        }
        sendState();
        // window.audio.muted = changeInfo.mutedInfo.muted;
    }
});
/**
 * capture user's tab audio for sharing with peers
 */
function getTabAudio() {
    
    // navigator.mediaDevices.getUserMedia({audio: true}, function(stream){
        // if (! stream) {
        //     console.error("Error starting tab capture: " + (
        //         browser.runtime.lastError.message || "UNKNOWN"
        //     ));
        //     return;
        // }
        // let tracks = localAudioStream.getAudioTracks(); // MediaStreamTrack[], stream is MediaStream
        // var stream = new MediaStream(tracks);
        // audioContext = new AudioContext();
        // gainNode = audioContext.createGain();
        // gainNode.connect(audioContext.destination);
        // audioSourceNode = audioContext.createMediaStreamSource(stream); // of type MediaStreamAudioSourceNode
        // audioSourceNode.connect(gainNode);
        // gainNode.gain.value = 1;
        // remoteDestination = audioContext.createMediaStreamDestination();
        // audioSourceNode.connect(remoteDestination);
        // console.log("Tab audio captured. Now sending url to injected content script");
        // browser.tabs.query({
        //     active: true,
        //     currentWindow: true
        // }, function (tabs) {
        //     var currTab = tabs[0];
        //     if (currTab) {
        //         tabID = currTab.id;
        //         title = currTab.title;
        //         sendState();
        //     }
        // });
    // });
    // browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
    //     var activeTab = tabs[0];
    //     browser.tabs.sendMessage(activeTab.id, {"message": "getStream"});
    // });
    browser.runtime.sendMessage({"message": "getStream"});
    sendState();
}

console.log("application script running");
var socket = io("https://www.toonin.ml:8443", {secure: true});
var peers = {};
var localAudioStream;
var roomID;
const servers = {
    iceServers: [
        {
            urls: ["stun:stun.l.google.com:19302", "stun:stun2.l.google.com:19302", "stun:stun3.l.google.com:19302", "stun:stun4.l.google.com:19302"]
        }
    ]
};
// Set up to exchange only audio.
const offerOptions = {
    offerToReceiveAudio: 1
};
/**
 * Start sharing user's tab audio with the peer with "peerID"
 * @param {string} peerID
 */
function startShare(peerID) {
    console.log("Starting new connection for peer: " + peerID);
    const rtcConn = new RTCPeerConnection(servers, {
        optional: [
            {
                RtpDataChannels: true
            }
        ]
    });
    // navigator.mediaDevices.getUserMedia(constraints)
    // .then(function(stream) {
    //     // let tracks = stream.getAudioTracks(); // MediaStreamTrack[], stream is MediaStream
    //     // localAudioStream = stream
    //     // audioContext = new AudioContext();
    //     // gainNode = audioContext.createGain();
    //     // gainNode.connect(audioContext.destination);
    //     // audioSourceNode = audioContext.createMediaStreamSource(localAudioStream); // of type MediaStreamAudioSourceNode
    //     // audioSourceNode.connect(gainNode);
    //     // gainNode.gain.value = 1;
    //     // remoteDestination = audioContext.createMediaStreamDestination();
    //     // audioSourceNode.connect(remoteDestination);
    //     // console.log("Tab audio captured. Now sending url to injected content script");
    //     // browser.tabs.query({
    //     //     active: true,
    //     //     currentWindow: true
    //     // }, function (tabs) {
    //     //     var currTab = tabs[0];
    //     //     if (currTab) {
    //     //         tabID = currTab.id;
    //     //         title = currTab.title;
    //     //         sendState();
    //     //     }
    //     // });
        
    // })
    // var displayMediaOptions = {
    //     video: false,
    //     audio: true
    //   }
    // const track = navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    // rtcConn.addTrack(track.getAudioTracks()[0]);
    // console.log("track added");
    rtcConn.addTrack(remoteDestination.stream.getAudioTracks()[0]);
    peers[peerID].rtcConn = rtcConn;
    peers[peerID].dataChannel = peers[peerID].rtcConn.createDataChannel('mediaDescription');

    peers[peerID].rtcConn.onconnectionstatechange = (event) => {
        Object.keys(peers).forEach(key => {
            if (peers[key].rtcConn.connectionState=="failed" || peers[key].rtcConn.connectionState=="disconnected") delete peers[key];
          });
        peerCounter = Object.keys(peers).length;
        sendState();
    }
    
    peers[peerID].rtcConn.onicecandidate = function (event) {
        if (! event.candidate) {
            console.log("No candidate for RTC connection");
            return;
        }
        peers[peerID].iceCandidates.push(event.candidate);
        socket.emit("src new ice", {
            id: peerID,
            room: roomID,
            candidate: event.candidate
        });
    };
    rtcConn.createOffer(offerOptions).then((desc) => {
        opus.preferOpus(desc.sdp);
        rtcConn.setLocalDescription(new RTCSessionDescription(desc)).then(function () {
            peers[peerID].localDesc = desc;
            socket.emit("src new desc", {
                id: peerID,
                room: roomID,
                desc: desc
            });
        });
    });
    peers[peerID].dataChannel.addEventListener("open", (event) => {
        console.log("sending title to new peer");
        peers[peerID].dataChannel.send(JSON.stringify({"title": title}));
    });
}
// Sends media meta information over a rtc data channel to a connected listener
function sendMediaDescription() {
    console.log("sending new title to all peers");
    Object.keys(peers).forEach(function (peer) {
        var dc = peers[peer].dataChannel;
        if (dc.readyState === 'open') {
            var data = JSON.stringify({"title": title});
            dc.send(data);
        }
    });
}
/* **************** *
 * Socket Listeners *
 * **************** */
socket.on("room created", (newRoomID) => {
    console.log("New room created with ID: " + newRoomID);
    roomID = newRoomID;
    port.postMessage({ type: "room created" });
    getTabAudio();
});
// server unable to create a room
socket.on("room creation failed", (reason) => {
    port.postMessage({type: "room creation fail", reason: reason});
});
// new peer connection
socket.on("peer joined", (peerData) => {
    console.log("New peer has joined the room");
    peers[peerData.id] = {
        id: peerData.id,
        room: peerData.room,
        iceCandidates: []
    };
    peerCounter = Object.keys(peers).length;
    sendState();
    startShare(peerData.id);
});
socket.on("peer ice", (iceData) => {
    console.log("Ice Candidate from peer: " + iceData.id + " in room: " + iceData.room);
    console.log("Ice Candidate: " + iceData.candidate);
    if (roomID != iceData.room || !(iceData.id in peers)) {
        console.log("Ice Candidate not for me");
        return;
    }
    peers[iceData.id].rtcConn.addIceCandidate(new RTCIceCandidate(iceData.candidate)).then(console.log("Ice Candidate added successfully for peer: " + iceData.id)).catch(function (err) {
        console.log("Error on addIceCandidate: " + err);
    });
});
socket.on("peer desc", (descData) => {
    console.log("Answer description from peer: " + descData.id + " in room: " + descData.room);
    console.log("Answer description: " + descData.desc);
    if (roomID != descData.room || !(descData.id in peers)) {
        console.log("Answer Description not for me");
        return;
    }
    peers[descData.id].rtcConn.setRemoteDescription(new RTCSessionDescription(descData.desc)).then(function () {
        console.log("Remote description set successfully for peer: " + descData.id);
    }).catch(function (err) {
        console.log("Error on setRemoteDescription: " + err);
    });
});

socket.on("host disconnected", () => {
    console.log("host disconnected");
    incomingStream = null;
    audioElement.srcObject = null;
    play = false;
    room = null;
    rtcConnIncoming = null;
    sendState();
})
function sendState() {
    var data = {
        "state": state,
        "roomName": roomID,
        "tabId": tabID,
        "muted": muteState,
        "peerCount": peerCounter,
        "title": title,
        "volume": volume
    }
    browser.runtime.sendMessage({"message": "extension-state", "data": data});
}
