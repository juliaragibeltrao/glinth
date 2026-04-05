import * as Tone from 'tone';

class AudioManager {
    constructor() {
        this.synth = null;
        this.reverb = null;
        this.loop = null;
        this.isInitialized = false;
        this.lastVolume = 1;
        this.isMuted = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        await Tone.start();
        
        this.reverb = new Tone.Reverb({
            decay: 4,
            preDelay: 0.1,
            wet: 0.5
        }).toDestination();

        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.1,
                decay: 0.2,
                sustain: 1,
                release: 1
            }
        }).connect(this.reverb);

        // Global volume control
        Tone.getDestination().volume.value = 0; // Default at 0dB (1.0 linear)

        this.isInitialized = true;
    }

    setVolume(value) {
        if (!this.isInitialized) return;
        this.lastVolume = value;
        if (this.isMuted) return;
        
        // value is 0 to 1 linear gain
        // Logarithmic volume mapping: dB = 20 * log10(gain)
        const db = (value <= 0) ? -100 : 20 * Math.log10(value);
        Tone.getDestination().volume.rampTo(db, 0.1);
    }

    getVolume() {
        return this.lastVolume;
    }

    toggleMute() {
        if (!this.isInitialized) return false;
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            Tone.getDestination().volume.rampTo(-100, 0.1);
        } else {
            const db = (this.lastVolume <= 0) ? -100 : 20 * Math.log10(this.lastVolume);
            Tone.getDestination().volume.rampTo(db, 0.1);
        }
        return this.isMuted;
    }

    startDreamAmbience(mapIndex) {
        if (!this.isInitialized) return;
        if (this.loop) this.loop.stop();

        const scales = [
            ['C4', 'E4', 'G4', 'B4', 'D5'], // Gentle Shallows
            ['A3', 'C4', 'E4', 'G4', 'B4'], // Autumnal Echoes
            ['F3', 'Ab3', 'C4', 'Eb4', 'G4'] // Chronos Void
        ];

        const scale = scales[mapIndex % scales.length];

        this.loop = new Tone.Loop(time => {
            const note = scale[Math.floor(Math.random() * scale.length)];
            this.synth.triggerAttackRelease(note, '4n', time, Math.random() * 0.1 + 0.1);
        }, '2n').start(0);

        Tone.Transport.bpm.value = 60;
        Tone.Transport.start();
    }

    playCollectSfx() {
        if (!this.isInitialized) return;
        const synth = new Tone.MonoSynth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.05, release: 0.5 }
        }).toDestination();
        synth.triggerAttackRelease('C5', '8n');
    }

    playHitSfx() {
        if (!this.isInitialized) return;
        const noise = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0 }
        }).toDestination();
        noise.triggerAttackRelease('16n');
    }

    stopAll() {
        if (this.loop) this.loop.stop();
        Tone.Transport.stop();
    }
}

export const audioManager = new AudioManager();