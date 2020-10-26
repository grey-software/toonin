<p align="center">
  <a href="https://www.toonin.ml" target="_blank">
    <img alt="Toonin Icon" width="100" src="https://github.com/grey-software/toonin/raw/master/assets/icon.png">
  </a>
</p>

# Toonin

[![CircleCI](https://circleci.com/gh/grey-software/toonin/tree/master.svg?style=svg)](https://circleci.com/gh/grey-software/toonin/tree/master) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/d7e992618c424b9a8f1604bf7bb00403)](https://www.codacy.com/gh/grey-software/toonin?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=grey-software/toonin&amp;utm_campaign=Badge_Grade) [![Netlify Status](https://api.netlify.com/api/v1/badges/fc6849cb-e7ae-4de9-be09-660d51342bf6/deploy-status)](https://app.netlify.com/sites/toonin/deploys)

Toonin is technology that allows you to share or stream audio and video over the web in real time. 

## Overview

Toonin consists of a web app and a signaling server. WebRTC is used to stream the music from the provider to its peers. 

The signaling server facilitates a WebRTC handshake between two Toonin web app instances, after which the two apps speak directly to each other over P2P WebRTC streams.


## Development setup

```sh
yarn setup
```

## Running Toonin

Toonin comes with a local development script that launches the server and app simultaneuously.  

```sh 
yarn dev
```

### Running the web app independently
```sh
yarn run app
```

### Running the signalling server independently
```sh
yarn run server
```
