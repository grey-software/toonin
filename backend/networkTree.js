class Queue {

    constructor() { this.list = []; }

    isEmpty() { return this.list.length === 0; }
    enqueue(elem) { this.list.push(elem); }
    dequeue() {
        if(!this.isEmpty()) {
            return this.list.shift();
        }
    }
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
    }

    hasSpace() { return this.subNodes.length < this.node.maxClients; }

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

        // What to do in this case? Prefer host or leaf?
        // Leaf seems safer because overloading host would 
        // degrade experience for all the clients in the room
        // if(openNodes === 0) { return hostPool; }

        return hostPool;
    }
}

module.exports.networkTree = networkTree;
