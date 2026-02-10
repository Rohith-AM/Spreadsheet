/**
 * Nexora Formula Library
 * Version: 3.0 (Scientific Standard)
 * Description: comprehensive library of mathematical, statistical, and logical functions.
 */

const FormulaLib = {
    
    // The Registry: Maps "FUNCTION_NAME" -> JavaScript Logic
    registry: {
        
        // --- 1. BASIC MATH ---
        "SUM": (args) => args.reduce((a, b) => a + (Number(b) || 0), 0),
        "ABS": (args) => Math.abs(args[0]),
        "FLOOR": (args) => Math.floor(args[0]),
        "CEILING": (args) => Math.ceil(args[0]),
        "ROUND": (args) => Math.round(args[0]),
        "POWER": (args) => Math.pow(args[0], args[1]), // =POWER(2, 3) -> 8
        "SQRT": (args) => Math.sqrt(args[0]),
        "MOD": (args) => args[0] % args[1],
        "INT": (args) => parseInt(args[0]),
        "RAND": () => Math.random(),
        
        // --- 2. STATISTICS ---
        "AVG": (args) => {
            const sum = args.reduce((a, b) => a + (Number(b) || 0), 0);
            return args.length ? sum / args.length : 0;
        },
        "AVERAGE": (args) => FormulaLib.registry["AVG"](args), // Alias
        "COUNT": (args) => args.filter(n => !isNaN(n) && n !== "").length,
        "COUNTA": (args) => args.filter(n => n !== null && n !== "").length,
        "MAX": (args) => Math.max(...args),
        "MIN": (args) => Math.min(...args),
        "MEDIAN": (args) => {
            const sorted = args.map(Number).sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        },

        // --- 3. TRIGONOMETRY (Expects Radians) ---
        "PI": () => Math.PI,
        "SIN": (args) => Math.sin(args[0]),
        "COS": (args) => Math.cos(args[0]),
        "TAN": (args) => Math.tan(args[0]),
        "ASIN": (args) => Math.asin(args[0]),
        "ACOS": (args) => Math.acos(args[0]),
        "ATAN": (args) => Math.atan(args[0]),
        
        // --- 4. LOGIC ---
        // usage: =IF(10 > 5, "Yes", "No") - *Requires special parser handling in Core*
        "TRUE": () => true,
        "FALSE": () => false,
        "NOT": (args) => !args[0],
        "AND": (args) => args.every(val => val === true || val > 0),
        "OR": (args) => args.some(val => val === true || val > 0),

        // --- 5. TEXT / STRING ---
        "LEN": (args) => String(args[0]).length,
        "UPPER": (args) => String(args[0]).toUpperCase(),
        "LOWER": (args) => String(args[0]).toLowerCase(),
        "TRIM": (args) => String(args[0]).trim(),
        "CONCAT": (args) => args.join(""), // =CONCAT(A1, " ", B1)
        "LEFT": (args) => String(args[0]).substring(0, args[1]),
        "RIGHT": (args) => {
            const str = String(args[0]);
            return str.substring(str.length - args[1]);
        },

        // --- 6. DATE & TIME ---
        "NOW": () => new Date().toLocaleString(),
        "TODAY": () => new Date().toLocaleDateString(),
        "YEAR": (args) => new Date(args[0]).getFullYear(),
        "MONTH": (args) => new Date(args[0]).getMonth() + 1,
        "DAY": (args) => new Date(args[0]).getDate(),
    },

    /**
     * Main execution entry point.
     * @param {string} funcName - "SUM", "AVG", etc.
     * @param {Array} args - The values [1, 2, 3] or ["apple", "banana"]
     */
    execute: function(funcName, args) {
        const fn = this.registry[funcName.toUpperCase()];
        
        if (!fn) {
            return "#NAME?"; // Excel standard error for unknown function
        }

        try {
            // Flatten arguments (so =SUM(A1:A3, B1) works)
            const flatArgs = args.flat(Infinity);
            return fn(flatArgs);
        } catch (err) {
            console.error(err);
            return "#VALUE!";
        }
    }
};

// Integration Hook
if (typeof window !== 'undefined') {
    window.FormulaLib = FormulaLib;
}
