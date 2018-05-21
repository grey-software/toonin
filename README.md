# Toonin

Toonin is a Chrome Extension coupled with a web app that allows your friends to Tune In to what you're listening to
![](header.png)

## Overview

Toonin consists of a Chrome extension, a web application, and a signaling server. WebRTC is used to stream the music from the provider to its peers. 

In order to exchange information, a signaling server must exist between the provider (Chrome Extension) and the peers (Web App)


## Development setup

``cd`` into each directory and run 

```sh
npm i
```

## Running Toonin

### app
``npm start`` will run the react app on your local machine at port 3000 
### extension
Run ``npm run build`` to run the webpack build script for the extension. Once the extension is packed under the build directory, load it into chrome as per [this guide](https://developer.chrome.com/extensions/getstarted)
### backend
``node index.js`` will run the signaling server on your local machine at port 8100 


## What's Next?
- [ ] Use Data Channels to stream audio (In Progress)
- [ ] Show how many peers are tuning in
- [ ] Make it easier to tune in by allowing extension to choose ID
- [ ] Document everything (In Progress) 


