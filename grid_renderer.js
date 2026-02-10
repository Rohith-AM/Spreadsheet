const Renderer = {
    dom: {
        container: null,
        contentLayer: null,
        headerRow: null,
        headerCol: null,
        scrollSpacer: null
    },

    viewport: {
        scrollTop: 0, scrollLeft: 0,
        height: 0, width: 0,
        startRow: 0, endRow: 0,
        startCol: 0, endCol: 0
    },

    init: function() {
        console.log("Nexora Renderer: Initializing UI...");

        this.dom.container = document.getElementById("grid-container");
        this.dom.contentLayer = document.getElementById("cells-layer");
        this.dom.headerRow = document.getElementById("header-row");
        this.dom.headerCol = document.getElementById("header-col");
        this.dom.scrollSpacer = document.getElementById("scroll-spacer");
        
        this.resize();

        // Scroll Listener
        this.dom.container.addEventListener("scroll", (e) => this.onScroll(e));
        // Resize Listener
        window.addEventListener("resize", () => this.resize());

        this.renderAll();
    },

    resize: function() {
        this.viewport.height = this.dom.container.clientHeight;
        this.viewport.width = this.dom.container.clientWidth;
        
        // Set fake height/width for scrollbars
        const totalHeight = Core.config.rows * Core.config.defaultHeight;
        const totalWidth = Core.config.cols * Core.config.defaultWidth;

        this.dom.scrollSpacer.style.height = `${totalHeight}px`;
        this.dom.scrollSpacer.style.width = `${totalWidth}px`;

        this.renderAll();
    },

    onScroll: function(e) {
        const top = e.target.scrollTop;
        const left = e.target.scrollLeft;

        this.viewport.scrollTop = top;
        this.viewport.scrollLeft = left;

        // Move the Headers to match scroll
        // Top headers move Left/Right
        if(this.dom.headerRow) this.dom.headerRow.style.transform = `translateX(-${left}px)`;
        // Left headers move Up/Down
        if(this.dom.headerCol) this.dom.headerCol.style.transform = `translateY(-${top}px)`;

        window.requestAnimationFrame(() => this.renderViewport());
    },

    renderViewport: function() {
        const v = this.viewport;
        const c = Core.config;

        // Calculate visible range
        v.startRow = Math.floor(v.scrollTop / c.defaultHeight);
        v.endRow = Math.min(c.rows, v.startRow + Math.ceil(v.height / c.defaultHeight) + 2);

        v.startCol = Math.floor(v.scrollLeft / c.defaultWidth);
        v.endCol = Math.min(c.cols, v.startCol + Math.ceil(v.width / c.defaultWidth) + 2);

        // 1. Render Main Cells
        let html = "";
        for (let r = v.startRow; r < v.endRow; r++) {
            for (let c = v.startCol; c < v.endCol; c++) {
                const cellId = this.getCellId(c, r);
                const cellData = Core.getCellData(cellId);
                const value = cellData.value !== undefined ? cellData.value : "";
                
                const top = r * c.defaultHeight;
                const left = c * c.defaultWidth;
                
                // Style handling
                const isSelected = Events && Events.selection.current === cellId ? "selected" : "";
                const fontWeight = cellData.style && cellData.style.bold ? "bold" : "normal";
                const fontStyle = cellData.style && cellData.style.fontStyle ? "italic" : "normal";
                const textAlign = cellData.style && cellData.style.textAlign ? cellData.style.textAlign : "left";
                const color = cellData.style && cellData.style.color ? cellData.style.color : "black";
                const bg = cellData.style && cellData.style.backgroundColor ? cellData.style.backgroundColor : "transparent";

                html += `
                    <div class="cell ${isSelected}" 
                         data-id="${cellId}"
                         style="
                            top: ${top}px; 
                            left: ${left}px; 
                            width: ${c.defaultWidth}px; 
                            height: ${c.defaultHeight}px;
                            font-weight: ${fontWeight};
                            font-style: ${fontStyle};
                            text-align: ${textAlign};
                            color: ${color};
                            background-color: ${bg};
                         ">
                        ${value}
                    </div>
                `;
            }
        }
        this.dom.contentLayer.innerHTML = html;

        // 2. Render Headers (NOW IMPLEMENTED!)
        this.renderHeaders(v.startRow, v.endRow, v.startCol, v.endCol);
    },

    renderHeaders: function(startRow, endRow, startCol, endCol) {
        const c = Core.config;

        // -- Render Top Row Headers (A, B, C...) --
        let rowHeaderHtml = "";
        for(let i = startCol; i < endCol; i++) {
            const left = i * c.defaultWidth;
            const letter = String.fromCharCode(65 + i); // 0->A
            rowHeaderHtml += `
                <div class="cell header" style="
                    top: 0;
                    left: ${left}px;
                    width: ${c.defaultWidth}px;
                    height: 30px; /* Header Height */
                ">${letter}</div>
            `;
        }
        this.dom.headerRow.innerHTML = rowHeaderHtml;

        // -- Render Left Column Headers (1, 2, 3...) --
        let colHeaderHtml = "";
        for(let i = startRow; i < endRow; i++) {
            const top = i * c.defaultHeight;
            colHeaderHtml += `
                <div class="cell header" style="
                    left: 0;
                    top: ${top}px;
                    width: 40px; /* Header Width */
                    height: ${c.defaultHeight}px;
                ">${i + 1}</div>
            `;
        }
        this.dom.headerCol.innerHTML = colHeaderHtml;
    },

    renderAll: function() {
        this.renderViewport();
    },
    
    getCellId: function(colIndex, rowIndex) {
        const colLetter = String.fromCharCode(65 + colIndex);
        return `${colLetter}${rowIndex + 1}`;
    },

    refreshCell: function(cellId) {
        // Quick update for single cell (Performance optimization)
        // For now, simpler to just re-render viewport to catch all style changes
        this.renderViewport();
    },

    highlightCell: function(cellId) {
        this.renderViewport(); // Re-render to update the "selected" class
    }
};

if (typeof window !== 'undefined') {
    window.Renderer = Renderer;
}
