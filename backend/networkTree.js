

class networkTree {

    networkTree(socketID, maxClients) {
        this.socketID = socketID;
        this.maxClients = maxClients;
        this.subNodes = [];
    }

    getDistFromRoot(node) {
        if(node.subNodes === []) { return 0; }
    }

    addNode(socketID, maxClients) {
        if(this.subNodes.length < this.maxClients) {
            // add new client to the network tree
            this.subNodes.push(new networkTree(socketID, maxClients));
            return true;
        }

        // create a list of nodes with available connections sorted based on dist to root
        var lowest = Number.MAX_VALUE;
        var lowestIndex = -1;
        for(var i = 0; i < this.subNodes.length; i++) {
            var distToRoot = this.getDistFromRoot(this.subNodes[i]);
            if(distToRoot <= lowest) {
                lowestIndex = i;
                lowest = distToRoot;
            }
        }

        return false;
    }
}

var n = new networkTree('123');
