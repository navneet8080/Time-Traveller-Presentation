/**
 * Media Controller: Integrated Videos, 3D Depth Photo Reel (with 11M Zoom) & Credibility Track
 */
import { $, $$ } from './utils.js';

let credibilityTimer = null;
let depthSequenceTimer = null;
let zoomTimeout = null;
let currentDepthIndex = 0;
let isSequenceFinished = false;

export function initMedia() {
    // Video Play/Pause & Audio Toggle handler
    $$('.video-cinema-play, .video-cinema-box, .showstopper-video-cinema').forEach(el => {
        el.addEventListener('click', (e) => {
            const frame = el.closest('.video-cinema-frame') || el.closest('.showstopper-video-cinema');
            if (!frame) return;
            const video = frame.querySelector('video');
            const overlay = frame.querySelector('.video-cinema-overlay');
            const playBtn = frame.querySelector('.video-cinema-play');
            if (!video) return;

            if (video.paused || video.muted) {
                video.muted = false;
                video.play().catch(() => {});
                if (playBtn) playBtn.innerText = '❚❚';
                if (overlay) overlay.classList.add('playing-hidden');
            } else {
                video.pause();
                if (playBtn) playBtn.innerText = '▶';
                if (overlay) overlay.classList.remove('playing-hidden');
            }
        });
    });

    // Initialize Slide 2 Credibility Carousel
    initCredibilityCarousel();

    // Initialize Slide 3 3D Depth Carousel Structure
    init3dDepthCarousel();
}

export function manageMediaPlayback(activeSlide) {
    // Autoplay active slide videos from 0:00, reset and pause non-active videos
    $$('video').forEach(video => {
        if (activeSlide && activeSlide.contains(video)) {
            // Reset to 0:00 and start playback from the beginning
            try {
                video.currentTime = 0;
            } catch (_) {}
            video.muted = true;
            video.playsInline = true;
            video.play().catch(() => {});
        } else {
            video.pause();
            try {
                video.currentTime = 0;
            } catch (_) {}
        }
    });

    // Handle Slide 2 Carousel activation
    if (activeSlide && activeSlide.querySelector('.credibility-carousel')) {
        startCredibilityCarousel();
    } else {
        stopCredibilityCarousel();
    }

    // Handle Slide 3 3D Depth Sequence (One-Shot with 11M Zoom)
    if (activeSlide && activeSlide.querySelector('#anubhav3dContainer')) {
        start3dDepthSequence();
    } else {
        reset3dDepthSequence();
    }
}

/* =========================================================
   Slide 2: Credibility Carousel Logic
   ========================================================= */
function initCredibilityCarousel() {
    resetCredibilityCarousel();
}

function resetCredibilityCarousel() {
    const slides = $$('.credibility-slide');
    if (slides.length === 0) return;
    slides.forEach((s, idx) => s.classList.toggle('active', idx === 0));
}

function startCredibilityCarousel() {
    stopCredibilityCarousel();
    resetCredibilityCarousel();
    const slides = $$('.credibility-slide');
    if (slides.length <= 1) return;
    let cur = 0;

    credibilityTimer = setInterval(() => {
        slides[cur].classList.remove('active');
        cur = (cur + 1) % slides.length;
        slides[cur].classList.add('active');
    }, 4000);
}

function stopCredibilityCarousel() {
    if (credibilityTimer) {
        clearInterval(credibilityTimer);
        credibilityTimer = null;
    }
    resetCredibilityCarousel();
}

/* =========================================================
   Slide 3: 3D Depth Photo Sequence & Instagram 11M Zoom
   ========================================================= */
function init3dDepthCarousel() {
    const container = $('#anubhav3dContainer');
    if (!container) return;
    const cards = $$('.depth-card', container);
    const dotsContainer = $('#depthDots');
    if (cards.length === 0) return;

    // Build dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        cards.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = `depth-dot ${idx === 0 ? 'active' : ''}`;
            dotsContainer.appendChild(dot);
        });
    }

    updateDepthCardsLayout(0);
}

function updateDepthCardsLayout(activeIndex) {
    const container = $('#anubhav3dContainer');
    if (!container) return;
    const cards = $$('.depth-card', container);
    const dots = $$('.depth-dot');
    const total = cards.length;
    if (total === 0) return;

    cards.forEach((card, idx) => {
        let offset = idx - activeIndex;
        // Wrap around for positioning
        if (offset > total / 2) offset -= total;
        if (offset < -total / 2) offset += total;

        card.className = 'depth-card';

        if (offset === 0) {
            card.classList.add('card-active');
        } else if (offset === -1) {
            card.classList.add('card-prev-1');
        } else if (offset === -2) {
            card.classList.add('card-prev-2');
        } else if (offset === 1) {
            card.classList.add('card-next-1');
        } else if (offset === 2) {
            card.classList.add('card-next-2');
        } else {
            card.classList.add('card-hidden');
        }
    });

    // Update dots
    dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeIndex);
    });
}

function start3dDepthSequence() {
    // If already finished on this slide, don't restart
    if (isSequenceFinished) return;

    stop3dDepthSequence();
    currentDepthIndex = 0;
    updateDepthCardsLayout(0);

    const container = $('#anubhav3dContainer');
    if (!container) return;
    const cards = $$('.depth-card', container);
    const maxIndex = cards.length - 1; // 7 (Instagram card)

    depthSequenceTimer = setInterval(() => {
        if (currentDepthIndex < maxIndex) {
            currentDepthIndex++;
            updateDepthCardsLayout(currentDepthIndex);

            // When reaching the final Instagram screenshot
            if (currentDepthIndex === maxIndex) {
                clearInterval(depthSequenceTimer);
                depthSequenceTimer = null;
                isSequenceFinished = true;

                // Brief pause before zooming into the real 11M figure
                zoomTimeout = setTimeout(() => {
                    const instaCard = $('#anubhavInstaCard');
                    if (instaCard) {
                        instaCard.classList.add('instagram-zoomed');
                    }
                }, 1200);
            }
        }
    }, 1800);
}

function stop3dDepthSequence() {
    if (depthSequenceTimer) {
        clearInterval(depthSequenceTimer);
        depthSequenceTimer = null;
    }
    if (zoomTimeout) {
        clearTimeout(zoomTimeout);
        zoomTimeout = null;
    }
}

function reset3dDepthSequence() {
    stop3dDepthSequence();
    isSequenceFinished = false;
    currentDepthIndex = 0;

    const instaCard = $('#anubhavInstaCard');
    if (instaCard) {
        instaCard.classList.remove('instagram-zoomed');
    }

    updateDepthCardsLayout(0);
}
