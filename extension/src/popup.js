const port = chrome.runtime.connect({
    name: "toonin-extension"
});

const shareButton = document.getElementById("btnShare");
const stopSharingButton = document.getElementById("btnShareStop");
const backButton = document.getElementById("btnBack");
const sessionIDText = document.getElementById("roomText");
const roomDiv = document.getElementById("roomDiv");
const newMessage = "";
const connectRoomButton = document.getElementById("connectRoomBtn");
const copyButton = document.getElementById("btnCopy");
const roomNameInput = document.getElementById("roomNameInput");

copyButton.style.display = "none";
stopSharingButton.style.display = "none";
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

muteBtn.onclick = function() {
    muteStatus.hidden = !this.checked;
    port.postMessage({
        type: "toggleMute",
        value: !this.checked
    });
}

backButton.onclick = () => {
    createRoomBtn.style.display = "inline";
    connectRoomBtn.style.display = "inline";
    hideElements();
};

shareButton.onclick = () => {
    var roomName = roomNameInput.value;
    port.postMessage({
        type: "init",
        roomName: roomName
    });
};

stopSharingButton.onclick = () => {
    port.postMessage({ type: 'stopSharing' });
    hideElements();
    createRoomBtn.style.display = "inline";
    connectRoomBtn.style.display = "inline";
}

var roomID;

port.onMessage.addListener((msg) => {
    console.log(msg);
    if (msg.type == "audio") {
        if (msg.status == "ok") localAudio.src = msg.url;
    } else if (msg.type == "roomID") {
        roomID = msg.roomID;

        Text.innerHTML = "Your Toonin ID is: \n" + roomID;
        sessionIDText.style.display = "block";
    }
    else if(msg.type === "room creation fail") {
        sessionIDText.innerHTML = "Room Creation Failed: \n" + msg.reason;
        roomDiv.style.display ="block";
        console.log("failed");
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
    connectSpan.style.display = "none";
    playButton.style.display = "none;"
    stopToonin.style.display = "block";
}

stopToonin.onclick = () => {
    port.postMessage({
        type: "stopToonin"
    });
    hideElements();
    createRoomBtn.style.display = "inline";
    connectRoomBtn.style.display = "inline";
}

createRoomBtn.onclick= () => {
    createRoomBtn.style.display = "none";
    connectRoomBtn.style.display = "none";
    shareButton.style.display = "block";
    roomNameSpan.style.display = "block";
    btnBack.style.display = "block";

}

connectRoomBtn.onclick= () => {
    createRoomBtn.style.display = "none";
    connectRoomBtn.style.display = "none";
    roomNameToonin.style.display = "block";
    btnBack.style.display = "block";
    playButton.style.display = "block";
    connectSpan.style.display = "inline-flex";

}

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_extension"});
});

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "extension_state_from_background" && request.data.roomID) {
        roomNameSpan.style.display = "none";
        shareButton.style.display = "none";
        stopSharingButton.style.display = "block";
        copyButton.style.display = "block";
        playButton.style.display = "none";
        stopToonin.style.display = "none";
        connectSpan.style.display = "none";
        roomID=request.data.roomID;
        muteSpan.style.display = "block";
        muteBtn.checked = request.data.muted;
        muteStatus.hidden = !muteBtn.checked;
        sessionIDText.innerHTML = "Your Toonin ID is: \n" + roomID;
        roomDiv.style.display = "block";
        peerCounter.style.display = "block";
        peerCounter.innerHTML = "You have " + request.data.peerCounter + " listeners.";
        roomNameSpan.style.display = "none";
        btnShare.style.display = "none";
        backButton.style.display = "none";
        createRoomBtn.style.display = "none";
        connectRoomBtn.style.display = "none";
    }
    else if (request.message === "extension_state_from_background" && !request.data.roomID && request.data.playing) {
        roomNameSpan.style.display = "none";
        shareButton.style.display = "none";
        stopSharingButton.style.display = "none";
        copyButton.style.display = "none";
        roomNameToonin.value = request.data.room;
        muteSpan.style.display = "none";
        muteBtn.checked = request.data.muted;
        muteStatus.hidden = !muteBtn.checked;
        roomID=null;
        roomDiv.style.display = "block";
        peerCounter.style.display = "block";
        peerCounter.innerHTML = "Tooned into room "+request.data.room;
        createRoomBtn.style.display = "none";
        stopToonin.display = "block";
        connectRoomBtn.style.display = "none";
        playButton.style.display = "none";
        backButton.style.display = "none";
    }
    else if (request.message === "extension_state_from_background" && !request.data.roomID && !request.data.playing) {
        // roomNameSpan.style.display = "block";
        // shareButton.style.display = "block";
        // stopSharingButton.style.display = "none";
        // copyButton.style.display = "none";
        roomNameToonin.disabled = false;
        // playButton.style.display = "block";
        // stopToonin.style.display = "block";
        // connectSpan.style.display = "block";
        // muteSpan.style.display = "none";
        muteBtn.checked = request.data.muted;
        muteStatus.hidden = !muteBtn.checked;
        roomID=null;
        // sessionIDText.style.display = "none";

        roomDiv.style.display = "none";

    }
  });

  function hideElements() {
      backButton.style.display = "none";
      shareButton.style.display = "none";
      muteBtn.style.display = "none";
      roomNameSpan.style.display = "none";
      connectSpan.style.display = "none";
      playButton.style.display = "none";
      stopToonin.style.display = "none";
      muteSpan.style.display = "none";
      stopSharingButton.style.display = "none";
      copyButton.style.display = "none";
      peerCounter.style.display = "none";
      roomDiv.style.display = "none";
  }
  hideElements();
