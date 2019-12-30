<p align="center">
  <a href="https://toonin.ml" target="_blank">
    <img alt="Toonin Icon" width="100" src="https://github.com/grey-software/toonin/raw/readme-icon-circleci/assets/icon.png">
  </a>
</p>

# Toonin

[![CircleCI](https://circleci.com/gh/grey-software/toonin/tree/master.svg?style=svg)](https://circleci.com/gh/grey-software/toonin/tree/master) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/d7e992618c424b9a8f1604bf7bb00403)](https://www.codacy.com/gh/grey-software/toonin?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=grey-software/toonin&amp;utm_campaign=Badge_Grade)

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

### Running the web app
Enter the web app directory and serve the app on your machine
```sh
cd client
npm run serve
```

### Running the extension
Enter the extension directory and run the development script for the extension. 
```sh
cd extension
npm run dev
```

This packs the extension under the build directory and watches your extension files for local changes. 

Use [this guide](https://developer.chrome.com/extensions/getstarted) to load the extension into chrome. 

### Running the signalling server
Enter the backend directory and run the signalling server. 
```sh
cd backend
node index.js
```


[![Grey Software](https://github.com/grey-software/Grey-Software/blob/master/grey-software.png?raw=true)](https://greysoftware.webflow.io)