import Phaser from 'phaser';
import Player from '../entities/Player.js';
import { audioManager } from '../AudioManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.currentMapIndex = 0;
        this.lives = 3;
        this.glinthsCollected = 0;
        this.totalGlinths = 1; // Now 1 Glinth per map, revealed after completing the orb puzzle
        this.isGameOver = false;
        this.isTransitioning = false;

        this.mapConfigs = [
            {
                key: 'map1-bg',
                name: 'The Mystical Shallows',
                themeColor: 0x4fc3f7,
                difficulty: 'Gentle',
                narrative: 'Welcome, Nova! I am Aria, your guide. Look at those orbs of light... guide them to the pedestals to open your path.',
                history: 'A fragment of a memory: A childhood toy, lost in a blue sea of blankets.',
                orbCount: 2,
                particleConfig: {
                    speedX: { min: -5, max: 5 },
                    speedY: { min: -15, max: -5 },
                    scale: { start: 0.03, end: 0 },
                    alpha: { start: 0.4, end: 0 },
                    lifespan: 6000,
                    frequency: 300,
                    tint: [0x4fc3f7, 0xffffff, 0xb3e5fc]
                }
            },
            {
                key: 'map2-bg',
                name: 'Autumnal Echoes',
                themeColor: 0xffb74d,
                difficulty: 'Tricky',
                narrative: 'Be careful here, the dream is shifting. More orbs need their place for the dream to maintain its order.',
                history: 'A fragment of a memory: The sound of crunching leaves as I ran from home.',
                orbCount: 3,
                particleConfig: {
                    speedX: { min: -20, max: 20 },
                    speedY: { min: 20, max: 50 }, // Falling down like leaves
                    scale: { start: 0.04, end: 0.01 },
                    rotate: { min: 0, max: 360 },
                    alpha: { start: 0.6, end: 0 },
                    lifespan: 4000,
                    frequency: 200,
                    tint: [0xffb74d, 0xff8a65, 0xffd54f]
                }
            },
            {
                key: 'map3-bg',
                name: 'The Chronos Void',
                themeColor: 0xba68c8,
                difficulty: 'Intense',
                narrative: 'We are close to the end, but the fragments are many. Align the final pieces to find your way back home.',
                history: 'The final truth: This world is but a cage of my own making.',
                orbCount: 4,
                particleConfig: {
                    speedX: { min: -50, max: 50 },
                    speedY: { min: -50, max: 50 }, // Erratic expansion
                    scale: { start: 0.02, end: 0.05 },
                    alpha: { start: 0.3, end: 0 },
                    lifespan: 3000,
                    frequency: 100,
                    tint: [0xba68c8, 0xce93d8, 0xffffff]
                }
            }
        ];
    }

    init(data) {
        if (data && data.mapIndex !== undefined) {
            this.currentMapIndex = data.mapIndex;
        }
        if (data && data.lives !== undefined) {
            this.lives = data.lives;
        }
        this.isGameOver = false;
        this.isTransitioning = false;
        this.isRespawning = false; // Reset respawn state on init
        this.glinthsCollected = 0;
    }

    create() {
        const { width, height } = this.scale;
        const currentMap = this.mapConfigs[this.currentMapIndex];

        // Audio
        audioManager.startDreamAmbience(this.currentMapIndex);

        // Background
        this.bg = this.add.image(width / 2, height / 2, currentMap.key);
        this.bg.setDisplaySize(width, height);

        // Vine-like border
        this.createBorder();

        // Groups
        this.slots = this.add.group();
        this.orbs = this.physics.add.group({
            bounceX: 0.2, // Small bounce for better physics feel
            bounceY: 0.2,
            dragX: 800,
            dragY: 800
        });
        this.hazards = this.physics.add.group();
        this.shards = this.physics.add.group();

        // Altar (Goal)
        this.altar = this.physics.add.sprite(width / 2, 200, 'altar');
        this.altar.setScale(0.8);
        this.altar.setImmovable(true);
        this.altar.setAlpha(0.2);

        // Player
        this.player = new Player(this, width / 2, height - 150);
        this.player.setDepth(10);
        this.player.inputEnabled = true; // Ensure player starts with input enabled

        // Setup Map
        this.setupMapElements();

        // Physics
        this.physics.add.collider(this.player, this.orbs, this.pushOrb, null, this);
        this.physics.add.collider(this.orbs, this.orbs);
        this.physics.add.collider(this.player, this.altar);
        this.physics.add.overlap(this.player, this.hazards, this.handleHazardHit, null, this);
        this.physics.add.overlap(this.player, this.shards, this.collectShard, null, this);
        this.physics.add.overlap(this.player, this.altar, this.interactAltar, null, this);

        // UI
        this.createUI();

        // Particle Trail for Nova
        this.playerTrail = this.add.particles(0, 0, 'crystal-shard', {
            scale: { start: 0.05, end: 0 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 800,
            blendMode: 'ADD',
            tint: currentMap.themeColor,
            frequency: 40,
            follow: this.player,
            followOffset: { y: 20 }
        });
        this.playerTrail.setDepth(9); // Just behind Nova

        // Narrative
        this.showNarrative(currentMap.narrative);

        this.cameras.main.fadeIn(1500, 255, 255, 255);
        this.createParticles();
    }

    createBorder() {
        const { width, height } = this.scale;
        const graphics = this.add.graphics();
        const themeColor = this.mapConfigs[this.currentMapIndex].themeColor;
        graphics.lineStyle(20, themeColor, 0.5);
        graphics.strokeRect(40, 40, width - 80, height - 80);
        graphics.setDepth(100);
    }

    createUI() {
        const { width } = this.scale;
        this.uiContainer = this.add.container(0, 0).setDepth(150);
        const style = { fontFamily: 'Quicksand', fontSize: '32px', color: '#ffffff', fontWeight: '700', stroke: '#000000', strokeThickness: 4 };
        
        this.mapLabel = this.add.text(80, 80, `${this.mapConfigs[this.currentMapIndex].name}`, style);
        this.puzzleLabel = this.add.text(80, 130, `Orbs Aligned: 0 / ${this.mapConfigs[this.currentMapIndex].orbCount}`, style);
        this.livesLabel = this.add.text(width - 80, 80, `Lives: ${this.lives}`, style).setOrigin(1, 0);
        
        this.uiContainer.add([this.mapLabel, this.puzzleLabel, this.livesLabel]);

        // Pause Button
        const pauseBtn = this.add.text(width - 80, 130, 'Pause', {
            fontFamily: 'Quicksand',
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#7e57c2',
            padding: { x: 15, y: 5 }
        })
        .setOrigin(1, 0)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.pauseGame());

        this.uiContainer.add(pauseBtn);

        // ESC key to pause
        this.input.keyboard.on('keydown-ESC', () => this.pauseGame());
    }

    pauseGame() {
        if (this.isGameOver || this.isTransitioning) return;
        this.scene.pause();
        this.scene.launch('PauseScene');
    }

    setupMapElements() {
        const { width, height } = this.scale;
        const currentMap = this.mapConfigs[this.currentMapIndex];

        // Reset
        this.slots.clear(true, true);
        this.orbs.clear(true, true);
        this.hazards.clear(true, true);
        this.shards.clear(true, true);
        this.glinthsCollected = 0;

        // Spawn Slots and Orbs
        for (let i = 0; i < currentMap.orbCount; i++) {
            // Slots (Pedestals)
            const slotX = 300 + (i * (width - 600) / (currentMap.orbCount - 1 || 1));
            const slotY = 400;
            const slot = this.add.sprite(slotX, slotY, 'dream-pad');
            slot.setScale(0.5);
            slot.setTint(currentMap.themeColor);
            slot.isFilled = false;
            this.slots.add(slot);

            // Orbs
            const orbX = Phaser.Math.Between(200, width - 200);
            const orbY = Phaser.Math.Between(600, height - 300);
            const orb = this.orbs.create(orbX, orbY, 'crystal-shard');
            orb.setScale(0.2);
            orb.setTint(0xffffff);
            orb.setDrag(500); // Reduced drag from 1000 to 500 for easier movement
            orb.setCircle(100);
            orb.setBounce(0.5); // More reactive
            orb.body.setCollideWorldBounds(true);
        }

        // Hazards
        const hazardCount = (this.currentMapIndex + 1) * 3;
        for (let i = 0; i < hazardCount; i++) {
            const x = Phaser.Math.Between(200, width - 200);
            const y = Phaser.Math.Between(300, 500);
            const hazard = this.hazards.create(x, y, 'spike');
            hazard.setScale(0.15); // Slightly larger
            // We'll keep a subtle tint to match the realm, but the base asset is dark
            const tint = this.mapConfigs[this.currentMapIndex].themeColor;
            hazard.setTint(tint);
            hazard.setAlpha(0.8);
            
            // Add a floating and pulsing animation to hazards
            this.tweens.add({
                targets: hazard,
                y: '+=10',
                duration: 1500 + Math.random() * 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.tweens.add({
                targets: hazard,
                scale: 0.17,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    pushOrb(player, orb) {
        // More powerful push logic
        const pushForce = 0.9;
        orb.setVelocityX(player.body.velocity.x * pushForce);
        orb.setVelocityY(player.body.velocity.y * pushForce);
    }

    update() {
        if (this.isGameOver) return;
        this.player.update();

        // Check Orb/Slot alignment
        let alignedCount = 0;
        this.slots.getChildren().forEach(slot => {
            let isAnyOrbClose = false;
            this.orbs.getChildren().forEach(orb => {
                // Skip if orb is already locked to another slot (optional but good)
                const dist = Phaser.Math.Distance.Between(orb.x, orb.y, slot.x, slot.y);
                
                if (dist < 150) { // Larger initial magnetic pull
                    isAnyOrbClose = true;
                    
                    // Stronger suction from further away
                    const pullStrength = 0.35;
                    orb.x = Phaser.Math.Linear(orb.x, slot.x, pullStrength);
                    orb.y = Phaser.Math.Linear(orb.y, slot.y, pullStrength);
                    
                    // Very generous snapping threshold
                    if (dist < 70) {
                        // Fully disable physics so it can't be bumped
                        orb.body.enable = false; 
                        
                        // Rapid center alignment
                        orb.x = Phaser.Math.Linear(orb.x, slot.x, 0.5);
                        orb.y = Phaser.Math.Linear(orb.y, slot.y, 0.5);
                        
                        // Final lock when close enough
                        if (dist < 10) {
                            orb.x = slot.x;
                            orb.y = slot.y;
                            orb.setVelocity(0, 0);
                            
                            // Visual confirmation of locking
                            if (orb.alpha !== 0.8) {
                                orb.setAlpha(0.8);
                                this.createBlastEffect(orb.x, orb.y, 0xffeb3b);
                            }
                        }
                    }
                    orb.setTint(0xffeb3b);
                }
            });
            
            if (isAnyOrbClose) {
                alignedCount++;
                slot.setTint(0xffeb3b);
            } else {
                slot.setTint(0x4a148c);
            }
        });

        this.puzzleLabel.setText(`Orbs Aligned: ${alignedCount} / ${this.mapConfigs[this.currentMapIndex].orbCount}`);

        // If all aligned and shard not yet revealed
        if (alignedCount === this.mapConfigs[this.currentMapIndex].orbCount && this.shards.getLength() === 0 && this.glinthsCollected === 0) {
            this.revealGlinth();
        }
    }

    revealGlinth() {
        const shard = this.shards.create(this.scale.width / 2, 400, 'crystal-shard');
        shard.setScale(0.3);
        shard.setTint(0xffffff);
        this.add.tween({
            targets: shard,
            y: '-=20',
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        this.showNarrative("Wonderful! The Glinth of this realm has finally appeared. Go get it!");
    }

    collectShard(player, shard) {
        shard.destroy();
        audioManager.playCollectSfx();
        this.glinthsCollected++;
        this.createBlastEffect(shard.x, shard.y, 0xffffff);
        this.altar.setAlpha(1);
        this.showNarrative("The Altar is awake! The gateway to the next realm is now open for you.");
    }

    handleHazardHit(player, hazard) {
        if (player.isInvulnerable || this.isTransitioning) return;
        
        audioManager.playHitSfx();
        this.lives--;
        this.livesLabel.setText(`Lives: ${this.lives}`);
        
        // Start invulnerability
        player.isInvulnerable = true;
        this.cameras.main.shake(300, 0.01);
        
        // Visual Feedback: Red tint + Flash
        player.setTint(0xff0000);
        
        this.tweens.add({
            targets: player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 8,
            onComplete: () => {
                player.alpha = 1;
                player.clearTint();
                player.isInvulnerable = false;
            }
        });

        if (this.lives <= 0) {
            this.handleMapReset();
        }
    }

    handleMapReset() {
        this.lives = 3;
        audioManager.stopAll();
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.restart({ mapIndex: this.currentMapIndex, lives: 3 });
        });
    }

    interactAltar() {
        if (this.glinthsCollected >= 1 && !this.isTransitioning) {
            this.isTransitioning = true;
            this.player.inputEnabled = false;
            this.player.setVelocity(0);
            
            // Show the history fragment with more impact
            this.showNarrative(this.mapConfigs[this.currentMapIndex].history);
            
            // Visual effect at altar
            this.createBlastEffect(this.altar.x, this.altar.y, this.mapConfigs[this.currentMapIndex].themeColor);
            
            this.time.delayedCall(5000, () => {
                this.nextMap();
            });
        }
    }

    nextMap() {
        this.currentMapIndex++;
        if (this.currentMapIndex >= this.mapConfigs.length) {
            this.handleVictory();
        } else {
            // Cinematic transition to next map
            const { width, height } = this.scale;
            const overlay = this.add.rectangle(width/2, height/2, width, height, 0xffffff, 0);
            overlay.setDepth(1000);
            
            this.tweens.add({
                targets: overlay,
                fillAlpha: 1,
                duration: 2000,
                onComplete: () => {
                    audioManager.stopAll();
                    this.scene.restart({ mapIndex: this.currentMapIndex, lives: this.lives });
                }
            });

            // Transition text
            const transText = this.add.text(width/2, height/2, "Deepening the dream...", {
                fontFamily: 'Quicksand',
                fontSize: '40px',
                color: '#333333'
            }).setOrigin(0.5).setDepth(1001).setAlpha(0);

            this.tweens.add({
                targets: transText,
                alpha: 1,
                duration: 1000,
                yoyo: true,
                hold: 500
            });
        }
    }

    handleVictory() {
        this.isGameOver = true;
        this.player.inputEnabled = false;
        this.player.setVelocity(0);
        audioManager.stopAll();
        
        const { width, height } = this.scale;
        
        // Final fade to white
        const whiteOverlay = this.add.rectangle(width/2, height/2, width, height, 0xffffff, 0);
        whiteOverlay.setDepth(2000);
        
        this.tweens.add({
            targets: whiteOverlay,
            fillAlpha: 1,
            duration: 4000,
            onComplete: () => {
                this.showEnding();
            }
        });

        this.showNarrative("You've done it, Nova! The light is returning. It's time to wake up.");
    }

    showEnding() {
        const { width, height } = this.scale;
        
        // Create ending container
        const endContainer = this.add.container(0, 0).setDepth(3000);
        
        const bg = this.add.rectangle(width/2, height/2, width, height, 0xffffff);
        
        // Nova waking up sprite
        const wakingNova = this.add.sprite(width/2, height/2 - 100, 'nova-front');
        wakingNova.setScale(0.6);
        wakingNova.setAlpha(0);
        
        const endTitle = this.add.text(width / 2, height / 2 + 100, "Nova wakes up with a gasp.", {
            fontFamily: 'Quicksand',
            fontSize: '60px',
            fontWeight: '700',
            color: '#2c3e50',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        const endSubtitle = this.add.text(width / 2, height / 2 + 200, "The nightmare is over. She is safe.\nRelief washes over her as the morning sun fills the room.", {
            fontFamily: 'Quicksand',
            fontSize: '32px',
            color: '#34495e',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        const restartButton = this.add.text(width / 2, height - 150, "Return to the dream", {
            fontFamily: 'Quicksand',
            fontSize: '28px',
            color: '#7f8c8d',
            backgroundColor: '#ecf0f1',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setAlpha(0);

        restartButton.on('pointerdown', () => window.location.reload());

        endContainer.add([bg, wakingNova, endTitle, endSubtitle, restartButton]);

        // Cinematic sequence
        this.tweens.add({
            targets: wakingNova,
            alpha: 1,
            y: '-=20',
            duration: 2000,
            ease: 'Power2.easeOut',
            delay: 1000
        });

        this.tweens.add({
            targets: endTitle,
            alpha: 1,
            duration: 1500,
            delay: 3000
        });

        this.tweens.add({
            targets: endSubtitle,
            alpha: 1,
            duration: 1500,
            delay: 4500
        });

        this.tweens.add({
            targets: restartButton,
            alpha: 1,
            duration: 1000,
            delay: 7000
        });
    }

    showNarrative(message) {
        if (!message) return;
        const { width, height } = this.scale;
        if (this.dialogueContainer) this.dialogueContainer.destroy();
        
        this.dialogueContainer = this.add.container(0, 0).setDepth(200);
        
        // Aria's Sprite (Portrait)
        const aria = this.add.sprite(200, height - 160, 'aria-guide');
        aria.setScale(0.3);
        aria.setAlpha(0);
        
        // Dialogue Box
        const boxWidth = width - 400;
        const boxHeight = 150;
        const boxX = width / 2 + 80;
        const boxY = height - 150;
        
        const box = this.add.rectangle(boxX, boxY, boxWidth - 160, boxHeight, 0x000000, 0.75);
        box.setStrokeStyle(4, 0xba68c8); // Magical purple/pink border
        
        // Name Tag Background
        const nameTagBox = this.add.rectangle(boxX - (boxWidth - 160) / 2 + 60, boxY - boxHeight / 2, 120, 40, 0xba68c8, 1);
        
        // Name Tag Text
        const nameTag = this.add.text(nameTagBox.x, nameTagBox.y, 'Aria', {
            fontFamily: 'Quicksand', fontSize: '22px', color: '#ffffff', fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // The message text
        const text = this.add.text(boxX, boxY, '', {
            fontFamily: 'Quicksand', 
            fontSize: '24px', 
            color: '#ffffff', 
            wordWrap: { width: boxWidth - 220 }, 
            align: 'left'
        }).setOrigin(0.5);
        
        this.dialogueContainer.add([box, aria, nameTagBox, nameTag, text]);
        
        // Aria Float Animation
        this.tweens.add({
            targets: aria,
            y: '-=15',
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Fade in entire sequence
        this.tweens.add({
            targets: [aria, box, nameTagBox, nameTag],
            alpha: 1,
            duration: 600
        });

        let i = 0;
        this.time.addEvent({
            delay: 35,
            callback: () => {
                if (!text || !text.scene) return;
                text.text += message[i];
                i++;
                if (i === message.length) {
                    this.time.delayedCall(4000, () => {
                        if (this.dialogueContainer && this.dialogueContainer.scene) {
                            this.tweens.add({ 
                                targets: this.dialogueContainer, 
                                alpha: 0, 
                                duration: 500, 
                                onComplete: () => {
                                    if (this.dialogueContainer) {
                                        this.dialogueContainer.destroy();
                                        this.dialogueContainer = null;
                                    }
                                } 
                            });
                        }
                    });
                }
            },
            repeat: message.length - 1
        });
    }

    createBlastEffect(x, y, color) {
        const circle = this.add.circle(x, y, 5, color);
        this.tweens.add({ targets: circle, scale: 15, alpha: 0, duration: 600, onComplete: () => circle.destroy() });
    }

    createParticles() {
        const { width, height } = this.scale;
        const currentMap = this.mapConfigs[this.currentMapIndex];
        const particleOptions = {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            blendMode: 'ADD',
            ...currentMap.particleConfig
        };
        this.add.particles(0, 0, 'crystal-shard', particleOptions);
    }
}