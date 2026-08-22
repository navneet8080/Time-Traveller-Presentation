/**
 * Navigation Engine: Slide Transitions, Keyboard, Touch, Mouse Wheel & Controls
 */
import { PRESENTATION_CONFIG } from './config.js';
import { $, $$, padNumber, debounce } from './utils.js';
import { animateCounters } from './animation.js';
import { manageMediaPlayback } from './media.js';

let currentIndex = 0;
let autoPlayTimer = null;
let slides = [];
let dots = [];
let gridCards = [];

export function initNavigation() {
    slides = $$('.slide-item');
    if (slides.length === 0) return;

    const deckNumTot = $('#deckNumTot');
    if (deckNumTot) {
        deckNumTot.innerText = `/ ${padNumber(slides.length)}`;
    }

    const rightNavDock = $('#rightNavDock');
    const gridOverviewList = $('#gridOverviewList');
    const gridModal = $('#gridModal');

    // Build right side dots & grid modal cards
    slides.forEach((slide, idx) => {
        const title = slide.getAttribute('data-title') || PRESENTATION_CONFIG.slides[idx]?.title || `Slide ${idx + 1}`;

        // Right side dot
        if (rightNavDock) {
            const dot = document.createElement('div');
            dot.className = `nav-dot-item ${idx === 0 ? 'active' : ''}`;
            dot.innerHTML = `<span class="dot-tooltip">${padNumber(idx + 1)} • ${title}</span>`;
            dot.addEventListener('click', () => navigateToSlide(idx));
            rightNavDock.appendChild(dot);
        }

        // Modal Grid card
        if (gridOverviewList) {
            const card = document.createElement('div');
            card.className = `overview-slide-card ${idx === 0 ? 'active' : ''}`;
            card.innerHTML = `
                <div class="overview-num">SLIDE ${padNumber(idx + 1)}</div>
                <div class="overview-title-text">${title}</div>
            `;
            card.addEventListener('click', () => {
                navigateToSlide(idx);
                if (gridModal) gridModal.classList.remove('is-open');
            });
            gridOverviewList.appendChild(card);
        }
    });

    dots = $$('.nav-dot-item');
    gridCards = $$('.overview-slide-card');

    // Button controls
    const dockPrevBtn = $('#dockPrevBtn');
    const dockNextBtn = $('#dockNextBtn');
    if (dockPrevBtn) dockPrevBtn.addEventListener('click', prevSlide);
    if (dockNextBtn) dockNextBtn.addEventListener('click', nextSlide);

    // Modal triggers
    const openGridBtn = $('#openGridBtn');
    const closeGridModalBtn = $('#closeGridModalBtn');
    if (openGridBtn && gridModal) openGridBtn.addEventListener('click', () => gridModal.classList.add('is-open'));
    if (closeGridModalBtn && gridModal) closeGridModalBtn.addEventListener('click', () => gridModal.classList.remove('is-open'));
    if (gridModal) {
        gridModal.addEventListener('click', (e) => {
            if (e.target === gridModal) gridModal.classList.remove('is-open');
        });
    }

    // Fullscreen toggle
    const fullscreenBtn = $('#fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        });
    }

    // Auto-play (Keynote mode) toggle
    const autoPlayBtn = $('#autoPlayBtn');
    if (autoPlayBtn) {
        autoPlayBtn.addEventListener('click', () => {
            if (autoPlayTimer) {
                clearInterval(autoPlayTimer);
                autoPlayTimer = null;
                autoPlayBtn.classList.remove('active');
                autoPlayBtn.innerHTML = '<span>⚡ Keynote Mode</span>';
            } else {
                autoPlayTimer = setInterval(nextSlide, PRESENTATION_CONFIG.autoPlayInterval);
                autoPlayBtn.classList.add('active');
                autoPlayBtn.innerHTML = '<span>❚❚ Pause Auto</span>';
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboard);

    // Touch & Swipe navigation
    initTouchNavigation();

    // Mouse wheel navigation
    initWheelNavigation();

    // Trigger initial slide animations
    manageMediaPlayback(slides[0]);
    animateCounters(slides[0]);
}

export function navigateToSlide(newIndex) {
    if (newIndex < 0 || newIndex >= slides.length || newIndex === currentIndex) return;

    const currentSlide = slides[currentIndex];
    const nextSlide = slides[newIndex];

    // CSS class transition state
    currentSlide.classList.remove('active');
    currentSlide.classList.add('prev-slide');
    setTimeout(() => currentSlide.classList.remove('prev-slide'), PRESENTATION_CONFIG.transitionDuration);

    nextSlide.classList.add('active');

    // Update Presenter Dock (Bottom Left)
    currentIndex = newIndex;
    const deckNumCur = $('#deckNumCur');
    if (deckNumCur) {
        deckNumCur.style.transform = 'translateY(-4px) scale(1.15)';
        deckNumCur.innerText = padNumber(currentIndex + 1);
        setTimeout(() => { deckNumCur.style.transform = 'translateY(0) scale(1)'; }, 250);
    }

    const deckCurTitle = $('#deckCurTitle');
    if (deckCurTitle) {
        const title = nextSlide.getAttribute('data-title') || PRESENTATION_CONFIG.slides[currentIndex]?.title || `Slide ${currentIndex + 1}`;
        deckCurTitle.innerText = title;
    }

    // Update Dots & Grid Cards
    dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    gridCards.forEach((c, i) => c.classList.toggle('active', i === currentIndex));

    // Media and Counters
    manageMediaPlayback(nextSlide);
    animateCounters(nextSlide);
}

export function nextSlide() {
    if (currentIndex < slides.length - 1) {
        navigateToSlide(currentIndex + 1);
    } else if (autoPlayTimer) {
        navigateToSlide(0); // loop in auto-play mode
    }
}

export function prevSlide() {
    if (currentIndex > 0) {
        navigateToSlide(currentIndex - 1);
    }
}

function handleKeyboard(e) {
    const gridModal = $('#gridModal');
    if (gridModal && gridModal.classList.contains('is-open')) {
        if (e.key === 'Escape') gridModal.classList.remove('is-open');
        return;
    }

    switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
        case 'j':
        case 'Enter':
            e.preventDefault();
            nextSlide();
            break;
        case 'ArrowLeft':
        case 'PageUp':
        case 'k':
            e.preventDefault();
            prevSlide();
            break;
        case 'Home':
            navigateToSlide(0);
            break;
        case 'End':
            navigateToSlide(slides.length - 1);
            break;
        case 'g':
        case 'G':
            if (gridModal) gridModal.classList.toggle('is-open');
            break;
        case 'f':
        case 'F':
            if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
            else document.exitFullscreen().catch(() => {});
            break;
    }
}

function initTouchNavigation() {
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const diffX = e.changedTouches[0].screenX - touchStartX;
        const diffY = e.changedTouches[0].screenY - touchStartY;
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
            if (diffX < 0) nextSlide();
            else prevSlide();
        }
    }, { passive: true });
}

function initWheelNavigation() {
    const handleWheel = debounce((e) => {
        if (Math.abs(e.deltaY) > 25) {
            if (e.deltaY > 0) nextSlide();
            else prevSlide();
        }
    }, 180);

    document.addEventListener('wheel', handleWheel, { passive: true });
}
