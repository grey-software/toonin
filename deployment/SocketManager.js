/** Class representing a socket instance. */
// class SocketInstance {
//     /**
//      * Create a Socket Instance
//      * @param {SocketIOClient.Socket} socket - socket to be added.
//      * @param {String} room - The room name in which the socket belongs.
//      */
//     constructor(socket, room) {
//         this.socket = socket
//         this.room = room
//         this.id = socket.id
//     }

//     /**
//      * Return a SocketIOClient.Socket
//      */
//     getSocket() {
//         return this.socket
//     }

//     /**
//      * Return the room name in which the socket belongs too.
//      */
//     getRoom() {
//         return this.room
//     }
// }

/** Class representing a socket Manager */
class SocketManager {
    constructor() {
      this.sockets = {}
    }

    /**
     * Add socket to Manager
     * @param {SocketIOClient.Socket} socket
     * @param {String} roomName A Room name property
     * @param {String} name A name property
     */
    addSocket(socket, roomName, name) {
        if (!this.sockets[socket.id]) {
            this.sockets[socket.id] = {room: roomName, name: name}
        }
    }

    // /**
    //  * Find a socket connection by its id.
    //  * @param {String} id Socket id
    //  * @return {SocketInstance} Socket instance or undefined if not found.
    //  */
    // findSocket(id) {
    //     return this.sockets.find(socket => socket.id === id)
    // }

    /**
     * Return room name for a socket connection
     * @param {String} id Socket id
     * @return {String} Room name the socket belongs too or null
     */
    getSocket(id) {
        if (this.sockets[id]) {
            return this.sockets[id]
        }
        return null
    }

    /**
     * Remove a Socket Instance from Socket Manager
     * @param {String} id Socket id
     */
    removeSocket(id) {
        delete this.sockets[id]
    }

    /**
     * Count of sockets in a given room.
     * @param {String} room Room name
     * @return {Number} The number of sockets in a given room.
     */
    getSocketCountInRoom(room) {
        // -1 lenght to not count hosting socket. 
        return Object.values(this.sockets).filter(socket => socket.room === room).length - 1
    }

}
module.exports.SocketManager = SocketManager