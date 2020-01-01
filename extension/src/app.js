import Vue from 'vue';
import vuetify from './plugins/vuetify' // path to vuetify export
import App from './App.vue';
import Vuex from 'vuex'
// import { sync } from 'vuex-router-sync'
import VueRouter from "vue-router"

Vue.use(VueRouter)
Vue.use(Vuex);

function makeid(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

import HomeView from "./HomeView.vue";
import SharingView from "./SharingView.vue";

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    }, {
        path: '/sharing',
        name: 'sharing',
        component: SharingView
    }
]

const router = new VueRouter({routes})

const port = chrome.runtime.connect({name: "toonin-extension"});
const VALID_ROOM_REGEX = /^[a-z0-9_-]{4,16}$/
const ROOM_NAME_INVALID = "Your room name is invalid"

export const States = {
    HOME: "HOME",
    SHARING: "SHARING"
}

const copyToClipboard = str => {
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

const store = new Vuex.Store({
    state: {
        roomName: '',
        roomNameValid: false,
        roomNameInputErrorMessages: [],
        state: States.HOME,
        peerCount: 0,
        tabId: '',
        muted: false,
        volume: 1
    },
    mutations: {
        setRoomName(state, roomName) {
            console.log('setRoomName: ' + roomName)
            state.roomName = roomName;
            const roomNameValid = state.roomName.match(VALID_ROOM_REGEX);
            if (roomNameValid) {
                state.roomNameInputErrorMessages = [];
                state.roomNameValid = true;
            } else {
                state.roomNameValid = false;
                state.roomNameInputErrorMessages.push(ROOM_NAME_INVALID);
            }
        },
        setRoomNameInputErrorMessage(state, errorMessage) {
            state.roomNameInputErrorMessages = [];
            state.roomNameInputErrorMessages.push(errorMessage);
        },
        setState(state, appState) {
            var stateKeys = Object.keys(appState);
            for (var i = 0; i < stateKeys.length; i++) {
                if (stateKeys[i] in state) {
                    state[stateKeys[i]] = appState[stateKeys[i]];
                }
            }

        },
        resetState(state) {
            state.state = States.HOME
            state.roomName = '';
            state.roomNameValid = false;
            state.roomNameInputErrorMessages = [];
            state.peerCount = 0,
            state.tabId = '',
            state.muted = false,
            state.volume = 1

        },
        saveState(state) {
            port.postMessage({type: 'stateUpdate', state: state});
        }
    },
    actions: {
        startShare(context) {
            const roomName = context.state.roomName;
            console.log(`startShare(${roomName})`);
            port.postMessage({type: "init", roomName: roomName});
        },
        roomCreated(context) {
            console.log("room created")
            if (this.state.roomName != "") {
                router.push({name: 'sharing'})
                context.commit("setState", {state: States.SHARING});
                context.commit("saveState");
            }
        },
        roomCreationFailed(context) {
            context.commit("setRoomNameInputErrorMessage", "A room with that name already exists");
            context.commit("saveState");
        },
        randomRoomName(context) {
            const roomName = makeid(8);
            context.commit("setRoomName", roomName);
            context.commit("saveState");
        },
        copyLinkToClipboard(context) {
            copyToClipboard(`https://app.toonin.ml/${context.state.roomName}`)
        },
        copyIdToClipboard(context) {
            copyToClipboard(context.state.roomName)
        },
        stopSharing(context) {
            port.postMessage({type: "stopSharing"});
            router.push({name: 'home'});
            context.commit("resetState");
            context.commit("saveState")
            context.dispatch("toggleScreenShare", false);
        },
        requestState() {
            console.log('state requested from background');
            port.postMessage({type: "requestState"});
        },
        toggleScreenShare(context, checked=false) {
            if(this.state.state === States.HOME) {
                port.postMessage({ type: 'toggleScreenShare', isSharing: checked });
            }
        },
        toggleDistStreamSys(context, checked) {
            if(this.state.state === States.HOME) {
                port.postMessage({ type: 'toggleDistStreamSys', useDistributedStreaming: checked });
            }
        }
    }
})

port.onMessage.addListener((msg) => {
    if (msg.type === "room creation fail") {
        store.dispatch("roomCreationFailed");
    }

    if(msg.type === 'room created') { store.dispatch('roomCreated'); }
});

// const unsync = sync(store, router)

const app = new Vue({
    el: '#app',
    vuetify,
    store,
    router,
    render: h => h(App)
});
// unsync()


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "extension-state") {
        store.commit("setState", request.data);
        if(store.state.state === States.HOME) { 
            router.push({name: 'home'}).catch((err) => {});
            store.dispatch("toggleScreenShare", false);
        }
        else if(store.state.state === States.SHARING) { 
            router.push({name: "sharing"}).catch((err) => {});
        }
    }
});
