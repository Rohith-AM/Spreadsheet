/**
 * Nexora Spreadsheet Core Engine
 * Version: 2.0 (Stable)
 * Description: Handles state management, formula parsing, and data reactivity.
 */

const Core = {
    // -------------------------------------------------------------------------
    // 1. CONFIGURATION & STATE
    // -------------------------------------------------------------------------
    config: {
        rows: 100,      // Number of rows
        cols: 26,       // Number of columns (A-Z)
        defaultWidth: 100,
        defaultHeight: 30
    },

    // The "Database" for our sheet
    // Structure: "A1": { value: "10", formula: "", style: { bold: false } }
    state: {},

    // -------------------------------------------------------------------------
    // 2. INITIALIZATION
    // -------------------------------------------------------------------------
    init: function() {
        console.log("Nexora Core: Initializing State...");
        this.state = {};
        console.log("Nexora Core: Ready.");
    },

    // -------------------------------------------------------------------------
    // 3. CELL MANAGEMENT (Getters & Setters)
    // -------------------------------------------------------------------------
    
    /**
     * Updates a cell's data and recalculates dependencies.
     * @param {string} cellId - e.g., "A1"
     * @param {string} input - The raw text entered by the user
     */
    updateCell: function(cellId, input) {
        // 1. Initialize cell if not exists
        if (!this.state[cellId]) {
            this.state[cellId] = { value: "", formula: "", style: {} };
        }

        const cell = this.state[cellId];

        // 2. Determine if it is a formula
        if (input.startsWith("=")) {
            cell.formula = input;
            cell.value = this.evaluateFormula(input);
        } else {
            cell.formula = "";
            cell.value = isNaN(Number(input)) ? input : Number(input);
        }

        // 3. Save to state
        this.state[cellId] = cell;

        // 4. Trigger Updates (In a full app, we would notify the UI here)
        // For now, we return the computed value
        return cell.value;
    },

    /**
     * formatting a cell (Bold, Italic, Color)
     */
    updateStyle: function(cellId, styleKey, styleValue) {
        if (!this.state[cellId]) {
            this.state[cellId] = { value: "", formula: "", style: {} };
        }
        this.state[cellId].style[styleKey] = styleValue;
    },

    getCellData: function(cellId) {
        return this.state[cellId] || { value: "", formula: "", style: {} };
    },

    // -------------------------------------------------------------------------
    // 4. FORMULA ENGINE
    // -------------------------------------------------------------------------

    /**
     * The Brain of the spreadsheet. Parses strings like "=SUM(A1:A5)"
     */
    evaluateFormula: function(formulaInput) {
        // Remove the starting '=' and convert to uppercase for consistency
        const expression = formulaInput.substring(1).toUpperCase();

        try {
            // A. Handle Ranges: SUM(A1:A5), AVG(B2:B10)
            if (expression.includes("SUM(") || expression.includes("AVG(") || 
                expression.includes("MAX(") || expression.includes("MIN(")) {
                return this.evaluateRangeFunction(expression);
            }

            // B. Handle Basic Math: A1 + B1
            // We use Regex to find cell IDs (like A1, Z99) and replace them with values
            const parsedExpression = expression.replace(/[A-Z]+[0-9]+/g, (match) => {
                const cell = this.state[match];
                const val = cell ? cell.value : 0;
                return isNaN(Number(val)) ? 0 : val; 
            });

            // Safe Evaluation (Basic Math)
            // Note: In production, we'd use a parser library, but 'eval' works for this logic demo
            return eval(parsedExpression); 

        } catch (error) {
            console.error("Formula Error:", error);
            return "#ERROR";
        }
    },

    // --- REPLACE THIS SECTION IN YOUR core.js ---

    evaluateRangeFunction: function(expr) {
        // Updated Regex to capture Function Name and Arguments
        // Supports: SUM(A1:A5), MAX(A1, B1), POWER(A1, 2)
        const match = expr.match(/([A-Z0-9]+)\((.*)\)/);
        
        if (!match) return "#FORMULA_ERR";

        const funcName = match[1];     // e.g. "SUM" or "POWER"
        const innerContent = match[2]; // e.g. "A1:A5" or "A1, 2"

        // 1. Parse Arguments
        // We need to split by comma, but handle ranges like A1:A5
        const rawArgs = innerContent.split(",");
        const computedArgs = [];

        rawArgs.forEach(arg => {
            arg = arg.trim();
            if (arg.includes(":")) {
                // It's a range (A1:A5) -> Get all values
                const [start, end] = arg.split(":");
                const values = this.getRangeValues(start, end);
                computedArgs.push(values);
            } else if (this.state[arg]) {
                // It's a Cell Reference (A1) -> Get value
                let val = this.state[arg].value;
                computedArgs.push(isNaN(Number(val)) ? val : Number(val));
            } else {
                // It's a raw number or string (10, "Text")
                computedArgs.push(isNaN(Number(arg)) ? arg.replace(/"/g, "") : Number(arg));
            }
        });

        // 2. Execute using the new Library
        if (FormulaLib && FormulaLib.registry[funcName]) {
            return FormulaLib.execute(funcName, computedArgs);
        }

        return "#UNKNOWN_FUNC";
    }
    // -------------------------------------------------------------------------
    // 5. HELPER UTILITIES
    // -------------------------------------------------------------------------

    /**
     * Converts "A1" -> { col: 0, row: 0 }
     */
    parseCoordinates: function(cellId) {
        const colLetter = cellId.match(/[A-Z]+/)[0];
        const rowNum = parseInt(cellId.match(/[0-9]+/)[0]);
        
        // Convert "A" to 0, "B" to 1...
        let colIndex = 0;
        for (let i = 0; i < colLetter.length; i++) {
            colIndex = colIndex * 26 + (colLetter.charCodeAt(i) - 64);
        }

        return { col: colIndex - 1, row: rowNum - 1 };
    },

    /**
     * Gets all numerical values from a range (A1 to A5)
     */
    getRangeValues: function(startId, endId) {
        const start = this.parseCoordinates(startId);
        const end = this.parseCoordinates(endId);
        const values = [];

        for (let r = start.row; r <= end.row; r++) {
            for (let c = start.col; c <= end.col; c++) {
                // Convert back to ID: 0 -> A, 1 -> B
                const colLetter = String.fromCharCode(65 + c);
                const cellId = `${colLetter}${r + 1}`;
                
                const cell = this.state[cellId];
                const val = cell ? parseFloat(cell.value) : 0;
                values.push(isNaN(val) ? 0 : val);
            }
        }
        return values;
    }
};

// Auto-init if loaded in browser
if (typeof window !== 'undefined') {
    window.Core = Core;
}
