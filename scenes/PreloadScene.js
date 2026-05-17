import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Simple progress bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Dreaming...',
            style: {
                font: '30px Quicksand',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // Load assets
        this.load.image('nova-front', 'assets/nova-main-sprite.webp'); // Main consistent sprite
        this.load.image('nova-back', 'assets/nova-back-final-webp.webp'); // Accurate silhouette back view
        this.load.image('nova-side', 'assets/nova-main-sprite.webp'); // Use main sprite for side views to keep design 100% identical
        this.load.image('nova-side-left', 'assets/nova-main-sprite.webp');
        this.load.image('nova-side-right', 'assets/nova-main-sprite.webp');
        
        this.load.image('dreamscape-bg', 'assets/dreamscape-bg.webp');
        this.load.image('map1-bg', 'assets/map1-bg-blue.webp');
        this.load.image('map2-bg', 'assets/map2-bg-orange.webp');
        this.load.image('map3-bg', 'assets/map3-bg-surreal.webp');
        
        this.load.image('crystal-shard', 'assets/crystal-shard.webp');
        this.load.image('altar', 'assets/altar.webp');
        this.load.image('spike', 'assets/shadow-crystal-webp.webp');
        this.load.image('dream-pad', 'assets/altar.webp'); // Temporary pad visual
        this.load.image('aria-guide', 'assets/aria-guide-webp.webp');
    }

    create() {
        this.scene.start('MenuScene');
    }
}