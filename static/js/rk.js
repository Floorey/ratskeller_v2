(() => {
    const body = document.body;
    if (!body) return;

    const INTERNAL_HTML_PAGES = new Set([
        'index.html',
        'philosophie.html',
        'speisen.html',
        'reservierung.html',
        'anreise.html',
        'bewerbungen.html',
        'impressum.html',
        'datenschutz.html'
    ]);

    // -----------------------------------------
    // 0) HTML5UP-Style: preload raus nach Load
    // -----------------------------------------
    window.addEventListener('load', () => {
        window.setTimeout(() => {
            body.classList.remove('is-preload');
        }, 80);
    });

    // -----------------------------------------
    // 1) Fokus-Outlines nur bei Tastatur (Tab)
    // -----------------------------------------
    function setKeyboardMode(on) {
        body.classList.toggle('rk-keyboard', on);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') setKeyboardMode(true);
    });

    document.addEventListener('mousedown', () => setKeyboardMode(false));
    document.addEventListener('touchstart', () => setKeyboardMode(false), { passive: true });

    // -----------------------------------------
    // 2) Scrollbar-Shift verhindern (Modal)
    // -----------------------------------------
    function updateScrollbarWidthVar() {
        const sw = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.setProperty('--rk-scrollbar-w', `${Math.max(0, sw)}px`);
    }

    updateScrollbarWidthVar();
    window.addEventListener('resize', updateScrollbarWidthVar);

    // -----------------------------------------
    // 3) Anti-Harvesting Email Reveal
    // -----------------------------------------
    function wireEmailReveal() {
        const btns = document.querySelectorAll('.rk-email-reveal');
        if (!btns.length) return;

        btns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const user = btn.getAttribute('data-rk-email-user') || '';
                const domain = btn.getAttribute('data-rk-email-domain') || '';
                const tld = btn.getAttribute('data-rk-email-tld') || '';
                const addr = `${user}@${domain}.${tld}`;

                const out = btn.parentElement?.querySelector('.rk-email-out');
                if (!out) return;

                const a = document.createElement('a');
                a.href = `mailto:${addr}`;
                a.textContent = addr;

                out.innerHTML = ' ';
                out.appendChild(a);

                btn.disabled = true;
                btn.textContent = 'E-Mail angezeigt';
            });
        });
    }

    wireEmailReveal();

    // -----------------------------------------
    // Helper
    // -----------------------------------------
    function normalizeHref(href) {
        if (!href) return '';
        return href.trim();
    }

    function getFileNameFromHref(href) {
        try {
            const url = new URL(href, window.location.href);
            const path = url.pathname.split('/').pop() || '';
            return path.toLowerCase();
        } catch {
            const clean = href.split('#')[0].split('?')[0];
            return clean.split('/').pop()?.toLowerCase() || '';
        }
    }

    function isPdfHref(href) {
        return href.toLowerCase().split('?')[0].split('#')[0].endsWith('.pdf');
    }

    function isInternalHtmlPage(href) {
        const fileName = getFileNameFromHref(href);
        return INTERNAL_HTML_PAGES.has(fileName);
    }

    function navigateWithTransition(targetHref) {
        if (!targetHref) return;
        body.classList.add('rk-leave');

        window.setTimeout(() => {
            window.location.href = targetHref;
        }, 450);
    }

    // -----------------------------------------
    // 4) Mobile Navigation Select
    // -----------------------------------------
    function wireNavSelect() {
        const navSelect = document.getElementById('rk-nav-select');
        if (!navSelect) return;

        navSelect.addEventListener('change', () => {
            const target = normalizeHref(navSelect.value);
            if (!target) return;

            if (isInternalHtmlPage(target)) {
                navigateWithTransition(target);
                return;
            }

            window.location.href = target;
        });
    }

    wireNavSelect();

    // -----------------------------------------
    // 5) PDF Modal
    // -----------------------------------------
    const modal = document.getElementById('rk-pdf-modal');
    const frame = document.getElementById('rk-pdf-frame');
    const btnClose = document.getElementById('rk-pdf-close');
    const linkDownload = document.getElementById('rk-pdf-download');
    const linkOpen = document.getElementById('rk-pdf-open');
    const modalTitle = document.getElementById('rk-pdf-modal-title');

    let lastFocus = null;

    const focusablesSelector =
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function getFocusable(root) {
        return Array.from(root.querySelectorAll(focusablesSelector))
            .filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1);
    }

    function openPdfModal(pdfUrl, title, triggerEl) {
        if (!modal || !frame || !btnClose || !linkDownload || !linkOpen) return;

        lastFocus = triggerEl || document.activeElement;

        frame.src = pdfUrl;
        linkDownload.href = pdfUrl;
        linkOpen.href = pdfUrl;

        if (modalTitle) {
            modalTitle.textContent = title || 'PDF Vorschau';
        }

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        body.classList.add('rk-modal-open');

        btnClose.focus();
    }

    function closePdfModal() {
        if (!modal || !frame) return;

        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        body.classList.remove('rk-modal-open');
        frame.src = '';

        if (lastFocus && typeof lastFocus.focus === 'function') {
            lastFocus.focus();
        }
        lastFocus = null;
    }

    if (btnClose) {
        btnClose.addEventListener('click', closePdfModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closePdfModal();
        });

        const dialog = modal.querySelector('.rk-modal-dialog');
        if (dialog) {
            dialog.addEventListener('click', (e) => e.stopPropagation());
        }
    }

    // -----------------------------------------
    // 6) Link Handling
    //    - PDFs ins Modal
    //    - interne HTML Seiten mit Slide Transition
    //    - Externe Links normal
    // -----------------------------------------
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const rawHref = link.getAttribute('href');
        const href = normalizeHref(rawHref);
        if (!href) return;

        // target blank / download / modifier keys normal lassen
        if (
            link.target === '_blank' ||
            link.hasAttribute('download') ||
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey
        ) {
            return;
        }

        const isExternal =
            href.startsWith('http://') ||
            href.startsWith('https://') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:');

        const dataPdf = link.getAttribute('data-rk-pdf');
        const pdfTitle = link.getAttribute('data-rk-pdf-title') || 'PDF Vorschau';

        // PDFs über data-rk-pdf bevorzugt
        if (dataPdf) {
            e.preventDefault();
            openPdfModal(dataPdf, pdfTitle, link);
            return;
        }

        // Direkte PDF-Links intern ins Modal
        if (!isExternal && isPdfHref(href)) {
            e.preventDefault();
            openPdfModal(href, pdfTitle, link);
            return;
        }

        // Externe Links normal
        if (isExternal) return;

        // Interne bekannte HTML-Seiten mit Transition
        if (isInternalHtmlPage(href)) {
            e.preventDefault();
            navigateWithTransition(href);
        }
    });

    // -----------------------------------------
    // 7) ESC + TAB Focus Trap für Modal
    // -----------------------------------------
    document.addEventListener('keydown', (e) => {
        if (!modal || !modal.classList.contains('is-open')) return;

        const key = e.key;
        const code = e.code;

        if (key === 'Escape' || code === 'Escape') {
            e.preventDefault();
            closePdfModal();
            return;
        }

        if (!(key === 'Tab' || code === 'Tab')) return;

        const focusables = getFocusable(modal);
        if (focusables.length === 0) {
            e.preventDefault();
            return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    // -----------------------------------------
    // 8) Simple Hero Rotator + Dots
    // -----------------------------------------
    (function wireHeroRotator() {
        const rotators = document.querySelectorAll('.rk-rotator');
        if (!rotators.length) return;

        rotators.forEach((root) => {
            const slides = Array.from(root.querySelectorAll('.rk-slide'));
            const dots = Array.from(root.querySelectorAll('.rk-dot'));
            if (slides.length <= 1) return;

            let idx = slides.findIndex((s) => s.classList.contains('is-active'));
            if (idx < 0) idx = 0;

            const interval = parseInt(root.getAttribute('data-interval') || '4500', 10);
            let timer = null;

            function syncDots() {
                dots.forEach((dot, i) => {
                    dot.classList.toggle('is-active', i === idx);
                    dot.setAttribute('aria-pressed', i === idx ? 'true' : 'false');
                });
            }

            function show(i) {
                slides[idx].classList.remove('is-active');
                idx = (i + slides.length) % slides.length;
                slides[idx].classList.add('is-active');
                syncDots();
            }

            function start() {
                if (timer) return;
                timer = window.setInterval(() => show(idx + 1), interval);
            }

            function stop() {
                if (!timer) return;
                window.clearInterval(timer);
                timer = null;
            }

            dots.forEach((dot, i) => {
                dot.addEventListener('click', () => {
                    stop();
                    show(i);
                    start();
                });
            });

            root.addEventListener('mouseenter', stop);
            root.addEventListener('mouseleave', start);
            root.addEventListener('focusin', stop);
            root.addEventListener('focusout', start);

            syncDots();
            start();
        });
    })();
})();