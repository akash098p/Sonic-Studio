"use strict";

/**
 * SonicStudio - Premium Browser-Based Editor
 * Main Application Controller
 */

class App {
    constructor() {
        this.isInitialized = false;
        this.initializedManagers = {};
        
        this.initialize();
    }

    async initialize() {
        try {
            console.log("🎬 Initializing SonicStudio...");
            this.showLoading("Starting up...");
            
            // Initialize managers in proper order
            await this.initManagers();
            
            // Setup DOM
            this.setupDOM();
            
            // Load theme
            this.loadTheme();
            
            // Initialize UI
            this.initUI();
            
            // Load last project
            await this.loadLastProject();
            
            this.isInitialized = true;
            this.hideLoading();
            this.notify("🎉 Welcome to SonicStudio!", "success");
            
            console.log("✅ SonicStudio initialized successfully");
        } catch (error) {
            console.error("❌ Failed to initialize:", error);
            this.hideLoading();
            this.notify(`Failed to initialize: ${error.message}`, "error");
        }
    }

    async initManagers() {
        // Managers that don't depend on each other
        this.initializedManagers.notification = new NotificationManager();
        this.initializedManagers.storage = new StorageManager();
        
        window.NotificationManager = this.initializedManagers.notification;
        window.StorageManager = this.initializedManagers.storage;
        
        // Now managers that depend on the above
        this.initializedManagers.player = new PlayerManager();
        this.initializedManagers.timeline = new TimelineManager();
        this.initializedManagers.editor = new EditorManager();
        this.initializedManagers.effects = new EffectsManager();
        this.initializedManagers.recorder = new RecorderManager();
        this.initializedManagers.export = new ExportManager();
        
        window.PlayerManager = this.initializedManagers.player;
        window.TimelineManager = this.initializedManagers.timeline;
        window.EditorManager = this.initializedManagers.editor;
        window.EffectsManager = this.initializedManagers.effects;
        window.RecorderManager = this.initializedManagers.recorder;
        window.ExportManager = this.initializedManagers.export;
    }

    setupDOM() {
        // Ensure video element is properly set up
        const videoPreview = document.getElementById('videoPreview');
        const audioPreview = document.getElementById('audioPreview');
        
        if (videoPreview) {
            videoPreview.style.display = 'block';
            videoPreview.style.position = 'relative';
            videoPreview.style.width = '100%';
            videoPreview.style.height = '100%';
            videoPreview.style.objectFit = 'contain';
            videoPreview.controls = true;
            videoPreview.style.zIndex = '10';
            videoPreview.style.backgroundColor = '#000';
        }
        
        if (audioPreview) {
            audioPreview.style.display = 'none';
            audioPreview.style.position = 'absolute';
            audioPreview.style.bottom = '20px';
            audioPreview.style.left = '50%';
            audioPreview.style.transform = 'translateX(-50%)';
            audioPreview.controls = true;
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('sonicstudio_theme') || 'Dark';
        document.body.setAttribute('data-theme', savedTheme.toLowerCase());
        
        const themeSelector = document.getElementById('themeSelector');
        if (themeSelector) {
            themeSelector.value = savedTheme;
        }
    }

    initUI() {
        // Initialize UI Manager last since it depends on everything else
        this.initializedManagers.ui = new UIManager();
        window.UIManager = this.initializedManagers.ui;
        this.initializedManagers.ui.init();
    }

    async loadLastProject() {
        try {
            const project = this.initializedManagers.storage.load('lastProject');
            if (project?.clips?.length) {
                this.initializedManagers.timeline.displayClips(project.clips);
                this.notify(`Loaded last project (${project.clips.length} clips)`);
            }
        } catch (error) {
            console.warn('Could not load last project:', error);
        }
    }

    showLoading(message) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            const p = loadingScreen.querySelector('p');
            if (p) p.textContent = message;
        }
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    notify(message, type = 'info') {
        if (this.initializedManagers.notification) {
            this.initializedManagers.notification.info(message);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    // Public methods for external use
    exportProject(format = 'MP4', quality = 'High') {
        if (this.initializedManagers.export) {
            this.initializedManagers.export.setFormat(format);
            this.initializedManagers.export.setQuality(quality);
            this.initializedManagers.export.exportProject();
        }
    }

    startRecording(type = 'microphone') {
        if (this.initializedManagers.recorder) {
            if (type === 'screen') {
                this.initializedManagers.recorder.startScreenRecording();
            } else {
                this.initializedManagers.recorder.startRecording();
            }
        }
    }

    stopRecording() {
        if (this.initializedManagers.recorder) {
            this.initializedManagers.recorder.stopRecording();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.App = new App();
});

// Backward compatibility
window.notify = (msg) => window.App?.notify?.(msg);