module.exports = {html: `<div>
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
<link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.blue-light_blue.min.css" />
<script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.12/css/all.css" integrity="sha384-G0fIWCsCzJIMAVNQPfjH08cyYaUtMwjJwqiRKxxE/rx96Uroj1BtIQ6MLJuheaO9"
    crossorigin="anonymous">
<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">

<!-- Square card -->
<style>
    .demo-card-square.mdl-card {
        width: 320px;
        height: 320px;
    }

    .demo-card-square>.mdl-card__title {
        background: url("https://image.ibb.co/fRYLty/bg.png") center / cover;
        color: #66B7DA;
    }

    .ic-share {
        margin-right: 4px;
    }

    .room-id-text {
        visibility: hidden;
        margin: 0%;
    }

    .spinner {
        font-size: 50px;
        font-family: sans-serif;
        color: palevioletred;
        margin: 0%;
        animation-play-state: paused;
    }
</style>

<div class="demo-card-square mdl-card mdl-shadow--2dp" style="height: 450px;">
    <div class="mdl-card__title mdl-card--expand">
        <h2 class="mdl-card__title-text">Toonin

        </h2>

    </div>
    <div class="mdl-card__actions mdl-card--border" style="height: 60%;">
        <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" id="btnShare">
            <i class="fas fa-music ic-share"></i>
            Start Sharing
        </a>
        <br>
        <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" style="margin-top: 2%;">
            Room Name <input type="text" id="roomNameInput" style="height: 80%; margin-left: 8px; padding: 4px;">
        </a>
        <br>
        <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" id="btnCopy"> <i class="far fa-copy ic-share"></i> Copy ID </a>
        <br>
        <p class="mdl-card__supporting-text room-id-text" style="padding: 1%; margin-left: 4%;" id="roomID">
        </p>
        <br>
        <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" style="margin-top: 2%;">
        Toonin to <input type="text" id="tooninToRoom" style="height: 80%; margin-left: 8px; padding: 4px;">
        
        </a>
        <br>
        <button class="mdl-button mdl-js-buttonton--fab mdl-button--fab mdl-button--colored" id="playRoom" style="padding: 4%; margin-left: 41%;">
                <i class="material-icons">play_circle_filled</i>
            </button>
        
    </div>
</div>`}