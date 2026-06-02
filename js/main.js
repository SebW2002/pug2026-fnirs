/* ═══════════════════════════════════════════════════════════════
   fNIRS POSTER SITE – Main JavaScript
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // ── Tab Switching ──
    initTabs();

    // ── Poster Viewer (Zoom) ──
    initPosterViewer();
});


/* ═══════════════════════════════════════════════════════════════
   1. TAB SWITCHING
   ═══════════════════════════════════════════════════════════════ */
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            // Reset all buttons and contents
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            tabContents.forEach(c => c.classList.remove('active'));

            // Activate clicked tab
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            document.getElementById(`tab-${target}`).classList.add('active');
        });
    });
}


/* ═══════════════════════════════════════════════════════════════
   2. POSTER VIEWER (Zoom + Mouse Wheel)
   ═══════════════════════════════════════════════════════════════ */
function initPosterViewer() {
    const canvas = document.getElementById('poster-canvas');
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const zoomReset = document.getElementById('zoom-reset');
    const zoomLevelEl = document.getElementById('zoom-level');
    const viewport = document.getElementById('poster-viewport');

    // Only run if the elements exist on the page
    if (!canvas || !zoomIn || !zoomOut || !zoomReset || !viewport) return;

    let currentZoom = 1;
    const ZOOM_STEP = 0.15;
    const MIN_ZOOM = 0.3;
    const MAX_ZOOM = 4;

    function updateZoom() {
        // Apply scaling
        canvas.style.transform = `scale(${currentZoom})`;
        
        // Update the visual percentage text
        zoomLevelEl.textContent = Math.round(currentZoom * 100) + '%';
    }

    zoomIn.addEventListener('click', () => {
        currentZoom = Math.min(currentZoom + ZOOM_STEP, MAX_ZOOM);
        updateZoom();
    });

    zoomOut.addEventListener('click', () => {
        currentZoom = Math.max(currentZoom - ZOOM_STEP, MIN_ZOOM);
        updateZoom();
    });

    zoomReset.addEventListener('click', () => {
        currentZoom = 1;
        updateZoom();
        viewport.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });

    // Mouse wheel zoom (Ctrl + scroll)
    viewport.addEventListener('wheel', (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.deltaY < 0) {
                currentZoom = Math.min(currentZoom + ZOOM_STEP * 0.5, MAX_ZOOM);
            } else {
                currentZoom = Math.max(currentZoom - ZOOM_STEP * 0.5, MIN_ZOOM);
            }
            updateZoom();
        }
    }, { passive: false });
}