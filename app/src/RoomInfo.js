import React, { Component } from "react";
import $ from 'jquery';
import "./App.css";

var roomName = "";

class RoomInfo extends Component {
    constructor(props) {
        super(props);
        this.state = { };
    }

    getRoomName() {
        console.log('roominfo getroomname called ' + this.props.successfulConn);
        var sendData = {id: this.props.roomID};
        $.ajax({
            method: "GET",
            url: this.props.ENDPOINT + 'get-room-name',
            data: sendData,
            dataType: 'json',
            success: (data) => { roomName = data.roomName; },
            error: () => { roomName = ""; },
            timeout: 350
        });
    }

    render() {
        console.log('roominfo render called ' + this.props.successfulConn);
        if(this.props.roomID !== "" && !this.props.successfulConn) { this.getRoomName(); }

        var valStyle = { opacity: this.props.successfulConn ? 1 : 0.8 };
        return (
        <div id="room-info-box">
            <a className="room-info-box-text">Room Name :</a>
            <a className="room-info-values" style={valStyle}>&nbsp;&nbsp;{roomName}</a>
            <br></br>
            <a className="room-info-box-text">Room ID   :</a>
            <a className="room-info-values" style={valStyle}>&nbsp;&nbsp;{this.props.roomID}</a>
        </div>);
    }
}

export default RoomInfo;
