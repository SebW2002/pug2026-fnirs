/* ═══════════════════════════════════════════════════════════════
   fNIRS POSTER SITE – Main JavaScript
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initPosterViewer();
});


/* ═══════════════════════════════════════════════════════════════
   1. TAB SWITCHING
   ═══════════════════════════════════════════════════════════════ */
function initTabs() {
    const tabBtns     = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            document.getElementById(`tab-${target}`).classList.add('active');
        });
    });
}


/* ═══════════════════════════════════════════════════════════════
   2. POSTER VIEWER
   Zoom works by scaling the <embed> wrapper (.poster-canvas div),
   anchored at the top-left so scroll position stays meaningful.
   ═══════════════════════════════════════════════════════════════ */
function initPosterViewer() {
    const canvasWrap  = document.getElementById('poster-canvas');   // the scaling wrapper
    const embed       = document.getElementById('poster-embed');    // the <embed> / <iframe>
    const zoomInBtn   = document.getElementById('zoom-in');
    const zoomOutBtn  = document.getElementById('zoom-out');
    const zoomReset   = document.getElementById('zoom-reset');
    const zoomLevelEl = document.getElementById('zoom-level');
    const viewport    = document.getElementById('poster-viewport');

    if (!canvasWrap || !zoomInBtn || !zoomOutBtn || !zoomReset || !viewport) return;

    let currentZoom = 1.0;
    const ZOOM_STEP  = 0.15;
    const MIN_ZOOM   = 0.3;
    const MAX_ZOOM   = 4.0;

    function applyZoom(newZoom, pivotX, pivotY) {
        // Keep scroll anchored around the visual pivot point (optional)
        const prevZoom = currentZoom;
        currentZoom    = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));

        canvasWrap.style.transformOrigin = 'top left';
        canvasWrap.style.transform       = `scale(${currentZoom})`;
        zoomLevelEl.textContent          = Math.round(currentZoom * 100) + '%';

        // Adjust viewport scroll so content stays centred after zoom
        if (pivotX !== undefined && pivotY !== undefined) {
            const ratio = currentZoom / prevZoom;
            viewport.scrollLeft = (viewport.scrollLeft + pivotX) * ratio - pivotX;
            viewport.scrollTop  = (viewport.scrollTop  + pivotY) * ratio - pivotY;
        }
    }

    zoomInBtn.addEventListener('click',  () => applyZoom(currentZoom + ZOOM_STEP));
    zoomOutBtn.addEventListener('click', () => applyZoom(currentZoom - ZOOM_STEP));

    zoomReset.addEventListener('click', () => {
        currentZoom = 1.0;
        canvasWrap.style.transform = 'scale(1)';
        zoomLevelEl.textContent    = '100%';
        viewport.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });

    // Ctrl/Cmd + wheel to zoom
    viewport.addEventListener('wheel', (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const rect   = viewport.getBoundingClientRect();
            const pivotX = e.clientX - rect.left;
            const pivotY = e.clientY - rect.top;
            const delta  = e.deltaY < 0 ? ZOOM_STEP * 0.6 : -ZOOM_STEP * 0.6;
            applyZoom(currentZoom + delta, pivotX, pivotY);
        }
    }, { passive: false });

    // ── PDF embed fallback ──
    // Some browsers (e.g. mobile Safari) can't render PDFs inline.
    // After a short delay, check if the embed has any rendered content.
    // If not, swap to a styled fallback with a download link.
    if (embed) {
        const PDF_SRC = embed.getAttribute('src') || 'assets/poster.pdf';

        setTimeout(() => {
            // clientHeight 0 almost certainly means nothing rendered
            const loaded = embed.offsetHeight > 0 && embed.clientHeight > 0;
            if (!loaded) {
                showPosterFallback(canvasWrap, PDF_SRC);
            }
        }, 2500);
    }
}

function showPosterFallback(container, pdfSrc) {
    const embed = document.getElementById('poster-embed');
    if (embed) embed.style.display = 'none';

    const fb = document.createElement('div');
    fb.className = 'poster-placeholder';
    fb.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
        </svg>
        <span>PDF preview not available in this browser.</span>
        <a href="${pdfSrc}" target="_blank" rel="noopener">Open or download the poster ↗</a>
    `;
    fb.style.display = 'flex';
    container.appendChild(fb);
}
