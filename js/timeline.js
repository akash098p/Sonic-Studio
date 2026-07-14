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

    async addClip(clip, trackIndex = this.currentTrackIndex) {
        if (!this.tracks[trackIndex]) {
            console.error("Invalid track index:", trackIndex);
            return;
        }

        const track = this.tracks[trackIndex];
        
        // Get duration from video/audio element
        if (clip.type === 'video' || clip.type === 'audio') {
            clip.duration = await this.getClipDuration(clip);
        }
        
        clip.id = clip.id || `clip-${Date.now()}-${this.clipCounter++}`;
        clip.trackIndex = trackIndex;
        clip.startTime = track.clips.reduce((total, c) => total + (c.duration || 0), 0);
        clip.endTime = clip.startTime + clip.duration;

        track.clips.push(clip);
        this.renderClip(clip, track, trackIndex);
        
        // Update timeline width
        this.updateTimelineWidth();
        
        window.App?.notify?.(`Added ${clip.name} to ${track.name}`);
    }

    async getClipDuration(clip) {
        return new Promise((resolve) => {
            if (!clip.src) {
                resolve(5); // Default 5 seconds
                return;
            }

            const media = clip.type === 'video' ? document.createElement('video') : document.createElement('audio');
            media.src = clip.src;
            media.preload = 'metadata';
            media.crossOrigin = "anonymous";

            const onLoaded = () => {
                media.removeEventListener('loadedmetadata', onLoaded);
                media.removeEventListener('error', onError);
                resolve(media.duration || 5);
            };

            const onError = () => {
                media.removeEventListener('loadedmetadata', onLoaded);
                media.removeEventListener('error', onError);
                resolve(5);
            };

            media.addEventListener('loadedmetadata', onLoaded, { once: true });
            media.addEventListener('error', onError, { once: true });

            // Timeout for 3 seconds
            setTimeout(() => {
                media.removeEventListener('loadedmetadata', onLoaded);
                media.removeEventListener('error', onError);
                resolve(5);
            }, 3000);
        });
    }

    renderClip(clip, track, trackIndex) {
        if (!track.element) return;

        const clipEl = document.createElement('div');
        clipEl.className = `${clip.type}`;
        clipEl.id = clip.id;
        clipEl.dataset.clipId = clip.id;
        clipEl.dataset.trackIndex = trackIndex;
        
        // Position based on start time (50px per second)
        clipEl.style.left = `${clip.startTime * 50}px`;
        clipEl.style.width = `${Math.max(50, clip.duration * 50)}px`;

        const durationMinutes = Math.floor(clip.duration / 60);
        const durationSeconds = Math.floor(clip.duration % 60);

        clipEl.innerHTML = `
            <span class="clip-name">${clip.name}</span>
            <span class="clip-duration">${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}</span>
        `;

        // Add click to select
        clipEl.addEventListener('click', (e) => {
            document.querySelectorAll('.timeline-clip').forEach(c => c.classList.remove('selected'));
            clipEl.classList.add('selected');
            e.stopPropagation();
        });

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
            const newTime = Math.max(0, clip.startTime + (deltaX / 50));
            clip.startTime = newTime;
            clipEl.style.left = `${newTime * 50}px`;
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
            timeline.style.width = `${Math.max(600, totalDuration * 50)}px`;
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

    getNextClip() {
        // Return the currently selected clip or first clip
        const selected = document.querySelector('.timeline-clip.selected');
        if (selected) {
            const clipId = selected.id;
            for (const track of this.tracks) {
                const clip = track.clips.find(c => c.id === clipId);
                if (clip) return clip;
            }
        }
        return this.getFirstClip();
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
        window.PlayerManager?.stop();
    }

    removeClip(clipId) {
        for (const track of this.tracks) {
            const index = track.clips.findIndex(c => c.id === clipId);
            if (index !== -1) {
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
        document.querySelectorAll('.track-header').forEach((header, i) => {
            header.classList.toggle('selected', i === trackIndex);
        });
    }

    splitSelected() {
        const selectedClip = document.querySelector('.timeline-clip.selected');
        if (!selectedClip) {
            window.App?.notify?.("No clip selected to split");
            return;
        }

        const clipId = selectedClip.id;
        for (const track of this.tracks) {
            const index = track.clips.findIndex(c => c.id === clipId);
            if (index !== -1) {
                const clip = track.clips[index];
                const midPoint = clip.startTime + (clip.duration / 2);
                
                const clip1 = { 
                    ...clip, 
                    id: `${clip.id}-a`, 
                    endTime: midPoint, 
                    duration: clip.duration / 2 
                };
                const clip2 = { 
                    ...clip, 
                    id: `${clip.id}-b`, 
                    startTime: midPoint, 
                    endTime: clip.endTime, 
                    duration: clip.duration / 2 
                };
                
                track.clips.splice(index, 1, clip2, clip1);
                this.renderClip(clip1, track, this.currentTrackIndex);
                this.renderClip(clip2, track, this.currentTrackIndex);
                this.updateTimelineWidth();
                window.App?.notify?.("Split clip");
                return;
            }
        }
    }
}

window.TimelineManager = new TimelineManager();