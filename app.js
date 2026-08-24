/* Portfolio — Rishini Dharan T · interactive layer */

(function () {
    'use strict';

    const FINE_POINTER = window.matchMedia('(pointer: fine)').matches;
    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------- Preloader ---------------- */
    const preloader = document.getElementById('preloader');
    function hidePreloader() {
        if (!preloader || preloader.classList.contains('done')) return;
        preloader.classList.add('done');
        setTimeout(() => preloader.remove(), 600);
    }
    window.addEventListener('load', () => setTimeout(hidePreloader, REDUCED ? 100 : 500));
    setTimeout(hidePreloader, 2500);

    /* ---------------- Custom cursor ---------------- */
    if (FINE_POINTER && !REDUCED) {
        document.documentElement.classList.add('has-cursor');
        const dot = document.getElementById('cursor-dot');
        const ring = document.getElementById('cursor-ring');

        let mx = -100, my = -100, rx = -100, ry = -100;

        window.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
            dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        }, { passive: true });

        (function loop() {
            rx += (mx - rx) * 0.16;
            ry += (my - ry) * 0.16;
            ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
            requestAnimationFrame(loop);
        })();

        const HOVERABLE = 'a, button, input, textarea, .tilt, .g-item, .chips span, .social-orb';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(HOVERABLE)) document.documentElement.classList.add('cursor-hover');
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(HOVERABLE)) document.documentElement.classList.remove('cursor-hover');
        });
        document.addEventListener('mousedown', () => document.documentElement.classList.add('cursor-down'));
        document.addEventListener('mouseup', () => document.documentElement.classList.remove('cursor-down'));
    }

    /* ---------------- Hero letter split ---------------- */
    document.querySelectorAll('.split-letters').forEach((el) => {
        let i = 0;
        const words = el.textContent.trim().split(/\s+/);
        el.innerHTML = words.map((w) =>
            `<span class="w">${[...w].map((c) => `<span class="ch" style="--i:${i++}">${c}</span>`).join('')}</span>`
        ).join(' ');
    });

    /* ---------------- Random falling-code events ---------------- */
    (function rain() {
        const canvas = document.getElementById('rain-canvas');
        if (!canvas || REDUCED) return;
        const ctx = canvas.getContext('2d');

        const TOKENS = ['const', 'let', '=>', '</>', '{ }', 'if()', 'for()', 'await', 'async', 'null', '===', '!==', '&&', '||', 'fn()', 'import', 'export', 'return', '.map(', '[i]', '0x1F', 'def', 'while', 'try{', 'catch', 'push()', 'npm i', 'git', '.len', 'sum()', 'class', 'yield', '?..', '::'];
        let W, H, dpr, fs = 14, lh = 21, colW = 56;
        let mouse = { x: -9999, y: -9999 };
        let drops = [];
        let ripples = [];
        let guard = [];
        let running = true;
        let last = 0;

        function isDark() {
            return document.documentElement.getAttribute('data-theme') !== 'light';
        }
        function paint() {
            return isDark() ? 'rgba(4,5,13,0.015)' : 'rgba(242,244,252,0.018)';
        }

        function computeGuard() {
            guard = [];
            document.querySelectorAll('.hero-title').forEach((el) => {
                const r = el.getBoundingClientRect();
                if (r.width && r.height) guard.push({ x: r.x - 30, y: r.y - 20, w: r.width + 60, h: r.height + 40 });
            });
        }
        function inGuard(x, y) {
            for (const g of guard) if (x > g.x && x < g.x + g.w && y > g.y && y < g.y + g.h) return true;
            return false;
        }

        function size() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            fs = W < 640 ? 12 : 14;
            ctx.font = `${fs}px 'JetBrains Mono', monospace`;
            lh = Math.round(fs * 1.5);
            colW = Math.max(...TOKENS.map((t) => ctx.measureText(t).width)) + 16;
            drops.length = 0;
            computeGuard();
            ctx.fillStyle = paint();
            ctx.fillRect(0, 0, W, H);
        }

        function spawn(burst) {
            const n = burst ? 2 + ((Math.random() * 3) | 0) : 1;
            for (let j = 0; j < n; j++) {
                drops.push({
                    x: colW / 2 + Math.random() * Math.max(1, W - colW),
                    y: -Math.random() * H * 0.7,
                    sp: 1.1 + Math.random() * 3.2,
                    len: 4 + ((Math.random() * 14) | 0),
                    seed: (Math.random() * 997) | 0,
                    toks: Array.from({ length: 48 }, () => TOKENS[(Math.random() * TOKENS.length) | 0]),
                    violet: Math.random() < 0.45,
                    dying: false
                });
            }
        }

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        }, { passive: true });
        document.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
        window.addEventListener('pointerdown', (e) => {
            if (e.target.closest('a, button, input, textarea')) return;
            ripples.push({ x: e.clientX, y: e.clientY, r: 4, a: 1 });
            if (ripples.length > 5) ripples.shift();
        });

        let resizeTimer = 0;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                size();
            }, 100);
        }, { passive: true });

        function tick(t) {
            if (!running) return;
            requestAnimationFrame(tick);
            if (t - last < 33) return;
            last = t;

            const cap = W < 640 ? 8 : 16;
            if (drops.length < cap && Math.random() < 0.035) spawn(Math.random() < 0.2);

            ctx.font = `${fs}px 'JetBrains Mono', monospace`;
            ctx.textAlign = 'center';
            ctx.fillStyle = paint();
            ctx.fillRect(0, 0, W, H);

            for (let i = ripples.length - 1; i >= 0; i--) {
                const rp = ripples[i];
                rp.r += 5;
                rp.a *= 0.94;
                if (rp.a < 0.02) { ripples.splice(i, 1); continue; }
                ctx.beginPath();
                ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(80,255,255,${rp.a * 0.8})`;
                ctx.lineWidth = 2.5;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(rp.x, rp.y, rp.r * 0.62, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(180,140,255,${rp.a * 0.6})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            const dark = isDark();
            const GLOW_R = 160;

            for (let i = drops.length - 1; i >= 0; i--) {
                const d = drops[i];
                d.y += d.sp;
                if (!d.dying && Math.random() < 0.0022) d.dying = true;

                for (let k = 0; k < d.len; k++) {
                    const yy = d.y - k * lh;
                    if (yy < -lh || yy > H + lh) continue;
                    if (inGuard(d.x, yy)) continue;
                    const tl = d.toks.length;
                    const tok = d.toks[((Math.floor(yy / lh) + d.seed) % tl + tl) % tl];
                    const dx = d.x - mouse.x;
                    const dy = yy - mouse.y;
                    const near = dx * dx + dy * dy < GLOW_R * GLOW_R;

                    if (k === 0 && !d.dying) {
                        ctx.shadowColor = near ? 'rgba(220,255,255,1)' : (dark ? 'rgba(80,230,255,1)' : 'rgba(30,150,200,1)');
                        ctx.shadowBlur = near ? 28 : 10;
                        ctx.fillStyle = near ? '#e0ffff' : (dark ? '#8ae8ff' : '#1e96c8');
                    } else if (near) {
                        ctx.shadowBlur = 0;
                        ctx.fillStyle = `rgba(${dark ? '125,211,252' : '3,105,161'},${Math.max(0, 0.95 - k / d.len * 0.3)})`;
                    } else {
                        ctx.shadowBlur = 0;
                        const v = d.violet || Math.random() < 0.45;
                        ctx.fillStyle = dark
                            ? `rgba(${v ? '167,139,250' : '34,211,238'},${Math.max(0, 0.7 - k / d.len * 0.25)})`
                            : `rgba(${v ? '109,93,246' : '8,145,178'},${Math.max(0, 0.65 - k / d.len * 0.2)})`;
                    }
                    ctx.fillText(tok, d.x, yy);
                }
                ctx.shadowBlur = 0;

                if (d.dying) {
                    d.len -= 0.18;
                    if (d.len <= 0) drops.splice(i, 1);
                } else if (d.y - lh * d.len > H) {
                    drops.splice(i, 1);
                }
            }
        }

        document.addEventListener('visibilitychange', () => {
            running = !document.hidden;
            if (running) { last = 0; requestAnimationFrame(tick); }
        });
        window.addEventListener('resize', size);
        window.addEventListener('load', computeGuard);

        size();
        requestAnimationFrame(tick);
    })();

    /* ---------------- Magnetic buttons ---------------- */
    if (FINE_POINTER && !REDUCED) {
        document.querySelectorAll('.magnetic').forEach((el) => {
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                el.style.transform = `translate(${x * 0.28}px, ${y * 0.32}px)`;
            });
            el.addEventListener('mouseleave', () => { el.style.transform = ''; });
        });
    }

    /* ---------------- Tilt + spotlight ---------------- */
    if (FINE_POINTER && !REDUCED) {
        document.querySelectorAll('.tilt').forEach((el) => {
            const max = parseFloat(el.dataset.tiltMax || 7);
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width;
                const py = (e.clientY - r.top) / r.height;
                el.style.transform =
                    `perspective(950px) rotateX(${((py - 0.5) * -2 * max).toFixed(2)}deg) rotateY(${((px - 0.5) * 2 * max).toFixed(2)}deg) translateZ(6px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
                el.style.transform = '';
                setTimeout(() => { el.style.transition = ''; }, 500);
            });
        });
    }

    document.querySelectorAll('.spot').forEach((el) => {
        el.addEventListener('mousemove', (e) => {
            const r = el.getBoundingClientRect();
            el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
            el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        }, { passive: true });
    });

    /* ---------------- Theme toggle ---------------- */
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    function applyThemeIcon() {
        const t = document.documentElement.getAttribute('data-theme');
        themeIcon.textContent = t === 'dark' ? '🌙' : '☀️';
    }
    themeToggle.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('rd-theme', next);
        applyThemeIcon();
    });
    applyThemeIcon();

    /* ---------------- Mobile menu ---------------- */
    const hamburger = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        hamburger.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    });
    navMenu.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    /* ---------------- Scroll reveals ---------------- */
    (function reveals() {
        document.querySelectorAll('[data-stagger]').forEach((group) => {
            Array.from(group.children).forEach((child, i) => {
                child.classList.add('reveal');
                if (!child.style.getPropertyValue('--d')) child.style.setProperty('--d', (i * 0.09) + 's');
            });
        });

        const els = document.querySelectorAll('.reveal');
        if (REDUCED || !('IntersectionObserver' in window)) {
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

    /* ---------------- Animated counters ---------------- */
    (function counters() {
        const nums = document.querySelectorAll('.counter');
        if (!nums.length) return;
        function run(el) {
            const target = parseFloat(el.dataset.target);
            const decimals = parseInt(el.dataset.decimals || 0, 10);
            const dur = 1500;
            let start;
            function step(ts) {
                if (!start) start = ts;
                const p = Math.min((ts - start) / dur, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = (target * eased).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                if (p < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        }
        if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
            });
        }, { threshold: 0.5 });
        nums.forEach((n) => io.observe(n));
    })();

    /* ---------------- Typing effect ---------------- */
    (function typing() {
        const el = document.getElementById('typing-text');
        if (!el) return;
        const roles = [
            'AI & Full Stack Developer',
            'Machine Learning Engineer',
            'Frontend Developer',
            'Quantum ML Explorer',
            'Problem Solver'
        ];
        if (REDUCED) { el.textContent = roles[0]; return; }
        let ti = 0, ci = 0, deleting = false;

        (function type() {
            const current = roles[ti];
            ci += deleting ? -1 : 1;
            el.textContent = current.substring(0, ci);

            let speed = deleting ? 55 : 95 + Math.random() * 60;
            if (!deleting && ci === current.length) { speed = 2100; deleting = true; }
            else if (deleting && ci === 0) { deleting = false; ti = (ti + 1) % roles.length; speed = 420; }
            setTimeout(type, speed);
        })();
    })();

    /* ---------------- Scroll systems (progress, nav, spy, timeline, to-top) ---------------- */
    const navbar = document.getElementById('navbar');
    const progressBar = document.getElementById('progress-bar');
    const toTop = document.getElementById('to-top');
    const timeline = document.getElementById('timeline');
    const tlFill = document.getElementById('tl-fill');
    const spyLinks = Array.from(document.querySelectorAll('.nav-link'));

    let ticking = false;
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                const y = window.scrollY || document.documentElement.scrollTop;

                navbar.classList.toggle('scrolled', y > 40);
                toTop.classList.toggle('show', y > 600);

                const max = document.documentElement.scrollHeight - window.innerHeight;
                progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

                if (timeline && tlFill) {
                    const rect = timeline.getBoundingClientRect();
                    const passed = Math.min(Math.max(window.innerHeight * 0.6 - rect.top, 0), rect.height);
                    tlFill.style.height = (rect.height > 0 ? (passed / rect.height) * 100 : 0) + '%';
                }
                ticking = false;
            });
            ticking = true;
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }));

    if ('IntersectionObserver' in window) {
        const sections = document.querySelectorAll('section[id]');
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    spyLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach((s) => spy.observe(s));
    }

    /* ---------------- Gallery drag scroll + lightbox ---------------- */
    (function gallery() {
        const strip = document.getElementById('gallery-strip');
        const lightbox = document.getElementById('lightbox');
        const lbImg = document.getElementById('lightbox-img');
        const lbClose = document.getElementById('lb-close');

        let dragging = false, moved = false, startX = 0, startScroll = 0;

        strip.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            dragging = true; moved = false;
            startX = e.clientX;
            startScroll = strip.scrollLeft;
            strip.classList.add('dragging');
        });

        window.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const dx = e.clientX - startX;
            if (Math.abs(dx) > 6) moved = true;
            strip.scrollLeft = startScroll - dx;
        });

        window.addEventListener('pointerup', () => {
            dragging = false;
            strip.classList.remove('dragging');
        });

        function openLb(src, alt) {
            lbImg.src = src;
            lbImg.alt = alt || '';
            lightbox.classList.add('active');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
        function closeLb() {
            lightbox.classList.remove('active');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        strip.addEventListener('click', (e) => {
            if (moved) return;
            const item = e.target.closest('.g-item');
            if (!item) return;
            const img = item.querySelector('img');
            openLb(img.src, img.alt);
        });

        lbClose.addEventListener('click', closeLb);
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLb(); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLb();
        });
    })();

    /* ---------------- Toasts ---------------- */
    const toastsHost = document.createElement('div');
    toastsHost.className = 'toasts';
    document.body.appendChild(toastsHost);

    function toast(message, type = 'info') {
        const t = document.createElement('div');
        t.className = `toast toast--${type}`;
        t.textContent = message;
        toastsHost.appendChild(t);
        setTimeout(() => {
            t.classList.add('out');
            setTimeout(() => t.remove(), 400);
        }, 4200);
    }

    /* ---------------- Contact form (EmailJS) ---------------- */
    (function contactForm() {
        const form = document.getElementById('contact-form');
        const sendBtn = document.getElementById('send-btn');
        if (!form) return;

        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        form.querySelectorAll('input, textarea').forEach((field) => {
            field.addEventListener('blur', () => {
                field.classList.remove('valid', 'error');
                const v = field.value.trim();
                if (!v) return;
                if (field.type === 'email') field.classList.add(emailRe.test(v) ? 'valid' : 'error');
                else field.classList.add(v.length >= 2 ? 'valid' : 'error');
            });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(form));

            if (!data.name.trim() || !data.email.trim() || !data.subject.trim() || !data.message.trim()) {
                toast('Please fill in every field before sending.', 'error');
                return;
            }
            if (!emailRe.test(data.email)) {
                toast('That email address does not look right.', 'error');
                return;
            }

            sendBtn.classList.add('sending');
            sendBtn.innerHTML = 'Sending… <i class="fa-solid fa-circle-notch fa-spin"></i>';

            const finish = () => {
                sendBtn.classList.remove('sending');
                sendBtn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';
            };

            const send = typeof emailjs !== 'undefined' && emailjs.send
                ? emailjs.send('service_g06qotm', 'template_qovombc', {
                    from_name: data.name,
                    from_email: data.email,
                    subject: data.subject,
                    message: data.message
                })
                : Promise.reject({ text: 'Email service unavailable.' });

            send.then(() => {
                finish();
                toast("Message sent! I'll get back to you soon.", 'success');
                form.reset();
                form.querySelectorAll('.valid,.error').forEach((el) => el.classList.remove('valid', 'error'));
            }).catch((err) => {
                finish();
                toast('Failed to send. ' + ((err && err.text) || 'Please try again later.'), 'error');
            });
        });
    })();

    /* ---------------- Fortune 500 globe ---------------- */
    (function globe() {
        const wrap = document.getElementById('globe-wrap');
        if (!wrap || !document.getElementById('globe')) return;
        let started = false;

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) { start(); io.disconnect(); }
            });
        }, { rootMargin: '400px' });
        io.observe(wrap);

        function loadScript(src) {
            return new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = src;
                s.onload = resolve;
                s.onerror = () => reject(new Error('load fail: ' + src));
                document.head.appendChild(s);
            });
        }

        async function start() {
            if (started) return;
            started = true;
            try {
                await loadScript('https://unpkg.com/globe.gl');
            } catch (e) {
                wrap.classList.add('ready');
                return;
            }
            if (typeof Globe === 'undefined') { wrap.classList.add('ready'); return; }

            const el = document.getElementById('globe');
            const tip = document.getElementById('globe-tip');
            const data = window.GLOBAL100 || [];
            const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

            let hovered = null;
            const g = Globe({ animateIn: false })(el)
                .backgroundColor('rgba(0,0,0,0)')
                .showAtmosphere(true)
                .atmosphereAltitude(0.17)
                .pointsData(data)
                .pointLat('lat')
                .pointLng('lng')
                .pointAltitude(0.02)
                .pointRadius(0.55)
                .pointColor((d) => ((d.n.charCodeAt(0) + Math.abs(d.lng)) | 0) % 2 ? '#fbbf24' : '#fb7185')
                .pointsMerge(false);

            function applyTheme() {
                g.globeImageUrl('//unpkg.com/three-globe/example/img/earth-day.jpg');
                g.atmosphereColor(isDark() ? '#22d3ee' : '#0891b2');
            }
            applyTheme();
            new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

            g.width(wrap.clientWidth).height(wrap.clientHeight);
            new ResizeObserver(() => g.width(wrap.clientWidth).height(wrap.clientHeight)).observe(wrap);

            const controls = g.controls();
            controls.autoRotate = false;
            controls.enableZoom = true;
            controls.enableDamping = false;
            g.pointOfView({ lat: 24, lng: 20, altitude: 2.4 }, 600);

            const ambLight = g.lights().find(l => l.type === 'AmbientLight');
            const dirLight = g.lights().find(l => l.type === 'DirectionalLight');
            if (ambLight) ambLight.intensity = 6.0;
            if (dirLight) {
                dirLight.intensity = 2.2;
                const aimLight = () => {
                    const p = g.camera().position;
                    const len = p.length();
                    dirLight.position.set(p.x / len * 400, p.y / len * 400, p.z / len * 400);
                };
                aimLight();
                controls.addEventListener('change', aimLight);
            }
            wrap.addEventListener('pointerdown', () => {
                controls.autoRotate = false;
                wrap.classList.add('dragging');
            });
            window.addEventListener('pointerup', () => wrap.classList.remove('dragging'));

            el.addEventListener('pointermove', (e) => {
                const r = wrap.getBoundingClientRect();
                const mx = e.clientX - r.left, my = e.clientY - r.top;
                const cam = g.camera().position;
                let best = null, bestD2 = 22 * 22;
                for (const d of data) {
                    const phi = (90 - d.lat) * Math.PI / 180, theta = (90 - d.lng) * Math.PI / 180;
                    const vx = Math.sin(phi) * Math.cos(theta), vy = Math.cos(phi), vz = Math.sin(phi) * Math.sin(theta);
                    if (vx * cam.x + vy * cam.y + vz * cam.z <= 0) continue;
                    const s = g.getScreenCoords(d.lat, d.lng);
                    const dx = s.x - mx, dy = s.y - my, d2 = dx * dx + dy * dy;
                    if (d2 < bestD2) { bestD2 = d2; best = d; }
                }
                hovered = best;
                tip.hidden = !best;
                if (best) {
                    tip.innerHTML = '<b>' + best.n + '</b><br>' + best.c;
                    tip.style.left = e.clientX + 'px';
                    tip.style.top = e.clientY + 'px';
                }
            });
            el.addEventListener('pointerleave', () => { hovered = null; tip.hidden = true; });

            wrap.classList.add('ready');
            window.__fortuneGlobe = g;
        }
    })();
})();
