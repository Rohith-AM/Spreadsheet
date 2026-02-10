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
        if(this.dom.headerRow) this.dom.headerRow.style.transform = `translateX(-${left}px)`;
        if(this.dom.headerCol) this.dom.headerCol.style.transform = `translateY(-${top}px)`;

        window.requestAnimationFrame(() => this.renderViewport());
    },

    renderViewport: function() {
        const v = this.viewport;
        const conf = Core.config; // Renamed to 'conf' to avoid shadowing bug

        // Calculate visible range
        v.startRow = Math.floor(v.scrollTop / conf.defaultHeight);
        v.endRow = Math.min(conf.rows, v.startRow + Math.ceil(v.height / conf.defaultHeight) + 2);

        v.startCol = Math.floor(v.scrollLeft / conf.defaultWidth);
        v.endCol = Math.min(conf.cols, v.startCol + Math.ceil(v.width / conf.defaultWidth) + 2);

        // 1. Render Main Cells
        let html = "";
        for (let r = v.startRow; r < v.endRow; r++) {
            // FIXED: Changed loop variable from 'c' to 'col'
            for (let col = v.startCol; col < v.endCol; col++) {
                const cellId = this.getCellId(col, r);
                const cellData = Core.getCellData(cellId);
                const value = cellData.value !== undefined ? cellData.value : "";
                
                // FIXED: Now using 'conf' and 'col' correctly
                const top = r * conf.defaultHeight;
                const left = col * conf.defaultWidth;
                
                // FIXED: Style matching logic
                const s = cellData.style || {};
                const fontWeight = s.fontWeight || "normal";
                const fontStyle = s.fontStyle || "normal";
                const textAlign = s.textAlign || "left";
                const color = s.color || "black";
                const bg = s.backgroundColor || "transparent";

                html += `
                    <div class="cell ${Events && Events.selection.current === cellId ? "selected" : ""}" 
                         data-id="${cellId}"
                         style="
                            top: ${top}px; 
                            left: ${left}px; 
                            width: ${conf.defaultWidth}px; 
                            height: ${conf.defaultHeight}px;
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

        // 2. Render Headers
        this.renderHeaders(v.startRow, v.endRow, v.startCol, v.endCol);
    },

    renderHeaders: function(startRow, endRow, startCol, endCol) {
        const conf = Core.config;

        // -- Render Top Row Headers (A, B, C...) --
        let rowHeaderHtml = "";
        for(let i = startCol; i < endCol; i++) {
            const left = i * conf.defaultWidth;
            const letter = String.fromCharCode(65 + i); 
            rowHeaderHtml += `
                <div class="cell header" style="
                    top: 0;
                    left: ${left}px;
                    width: ${conf.defaultWidth}px;
                    height: 30px;
                ">${letter}</div>
            `;
        }
        this.dom.headerRow.innerHTML = rowHeaderHtml;

        // -- Render Left Column Headers (1, 2, 3...) --
        let colHeaderHtml = "";
        for(let i = startRow; i < endRow; i++) {
            const top = i * conf.defaultHeight;
            colHeaderHtml += `
                <div class="cell header" style="
                    left: 0;
                    top: ${top}px;
                    width: 40px;
                    height: ${conf.defaultHeight}px;
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
        this.renderViewport();
    },

    highlightCell: function(cellId) {
        this.renderViewport(); 
    }
};

if (typeof window !== 'undefined') {
    window.Renderer = Renderer;
}
