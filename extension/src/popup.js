const port = chrome.runtime.connect({
    name: "toonin-extension"
});

const shareButton = document.getElementById("btnShare");
const stopSharingButton = document.getElementById("btnShareStop");
const sessionIDText = document.getElementById("roomID");

const copyButton = document.getElementById("btnCopy");
const roomNameInput = document.getElementById("roomNameInput");

copyButton.style.visibility="hidden";
stopSharingButton.style.visibility="hidden";
const playButton = document.getElementById("playRoom");
const roomNameToonin = document.getElementById("tooninToRoom");
const stopToonin = document.getElementById("stopToonin");
// mute control elements
const muteBtn = document.getElementById("mute-btn");
const muteStatus = document.getElementById("muted-notif");
// listener count
const peerCounter = document.getElementById("peerCounter");
const roomNameSpan = document.getElementById("roomNameSpan");
const connectSpan = document.getElementById("connectSpan");
const muteSpan = document.getElementById("muteSpan");
const titleSpan = document.getElementById("titleOfPage");
const titleText = document.getElementById("titleText");

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
};

stopSharingButton.onclick = () => {
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
}

stopToonin.onclick = () => {
    port.postMessage({
        type: "stopToonin"
    });
}

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_extension"});
});

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "extension_state_from_background" && request.data.roomID) {
        roomNameSpan.style.visibility= "hidden";
        shareButton.style.visibility= "hidden";
        stopSharingButton.style.visibility="visible";
        copyButton.style.visibility="visible";
        playButton.style.visibility = "hidden";
        stopToonin.style.visibility = "hidden";
        connectSpan.style.visibility = "hidden";
        roomID=request.data.roomID;
        muteSpan.style.visibility = "visible";
        muteBtn.checked = request.data.muted;
        muteStatus.hidden = !muteBtn.checked;
        sessionIDText.innerHTML = "Your Toonin ID is: \n" + roomID;
        sessionIDText.style.visibility = "visible";
        peerCounter.style.visibility = "visible";
        peerCounter.innerHTML = "You have " + request.data.peerCounter + " listeners.";
        titleText.innerHTML = "Currently streaming: " + request.data.title; 
    } 
    else if (request.message === "extension_state_from_background" && !request.data.roomID && request.data.playing) {
        roomNameSpan.style.visibility= "hidden";
        connectSpan.style.visibility = "visible";
        shareButton.style.visibility= "hidden";
        stopSharingButton.style.visibility="hidden";
        copyButton.style.visibility = "hidden";
        playButton.disabled = false;
        stopToonin.disabled = false;
        roomNameToonin.disabled = true;
        roomNameToonin.value = request.data.room;
        muteSpan.style.visibility = "hidden";
        muteBtn.checked = request.data.muted;
        muteStatus.hidden = !muteBtn.checked;
        roomID=null;
        sessionIDText.style.visibility = "hidden";
        peerCounter.style.visibility = "visible";
        peerCounter.innerHTML = "Tooned into room "+request.data.room;
        titleText.innerHTML = "Host is listening to: " + request.data.hostTitle;
    } 
    else if (request.message === "extension_state_from_background" && !request.data.roomID && !request.data.playing) {
        roomNameSpan.style.visibility= "visible";
        shareButton.style.visibility= "visible";
        stopSharingButton.style.visibility="hidden";
        copyButton.style.visibility = "hidden";
        playButton.disabled = false;
        stopToonin.disabled = true;
        roomNameToonin.disabled = false;
        playButton.style.visibility = "visible";
        stopToonin.style.visibility = "visible";
        connectSpan.style.visibility = "visible";
        muteSpan.style.visibility = "hidden";
        muteBtn.checked = request.data.muted;
        muteStatus.hidden = !muteBtn.checked;
        roomID=null;
        sessionIDText.style.visibility = "hidden";
        peerCounter.style.visibility = "visible";
        peerCounter.innerHTML = "Not Streaming";
        titleText.innerHTML = "";
    }
  });

  