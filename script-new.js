/**
 * Ultimate Linked List Visualizer Engine
 * Focus: Smooth animations, step-by-step execution, absolute positioning.
 */

// ==========================================
// VISUALIZATION CLASSES
// ==========================================

class NodeVisual {
    constructor(id, value, x, y) {
        this.id = id;
        this.value = value;
        this.x = x;
        this.y = y;
        this.address = '0x' + Math.floor(Math.random() * 16777215).toString(16).toUpperCase().substring(0, 3); // Pseudo-address
        this.element = this.createDOM();
        this.updatePosition();
    }

    createDOM() {
        const el = document.createElement('div');
        el.className = 'node new';
        el.id = `node-${this.id}`;

        const addrSpan = document.createElement('span');
        addrSpan.className = 'node-addr';
        addrSpan.textContent = this.address;
        el.appendChild(addrSpan);

        const valSpan = document.createElement('span');
        valSpan.className = 'node-data';
        valSpan.textContent = this.value;
        el.appendChild(valSpan);

        const idxSpan = document.createElement('span');
        idxSpan.className = 'node-idx';
        idxSpan.textContent = `Idx: ?`;
        el.appendChild(idxSpan);

        document.getElementById('nodeLayer').appendChild(el);
        setTimeout(() => el.classList.remove('new'), 500);
        return el;
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;
        this.updatePosition();
    }

    updatePosition() {
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }

    highlight(type = 'highlight') {
        this.element.classList.add(type);
    }

    unhighlight() {
        this.element.classList.remove('highlight', 'new', 'found', 'danger');
    }

    remove() {
        this.element.style.transform = `translate(${this.x}px, ${this.y + 100}px)`;
        this.element.style.opacity = '0';
        setTimeout(() => this.element.remove(), 500);
    }
}

class ArrowVisual {
    constructor(id, fromNode, toNode, type = 'next') {
        this.id = id;
        this.fromNode = fromNode;
        this.toNode = toNode;
        this.type = type; // 'next', 'prev', 'circular'
        this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.path.id = `arrow-${id}`;
        this.path.setAttribute('marker-end', 'url(#arrowhead)');
        document.getElementById('svgLayer').appendChild(this.path);
        this.update();
    }

    update() {
        if (!this.fromNode || !this.toNode) return;

        const x1 = this.fromNode.x;
        const y1 = this.fromNode.y;
        const x2 = this.toNode.x;
        const y2 = this.toNode.y;

        // Calculate path based on type
        let d = '';
        if (this.type === 'next') {
            this.path.style.stroke = 'var(--primary)'; // Blue
            // Always curve UP for better separation
            const cx = (x1 + x2) / 2;
            const cy = Math.min(y1, y2) - 60; // Increased curve
            d = `M ${x1} ${y1 - 25} Q ${cx} ${cy} ${x2} ${y2 - 25}`;
        } else if (this.type === 'prev') {
            this.path.style.stroke = 'var(--warning)'; // Orange
            // Always curve DOWN
            const cx = (x1 + x2) / 2;
            const cy = Math.max(y1, y2) + 60; // Increased curve
            d = `M ${x1} ${y1 + 25} Q ${cx} ${cy} ${x2} ${y2 + 25}`;

            // Add a small offset to start/end points to prevent exact overlap with node border if needed
            // But for now, just ensure the curve is deep enough.
        } else if (this.type === 'circular') {
            this.path.style.stroke = 'var(--accent)'; // Purple
            // Long curve back
            const cx = (x1 + x2) / 2;
            const cy = y1 + 180;
            d = `M ${x1} ${y1 + 25} Q ${cx} ${cy} ${x2} ${y2 + 25}`;
        }

        this.path.setAttribute('d', d);
    }

    remove() {
        this.path.remove();
    }
}

class Visualizer {
    constructor() {
        this.nodes = new Map(); // id -> NodeVisual
        this.arrows = []; // Array of ArrowVisual
        this.nodeIdCounter = 0;
        this.setupSVG();
    }

    setupSVG() {
        const svg = document.getElementById('svgLayer');
        // Define marker
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.id = 'arrowhead';
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', '#94a3b8');

        marker.appendChild(polygon);
        defs.appendChild(marker);
        svg.appendChild(defs);
    }

    addNode(value, x, y, id = null) {
        const nodeId = id !== null ? id : this.nodeIdCounter++;
        const node = new NodeVisual(nodeId, value, x, y);
        this.nodes.set(nodeId, node);
        return node;
    }

    removeNode(id) {
        if (this.nodes.has(id)) {
            this.nodes.get(id).remove();
            this.nodes.delete(id);
        }
    }

    connect(fromId, toId, type = 'next') {
        const from = this.nodes.get(fromId);
        const to = this.nodes.get(toId);
        console.log(`Connecting: ${fromId} -> ${toId}, type: ${type}, from exists: ${!!from}, to exists: ${!!to}`);
        if (from && to) {
            const arrow = new ArrowVisual(`${fromId}-${toId}`, from, to, type);
            this.arrows.push(arrow);
            console.log(`Arrow created! Total arrows: ${this.arrows.length}`);
            return arrow;
        } else {
            console.warn(`Failed to connect! fromId: ${fromId}, toId: ${toId}, type: ${type}`);
        }
    }

    clearArrows() {
        this.arrows.forEach(a => a.remove());
        this.arrows = [];
    }

    getState() {
        // Snapshot current state
        return {
            nodes: Array.from(this.nodes.values()).map(n => ({
                id: n.id, value: n.value, x: n.x, y: n.y, address: n.address
            })),
            arrows: this.arrows.map(a => ({
                id: a.id, fromId: a.fromNode.id, toId: a.toNode.id, type: a.type
            })),
            counter: this.nodeIdCounter
        };
    }

    restoreState(state) {
        // Clear current
        this.nodes.forEach(n => n.element.remove());
        this.nodes.clear();
        this.clearArrows();

        // Restore nodes
        this.nodeIdCounter = state.counter;
        state.nodes.forEach(n => {
            const node = new NodeVisual(n.id, n.value, n.x, n.y);
            node.address = n.address;
            node.element.querySelector('.node-addr').textContent = n.address;
            this.nodes.set(n.id, node);
        });

        // Restore arrows
        state.arrows.forEach(a => {
            this.connect(a.fromId, a.toId, a.type);
        });
    }
}

class CppCodeGenerator {
    static generateInsertAtTail(listType) {
        if (listType === 'singly') {
            return `void insertAtTail(int value) {
    Node* newNode = new Node(value);
    
    if (head == nullptr) {
        head = tail = newNode;
        return;
    }
    
    tail->next = newNode;
    tail = newNode;
}`;
        } else if (listType === 'doubly') {
            return `void insertAtTail(int value) {
    Node* newNode = new Node(value);
    
    if (head == nullptr) {
        head = tail = newNode;
        return;
    }
    
    tail->next = newNode;
    newNode->prev = tail;
    tail = newNode;
}`;
        } else if (listType === 'circular') {
            return `void insertAtTail(int value) {
    Node* newNode = new Node(value);
    
    if (head == nullptr) {
        head = tail = newNode;
        tail->next = head;
        return;
    }
    
    tail->next = newNode;
    tail = newNode;
    tail->next = head;
}`;
        }
    }

    static generateInsertAtHead(listType) {
        if (listType === 'singly') {
            return `void insertAtHead(int value) {
    Node* newNode = new Node(value);
    
    if (head == nullptr) {
        head = tail = newNode;
        return;
    }
    
    newNode->next = head;
    head = newNode;
}`;
        } else if (listType === 'doubly') {
            return `void insertAtHead(int value) {
    Node* newNode = new Node(value);
    
    if (head == nullptr) {
        head = tail = newNode;
        return;
    }
    
    newNode->next = head;
    head->prev = newNode;
    head = newNode;
}`;
        } else if (listType === 'circular') {
            return `void insertAtHead(int value) {
    Node* newNode = new Node(value);
    
    if (head == nullptr) {
        head = tail = newNode;
        tail->next = head;
        return;
    }
    
    newNode->next = head;
    head = newNode;
    tail->next = head;
}`;
        }
    }

    static generateInsertAtPosition(listType) {
        if (listType === 'singly') {
            return `void insertAtPosition(int value, int index) {
    if (index == 0) {
        insertAtHead(value);
        return;
    }
    
    Node* newNode = new Node(value);
    Node* current = head;
    
    for (int i = 0; i < index - 1; i++) {
        current = current->next;
    }
    
    newNode->next = current->next;
    current->next = newNode;
}`;
        } else if (listType === 'doubly') {
            return `void insertAtPosition(int value, int index) {
    if (index == 0) {
        insertAtHead(value);
        return;
    }
    
    Node* newNode = new Node(value);
    Node* current = head;
    
    for (int i = 0; i < index - 1; i++) {
        current = current->next;
    }
    
    newNode->next = current->next;
    newNode->prev = current;
    current->next->prev = newNode;
    current->next = newNode;
}`;
        } else {
            return `void insertAtPosition(int value, int index) {
    if (index == 0) {
        insertAtHead(value);
        return;
    }
    
    Node* newNode = new Node(value);
    Node* current = head;
    
    for (int i = 0; i < index - 1; i++) {
        current = current->next;
    }
    
    newNode->next = current->next;
    current->next = newNode;
}`;
        }
    }

    static generateDeleteAtHead(listType) {
        if (listType === 'singly') {
            return `void deleteAtHead() {
    if (head == nullptr) return;
    
    Node* temp = head;
    
    if (head == tail) {
        head = tail = nullptr;
    } else {
        head = head->next;
    }
    
    delete temp;
}`;
        } else if (listType === 'doubly') {
            return `void deleteAtHead() {
    if (head == nullptr) return;
    
    Node* temp = head;
    
    if (head == tail) {
        head = tail = nullptr;
    } else {
        head = head->next;
        head->prev = nullptr;
    }
    
    delete temp;
}`;
        } else if (listType === 'circular') {
            return `void deleteAtHead() {
    if (head == nullptr) return;
    
    Node* temp = head;
    
    if (head == tail) {
        head = tail = nullptr;
    } else {
        head = head->next;
        tail->next = head;
    }
    
    delete temp;
}`;
        }
    }

    static generateDeleteAtTail(listType) {
        if (listType === 'singly') {
            return `void deleteAtTail() {
    if (head == nullptr) return;
    if (head == tail) {
        deleteAtHead();
        return;
    }
    
    Node* current = head;
    while (current->next != tail) {
        current = current->next;
    }
    
    Node* temp = tail;
    tail = current;
    tail->next = nullptr;
    delete temp;
}`;
        } else if (listType === 'doubly') {
            return `void deleteAtTail() {
    if (head == nullptr) return;
    if (head == tail) {
        deleteAtHead();
        return;
    }
    
    Node* temp = tail;
    tail = tail->prev;
    tail->next = nullptr;
    delete temp;
}`;
        } else if (listType === 'circular') {
            return `void deleteAtTail() {
    if (head == nullptr) return;
    if (head == tail) {
        deleteAtHead();
        return;
    }
    
    Node* current = head;
    while (current->next != tail) {
        current = current->next;
    }
    
    Node* temp = tail;
    tail = current;
    tail->next = head;
    delete temp;
}`;
        }
    }

    static generateDeleteAtPosition(listType) {
        if (listType === 'singly') {
            return `void deleteAtPosition(int index) {
    if (index == 0) {
        deleteAtHead();
        return;
    }
    
    Node* current = head;
    for (int i = 0; i < index - 1; i++) {
        current = current->next;
    }
    
    Node* toDelete = current->next;
    current->next = toDelete->next;
    delete toDelete;
}`;
        } else if (listType === 'doubly') {
            return `void deleteAtPosition(int index) {
    if (index == 0) {
        deleteAtHead();
        return;
    }
    
    Node* current = head;
    for (int i = 0; i < index - 1; i++) {
        current = current->next;
    }
    
    Node* toDelete = current->next;
    current->next = toDelete->next;
    toDelete->next->prev = current;
    delete toDelete;
}`;
        } else {
            return `void deleteAtPosition(int index) {
    if (index == 0) {
        deleteAtHead();
        return;
    }
    
    Node* current = head;
    for (int i = 0; i < index - 1; i++) {
        current = current->next;
    }
    
    Node* toDelete = current->next;
    current->next = toDelete->next;
    delete toDelete;
}`;
        }
    }

    static generateSearch(listType) {
        if (listType === 'circular') {
            return `int search(int value) {
    if (head == nullptr) return -1;
    
    Node* current = head;
    int index = 0;
    
    do {
        if (current->data == value) {
            return index;
        }
        current = current->next;
        index++;
    } while (current != head);
    
    return -1;
}`;
        } else {
            return `int search(int value) {
    Node* current = head;
    int index = 0;
    
    while (current != nullptr) {
        if (current->data == value) {
            return index;
        }
        current = current->next;
        index++;
    }
    
    return -1;
}`;
        }
    }

    static generateReverse(listType) {
        if (listType === 'singly') {
            return `void reverse() {
    Node* prev = nullptr;
    Node* current = head;
    Node* next = nullptr;
    
    tail = head;
    
    while (current != nullptr) {
        next = current->next;
        current->next = prev;
        prev = current;
        current = next;
    }
    
    head = prev;
}`;
        } else if (listType === 'doubly') {
            return `void reverse() {
    Node* current = head;
    Node* temp = nullptr;
    
    while (current != nullptr) {
        temp = current->prev;
        current->prev = current->next;
        current->next = temp;
        current = current->prev;
    }
    
    if (temp != nullptr) {
        tail = head;
        head = temp->prev;
    }
}`;
        } else if (listType === 'circular') {
            return `void reverse() {
    if (head == nullptr) return;
    
    Node* prev = nullptr;
    Node* current = head;
    Node* next = nullptr;
    Node* stopNode = head;
    
    do {
        next = current->next;
        current->next = prev;
        prev = current;
        current = next;
    } while (current != stopNode);
    
    tail = head;
    head = prev;
    tail->next = head;
}`;
        }
    }
}

class AnimationController {
    constructor() {
        this.queue = [];
        this.history = []; // State snapshots
        this.currentStep = -1;
        this.isPlaying = false;
        this.speed = 2000; // Much slower default for readability
        this.timer = null;
        this.isProcessing = false;
    }

    addStep(action, description, codeLine) {
        this.queue.push({ action, description, codeLine });
    }

    async play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        document.getElementById('btnPlay').textContent = '⏸';
        this.runLoop();
    }

    pause() {
        this.isPlaying = false;
        document.getElementById('btnPlay').textContent = '⏯';
        clearTimeout(this.timer);
    }

    async runLoop() {
        if (!this.isPlaying) return;
        if (this.currentStep < this.queue.length - 1) {
            await this.next();
            this.timer = setTimeout(() => this.runLoop(), this.speed);
        } else {
            this.pause();
            this.isProcessing = false; // Unlock when done
            app.toggleInputs(true);
        }
    }

    async next() {
        if (this.currentStep < this.queue.length - 1) {
            // Save state BEFORE executing
            this.history[this.currentStep + 1] = visualizer.getState();

            this.currentStep++;
            const step = this.queue[this.currentStep];
            this.updateUI(step);
            try {
                await step.action();
            } catch (e) {
                console.error("Animation Error:", e);
                this.pause();
                this.isProcessing = false;
                app.toggleInputs(true);
                alert("An error occurred. Resetting.");
            }
        }
    }

    async prev() {
        if (this.currentStep >= 0) {
            this.pause();
            // Restore state of the current step (which effectively undoes it to start of step)
            // Or restore state of previous step?
            // history[i] stores state BEFORE step i was executed.
            // So to undo step i, we restore history[i].

            const state = this.history[this.currentStep];
            if (state) {
                visualizer.restoreState(state);
                this.currentStep--;

                if (this.currentStep >= 0) {
                    const step = this.queue[this.currentStep];
                    this.updateUI(step);
                } else {
                    document.getElementById('explanationText').textContent = "Ready.";
                    document.getElementById('codeDisplay').textContent = "// Start";
                }
            }
        }
    }

    updateUI(step) {
        document.getElementById('explanationText').textContent = step.description;

        // Only update code display if not marked to preserve
        if (step.codeLine !== '/* PRESERVE_CODE */') {
            document.getElementById('codeDisplay').textContent = step.codeLine || '// Processing...';
        }

        // Update Variable Watch (Mockup logic for now, ideally passed in step)
        // We can parse description or have explicit var updates
        const vars = document.getElementById('varTable');
        vars.innerHTML = '';

        // Simple heuristic: if description mentions "head", show head
        // Real implementation would need step.vars
        if (app.list.head) this.addVar(vars, 'head', app.list.head.data);
        if (app.list.tail) this.addVar(vars, 'tail', app.list.tail.data);
    }

    addVar(container, name, val) {
        const n = document.createElement('div'); n.className = 'var-name'; n.textContent = name;
        const v = document.createElement('div'); v.className = 'var-value'; v.textContent = val;
        container.appendChild(n); container.appendChild(v);
    }
}

// ==========================================
// LOGICAL DATA STRUCTURES
// ==========================================

class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.prev = null; // For DLL
        this.id = -1; // Will be assigned by Visualizer
    }
}

class LinkedList {
    constructor(type) {
        this.head = null;
        this.tail = null;
        this.size = 0;
        this.type = type; // 'singly', 'doubly', 'circular'
    }

    getCoords(index) {
        const startX = 100;
        const startY = 300;
        const gap = 150;
        return { x: startX + (index * gap), y: startY };
    }

    async reLayout() {
        anim.addStep(
            async () => {
                // Clean up any residual highlights
                visualizer.nodes.forEach(n => n.unhighlight());

                let current = this.head;
                let index = 0;
                const moves = [];
                const visited = new Set();

                while (current) {
                    if (visited.has(current)) break;
                    visited.add(current);

                    if (current.id !== -1) {
                        const coords = this.getCoords(index);
                        const nodeVisual = visualizer.nodes.get(current.id);
                        if (nodeVisual) {
                            moves.push({ node: nodeVisual, x: coords.x, y: coords.y });
                            // Update visual index label if needed
                            const idxSpan = nodeVisual.element.querySelector('.node-idx');
                            if (idxSpan) idxSpan.textContent = `Idx: ${index}`;
                        }
                    }
                    current = current.next;
                    index++;
                }

                moves.forEach(m => m.node.moveTo(m.x, m.y));
                visualizer.arrows.forEach(a => a.update());
            },
            "Adjusting node positions...",
            "/* PRESERVE_CODE */"
        );
    }

    async insertAtTail(value) {
        const newNode = new Node(value);
        const currentSize = this.size; // Capture current size for animation

        // Pre-assign ID so subsequent operations (like random generation) know it immediately
        newNode.id = visualizer.nodeIdCounter++;

        anim.addStep(
            async () => {
                const coords = this.getCoords(currentSize);
                // Pass the pre-assigned ID
                const vNode = visualizer.addNode(value, coords.x, coords.y - 100, newNode.id);

                // Set index immediately
                const idxSpan = vNode.element.querySelector('.node-idx');
                if (idxSpan) idxSpan.textContent = `Idx: ${currentSize}`;

                setTimeout(() => vNode.moveTo(coords.x, coords.y), 50);
            },
            `Creating new node ${value}`,
            'Node* newNode = new Node(value);'
        );

        if (!this.head) {
            this.head = this.tail = newNode;
            anim.addStep(async () => { }, "List empty, new node is Head & Tail", "head = tail = newNode;");

            if (this.type === 'circular') {
                anim.addStep(
                    async () => { visualizer.connect(newNode.id, newNode.id, 'circular'); },
                    "Self-loop for circular list",
                    "tail->next = head;"
                );
            }
        } else {
            const oldTail = this.tail;

            // If circular, remove the old circular arrow FIRST
            if (this.type === 'circular') {
                anim.addStep(
                    async () => {
                        visualizer.arrows = visualizer.arrows.filter(a => {
                            if (a.type === 'circular') {
                                a.remove();
                                return false;
                            }
                            return true;
                        });
                    },
                    "Removing old circular link",
                    ""
                );
            }

            anim.addStep(
                async () => { visualizer.connect(oldTail.id, newNode.id, 'next'); },
                "Linking Tail to New Node",
                "tail->next = newNode;"
            );

            if (this.type === 'doubly') {
                anim.addStep(
                    async () => { visualizer.connect(newNode.id, oldTail.id, 'prev'); },
                    "Linking New Node back to Tail",
                    "newNode->prev = tail;"
                );
                newNode.prev = oldTail;
            }

            oldTail.next = newNode;
            this.tail = newNode;

            if (this.type === 'circular') {
                anim.addStep(
                    async () => { visualizer.connect(newNode.id, this.head.id, 'circular'); },
                    "Updating Circular Link",
                    "tail->next = head;"
                );
            }
        }
        this.size++;

        // Add final step to show complete C++ code
        anim.addStep(
            async () => { },
            "Operation complete! Review the full C++ implementation.",
            CppCodeGenerator.generateInsertAtTail(this.type)
        );

        anim.play();
    }

    async insertAtHead(value) {
        const newNode = new Node(value);

        // Pre-assign ID so subsequent operations know it immediately
        newNode.id = visualizer.nodeIdCounter++;

        anim.addStep(
            async () => {
                const coords = this.getCoords(0);
                // Pass the pre-assigned ID
                const vNode = visualizer.addNode(value, coords.x - 150, coords.y, newNode.id);
            },
            `Creating new Head node ${value}`,
            "Node* newNode = new Node(value);"
        );

        if (!this.head) {
            this.head = this.tail = newNode;
            if (this.type === 'circular') {
                anim.addStep(
                    async () => { visualizer.connect(newNode.id, newNode.id, 'circular'); },
                    "Self-loop",
                    "tail->next = head;"
                );
            }
        } else {
            const oldHead = this.head;

            // If circular, remove the old circular arrow
            if (this.type === 'circular') {
                anim.addStep(
                    async () => {
                        visualizer.arrows = visualizer.arrows.filter(a => {
                            if (a.type === 'circular') {
                                a.remove();
                                return false;
                            }
                            return true;
                        });
                    },
                    "Removing old circular link",
                    ""
                );
            }

            anim.addStep(
                async () => { visualizer.connect(newNode.id, oldHead.id, 'next'); },
                "Linking New Node to Old Head",
                "newNode->next = head;"
            );

            if (this.type === 'doubly') {
                anim.addStep(
                    async () => { visualizer.connect(oldHead.id, newNode.id, 'prev'); },
                    "Linking Old Head back to New Node",
                    "head->prev = newNode;"
                );
                oldHead.prev = newNode;
            }

            newNode.next = oldHead;
            this.head = newNode;

            if (this.type === 'circular') {
                anim.addStep(
                    async () => { visualizer.connect(this.tail.id, newNode.id, 'circular'); },
                    "Updating Tail -> New Head",
                    "tail->next = head;"
                );
            }
        }

        this.size++;
        await this.reLayout();

        // Add final step to show complete C++ code AFTER reLayout
        anim.addStep(
            async () => { },
            "Operation complete! Review the full C++ implementation.",
            CppCodeGenerator.generateInsertAtHead(this.type)
        );

        anim.play();
    }

    async insertAtPosition(value, index) {
        if (index < 0 || index > this.size) return alert("Invalid Index");
        if (index === 0) return this.insertAtHead(value);
        if (index === this.size) return this.insertAtTail(value);

        const newNode = new Node(value);

        let current = this.head;
        for (let i = 0; i < index - 1; i++) current = current.next;

        anim.addStep(
            async () => {
                const vNode = visualizer.nodes.get(current.id);
                vNode.highlight();
                const coords = this.getCoords(index);
                const newV = visualizer.addNode(value, coords.x, coords.y - 100);
                newNode.id = newV.id;
            },
            `Found predecessor at index ${index - 1}`,
            "Node* current = head; ... while loop"
        );

        const nextNode = current.next;

        anim.addStep(
            async () => { visualizer.connect(newNode.id, nextNode.id, 'next'); },
            "Linking New Node to Next Node",
            "newNode->next = current->next;"
        );

        if (this.type === 'doubly') {
            anim.addStep(
                async () => {
                    // Remove old prev arrow from nextNode
                    visualizer.arrows = visualizer.arrows.filter(a => {
                        if (a.fromNode.id === nextNode.id && a.type === 'prev') {
                            a.remove();
                            return false;
                        }
                        return true;
                    });
                    visualizer.connect(nextNode.id, newNode.id, 'prev');
                },
                "Linking Next Node back to New Node",
                "next->prev = newNode;"
            );
            nextNode.prev = newNode;

            anim.addStep(
                async () => { visualizer.connect(newNode.id, current.id, 'prev'); },
                "Linking New Node back to Current",
                "newNode->prev = current;"
            );
            newNode.prev = current;
        }

        anim.addStep(
            async () => {
                // Remove old next arrow from current
                visualizer.arrows = visualizer.arrows.filter(a => {
                    if (a.fromNode.id === current.id && a.type === 'next') {
                        a.remove();
                        return false;
                    }
                    return true;
                });
                visualizer.connect(current.id, newNode.id, 'next');
            },
            "Linking Current to New Node",
            "current->next = newNode;"
        );

        newNode.next = nextNode;
        current.next = newNode;

        this.size++;
        await this.reLayout();

        // Add final step to show complete C++ code AFTER reLayout
        anim.addStep(
            async () => { },
            "Operation complete! Review the full C++ implementation.",
            CppCodeGenerator.generateInsertAtPosition(this.type)
        );

        anim.play();
    }

    async deleteAtHead() {
        if (!this.head) return;
        const oldHead = this.head;

        anim.addStep(
            async () => { visualizer.nodes.get(oldHead.id).highlight('danger'); },
            "Marking Head for deletion",
            "Node* temp = head;"
        );

        if (this.head === this.tail) {
            this.head = this.tail = null;
        } else {
            this.head = this.head.next;
            if (this.type === 'doubly') this.head.prev = null;
        }

        anim.addStep(
            async () => {
                visualizer.removeNode(oldHead.id);
                visualizer.arrows = visualizer.arrows.filter(a => {
                    if (a.fromNode.id === oldHead.id || a.toNode.id === oldHead.id) {
                        a.remove();
                        return false;
                    }
                    return true;
                });
                if (this.type === 'circular' && this.head) {
                    visualizer.connect(this.tail.id, this.head.id, 'circular');
                }
            },
            "Removing Head node",
            "delete temp;"
        );

        this.size--;
        await this.reLayout();

        // Add final step to show complete C++ code AFTER reLayout
        anim.addStep(
            async () => { },
            "Operation complete! Review the full C++ implementation.",
            CppCodeGenerator.generateDeleteAtHead(this.type)
        );

        anim.play();
    }

    async deleteAtTail() {
        if (!this.head) return;
        if (this.head === this.tail) return this.deleteAtHead();

        let current = this.head;
        while (current.next !== this.tail) current = current.next;
        const oldTail = this.tail;

        anim.addStep(
            async () => { visualizer.nodes.get(oldTail.id).highlight('danger'); },
            "Marking Tail for deletion",
            "Node* temp = tail;"
        );

        this.tail = current;
        this.tail.next = null;
        if (this.type === 'circular') this.tail.next = this.head;

        anim.addStep(
            async () => {
                visualizer.removeNode(oldTail.id);
                visualizer.arrows = visualizer.arrows.filter(a => {
                    if (a.fromNode.id === oldTail.id || a.toNode.id === oldTail.id) {
                        a.remove();
                        return false;
                    }
                    return true;
                });
                if (this.type === 'circular') {
                    visualizer.connect(this.tail.id, this.head.id, 'circular');
                }
            },
            "Removing Tail node",
            "delete temp;"
        );

        this.size--;
        await this.reLayout();

        // Add final step to show complete C++ code AFTER reLayout
        anim.addStep(
            async () => { },
            "Operation complete! Review the full C++ implementation.",
            CppCodeGenerator.generateDeleteAtTail(this.type)
        );

        anim.play();
    }

    async deleteAtPosition(index) {
        if (index < 0 || index >= this.size) return alert("Invalid Index");
        if (index === 0) return this.deleteAtHead();
        if (index === this.size - 1) return this.deleteAtTail();

        let current = this.head;
        for (let i = 0; i < index - 1; i++) current = current.next;
        const toDelete = current.next;

        anim.addStep(
            async () => { visualizer.nodes.get(toDelete.id).highlight('danger'); },
            `Marking node at ${index} for deletion`,
            "Node* toDelete = current->next;"
        );

        current.next = toDelete.next;
        if (this.type === 'doubly') {
            toDelete.next.prev = current;
        }

        anim.addStep(
            async () => {
                visualizer.removeNode(toDelete.id);
                visualizer.arrows = visualizer.arrows.filter(a => {
                    if (a.fromNode.id === toDelete.id || a.toNode.id === toDelete.id) {
                        a.remove();
                        return false;
                    }
                    return true;
                });

                visualizer.connect(current.id, current.next.id, 'next');
                if (this.type === 'doubly') {
                    visualizer.connect(current.next.id, current.id, 'prev');
                }
            },
            "Removing node and relinking",
            "current->next = toDelete->next;"
        );

        this.size--;
        await this.reLayout();

        // Add final step to show complete C++ code AFTER reLayout
        anim.addStep(
            async () => { },
            "Operation complete! Review the full C++ implementation.",
            CppCodeGenerator.generateDeleteAtPosition(this.type)
        );

        anim.play();
    }

    async search(value) {
        let current = this.head;
        let index = 0;
        let found = false;

        while (current) {
            const nodeId = current.id;
            const idx = index;
            const val = current.data;

            anim.addStep(
                async () => {
                    const vNode = visualizer.nodes.get(nodeId);
                    vNode.highlight('highlight');
                },
                `Checking index ${idx}: Is ${val} == ${value}?`,
                "if (current->data == value)..."
            );

            if (current.data == value) {
                anim.addStep(
                    async () => { visualizer.nodes.get(nodeId).highlight('new'); },
                    "Found it!",
                    "return index;"
                );
                found = true;
                break;
            }

            anim.addStep(
                async () => { visualizer.nodes.get(nodeId).unhighlight(); },
                "Not found, moving next",
                "current = current->next;"
            );

            current = current.next;
            index++;
            if (current === this.head) break;
        }

        if (!found) {
            anim.addStep(async () => { }, "Value not found in list.", "return -1;");
        }

        // Add final step to show complete C++ code
        anim.addStep(
            async () => { },
            "Operation complete! Review the full C++ implementation.",
            CppCodeGenerator.generateSearch(this.type)
        );

        anim.play();
    }

    async reverse() {
        if (!this.head || this.head.next === null) return;

        if (this.type === 'singly' || this.type === 'circular') {
            // ... existing singly logic ...
            let prev = null;
            let current = this.head;
            let next = null;

            const isCircular = (this.type === 'circular');
            let stopNode = null;
            if (isCircular) stopNode = this.head;

            // If circular, remove the circular arrow first
            if (isCircular) {
                anim.addStep(
                    async () => {
                        visualizer.arrows = visualizer.arrows.filter(a => {
                            if (a.type === 'circular') {
                                a.remove();
                                return false;
                            }
                            return true;
                        });
                    },
                    "Removing circular link before reverse",
                    ""
                );
            }

            do {
                const currId = current.id;
                const prevId = prev ? prev.id : null;

                anim.addStep(
                    async () => {
                        const vNode = visualizer.nodes.get(currId);
                        vNode.highlight();
                    },
                    "Processing node...",
                    "next = current->next;"
                );

                next = current.next;
                current.next = prev;

                const targetId = prevId;
                anim.addStep(
                    async () => {
                        // Remove outgoing 'next' arrow
                        visualizer.arrows = visualizer.arrows.filter(a => {
                            if (a.fromNode.id === currId && a.type === 'next') {
                                a.remove();
                                return false;
                            }
                            return true;
                        });
                        if (targetId !== null) {
                            visualizer.connect(currId, targetId, 'next');
                        }
                    },
                    "Flipping pointer",
                    "current->next = prev;"
                );

                prev = current;
                current = next;
            } while (current !== stopNode && current !== null);

            this.tail = this.head;
            this.head = prev;

            if (isCircular) {
                this.tail.next = this.head;
                anim.addStep(
                    async () => {
                        visualizer.connect(this.tail.id, this.head.id, 'circular');
                    },
                    "Restoring circular link",
                    "tail->next = head;"
                );
            }

        } else if (this.type === 'doubly') {
            let current = this.head;
            let temp = null;

            while (current) {
                // Capture state for closure
                const node = current;
                const nodeId = node.id;

                anim.addStep(
                    async () => { visualizer.nodes.get(nodeId).highlight(); },
                    "Swapping prev and next pointers",
                    "temp = current->prev; current->prev = current->next; current->next = temp;"
                );

                temp = current.prev;
                current.prev = current.next;
                current.next = temp;

                // Capture new connections
                const newNext = current.next;
                const newPrev = current.prev;

                anim.addStep(
                    async () => {
                        // Remove ONLY outgoing arrows from this node
                        visualizer.arrows = visualizer.arrows.filter(a => {
                            if (a.fromNode.id === nodeId) {
                                a.remove();
                                return false;
                            }
                            return true;
                        });

                        // Redraw based on new state
                        if (newNext) visualizer.connect(nodeId, newNext.id, 'next');
                        if (newPrev) visualizer.connect(nodeId, newPrev.id, 'prev');

                        // Also need to ensure incoming arrows from neighbors are preserved/redrawn?
                        // Actually, since we iterate through ALL nodes, every node will redraw its outgoing arrows.
                        // But 'prev' arrows are outgoing from 'current' to 'prev'.
                        // So if we redraw both next and prev for every node, we cover everything.
                    },
                    "Pointers swapped",
                    ""
                );

                current = current.prev; // Move to next (which is now prev)
            }

            if (temp) {
                this.tail = this.head;
                this.head = temp.prev;
            }
        }

        await this.reLayout();

        // Add final step to show complete C++ code AFTER reLayout
        anim.addStep(
            async () => { },
            "Operation complete! Review the full C++ implementation.",
            CppCodeGenerator.generateReverse(this.type)
        );

        anim.play();
    }
}

// ==========================================
// MAIN APP CONTROLLER
// ==========================================

class App {
    constructor() {
        this.list = new LinkedList('singly');
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('listType').addEventListener('change', (e) => {
            this.setListType(e.target.value);
        });

        document.getElementById('btnPlay').addEventListener('click', () => {
            if (anim.isPlaying) anim.pause();
            else anim.play();
        });
        document.getElementById('btnNext').addEventListener('click', () => anim.next());
        document.getElementById('btnPrev').addEventListener('click', () => anim.prev());

        document.getElementById('speedSlider').addEventListener('input', (e) => {
            // Slider: 1 = fastest (500ms), 5 = slowest (3000ms)
            const speeds = [500, 1000, 2000, 2500, 3000];
            anim.speed = speeds[e.target.value - 1];
        });
    }

    setListType(type) {
        this.list = new LinkedList(type);
        visualizer.nodes.clear();
        visualizer.clearArrows();
        document.getElementById('nodeLayer').innerHTML = '';
        document.getElementById('svgLayer').innerHTML = '';
        visualizer.setupSVG();
        visualizer.nodeIdCounter = 0;
    }

    toggleInputs(enable) {
        const buttons = document.querySelectorAll('button');
        const inputs = document.querySelectorAll('input');
        buttons.forEach(b => {
            if (b.id !== 'btnPlay' && b.id !== 'btnNext' && b.id !== 'btnPrev') {
                b.disabled = !enable;
            }
        });
        inputs.forEach(i => i.disabled = !enable);
    }

    startOp() {
        if (anim.isProcessing) return false;
        anim.isProcessing = true;
        anim.queue = []; // Clear previous queue
        anim.currentStep = -1;

        // Reset code display for new operation
        document.getElementById('codeDisplay').textContent = '// Starting operation...';
        document.getElementById('explanationText').textContent = 'Preparing...';

        this.toggleInputs(false);
        return true;
    }

    insertTail() {
        if (!this.startOp()) return;
        const val = document.getElementById('insertVal').value || Math.floor(Math.random() * 100);
        this.list.insertAtTail(val);
    }

    insertHead() {
        if (!this.startOp()) return;
        const val = document.getElementById('insertVal').value || Math.floor(Math.random() * 100);
        this.list.insertAtHead(val);
    }

    insertPos() {
        const val = document.getElementById('insertVal').value || Math.floor(Math.random() * 100);
        const pos = parseInt(document.getElementById('insertPos').value);
        if (isNaN(pos)) return alert("Enter position");
        if (pos < 0 || pos > this.list.size) return alert(`Invalid Index (0-${this.list.size})`);

        if (!this.startOp()) return;
        this.list.insertAtPosition(val, pos);
    }

    deleteHead() {
        if (this.list.size === 0) return alert("List is empty");
        if (!this.startOp()) return;
        this.list.deleteAtHead();
    }

    deleteTail() {
        if (this.list.size === 0) return alert("List is empty");
        if (!this.startOp()) return;
        this.list.deleteAtTail();
    }

    deletePos() {
        const pos = parseInt(document.getElementById('deletePos').value);
        if (isNaN(pos)) return alert("Enter position");
        if (pos < 0 || pos >= this.list.size) return alert(`Invalid Index (0-${this.list.size - 1})`);

        if (!this.startOp()) return;
        this.list.deleteAtPosition(pos);
    }

    search() {
        const val = document.getElementById('searchVal').value;
        if (!val) return alert("Enter value");
        if (this.list.size === 0) return alert("List is empty");

        if (!this.startOp()) return;
        this.list.search(val);
    }

    reverse() {
        if (this.list.size < 2) return alert("List too small to reverse");
        if (!this.startOp()) return;
        this.list.reverse();
    }

    generateRandom() {
        if (!this.startOp()) return;

        // Clear existing
        this.setListType(this.list.type);
        this.startOp(); // Re-lock after clear

        const count = 5 + Math.floor(Math.random() * 5); // 5-9 nodes
        for (let i = 0; i < count; i++) {
            this.list.insertAtTail(Math.floor(Math.random() * 100));
        }
    }
}

const visualizer = new Visualizer();
const anim = new AnimationController();
const app = new App();
