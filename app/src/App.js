import React, { Component } from "react";
import "./App.css";
import "typeface-roboto";
import Button from "material-ui/Button";
import TextField from "material-ui/TextField";
import io from "socket.io-client";
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';

const ENDPOINT = "http://206.189.69.217:8100/";

const btnStyle = {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    borderRadius: 3,
    border: 0,
    left: 30,
    color: 'white',
    height: 36,
    padding: '0 15px',
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .30)',
};

const tfStyle = {
    color: 'white',
};

const theme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            // light: will be calculated from palette.primary.main,
            main: '#ffffff',
            // dark: will be calculated from palette.primary.main,
            // contrastText: will be calculated to contast with palette.primary.main
        },
        secondary: {
            light: '#0066ff',
            main: '#0044ff',
            // dark: will be calculated from palette.secondary.main,
            contrastText: '#ffcc00',
        },
        // error: will use the default color
    },
});


var canvas, ctx, source, context, analyser, fbc_array, rads,
	center_x, center_y, radius, radius_old, deltarad, shockwave,
	bars, bar_x, bar_y, bar_x_term, bar_y_term, bar_width,
	bar_height, react_x, react_y, intensity, rot, inputURL,
	JSONPThing, JSONResponse, soundCloudTrackName, audio, pause,
    artist, title, img_url, isSeeking;
    
    bars = 200;
    react_x = 0;
    react_y = 0;
    radius = 0;
    deltarad = 0;
    shockwave = 0;
    rot = 0;
    intensity = 0;
    pause = 1;
    isSeeking = 0;


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
        this.createVisualization = this.createVisualization.bind(this)
    }

    componentDidMount(){
        this.createVisualization()
    }

    createVisualization() {
            let context = new AudioContext();
            let analyser = context.createAnalyser();
            let canvas = this.refs.analyzerCanvas;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            let ctx = canvas.getContext('2d');
            this.audio.crossOrigin = "anonymous";
            if (this.audio.srcObject) {
                let audioSrc = context.createMediaStreamSource(this.audio.srcObject);
                audioSrc.connect(analyser);
                audioSrc.connect(context.destination);
                analyser.connect(context.destination);
            }

        function frameLooper() {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
            var grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grd.addColorStop(0, "rgba(0,153,188 ,1)");
            grd.addColorStop(1, "rgba(0,183,195 ,1)");

            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "rgba(255, 255, 255, " + (intensity * 0.0000125 - 0.4) + ")";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            rot = rot + intensity * 0.0000001;

            react_x = 0;
            react_y = 0;

            intensity = 0;
            let fbc_array = new Uint8Array(analyser.frequencyBinCount)
            requestAnimationFrame(frameLooper)
            analyser.getByteFrequencyData(fbc_array)

            for (var i = 0; i < bars; i++) {
                rads = Math.PI * 2 / bars;

                bar_x = center_x;
                bar_y = center_y;

                bar_height = Math.min(99999, Math.max((fbc_array[i] * 2.5 - 200), 0));
                bar_width = bar_height * 0.02;

                bar_x_term = center_x + Math.cos(rads * i + rot) * (radius + bar_height);
                bar_y_term = center_y + Math.sin(rads * i + rot) * (radius + bar_height);

                ctx.save();

                var lineColor = "rgb(" + (fbc_array[i]).toString() + ", " + 255 + ", " + 255 + ")";

                ctx.strokeStyle = lineColor;
                ctx.lineWidth = bar_width;
                ctx.beginPath();
                ctx.moveTo(bar_x, bar_y);
                ctx.lineTo(bar_x_term, bar_y_term);
                ctx.stroke();

                react_x += Math.cos(rads * i + rot) * (radius + bar_height);
                react_y += Math.sin(rads * i + rot) * (radius + bar_height);

                intensity += bar_height;
            }

            center_x = canvas.width / 2 - (react_x * 0.007);
            center_y = canvas.height / 2 - (react_y * 0.007);

            radius_old = radius;
            radius = 25 + (intensity * 0.002);
            deltarad = radius - radius_old;

            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.beginPath();
            ctx.arc(center_x, center_y, radius + 2, 0, Math.PI * 2, false);
            ctx.fill();

            // shockwave effect			
            shockwave += 60;

            ctx.lineWidth = 15;
            ctx.strokeStyle = "rgb(255, 255, 255)";
            ctx.beginPath();
            ctx.arc(center_x, center_y, shockwave + radius, 0, Math.PI * 2, false);
            ctx.stroke();


        }
        frameLooper();
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
