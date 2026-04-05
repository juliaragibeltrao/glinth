import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'nova-front');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setScale(0.25); // Smaller for 1080p puzzle world
        
        // Custom movement speed
        this.speed = 400; // Increased for better feel in 1080p

        // Controls
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Facing direction
        this.facing = 'front';
    }

    update() {
        // Stop movement if scene tells us input is disabled
        if (this.scene.player && !this.scene.player.inputEnabled) {
            this.setVelocity(0);
            return;
        }

        this.setVelocity(0);

        let isMoving = false;

        // Simplified movement: Always use the main front-facing texture from the upload
        // We only flip it horizontally for side movement to keep it consistent
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.setVelocityX(-this.speed);
            this.setFlipX(false);
            isMoving = true;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.setVelocityX(this.speed);
            this.setFlipX(true);
            isMoving = true;
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.setVelocityY(-this.speed);
            isMoving = true;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.setVelocityY(this.speed);
            isMoving = true;
        }

        // Normalize speed for diagonal movement
        if (this.body.velocity.x !== 0 && this.body.velocity.y !== 0) {
            this.body.velocity.normalize().scale(this.speed);
        }

        // Smooth floating animation
        if (!isMoving) {
            this.y += Math.sin(this.scene.time.now / 400) * 0.15;
            this.setScale(0.25); // Baseline scale
        } else {
            // Subtle "walking" squash/stretch
            this.setScale(0.25 + Math.sin(this.scene.time.now / 100) * 0.01, 0.25 - Math.sin(this.scene.time.now / 100) * 0.01);
        }
    }
}