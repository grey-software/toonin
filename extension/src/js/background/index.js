import opus from './opus';

const constraints = {
    audio: true
};
var port;

chrome.runtime.onConnect.addListener(function (p) {
    port = p;
    p.onMessage.addListener(function (msg) {
        if (msg.type == "init") {
            socket.emit("create room");
        }
    });
});

function getTabAudio() {
    chrome.tabCapture.capture(constraints, function (stream) {
        if (!stream) {
            console.error("Error starting tab capture: " + (chrome.runtime.lastError.message || "UNKNOWN"));
            return;
        }
        let tracks = stream.getAudioTracks();
        let tabStream = new MediaStream(tracks);
        window.audio = document.createElement("audio");
        window.audio.srcObject = tabStream;
        window.audio.play();
        localAudioStream = tabStream;
        console.log("Tab audio captured. Now sending url to injected content script");
    });
}

chrome.browserAction.onClicked.addListener(injectTooninScripts);

function injectTooninScripts() {
    console.log("Starting Toonin Script Injection");
    loadAdapter(); // load webRTC adapter
}

function loadAdapter() {
    chrome.tabs.executeScript({
        file: "js/lib/adapter.js"
    }, loadSocketIO)
}

function loadSocketIO() {
    chrome.tabs.executeScript({
        file: "js/lib/socket.io.js"
    }, injectAppScript)
}

function injectAppScript() {
    chrome.tabs.executeScript({
        file: "js/inject.js"
    }, function () {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
        } else console.log("All scripts successfully loaded");
    });
}

"use strict";
console.log("application script running");
<<<<<<< HEAD
var socket = io("http://184.73.84.126:8100");
=======
var socket = io("http://toonin-backend-54633158.us-east-1.elb.amazonaws.com:8100");
>>>>>>> 05ee32106a5ba7afdab8346e440099bff7f588f1

var peers = {};
var localAudioStream;
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


function startShare(peerID) {
    console.log("Starting new connection for peer: " + peerID);
    const rtcConn = new RTCPeerConnection(servers);
    rtcConn.addStream(localAudioStream);
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
    port.postMessage({
        type: "roomID",
        roomID: newRoomID
    });
    getTabAudio();
});

socket.on("peer joined", (peerData) => {
    console.log("New peer has joined the room");
    peers[peerData.id] = {
        id: peerData.id,
        room: peerData.room,
        iceCandidates: []
    };
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
