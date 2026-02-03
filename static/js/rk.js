(() => {
    const body = document.body;
    if (!body) return;

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
    // 3) Anti-Harvesting Email Reveal (Impressum)
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
    // 4) PDF Modal (Speisekarte)
    // -----------------------------------------
    const modal = document.getElementById('rk-pdf-modal');
    const frame = document.getElementById('rk-pdf-frame');
    const btnClose = document.getElementById('rk-pdf-close');
    const linkDownload = document.getElementById('rk-pdf-download');
    const linkOpen = document.getElementById('rk-pdf-open');

    if (!modal || !frame || !btnClose || !linkDownload || !linkOpen) return;

    let lastFocus = null;

    const focusablesSelector =
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function getFocusable(root) {
        return Array.from(root.querySelectorAll(focusablesSelector))
            .filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1);
    }

    function openPdfModal(pdfUrl, triggerEl) {
        lastFocus = triggerEl || document.activeElement;

        frame.src = pdfUrl;
        linkDownload.href = pdfUrl;
        linkOpen.href = pdfUrl;

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');

        body.classList.add('rk-modal-open');

        btnClose.focus();
    }

    function closePdfModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');

        body.classList.remove('rk-modal-open');

        frame.src = '';

        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
        lastFocus = null;
    }

    // Klick auf Bilder/Links -> Modal öffnen
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a.rk-menu-link');
        if (!a) return;

        const href = a.getAttribute('href') || '';
        if (!href.toLowerCase().includes('.pdf')) return;

        e.preventDefault();
        openPdfModal(href, a);
    });

    // Close
    btnClose.addEventListener('click', () => closePdfModal());

    // Click outside -> close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closePdfModal();
    });

    // Inner clicks (dialog) nicht schließen
    const dialog = modal.querySelector('.rk-modal-dialog');
    if (dialog) dialog.addEventListener('click', (e) => e.stopPropagation());

    // ESC + TAB Focus Trap
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('is-open')) return;

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
})();

// -----------------------------------------
// 5) NAV: Aktiven Reiter markieren
// -----------------------------------------
(function markActiveNav(){
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    const items = document.querySelectorAll(".rk-nav-item");
    items.forEach(a => {
        const href = (a.getAttribute("href") || "").toLowerCase();
        if (!href) return;
        if (href === path || (path === "" && href === "index.html")) {
            a.classList.add("is-active");
            a.setAttribute("aria-current", "page");
        }
    });
})();

