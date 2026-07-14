"use strict";

class EditorManager {
    constructor() {
        this.history = [];
        this.redoStack = [];
        this.maxHistory = 50;
        this.clipboard = null;
        this.initShortcuts();
    }

    initShortcuts() {
        document.addEventListener('keydown', (e) => {
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
        window.App?.notify?.("Undo: " + action.type);
    }

    redo() {
        if (this.redoStack.length === 0) return;
        const action = this.redoStack.pop();
        this.history.push(action);
        this.executeRedo(action);
        window.App?.notify?.("Redo: " + action.type);
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
            case 'cut_clip':
                // Re-add the cut clip
                window.TimelineManager.addClip(action.clip, action.trackIndex);
                break;
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
            case 'cut_clip':
                window.TimelineManager.removeClip(action.clipId);
                break;
            default:
                console.log("Redo not implemented for:", action.type);
        }
    }

    copy() {
        const selectedClip = document.querySelector('.timeline-clip.selected');
        if (selectedClip) {
            const clipId = selectedClip.id;
            const trackIndex = parseInt(selectedClip.dataset.trackIndex);
            const clipData = window.TimelineManager.getClips(trackIndex).find(c => c.id === clipId);
            
            if (clipData) {
                this.clipboard = {
                    clipId,
                    clip: JSON.parse(JSON.stringify(clipData)), // Deep copy
                    trackIndex
                };
                window.App?.notify?.("Clip copied to clipboard");
            } else {
                window.App?.notify?.("Could not find clip data");
            }
        } else {
            window.App?.notify?.("No clip selected to copy");
        }
    }

    cut() {
        const selectedClip = document.querySelector('.timeline-clip.selected');
        if (selectedClip) {
            this.copy(); // Copy first
            this.delete(); // Then delete
            window.App?.notify?.("Clip cut to clipboard");
        } else {
            window.App?.notify?.("No clip selected to cut");
        }
    }

    paste() {
        if (!this.clipboard) {
            window.App?.notify?.("Nothing in clipboard");
            return;
        }
        
        // For simplicity, we'll add a copy of the clipped clip to the same track
        const clipToPaste = {...this.clipboard.clip};
        clipToPaste.id = `clip-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        clipToPaste.startTime = window.PlayerManager?.getCurrentTime?.() || 0;
        
        window.TimelineManager.addClip(clipToPaste, this.clipboard.trackIndex);
        this.addToHistory({type: 'add_clip', clipId: clipToPaste.id, clip: clipToPaste, trackIndex: this.clipboard.trackIndex});
        window.App?.notify?.("Clip pasted");
    }

    delete() {
        const selectedClip = document.querySelector('.timeline-clip.selected');
        if (selectedClip) {
            const clipId = selectedClip.id;
            const trackIndex = parseInt(selectedClip.dataset.trackIndex);
            const clipData = window.TimelineManager.getClips(trackIndex).find(c => c.id === clipId);
            
            if (clipData) {
                window.TimelineManager.removeClip(clipId);
                this.addToHistory({type: 'remove_clip', clipId, clip: clipData, trackIndex});
                window.App?.notify?.("Clip deleted");
            }
        } else {
            window.App?.notify?.("No clip selected to delete");
        }
    }

    duplicate() {
        const selectedClip = document.querySelector('.timeline-clip.selected');
        if (selectedClip) {
            const clipId = selectedClip.id;
            const trackIndex = parseInt(selectedClip.dataset.trackIndex);
            const clipData = window.TimelineManager.getClips(trackIndex).find(c => c.id === clipId);
            
            if (clipData) {
                const clipToDuplicate = {...clipData};
                clipToDuplicate.id = `clip-${Date.now()}-${Math.floor(Math.random()*1000)}`;
                clipToDuplicate.startTime = clipData.startTime + clipData.duration; // Place after original
                
                window.TimelineManager.addClip(clipToDuplicate, trackIndex);
                this.addToHistory({type: 'add_clip', clipId: clipToDuplicate.id, clip: clipToDuplicate, trackIndex});
                window.App?.notify?.("Clip duplicated");
            }
        } else {
            window.App?.notify?.("No clip selected to duplicate");
        }
    }

    split() {
        const selectedClip = document.querySelector('.timeline-clip.selected');
        if (selectedClip) {
            window.TimelineManager.splitSelected();
        } else {
            window.App?.notify?.("No clip selected to split");
        }
    }

    trim() {
        window.App?.notify?.("Trim function called");
        // Implementation would trim selected clip at playhead position
    }

    getCurrentClip() {
        return document.querySelector('.timeline-clip.selected');
    }
}

window.EditorManager = new EditorManager();

// Expose methods to window for easy access from HTML buttons
window.undo = () => window.EditorManager.undo();
window.redo = () => window.EditorManager.redo();
window.cut = () => window.EditorManager.cut();
window.copy = () => window.EditorManager.copy();
window.paste = () => window.EditorManager.paste();
window.del = () => window.EditorManager.delete();
window.duplicate = () => window.EditorManager.duplicate();
window.splitClip = () => window.EditorManager.split();
window.trimClip = () => window.EditorManager.trim();