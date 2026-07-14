"use strict";

// PlayerManager handles video/audio playback, time display, and basic controls for the editor.
class PlayerManager {
    constructor() {
        // Elements from the DOM
        this.videoElement = document.getElementById('videoPreview');
        this.audioElement = document.getElementById('audioPreview');
        this.currentElement = null;
        this.isPlaying = false;
        this.playbackRate = 1.0;
        this.initElements();
    }

    initElements() {
        // Ensure video element is visible and styled
        if (this.videoElement) {
            this.videoElement.style.display = 'block';
            this.videoElement.style.objectFit = 'contain';
            this.videoElement.controls = true;
            this.videoElement.addEventListener('loadedmetadata', () => {
                this.updateTimeDisplay();
                this.onVideoReady();
            });
            this.videoElement.addEventListener('timeupdate', () => this.updateTimeDisplay());
            this.videoElement.addEventListener('ended', () => this.onEnded());
        }
        // Prepare audio element (hidden by default)
        if (this.audioElement) {
            this.audioElement.style.display = 'none';
            this.audioElement.controls = true;
            this.audioElement.crossOrigin = 'anonymous';
            this.audioElement.addEventListener('loadedmetadata', () => {
                this.updateTimeDisplay();
                this.onAudioReady();
            });
            this.audioElement.addEventListener('timeupdate', () => this.updateTimeDisplay());
            this.audioElement.addEventListener('ended', () => this.onEnded());
        }
    }

    // Load the first clip from the timeline (if any)
    loadCurrentElement() {
        const firstClip = window.TimelineManager && window.TimelineManager.getFirstClip
            ? window.TimelineManager.getFirstClip()
            : null;
        if (firstClip && firstClip.src) {
            this.loadClip(firstClip);
        }
    }

    // Set the element source based on clip type
    loadClip(clip) {
        if (clip.type === 'video') {
            this.currentElement = this.videoElement;
            this.videoElement.src = clip.src;
            this.videoElement.style.display = 'block';
            this.audioElement.style.display = 'none';
        } else {
            this.currentElement = this.audioElement;
            this.audioElement.src = clip.src;
            this.audioElement.style.display = 'block';
            this.videoElement.style.display = 'none';
        }
        this.currentElement.load();
        if (window.App) window.App.notify('Loaded ' + clip.name);
    }

    play() {
        if (this.currentElement) {
            this.currentElement.playbackRate = this.playbackRate;
            this.currentElement.play().then(() => {
                this.isPlaying = true;
                if (window.App) window.App.notify('Playing');
            }).catch(err => {
                console.error('Play failed:', err);
                if (window.App) window.App.notify('Play failed: ' + err.message);
            });
        } else {
            this.loadCurrentElement();
        }
    }

    pause() {
        if (this.currentElement) {
            this.currentElement.pause();
            this.isPlaying = false;
            if (window.App) window.App.notify('Paused');
        }
    }

    stop() {
        if (this.currentElement) {
            this.currentElement.pause();
            this.currentElement.currentTime = 0;
            this.isPlaying = false;
            this.updateTimeDisplay();
        }
    }

    setVolume(volume) {
        if (this.currentElement) {
            this.currentElement.volume = volume / 100;
        }
    }

    setPlaybackRate(rate) {
        this.playbackRate = rate;
        if (this.currentElement) {
            this.currentElement.playbackRate = rate;
        }
    }

    seek(time) {
        if (this.currentElement) {
            this.currentElement.currentTime = time;
            this.updateTimeDisplay();
        }
    }

    getCurrentTime() {
        return this.currentElement ? this.currentElement.currentTime : 0;
    }

    getDuration() {
        return this.currentElement ? this.currentElement.duration : 0;
    }

    isElementReady() {
        return this.currentElement && this.currentElement.readyState >= 2 && this.currentElement.duration > 0;
    }

    onVideoReady() {
        this.isPlaying = false;
        this.updateTimeDisplay();
        if (window.App) window.App.notify('Video loaded');
    }

    onAudioReady() {
        this.updateTimeDisplay();
        if (window.App) window.App.notify('Audio loaded');
    }

    onEnded() {
        this.isPlaying = false;
        this.updateTimeDisplay();
        if (window.App) window.App.notify('Playback ended');
    }

    // Update the UI time elements
    updateTimeDisplay() {
        const currentEl = document.getElementById('currentTime');
        const totalEl = document.getElementById('totalTime');
        if (currentEl) currentEl.textContent = this.formatTime(this.getCurrentTime());
        if (totalEl) totalEl.textContent = this.formatTime(this.getDuration());
        const playhead = document.getElementById('playhead');
        if (playhead && this.getDuration() > 0) {
            playhead.style.left = (this.getCurrentTime() / this.getDuration()) * 100 + '%';
        }
    }

    // Helper to format seconds as HH:MM:SS
    formatTime(seconds) {
        if (isNaN(seconds)) return '00:00:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
    }
}

// Expose the singleton instance
window.PlayerManager = new PlayerManager();
