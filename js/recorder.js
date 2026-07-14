"use strict";

class RecorderManager {
    constructor() {
        this.mediaRecorder = null;
        this.recording = false;
        this.audioChunks = [];
        this.stream = null;
        this.recordedBlob = null;
    }

    async startRecording() {
        try {
            // For microphone recording
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                audio: true, 
                video: false 
            });
            
            this.mediaRecorder = new MediaRecorder(this.stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                this.recordedBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                const clip = {
                    id: Date.now() + Math.random(),
                    name: `Recording ${new Date().toLocaleTimeString()}`,
                    type: 'audio',
                    src: URL.createObjectURL(this.recordedBlob),
                    duration: 0
                };
                window.UIManager?.addClipToLibrary?.(clip);
                window.UIManager?.addClipToTimeline?.(clip);
            };
            
            this.mediaRecorder.start();
            this.recording = true;
            window.App?.notify("Recording started");
        } catch (error) {
            console.error("Recording failed:", error);
            window.App?.notify(`Recording failed: ${error.message}`);
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.recording) {
            this.mediaRecorder.stop();
            this.stream.getTracks().forEach(track => track.stop());
            this.recording = false;
            window.App?.notify("Recording saved");
        }
    }

    async startScreenRecording() {
        try {
            this.stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });
            
            this.mediaRecorder = new MediaRecorder(this.stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                this.recordedBlob = new Blob(this.audioChunks, { type: 'video/webm' });
                const clip = {
                    id: Date.now() + Math.random(),
                    name: `Screen Recording ${new Date().toLocaleTimeString()}`,
                    type: 'video',
                    src: URL.createObjectURL(this.recordedBlob),
                    duration: 0
                };
                window.UIManager?.addClipToLibrary?.(clip);
                window.UIManager?.addClipToTimeline?.(clip);
            };
            
            this.mediaRecorder.start();
            this.recording = true;
            window.App?.notify("Screen recording started");
        } catch (error) {
            console.error("Screen recording failed:", error);
            window.App?.notify(`Screen recording failed: ${error.message}`);
        }
    }
}

window.RecorderManager = new RecorderManager();