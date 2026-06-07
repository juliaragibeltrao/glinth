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
        this.isInvulnerable = false;
        
        // Base scale for the character
        this.baseScale = 0.25;
    }

    update() {
        // Stop movement if scene tells us input is disabled
        if (this.scene.isTransitioning || this.scene.isGameOver) {
            this.setVelocity(0);
            return;
        }

        this.setVelocity(0);

        let moveX = 0;
        let moveY = 0;

        // Horizontal movement
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            moveX = -1;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            moveX = 1;
        }

        // Vertical movement
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            moveY = -1;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            moveY = 1;
        }

        const isMoving = moveX !== 0 || moveY !== 0;

        if (isMoving) {
            const vector = new Phaser.Math.Vector2(moveX, moveY).normalize().scale(this.speed);
            this.setVelocity(vector.x, vector.y);
            
            // Set correct texture and ensure absolute scale consistency
            if (moveX < 0) {
                this.setTexture('nova-side');
                this.setFlipX(false);
                this.setScale(this.baseScale); 
            } else if (moveX > 0) {
                this.setTexture('nova-side');
                this.setFlipX(true);
                this.setScale(this.baseScale);
            } else if (moveY < 0) {
                this.setTexture('nova-back');
                this.setFlipX(false);
                this.setScale(this.baseScale); 
            } else {
                this.setTexture('nova-front');
                this.setFlipX(false);
                this.setScale(this.baseScale);
            }

            // Procedural walking animation: subtle bobbing and tilt
            this.angle = Math.sin(this.scene.time.now / 100) * 2;
            const walkScale = 0.005 * Math.sin(this.scene.time.now / 80);
            this.scaleX += walkScale;
            this.scaleY -= walkScale;

        } else {
            // Idle state: reset rotation and maintain base scale
            this.setTexture('nova-front');
            this.setFlipX(false);
            this.setScale(this.baseScale);
            this.angle = 0;
            
            // Gentle idle float
            this.y += Math.sin(this.scene.time.now / 400) * 0.1;
        }
    }
}