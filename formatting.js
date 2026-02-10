/**
 * Nexora Formatting Engine
 * Version: 2.5 (Rich Text Support)
 * Description: Handles cell styling including Colors, Alignment, and Fonts.
 */

const Formatting = {
    
    // -------------------------------------------------------------------------
    // 1. STYLE ACTIONS
    // -------------------------------------------------------------------------

    /**
     * General method to update any style property
     * @param {string} property - css property name (e.g., 'textAlign', 'backgroundColor')
     * @param {string} value - css value (e.g., 'center', '#ff0000')
     */
    applyStyle: function(property, value) {
        // Get currently selected cell from Events module
        const cellId = Events.selection.current;
        if (!cellId) return;

        console.log(`Nexora Format: Setting ${cellId} ${property} to ${value}`);

        // 1. Update Core State (The Brain)
        // We ensure the style object exists first
        if (!Core.state[cellId]) Core.state[cellId] = {};
        if (!Core.state[cellId].style) Core.state[cellId].style = {};
        
        Core.state[cellId].style[property] = value;

        // 2. Refresh UI (The Skin)
        // We only re-render the specific cell for performance
        this.refreshCellStyle(cellId);
    },

    toggleBold: function() {
        const cellId = Events.selection.current;
        const current = Core.getCellData(cellId).style?.fontWeight || 'normal';
        const newVal = current === 'bold' ? 'normal' : 'bold';
        this.applyStyle('fontWeight', newVal);
    },

    toggleItalic: function() {
        const cellId = Events.selection.current;
        const current = Core.getCellData(cellId).style?.fontStyle || 'normal';
        const newVal = current === 'italic' ? 'normal' : 'italic';
        this.applyStyle('fontStyle', newVal);
    },

    // -------------------------------------------------------------------------
    // 2. RENDERER HELPER
    // -------------------------------------------------------------------------

    /**
     * Directly manipulates the DOM element to show changes instantly
     */
    refreshCellStyle: function(cellId) {
        const cell = document.querySelector(`.cell[data-id="${cellId}"]`);
        if (!cell) return;

        const styleData = Core.getCellData(cellId).style || {};
        
        // Apply all known styles
        cell.style.fontWeight = styleData.fontWeight || 'normal';
        cell.style.fontStyle = styleData.fontStyle || 'normal';
        cell.style.textAlign = styleData.textAlign || 'left';
        cell.style.color = styleData.color || '#000000';
        cell.style.backgroundColor = styleData.backgroundColor || 'transparent';
    }
};

// Integration Hook
if (typeof window !== 'undefined') {
    window.Formatting = Formatting;
}
