/**
 * Nexora Storage & Export Engine
 * Version: 4.0 (Universal Format)
 * Description: Handles LocalStorage persistence and multi-format file exports.
 */

const StorageEngine = {
    // -------------------------------------------------------------------------
    // 1. LOCAL STORAGE (Auto-Save)
    // -------------------------------------------------------------------------
    
    saveKey: "nexora_sheet_data",

    init: function() {
        console.log("Nexora Storage: Checking for saved data...");
        this.loadFromLocal();
        
        // Auto-save every 5 seconds
        setInterval(() => {
            this.saveToLocal();
        }, 5000);
    },

    saveToLocal: function() {
        const payload = JSON.stringify(Core.state);
        localStorage.setItem(this.saveKey, payload);
        // Optional: Visual indicator could go here ("Saved...")
    },

    loadFromLocal: function() {
        const data = localStorage.getItem(this.saveKey);
        if (data) {
            try {
                Core.state = JSON.parse(data);
                console.log("Nexora Storage: Data loaded.");
                if(Renderer) Renderer.renderAll();
            } catch (e) {
                console.error("Save file corrupted", e);
            }
        }
    },

    clearData: function() {
        if(confirm("Are you sure? This will wipe your sheet.")) {
            localStorage.removeItem(this.saveKey);
            location.reload();
        }
    },

    // -------------------------------------------------------------------------
    // 2. EXPORTERS
    // -------------------------------------------------------------------------

    /**
     * Download .CSV (Standard Spreadsheet Format)
     */
    downloadCSV: function() {
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Loop through all defined rows/cols
        for (let r = 0; r < Core.config.rows; r++) {
            let rowData = [];
            for (let c = 0; c < Core.config.cols; c++) {
                const cellId = Renderer.getCellId(c, r);
                // Escape quotes to prevent breaking CSV format
                let val = String(Core.getCellData(cellId).value || "").replace(/"/g, '""');
                // Wrap in quotes if it contains comma
                if (val.includes(",")) val = `"${val}"`;
                rowData.push(val);
            }
            // Only add row if it has data (optimization)
            if (rowData.some(v => v !== "")) {
                csvContent += rowData.join(",") + "\r\n";
            }
        }

        this.triggerDownload(csvContent, "nexora_sheet.csv");
    },

    /**
     * Download .TXT (Tab-Separated for Notepad)
     */
    downloadTXT: function() {
        let txtContent = "data:text/plain;charset=utf-8,";
        
        for (let r = 0; r < Core.config.rows; r++) {
            let rowData = [];
            for (let c = 0; c < Core.config.cols; c++) {
                const cellId = Renderer.getCellId(c, r);
                rowData.push(Core.getCellData(cellId).value || "");
            }
            if (rowData.some(v => v !== "")) {
                txtContent += rowData.join("\t") + "\r\n";
            }
        }

        this.triggerDownload(txtContent, "nexora_sheet.txt");
    },

    /**
     * Download .JSON (Full Backup including Formulas & Styles)
     */
    downloadJSON: function() {
        const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(Core.state, null, 2));
        this.triggerDownload(jsonContent, "nexora_backup.json");
    },

    /**
     * Download .PDF (Visual Snapshot)
     */
    downloadPDF: async function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const element = document.getElementById("grid-container");
        
        // 1. Temporarily show standard scrollbars and full height for capture
        const originalOverflow = element.style.overflow;
        element.style.overflow = "visible"; 

        // 2. Capture
        // Note: For huge sheets, this captures the *visible* area primarily.
        // Capturing 10,000 virtual rows to PDF requires complex pagination logic.
        // This takes a "Screenshot" of the current view.
        
        const canvas = await html2canvas(document.getElementById("app-container"));
        const imgData = canvas.toDataURL("image/png");
        
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; 
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        doc.save('nexora_snapshot.pdf');

        // Restore
        element.style.overflow = originalOverflow;
    },

    /**
     * Utility Helper
     */
    triggerDownload: function(contentUri, fileName) {
        const link = document.createElement("a");
        link.setAttribute("href", contentUri);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Auto-init
if (typeof window !== 'undefined') {
    window.StorageEngine = StorageEngine;
    // Delay init slightly to ensure Core is ready
    setTimeout(() => StorageEngine.init(), 100);
}
