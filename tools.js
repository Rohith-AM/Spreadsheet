const Tools = {
    toggleBold: function() {
        document.execCommand('bold');
    },

    toggleItalic: function() {
        document.execCommand('italic');
    },

    downloadCSV: function() {
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Simple export of first 20 rows for demo
        for(let r=1; r<=20; r++){
            let row = [];
            for(let c=0; c<10; c++){
                const cellId = `${String.fromCharCode(65 + c)}${r}`;
                row.push(State.data[cellId] || "");
            }
            csvContent += row.join(",") + "\r\n";
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "nexora_data.csv");
        document.body.appendChild(link);
        link.click();
    }
};
