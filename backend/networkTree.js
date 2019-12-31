class Queue {

    constructor() { this.list = []; }

    isEmpty() { return this.list.length === 0; }
    enqueue(elem) { this.list.push(elem); }
    dequeue() { if(!this.isEmpty()) { return this.list.shift(); } }
}

class NetworkNode {
    constructor(socketID, maxClients) {
        this.socketID = socketID;
        this.maxClients = maxClients;
    }
}

class NetworkTree {

    constructor(socketID, maxClients) {
        this.node = new NetworkNode(socketID, maxClients);
        this.childNodes = [];
        this.reconnectingNodes = []; // nodes (& their children) which are in process of reconnecting
    }

    hasSpace() { return this.childNodes.length < this.node.maxClients; }

    /**
     * Check if the client is joining the network back from a previous failure or 
     * if it is a new client. If joining back, return the reference to the saved tree in
     * transferring nodes list with same socket id.
     * 
     * @param {String} socketID socket id of the connecting client
     * @returns {NetworkTree} the saved tree in transferring nodes list with same socket id at the root node
     */
    isReconnecting(socketID) {
        for(var i = 0; i < this.reconnectingNodes.length; i++) {
            if(socketID === this.reconnectingNodes[i].node.socketID) {
                return this.reconnectingNodes[i];
            }
        }

        return null;
    }

    /**
     * Update nodes that their parent node is leaving and they need to reconnect to a new node in network
     * The children (and their childNodes) are added to this.transferring nodes until they they 
     * join the tree again and are availible for new peers to connect
     * 
     * @param {SocketIO.Server} socket Socket to notify children of leaving node about disconnection
     * @param {NetworkTree} node Node that has been removed from the tree
     * @param {String} room Room in which this node (and its children) exist
     */
    notifyChildren(socket, node, room, root) {
        var socketIDs = [];
        for(var i = 0; i < node.childNodes.length; i++) {
            socketIDs.push(node.childNodes[i].node.socketID);
            root.reconnectingNodes.push(node.childNodes[i]);
        }

        if(socketIDs.length > 0) { socket.to(room).emit("reconnect", { socketIDs: socketIDs }); }
    }

    /**
     * 
     * @param {SocketIO.Server} socket Socket to notify children of leaving node about disconnection
     * @param {String} socketID socketID of node that is leaving the tree
     */
    removeNode(socket, socketID, room, root) {
        if(this.childNodes.length === 0) { return; }

        for(var i = 0; i < this.childNodes.length; i++) {
            if(this.childNodes[i].node.socketID === socketID) {
                this.notifyChildren(socket, this.childNodes.splice(i, 1)[0], room, root);
                return;
            }

            this.childNodes[i].removeNode(socket, socketID, room, root);
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
        const nodeQueue = new Queue();
        nodeQueue.enqueue(this);

        var currNode;
        while(!nodeQueue.isEmpty()) {
            currNode = nodeQueue.dequeue();
            if(currNode.node.socketID === hostSocketID) {
                // check if this node is trying to reconnect due to fallen host
                const reconnectingNode = this.isReconnecting(socketID);
                if(reconnectingNode !== null) {
                    currNode.childNodes.push(reconnectingNode);
                    this.reconnectingNodes.splice(this.reconnectingNodes.indexOf(reconnectingNode), 1);
                    return true;
                }
                
                // new node joining the tree
                currNode.childNodes.push(new NetworkTree(socketID, maxClients));
                return true;
            }

            for(var i = 0; i < currNode.childNodes.length; i++) {
                nodeQueue.enqueue(currNode.childNodes[i]);
            }
        }

        return false;
    }

    /**
     * @returns {NetworkNode[]} array of possible hosts in order of preference
     */
    getConnectableNodes() {
        if(this.childNodes.length === 0) { return [this.node]; }
        
        // list of networkNode that can accept clients in 
        // order of preference
        const hostPool = [];

        const nodeQueue = new Queue();
        nodeQueue.enqueue(this);

        while(!nodeQueue.isEmpty()) {
            var currNode = nodeQueue.dequeue();

            if(currNode.hasSpace()) { hostPool.push(currNode.node); }
            
            for(var i = 0; i < currNode.childNodes.length; i++) {
                nodeQueue.enqueue(currNode.childNodes[i]);
            }
        }

        return hostPool;
    }
}

module.exports.NetworkTree = NetworkTree;
