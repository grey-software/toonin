!function(e){var n={};function t(o){if(n[o])return n[o].exports;var i=n[o]={i:o,l:!1,exports:{}};return e[o].call(i.exports,i,i.exports,t),i.l=!0,i.exports}t.m=e,t.c=n,t.d=function(e,n,o){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:o})},t.r=function(e){Object.defineProperty(e,"__esModule",{value:!0})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=1)}([function(e,n,t){"use strict";e.exports={html:'<div>\n<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">\n<link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.blue-light_blue.min.css" />\n<script defer src="https://code.getmdl.io/1.3.0/material.min.js"><\/script>\n<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.12/css/all.css" integrity="sha384-G0fIWCsCzJIMAVNQPfjH08cyYaUtMwjJwqiRKxxE/rx96Uroj1BtIQ6MLJuheaO9"\n    crossorigin="anonymous">\n<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">\n\n\x3c!-- Square card --\x3e\n<style>\n    .demo-card-square.mdl-card {\n        width: 320px;\n        height: 320px;\n    }\n\n    .demo-card-square>.mdl-card__title {\n        background: url("https://image.ibb.co/fRYLty/bg.png") center / cover;\n        color: #66B7DA;\n    }\n\n    .ic-share {\n        margin-right: 4px;\n    }\n\n    .room-id-text {\n        visibility: hidden;\n        margin: 0%;\n    }\n\n    .spinner {\n        font-size: 50px;\n        font-family: sans-serif;\n        color: palevioletred;\n        margin: 0%;\n        animation-play-state: paused;\n    }\n</style>\n\n<div class="demo-card-square mdl-card mdl-shadow--2dp">\n    <div class="mdl-card__title mdl-card--expand">\n        <h2 class="mdl-card__title-text">Toonin\n\n        </h2>\n\n    </div>\n    <div class="mdl-card__actions mdl-card--border" style="height: 40%;">\n        <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" id="btnShare">\n            <i class="fas fa-music ic-share"></i>\n            Start Sharing\n        </a>\n        <br>\n        <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" style="margin-top: 2%;">\n            Room Name <input type="text" id="roomNameInput" style="height: 80%; margin-left: 8px; padding: 4px;">\n        </a>\n        <p class="mdl-card__supporting-text room-id-text" id="roomID">\n        </p>\n    </div>\n\n</div>\n</div>'}},function(e,n,t){"use strict";var o=t(0),i=chrome.runtime.connect({name:"toonin-extension"}),s=document.createElement("div");s.id="tooninBox",s.style.display="none",s.style.position="absolute",s.style.top="30px",s.style.right="30px",s.style.zIndex="10000",s.innerHTML=o.html,document.body.appendChild(s);!function(e){console.log("its being called");var n=0,t=0,o=0,i=0;function s(s){s=s||window.event,n=o-s.clientX,t=i-s.clientY,o=s.clientX,i=s.clientY,e.style.top=e.offsetTop-t+"px",e.style.left=e.offsetLeft-n+"px"}function l(){document.onmouseup=null,document.onmousemove=null}e.onmousedown=function(e){e=e||window.event,o=e.clientX,i=e.clientY,document.onmouseup=l,document.onmousemove=s}}(document.getElementById("tooninBox"));var l=document.getElementById("btnShare"),r=document.getElementById("roomID"),a=document.getElementById("roomNameInput"),c=document.getElementById("play-it"),d=document.getElementById("roomid1");l.onclick=function(){var e=a.value;i.postMessage({type:"init",roomName:e}),a.disabled=!0},i.onMessage.addListener(function(e){console.log(e),"audio"==e.type?"ok"==e.status&&(localAudio.src=e.url):"roomID"==e.type?(r.innerHTML="Your Toonin ID is: \n"+e.roomID,r.style.visibility="visible"):"room creation fail"===e.type&&(r.innerHTML="Room Creation Failed: \n"+e.reason,r.style.visibility="visible",a.disabled=!1)}),chrome.runtime.onMessage.addListener(function(e,n,t){"clicked_browser_action"===e.message&&(console.log("clicked the button"),"none"===s.style.display?s.style.display="block":s.style.display="none")}),c.onclick=function(){i.postMessage({type:"play",msg:d.value})}}]);