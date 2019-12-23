class Queue {

    constructor() { this.list = []; }

    isEmpty() { return this.list.length === 0; }
    enqueue(elem) { this.list.push(elem); }
    dequeue() { if(!this.isEmpty()) { return this.list.shift(); } }
}

class networkNode {
    constructor(socketID, maxClients) {
        this.socketID = socketID;
        this.maxClients = maxClients;
    }
}

class networkTree {

    constructor(socketID, maxClients) {
        this.node = new networkNode(socketID, maxClients);
        this.subNodes = [];
        this.transferringNodes = []; // nodes (& their children) which are in process of reconnecting
    }

    hasSpace() { return this.subNodes.length < this.node.maxClients; }

    checkTransferring(socketID) {
        for(var i = 0; i < this.transferringNodes.length; i++) {
            if(socketID === this.transferringNodes[i].node.socketID) {
                return this.transferringNodes[i];
            }
        }

        return null;
    }

    /**
     * 
     * @param {SocketIO.Server} socket Socket to notify children of leaving node about disconnection
     * @param {networkTree} node Node that has been removed from the tree
     * @param {String} room Room in which this node (and its children) exist
     */
    notifyChildren(socket, node, room, root) {
        var socketIDs = [];
        for(var i = 0; i < node.subNodes.length; i++) {
            socketIDs.push(node.subNodes[i].node.socketID);
            root.transferringNodes.push(node.subNodes[i]);
        }

        if(socketIDs.length > 0) { socket.to(room).emit("reconnect", { socketIDs: socketIDs }); }
    }

    /**
     * 
     * @param {SocketIO.Server} socket Socket to notify children of leaving node about disconnection
     * @param {String} socketID socketID of node that is leaving the tree
     */
    removeNode(socket, socketID, room, root) {
        if(this.subNodes.length === 0) { return; }

        for(var i = 0; i < this.subNodes.length; i++) {
            if(this.subNodes[i].node.socketID === socketID) {
                this.notifyChildren(socket, this.subNodes.splice(i, 1)[0], room, root);
                return;
            }

            this.subNodes[i].removeNode(socket, socketID, room, root);
        }
    }

    /**
     * 
     * @param {String} socketID socket ID of the new client
     * @param {Number} maxClients max client that this client can hold
     * @param {String} hostSocketID socket ID of host to connect to
     * 
     * @returns {Boolean} whether the node was successfully added to the tree or not
     */
    addNode(socketID, maxClients, hostSocketID) {
        var nodeQueue = new Queue();
        nodeQueue.enqueue(this);

        while(!nodeQueue.isEmpty()) {
            var currNode = nodeQueue.dequeue();
            if(currNode.node.socketID === hostSocketID) {
                // check if this node is trying to reconnect due to fallen host
                var isTransferringNode = this.checkTransferring(socketID);
                if(isTransferringNode !== null) {
                    currNode.subNodes.push(isTransferringNode);
                    this.transferringNodes.splice(this.transferringNodes.indexOf(isTransferringNode), 1);
                    return true;
                }
                
                // new node joining the tree
                currNode.subNodes.push(new networkTree(socketID, maxClients));
                return true;
            }

            for(var i = 0; i < currNode.subNodes.length; i++) {
                nodeQueue.enqueue(currNode.subNodes[i]);
            }
        }

        return false;
    }

    /**
     * @returns {networkNode[]} array of possible hosts in order of preference
     */
    getConnectableNodes() {
        if(this.subNodes.length === 0) { return [this.node]; }
        
        // list of networkNode that can accept clients in 
        // order of preference
        var hostPool = [];

        var openNodes = 0;
        var nodeQueue = new Queue();
        nodeQueue.enqueue(this);

        while(!nodeQueue.isEmpty()) {
            var currNode = nodeQueue.dequeue();

            if(currNode.hasSpace()) {
                hostPool.push(currNode.node);
                openNodes++;
            }
            
            for(var i = 0; i < currNode.subNodes.length; i++) {
                nodeQueue.enqueue(currNode.subNodes[i]);
            }
        }

        return hostPool;
    }
}

module.exports.networkTree = networkTree;
