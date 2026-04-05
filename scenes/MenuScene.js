import Phaser from 'phaser';
import { audioManager } from '../AudioManager.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const { width, height } = this.scale;

        // Background
        const bg = this.add.image(width / 2, height / 2, 'dreamscape-bg');
        bg.setDisplaySize(width, height);
        bg.setAlpha(0.6);

        // Title
        const titleText = this.add.text(width / 2, height / 2 - 100, 'GLINTH', {
            fontFamily: 'Quicksand',
            fontSize: '120px',
            fontWeight: '700',
            color: '#ffffff',
            stroke: '#7e57c2',
            strokeThickness: 8
        }).setOrigin(0.5);

        const subtitleText = this.add.text(width / 2, height / 2 + 20, 'A Dreamer\'s Odyssey', {
            fontFamily: 'Quicksand',
            fontSize: '40px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Start Button
        const startButton = this.add.text(width / 2, height / 2 + 150, 'Wake Up', {
            fontFamily: 'Quicksand',
            fontSize: '50px',
            color: '#ffffff',
            backgroundColor: '#7e57c2',
            padding: { x: 40, y: 20 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', async () => {
            await audioManager.init();
            this.cameras.main.fadeOut(1000, 255, 255, 255);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene', { mapIndex: 0, lives: 3 });
            });
        })
        .on('pointerover', () => startButton.setStyle({ fill: '#ffeb3b' }))
        .on('pointerout', () => startButton.setStyle({ fill: '#ffffff' }));

        // Gentle floating animation for title
        this.tweens.add({
            targets: [titleText, subtitleText],
            y: '-=20',
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        this.cameras.main.fadeIn(1000, 255, 255, 255);
    }
}