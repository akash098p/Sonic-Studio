"use strict";

class EffectsManager {
    constructor() {
        this.bassBoost = 0;
        this.trebleBoost = 0;
        this.echo = 0;
        this.reverb = 0;
        this.noiseReduction = 0;
        this.fadeInSeconds = 0;
        this.fadeOutSeconds = 0;
        this.pitchShift = 0;
        this.equalizerBands = new Array(10).fill(0);
        this.initEqualizerUI();
    }

    initEqualizerUI() {
        const container = document.getElementById("equalizerBands");
        if (!container) return;
        
        const frequencies = ['32Hz', '64Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'];
        container.innerHTML = '';
        
        frequencies.forEach((freq, i) => {
            const band = document.createElement('div');
            band.className = 'eq-band';
            band.innerHTML = `
                <label>${freq}</label>
                <input type="range" id="eqBand${i}" min="-12" max="12" value="0">
            `;
            container.appendChild(band);
        });
    }

    setBassBoost(value) {
        this.bassBoost = value;
        this.notify(`Bass Boost: ${value}dB`);
    }

    setTrebleBoost(value) {
        this.trebleBoost = value;
        this.notify(`Treble: ${value}dB`);
    }

    setEcho(amount) {
        this.echo = amount;
        this.notify(`Echo: ${amount}%`);
    }

    setReverb(amount) {
        this.reverb = amount;
        this.notify(`Reverb: ${amount}%`);
    }

    setNoiseReduction(amount) {
        this.noiseReduction = amount;
        this.notify(`Noise Reduction: ${amount}%`);
    }

    setFadeIn(seconds) {
        this.fadeInSeconds = seconds;
        this.notify(`Fade In: ${seconds}s`);
    }

    setFadeOut(seconds) {
        this.fadeOutSeconds = seconds;
        this.notify(`Fade Out: ${seconds}s`);
    }

    setPitchShift(semitones) {
        this.pitchShift = semitones;
        this.notify(`Pitch Shift: ${semitones} semitones`);
    }

    setEqualizerBand(index, value) {
        if (index >= 0 && index < this.equalizerBands.length) {
            this.equalizerBands[index] = value;
            this.notify(`EQ Band ${index + 1}: ${value}dB`);
        }
    }

    normalizeVolume() {
        this.notify("Normalizing volume...");
        // In a real implementation, this would analyze and adjust peak levels
        setTimeout(() => {
            this.notify("Volume normalized");
        }, 500);
    }

    // Apply effects to an audio context (placeholder for real audio processing)
    applyToContext(audioContext, sourceNode) {
        // This would set up Web Audio API nodes for real-time effects
        console.log("Applying effects to audio context:", {
            bassBoost: this.bassBoost,
            trebleBoost: this.trebleBoost,
            echo: this.echo,
            reverb: this.reverb,
            noiseReduction: this.noiseReduction,
            pitchShift: this.pitchShift
        });
    }

    notify(message) {
        if (window.NotificationManager) {
            window.NotificationManager.info(message);
        }
    }

    getEffectSettings() {
        return {
            bassBoost: this.bassBoost,
            trebleBoost: this.trebleBoost,
            echo: this.echo,
            reverb: this.reverb,
            noiseReduction: this.noiseReduction,
            fadeInSeconds: this.fadeInSeconds,
            fadeOutSeconds: this.fadeOutSeconds,
            pitchShift: this.pitchShift,
            equalizerBands: [...this.equalizerBands]
        };
    }
}

window.EffectsManager = new EffectsManager();