// ============================================
// LINKED LIST VISUALIZER - Complete Implementation
// Supports: Singly, Doubly, and Circular Linked Lists
// ============================================

// Node Classes
class SinglyNode {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.id = Date.now() + Math.random(); // Unique ID
    }
}

class DoublyNode {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.prev = null;
        this.id = Date.now() + Math.random();
    }
}

// Base Class for All List Types
class LinkedListBase {
    constructor(type) {
        this.head = null;
        this.tail = null;
        this.length = 0;
        this.animationSpeed = 500;
        this.type = type;
        this.editMode = false;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getInputValue(inputId) {
        const input = document.getElementById(inputId);
        const value = parseInt(input.value);
        if (isNaN(value)) {
            this.updateStatus('❌ Enter a valid number!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return null;
        }
        return value;
    }

    clearInput(inputId) {
        document.getElementById(inputId).value = '';
    }

    updateStatus(message, type) {
        const statusElement = document.getElementById('statusMessage');
        statusElement.textContent = message;
        statusElement.className = `info-value status-${type}`;
    }

    updateInfo() {
        document.getElementById('listLength').textContent = this.length;
        document.getElementById('headValue').textContent = this.head ? this.head.data : '-';
        document.getElementById('tailValue').textContent = this.tail ? this.tail.data : '-';
    }

    showCode(code) {
        document.getElementById('codeBlock').innerHTML = `<code>${code}</code>`;
    }

    async clear() {
        if (!this.head) {
            this.updateStatus('❌ Already empty!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }
        this.head = this.tail = null;
        this.length = 0;
        await this.render();
        this.updateInfo();
        this.updateStatus('✅ List cleared!', 'ready');
    }
}

// ============================================
// SINGLY LINKED LIST
// ============================================
class SinglyLinkedList extends LinkedListBase {
    constructor() {
        super('singly');
    }

    async insertAtHead() {
        const value = this.getInputValue('insertValue');
        if (value === null) return;

        this.updateStatus('Inserting at head...', 'processing');
        this.showCode(`void insertAtHead(int value) {
    Node* newNode = new Node(value);
    newNode->next = head;
    head = newNode;
    length++;
}`);

        const newNode = new SinglyNode(value);
        newNode.next = this.head;
        this.head = newNode;
        if (!this.tail) this.tail = this.head;
        this.length++;

        await this.render(-1, false, true);
        this.updateInfo();
        this.updateStatus('✅ Inserted at head!', 'ready');
        this.clearInput('insertValue');
    }

    async insertAtTail() {
        const value = this.getInputValue('insertValue');
        if (value === null) return;

        this.updateStatus('Inserting at tail...', 'processing');
        this.showCode(`void insertAtTail(int value) {
    Node* newNode = new Node(value);
    if (!head) {
        head = tail = newNode;
    } else {
        tail->next = newNode;
        tail = newNode;
    }
    length++;
}`);

        const newNode = new SinglyNode(value);
        if (!this.head) {
            this.head = this.tail = newNode;
        } else {
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this.length++;

        await this.render(-1, false, true);
        this.updateInfo();
        this.updateStatus('✅ Inserted at tail!', 'ready');
        this.clearInput('insertValue');
    }

    async insertAtPosition() {
        const value = this.getInputValue('insertValue');
        const position = this.getInputValue('insertPosition');
        
        if (value === null) {
            this.clearInput('insertValue');
            this.clearInput('insertPosition');
            return;
        }
        
        if (position === null) {
            this.updateStatus('Enter a position!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            this.clearInput('insertValue');
            this.clearInput('insertPosition');
            return;
        }

        if (position < 0 || position > this.length) {
            this.updateStatus(`❌ Invalid position: ${position}. Must be 0-${this.length}`, 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 3000);
            this.clearInput('insertValue');
            this.clearInput('insertPosition');
            return;
        }

        if (position === 0) {
            await this.insertAtHead();
            this.clearInput('insertPosition');
            return;
        }

        if (position === this.length) {
            await this.insertAtTail();
            this.clearInput('insertPosition');
            return;
        }

        this.updateStatus('Inserting...', 'processing');
        const newNode = new SinglyNode(value);
        let current = this.head;
        for (let i = 0; i < position - 1; i++) {
            current = current.next;
        }
        newNode.next = current.next;
        current.next = newNode;
        this.length++;

        await this.render(-1, false, true);
        this.updateInfo();
        this.updateStatus(`✅ Inserted at position ${position}!`, 'ready');
        this.clearInput('insertValue');
        this.clearInput('insertPosition');
    }

    async deleteAtHead() {
        if (!this.head) {
            this.updateStatus('❌ List is empty!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }

        this.updateStatus('Deleting head...', 'processing');
        await this.render(0, false, false, true);
        await this.sleep(this.animationSpeed);

        this.head = this.head.next;
        if (!this.head) this.tail = null;
        this.length--;

        await this.render();
        this.updateInfo();
        this.updateStatus('✅ Head deleted!', 'ready');
    }

    async deleteAtTail() {
        if (!this.head) {
            this.updateStatus('❌ List is empty!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }

        this.updateStatus('Deleting tail...', 'processing');
        await this.render(this.length - 1, false, false, true);
        await this.sleep(this.animationSpeed);

        if (this.head === this.tail) {
            this.head = this.tail = null;
        } else {
            let current = this.head;
            while (current.next !== this.tail) {
                current = current.next;
            }
            this.tail = current;
            this.tail.next = null;
        }
        this.length--;

        await this.render();
        this.updateInfo();
        this.updateStatus('✅ Tail deleted!', 'ready');
    }

    async deleteAtPosition() {
        const position = this.getInputValue('deletePosition');
        
        if (position === null) {
            this.clearInput('deletePosition');
            return;
        }

        if (this.length === 0) {
            this.updateStatus('❌ List is empty!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            this.clearInput('deletePosition');
            return;
        }

        if (position < 0 || position >= this.length) {
            this.updateStatus(`❌ Invalid position: ${position}. Must be 0-${this.length - 1}`, 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 3000);
            this.clearInput('deletePosition');
            return;
        }

        if (position === 0) {
            await this.deleteAtHead();
            this.clearInput('deletePosition');
            return;
        }

        if (position === this.length - 1) {
            await this.deleteAtTail();
            this.clearInput('deletePosition');
            return;
        }

        this.updateStatus('Deleting...', 'processing');
        await this.render(position, false, false, true);
        await this.sleep(this.animationSpeed);

        let current = this.head;
        for (let i = 0; i < position - 1; i++) {
            current = current.next;
        }
        current.next = current.next.next;
        this.length--;

        await this.render();
        this.updateInfo();
        this.updateStatus(`✅ Deleted position ${position}!`, 'ready');
        this.clearInput('deletePosition');
    }

    async search() {
        const value = this.getInputValue('searchValue');
        if (value === null) return;

        if (!this.head) {
            this.updateStatus('❌ List is empty!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            this.clearInput('searchValue');
            return;
        }

        this.updateStatus('Searching...', 'processing');
        let current = this.head;
        let position = 0;

        while (current) {
            await this.render(position, false, false, true);
            await this.sleep(this.animationSpeed);
            
            if (current.data === value) {
                await this.render(position, true, false, true);
                await this.sleep(this.animationSpeed * 2);
                this.updateStatus(`✅ Found at position ${position}!`, 'ready');
                this.clearInput('searchValue');
                return;
            }
            current = current.next;
            position++;
        }

        await this.render();
        this.updateStatus(`❌ Value ${value} not found!`, 'error');
        setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
        this.clearInput('searchValue');
    }

    async traverse() {
        if (!this.head) {
            this.updateStatus('❌ List is empty!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }

        this.updateStatus('Traversing...', 'processing');
        let position = 0;
        while (position < this.length) {
            await this.render(position, false, false, true);
            await this.sleep(this.animationSpeed);
            position++;
        }

        await this.render();
        this.updateStatus('✅ Traversal complete!', 'ready');
    }

    async reverse() {
        if (!this.head || !this.head.next) {
            this.updateStatus('❌ List too short!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }

        this.updateStatus('Reversing...', 'processing');
        let prev = null;
        let current = this.head;
        let next = null;
        this.tail = this.head;
        let position = 0;

        while (current) {
            await this.render(position, false, false, true);
            await this.sleep(this.animationSpeed / 2);
            
            next = current.next;
            current.next = prev;
            prev = current;
            current = next;
            position++;
        }

        this.head = prev;
        await this.render();
        this.updateInfo();
        this.updateStatus('✅ List reversed!', 'ready');
    }

    async render(highlightPosition = -1, found = false, isNewNode = false, skipAnimation = false) {
        const canvas = document.getElementById('canvas');
        
        if (!this.head) {
            canvas.innerHTML = '<div class="empty-state"><h3>Empty List</h3><p>Insert nodes to get started!</p></div>';
            return;
        }

        const container = document.createElement('div');
        container.className = 'node-container';

        let current = this.head;
        let position = 0;

        while (current) {
            const nodeDiv = this.createNodeElement(current, position, highlightPosition, found, isNewNode);
            container.appendChild(nodeDiv);
            current = current.next;
            position++;
        }

        if (skipAnimation) {
            const existingContainer = canvas.querySelector('.node-container');
            if (existingContainer) {
                canvas.replaceChild(container, existingContainer);
            } else {
                canvas.appendChild(container);
            }
        } else {
            canvas.innerHTML = '';
            canvas.appendChild(container);
        }
    }

    createNodeElement(node, position, highlightPosition, found, isNewNode) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'node';

        if (position === 0) {
            const headLabel = document.createElement('div');
            headLabel.className = 'head-label';
            headLabel.textContent = 'HEAD';
            nodeDiv.appendChild(headLabel);
        }

        if (node === this.tail) {
            const tailLabel = document.createElement('div');
            tailLabel.className = 'tail-label';
            tailLabel.textContent = 'TAIL';
            nodeDiv.appendChild(tailLabel);
        }

        const posLabel = document.createElement('div');
        posLabel.className = 'node-position';
        posLabel.textContent = `[${position}]`;
        nodeDiv.appendChild(posLabel);

        const box = document.createElement('div');
        box.className = 'node-box';
        
        if (isNewNode && position === this.length - 1) {
            box.style.animation = 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        }
        
        if (position === highlightPosition) {
            box.classList.add(found ? 'node-found' : 'node-highlight');
        }

        const valueSpan = document.createElement('div');
        valueSpan.className = 'node-value';
        valueSpan.textContent = node.data;
        box.appendChild(valueSpan);

        const labelSpan = document.createElement('div');
        labelSpan.className = 'node-label';
        labelSpan.textContent = 'data';
        box.appendChild(labelSpan);

        nodeDiv.appendChild(box);

        if (node.next) {
            const arrow = document.createElement('div');
            arrow.className = 'arrow arrow-next';
            arrow.title = 'next';
            nodeDiv.appendChild(arrow);
        } else {
            const nullNode = document.createElement('div');
            nullNode.className = 'null-node';
            nullNode.textContent = 'NULL';
            nodeDiv.appendChild(nullNode);
        }

        return nodeDiv;
    }
}

// ============================================
// DOUBLY LINKED LIST
// ============================================
class DoublyLinkedList extends LinkedListBase {
    constructor() {
        super('doubly');
    }

    async insertAtHead() {
        const value = this.getInputValue('insertValue');
        if (value === null) return;

        this.updateStatus('Inserting at head...', 'processing');
        this.showCode(`void insertAtHead(int value) {
    Node* newNode = new Node(value);
    newNode->next = head;
    if (head) head->prev = newNode;
    head = newNode;
    if (!tail) tail = head;
    length++;
}`);

        const newNode = new DoublyNode(value);
        newNode.next = this.head;
        if (this.head) this.head.prev = newNode;
        this.head = newNode;
        if (!this.tail) this.tail = this.head;
        this.length++;

        await this.render(-1, false, true);
        this.updateInfo();
        this.updateStatus('✅ Inserted at head!', 'ready');
        this.clearInput('insertValue');
    }

    async insertAtTail() {
        const value = this.getInputValue('insertValue');
        if (value === null) return;

        this.updateStatus('Inserting at tail...', 'processing');
        this.showCode(`void insertAtTail(int value) {
    Node* newNode = new Node(value);
    if (!head) {
        head = tail = newNode;
    } else {
        tail->next = newNode;
        newNode->prev = tail;
        tail = newNode;
    }
    length++;
}`);

        const newNode = new DoublyNode(value);
        if (!this.head) {
            this.head = this.tail = newNode;
        } else {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }
        this.length++;

        await this.render(-1, false, true);
        this.updateInfo();
        this.updateStatus('✅ Inserted at tail!', 'ready');
        this.clearInput('insertValue');
    }

    async insertAtPosition() {
        const value = this.getInputValue('insertValue');
        const position = this.getInputValue('insertPosition');
        
        if (value === null) {
            this.clearInput('insertValue');
            this.clearInput('insertPosition');
            return;
        }
        
        if (position === null) {
            this.updateStatus('Enter a position!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            this.clearInput('insertValue');
            this.clearInput('insertPosition');
            return;
        }

        if (position < 0 || position > this.length) {
            this.updateStatus(`❌ Invalid position: ${position}. Must be 0-${this.length}`, 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 3000);
            this.clearInput('insertValue');
            this.clearInput('insertPosition');
            return;
        }

        if (position === 0) {
            await this.insertAtHead();
            this.clearInput('insertPosition');
            return;
        }

        if (position === this.length) {
            await this.insertAtTail();
            this.clearInput('insertPosition');
            return;
        }

        this.updateStatus('Inserting...', 'processing');
        const newNode = new DoublyNode(value);
        let current = this.head;
        for (let i = 0; i < position - 1; i++) {
            current = current.next;
        }
        newNode.next = current.next;
        newNode.prev = current;
        if (current.next) current.next.prev = newNode;
        current.next = newNode;
        this.length++;

        await this.render(-1, false, true);
        this.updateInfo();
        this.updateStatus(`✅ Inserted at position ${position}!`, 'ready');
        this.clearInput('insertValue');
        this.clearInput('insertPosition');
    }

    async deleteAtHead() {
        if (!this.head) {
            this.updateStatus('❌ List is empty!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }

        this.updateStatus('Deleting head...', 'processing');
        await this.render(0, false, false, true);
        await this.sleep(this.animationSpeed);

        this.head = this.head.next;
        if (this.head) {
            this.head.prev = null;
        } else {
            this.tail = null;
        }
        this.length--;

        await this.render();
        this.updateInfo();
        this.updateStatus('✅ Head deleted!', 'ready');
    }

    async deleteAtTail() {
        if (!this.head) {
            this.updateStatus('❌ List is empty!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }

        this.updateStatus('Deleting tail...', 'processing');
        await this.render(this.length - 1, false, false, true);
        await this.sleep(this.animationSpeed);

        if (this.head === this.tail) {
            this.head = this.tail = null;
        } else {
            this.tail = this.tail.prev;
            this.tail.next = null;
        }
        this.length--;

        await this.render();
        this.updateInfo();
        this.updateStatus('✅ Tail deleted!', 'ready');
    }

    async deleteAtPosition() {
        const position = this.getInputValue('deletePosition');
        
        if (position === null) {
            this.clearInput('deletePosition');
            return;
        }

        if (this.length === 0) {
            this.updateStatus('❌ List is empty!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            this.clearInput('deletePosition');
            return;
        }

        if (position < 0 || position >= this.length) {
            this.updateStatus(`❌ Invalid position: ${position}. Must be 0-${this.length - 1}`, 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 3000);
            this.clearInput('deletePosition');
            return;
        }

        if (position === 0) {
            await this.deleteAtHead();
            this.clearInput('deletePosition');
            return;
        }

        if (position === this.length - 1) {
            await this.deleteAtTail();
            this.clearInput('deletePosition');
            return;
        }

        this.updateStatus('Deleting...', 'processing');
        await this.render(position, false, false, true);
        await this.sleep(this.animationSpeed);

        let current = this.head;
        for (let i = 0; i < position; i++) {
            current = current.next;
        }
        current.prev.next = current.next;
        current.next.prev = current.prev;
        this.length--;

        await this.render();
        this.updateInfo();
        this.updateStatus(`✅ Deleted position ${position}!`, 'ready');
        this.clearInput('deletePosition');
    }

    async search() {
        const value = this.getInputValue('searchValue');
        if (value === null) return;

        if (!this.head) {
            this.updateStatus('❌ List is empty!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            this.clearInput('searchValue');
            return;
        }

        this.updateStatus('Searching...', 'processing');
        let current = this.head;
        let position = 0;

        while (current) {
            await this.render(position, false, false, true);
            await this.sleep(this.animationSpeed);
            
            if (current.data === value) {
                await this.render(position, true, false, true);
                await this.sleep(this.animationSpeed * 2);
                this.updateStatus(`✅ Found at position ${position}!`, 'ready');
                this.clearInput('searchValue');
                return;
            }
            current = current.next;
            position++;
        }

        await this.render();
        this.updateStatus(`❌ Value ${value} not found!`, 'error');
        setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
        this.clearInput('searchValue');
    }

    async traverse() {
        if (!this.head) {
            this.updateStatus('❌ List is empty!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }

        this.updateStatus('Traversing forward...', 'processing');
        let position = 0;
        while (position < this.length) {
            await this.render(position, false, false, true);
            await this.sleep(this.animationSpeed);
            position++;
        }

        await this.render();
        this.updateStatus('✅ Traversal complete!', 'ready');
    }

    async reverse() {
        if (!this.head || !this.head.next) {
            this.updateStatus('❌ List too short!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }

        this.updateStatus('Reversing...', 'processing');
        let current = this.head;
        let temp = null;
        let position = 0;

        while (current) {
            await this.render(position, false, false, true);
            await this.sleep(this.animationSpeed / 2);
            
            temp = current.prev;
            current.prev = current.next;
            current.next = temp;
            current = current.prev;
            position++;
        }

        if (temp) {
            temp = this.head;
            this.head = this.tail;
            this.tail = temp;
        }

        await this.render();
        this.updateInfo();
        this.updateStatus('✅ List reversed!', 'ready');
    }

    async render(highlightPosition = -1, found = false, isNewNode = false, skipAnimation = false) {
        const canvas = document.getElementById('canvas');
        
        if (!this.head) {
            canvas.innerHTML = '<div class="empty-state"><h3>Empty List</h3><p>Insert nodes to get started!</p></div>';
            return;
        }

        const container = document.createElement('div');
        container.className = 'node-container';

        let current = this.head;
        let position = 0;

        while (current) {
            const nodeDiv = this.createDoublyNodeElement(current, position, highlightPosition, found, isNewNode);
            container.appendChild(nodeDiv);
            current = current.next;
            position++;
        }

        if (skipAnimation) {
            const existingContainer = canvas.querySelector('.node-container');
            if (existingContainer) {
                canvas.replaceChild(container, existingContainer);
            } else {
                canvas.appendChild(container);
            }
        } else {
            canvas.innerHTML = '';
            canvas.appendChild(container);
        }
    }

    createDoublyNodeElement(node, position, highlightPosition, found, isNewNode) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'node doubly-node';

        if (position === 0) {
            const headLabel = document.createElement('div');
            headLabel.className = 'head-label';
            headLabel.textContent = 'HEAD';
            nodeDiv.appendChild(headLabel);
        }

        if (node === this.tail) {
            const tailLabel = document.createElement('div');
            tailLabel.className = 'tail-label';
            tailLabel.textContent = 'TAIL';
            nodeDiv.appendChild(tailLabel);
        }

        const posLabel = document.createElement('div');
        posLabel.className = 'node-position';
        posLabel.textContent = `[${position}]`;
        nodeDiv.appendChild(posLabel);

        // Prev arrow (if not head)
        if (node.prev) {
            const prevArrow = document.createElement('div');
            prevArrow.className = 'arrow arrow-prev';
            prevArrow.title = 'prev';
            nodeDiv.appendChild(prevArrow);
        }

        const box = document.createElement('div');
        box.className = 'node-box doubly-box';
        
        if (isNewNode && position === this.length - 1) {
            box.style.animation = 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        }
        
        if (position === highlightPosition) {
            box.classList.add(found ? 'node-found' : 'node-highlight');
        }

        // Prev pointer indicator
        const prevSpan = document.createElement('div');
        prevSpan.className = 'node-pointer prev-pointer';
        prevSpan.textContent = 'prev';
        box.appendChild(prevSpan);

        const valueSpan = document.createElement('div');
        valueSpan.className = 'node-value';
        valueSpan.textContent = node.data;
        box.appendChild(valueSpan);

        // Next pointer indicator
        const nextSpan = document.createElement('div');
        nextSpan.className = 'node-pointer next-pointer';
        nextSpan.textContent = 'next';
        box.appendChild(nextSpan);

        nodeDiv.appendChild(box);

        // Next arrow
        if (node.next) {
            const nextArrow = document.createElement('div');
            nextArrow.className = 'arrow arrow-next';
            nextArrow.title = 'next';
            nodeDiv.appendChild(nextArrow);
        } else {
            const nullNode = document.createElement('div');
            nullNode.className = 'null-node';
            nullNode.textContent = 'NULL';
            nodeDiv.appendChild(nullNode);
        }

        return nodeDiv;
    }
}

// ============================================
// CIRCULAR LINKED LIST
// ============================================
class CircularLinkedList extends LinkedListBase {
    constructor() {
        super('circular');
    }

    async insertAtHead() {
        const value = this.getInputValue('insertValue');
        if (value === null) return;

        this.updateStatus('Inserting at head...', 'processing');
        this.showCode(`void insertAtHead(int value) {
    Node* newNode = new Node(value);
    if (!head) {
        head = tail = newNode;
        newNode->next = newNode; // Point to itself
    } else {
        newNode->next = head;
        tail->next = newNode;
        head = newNode;
    }
    length++;
}`);

        const newNode = new SinglyNode(value);
        if (!this.head) {
            this.head = this.tail = newNode;
            newNode.next = newNode; // Circular
        } else {
            newNode.next = this.head;
            this.tail.next = newNode;
            this.head = newNode;
        }
        this.length++;

        await this.render(-1, false, true);
        this.updateInfo();
        this.updateStatus('✅ Inserted at head!', 'ready');
        this.clearInput('insertValue');
    }

    async insertAtTail() {
        const value = this.getInputValue('insertValue');
        if (value === null) return;

        this.updateStatus('Inserting at tail...', 'processing');
        this.showCode(`void insertAtTail(int value) {
    Node* newNode = new Node(value);
    if (!head) {
        head = tail = newNode;
        newNode->next = newNode;
    } else {
        newNode->next = head;
        tail->next = newNode;
        tail = newNode;
    }
    length++;
}`);

        const newNode = new SinglyNode(value);
        if (!this.head) {
            this.head = this.tail = newNode;
            newNode.next = newNode;
        } else {
            newNode.next = this.head;
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this.length++;

        await this.render(-1, false, true);
        this.updateInfo();
        this.updateStatus('✅ Inserted at tail!', 'ready');
        this.clearInput('insertValue');
    }

    async insertAtPosition() {
        const value = this.getInputValue('insertValue');
        const position = this.getInputValue('insertPosition');
        
        if (value === null) {
            this.clearInput('insertValue');
            this.clearInput('insertPosition');
            return;
        }
        
        if (position === null) {
            this.updateStatus('Enter a position!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            this.clearInput('insertValue');
            this.clearInput('insertPosition');
            return;
        }

        if (position < 0 || position > this.length) {
            this.updateStatus(`❌ Invalid position: ${position}. Must be 0-${this.length}`, 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 3000);
            this.clearInput('insertValue');
            this.clearInput('insertPosition');
            return;
        }

        if (position === 0) {
            await this.insertAtHead();
            this.clearInput('insertPosition');
            return;
        }

        if (position === this.length) {
            await this.insertAtTail();
            this.clearInput('insertPosition');
            return;
        }

        this.updateStatus('Inserting...', 'processing');
        const newNode = new SinglyNode(value);
        let current = this.head;
        for (let i = 0; i < position - 1; i++) {
            current = current.next;
        }
        newNode.next = current.next;
        current.next = newNode;
        this.length++;

        await this.render(-1, false, true);
        this.updateInfo();
        this.updateStatus(`✅ Inserted at position ${position}!`, 'ready');
        this.clearInput('insertValue');
        this.clearInput('insertPosition');
    }

    async deleteAtHead() {
        if (!this.head) {
            this.updateStatus('❌ List is empty!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }

        this.updateStatus('Deleting head...', 'processing');
        await this.render(0, false, false, true);
        await this.sleep(this.animationSpeed);

        if (this.head === this.tail) {
            this.head = this.tail = null;
        } else {
            this.head = this.head.next;
            this.tail.next = this.head;
        }
        this.length--;

        await this.render();
        this.updateInfo();
        this.updateStatus('✅ Head deleted!', 'ready');
    }

    async deleteAtTail() {
        if (!this.head) {
            this.updateStatus('❌ List is empty!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }

        this.updateStatus('Deleting tail...', 'processing');
        await this.render(this.length - 1, false, false, true);
        await this.sleep(this.animationSpeed);

        if (this.head === this.tail) {
            this.head = this.tail = null;
        } else {
            let current = this.head;
            while (current.next !== this.tail) {
                current = current.next;
            }
            this.tail = current;
            this.tail.next = this.head;
        }
        this.length--;

        await this.render();
        this.updateInfo();
        this.updateStatus('✅ Tail deleted!', 'ready');
    }

    async deleteAtPosition() {
        const position = this.getInputValue('deletePosition');
        
        if (position === null) {
            this.clearInput('deletePosition');
            return;
        }

        if (this.length === 0) {
            this.updateStatus('❌ List is empty!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            this.clearInput('deletePosition');
            return;
        }

        if (position < 0 || position >= this.length) {
            this.updateStatus(`❌ Invalid position: ${position}. Must be 0-${this.length - 1}`, 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 3000);
            this.clearInput('deletePosition');
            return;
        }

        if (position === 0) {
            await this.deleteAtHead();
            this.clearInput('deletePosition');
            return;
        }

        if (position === this.length - 1) {
            await this.deleteAtTail();
            this.clearInput('deletePosition');
            return;
        }

        this.updateStatus('Deleting...', 'processing');
        await this.render(position, false, false, true);
        await this.sleep(this.animationSpeed);

        let current = this.head;
        for (let i = 0; i < position - 1; i++) {
            current = current.next;
        }
        current.next = current.next.next;
        this.length--;

        await this.render();
        this.updateInfo();
        this.updateStatus(`✅ Deleted position ${position}!`, 'ready');
        this.clearInput('deletePosition');
    }

    async search() {
        const value = this.getInputValue('searchValue');
        if (value === null) return;

        if (!this.head) {
            this.updateStatus('❌ List is empty!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            this.clearInput('searchValue');
            return;
        }

        this.updateStatus('Searching...', 'processing');
        let current = this.head;
        let position = 0;

        do {
            await this.render(position, false, false, true);
            await this.sleep(this.animationSpeed);
            
            if (current.data === value) {
                await this.render(position, true, false, true);
                await this.sleep(this.animationSpeed * 2);
                this.updateStatus(`✅ Found at position ${position}!`, 'ready');
                this.clearInput('searchValue');
                return;
            }
            current = current.next;
            position++;
        } while (current !== this.head && position < this.length);

        await this.render();
        this.updateStatus(`❌ Value ${value} not found!`, 'error');
        setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
        this.clearInput('searchValue');
    }

    async traverse() {
        if (!this.head) {
            this.updateStatus('❌ List is empty!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }

        this.updateStatus('Traversing circular list...', 'processing');
        let position = 0;
        
        // Traverse once around the circle
        while (position < this.length) {
            await this.render(position, false, false, true);
            await this.sleep(this.animationSpeed);
            position++;
        }

        // Show circular connection
        await this.render(0, false, false, true);
        await this.sleep(this.animationSpeed);

        await this.render();
        this.updateStatus('✅ Traversal complete!', 'ready');
    }

    async reverse() {
        this.updateStatus('❌ Reverse not supported for circular lists!', 'error');
        setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
    }

    async render(highlightPosition = -1, found = false, isNewNode = false, skipAnimation = false) {
        const canvas = document.getElementById('canvas');
        
        if (!this.head) {
            canvas.innerHTML = '<div class="empty-state"><h3>Empty List</h3><p>Insert nodes to get started!</p></div>';
            return;
        }

        const container = document.createElement('div');
        container.className = 'node-container circular-container';

        let current = this.head;
        let position = 0;

        do {
            const nodeDiv = this.createCircularNodeElement(current, position, highlightPosition, found, isNewNode);
            container.appendChild(nodeDiv);
            current = current.next;
            position++;
        } while (current !== this.head && position < this.length);

        // Add circular arrow back to head
        const circularArrow = document.createElement('div');
        circularArrow.className = 'circular-arrow';
        circularArrow.innerHTML = '<div class="circular-arrow-curve">↻ back to HEAD</div>';
        container.appendChild(circularArrow);

        if (skipAnimation) {
            const existingContainer = canvas.querySelector('.node-container');
            if (existingContainer) {
                canvas.replaceChild(container, existingContainer);
            } else {
                canvas.appendChild(container);
            }
        } else {
            canvas.innerHTML = '';
            canvas.appendChild(container);
        }
    }

    createCircularNodeElement(node, position, highlightPosition, found, isNewNode) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'node circular-node';

        if (position === 0) {
            const headLabel = document.createElement('div');
            headLabel.className = 'head-label';
            headLabel.textContent = 'HEAD';
            nodeDiv.appendChild(headLabel);
        }

        if (node === this.tail) {
            const tailLabel = document.createElement('div');
            tailLabel.className = 'tail-label';
            tailLabel.textContent = 'TAIL';
            nodeDiv.appendChild(tailLabel);
        }

        const posLabel = document.createElement('div');
        posLabel.className = 'node-position';
        posLabel.textContent = `[${position}]`;
        nodeDiv.appendChild(posLabel);

        const box = document.createElement('div');
        box.className = 'node-box circular-box';
        
        if (isNewNode && position === this.length - 1) {
            box.style.animation = 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        }
        
        if (position === highlightPosition) {
            box.classList.add(found ? 'node-found' : 'node-highlight');
        }

        const valueSpan = document.createElement('div');
        valueSpan.className = 'node-value';
        valueSpan.textContent = node.data;
        box.appendChild(valueSpan);

        const labelSpan = document.createElement('div');
        labelSpan.className = 'node-label';
        labelSpan.textContent = 'data';
        box.appendChild(labelSpan);

        nodeDiv.appendChild(box);

        // Always show arrow (circular)
        const arrow = document.createElement('div');
        arrow.className = 'arrow arrow-next';
        arrow.title = 'next';
        nodeDiv.appendChild(arrow);

        return nodeDiv;
    }
}

// ============================================
// APPLICATION MANAGER
// ============================================
class LinkedListApplication {
    constructor() {
        this.currentList = new SinglyLinkedList();
        this.listType = 'singly';
        this.updateEducationalContent();
    }

    changeListType() {
        const selector = document.getElementById('listTypeSelector');
        const newType = selector.value;
        
        if (this.currentList.length > 0) {
            if (!confirm('Changing list type will clear the current list. Continue?')) {
                selector.value = this.listType;
                return;
            }
        }

        this.listType = newType;
        
        switch(newType) {
            case 'singly':
                this.currentList = new SinglyLinkedList();
                document.getElementById('reverseBtn').disabled = false;
                break;
            case 'doubly':
                this.currentList = new DoublyLinkedList();
                document.getElementById('reverseBtn').disabled = false;
                break;
            case 'circular':
                this.currentList = new CircularLinkedList();
                document.getElementById('reverseBtn').disabled = true;
                break;
        }

        this.currentList.animationSpeed = parseInt(document.getElementById('speedSlider').value);
        this.currentList.render();
        this.currentList.updateInfo();
        this.currentList.updateStatus('Ready! Add nodes to start.', 'ready');
        this.updateEducationalContent();
    }

    updateEducationalContent() {
        const content = document.getElementById('educationalContent');
        const contents = {
            singly: `
                <p>A <strong>Singly Linked List</strong> where each node points only to the next node.</p>
                <p><strong>Characteristics:</strong></p>
                <ul>
                    <li>✅ One-directional traversal (forward only)</li>
                    <li>✅ Less memory per node (1 pointer)</li>
                    <li>❌ Cannot traverse backwards</li>
                    <li>✅ Simple structure</li>
                </ul>
                <p><strong>Time Complexity:</strong></p>
                <ul>
                    <li>Insert at Head: O(1)</li>
                    <li>Insert at Tail: O(1) with tail pointer</li>
                    <li>Delete: O(n)</li>
                    <li>Search: O(n)</li>
                </ul>
            `,
            doubly: `
                <p>A <strong>Doubly Linked List</strong> where each node has pointers to both next AND previous nodes.</p>
                <p><strong>Characteristics:</strong></p>
                <ul>
                    <li>✅ Bi-directional traversal (forward & backward)</li>
                    <li>✅ Easier deletion of nodes</li>
                    <li>❌ More memory per node (2 pointers)</li>
                    <li>✅ Can navigate in both directions</li>
                </ul>
                <p><strong>Time Complexity:</strong></p>
                <ul>
                    <li>Insert at Head/Tail: O(1)</li>
                    <li>Delete: O(1) if node pointer is known</li>
                    <li>Search: O(n)</li>
                    <li>Reverse: O(n)</li>
                </ul>
            `,
            circular: `
                <p>A <strong>Circular Linked List</strong> where the last node points back to the head (no NULL).</p>
                <p><strong>Characteristics:</strong></p>
                <ul>
                    <li>✅ No NULL pointers - continuous loop</li>
                    <li>✅ Can start traversal from any node</li>
                    <li>✅ Useful for round-robin scheduling</li>
                    <li>❌ Need to track when to stop traversal</li>
                </ul>
                <p><strong>Time Complexity:</strong></p>
                <ul>
                    <li>Insert at Head: O(1)</li>
                    <li>Insert at Tail: O(1) with tail pointer</li>
                    <li>Delete: O(n)</li>
                    <li>Search: O(n)</li>
                </ul>
                <p><strong>Use Cases:</strong> Music playlists, browser history, CPU scheduling</p>
            `
        };
        content.innerHTML = contents[this.listType];
    }

    // Delegate methods to current list
    insertAtHead() { this.currentList.insertAtHead(); }
    insertAtTail() { this.currentList.insertAtTail(); }
    insertAtPosition() { this.currentList.insertAtPosition(); }
    deleteAtHead() { this.currentList.deleteAtHead(); }
    deleteAtTail() { this.currentList.deleteAtTail(); }
    deleteAtPosition() { this.currentList.deleteAtPosition(); }
    search() { this.currentList.search(); }
    traverse() { this.currentList.traverse(); }
    reverse() { this.currentList.reverse(); }
    clear() { this.currentList.clear(); }
}

// ============================================
// INITIALIZATION
// ============================================
const linkedListApp = new LinkedListApplication();

// Speed slider
document.getElementById('speedSlider').addEventListener('input', (e) => {
    linkedListApp.currentList.animationSpeed = parseInt(e.target.value);
    document.getElementById('speedValue').textContent = e.target.value;
});

// Initialize
window.addEventListener('load', () => {
    linkedListApp.currentList.updateInfo();
    linkedListApp.currentList.updateStatus('Ready! Select a list type and add nodes.', 'ready');
});

// Enter key handlers
document.querySelectorAll('.input-field').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (input.id === 'insertValue') {
                linkedListApp.insertAtTail();
            } else if (input.id === 'deletePosition') {
                linkedListApp.deleteAtPosition();
            } else if (input.id === 'searchValue') {
                linkedListApp.search();
            }
        }
    });
});

