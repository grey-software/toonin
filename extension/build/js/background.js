/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/js/background/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/js/background/index.js":
/*!************************************!*\
  !*** ./src/js/background/index.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _opus = __webpack_require__(/*! ./opus */ \"./src/js/background/opus.js\");\n\nvar _opus2 = _interopRequireDefault(_opus);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nvar remoteDestination, audioSourceNode, gainNode;\n\nvar constraints = {\n    audio: true\n};\n\n// keep track of tab on which the extension is active\nvar tabID;\nvar port;\nvar audioTagRef;\n// last mute state\nvar muteState = false;\n\nvar play = false;\nvar incomingStream = null;\n\nvar room = null;\nvar rtcConnIncoming = null;\nvar audioElement = document.createElement('audio');\naudioElement.setAttribute(\"preload\", \"auto\");\naudioElement.load;\nvar peerCounter = 0;\n\nchrome.runtime.onConnect.addListener(function (p) {\n    port = p;\n\n    p.onMessage.addListener(function (msg) {\n        if (msg.type == \"init\") {\n            // optional parameter roomName.\n            socket.emit(\"create room\", msg.roomName);\n        }\n        if (msg.type == \"play\") {\n            if (!room) {\n                room = msg.roomName;\n                console.log(\"Active session with ID: \" + room + \" found!\");\n                socket.emit(\"new peer\", room);\n                setSocketListeners(socket);\n                rtcConnIncoming = new RTCPeerConnection(servers);\n                rtcConnIncoming.onicecandidate = function (event) {\n                    if (!event.candidate) {\n                        console.log(\"No candidate for RTC connection\");\n                        return;\n                    }\n                    socket.emit(\"peer new ice\", {\n                        id: socket.id,\n                        room: room,\n                        candidate: event.candidate\n                    });\n                    console.log(socket.id);\n                };\n                rtcConnIncoming.ontrack = function (event) {\n                    incomingStream = new MediaStream([event.track]);\n\n                    try {\n                        audioElement.srcObject = incomingStream;\n                    } catch (err) {\n                        console.log(err);\n                    }\n                };\n                audioElement.pause();\n                play = false;\n            }\n            if (room != msg.roomName) {\n                console.log(\"changing room\");\n                room = msg.roomName;\n                socket.emit(\"new peer\", room);\n                setSocketListeners(socket);\n                rtcConnIncoming = new RTCPeerConnection(servers);\n                rtcConnIncoming.onicecandidate = function (event) {\n                    if (!event.candidate) {\n                        console.log(\"No candidate for RTC connection\");\n                        return;\n                    }\n                    socket.emit(\"peer new ice\", {\n                        id: socket.id,\n                        room: room,\n                        candidate: event.candidate\n                    });\n                };\n                rtcConnIncoming.ontrack = function (event) {\n                    incomingStream = new MediaStream([event.track]);\n\n                    try {\n                        audioElement.srcObject = incomingStream;\n                        audioElement.play();\n                        play = true;\n                    } catch (err) {\n                        console.log(err);\n                    }\n                };\n            }\n            if (!play) {\n                audioElement.play();\n                play = true;\n            } else {\n                audioElement.pause();\n                play = false;\n            }\n            sendState();\n        }\n        if (msg.type == \"stopToonin\") {\n            stopListening();\n        }\n        if (msg.type == \"stopSharing\") {\n            disconnect();\n        }\n        if (msg.type == \"toggleMute\") {\n            localAudioStream.getAudioTracks()[0].enabled = Boolean(msg.value);\n            muteState = !msg.value;\n        }\n    });\n});\n\nchrome.tabs.onRemoved.addListener(function (tabId, removed) {\n    if (tabId === tabID) {\n        disconnect();\n    }\n});\n\nfunction stopListening() {\n    socket.emit('logoff', { from: socket.id, to: room });\n    incomingStream = null;\n    audioElement.srcObject = null;\n    play = false;\n    room = null;\n    rtcConnIncoming = null;\n    sendState();\n}\n\nfunction disconnect() {\n    var roomCurrent = roomID;\n    socket.emit(\"disconnect room\", { room: roomCurrent });\n    // stops tabCapture\n    localAudioStream.getAudioTracks()[0].stop();\n    capturedStream.getAudioTracks()[0].stop();\n    var peerIDs = Object.keys(peers);\n    for (var i = 0; i < peerIDs.length; i++) {\n        peers[peerIDs[i]].rtcConn.close();\n        delete peers[peerIDs[i]];\n    }\n    peers = {};\n    localAudioStream = null;\n    roomID = null;\n    tabID = null;\n    peerCounter = Object.keys(peers).length;\n    sendState();\n}\n\nchrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {\n    if (request.message === \"extension_state\") {\n        sendState();\n    }\n});\n\nfunction setSocketListeners(socket) {\n    socket.on(\"room null\", function () {\n        console.log(\"invalid room\");\n        incomingStream = null;\n        audioElement.srcObject = null;\n        play = false;\n        room = null;\n        sendState();\n    });\n\n    socket.on(\"src ice\", function (iceData) {\n        if (iceData.room !== room || iceData.id !== socket.id) {\n            console.log(\"ICE Candidate not for me\");\n            return;\n        }\n        rtcConnIncoming.addIceCandidate(new RTCIceCandidate(iceData.candidate)).then(console.log(\"Ice Candidate added successfully\")).catch(function (err) {\n            return console.log('ERROR on addIceCandidate: ' + err);\n        });\n    });\n\n    socket.on(\"src desc\", function (descData) {\n        if (descData.room !== room || descData.id !== socket.id) {\n            console.log(\"ICE Candidate not for me\");\n            return;\n        }\n        rtcConnIncoming.setRemoteDescription(new RTCSessionDescription(descData.desc)).then(function () {\n            console.log(\"Setting remote description success\");\n            createAnswer(descData.desc);\n        });\n    });\n}\n\nfunction createAnswer(desc) {\n    rtcConnIncoming.createAnswer().then(function (desc) {\n        rtcConnIncoming.setLocalDescription(new RTCSessionDescription(desc)).then(function () {\n            socket.emit(\"peer new desc\", {\n                id: socket.id,\n                room: room,\n                desc: desc\n            });\n        });\n    });\n}\n\n/**\n * allow user to mute/unmute the tab on which extension is running\n */\nchrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {\n    if (changeInfo.mutedInfo && tabId === tabID) {\n        window.audio.muted = changeInfo.mutedInfo.muted;\n    }\n});\n\n/**\n * capture user's tab audio for sharing with peers\n */\nfunction getTabAudio() {\n    chrome.tabCapture.capture(constraints, function (stream) {\n        if (!stream) {\n            console.error(\"Error starting tab capture: \" + (chrome.runtime.lastError.message || \"UNKNOWN\"));\n            return;\n        }\n        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {\n            var currTab = tabs[0];\n            if (currTab) {\n                tabID = currTab.id;\n            }\n        });\n\n        var tracks = stream.getAudioTracks(); // MediaStreamTrack[], stream is MediaStream\n        var tabStream = new MediaStream(tracks);\n        window.audio = document.createElement(\"audio\");\n        audioTagRef = window.audio; // save reference globally for volume control\n        window.audio.srcObject = tabStream;\n        window.audio.play();\n        localAudioStream = tabStream.clone();\n        capturedStream = tabStream;\n        console.log(\"Tab audio captured. Now sending url to injected content script\");\n    });\n}\n\n\"use strict\";\nconsole.log(\"application script running\");\n\nvar socket = io(\"http://www.toonin.ml:8100\");\n\nvar peers = {};\nvar localAudioStream;\nvar capturedStream;\nvar roomID;\n\nvar servers = {\n    iceServers: [{\n        urls: [\"stun:stun.l.google.com:19302\", \"stun:stun2.l.google.com:19302\", \"stun:stun3.l.google.com:19302\", \"stun:stun4.l.google.com:19302\"]\n    }]\n};\n\n// Set up to exchange only audio.\nvar offerOptions = {\n    offerToReceiveAudio: 1\n};\n\n/**\n * convert captured tab stream to a streamable form\n */\nfunction getStreamableData() {\n    var audioContext = new AudioContext();\n    gainNode = audioContext.createGain();\n    gainNode.connect(audioContext.destination);\n    audioSourceNode = audioContext.createMediaStreamSource(localAudioStream); // of type MediaStreamAudioSourceNode\n    remoteDestination = audioContext.createMediaStreamDestination();\n    audioSourceNode.connect(remoteDestination);\n}\n\n/**\n * Start sharing user's tab audio with the peer with \"peerID\"\n * @param {string} peerID \n */\nfunction startShare(peerID) {\n    console.log(\"Starting new connection for peer: \" + peerID);\n    var rtcConn = new RTCPeerConnection(servers);\n    getStreamableData();\n\n    rtcConn.addTrack(remoteDestination.stream.getAudioTracks()[0]);\n    peers[peerID].rtcConn = rtcConn;\n    console.log(peers);\n    peers[peerID].rtcConn.onicecandidate = function (event) {\n        if (!event.candidate) {\n            console.log(\"No candidate for RTC connection\");\n            return;\n        }\n        peers[peerID].iceCandidates.push(event.candidate);\n        socket.emit(\"src new ice\", {\n            id: peerID,\n            room: roomID,\n            candidate: event.candidate\n        });\n    };\n\n    rtcConn.createOffer(offerOptions).then(function (desc) {\n        _opus2.default.preferOpus(desc.sdp);\n        rtcConn.setLocalDescription(new RTCSessionDescription(desc)).then(function () {\n            peers[peerID].localDesc = desc;\n            socket.emit(\"src new desc\", {\n                id: peerID,\n                room: roomID,\n                desc: desc\n            });\n        });\n    });\n}\n\n/* **************** *\n * Socket Listeners *\n * **************** */\nsocket.on(\"room created\", function (newRoomID) {\n    console.log(\"New room created with ID: \" + newRoomID);\n    roomID = newRoomID;\n    sendState();\n    getTabAudio();\n});\n\n// server unable to create a room\nsocket.on(\"room creation failed\", function (reason) {\n    port.postMessage({\n        type: \"room creation fail\",\n        reason: reason\n    });\n});\n\n// new peer connection\nsocket.on(\"peer joined\", function (peerData) {\n    console.log(\"New peer has joined the room\");\n    peers[peerData.id] = {\n        id: peerData.id,\n        room: peerData.room,\n        iceCandidates: []\n    };\n    peerCounter = Object.keys(peers).length;\n    sendState();\n    startShare(peerData.id);\n});\n\nsocket.on(\"peer ice\", function (iceData) {\n    console.log(\"Ice Candidate from peer: \" + iceData.id + \" in room: \" + iceData.room);\n    console.log(\"Ice Candidate: \" + iceData.candidate);\n    if (roomID != iceData.room || !(iceData.id in peers)) {\n        console.log(\"Ice Candidate not for me\");\n        return;\n    }\n    peers[iceData.id].rtcConn.addIceCandidate(new RTCIceCandidate(iceData.candidate)).then(console.log(\"Ice Candidate added successfully for peer: \" + iceData.id)).catch(function (err) {\n        console.log(\"Error on addIceCandidate: \" + err);\n    });\n});\n\nsocket.on(\"peer desc\", function (descData) {\n    console.log(\"Answer description from peer: \" + descData.id + \" in room: \" + descData.room);\n    console.log(\"Answer description: \" + descData.desc);\n    if (roomID != descData.room || !(descData.id in peers)) {\n        console.log(\"Answer Description not for me\");\n        return;\n    }\n    peers[descData.id].rtcConn.setRemoteDescription(new RTCSessionDescription(descData.desc)).then(function () {\n        console.log(\"Remote description set successfully for peer: \" + descData.id);\n    }).catch(function (err) {\n        console.log(\"Error on setRemoteDescription: \" + err);\n    });\n});\n\nsocket.on(\"peer disconnected\", function (peerData) {\n    console.log(\"peer disconnected\");\n    try {\n        peers[peerData.id].rtcConn.removeTrack(remoteDestination.stream.getAudioTracks()[0]);\n    } catch (err) {\n        console.log(err);\n    }\n    peers[peerData.id].rtcConn = undefined;\n    delete peers[peerData.id];\n    peerCounter = Object.keys(peers).length;\n    sendState();\n});\n\nsocket.on(\"host disconnected\", function () {\n    console.log(\"host disconnected\");\n    incomingStream = null;\n    audioElement.srcObject = null;\n    play = false;\n    room = null;\n    rtcConnIncoming = null;\n    sendState();\n});\n\nfunction sendState() {\n    var data = {\n        \"roomID\": roomID,\n        \"tabID\": tabID,\n        \"playing\": play,\n        \"room\": room,\n        \"muted\": muteState,\n        \"peerCounter\": peerCounter\n    };\n    chrome.runtime.sendMessage({ \"message\": \"extension_state_from_background\", \"data\": data });\n}\n\n//# sourceURL=webpack:///./src/js/background/index.js?");

/***/ }),

/***/ "./src/js/background/opus.js":
/*!***********************************!*\
  !*** ./src/js/background/opus.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar preferOpus = function preferOpus(sdp) {\n    var sdpLines = sdp.split('\\r\\n');\n\n    for (var i = 0; i < sdpLines.length; i++) {\n        if (sdpLines[i].search('m=audio') !== -1) {\n            var mLineIndex = i;\n            break;\n        }\n    }\n\n    if (mLineIndex === null) return sdp;\n\n    for (i = 0; i < sdpLines.length; i++) {\n        if (sdpLines[i].search('opus/48000') !== -1) {\n            var opusPayload = extractSdp(sdpLines[i], /:(\\d+) opus\\/48000/i);\n            if (opusPayload) sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);\n            break;\n        }\n    }\n\n    sdpLines = removeCN(sdpLines, mLineIndex);\n\n    sdp = sdpLines.join('\\r\\n');\n    return sdp;\n};\n\nvar extractSdp = function extractSdp(sdpLine, pattern) {\n    var result = sdpLine.match(pattern);\n    return result && result.length == 2 ? result[1] : null;\n};\n\nvar setDefaultCodec = function setDefaultCodec(mLine, payload) {\n    var elements = mLine.split(' ');\n    var newLine = new Array();\n    var index = 0;\n    for (var i = 0; i < elements.length; i++) {\n        if (index === 3) newLine[index++] = payload;\n        if (elements[i] !== payload) newLine[index++] = elements[i];\n    }\n    return newLine.join(' ');\n};\n\nvar removeCN = function removeCN(sdpLines, mLineIndex) {\n    var mLineElements = sdpLines[mLineIndex].split(' ');\n    for (var i = sdpLines.length - 1; i >= 0; i--) {\n        var payload = extractSdp(sdpLines[i], /a=rtpmap:(\\d+) CN\\/\\d+/i);\n        if (payload) {\n            var cnPos = mLineElements.indexOf(payload);\n            if (cnPos !== -1) mLineElements.splice(cnPos, 1);\n            sdpLines.splice(i, 1);\n        }\n    }\n    sdpLines[mLineIndex] = mLineElements.join(' ');\n    return sdpLines;\n};\n\nmodule.exports = {\n    preferOpus: preferOpus\n};\n\n//# sourceURL=webpack:///./src/js/background/opus.js?");

/***/ })

/******/ });