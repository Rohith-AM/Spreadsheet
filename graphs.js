/**
 * Nexora Graphing Engine
 * Version: 3.0 (Multi-Chart Support)
 * Description: Supports Bar, Line, Pie, Doughnut, and Radar charts.
 */

const GraphTool = {
    chartInstance: null,
    currentType: 'bar', // Default

    // -------------------------------------------------------------------------
    // 1. INITIALIZATION & UI
    // -------------------------------------------------------------------------

    createGraph: function() {
        // 1. Show the Modal
        const modal = document.getElementById('graph-modal');
        if (!modal) return;
        modal.classList.remove('hidden');

        // 2. Inject the Type Selector (Drop down) if not already there
        this.injectControls(modal);

        // 3. Render Default
        this.renderChart();
    },

    injectControls: function(modal) {
        // Check if we already added the dropdown
        if (document.getElementById('chart-type-selector')) return;

        const content = modal.querySelector('.modal-content');
        
        // Create a toolbar div inside the modal
        const tools = document.createElement('div');
        tools.style.marginBottom = "15px";
        tools.style.display = "flex";
        tools.style.gap = "10px";
        tools.style.alignItems = "center";

        // Create the Label
        const label = document.createElement('span');
        label.innerText = "Chart Type:";
        label.style.fontWeight = "bold";

        // Create the Dropdown
        const select = document.createElement('select');
        select.id = 'chart-type-selector';
        select.style.padding = "5px";
        select.style.borderRadius = "4px";
        
        const types = ['bar', 'line', 'pie', 'doughnut', 'radar'];
        types.forEach(type => {
            const opt = document.createElement('option');
            opt.value = type;
            opt.innerText = type.charAt(0).toUpperCase() + type.slice(1);
            select.appendChild(opt);
        });

        // Listen for changes
        select.addEventListener('change', (e) => {
            this.currentType = e.target.value;
            this.renderChart(); // Re-draw immediately
        });

        // Assemble
        tools.appendChild(label);
        tools.appendChild(select);
        
        // Insert at the top of modal content
        content.insertBefore(tools, content.firstChild); // Put it before the X button
    },

    closeGraph: function() {
        document.getElementById('graph-modal').classList.add('hidden');
    },

    // -------------------------------------------------------------------------
    // 2. DATA EXTRACTION
    // -------------------------------------------------------------------------

    getData: function() {
        const labels = [];
        const data = [];
        const backgroundColors = [];
        const borderColors = [];

        // Scan the first 20 rows for data
        for (let r = 0; r < 20; r++) {
            const labelCell = Renderer.getCellId(0, r); // Column A
            const valueCell = Renderer.getCellId(1, r); // Column B

            const labelTxt = Core.getCellData(labelCell).value;
            const valTxt = Core.getCellData(valueCell).value;

            // Only add if there is data
            if (labelTxt || valTxt) {
                labels.push(labelTxt || `Row ${r+1}`);
                data.push(Number(valTxt) || 0);

                // Generate random nice color for Pie charts
                const color = `hsla(${Math.random() * 360}, 70%, 50%, 0.6)`;
                backgroundColors.push(color);
                borderColors.push(color.replace('0.6', '1'));
            }
        }

        return { labels, data, backgroundColors, borderColors };
    },

    // -------------------------------------------------------------------------
    // 3. RENDERING
    // -------------------------------------------------------------------------

    renderChart: function() {
        const ctx = document.getElementById('chartCanvas');
        if (!ctx) return;

        // Destroy old chart to prevent "flickering" or memory leaks
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const raw = this.getData();

        // Config for Chart.js
        const config = {
            type: this.currentType,
            data: {
                labels: raw.labels,
                datasets: [{
                    label: 'Dataset (Column B)',
                    data: raw.data,
                    backgroundColor: this.currentType.match(/pie|doughnut/) ? raw.backgroundColors : 'rgba(16, 124, 65, 0.5)',
                    borderColor: this.currentType.match(/pie|doughnut/) ? raw.borderColors : '#107c41',
                    borderWidth: 1,
                    fill: this.currentType === 'radar' ? true : false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { 
                        beginAtZero: true,
                        display: !this.currentType.match(/pie|doughnut|radar/) // Hide axes for Pie
                    }
                }
            }
        };

        this.chartInstance = new Chart(ctx, config);
    }
};

// Integration
if (typeof window !== 'undefined') {
    window.GraphTool = GraphTool;
}
