const FormulaEngine = {
    // Main entry point
    evaluate: function(value) {
        if (!value || !value.startsWith('=')) return value;
        
        const expression = value.substring(1).toUpperCase();
        
        try {
            // 1. Handle Ranges (SUM(A1:A3))
            if (expression.includes(':')) {
                return this.evaluateRange(expression);
            }
            
            // 2. Handle Simple Math (A1+B1)
            // Replace Cell IDs (A1) with actual numbers
            const parsed = expression.replace(/[A-Z]+[0-9]+/g, (match) => {
                const val = State.data[match] || 0;
                return isNaN(Number(val)) ? 0 : val;
            });

            // Dangerous but effective for a demo
            return eval(parsed); 
        } catch (e) {
            return "#ERROR";
        }
    },

    evaluateRange: function(expr) {
        // Simple regex for SUM(A1:A5)
        const match = expr.match(/(SUM|AVG)\(([A-Z])([0-9]+):([A-Z])([0-9]+)\)/);
        if (!match) return "#ERR-FMT";

        const type = match[1]; // SUM or AVG
        const col = match[2];  // A
        const startRow = parseInt(match[3]);
        const endRow = parseInt(match[5]);

        let sum = 0;
        let count = 0;

        for (let r = startRow; r <= endRow; r++) {
            const cellId = `${col}${r}`;
            const val = parseFloat(State.data[cellId] || 0);
            sum += val;
            count++;
        }

        return type === 'SUM' ? sum : (sum / count);
    }
};
