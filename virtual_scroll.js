const VirtualScroll = {
    container: null,
    layer: null,
    
    init: function() {
        this.container = document.getElementById('grid-container');
        this.layer = document.getElementById('cells-layer');
        
        // Set the fake height so scrollbar appears
        const totalHeight = State.config.rows * State.config.rowHeight;
        document.getElementById('scroll-spacer').style.height = `${totalHeight}px`;

        // Render initial view
        this.render();
    },

    onScroll: function(e) {
        // Request Animation Frame for performance
        window.requestAnimationFrame(() => this.render());
    },

    render: function() {
        // 1. Calculate Visible Area
        const scrollTop = this.container.scrollTop;
        const viewportHeight = this.container.clientHeight;

        // 2. Determine which rows to show
        const startRow = Math.floor(scrollTop / State.config.rowHeight);
        const endRow = Math.min(
            State.config.rows, 
            startRow + Math.ceil(viewportHeight / State.config.rowHeight) + 2 // +2 buffer
        );

        // 3. Clear current view
        this.layer.innerHTML = '';

        // 4. Render Headers (A, B, C...)
        this.renderHeaders();

        // 5. Render Cells
        for (let r = startRow; r < endRow; r++) {
            // Render Row Number
            this.createCell(0, r * State.config.rowHeight, r + 1, true);

            for (let c = 0; c < State.config.cols; c++) {
                const cellId = `${String.fromCharCode(65 + c)}${r + 1}`;
                const val = State.data[cellId] || "";
                
                // If it's a formula, compute it for display
                const displayVal = val.startsWith('=') ? FormulaEngine.evaluate(val) : val;

                const el = this.createCell((c + 1) * State.config.colWidth, r * State.config.rowHeight, displayVal);
                
                // Binding Input
                const input = document.createElement('input');
                input.value = displayVal;
                
                // Save Logic
                input.onblur = (e) => {
                    State.data[cellId] = e.target.value;
                };
                input.onfocus = (e) => {
                     // Show raw formula on edit
                    if(State.data[cellId]) input.value = State.data[cellId];
                }

                el.appendChild(input);
                this.layer.appendChild(el);
            }
        }
    },

    createCell: function(x, y, text, isHeader = false) {
        const div = document.createElement('div');
        div.className = isHeader ? 'cell header' : 'cell';
        div.style.left = `${x}px`;
        div.style.top = `${y + 30}px`; // Offset for column headers
        div.style.width = isHeader ? '50px' : `${State.config.colWidth}px`;
        div.style.height = `${State.config.rowHeight}px`;
        if(isHeader) div.innerText = text;
        return div;
    },

    renderHeaders: function() {
        // Render A, B, C...
        for(let c=0; c<State.config.cols; c++) {
            const div = document.createElement('div');
            div.className = 'cell header';
            div.style.left = `${(c+1) * State.config.colWidth}px`;
            div.style.top = '0px';
            div.style.width = `${State.config.colWidth}px`;
            div.style.height = '30px';
            div.innerText = String.fromCharCode(65 + c);
            this.layer.appendChild(div);
        }
    }
};
