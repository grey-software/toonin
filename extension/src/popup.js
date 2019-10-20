const port = chrome.runtime.connect({
    name: "toonin-extension"
});

const shareButton = document.getElementById("btnShare");
const sessionIDText = document.getElementById("roomID");

const copyButton = document.getElementById("btnCopy");
const roomNameInput = document.getElementById("roomNameInput");
const playButton = document.getElementById("play-it");
const roomName = document.getElementById("roomid1");

var roomID;
shareButton.onclick = () => {
    console.log("start sharing clicked");
    var roomName = roomNameInput.value;
    port.postMessage({
        type: "init",
        roomName: roomName
    });
    roomNameInput.disabled = true;
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
        msg: roomName.value
    });
}