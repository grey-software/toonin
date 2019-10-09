import React, { Component } from "react";
import "./App.css";
import "typeface-roboto";
import Button from "material-ui/Button";
import TextField from "material-ui/TextField";
import io from "socket.io-client";
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';



var socket;

const offerOptions = {
  offerToReceiveAudio: 1
};

const servers = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302"
      ]
    }
  ]
};
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomID: "",
            peerID: "",
            candidates: [],
            established: false,
            rtcConn: null,
            isPlaying: false,
            stream: null
        };
        this.setSocketListeners = this.setSocketListeners.bind(this);
        this.createAnswer = this.createAnswer.bind(this);
    }


  render() {
    return (
      <div className="App">
        
          <div>
        <canvas
                ref="analyzerCanvas"
                id="analyzer"
                >

               
                </canvas>
                </div>

    <div className="myDiv">
    <audio
         autoPlay
            crossOrigin="anonymous"
            ref={audio => {
              this.audio = audio;
            }}
          />
          <MuiThemeProvider theme={theme}>
     <TextField
            id="roomID"
            label="Toonin ID "
            style={tfStyle}
            value={this.state.roomID}
            onInput={e => this.setState({ roomID: e.target.value })}
            margin="normal"
          />
          </MuiThemeProvider>
          <Button onClick={this.checkStream.bind(this)} style={btnStyle}>
            Toonin
          </Button>
    </div>
        
      </div>
    );
  }

  checkStream() {
      fetch(ENDPOINT + this.state.roomID)
          .then(res => res.json())
          .then(res => this.checkStreamResult(res))
          .catch(err => logMessage(err));
  }

  checkStreamResult(result) {
      if (result === "SUCCESS") {
          logMessage("Active session with ID: " + this.state.roomID + " found!");
          socket = io(ENDPOINT);
          socket.emit("new peer", this.state.roomID);
          this.setSocketListeners(socket);
          const rtcConn = new RTCPeerConnection(servers);
          rtcConn.onicecandidate = event => {
              if (!event.candidate) {
                  logMessage("No candidate for RTC connection");
                  return;
              }
              socket.emit("peer new ice", {
                  id: socket.id,
                  room: this.state.roomID,
                  candidate: event.candidate
              });
          };
          rtcConn.onaddstream = event => {
              logMessage("Stream added");
              logMessage(event.stream);
              this.audio.srcObject = event.stream;	
	        //   this.audio.src = "https://p.scdn.co/mp3-preview/e4a8f30ca62b4d2a129cc4df76de66f43e12fa3f?cid=null";
	          pause = 0;
	          this.audio.play();
              this.createVisualization()
          };
          this.setState({
              established: true,
              rtcConn: rtcConn,
              peerID: socket.id
          });
      } else {
          logMessage("No active session with roomID: " + this.state.roomID);
          this.setState({
              established: false,
              roomID: ""
          });
      }
  }

  setSocketListeners(socket) {
      socket.on("src ice", iceData => {
          logMessage(`Received new ICE Candidate from src for peer: ${iceData.id} in room: ${iceData.room}`);
          logMessage(`I have id: ${socket.id} and room: ${this.state.roomID}`);
          if (iceData.room !== this.state.roomID || iceData.id !== socket.id) {
              logMessage("ICE Candidate not for me");
              return;
          }
          this.state.rtcConn
              .addIceCandidate(new RTCIceCandidate(iceData.candidate))
              .then(logMessage("Ice Candidate added successfully"))
              .catch(err => logMessage(`ERROR on addIceCandidate: ${err}`));
      });

      socket.on("src desc", descData => {
          logMessage(`Received description from src for peer: ${descData.id} in room: ${descData.room}`);
          logMessage(`I have id: ${socket.id} and room: ${this.state.roomID}`);
          if (descData.room !== this.state.roomID || descData.id !== socket.id) {
              logMessage("ICE Candidate not for me");
              return;
          }
          this.state.rtcConn.setRemoteDescription(new RTCSessionDescription(descData.desc)).then(() => {
              logMessage("Setting remote description success");
              this.createAnswer(descData.desc);
          });
      });
  }

  createAnswer(desc) {
      const roomID = this.state.roomID;
      this.state.rtcConn.createAnswer().then(desc => {
          preferOpus(desc.sdp);
          logMessage("Answer created");
          this.state.rtcConn.setLocalDescription(new RTCSessionDescription(desc)).then(function () {
              logMessage("Local description from answer set");
              socket.emit("peer new desc", {
                  id: socket.id,
                  room: roomID,
                  desc: desc
              });
          });
      });
  }
  }
  
const logMessage = (message) => {
    console.log(message);
}
var preferOpus = function (sdp) {
    var sdpLines = sdp.split('\r\n');

    for (var i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].search('m=audio') !== -1) {
            var mLineIndex = i;
            break;
        }
    }

    if (mLineIndex === null) return sdp;

    for (i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].search('opus/48000') !== -1) {
            var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
            if (opusPayload)
                sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
            break;
        }
    }

    sdpLines = removeCN(sdpLines, mLineIndex);

    sdp = sdpLines.join('\r\n');
    return sdp;
};

var extractSdp = function (sdpLine, pattern) {
    var result = sdpLine.match(pattern);
    return (result && result.length == 2) ? result[1] : null;
};

var setDefaultCodec = function (mLine, payload) {
    var elements = mLine.split(' ');
    var newLine = new Array();
    var index = 0;
    for (var i = 0; i < elements.length; i++) {
        if (index === 3) newLine[index++] = payload;
        if (elements[i] !== payload) newLine[index++] = elements[i];
    }
    return newLine.join(' ');
};

var removeCN = function (sdpLines, mLineIndex) {
    var mLineElements = sdpLines[mLineIndex].split(' ');
    for (var i = sdpLines.length - 1; i >= 0; i--) {
        var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
        if (payload) {
            var cnPos = mLineElements.indexOf(payload);
            if (cnPos !== -1) mLineElements.splice(cnPos, 1);
            sdpLines.splice(i, 1);
        }
    }
    sdpLines[mLineIndex] = mLineElements.join(' ');
    return sdpLines;
};

export default App;
