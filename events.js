/**
 * Nexora Event Manager
 * Version: 2.0
 * Description: Handles user input, keyboard navigation, and selection logic.
 */

const Events = {
    selection: {
        current: "A1", // Default selected cell
        range: []      // For multi-select (future feature)
    },

    init: function() {
        console.log("Nexora Events: Listening...");
        
        const container = document.getElementById("cells-layer");
        const formulaInput = document.getElementById("formula-input");

        // 1. Mouse Click on Cell
        container.addEventListener("mousedown", (e) => {
            if (e.target.classList.contains("cell")) {
                this.selectCell(e.target.dataset.id);
            }
        });

        // 2. Double Click to Edit
        container.addEventListener("dblclick", (e) => {
            if (e.target.classList.contains("cell")) {
                this.enableEditing(e.target);
            }
        });

        // 3. Keyboard Navigation
        document.addEventListener("keydown", (e) => this.handleKeydown(e));

        // 4. Formula Bar Input
        if(formulaInput) {
            formulaInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    this.commitData(this.selection.current, e.target.value);
                    e.target.blur(); // Focus back to grid
                }
            });
        }
    },

    selectCell: function(cellId) {
        this.selection.current = cellId;
        Renderer.highlightCell(cellId);
        
        // Update Formula Bar
        const data = Core.getCellData(cellId);
        const formulaBar = document.getElementById("formula-input");
        if(formulaBar) {
            // Show formula if it exists, otherwise show value
            formulaBar.value = data.formula ? data.formula : (data.value || "");
        }
    },

    enableEditing: function(domElement) {
        const cellId = domElement.dataset.id;
        const data = Core.getCellData(cellId);
        
        // Create an input element explicitly for editing
        const input = document.createElement("input");
        input.type = "text";
        input.value = data.formula ? data.formula : data.value; // Edit source, not result
        input.className = "cell-editor"; // Style this in CSS
        
        // Replace cell content with input
        domElement.innerHTML = "";
        domElement.appendChild(input);
        input.focus();

        // Handle Save on Blur or Enter
        const save = () => {
            const val = input.value;
            this.commitData(cellId, val);
            // Renderer will re-draw the cell with the new value
            Renderer.refreshCell(cellId);
        };

        input.addEventListener("blur", save);
        input.addEventListener("keydown", (e) => {
            if(e.key === "Enter") {
                save();
                this.moveSelection(0, 1); // Move down on Enter
            }
        });
    },

    commitData: function(cellId, value) {
        // 1. Update Core
        Core.updateCell(cellId, value);
        
        // 2. Update UI
        Renderer.refreshCell(cellId);
        
        // 3. Update Dependencies (Optional - requires dependency graph in Core)
        // For now, we just refresh the viewport to be safe or re-render
        Renderer.renderViewport();
    },

    handleKeydown: function(e) {
        // If editing, don't navigate
        if (document.activeElement.tagName === "INPUT") return;

        let { col, row } = Core.parseCoordinates(this.selection.current);

        if (e.key === "ArrowUp") row--;
        if (e.key === "ArrowDown") row++;
        if (e.key === "ArrowLeft") col--;
        if (e.key === "ArrowRight") col++;
        if (e.key === "Enter") row++; 

        // Boundary checks
        if (row < 0) row = 0;
        if (col < 0) col = 0;
        
        // Convert back to ID
        const colLetter = String.fromCharCode(65 + col);
        const newId = `${colLetter}${row + 1}`;

        this.selectCell(newId);
    },
    
    moveSelection: function(colDelta, rowDelta) {
        let { col, row } = Core.parseCoordinates(this.selection.current);
        row += rowDelta;
        col += colDelta;
        if (row < 0) row = 0;
        if (col < 0) col = 0;
        const colLetter = String.fromCharCode(65 + col);
        this.selectCell(`${colLetter}${row + 1}`);
    }
};

// Auto-init
if (typeof window !== 'undefined') {
    window.Events = Events;
}
