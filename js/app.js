"use strict";

class App {
    constructor() {
        this.uiManager = new UIManager();
        this.playerManager = new PlayerManager();
        this.timelineManager = new TimelineManager();
        this.storageManager = new StorageManager();
        this.isRunning = true;
        this.initialize();
    }

    initialize() {
        console.log("Initializing SonicStudio...");
        this.uiManager.init();
        this.setupMainLoop();
        this.setupNotifications();
        this.loadTheme();
    }

    setupMainLoop() {
        // Start the animation loop for timeline updates
        this.lastTimestamp = performance.now();
        this.updateLoop();
    }

    updateLoop() {
        const now = performance.now();
        const deltaTime = now - this.lastTimestamp;
        this.lastTimestamp = now;

        // Update timeline playhead position based on time
        // For simplicity, assume 1 second = 100 pixels (scaled)
        const timelineWidth = document.getElementById('timelineContainer').offsetWidth;
        const pixelsPerSecond = timelineWidth / 60; // 60 seconds timeline
        
        // Update playhead position (this would be driven by actual timeline events in a real app)
        // For now, just keep it at 0 to show the UI is ready
        // In a real implementation, we would have timeline events that move the playhead
        
        requestAnimationFrame(() => this.updateLoop());
    }

    setupNotifications() {
        // This would handle status messages, but for now just log
        window.App = this; // Make App globally accessible for notifications
    }

    loadTheme() {
        // Load the default theme (Dark)
        const themeSelect = document.getElementById("themeSelector");
        if (themeSelect) {
            themeSelect.value = "Dark";
            this.uiManager.applyTheme("Dark");
        }
    }

    // Method to trigger export (stub)
    exportProject(format) {
        console.log(`Exporting project in ${format} format...`);
        // In a real app, this would send data to server and receive progress updates
    }

    // Method to handle recording actions
    startRecording() {
        console.log("Recording started (stub)");
    }

    stopRecording() {
        console.log("Recording stopped (stub)");
    }
}

window.App = new App();