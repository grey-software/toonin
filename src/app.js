import io from "socket.io-client";

const ENDPOINT = "https://toonin.ali-raza.me/";
//const ENDPOINT = "http://138.51.171.230:8100/";

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

var socket = io(ENDPOINT, {secure: true});;

var incomingStream = null;
var audioElem;
var playBtn;
var state = null;

/**
 * 
 * @param {any} vueDataRef Reference to the main vue object
 * @param {HTMLAudioElement} audioElement reference to <audio> tag on page for playback
 * @param {any} playRef <v-btn> for manual audio playback by the user, revealed when auto playback is not possible
 */
export function init(vueDataRef, audioElement, playRef) {
    playBtn = playRef;
    audioElem = audioElement;
    state = vueDataRef;
    // bind window close event to handler to notify backend of client
    // disconnection
    window.onbeforeunload = (event) => { onCloseHandler(); }
    var key = window.location.pathname;
    if(key !== '/') {
        checkstream(null, key.substr(1, key.length));
    }

    setSocketListeners = setSocketListeners.bind(this);
    createAnswer = createAnswer.bind(this);
}

// notify backend of client leaving
function onCloseHandler() { socket.emit('logoff', { from: socket.id, to: state.room }); }

/**
 * Update the program state variables with new values of the newState object.
 * If a variable in newState is not part of the program state, it is ignored.
 * 
 * @param {Object} newState object with state variables and new values that will
 *                          be updated
 */
function updateState(newState) {
    var alteredVars = Object.keys(newState);
    for(var i = 0; i < alteredVars.length; i++) {
        if(alteredVars[i] in state) {
            state[alteredVars[i]] = newState[alteredVars[i]];
        }
    }
}

export function enablePlayback() { this.$refs.audio.muted = false; }

/**
 * callback for <v-btn>.onclick for manual audio playback
 */
export function manualPlay() {
    logMessage('user played manually');
    audioElem.srcObject = incomingStream;
    audioElem.play();
    updateState({isPlaying: audioElem.srcObject.active });
}

/**
 * 
 * @param {any} msg log 'msg' to console
 */
export function logMessage(msg) { console.log(msg); }

/**
 * search for the room with 'roomID'. If room exists, connect the user.
 * else, do nothing. (In future, notify user of invalid id)
 * 
 */
export function checkstream() {

    fetch(ENDPOINT + state.room)
        .then(res => res.json())
        .then(res => checkStreamResult(res))
        .catch(err => logMessage(err));
}

/**
 * respond to the result sent by server after roomID search. if successful,
 * connect the user to the room and play audio (update state as well), else do nothing
 * 
 * @param {String} result server response for the roomID provided by the user
 */
export function checkStreamResult(result) {
    
    if (result === "SUCCESS") {
        updateState({ roomFound: true });
        logMessage("Active session with ID: " + state.room + " found!");
        socket.emit("new peer", state.room);
        setSocketListeners(socket);
        const rtcConn = new RTCPeerConnection(servers);
        console.log(rtcConn);
        rtcConn.onicecandidate = event => {
            if (!event.candidate) {
                logMessage("No candidate for RTC connection");
                return;
            }
            socket.emit("peer new ice", {
                id: socket.id,
                room: state.room,
                candidate: event.candidate
            });
        };

        rtcConn.onconnectionstatechange = function() {
            if(rtcConn.connectionState === 'connected') { updateState({ established: true }); }

            if(rtcConn.connectionState == 'disconnected' || 
            rtcConn.connectionState == 'failed') { 
                updateState({ 
                    established: false,
                    isPlaying: false
                });
            }

        }

        rtcConn.onaddstream = event => {
            logMessage("Stream added");
            logMessage(event.stream);
            audioElem.srcObject = event.stream;	
            //pause = 0;
            console.log(audioElem);
            audioElem.oncanplay = () => {
                audioElem.play().catch((err) => {
                    logMessage(err);
                });
                audioElem.onplay = () => {
                    updateState({
                        established: true,
                        isPlaying: audioElem.srcObject.active 
                    });
                }
            }
        };

        rtcConn.ontrack = (event) => {

            logMessage('track added');
            incomingStream = new MediaStream([event.track]);

            var _iOSDevice = !!navigator.platform.match(/iPhone|iPod|iPad|Macintosh|MacIntel/);
            console.log(_iOSDevice);
            if(_iOSDevice) {
                try {
                    playBtn.$refs.link.hidden = false;
                    audioElem.srcObject = incomingStream;
                    audioElem.onplay = () => {
                        updateState({
                            established: true,
                            isPlaying: audioElem.srcObject.active,
                            stream: incomingStream
                        });
                    }
                }
                catch(err) {
                    playBtn.$refs.link.hidden = false;
                }
            } else {
                try {
                    audioElem.srcObject = incomingStream;
                    audioElem.play();
                    audioElem.onplay = () => {
                        updateState({
                            established: true,
                            isPlaying: audioElem.srcObject.active,
                            stream: incomingStream
                        });
                    }
                }
                catch(err) {
                    playBtn.$refs.link.hidden = false;
                }
            }
        }
        updateState({
            rtcConn: rtcConn,
            peerID: socket.id
        });
        
    } else {
        updateState({
            room: "",
            established: false
        })
    }
}

/**
 * Initialize socket listeners necessary to establish communication 
 * betweeen backend and the web app
 * 
 * @param {io} socket socket connection to the backend
 */
export function setSocketListeners(socket) {
    socket.on("src ice", iceData => {
        logMessage(`Received new ICE Candidate from src for peer: ${iceData.id} in room: ${iceData.room}`);
        logMessage(`I have id: ${socket.id} and room: ${state.room}`);
        if (iceData.room !== state.room || iceData.id !== socket.id) {
            logMessage("ICE Candidate not for me");
            return;
        }
        state.rtcConn
            .addIceCandidate(new RTCIceCandidate(iceData.candidate))
            .then(logMessage("Ice Candidate added successfully"))
            .catch(err => logMessage(`ERROR on addIceCandidate: ${err}`));
    });

    socket.on("src desc", descData => {
        logMessage(`Received description from src for peer: ${descData.id} in room: ${descData.room}`);
        logMessage(`I have id: ${socket.id} and room: ${state.room}`);
        if (descData.room !== state.room || descData.id !== socket.id) {
            logMessage("ICE Candidate not for me");
            return;
        }
        state.rtcConn.setRemoteDescription(new RTCSessionDescription(descData.desc)).then(() => {
            logMessage("Setting remote description success");
            createAnswer(descData.desc);
        });
    });
}

/**
 * respond to the backend server with description 'desc'.
 * This is called after receiving some msg from server.
 * 
 * @param {any} desc 
 */
export function createAnswer(desc) {
    const roomID = state.room;
    state.rtcConn.createAnswer().then(desc => {
        //preferOpus(desc.sdp);
        logMessage("Answer created");
        state.rtcConn.setLocalDescription(new RTCSessionDescription(desc)).then(function () {
            logMessage("Local description from answer set");
            socket.emit("peer new desc", {
                id: socket.id,
                room: roomID,
                desc: desc
            });
        });
    });
}
