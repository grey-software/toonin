import Vue from 'vue';
import vuetify from './plugins/vuetify' // path to vuetify export
import App from './App.vue';
import Vuex from 'vuex'

Vue.use(Vuex)

chrome.tabs.query({
    active: true,
    currentWindow: true
}, function (tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_extension"});
});

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 
const port = chrome.runtime.connect({name: "toonin-extension"});
const VALID_ROOM_REGEX = /^[a-zA-Z0-9_-]{6,16}$/
const ROOM_NAME_INVALID = "Your room name is invalid"

export const States = {
    INITIAL: "INITIAL",
    SHARING: "SHARING"
}

const store = new Vuex.Store({
    state: {
        roomName: '',
        roomNameValid: false,
        roomNameInputErrorMessages: [],
        state: States.INITIAL
    },
    mutations: {
        setRoomName(state, roomName) {
            console.log(roomName)
            state.roomName = roomName
            const roomNameValid = state.roomName.match(VALID_ROOM_REGEX)
            if (roomNameValid) {
                state.roomNameInputErrorMessages = []
                state.roomNameValid = true
            } else {
                state.roomNameValid = false
                state.roomNameInputErrorMessages.push(ROOM_NAME_INVALID)
            }
        },
        setRoomNameInputErrorMessage(state, errorMessage) {
            state.roomNameInputErrorMessages = []
            state.roomNameInputErrorMessages.push(errorMessage)
        },
        setSharing(state, isSharing) {
            if (isSharing) {
                state.state = SHARING;
            } else {
                state.state = INITIAL;
            }
        }
    },
    actions: {
        startShare(context) {
            const roomName = context.state.roomName
            console.log(`startShare(${roomName})`)
            port.postMessage({type: "init", roomName: roomName});
        },
        roomCreated(context) {
            context.commit("setSharing", true)
        },
        roomCreationFailed(context) {
            context.commit("setRoomNameInputErrorMessage", "A room with that name already exists")
        },
        randomRoomName(context) {
            const roomName = makeid(8)
            console.log(roomName)
            context.commit("setRoomName", roomName)
        }
    }
})

port.onMessage.addListener((msg) => {
    if (msg.type === "room creation fail") {
        store.dispatch("roomCreationFailed")
    }
});


const app = new Vue({
    el: '#app',
    vuetify,
    store,
    render: h => h(App)
});


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "extension_state_from_background" && request.data.roomID) {
        store.dispatch("roomCreated")
    } else if (request.message === "extension_state_from_background" && ! request.data.roomID) {
        store.commit(setSharing, false)
    }
});


// const shareButton = document.getElementById("btnShare");
// const stopSharingButton = document.getElementById("btnShareStop");
// const sessionIDText = document.getElementById("roomText");
// const roomDiv = document.getElementById("roomDiv");
// const newMessage = "";
// const copyButton = document.getElementById("btnCopy");
// const roomNameInput = document.getElementById("roomNameInput");

// copyButton.style.display = "none";
// stopSharingButton.style.display = "none";
// const playButton = document.getElementById("playRoom");
// const roomNameToonin = document.getElementById("tooninToRoom");
// const stopToonin = document.getElementById("stopToonin");
// // mute control elements
// const muteBtn = document.getElementById("mute-btn");
// const muteStatus = document.getElementById("muted-notif");
// // listener count
// const peerCounter = document.getElementById("peerCounter");
// const roomNameSpan = document.getElementById("roomNameSpan");
// const connectSpan = document.getElementById("connectSpan");
// const muteSpan = document.getElementById("muteSpan");
// const titleSpan = document.getElementById("titleOfPage");
// const titleText = document.getElementById("titleText");
// const volume = document.getElementById("volume");
// muteBtn.onclick = function() {
//     muteStatus.hidden = !this.checked;
//     port.postMessage({
//         type: "toggleMute",
//         value: !this.checked
//     });
// }


// volume.onchange = (event) => {
//     port.postMessage({
//         type: "volume",
//         value: event.target.value
//     });
// }

// shareButton.onclick = () => {
//     var roomName = roomNameInput.value;
//     port.postMessage({
//         type: "init",
//         roomName: roomName
//     });
// };

// stopSharingButton.onclick = () => {
//     port.postMessage({ type: 'stopSharing' });
//     hideElements();
//     homePage();
//     titleText.innerHTML = "";
// }

// var roomID;


// copyButton.onclick = () => {
//     var str = roomID;
//     // Create new element
//     var el = document.createElement('textarea');
//     // Set value (string to be copied)
//     el.value = str;
//     // Set non-editable to avoid focus and move outside of view
//     el.setAttribute('readonly', '');
//     el.style = {position: 'absolute', left: '-9999px'};
//     document.body.appendChild(el);
//     // Select text inside element
//     el.select();
//     // Copy text to clipboard
//     document.execCommand('copy');
//     // Remove temporary element
//     document.body.removeChild(el);
// };


// playButton.onclick = () => {
//     port.postMessage({
//         type: "play",
//         roomName: roomNameToonin.value
//     });
//     connectSpan.style.display = "none";
//     playButton.style.display = "flex;"
//     stopToonin.style.display = "flex";
// }

// stopToonin.onclick = () => {
//     port.postMessage({
//         type: "stopToonin"
//     });
//     hideElements();
//     homePage();
//     titleText.innerHTML = "";
// }


// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     if (request.message === "extension_state_from_background" && request.data.roomID) {
//         roomNameSpan.style.display = "none";
//         shareButton.style.display = "none";
//         stopSharingButton.style.display = "block";
//         copyButton.style.display = "block";
//         playButton.style.display = "none";
//         stopToonin.style.display = "none";
//         connectSpan.style.display = "none";
//         roomID=request.data.roomID;
//         muteSpan.style.display = "flex";
//         muteBtn.checked = request.data.muted;
//         muteStatus.hidden = !muteBtn.checked;
//         sessionIDText.innerHTML = "Your Toonin ID is: \n" + roomID;
//         roomDiv.style.display = "block";
//         peerCounter.style.display = "block";
//         peerCounter.innerHTML = "You have " + request.data.peerCounter + " listeners.";
//         volume.value = request.data.volume * 100;
//         volume.disabled=request.data.tabMute;
//         roomNameSpan.style.display = "none";
//         btnShare.style.display = "none";
//         titleText.innerHTML = "Currently streaming: " + request.data.title;
//         volume.style.display = "block";
//     }
//     else if (request.message === "extension_state_from_background" && !request.data.roomID && request.data.playing) {
//         roomNameSpan.style.display = "none";
//         shareButton.style.display = "none";
//         stopSharingButton.style.display = "none";
//         copyButton.style.display = "none";
//         roomNameToonin.value = request.data.room;
//         muteSpan.style.display = "none";
//         muteBtn.checked = request.data.muted;
//         muteStatus.hidden = !muteBtn.checked;
//         roomID=null;
//         roomDiv.style.display = "flex";
//         peerCounter.style.display = "block";
//         peerCounter.innerHTML = "Tooned into room "+request.data.room;
//         stopToonin.style.display = "block";
//         playButton.style.display = "none";
//         titleText.innerHTML = "Host is listening to: " + request.data.hostTitle;
//         volume.style.display = "block";
//     } else if (request.message === "extension_state_from_background" && !request.data.roomID && !request.data.playing) {
//         roomNameToonin.disabled = false;
//         // playButton.style.display = "block";
//         // stopToonin.style.display = "block";
//         // connectSpan.style.display = "block";
//         // muteSpan.style.display = "none";
//         muteBtn.checked = request.data.muted;
//         muteStatus.hidden = !muteBtn.checked;
//         roomID=null;
//         roomDiv.style.display = "none";
//         titleText.innerHTML = "";
//     }
// });

// function homePage() {
//       roomNameSpan.style.display = "flex";
//       shareButton.style.display = "flex";
//       roomDiv.style.display = "flex";
//       connectSpan.style.display = "flex";
//       playButton.style.display = "flex";
//       shareButton.alignItems = "center";
//       sessionIDText.innerHTML= "";
//       sessionIDText.style.display = "none";
//       volume.style.display = "none";
// }
// function hideElements() {
//       muteBtn.style.display = "none";
//       stopToonin.style.display = "none";
//       muteSpan.style.display = "none";
//       stopSharingButton.style.display = "none";
//       copyButton.style.display = "none";
//       peerCounter.style.display = "none";
//       roomDiv.style.display = "none";
//       volume.style.display = "none";
// }
// hideElements();
