(() => {
    const body = document.body;
    if (!body) return;

    // -----------------------------------------
    // 0) Preload nach Load entfernen
    // -----------------------------------------
    window.addEventListener('load', () => {
        window.setTimeout(() => {
            body.classList.remove('is-preload');
        }, 80);
    });

    // -----------------------------------------
    // 1) Fokus-Outlines nur bei Tastatur
    // -----------------------------------------
    function setKeyboardMode(on) {
        body.classList.toggle('rk-keyboard', on);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            setKeyboardMode(true);
        }
    });

    document.addEventListener('mousedown', () => setKeyboardMode(false));
    document.addEventListener('touchstart', () => setKeyboardMode(false), { passive: true });

    // -----------------------------------------
    // 2) Scrollbar-Breite für Modal merken
    // -----------------------------------------
    function updateScrollbarWidthVar() {
        const sw = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.setProperty('--rk-scrollbar-w', `${Math.max(0, sw)}px`);
    }

    updateScrollbarWidthVar();
    window.addEventListener('resize', updateScrollbarWidthVar);

    // -----------------------------------------
    // 3) Anti-Harvesting E-Mail Reveal
    // -----------------------------------------
    function wireEmailReveal() {
        const buttons = document.querySelectorAll('.rk-email-reveal');
        if (!buttons.length) return;

        buttons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const user = btn.getAttribute('data-rk-email-user') || '';
                const domain = btn.getAttribute('data-rk-email-domain') || '';
                const tld = btn.getAttribute('data-rk-email-tld') || '';

                const address = `${user}@${domain}.${tld}`;
                const out = btn.parentElement?.querySelector('.rk-email-out');
                if (!out) return;

                const a = document.createElement('a');
                a.href = `mailto:${address}`;
                a.textContent = address;

                out.innerHTML = ' ';
                out.appendChild(a);

                btn.disabled = true;
                btn.textContent = 'E-Mail angezeigt';
            });
        });
    }

    wireEmailReveal();

    // -----------------------------------------
    // 4) Mobile Navigation Select
    //    Wichtig: keine Transition, kein Intercept
    // -----------------------------------------
    function wireNavSelect() {
        const navSelect = document.getElementById('rk-nav-select');
        if (!navSelect) return;

        navSelect.addEventListener('change', () => {
            const target = (navSelect.value || '').trim();
            if (!target) return;

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
            .filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
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
            if (e.target === modal) {
                closePdfModal();
            }
        });

        const dialog = modal.querySelector('.rk-modal-dialog');
        if (dialog) {
            dialog.addEventListener('click', (e) => e.stopPropagation());
        }
    }

    // -----------------------------------------
    // 6) Nur PDF-Links abfangen
    //    HTML-Links NICHT anfassen
    // -----------------------------------------
    function isPdfHref(href) {
        return href.toLowerCase().split('?')[0].split('#')[0].endsWith('.pdf');
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = (link.getAttribute('href') || '').trim();
        if (!href) return;

        // Diese Fälle normal laufen lassen
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

        if (dataPdf) {
            e.preventDefault();
            openPdfModal(dataPdf, pdfTitle, link);
            return;
        }

        if (!isExternal && isPdfHref(href)) {
            e.preventDefault();
            openPdfModal(href, pdfTitle, link);
        }
    });

    // -----------------------------------------
    // 7) ESC + TAB Focus Trap im Modal
    // -----------------------------------------
    document.addEventListener('keydown', (e) => {
        if (!modal || !modal.classList.contains('is-open')) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            closePdfModal();
            return;
        }

        if (e.key !== 'Tab') return;

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
    // 8) Optionaler Hero-Rotator
    // -----------------------------------------
    (function wireHeroRotator() {
        const rotators = document.querySelectorAll('.rk-rotator');
        if (!rotators.length) return;

        rotators.forEach((root) => {
            const slides = Array.from(root.querySelectorAll('.rk-slide'));
            const dots = Array.from(root.querySelectorAll('.rk-dot'));

            if (slides.length <= 1) return;

            let idx = slides.findIndex((slide) => slide.classList.contains('is-active'));
            if (idx < 0) idx = 0;

            const interval = parseInt(root.getAttribute('data-interval') || '4500', 10);
            let timer = null;

            function syncDots() {
                dots.forEach((dot, i) => {
                    const active = i === idx;
                    dot.classList.toggle('is-active', active);
                    dot.setAttribute('aria-pressed', active ? 'true' : 'false');
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
                timer = window.setInterval(() => {
                    show(idx + 1);
                }, interval);
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