# Toonin

Toonin is a Chrome Extension coupled with a web app that allows your friends to Tune In to what you're listening to. 

## Overview

Toonin consists of a Chrome extension, a web application, and a signaling server. WebRTC is used to stream the music from the provider to its peers. 

In order to exchange information, a signaling server must exist between the provider (Chrome Extension) and the peers (Web App)


## Development setup

We provide a setup script that installs all necessary dependencies. 
```sh
bash setup.sh
```

## Running Toonin

### client
Use [Vue UI](https://cli.vuejs.org/guide/) to import and run the web app. 

### extension
Run ``npm run build`` to run the webpack build script for the extension. Once the extension is packed under the build directory, load it into chrome as per [this guide](https://developer.chrome.com/extensions/getstarted)

### backend
``node index.js`` will run the signaling server on your local machine at port 8100 

![Grey Software](https://github.com/grey-software/Grey-Software/blob/master/grey-software.png?raw=true)


