const port = chrome.runtime.connect({
    name: "toonin-extension"
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "clicked_extension") {
        chrome.runtime.sendMessage({"message": "extension_state"});
    }
  });