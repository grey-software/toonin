const port = browser.runtime.connect({name: "toonin-extension"});
var pc;
const stream = null;

const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "clicked_extension") {
        chrome.runtime.sendMessage({"message": "extension_state"});
    }
    if (request.message === "getStream") {
        browser.runtime.sendMessage({"message": "test", content: "first"});
        
        getStream();
    }
    if(request.message == "test" && request.type == "sdp") {
        console.log(request.content)
        try {
          pc.setRemoteDescription(request.content);
          console.log(`pc setRemoteDescription complete`);
        } catch (e) {
            console.log(`Failed to set session description: ${e.toString()}`);
        }
    }
    if(request.message == "test" && request.type == "iceto") {
        console.log("ice message came :" + request.content);
        onIceCandidate(request.content)
    }
})

async function getStream() {
    await start();
    stream = await navigator.mediaDevices.getDisplayMedia({audio: true});
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
}

async function start() {
    pc = new RTCPeerConnection({});
    pc.addEventListener('iceconnectionstatechange', e => onIceStateChange(pc, e));
    pc.onicecandidate = function (event) {
        if (! event.candidate) {
            console.log("No candidate for RTC connection");
            return;
        }
        var candidate = event.candidate;
        console.log(candidate)
        browser.runtime.sendMessage({"message": "test", type: "icefrom" , content: JSON.parse(JSON.stringify(candidate))})
    };
    try {
        console.log('pc createOffer start');
        const offer = await pc.createOffer(offerOptions);
        await onCreateOfferSuccess(offer);
      } catch (e) {
        console.log(`Failed to create session description: ${e.toString()}`);
      }
}

async function onCreateOfferSuccess(desc) {
    console.log(`Offer from pc\n${desc.sdp}`);
    console.log('pc setLocalDescription start');
    try {
      await pc.setLocalDescription(desc);
      console.log(`setLocalDescription complete`);
    } catch (e) {
      console.log(`Failed to set session description: ${e.toString()}`);
    }

    browser.runtime.sendMessage({"message": "test", type: "offer" , content: desc})
}

async function onIceCandidate(event) {
    console.log(event)
    try {
      await (pc.addIceCandidate(event));
      console.log("addIceCandidate success");
    } catch (e) {
      console.log('failed to add ICE Candidate' + e);
    }
}

  function onIceStateChange(pc, event) {
    if (pc) {
      console.log(`ICE state: ${pc.iceConnectionState}`);
      console.log('ICE state change event: ', event);
    }
  }


  