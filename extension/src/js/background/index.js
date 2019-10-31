import opus from './opus';
var remoteDestination, audioSourceNode, gainNode;

const constraints = {
    audio: true
};

// keep track of tab on which the extension is active
var tabID;
var port;
var audioTagRef;
// last mute state
var muteState = false;

var play = false;
var incomingStream = null;

var room = null;
var rtcConnIncoming = null;
var audioElement = document.createElement('audio');
    audioElement.setAttribute("preload", "auto");
    audioElement.load;
var peerCounter=0;

chrome.runtime.onConnect.addListener(function (p) {
    port = p;

    p.onMessage.addListener(function (msg) {
        if (msg.type == "init") {
            // optional parameter roomName.
            socket.emit("create room", msg.roomName);
        }
        if (msg.type == "play") {
            if(!room){
                room = msg.roomName
                console.log("Active session with ID: " + room + " found!");
                socket.emit("new peer", room);
                setSocketListeners(socket);
                rtcConnIncoming = new RTCPeerConnection(servers);
                rtcConnIncoming.onicecandidate = event => {
                    if (!event.candidate) {
                        console.log("No candidate for RTC connection");
                        return;
                    }
                    socket.emit("peer new ice", {
                        id: socket.id,
                        room: room,
                        candidate: event.candidate
                    });
                    console.log(socket.id);
                };
                rtcConnIncoming.ontrack = (event) => {
                    incomingStream = new MediaStream([event.track]);

                    try {
                        audioElement.srcObject = incomingStream;
                    }
                    catch(err) {
                        console.log(err)
                    }
                }
                audioElement.pause();
                play = false;
            }
            if(room != msg.roomName){
                console.log("changing room")
                room = msg.roomName
                socket.emit("new peer", room);
                setSocketListeners(socket);
                rtcConnIncoming = new RTCPeerConnection(servers);
                rtcConnIncoming.onicecandidate = event => {
                    if (!event.candidate) {
                        console.log("No candidate for RTC connection");
                        return;
                    }
                    socket.emit("peer new ice", {
                        id: socket.id,
                        room: room,
                        candidate: event.candidate
                    });
                };
                rtcConnIncoming.ontrack = (event) => {
                    incomingStream = new MediaStream([event.track]);

                    try {
                        audioElement.srcObject = incomingStream;
                        audioElement.play();
                        play = true;
                    }
                    catch(err) {
                        console.log(err)
                    }
                }
            }
            if(!play) {
                audioElement.play();
                play = true;
            } else {
                audioElement.pause();
                play = false;
            }
            sendState();
        }
        if(msg.type == "stopToonin"){
            stopListening();
        }
        if(msg.type == "stopSharing") {
            disconnect();
        }
        if(msg.type == "toggleMute") {
            localAudioStream.getAudioTracks()[0].enabled = Boolean(msg.value);
            muteState = !msg.value;
        }
    });
});

chrome.tabs.onRemoved.addListener(function(tabId, removed) {
    if(tabId === tabID) {
        disconnect();
    }
});

function stopListening() {
    socket.emit('logoff', { from: socket.id, to: room } );
    incomingStream = null;
    audioElement.srcObject = null;
    play = false;
    room = null;
    rtcConnIncoming = null;
    sendState();
}

function disconnect () {
    var roomCurrent = roomID;
    socket.emit("disconnect room", {room: roomCurrent});
    // stops tabCapture
    localAudioStream.getAudioTracks()[0].stop();
    capturedStream.getAudioTracks()[0].stop();
    var peerIDs = Object.keys(peers);
    for(var i = 0; i < peerIDs.length; i++) {
        peers[peerIDs[i]].rtcConn.close();
        delete peers[peerIDs[i]];
    }
    peers = {};
    localAudioStream=null;
    roomID=null;
    tabID=null;
    peerCounter = Object.keys(peers).length;
    sendState();
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if( request.message === "extension_state" ) {

        console.log("hello");
        sendState();
      }
});

function setSocketListeners(socket) {
    socket.on("room null", () => {
        console.log("invalid room");
        incomingStream = null;
        audioElement.srcObject = null;
        play = false;
        room=null;
        sendState();
    });

    socket.on("src ice", iceData => {
        if (iceData.room !== room || iceData.id !== socket.id) {
            console.log("ICE Candidate not for me");
            return;
        }
        rtcConnIncoming
            .addIceCandidate(new RTCIceCandidate(iceData.candidate))
            .then(console.log("Ice Candidate added successfully"))
            .catch(err => console.log(`ERROR on addIceCandidate: ${err}`));
    });

    socket.on("src desc", descData => {
        if (descData.room !== room || descData.id !== socket.id) {
            console.log("ICE Candidate not for me");
            return;
        }
        rtcConnIncoming.setRemoteDescription(new RTCSessionDescription(descData.desc)).then(() => {
            console.log("Setting remote description success");
            createAnswer(descData.desc);
        });
    });
}

function createAnswer(desc) {
    rtcConnIncoming.createAnswer().then(desc => {
        rtcConnIncoming.setLocalDescription(new RTCSessionDescription(desc)).then(function () {
            socket.emit("peer new desc", {
                id: socket.id,
                room: room,
                desc: desc
            });
        });
    });
}

/**
 * allow user to mute/unmute the tab on which extension is running
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    if(changeInfo.mutedInfo && tabId === tabID) {
        window.audio.muted = changeInfo.mutedInfo.muted;
    }
});

/**
 * capture user's tab audio for sharing with peers
 */
function getTabAudio() {
    chrome.tabCapture.capture(constraints, function (stream) {
        if (!stream) {
            console.error("Error starting tab capture: " + (chrome.runtime.lastError.message || "UNKNOWN"));
            return;
        }
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var currTab = tabs[0];
            if (currTab) { tabID = currTab.id; }

        });

        let tracks = stream.getAudioTracks(); // MediaStreamTrack[], stream is MediaStream
        let tabStream = new MediaStream(tracks);
        window.audio = document.createElement("audio");
        audioTagRef = window.audio; // save reference globally for volume control
        window.audio.srcObject = tabStream;
        window.audio.play();
        localAudioStream = tabStream.clone();
        capturedStream = tabStream;
        console.log("Tab audio captured. Now sending url to injected content script");
    });
}

"use strict";
console.log("application script running");

var socket = io("http://www.toonin.ml:8100");

var peers = {};
var localAudioStream;
var capturedStream;
var roomID;

const servers = {
    iceServers: [{
        urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:stun3.l.google.com:19302",
            "stun:stun4.l.google.com:19302"
        ]
    }]
};

// Set up to exchange only audio.
const offerOptions = {
    offerToReceiveAudio: 1
};

/**
 * convert captured tab stream to a streamable form
 */
function getStreamableData() {
    var audioContext = new AudioContext();
    gainNode = audioContext.createGain();
	gainNode.connect(audioContext.destination);
    audioSourceNode = audioContext.createMediaStreamSource(localAudioStream); // of type MediaStreamAudioSourceNode
    remoteDestination = audioContext.createMediaStreamDestination();
    audioSourceNode.connect(remoteDestination);
}

/**
 * Start sharing user's tab audio with the peer with "peerID"
 * @param {string} peerID
 */
function startShare(peerID) {
    console.log("Starting new connection for peer: " + peerID);
    const rtcConn = new RTCPeerConnection(servers);
    getStreamableData();

    rtcConn.addTrack(remoteDestination.stream.getAudioTracks()[0]);
    peers[peerID].rtcConn = rtcConn;
    console.log(peers);
    peers[peerID].rtcConn.onicecandidate = function (event) {
        if (!event.candidate) {
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
}

/* **************** *
 * Socket Listeners *
 * **************** */
socket.on("room created", (newRoomID) => {
    console.log("New room created with ID: " + newRoomID);
    roomID = newRoomID;
    sendState();
    getTabAudio();
});

// server unable to create a room
socket.on("room creation failed", (reason) => {
    port.postMessage({
        type: "room creation fail",
        reason: reason
    });
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
    peers[iceData.id].rtcConn
        .addIceCandidate(new RTCIceCandidate(iceData.candidate))
        .then(console.log("Ice Candidate added successfully for peer: " + iceData.id))
        .catch(function (err) {
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
    peers[descData.id].rtcConn
        .setRemoteDescription(new RTCSessionDescription(descData.desc))
        .then(function () {
            console.log("Remote description set successfully for peer: " + descData.id);
        })
        .catch(function (err) {
            console.log("Error on setRemoteDescription: " + err);
        });
});

socket.on("peer disconnected", (peerData) => {
    console.log("peer disconnected");
    try {
        peers[peerData.id].rtcConn.removeTrack(remoteDestination.stream.getAudioTracks()[0]);
    } catch (err) {
        console.log(err)
    }
    peers[peerData.id].rtcConn = undefined;
    delete peers[peerData.id];
    peerCounter = Object.keys(peers).length;
    sendState();
})

socket.on("host disconnected", () => {
    console.log("host disconnected");
    incomingStream = null;
    audioElement.srcObject = null;
    play = false;
    room=null;
    rtcConnIncoming = null;
    sendState();
})

function sendState() {
    var data = {
        "roomID": roomID,
        "tabID" : tabID,
        "playing" : play,
        "room" : room,
        "muted": muteState,
        "peerCounter": peerCounter
    }
    chrome.runtime.sendMessage({"message": "extension_state_from_background", "data": data});
}
