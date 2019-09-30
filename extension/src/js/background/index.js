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

function getTabAudio(onFinishCallback) {
    chrome.tabCapture.capture(constraints, function (stream) {
        if (!stream) {
            console.error("Error starting tab capture: " + (chrome.runtime.lastError.message || "UNKNOWN"));
            return;
        }
        let tracks = stream.getAudioTracks();
        let tabStream = new MediaStream(tracks);
        window.audio = document.createElement("audio");
        window.audio.srcObject = tabStream;
        //window.audio.play();
        localAudioStream = tabStream;
        onFinishCallback();
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
//var socket = io("http://toonin-backend-54633158.us-east-1.elb.amazonaws.com:8100");
var socket = io("http://10.0.0.82:8100");

var peers = {};
var dataChannels = [];
var localAudioStream;
var audioRecorder;
var startDataRequests = false;
var headerBlob = null;
var superBlob = null; // Blob with combined headerBlob and event.data
var headerOffset = 0;
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

function sendOffset(blob, dataChannel) {
    var context = new AudioContext();
    new Response(blob).arrayBuffer().then((buffer) => {
        context.decodeAudioData(buffer, (decodedData) => {
            // sends the offset to client to compensate for the extra audio data at the start
            // which is needed for decoding
            dataChannel.send(decodedData.duration.toString());
            headerOffset = decodedData.duration;
        });
    });
}

function refreshData() {
    if(audioRecorder && startDataRequests) {
        try {
            audioRecorder.requestData();
        }
        catch(e) {
            
        }
    }
}

// this is high rn to accumulate audio data for a single large data chunk
// because audio decoding works only for the first arrayBuffer sent to client.
// The subsequent audio buffers don't have headers, so they can't be decoded
// by the built-in AudioContext decoder for now.
setInterval(refreshData, 150); // this should be less for realtime streaming

function setupMediaRecorder() {
    var mediaRecorder = new MediaRecorder(localAudioStream, {
        audioBitsPerSecond : 128000,
        mimeType : 'audio/webm;codecs="opus"'
    });

    //mediaRecorder.start();
    audioRecorder = mediaRecorder;
}

function linkOnDataCallback() {
    audioRecorder.ondataavailable = function(event) {
        if(!headerBlob) {
            headerBlob = event.data;
            for(var i = 0; i < dataChannels.length; i++) {
                sendOffset(event.data, dataChannels[i]);
            }
        }
        else {
            // combine firstBlob and event.data to make sure every 
            // blob sent has a header needed for decoding
            superBlob = new Blob([headerBlob, event.data]);
            new Response(superBlob).arrayBuffer().then((buffer) => {
                // sends arraybuffer of audio data
                for(var i = 0; i < dataChannels.length; i++) {
                    dataChannels[i].send(buffer);
                }
            });
        }
    };
}

function startShareWithDataChannel(peerID) {

    console.log("Starting new connection for peer: " + peerID);
    const rtcConn = new RTCPeerConnection(servers);
    // add this peer to the list of peers
    peers[peerID].rtcConn = rtcConn;
    console.log(peers);

    // create RTC data channel with label "audioChannel"
    peers[peerID].dataChannel = rtcConn.createDataChannel(peerID + "-audioChannel");
    dataChannels.push(peers[peerID].dataChannel);

    // send data through the dataChannel as soon as the channel is "open"
    peers[peerID].dataChannel.addEventListener("open", (event) => {
        if(!startDataRequests) {
            linkOnDataCallback();
            audioRecorder.start();
            startDataRequests = true;
        }
        if(headerOffset !== 0) { peers[peerID].dataChannel.send(headerOffset.toString()); }
    });

    // handler for onicecandidate event
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

    // connection attempt
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

function startShare(peerID) {
    console.log("Starting new connection for peer: " + peerID);
    const rtcConn = new RTCPeerConnection(servers);
    // changed addStream to addTracks as addStream is deprecated
    localAudioStream.getTracks().forEach(function(track) {
        rtcConn.addTrack(track, localAudioStream)
    });
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
    getTabAudio(setupMediaRecorder);
});

socket.on("peer joined", (peerData) => {
    console.log("New peer has joined the room");
    peers[peerData.id] = {
        id: peerData.id,
        room: peerData.room,
        iceCandidates: []
    };
    //startShare(peerData.id);
    startShareWithDataChannel(peerData.id);
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
