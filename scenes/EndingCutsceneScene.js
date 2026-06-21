import Phaser from 'phaser';

export default class EndingCutsceneScene extends Phaser.Scene {
    constructor() {
        super('EndingCutsceneScene');
        this.hasAdvanced = false;
        this.videoElement = null;
        this.skipButtonElement = null;
        this.hintElement = null;
    }

    create() {
        const { width, height } = this.scale;
        this.hasAdvanced = false;

        this.add.rectangle(width / 2, height / 2, width, height, 0x05020d, 1);
        this.add.text(width / 2, height / 2, 'Loading ending cutscene...', {
            fontFamily: 'Quicksand',
            fontSize: '36px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.createVideoOverlay();

        this.input.keyboard.once('keydown-ESC', () => this.advanceToEnding());
        this.input.keyboard.once('keydown-SPACE', () => this.advanceToEnding());

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanupDomElements());
        this.events.once(Phaser.Scenes.Events.DESTROY, () => this.cleanupDomElements());
    }

    createVideoOverlay() {
        const parent = this.game.canvas.parentElement || document.body;
        const canvas = this.game.canvas;

        const ensureParentPositioned = window.getComputedStyle(parent).position === 'static';
        if (ensureParentPositioned) {
            parent.style.position = 'relative';
        }

        const video = document.createElement('video');
        video.src = 'Assets/ending-cutscene.mp4';
        video.autoplay = true;
        video.playsInline = true;
        video.controls = false;
        video.preload = 'auto';
        video.style.position = 'absolute';
        video.style.inset = '0';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.backgroundColor = '#05020d';
        video.style.zIndex = '20';
        video.style.opacity = '0';
        video.style.transition = 'opacity 450ms ease';

        const skipButton = document.createElement('button');
        skipButton.textContent = 'Skip Cutscene';
        skipButton.type = 'button';
        skipButton.style.position = 'absolute';
        skipButton.style.top = 'clamp(16px, 4vw, 42px)';
        skipButton.style.right = 'clamp(16px, 4vw, 42px)';
        skipButton.style.zIndex = '25';
        skipButton.style.padding = '12px 22px';
        skipButton.style.border = '2px solid rgba(255,255,255,0.55)';
        skipButton.style.borderRadius = '14px';
        skipButton.style.background = 'linear-gradient(135deg, rgba(126,87,194,0.94), rgba(186,104,200,0.92))';
        skipButton.style.color = '#ffffff';
        skipButton.style.fontFamily = 'Quicksand, sans-serif';
        skipButton.style.fontSize = 'clamp(14px, 2.2vw, 20px)';
        skipButton.style.fontWeight = '700';
        skipButton.style.cursor = 'pointer';
        skipButton.style.boxShadow = '0 10px 30px rgba(0,0,0,0.32)';

        const hint = document.createElement('div');
        hint.textContent = 'Pressione ESC ou SPACE para pular';
        hint.style.position = 'absolute';
        hint.style.left = '50%';
        hint.style.bottom = 'clamp(18px, 4vw, 42px)';
        hint.style.transform = 'translateX(-50%)';
        hint.style.zIndex = '25';
        hint.style.color = 'rgba(255,255,255,0.78)';
        hint.style.fontFamily = 'Quicksand, sans-serif';
        hint.style.fontSize = 'clamp(13px, 2vw, 20px)';
        hint.style.textAlign = 'center';
        hint.style.textShadow = '0 2px 12px rgba(0,0,0,0.7)';
        hint.style.pointerEvents = 'none';

        const syncOverlayBounds = () => {
            const rect = canvas.getBoundingClientRect();
            const parentRect = parent.getBoundingClientRect();
            const left = rect.left - parentRect.left;
            const top = rect.top - parentRect.top;
            const width = rect.width;
            const height = rect.height;

            [video, skipButton, hint].forEach((element) => {
                element.style.boxSizing = 'border-box';
            });

            video.style.left = `${left}px`;
            video.style.top = `${top}px`;
            video.style.width = `${width}px`;
            video.style.height = `${height}px`;

            skipButton.style.transform = `translate(${left}px, ${top}px)`;
            hint.style.left = `${left + width / 2}px`;
            hint.style.transform = `translateX(-50%) translateY(${top}px)`;
        };

        this.videoElement = video;
        this.skipButtonElement = skipButton;
        this.hintElement = hint;
        this.syncOverlayBounds = syncOverlayBounds;

        skipButton.addEventListener('click', () => this.advanceToEnding());
        video.addEventListener('ended', () => this.advanceToEnding());
        video.addEventListener('error', () => this.advanceToEnding());
        video.addEventListener('canplay', () => {
            if (this.videoElement) {
                this.videoElement.style.opacity = '1';
            }
        });

        parent.appendChild(video);
        parent.appendChild(skipButton);
        parent.appendChild(hint);
        syncOverlayBounds();
        window.addEventListener('resize', syncOverlayBounds);

        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                video.muted = true;
                video.play().catch(() => this.advanceToEnding());
            });
        }
    }

    advanceToEnding() {
        if (this.hasAdvanced) return;
        this.hasAdvanced = true;

        this.cleanupDomElements();
        this.showEndingContent();
    }

    showEndingContent() {
        const { width, height } = this.scale;

        const endContainer = this.add.container(0, 0).setDepth(3000);

        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff);

        const wakingNova = this.add.sprite(width / 2, height / 2 - 140, 'nova-front');
        wakingNova.setScale(0.4);
        wakingNova.setAlpha(0);

        const endTitle = this.add.text(width / 2, height / 2 + 120, "Nova acorda com um suspiro", {
            fontFamily: 'Quicksand',
            fontSize: '60px',
            fontWeight: '700',
            color: '#2c3e50',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        const endSubtitle = this.add.text(width / 2, height / 2 + 200, "O pesadelo terminou. Ela está segura.\nO alívio toma conta dela enquanto o sol da manhã enche a sala.", {
            fontFamily: 'Quicksand',
            fontSize: '32px',
            color: '#34495e',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        const restartButton = this.add.text(width / 2, height - 150, "Retorne para o sonho", {
            fontFamily: 'Quicksand',
            fontSize: '28px',
            color: '#7f8c8d',
            backgroundColor: '#ecf0f1',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setAlpha(0);

        restartButton.on('pointerdown', () => window.location.reload());

        endContainer.add([bg, wakingNova, endTitle, endSubtitle, restartButton]);

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

    cleanupDomElements() {
        if (this.syncOverlayBounds) {
            window.removeEventListener('resize', this.syncOverlayBounds);
            this.syncOverlayBounds = null;
        }

        if (this.videoElement) {
            this.videoElement.pause();
            this.videoElement.removeAttribute('src');
            this.videoElement.load();
            this.videoElement.remove();
            this.videoElement = null;
        }

        if (this.skipButtonElement) {
            this.skipButtonElement.remove();
            this.skipButtonElement = null;
        }

        if (this.hintElement) {
            this.hintElement.remove();
            this.hintElement = null;
        }
    }
}
