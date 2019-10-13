import {
    html
} from "./toonin_box";

const port = chrome.runtime.connect({
    name: "toonin-extension"
});

var div = document.createElement('div');
div.id = "tooninBox";
div.style.display = "inline-block";
div.style.position = "absolute";
div.style.top = '30px';
div.style.right = '30px';
div.style.zIndex = '10000';
div.innerHTML = html;
document.body.appendChild(div);

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

shareButton.onclick = () =>{
    port.postMessage({
        type: "init"
    });
};

port.onMessage.addListener((msg) => {
    console.log(msg);
    if (msg.type == "audio") {
        if (msg.status == "ok") localAudio.src = msg.url;
    } else if (msg.type == "roomID") {
        sessionIDText.innerHTML = "Your Toonin ID is: \n" + msg.roomID;
        sessionIDText.style.visibility = "visible";
    }
});
