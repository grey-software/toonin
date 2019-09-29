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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/js/inject/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/js/inject/index.js":
/*!********************************!*\
  !*** ./src/js/inject/index.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _toonin_box = __webpack_require__(/*! ./toonin_box */ \"./src/js/inject/toonin_box.js\");\n\nvar port = chrome.runtime.connect({\n    name: \"toonin-extension\"\n});\n\nvar div = document.createElement('div');\ndiv.id = \"tooninBox\";\ndiv.style.display = \"inline-block\";\ndiv.style.position = \"absolute\";\ndiv.style.top = '30px';\ndiv.style.right = '30px';\ndiv.style.zIndex = '10000';\ndiv.innerHTML = _toonin_box.html;\ndocument.body.appendChild(div);\n\nvar dragElement = function dragElement(elmnt) {\n    console.log(\"its being called\");\n    var pos1 = 0,\n        pos2 = 0,\n        pos3 = 0,\n        pos4 = 0;\n    elmnt.onmousedown = dragMouseDown;\n\n    function dragMouseDown(e) {\n        e = e || window.event;\n        // get the mouse cursor position at startup:\n        pos3 = e.clientX;\n        pos4 = e.clientY;\n        document.onmouseup = closeDragElement;\n        // call a function whenever the cursor moves:\n        document.onmousemove = elementDrag;\n    }\n\n    function elementDrag(e) {\n        e = e || window.event;\n        // calculate the new cursor position:\n        pos1 = pos3 - e.clientX;\n        pos2 = pos4 - e.clientY;\n        pos3 = e.clientX;\n        pos4 = e.clientY;\n        // set the element's new position:\n        elmnt.style.top = elmnt.offsetTop - pos2 + \"px\";\n        elmnt.style.left = elmnt.offsetLeft - pos1 + \"px\";\n    }\n\n    function closeDragElement() {\n        /* stop moving when mouse button is released:*/\n        document.onmouseup = null;\n        document.onmousemove = null;\n    }\n};\n\ndragElement(document.getElementById(\"tooninBox\"));\n\nvar shareButton = document.getElementById(\"btnShare\");\nvar sessionIDText = document.getElementById(\"roomID\");\n\nshareButton.onclick = function () {\n    port.postMessage({\n        type: \"init\"\n    });\n};\n\nport.onMessage.addListener(function (msg) {\n    console.log(msg);\n    if (msg.type == \"audio\") {\n        if (msg.status == \"ok\") localAudio.src = msg.url;\n    } else if (msg.type == \"roomID\") {\n        sessionIDText.innerHTML = \"Your Toonin ID is: \\n\" + msg.roomID;\n        sessionIDText.style.visibility = \"visible\";\n    }\n});\n\n//# sourceURL=webpack:///./src/js/inject/index.js?");

/***/ }),

/***/ "./src/js/inject/toonin_box.js":
/*!*************************************!*\
  !*** ./src/js/inject/toonin_box.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = { html: '<div>    <link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/icon?family=Material+Icons\">    <link rel=\"stylesheet\" href=\"https://code.getmdl.io/1.3.0/material.blue-light_blue.min.css\" />    <script defer src=\"https://code.getmdl.io/1.3.0/material.min.js\"></script>    <link rel=\"stylesheet\" href=\"https://use.fontawesome.com/releases/v5.0.12/css/all.css\" integrity=\"sha384-G0fIWCsCzJIMAVNQPfjH08cyYaUtMwjJwqiRKxxE/rx96Uroj1BtIQ6MLJuheaO9\"        crossorigin=\"anonymous\">    <link rel=\"stylesheet\" href=\"https://www.w3schools.com/w3css/4/w3.css\">    <!-- Square card -->    <style>        .demo-card-square.mdl-card {            width: 320px;            height: 320px;        }        .demo-card-square>.mdl-card__title {            background: url(\"https://image.ibb.co/fRYLty/bg.png\") center / cover;            color: #66B7DA;        }        .ic-share {            margin-right: 4px;        }        .room-id-text {            visibility: hidden;            margin: 0%;        }        .spinner {            font-size: 50px;            font-family: sans-serif;            color: palevioletred;            margin: 0%;            animation-play-state: paused;        }    </style>    <div class=\"demo-card-square mdl-card mdl-shadow--2dp\">        <div class=\"mdl-card__title mdl-card--expand\">            <h2 class=\"mdl-card__title-text\">Toonin            </h2>        </div>        <div class=\"mdl-card__actions mdl-card--border\">            <a class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\" id=\"btnShare\">                <i class=\"fas fa-music ic-share\"></i>                Start Sharing            </a>            <p class=\"mdl-card__supporting-text room-id-text\" id=\"roomID\">            </p>        </div>    </div></div>' };\n\n//# sourceURL=webpack:///./src/js/inject/toonin_box.js?");

/***/ })

/******/ });