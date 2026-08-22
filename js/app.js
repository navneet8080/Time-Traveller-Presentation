/**
 * Application Entry Point (Modular ES6 Architecture)
 */
import { initNavigation } from './navigation.js';
import { initMedia } from './media.js';

window.addEventListener('DOMContentLoaded', () => {
    initMedia();
    initNavigation();
    console.log('✨ Akbarpur Dandiya Mahotsav 2026 Presentation initialized.');
});
