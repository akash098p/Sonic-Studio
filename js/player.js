"use strict";

class PlayerManager {
    constructor() {
        this.videoElement = document.getElementById("videoPreview");
        this.audioElement = document.getElementById("audioPreview");
        this.currentElement = null;
        this.isPlaying = false;
        this.playbackRate = 1.0;
        
        this.initElements();
    }

    initElements() {
        if (this.videoElement) {
            this.videoElement.addEventListener("loadedmetadata", () => this.updateDuration());
            this.videoElement.addEventListener("timeupdate", () => this.updateTimeDisplay());
            this.videoElement.addEventListener("ended", () => this.onEnded());
        }
        
        if (this.audioElement) {
            this.audioElement.addEventListener("loadedmetadata", () => this.updateDuration());
            this.audioElement.addEventListener("timeupdate", () => this.updateTimeDisplay());
            this.audioElement.addEventListener("ended", () => this.onEnded());
        }
    }

    play() {
        if (this.currentElement) {
            this.currentElement.playbackRate = this.playbackRate;
            this.currentElement.play().then(() => {
                this.isPlaying = true;
                window.App.notify("Playing");
            }).catch(err => {
                console.error("Play failed:", err);
                window.App.notify("Play failed: " + err.message);
            });
        } else {
            // Try to play the first available clip on timeline
            const firstClip = window.TimelineManager?.getFirstClip?.();
            if (firstClip) {
                this.loadClip(firstClip);
                this.play();
            }
        }
    }

    pause() {
        if (this.currentElement) {
            this.currentElement.pause();
            this.isPlaying = false;
            window.App.notify("Paused");
        }
    }

    stop() {
        if (this.currentElement) {
            this.currentElement.pause();
            this.currentElement.currentTime = 0;
            this.isPlaying = false;
            this.updateTimeDisplay();
            window.App.notify("Stopped");
        }
    }

    loadClip(clip) {
        if (!clip || !clip.src) return;
        
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
        window.App.notify(`Loaded: ${clip.name}`);
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

    updateTimeDisplay() {
        const current = document.getElementById("currentTime");
        const total = document.getElementById("totalTime");
        const time = this.getCurrentTime();
        const duration = this.getDuration();
        
        if (current) current.textContent = this.formatTime(time);
        if (total) total.textContent = this.formatTime(duration);
        
        // Update playhead position on timeline
        if (duration > 0) {
            const progress = (time / duration) * 100;
            window.TimelineManager?.updatePlayhead?.(progress);
        }
    }

    updateDuration() {
        this.updateTimeDisplay();
    }

    onEnded() {
        this.isPlaying = false;
        window.App.notify("Playback ended");
        window.TimelineManager?.onPlaybackEnded?.();
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return "00:00:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    setVolume(volume) {
        if (this.currentElement) {
            this.currentElement.volume = volume / 100;
        }
    }

    isLoaded() {
        return this.currentElement && this.currentElement.readyState >= 2;
    }
}

window.PlayerManager = new PlayerManager();