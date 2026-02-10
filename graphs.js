const GraphTool = {
    chartInstance: null,

    createGraph: function() {
        const modal = document.getElementById('graph-modal');
        modal.classList.remove('hidden');

        const ctx = document.getElementById('chartCanvas').getContext('2d');

        // Destroy old chart if exists
        if (this.chartInstance) this.chartInstance.destroy();

        // Gather Data from Column A (Labels) and B (Values)
        // This is a simple assumption for the demo
        const labels = [];
        const data = [];

        for(let i=1; i<=5; i++) {
            labels.push(State.data[`A${i}`] || `Row ${i}`);
            data.push(Number(State.data[`B${i}`]) || 0);
        }

        this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Dataset from Column B',
                    data: data,
                    backgroundColor: 'rgba(33, 115, 70, 0.5)',
                    borderColor: 'rgba(33, 115, 70, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: { y: { beginAtZero: true } }
            }
        });
    },

    closeGraph: function() {
        document.getElementById('graph-modal').classList.add('hidden');
    }
};
