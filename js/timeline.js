"use strict";

class TimelineManager {
    constructor() {
        this.tracks = [];
        this.currentTrackIndex = 0;
        this.clipDuration = 0;
        this.playheadPosition = 0;
        this.clipCounter = 0;
        this.initTracks();
    }

    initTracks() {
        // Video Track - matches HTML ID
        const videoTrack = {
            id: 'track-video',
            name: 'Video Track 1',
            type: 'video',
            clips: [],
            element: document.getElementById('videoTrack1')
        };
        
        // Audio Track 1 - matches HTML ID
        const audioTrack1 = {
            id: 'track-audio-1',
            name: 'Audio Track 1',
            type: 'audio',
            clips: [],
            element: document.getElementById('audioTrack1')
        };
        
        // Audio Track 2 - matches HTML ID
        const audioTrack2 = {
            id: 'track-audio-2',
            name: 'Audio Track 2',
            type: 'audio',
            clips: [],
            element: document.getElementById('audioTrack2')
        };
        
        this.tracks = [videoTrack, audioTrack1, audioTrack2];
        console.log("Timeline: Tracks initialized");
    }

    addClip(clip, trackIndex = this.currentTrackIndex) {
        if (!this.tracks[trackIndex]) {
            console.error("Invalid track index:", trackIndex);
            return;
        }
        
        const track = this.tracks[trackIndex];
        
        // Set duration from video/audio element when loaded
        if (clip.type === 'video' || clip.type === 'audio') {
            clip.duration = this.getClipDuration(clip);
        }
        
        clip.id = `clip-${Date.now()}-${this.clipCounter++}`;
        clip.trackIndex = trackIndex;
        clip.startTime = track.clips.reduce((total, c) => total + (c.duration || 0), 0);
        clip.endTime = clip.startTime + clip.duration;
        
        track.clips.push(clip);
        this.renderClip(clip, track);
        
        // Update timeline width
        this.updateTimelineWidth();
        
        window.App.notify(`Added ${clip.name} to ${track.name}`);
    }

    getClipDuration(clip) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = clip.src;
            video.preload = 'metadata';
            video.addEventListener('loadedmetadata', () => {
                resolve(video.duration || 0);
            }, { once: true });
            video.addEventListener('error', () => {
                resolve(0);
            }, { once: true });
        });
    }

    renderClip(clip, track) {
        if (!track.element) return;
        
        const clipEl = document.createElement('div');
        clipEl.className = `timeline-clip ${clip.type}`;
        clipEl.id = clip.id;
        clipEl.dataset.clipId = clip.id;
        clipEl.dataset.trackIndex = trackIndex;
        
        const durationMinutes = Math.floor(clip.duration / 60);
        const durationSeconds = Math.floor(clip.duration % 60);
        
        clipEl.innerHTML = `
            <span class="clip-name">${clip.name}</span>
            <span class="clip-duration">${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}</span>
        `;
        
        // Add drag functionality
        clipEl.addEventListener('mousedown', (e) => this.onClipMouseDown(e, clip, track));
        
        track.element.appendChild(clipEl);
    }

    onClipMouseDown(e, clip, track) {
        e.preventDefault();
        
        const clipEl = e.currentTarget;
        const startX = e.clientX;
        let currentX = startX;
        
        const onMouseMove = (moveEvent) => {
            currentX = moveEvent.clientX;
            const deltaX = currentX - startX;
            const newTime = clip.startTime + (deltaX / 100); // Simple pixel-to-time conversion
            if (newTime >= 0) {
                clip.startTime = newTime;
                clipEl.style.left = `${newTime * 50}px`;
            }
        };
        
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    updateTimelineWidth() {
        const timeline = document.getElementById('tracksContainer');
        if (timeline) {
            const totalDuration = this.tracks.reduce((sum, track) => 
                sum + track.clips.reduce((t, c) => t + (c.duration || 0), 0), 0);
            timeline.style.width = `${totalDuration * 50}px`;
        }
    }

    getClips(trackIndex = null) {
        if (trackIndex !== null) {
            return this.tracks[trackIndex]?.clips || [];
        }
        return this.tracks.flatMap(t => t.clips);
    }

    getFirstClip() {
        for (const track of this.tracks) {
            if (track.clips.length > 0) {
                return track.clips[0];
            }
        }
        return null;
    }

    displayClips(clips) {
        this.clearClips();
        clips.forEach(clip => {
            const trackIndex = clip.trackIndex !== undefined ? clip.trackIndex : 0;
            this.addClip(clip, trackIndex);
        });
    }

    clearClips() {
        this.tracks.forEach(track => {
            track.clips = [];
            if (track.element) {
                track.element.innerHTML = '';
            }
        });
    }

    updatePlayhead(position) {
        const playhead = document.getElementById('playhead');
        if (playhead) {
            playhead.style.left = `${position}%`;
        }
    }

    onPlaybackEnded() {
        this.playheadPosition = 0;
        this.updatePlayhead(0);
        window.PlayerManager.stop();
    }

    removeClip(clipId) {
        for (const track of this.tracks) {
            const index = track.clips.findIndex(c => c.id === clipId);
            if (index !== -1) {
                const clip = track.clips[index];
                const el = document.getElementById(clipId);
                if (el) el.remove();
                track.clips.splice(index, 1);
                this.updateTimelineWidth();
                return true;
            }
        }
        return false;
    }

    selectTrack(trackIndex) {
        this.currentTrackIndex = trackIndex;
        // Update UI selection
        document.querySelectorAll('.track-header').forEach((header, i) => {
            header.classList.toggle('selected', i === trackIndex);
        });
    }
}

window.TimelineManager = new TimelineManager();