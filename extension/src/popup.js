const port = chrome.runtime.connect({
    name: "toonin-extension"
});

const shareButton = document.getElementById("btnShare");
const stopShareBtn = document.getElementById("btnShareStop");
const sessionIDText = document.getElementById("roomID");

const copyButton = document.getElementById("btnCopy");
const roomNameInput = document.getElementById("roomNameInput");

copyButton.disabled = true;
const playButton = document.getElementById("playRoom");
const roomNameToonin = document.getElementById("tooninToRoom");
const stopToonin = document.getElementById("stopToonin");
// mute control elements
const muteBtn = document.getElementById("mute-btn");
const muteStatus = document.getElementById("muted-notif");
// listener count
const peerCounter = document.getElementById("peerCounter");

muteBtn.onclick = function() { 
    muteStatus.hidden = !this.checked;
    port.postMessage({
        type: "toggleMute",
        value: !this.checked
    });
}


shareButton.onclick = () => {
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

stopShareBtn.onclick = () => {
    port.postMessage({ type: 'stopSharing' });
}

var roomID;

port.onMessage.addListener((msg) => {
    console.log(msg);
    if (msg.type == "audio") {
        if (msg.status == "ok") localAudio.src = msg.url;
    } else if (msg.type == "roomID") {
        roomID = msg.roomID;
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



playButton.onclick = () => {
    port.postMessage({
        type: "play",
        roomName: roomNameToonin.value
    });
    roomNameToonin.disabled = true;
    shareButton.disabled = true;
    copyButton.disabled = true;
}

stopToonin.onclick = () => {
    port.postMessage({
        type: "stopToonin"
    });
    roomNameToonin.disabled = false;
    copyButton.disabled = false;
    shareButton.disabled = false;
}

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_extension"});
});

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "extension_state_from_background" && request.data.roomID) {
        roomNameInput.disabled = true;
        shareButton.disabled = true;
        copyButton.disabled = false;
        playButton.disabled = true;
        stopToonin.disabled = true;
        roomNameToonin.disabled = true;
        roomID=request.data.roomID;
        console.log(request.data);
        muteBtn.checked = request.data.muted;
        muteStatus.hidden = !muteBtn.checked;
        sessionIDText.innerHTML = "Your Toonin ID is: \n" + roomID;
        sessionIDText.style.visibility = "visible";
        peerCounter.innerHTML = "You have " + request.data.peerCounter + " listeners";
    } 
    else if (request.message === "extension_state_from_background" && !request.data.roomID && request.data.playing) {
        roomNameToonin.disabled = true;
        roomNameInput.disabled = true;
        shareButton.disabled = true; 
        copyButton.disabled = true;
        playButton.disabled = false;
        stopToonin.disabled = false;
        console.log(request.data);
        muteBtn.checked = request.data.muted;
        muteStatus.hidden = !muteBtn.checked;
        roomNameToonin.value = request.data.room;
        roomID=null;
        sessionIDText.style.visibility = "hidden";
        peerCounter.innerHTML = "You have " + request.data.peerCounter + " listeners";
    } 
    else if (request.message === "extension_state_from_background" && !request.data.roomID && !request.data.playing) {
        roomNameInput.disabled = false;
        shareButton.disabled = false;
        copyButton.disabled = true;
        playButton.disabled = false;
        stopToonin.disabled = false;
        roomNameToonin.disabled = false;
        console.log(request.data);
        muteBtn.checked = request.data.muted;
        muteStatus.hidden = !muteBtn.checked;
        roomID=null;
        sessionIDText.style.visibility = "hidden";
        peerCounter.innerHTML = "You have " + request.data.peerCounter + " listeners";
    }
  });

  