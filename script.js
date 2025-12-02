// Node class for Doubly Linked List
class DoublyNode {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.prev = null;
    }
}

// Node class representing each element in the linked list
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

// Base class for all linked lists
class LinkedListBase {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
        this.animationSpeed = 500;
        this.editMode = false;
        this.selectedNode = null;
    }

    // Get input value helper
    getInputValue(inputId) {
        const input = document.getElementById(inputId);
        const value = parseInt(input.value);
        
        if (isNaN(value)) {
            this.updateStatus('❌ Please enter a valid number!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return null;
        }
        
        return value;
    }

    // Clear input field
    clearInput(inputId) {
        document.getElementById(inputId).value = '';
    }

    // Update status message
    updateStatus(message, type) {
        const statusElement = document.getElementById('statusMessage');
        statusElement.textContent = message;
        statusElement.className = `info-value status-${type}`;
    }

    // Show code for current operation
    showCode(code) {
        const codeBlock = document.getElementById('codeBlock');
        codeBlock.innerHTML = `<code>${code}</code>`;
    }

    // Sleep utility for animations
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Toggle edit mode
    toggleEditMode() {
        this.editMode = !this.editMode;
        const btn = document.getElementById('editModeBtn');
        if (this.editMode) {
            btn.textContent = '🔓 Exit Edit Mode';
            btn.classList.add('btn-warning');
            btn.classList.remove('btn-info');
            this.updateStatus('Edit Mode: Click a node to select it, then click another to reconnect', 'processing');
        } else {
            btn.textContent = '✏️ Edit Connections';
            btn.classList.add('btn-info');
            btn.classList.remove('btn-warning');
            this.selectedNode = null;
            this.updateStatus('Ready', 'ready');
            this.render(false, false, false, true);
        }
    }
}

// LinkedList class with visualization capabilities
class LinkedList extends LinkedListBase {
    constructor() {
        super();
        this.head = null;
        this.length = 0;
    }

    // Insert at the head of the list
    async insertAtHead() {
        const value = this.getInputValue('insertValue');
        if (value === null) return;

        this.updateStatus('Processing...', 'processing');
        this.showCode(`void insertAtHead(int value) {
    Node* newNode = new Node(value);
    newNode->next = head;
    head = newNode;
    length++;
}`);

        const newNode = new Node(value);
        newNode.next = this.head;
        this.head = newNode;
        this.length++;

        await this.render(-1, false, true);
        this.updateInfo();
        this.updateStatus('✅ Node inserted at head!', 'ready');
        this.clearInput('insertValue');
    }

    // Insert at the tail of the list
    async insertAtTail() {
        const value = this.getInputValue('insertValue');
        if (value === null) return;

        this.updateStatus('Processing...', 'processing');
        this.showCode(`void insertAtTail(int value) {
    Node* newNode = new Node(value);
    if (head == nullptr) {
        head = newNode;
    } else {
        Node* current = head;
        while (current->next != nullptr) {
            current = current->next;
        }
        current->next = newNode;
    }
    length++;
}`);

        const newNode = new Node(value);
        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        this.length++;

        await this.render(-1, false, true);
        this.updateInfo();
        this.updateStatus('✅ Node inserted at tail!', 'ready');
        this.clearInput('insertValue');
    }

    // Insert at a specific position
    async insertAtPosition() {
        const value = this.getInputValue('insertValue');
        const position = this.getInputValue('insertPosition');
        
        if (value === null) return;
        if (position === null) {
            this.updateStatus('Please enter a position!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }

        if (position < 0 || position > this.length) {
            this.updateStatus(`❌ Cannot insert! Invalid position: ${position}. Must be between 0 and ${this.length}`, 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 3000);
            return;
        }

        this.updateStatus('Processing...', 'processing');
        this.showCode(`void insertAtPosition(int value, int position) {
    if (position == 0) {
        insertAtHead(value);
        return;
    }
    Node* newNode = new Node(value);
    Node* current = head;
    for (int i = 0; i < position - 1; i++) {
        current = current->next;
    }
    newNode->next = current->next;
    current->next = newNode;
    length++;
}`);

        if (position === 0) {
            await this.insertAtHead();
            return;
        }

        const newNode = new Node(value);
        let current = this.head;
        for (let i = 0; i < position - 1; i++) {
            current = current.next;
        }
        newNode.next = current.next;
        current.next = newNode;
        this.length++;

        await this.render(-1, false, true);
        this.updateInfo();
        this.updateStatus(`✅ Node inserted at position ${position}!`, 'ready');
        this.clearInput('insertValue');
        this.clearInput('insertPosition');
    }

    // Delete from head
    async deleteAtHead() {
        if (!this.head) {
            this.updateStatus('❌ Cannot delete! List is empty', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }

        this.updateStatus('Processing...', 'processing');
        this.showCode(`void deleteAtHead() {
    if (head == nullptr) return;
    Node* temp = head;
    head = head->next;
    delete temp;
    length--;
}`);

        await this.highlightNode(0);
        this.head = this.head.next;
        this.length--;

        await this.render(false, false, false, true);
        this.updateInfo();
        this.updateStatus('✅ Head node deleted!', 'ready');
    }

    // Delete from tail
    async deleteAtTail() {
        if (!this.head) {
            this.updateStatus('❌ Cannot delete! List is empty', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }

        this.updateStatus('Processing...', 'processing');
        this.showCode(`void deleteAtTail() {
    if (head == nullptr) return;
    if (head->next == nullptr) {
        delete head;
        head = nullptr;
        length--;
        return;
    }
    Node* current = head;
    while (current->next->next != nullptr) {
        current = current->next;
    }
    delete current->next;
    current->next = nullptr;
    length--;
}`);

        if (!this.head.next) {
            this.head = null;
        } else {
            let current = this.head;
            while (current.next.next) {
                current = current.next;
            }
            await this.highlightNode(this.length - 1);
            current.next = null;
        }
        this.length--;

        await this.render(false, false, false, true);
        this.updateInfo();
        this.updateStatus('✅ Tail node deleted!', 'ready');
    }

    // Delete at specific position
    async deleteAtPosition() {
        const position = this.getInputValue('deletePosition');
        
        if (position === null) {
            this.updateStatus('Please enter a position!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }

        if (position < 0 || position >= this.length) {
            this.updateStatus(`❌ Cannot delete! Invalid position: ${position}. Must be between 0 and ${this.length - 1}`, 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 3000);
            return;
        }

        this.updateStatus('Processing...', 'processing');
        this.showCode(`void deleteAtPosition(int position) {
    if (position == 0) {
        deleteAtHead();
        return;
    }
    Node* current = head;
    for (int i = 0; i < position - 1; i++) {
        current = current->next;
    }
    Node* temp = current->next;
    current->next = current->next->next;
    delete temp;
    length--;
}`);

        if (position === 0) {
            await this.deleteAtHead();
            return;
        }

        let current = this.head;
        for (let i = 0; i < position - 1; i++) {
            current = current.next;
        }
        await this.highlightNode(position);
        current.next = current.next.next;
        this.length--;

        await this.render(false, false, false, true);
        this.updateInfo();
        this.updateStatus(`✅ Node at position ${position} deleted!`, 'ready');
        this.clearInput('deletePosition');
    }

    // Search for a value
    async search() {
        const value = this.getInputValue('searchValue');
        if (value === null) return;

        if (!this.head) {
            this.updateStatus('❌ List is empty! Cannot search.', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            this.clearInput('searchValue');
            return;
        }

        this.updateStatus('Searching...', 'processing');
        this.showCode(`int search(int value) {
    Node* current = head;
    int position = 0;
    while (current != nullptr) {
        if (current->data == value) {
            return position;
        }
        current = current->next;
        position++;
    }
    return -1; // Not found
}`);

        let current = this.head;
        let position = 0;
        let found = false;

        while (current) {
            await this.highlightNode(position);
            if (current.data === value) {
                found = true;
                await this.highlightFoundNode(position);
                this.updateStatus(`✅ Value ${value} found at position ${position}!`, 'ready');
                break;
            }
            current = current.next;
            position++;
        }

        if (!found) {
            await this.render(false, false, false, true); // Clear the highlighting
            this.updateStatus(`❌ Value ${value} not found in the list!`, 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
        }
        this.clearInput('searchValue');
    }

    // Reverse the linked list
    async reverse() {
        if (!this.head || !this.head.next) {
            this.updateStatus('❌ Cannot reverse! List is too short', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }

        this.updateStatus('Reversing...', 'processing');
        this.showCode(`void reverse() {
    Node* prev = nullptr;
    Node* current = head;
    Node* next = nullptr;
    
    while (current != nullptr) {
        next = current->next;
        current->next = prev;
        prev = current;
        current = next;
    }
    head = prev;
}`);

        // Show the step-by-step reversal process
        let originalHead = this.head;
        let prev = null;
        let current = this.head;
        let next = null;
        let step = 0;

        // Create a visual representation of the reversal process
        while (current) {
            step++;
            
            // Highlight the nodes being processed
            let currentPos = 0;
            let temp = originalHead;
            while (temp && temp !== current) {
                temp = temp.next;
                currentPos++;
            }
            
            // Show current node being processed
            await this.render(currentPos, false, false, true);
            await this.sleep(this.animationSpeed / 2);
            
            // Actually reverse the link
            next = current.next;
            current.next = prev;
            prev = current;
            current = next;
            
            // Update head temporarily to show progress
            if (step === 1) {
                this.head = prev;
            }
            
            // Show the intermediate state
            await this.render(-1, false, false, true);
            await this.sleep(this.animationSpeed / 2);
        }

        // Final update
        this.head = prev;
        await this.render();
        this.updateInfo();
        this.updateStatus('✅ List reversed successfully!', 'ready');
    }

    // Traverse the linked list (educational visualization)
    async traverse() {
        if (!this.head) {
            this.updateStatus('❌ List is empty!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }

        this.updateStatus('Traversing list...', 'processing');
        this.showCode(`void traverse() {
    Node* current = head;
    while (current != nullptr) {
        cout << current->data << " -> ";
        current = current->next;
    }
    cout << "NULL" << endl;
}`);

        let position = 0;
        while (position < this.length) {
            await this.render(position, false, false, true);
            await this.sleep(this.animationSpeed);
            position++;
        }

        await this.render(false, false, false, true);
        this.updateStatus('✅ Traversal complete!', 'ready');
    }

    // Clear the entire list
    async clear() {
        if (!this.head) {
            this.updateStatus('❌ List is already empty!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return;
        }

        this.updateStatus('Clearing...', 'processing');
        this.head = null;
        this.length = 0;

        await this.render(false, false, false, true);
        this.updateInfo();
        this.updateStatus('✅ List cleared successfully!', 'ready');
    }

    // Helper method to highlight a node during operations
    async highlightNode(position) {
        await this.render(position, false, false, true);
        await this.sleep(this.animationSpeed);
    }

    // Helper method to highlight found node
    async highlightFoundNode(position) {
        await this.render(position, true, false, true);
        await this.sleep(this.animationSpeed * 2);
        await this.render(false, false, false, true);
    }

    // Render the linked list visualization
    async render(highlightPosition = -1, found = false, isNewNode = false, skipAnimation = false) {
        const canvas = document.getElementById('canvas');
        
        if (!this.head) {
            canvas.innerHTML = `
                <div class="empty-state">
                    <h3>Empty List</h3>
                    <p>Insert nodes to get started!</p>
                </div>
            `;
            return;
        }

        // Only clear and animate if not skipping animation
        if (!skipAnimation) {
            canvas.innerHTML = '';
        }
        
        const container = document.createElement('div');
        container.className = 'node-container';

        let current = this.head;
        let position = 0;

        while (current) {
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'node';

            // Add head label
            if (position === 0) {
                const headLabel = document.createElement('div');
                headLabel.className = 'head-label';
                headLabel.textContent = 'HEAD';
                nodeDiv.appendChild(headLabel);
            }

            // Add tail label
            if (!current.next) {
                const tailLabel = document.createElement('div');
                tailLabel.className = 'tail-label';
                tailLabel.textContent = 'TAIL';
                nodeDiv.appendChild(tailLabel);
            }

            // Position indicator
            const posLabel = document.createElement('div');
            posLabel.className = 'node-position';
            posLabel.textContent = `[${position}]`;
            nodeDiv.appendChild(posLabel);

            // Node box
            const box = document.createElement('div');
            box.className = 'node-box';
            
            // Special animation for new nodes only
            if (isNewNode && position === this.length - 1 && !skipAnimation) {
                box.style.animation = 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            }
            
            if (position === highlightPosition) {
                box.classList.add(found ? 'node-found' : 'node-highlight');
            }

            const valueSpan = document.createElement('div');
            valueSpan.className = 'node-value';
            valueSpan.textContent = current.data;
            box.appendChild(valueSpan);

            const labelSpan = document.createElement('div');
            labelSpan.className = 'node-label';
            labelSpan.textContent = 'data';
            box.appendChild(labelSpan);

            nodeDiv.appendChild(box);

            // Arrow
            if (current.next) {
                const arrow = document.createElement('div');
                arrow.className = 'arrow';
                nodeDiv.appendChild(arrow);
            } else {
                const nullNode = document.createElement('div');
                nullNode.className = 'null-node';
                nullNode.textContent = 'NULL';
                nodeDiv.appendChild(nullNode);
            }

            container.appendChild(nodeDiv);
            current = current.next;
            position++;
        }

        if (skipAnimation) {
            // Replace existing container smoothly
            const existingContainer = canvas.querySelector('.node-container');
            if (existingContainer) {
                canvas.replaceChild(container, existingContainer);
            } else {
                canvas.appendChild(container);
            }
        } else {
            canvas.appendChild(container);
        }
    }

    // Update list information panel
    updateInfo() {
        document.getElementById('listLength').textContent = this.length;
        document.getElementById('headValue').textContent = this.head ? this.head.data : '-';
        
        let tail = this.head;
        while (tail && tail.next) {
            tail = tail.next;
        }
        document.getElementById('tailValue').textContent = tail ? tail.data : '-';
    }

    // Update status message
    updateStatus(message, type) {
        const statusElement = document.getElementById('statusMessage');
        statusElement.textContent = message;
        statusElement.className = `info-value status-${type}`;
    }

    // Show code for current operation
    showCode(code) {
        const codeBlock = document.getElementById('codeBlock');
        codeBlock.innerHTML = `<code>${code}</code>`;
    }

    // Get input value
    getInputValue(inputId) {
        const input = document.getElementById(inputId);
        const value = parseInt(input.value);
        
        if (isNaN(value)) {
            this.updateStatus('❌ Please enter a valid number!', 'error');
            setTimeout(() => this.updateStatus('Ready', 'ready'), 2000);
            return null;
        }
        
        return value;
    }

    // Clear input field
    clearInput(inputId) {
        document.getElementById(inputId).value = '';
    }

    // Sleep utility for animations
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the linked list
const linkedList = new LinkedList();

// Application Manager for handling different list types
class LinkedListApplication {
    constructor() {
        this.singlyList = linkedList;
        this.listType = 'singly';
    }

    changeListType() {
        const selector = document.getElementById('listTypeSelector');
        const newType = selector.value;
        
        if (this.singlyList.length > 0) {
            if (!confirm('Changing list type will clear the current list. Continue?')) {
                selector.value = this.listType;
                return;
            }
        }

        this.listType = newType;
        this.singlyList.head = this.singlyList.tail = null;
        this.singlyList.length = 0;
        this.singlyList.render();
        this.singlyList.updateInfo();
        this.singlyList.updateStatus('Ready! Add nodes to start.', 'ready');
        this.updateEducationalContent();
    }

    updateEducationalContent() {
        const content = document.getElementById('educationalContent');
        const contents = {
            singly: `
                <p>A <strong>Singly Linked List</strong> where each node points to the next node only.</p>
                <p><strong>Time Complexity:</strong></p>
                <ul>
                    <li>Insert at Head: O(1)</li>
                    <li>Insert at Tail: O(n)</li>
                    <li>Delete: O(n)</li>
                    <li>Search: O(n)</li>
                </ul>
            `,
            doubly: `
                <p>A <strong>Doubly Linked List</strong> where each node has pointers to both next and previous nodes.</p>
                <p><strong>Time Complexity:</strong></p>
                <ul>
                    <li>Insert at Head/Tail: O(1)</li>
                    <li>Delete: O(1) if node is known</li>
                    <li>Search: O(n)</li>
                </ul>
            `,
            circular: `
                <p>A <strong>Circular Linked List</strong> where the last node points back to the head.</p>
                <p><strong>Time Complexity:</strong></p>
                <ul>
                    <li>Insert: O(1)</li>
                    <li>Delete: O(n)</li>
                    <li>Search: O(n)</li>
                </ul>
            `
        };
        content.innerHTML = contents[this.listType];
    }

    // Delegate to the current list
    insertAtHead() { this.singlyList.insertAtHead(); }
    insertAtTail() { this.singlyList.insertAtTail(); }
    insertAtPosition() { this.singlyList.insertAtPosition(); }
    deleteAtHead() { this.singlyList.deleteAtHead(); }
    deleteAtTail() { this.singlyList.deleteAtTail(); }
    deleteAtPosition() { this.singlyList.deleteAtPosition(); }
    search() { this.singlyList.search(); }
    traverse() { this.singlyList.traverse(); }
    reverse() { this.singlyList.reverse(); }
    clear() { this.singlyList.clear(); }
}

// Create global app instance
const linkedListApp = new LinkedListApplication();

// Speed slider event listener
document.getElementById('speedSlider').addEventListener('input', (e) => {
    linkedList.animationSpeed = parseInt(e.target.value);
    document.getElementById('speedValue').textContent = e.target.value;
});

// Initialize with some sample data (optional)
window.addEventListener('load', async () => {
    linkedList.updateInfo();
    linkedList.updateStatus('Ready! Add nodes to start.', 'ready');
    
    // Uncomment to start with sample data
    // document.getElementById('insertValue').value = 10;
    // await linkedList.insertAtHead();
    // document.getElementById('insertValue').value = 20;
    // await linkedList.insertAtTail();
    // document.getElementById('insertValue').value = 30;
    // await linkedList.insertAtTail();
});

// Handle Enter key for inputs
document.querySelectorAll('.input-field').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Trigger the appropriate action based on which input was used
            if (input.id === 'insertValue') {
                linkedList.insertAtTail();
            } else if (input.id === 'deletePosition') {
                linkedList.deleteAtPosition();
            } else if (input.id === 'searchValue') {
                linkedList.search();
            }
        }
    });
});
