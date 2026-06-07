import Phaser from 'phaser';
import { audioManager } from '../AudioManager.js';

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    create() {
        const { width, height } = this.scale;

        // Dark dim background overlay
        this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

        // Menu Panel
        const panelWidth = 700;
        const panelHeight = 650;
        const panel = this.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x1a1a1a, 0.95);
        panel.setStrokeStyle(6, 0x7e57c2);

        // Title
        this.add.text(width / 2, height / 2 - 250, 'PAUSED', {
            fontFamily: 'Quicksand',
            fontSize: '72px',
            fontWeight: '700',
            color: '#ffffff'
        }).setOrigin(0.5);

        // --- VOLUME SECTION ---
        const volY = height / 2 - 80;
        this.add.text(width / 2, volY, 'Volume', {
            fontFamily: 'Quicksand',
            fontSize: '32px',
            color: '#bdc3c7'
        }).setOrigin(0.5);

        const barWidth = 400;
        const barHeight = 12;
        const sliderX = width / 2 - barWidth / 2;
        const sliderY = volY + 60;
        
        this.add.rectangle(width / 2, sliderY, barWidth, barHeight, 0x34495e);
        
        const currentVol = audioManager.getVolume();
        const barFill = this.add.rectangle(sliderX, sliderY, barWidth * currentVol, barHeight, 0x7e57c2).setOrigin(0, 0.5);
        const handle = this.add.circle(sliderX + (barWidth * currentVol), sliderY, 18, 0xffffff);
        handle.setStrokeStyle(4, 0x7e57c2);
        handle.setInteractive({ useHandCursor: true, draggable: true });

        handle.on('drag', (pointer, dragX) => {
            const minX = sliderX;
            const maxX = sliderX + barWidth;
            const boundedX = Phaser.Math.Clamp(dragX, minX, maxX);
            
            handle.x = boundedX;
            const volPercent = (boundedX - minX) / barWidth;
            barFill.width = boundedX - minX;
            audioManager.setVolume(volPercent);
        });

        // Mute Toggle Button
        const muteBtn = this.add.text(width / 2, sliderY + 70, audioManager.isMuted ? 'UNMUTE SOUND' : 'MUTE SOUND', {
            fontFamily: 'Quicksand',
            fontSize: '24px',
            fontWeight: '700',
            color: '#ffffff',
            backgroundColor: audioManager.isMuted ? '#e74c3c' : '#2ecc71',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            const muted = audioManager.toggleMute();
            muteBtn.setText(muted ? 'UNMUTE SOUND' : 'MUTE SOUND');
            muteBtn.setBackgroundColor(muted ? '#e74c3c' : '#2ecc71');
        });

        // --- BUTTON SECTION ---
        const buttonStyle = {
            fontFamily: 'Quicksand',
            fontSize: '36px',
            fontWeight: '700',
            color: '#ffffff',
            backgroundColor: '#7e57c2',
            padding: { x: 40, y: 15 },
            fixedWidth: 400,
            align: 'center'
        };

        // Resume Button
        const resumeBtn = this.add.text(width / 2, height / 2 + 120, 'BACK TO GAME', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.resumeGame())
            .on('pointerover', () => resumeBtn.setBackgroundColor('#9b59b6'))
            .on('pointerout', () => resumeBtn.setBackgroundColor('#7e57c2'));

        // Restart Button
        const restartBtn = this.add.text(width / 2, height / 2 + 220, 'RESTART LEVEL', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.restartLevel())
            .on('pointerover', () => restartBtn.setBackgroundColor('#c0392b'))
            .on('pointerout', () => restartBtn.setBackgroundColor('#7e57c2'));

        // Keyboard Shortcut: ESC to resume
        this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
    }

    resumeGame() {
        this.scene.resume('GameScene');
        this.scene.stop();
    }

    restartLevel() {
        const gameScene = this.scene.get('GameScene');
        audioManager.stopAll();
        gameScene.scene.restart({ mapIndex: gameScene.currentMapIndex, lives: 3 });
        this.scene.stop();
    }
}