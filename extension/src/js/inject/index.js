import {
    html
} from "./toonin_box";

const port = chrome.runtime.connect({
    name: "toonin-extension"
});

var div = document.createElement('div');
div.id = "tooninBox";
div.style.display = "none";
div.style.position = "absolute";
div.style.top = '30px';
div.style.right = '30px';
div.style.zIndex = '10000';
div.innerHTML = html;
document.body.appendChild(div);
var roomID;

const dragElement= (elmnt) => {
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

const copyButton = document.getElementById("btnCopy");
const roomNameInput = document.getElementById("roomNameInput");

copyButton.disabled = true;
const playButton = document.getElementById("playRoom");
const roomNameToonin = document.getElementById("tooninToRoom");
const stopToonin = document.getElementById("stopToonin");

function toggleMute(newVolume) {
    port.postMessage({ type: "toggleMute" });
}

shareButton.onclick = () =>{
    var roomName = roomNameInput.value;
    port.postMessage({
        type: "init",
        roomName: roomName
    });
    roomNameInput.disabled = true;
  
    copyButton.disabled = false;
    playButton.disabled = true;
    stopToonin.disabled = true;
    roomNameToonin.disabled = true;
};

port.onMessage.addListener((msg) => {
    console.log(msg);
    if (msg.type == "audio") {
        if (msg.status == "ok") localAudio.src = msg.url;
    } else if (msg.type == "roomID") {
        roomID=msg.roomID
        sessionIDText.innerHTML = "Your Toonin ID is: \n" + roomID;
        sessionIDText.style.visibility = "visible";
    }
    else if(msg.type === "room creation fail") {
        sessionIDText.innerHTML = "Room Creation Failed: \n" + msg.reason;
        sessionIDText.style.visibility = "visible";
        roomNameInput.disabled = false;
    }
});

copyButton.onclick = () => {
    var str = roomID;
    // Create new element
    var el = document.createElement('textarea');
    // Set value (string to be copied)
    el.value = str;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute('readonly', '');
    el.style = {position: 'absolute', left: '-9999px'};
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand('copy');
    // Remove temporary element
    document.body.removeChild(el);
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "clicked_browser_action") {
        console.log("clicked the button")
        if (div.style.display === "none") {
            div.style.display = "block";
          } else {
            div.style.display = "none";
          }
    }
  });

playButton.onclick = () => {
    port.postMessage({
        type: "play",
        roomName: roomNameToonin.value
    });
    roomNameToonin.disabled = true;
}

stopToonin.onclick = () => {
    port.postMessage({
        type: "stopToonin"
    });
    roomNameToonin.disabled = false;
}