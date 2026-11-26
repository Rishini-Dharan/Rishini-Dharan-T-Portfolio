/* Portfolio · Rishini Dharan T · page behaviour */

(function () {
    'use strict';

    const root = document.documentElement;

    /* ---------------- Theme toggle ---------------- */
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    function syncThemeControl() {
        const dark = root.getAttribute('data-theme') !== 'light';
        themeIcon.querySelector('use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
        themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    }
    function applyTheme(next) {
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('rd-theme', next); } catch (e) {}
        syncThemeControl();
    }
    themeToggle.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!document.startViewTransition || calm) { applyTheme(next); return; }
        // the new theme grows out of the button that was pressed
        const r = themeToggle.getBoundingClientRect();
        root.style.setProperty('--vt-x', (r.left + r.width / 2) + 'px');
        root.style.setProperty('--vt-y', (r.top + r.height / 2) + 'px');
        root.classList.add('vt-freeze'); // colour transitions would smear the snapshot
        document.startViewTransition(() => applyTheme(next)).finished
            .finally(() => root.classList.remove('vt-freeze'));
    });
    syncThemeControl();

    /* ---------------- Mobile menu ---------------- */
    const hamburger = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    function setMenu(open) {
        navMenu.classList.toggle('open', open);
        hamburger.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', String(open));
        hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    hamburger.addEventListener('click', () => setMenu(!navMenu.classList.contains('open')));
    navMenu.querySelectorAll('.nav-link').forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('open')) { setMenu(false); hamburger.focus(); }
    });

    /* ---------------- Scroll reveals ---------------- */
    (function reveals() {
        const els = document.querySelectorAll('.reveal');
        if (!('IntersectionObserver' in window)) {
            els.forEach((el) => el.classList.add('in'));
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        els.forEach((el) => io.observe(el));
    })();

    /* ---------------- Scroll systems (progress, nav, spy, timeline) ---------------- */
    const navbar = document.getElementById('navbar');
    const progressBar = document.getElementById('progress-bar');
    const timeline = document.getElementById('timeline');
    const tlFill = document.getElementById('tl-fill');
    const spyLinks = Array.from(document.querySelectorAll('.nav-link'));

    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            navbar.classList.toggle('scrolled', y > 24);

            const max = document.documentElement.scrollHeight - window.innerHeight;
            progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

            if (timeline && tlFill) {
                const rect = timeline.getBoundingClientRect();
                const passed = Math.min(Math.max(window.innerHeight * 0.6 - rect.top, 0), rect.height);
                tlFill.style.height = (rect.height > 0 ? (passed / rect.height) * 100 : 0) + '%';
            }
            ticking = false;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if ('IntersectionObserver' in window) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                spyLinks.forEach((l) => {
                    const on = l.getAttribute('href') === '#' + entry.target.id;
                    l.classList.toggle('active', on);
                    if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        document.querySelectorAll('section[id]').forEach((s) => spy.observe(s));
    }

    /* ---------------- Gallery drag scroll + lightbox ---------------- */
    (function gallery() {
        const strip = document.getElementById('gallery-strip');
        const lightbox = document.getElementById('lightbox');
        const lbImg = document.getElementById('lightbox-img');
        const lbClose = document.getElementById('lb-close');
        if (!strip || !lightbox) return;

        // Mouse drag only; touch and trackpads already scroll natively.
        let dragging = false, moved = false, startX = 0, startScroll = 0;
        strip.addEventListener('pointerdown', (e) => {
            if (e.pointerType !== 'mouse' || e.button !== 0) return;
            dragging = true; moved = false;
            startX = e.clientX;
            startScroll = strip.scrollLeft;
        });
        window.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const dx = e.clientX - startX;
            if (Math.abs(dx) > 6) { moved = true; strip.classList.add('dragging'); }
            strip.scrollLeft = startScroll - dx;
        });
        window.addEventListener('pointerup', () => {
            dragging = false;
            strip.classList.remove('dragging');
        });

        let opener = null;
        function openLb(img, trigger) {
            opener = trigger;
            lbImg.src = img.currentSrc || img.src;
            lbImg.alt = img.alt;
            lightbox.hidden = false;
            document.body.style.overflow = 'hidden';
            lbClose.focus();
        }
        function closeLb() {
            lightbox.hidden = true;
            lbImg.removeAttribute('src');
            document.body.style.overflow = '';
            if (opener) opener.focus();
        }

        strip.addEventListener('click', (e) => {
            const btn = e.target.closest('.g-open');
            if (!btn || moved) return;
            openLb(btn.querySelector('img'), btn);
        });
        lbClose.addEventListener('click', closeLb);
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLb(); });
        document.addEventListener('keydown', (e) => {
            if (lightbox.hidden) return;
            if (e.key === 'Escape') closeLb();
            if (e.key === 'Tab') { e.preventDefault(); lbClose.focus(); }
        });

        /* Auto-scroll on a loop. The photos are cloned once so that when
           scrollLeft passes the first set's width it can jump back by exactly
           that width, which looks seamless. */
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const originals = [...strip.children];
        originals.forEach((el) => {
            const c = el.cloneNode(true);
            c.setAttribute('aria-hidden', 'true');
            c.inert = true;
            strip.appendChild(c);
        });
        strip.classList.add('is-looping');
        const loopWidth = () => strip.children[originals.length].offsetLeft - originals[0].offsetLeft;

        const SPEED = 40; // px per second
        let hovered = false, focused = false, visible = false, last = 0, pos = strip.scrollLeft;
        // Touch and trackpad scrolling is native, so the loop yields while a finger is
        // down and for a moment after, then carries on from wherever the user left it.
        let touching = false, holdUntil = 0;
        const hold = (ms) => { holdUntil = performance.now() + ms; };
        strip.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') touching = true; });
        ['pointerup', 'pointercancel'].forEach((t) => strip.addEventListener(t, (e) => {
            if (e.pointerType !== 'mouse') { touching = false; hold(2500); }
        }));
        strip.addEventListener('touchstart', () => { touching = true; }, { passive: true });
        strip.addEventListener('touchend', () => { touching = false; hold(2500); }, { passive: true });
        strip.addEventListener('wheel', () => hold(1500), { passive: true });
        strip.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovered = true; });
        strip.addEventListener('pointerleave', () => { hovered = false; });
        strip.addEventListener('focusin', () => { focused = true; });
        strip.addEventListener('focusout', () => { focused = false; });
        new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(strip);

        function tick(t) {
            const dt = last ? Math.min(t - last, 100) / 1000 : 0;
            last = t;
            const w = loopWidth();
            const paused = hovered || focused || dragging || touching || t < holdUntil || !visible || !lightbox.hidden || document.hidden;
            if (paused) {
                pos = strip.scrollLeft; // pick up wherever the user dragged or swiped to
            } else {
                pos += SPEED * dt;
            }
            if (w > 0) {
                if (pos >= w) pos -= w;
                else if (pos < 0) pos += w;
            }
            if (Math.abs(strip.scrollLeft - pos) >= 0.5) strip.scrollLeft = pos;
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    })();

    /* ---------------- Contact form (EmailJS) ---------------- */
    (function contactForm() {
        const form = document.getElementById('contact-form');
        const sendBtn = document.getElementById('send-btn');
        const status = document.getElementById('form-status');
        if (!form) return;

        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let ready = false;
        function initEmail() {
            if (ready || typeof emailjs === 'undefined') return;
            emailjs.init('2XHhlJ0ailyeT-FYS');
            ready = true;
        }
        window.addEventListener('load', initEmail);

        function say(msg, kind) {
            status.textContent = msg;
            status.className = 'form-status' + (kind ? ' is-' + kind : '');
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(form));
            const fields = form.querySelectorAll('input, textarea');
            fields.forEach((f) => { f.classList.remove('error'); f.removeAttribute('aria-invalid'); });

            const empty = Array.from(fields).filter((f) => !f.value.trim());
            if (empty.length) {
                empty.forEach((f) => { f.classList.add('error'); f.setAttribute('aria-invalid', 'true'); });
                say('Please fill in every field before sending.', 'error');
                empty[0].focus();
                return;
            }
            if (!emailRe.test(data.email.trim())) {
                const email = form.querySelector('#cf-email');
                email.classList.add('error');
                email.setAttribute('aria-invalid', 'true');
                say('That email address does not look right.', 'error');
                email.focus();
                return;
            }

            initEmail();
            if (!ready) {
                say('The email service did not load. Please reach me on LinkedIn instead.', 'error');
                return;
            }

            sendBtn.disabled = true;
            sendBtn.textContent = 'Sending…';
            say('');

            emailjs.send('service_g06qotm', 'template_qovombc', {
                from_name: data.name,
                from_email: data.email,
                subject: data.subject,
                message: data.message
            }).then(() => {
                form.reset();
                say("Message sent. I'll reply to the email you gave.", 'success');
            }).catch((err) => {
                say('Sending failed (' + ((err && err.text) || 'network error') + '). Please try again or use LinkedIn.', 'error');
            }).finally(() => {
                sendBtn.disabled = false;
                sendBtn.textContent = 'Send message';
            });
        });
    })();

})();
