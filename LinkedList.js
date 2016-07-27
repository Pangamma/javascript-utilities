//-----------------------------------------------------------------------------
//  L I N K E D _ L I S T
//-----------------------------------------------------------------------------
// Created by Taylor Love
// For the purpose of handling log entries, though this may be used in other
// places as well. 
 
 
function LinkedList() {
    this.__head = null;
    this.__tail = null;
    this.__size = 0;
};
 

LinkedList.Node = function (dataObj) {
    this.next = null;
    this.prev = null;
    this.data = dataObj;
    this.timeCreated = new Date();
}
 
 
LinkedList.prototype.getSize = function () { return this.__size; }

/* False if size is greater than zero.*/
LinkedList.prototype.isEmpty = function () {
    return this.__size <= 0; 
}
 
 
//-----------------------  __removeNode() ---------------------------------------
/*  Removes a SINGLE node if given a reference to that node that is in the queue.
    Handles head and tail cases as well as regular cases. prev -> x <- next
    Decreases the size as well. Returns the data of the node or NULL if the data
    could not be fetched. 
*/
LinkedList.prototype.__removeNode = function (node) {
    if (undefined === node || null === node || this.__size === 0) { return null; }
 
    var prev = node.prev;
    var next = node.next;
    if (null !== node.prev) {       // NOT the head
        node.prev.next = next;      // Connect prev's next to node's next.
    } else {
        this.__head = next;           // Next pointer assigned to HEAD instead.
    }
    if (null !== node.next) {       // NOT the tail
        node.next.prev = prev;      // Connect next's prev to node's next.
    } else {
        this.__tail = prev;       // prev pointer assigned to TAIL instead.
    }
    this.__size--;
    if (node.data !== null && node.data !== undefined) { return node.data; }
    else { return null; }
}


//---------------------------- removeLast() -----------------------------------
/*  Removes the last entry in the list and then returns its data to the caller
    of this method. If not available, null will be returned.
*/
LinkedList.prototype.removeLast = function () {
    return this.__removeNode(this.__tail);
}


//---------------------------- removeFirst() -----------------------------------
/*  Removes the first entry in the list and then returns its data to the caller
    of this method. If not available, null will be returned.
*/
LinkedList.prototype.removeFirst = function () {
    return this.__removeNode(this.__head);
}
 
 
//-----------------------  addFirst (DataEntry) -------------------------------
/*  Adds a new nodeEntry to the beginning of the Queue DataStructure. 
*/
LinkedList.prototype.addFirst = function (entry) {
    var node = new LinkedList.Node(entry);
    if (this.__size == 0) {           // Special Case: No head or tail.
        this.__head = node;
        this.__tail = node;
    } else if (this.__size == 1) {    // Special Case: Tail and Head are the same right now.
        var h = this.__head;      // Temp ptr
        node.next = h;          // have new node point to old head
        h.prev = node;          // have head point to new node
        this.__head = node;       // point head to the new node.
        this.__tail.prev = node;  // Handle the tail special case.
    } else {    // Normal
        var h = this.__head;      // Temp ptr
        node.next = h;          // have new node point to old head
        h.prev = node;          // have head point to new node
        this.__head = node;       // point head to the new node.
    }
    this.__size++;
}
 
 
//-----------------------  addLast (DataEntry) -------------------------------
/*  Adds a new nodeEntry to the end of the Queue DataStructure. 
*/
LinkedList.prototype.addLast = function (entry) {
    var node = new LinkedList.Node(entry);
    if (this.__size == 0) {           // Special Case: No head or tail.
        this.__head = node;
        this.__tail = node;
    } else if (this.__size == 1) {    // Special Case: Tail and Head are the same right now.
        var h = this.__head;      // Temp ptr
        node.next = h;          // have new node point to old head
        h.prev = node;          // have head point to new node
        this.__head = node;       // point head to the new node.
        this.__tail.prev = node;  // Handle the tail special case.
    } else {    // Normal
        var t = this.__tail;      // Temp ptr
        node.prev = t;          // have new node point to old head
        t.next = node;          // have head point to new node
        this.__tail = node;       // point head to the new node.
    }
    this.__size++;
}


//-----------------------  push (DataEntry) -------------------------------
/*  Adds a new nodeEntry to the beginning of the Queue DataStructure. 
    This is an alias of addFirst. 
*/
LinkedList.prototype.push = function (entry) {
    this.addFirst(entry);
}
 
 
//-----------------------  addSortedByValue (DataEntry, valueKey) -------------
/*  Adds a new nodeEntry to the Queue DataStructure where the dataEntry[valueKey]
    is in order. Lowest values to the front of the list. 
*/
LinkedList.prototype.addSortedByValue = function (entry, key) {
    if (this.__size > 1) {    // Normal
        var temp = new LinkedList.Node(entry);
        var curr = this.__head;
        // Insert at the very beginning?
        if (temp.data[key] <= this.__head.data[key]) {
            temp.next = this.__head;
            this.__head.prev = temp;
            this.__head = temp;
            this.__size++;
            return;
        }
 
 
        // Insert somewhere in between. 
        while (curr.next != null) {
            // insert before last node
            if (temp.data[key] <= curr.data[key]) {
                curr.prev.next = temp;
                temp.prev = curr.prev;
                temp.next = curr;
                curr.prev = temp;
                this.__size++;
                return;
            }
            curr = curr.next;
        }
        // curr->next = null
        // insert last node
        curr.next = temp;
        temp.prev = curr;
        this.__tail = temp;
        this.__size++;
    } else {
        this.addFirst(entry);
    }
}
 
 
//------------------------- each (callback) -----------------------------------
/*  Runs callback for each element in the list. Starts with the head (index 0)
    and iterates to the tail (index size-1). The data for each node will be 
    passed into the callback function. 
*/
LinkedList.prototype.each = function (callback) {
 
    if (typeof (callback) !== "function") {
        if (undefined !== Logger) {
            Logger.ERROR("foreach: callback was not valid.");
        } else if (undefined !== console) {
            console.log("foreach: callback was not valid.");
        }
    }
 
    var a = this.__head;
    while (null !== a) {
        if (a.data != null) {
            callback(a.data);
        }
        a = a.next;
    }
}
 
 
//------------------------- eachReverse (callback) ----------------------------
/*  Runs callback for each element in the list. Starts with the tail 
    (index size-1) and iterates to the head (index 0). The data for each node 
    will be passed into the callback function. 
*/
LinkedList.prototype.eachReverse = function (callback) {
 
    if (typeof (callback) !== "function") {
        if (undefined !== Logger) {
            Logger.ERROR("foreach: callback was not valid.");
        } else if (undefined !== console) {
            console.log("foreach: callback was not valid.");
        }
    }
 
    var a = this.__tail;
    while (null !== a) {
        if (a.data != null) {
            callback(a.data);
        }
        a = a.prev;
    }
}
