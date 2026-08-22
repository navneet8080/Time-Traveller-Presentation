/**
 * Animation Engine: Smooth Counters & Observers
 */
export function animateCounters(slideElement) {
    if (!slideElement) return;
    const counters = slideElement.querySelectorAll('.counter-val');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'), 10) || 100;
        const duration = 1200; // ms
        const start = performance.now();

        function step(timestamp) {
            const progress = Math.min((timestamp - start) / duration, 1);
            // easeOutQuad curve
            const ease = 1 - (1 - progress) * (1 - progress);
            const current = Math.floor(ease * target);
            counter.innerText = current;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                counter.innerText = target;
            }
        }
        requestAnimationFrame(step);
    });
}
