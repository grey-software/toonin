console.log("Script finally running")
var html = '<div> <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"> <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.blue-light_blue.min.css"/> <script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script> <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.12/css/all.css" integrity="sha384-G0fIWCsCzJIMAVNQPfjH08cyYaUtMwjJwqiRKxxE/rx96Uroj1BtIQ6MLJuheaO9" crossorigin="anonymous"> <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"> <style>.demo-card-square.mdl-card{width: 320px; height: 320px;}.demo-card-square>.mdl-card__title{background: url("https://image.ibb.co/fRYLty/bg.png") center / cover; color: #66B7DA;}.ic-share{margin-right: 4px;}.room-id-text{visibility: hidden; margin: 0%;}.spinner{font-size: 50px; font-family: sans-serif; color: palevioletred; margin: 0%; animation-play-state: paused;}</style> <div class="demo-card-square mdl-card mdl-shadow--2dp"> <div class="mdl-card__title mdl-card--expand"> <h2 class="mdl-card__title-text">Toonin </h2> </div><div class="mdl-card__actions mdl-card--border"> <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" id="btnShare"> <i class="fas fa-music ic-share"></i> Start Sharing </a> <p class="mdl-card__supporting-text room-id-text" id="roomID"> </p></div></div></div>';
var port = chrome.runtime.connect({
    name: "toonin-extension"
});
console.log(port);


var div = document.createElement('div');
div.id = "tooninBox";
div.style.display = "inline-block";
div.style.position = "absolute";
div.style.top = '30px';
div.style.right = '30px';
div.style.zIndex = '10000';
div.innerHTML = html;
document.body.appendChild(div);

function dragElement(elmnt) {
    console.log("its being called");
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

dragElement(document.getElementById(("tooninBox")));

const shareButton = document.getElementById("btnShare");
const sessionIDText = document.getElementById("roomID");

shareButton.onclick = initialize;

function initialize() {
    port.postMessage({
        type: "init"
    });
}

port.onMessage.addListener(function (msg) {
    console.log(msg);
    if (msg.type == "audio") {
        if (msg.status == "ok") localAudio.src = msg.url;
    } else if (msg.type == "roomID") {
        sessionIDText.innerHTML = "Your Toonin ID is: \n" + msg.roomID;
        sessionIDText.style.visibility = "visible";
    }
});