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
eval("\n\nvar _opus = __webpack_require__(/*! ./opus */ \"./src/js/background/opus.js\");\n\nvar _opus2 = _interopRequireDefault(_opus);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nvar constraints = {\n    audio: true\n};\nvar port;\n\nchrome.runtime.onConnect.addListener(function (p) {\n    port = p;\n    p.onMessage.addListener(function (msg) {\n        if (msg.type == \"init\") {\n            socket.emit(\"create room\");\n        }\n    });\n});\n\nfunction getTabAudio() {\n    chrome.tabCapture.capture(constraints, function (stream) {\n        if (!stream) {\n            console.error(\"Error starting tab capture: \" + (chrome.runtime.lastError.message || \"UNKNOWN\"));\n            return;\n        }\n        var tracks = stream.getAudioTracks();\n        var tabStream = new MediaStream(tracks);\n        window.audio = document.createElement(\"audio\");\n        window.audio.srcObject = tabStream;\n        window.audio.play();\n        localAudioStream = tabStream;\n        console.log(\"Tab audio captured. Now sending url to injected content script\");\n    });\n}\n\nchrome.browserAction.onClicked.addListener(injectTooninScripts);\n\nfunction injectTooninScripts() {\n    console.log(\"Starting Toonin Script Injection\");\n    loadAdapter(); // load webRTC adapter\n}\n\nfunction loadAdapter() {\n    chrome.tabs.executeScript({\n        file: \"js/lib/adapter.js\"\n    }, loadSocketIO);\n}\n\nfunction loadSocketIO() {\n    chrome.tabs.executeScript({\n        file: \"js/lib/socket.io.js\"\n    }, injectAppScript);\n}\n\nfunction injectAppScript() {\n    chrome.tabs.executeScript({\n        file: \"js/inject.js\"\n    }, function () {\n        if (chrome.runtime.lastError) {\n            console.error(chrome.runtime.lastError.message);\n        } else console.log(\"All scripts successfully loaded\");\n    });\n}\n\n\"use strict\";\nconsole.log(\"application script running\");\nvar socket = io(\"http://toonin-backend-54633158.us-east-1.elb.amazonaws.com:8100\");\n\nvar peers = {};\nvar localAudioStream;\nvar roomID;\n\nvar servers = {\n    iceServers: [{\n        urls: [\"stun:stun.l.google.com:19302\", \"stun:stun2.l.google.com:19302\", \"stun:stun3.l.google.com:19302\", \"stun:stun4.l.google.com:19302\"]\n    }]\n};\n\n// Set up to exchange only audio.\nvar offerOptions = {\n    offerToReceiveAudio: 1\n};\n\nfunction startShare(peerID) {\n    console.log(\"Starting new connection for peer: \" + peerID);\n    var rtcConn = new RTCPeerConnection(servers);\n    rtcConn.addStream(localAudioStream);\n    peers[peerID].rtcConn = rtcConn;\n    console.log(peers);\n    peers[peerID].rtcConn.onicecandidate = function (event) {\n        if (!event.candidate) {\n            console.log(\"No candidate for RTC connection\");\n            return;\n        }\n        peers[peerID].iceCandidates.push(event.candidate);\n        socket.emit(\"src new ice\", {\n            id: peerID,\n            room: roomID,\n            candidate: event.candidate\n        });\n    };\n\n    rtcConn.createOffer(offerOptions).then(function (desc) {\n        _opus2.default.preferOpus(desc.sdp);\n        rtcConn.setLocalDescription(new RTCSessionDescription(desc)).then(function () {\n            peers[peerID].localDesc = desc;\n            socket.emit(\"src new desc\", {\n                id: peerID,\n                room: roomID,\n                desc: desc\n            });\n        });\n    });\n}\n\n/* **************** *\n * Socket Listeners *\n * **************** */\nsocket.on(\"room created\", function (newRoomID) {\n    console.log(\"New room created with ID: \" + newRoomID);\n    roomID = newRoomID;\n    port.postMessage({\n        type: \"roomID\",\n        roomID: newRoomID\n    });\n    getTabAudio();\n});\n\nsocket.on(\"peer joined\", function (peerData) {\n    console.log(\"New peer has joined the room\");\n    peers[peerData.id] = {\n        id: peerData.id,\n        room: peerData.room,\n        iceCandidates: []\n    };\n    startShare(peerData.id);\n});\n\nsocket.on(\"peer ice\", function (iceData) {\n    console.log(\"Ice Candidate from peer: \" + iceData.id + \" in room: \" + iceData.room);\n    console.log(\"Ice Candidate: \" + iceData.candidate);\n    if (roomID != iceData.room || !(iceData.id in peers)) {\n        console.log(\"Ice Candidate not for me\");\n        return;\n    }\n    peers[iceData.id].rtcConn.addIceCandidate(new RTCIceCandidate(iceData.candidate)).then(console.log(\"Ice Candidate added successfully for peer: \" + iceData.id)).catch(function (err) {\n        console.log(\"Error on addIceCandidate: \" + err);\n    });\n});\n\nsocket.on(\"peer desc\", function (descData) {\n    console.log(\"Answer description from peer: \" + descData.id + \" in room: \" + descData.room);\n    console.log(\"Answer description: \" + descData.desc);\n    if (roomID != descData.room || !(descData.id in peers)) {\n        console.log(\"Answer Description not for me\");\n        return;\n    }\n    peers[descData.id].rtcConn.setRemoteDescription(new RTCSessionDescription(descData.desc)).then(function () {\n        console.log(\"Remote description set successfully for peer: \" + descData.id);\n    }).catch(function (err) {\n        console.log(\"Error on setRemoteDescription: \" + err);\n    });\n});\n\n//# sourceURL=webpack:///./src/js/background/index.js?");

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
