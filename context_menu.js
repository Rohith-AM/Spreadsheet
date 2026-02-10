/**
 * Nexora Context Menu & Clipboard
 * Version: 3.1
 * Description: Custom right-click menu and internal clipboard operations.
 */

const ContextMenu = {
    
    clipboard: null, // Stores data for Copy/Paste
    activeCell: null,

    init: function() {
        console.log("Nexora ContextMenu: Active.");
        
        // 1. Create the Menu DOM dynamically (No need to pollute index.html)
        this.createMenuDOM();

        // 2. Listen for Right Click
        document.addEventListener('contextmenu', (e) => {
            // Only trigger if inside the grid
            if (e.target.classList.contains('cell')) {
                e.preventDefault(); // Stop browser menu
                this.show(e.pageX, e.pageY, e.target.dataset.id);
            } else {
                this.hide();
            }
        });

        // 3. Close menu on left click anywhere
        document.addEventListener('click', () => this.hide());
    },

    createMenuDOM: function() {
        const menu = document.createElement('div');
        menu.id = 'nexora-context-menu';
        menu.style.position = 'absolute';
        menu.style.display = 'none';
        menu.style.backgroundColor = 'white';
        menu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        menu.style.border = '1px solid #dcdcdc';
        menu.style.borderRadius = '6px';
        menu.style.zIndex = '10000';
        menu.style.width = '160px';
        menu.style.padding = '5px 0';
        menu.style.fontFamily = 'sans-serif';
        menu.style.fontSize = '13px';

        // Menu Items Definition
        const items = [
            { icon: '✂️', label: 'Cut', action: 'cut' },
            { icon: '📋', label: 'Copy', action: 'copy' },
            { icon: '📌', label: 'Paste', action: 'paste' },
            { hr: true }, // Separator
            { icon: '🗑️', label: 'Delete Value', action: 'delete' },
            { icon: '🎨', label: 'Reset Style', action: 'resetStyle' }
        ];

        items.forEach(item => {
            if (item.hr) {
                const hr = document.createElement('div');
                hr.style.borderBottom = '1px solid #eee';
                hr.style.margin = '4px 0';
                menu.appendChild(hr);
            } else {
                const div = document.createElement('div');
                div.innerHTML = `<span style="margin-right:10px">${item.icon}</span> ${item.label}`;
                div.style.padding = '8px 15px';
                div.style.cursor = 'pointer';
                div.style.color = '#333';
                
                div.onmouseover = () => div.style.backgroundColor = '#f3f3f3';
                div.onmouseout = () => div.style.backgroundColor = 'white';
                
                div.onclick = () => {
                    this.execute(item.action);
                    this.hide();
                };
                menu.appendChild(div);
            }
        });

        document.body.appendChild(menu);
    },

    show: function(x, y, cellId) {
        this.activeCell = cellId;
        
        // Select the cell visually first
        if(Events && Events.selectCell) Events.selectCell(cellId);

        const menu = document.getElementById('nexora-context-menu');
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.style.display = 'block';
    },

    hide: function() {
        const menu = document.getElementById('nexora-context-menu');
        if (menu) menu.style.display = 'none';
    },

    // -------------------------------------------------------------------------
    // 3. CLIPBOARD LOGIC
    // -------------------------------------------------------------------------

    execute: function(action) {
        if (!this.activeCell) return;

        const cellData = Core.getCellData(this.activeCell);

        switch (action) {
            case 'copy':
                // We copy the whole object (Value + Formula + Style)
                this.clipboard = JSON.parse(JSON.stringify(cellData));
                console.log("Copied:", this.clipboard);
                break;

            case 'cut':
                this.clipboard = JSON.parse(JSON.stringify(cellData));
                Core.updateCell(this.activeCell, ""); // Clear value
                Formatting.applyStyle('backgroundColor', 'transparent'); // Clear style
                Renderer.refreshCell(this.activeCell);
                break;

            case 'paste':
                if (this.clipboard) {
                    // 1. Update Core
                    // Merge clipboard style with existing default structure
                    if(!Core.state[this.activeCell]) Core.state[this.activeCell] = {};
                    
                    Core.state[this.activeCell].value = this.clipboard.value;
                    Core.state[this.activeCell].formula = this.clipboard.formula;
                    Core.state[this.activeCell].style = this.clipboard.style || {};

                    // 2. Refresh UI
                    Renderer.refreshCell(this.activeCell);
                    // Also refresh style explicitly
                    Formatting.refreshCellStyle(this.activeCell);
                }
                break;

            case 'delete':
                Core.updateCell(this.activeCell, "");
                Renderer.refreshCell(this.activeCell);
                break;
                
            case 'resetStyle':
                if(Core.state[this.activeCell]) {
                    Core.state[this.activeCell].style = {}; // Wipe styles
                    Formatting.refreshCellStyle(this.activeCell);
                }
                break;
        }
    }
};

// Integration Hook
if (typeof window !== 'undefined') {
    // Delay slightly to ensure DOM is ready
    setTimeout(() => ContextMenu.init(), 500);
}
