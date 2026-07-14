"use strict";

class EditorManager {
    constructor() {
        this.history = [];
        this.redoStack = [];
        this.maxHistory = 50;
        this.initShortcuts();
    }

    initShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Z for undo
            if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
            // Ctrl+Y or Ctrl+Shift+Z for redo
            if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
                e.preventDefault();
                this.redo();
            }
            // Ctrl+C for copy
            if (e.ctrlKey && e.key === 'c') {
                e.preventDefault();
                this.copy();
            }
            // Ctrl+V for paste
            if (e.ctrlKey && e.key === 'v') {
                e.preventDefault();
                this.paste();
            }
            // Delete for delete
            if (e.key === 'Delete') {
                e.preventDefault();
                this.delete();
            }
        });
    }

    addToHistory(action) {
        this.history.push(action);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
        this.redoStack = []; // Clear redo stack on new action
    }

    undo() {
        if (this.history.length === 0) return;
        const action = this.history.pop();
        this.redoStack.push(action);
        this.executeUndo(action);
        window.App.notify("Undo: " + action.type);
    }

    redo() {
        if (this.redoStack.length === 0) return;
        const action = this.redoStack.pop();
        this.history.push(action);
        this.executeRedo(action);
        window.App.notify("Redo: " + action.type);
    }

    executeUndo(action) {
        // Implement specific undo logic based on action type
        switch (action.type) {
            case 'add_clip':
                window.TimelineManager.removeClip(action.clipId);
                break;
            case 'remove_clip':
                // Re-add the clip
                window.TimelineManager.addClip(action.clip, action.trackIndex);
                break;
            // Add more cases as needed
            default:
                console.log("Undo not implemented for:", action.type);
        }
    }

    executeRedo(action) {
        // Implement specific redo logic based on action type
        switch (action.type) {
            case 'add_clip':
                window.TimelineManager.addClip(action.clip, action.trackIndex);
                break;
            case 'remove_clip':
                window.TimelineManager.removeClip(action.clipId);
                break;
            default:
                console.log("Redo not implemented for:", action.type);
        }
    }

    copy() {
        const selectedClip = document.querySelector('.timeline-clip.selected');
        if (selectedClip) {
            this.clipboard = {
                clipId: selectedClip.id,
                clipData: JSON.parse(JSON.stringify(window.TimelineManager.getClips().find(c => c.id === selectedClip.id)))
            };
            window.App.notify("Clip copied to clipboard");
        } else {
            window.App.notify("No clip selected to copy");
        }
    }

    paste() {
        if (!this.clipboard) {
            window.App.notify("Nothing in clipboard");
            return;
        }
        // For simplicity, we'll add a copy of the clipped clip to the same track
        const clipToPaste = {...this.clipboard.clipData};
        clipToPaste.id = `clip-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        window.TimelineManager.addClip(clipToPaste, 0); // Paste to first track for now
        this.addToHistory({type: 'add_clip', clipId: clipToPaste.id, clip: clipToPaste, trackIndex: 0});
        window.App.notify("Clip pasted");
    }

    delete() {
        const selectedClip = document.querySelector('.timeline-clip.selected');
        if (selectedClip) {
            const clipId = selectedClip.id;
            const trackIndex = parseInt(selectedClip.dataset.trackIndex);
            const clipData = window.TimelineManager.getClips().find(c => c.id === clipId);
            
            if (clipData) {
                window.TimelineManager.removeClip(clipId);
                this.addToHistory({type: 'remove_clip', clipId, clip: clipData, trackIndex});
                window.App.notify("Clip deleted");
            }
        } else {
            window.App.notify("No clip selected to delete");
        }
    }

    split() {
        // Implementation for splitting a clip at playhead position
        window.App.notify("Split function called (not fully implemented)");
    }

    trim() {
        // Implementation for trimming a clip
        window.App.notify("Trim function called (not fully implemented)");
    }
}

window.EditorManager = new EditorManager();

// Expose methods to window for easy access from HTML buttons
window.undo = () => window.EditorManager.undo();
window.redo = () => window.EditorManager.redo();
window.cut = () => window.EditorManager.copy(); // Simplified: cut is copy then delete
window.copy = () => window.EditorManager.copy();
window.paste = () => window.EditorManager.paste();
window.del = () => window.EditorManager.delete();
window.splitClip = () => window.EditorManager.split();
window.trimClip = () => window.EditorManager.trim();