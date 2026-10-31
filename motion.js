/* ============================================================
   Portfolio · Rishini Dharan T
   motion.js · scroll and intro choreography (GSAP + ScrollTrigger)
   ------------------------------------------------------------
   The story the motion tells: the network boots, a signal runs
   through it, and the headline lands on "live demo." as the
   underline draws. Everything after that is scroll-driven, so
   the visitor sets the pace.
   Skipped entirely under prefers-reduced-motion.
   ============================================================ */

(function () {
    'use strict';

    const root = document.documentElement;
    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------- Pause control (works in every mode) ---------------- */
    const toggle = document.getElementById('motion-toggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            const paused = toggle.getAttribute('aria-pressed') !== 'true';
            toggle.setAttribute('aria-pressed', String(paused));
            toggle.setAttribute('aria-label', paused ? 'Resume the network animation' : 'Pause the network animation');
            toggle.querySelector('i').className = paused ? 'fa-solid fa-play' : 'fa-solid fa-pause';
            if (window.heroNet) window.heroNet.setPaused(paused);
        });
    }

    if (REDUCED || !window.gsap || !window.ScrollTrigger) {
        root.classList.remove('motion');
        return;
    }
    gsap.registerPlugin(ScrollTrigger);

    /* ---------------- Helpers ---------------- */
    // Wrap each word in a mask so it can rise into view. Inline elements
    // (the italic accent word) move as one unit to keep their styling.
    function splitWords(el) {
        const words = [];
        Array.from(el.childNodes).forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const frag = document.createDocumentFragment();
                node.textContent.split(/(\s+)/).forEach((part) => {
                    if (!part) return;
                    if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
                    frag.appendChild(mask(document.createTextNode(part), words));
                });
                node.replaceWith(frag);
            } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('hero-accent')) {
                const placeholder = document.createComment('');
                node.replaceWith(placeholder);
                placeholder.replaceWith(mask(node, words));
            }
        });
        return words;
    }
    function mask(content, list) {
        const outer = document.createElement('span');
        const inner = document.createElement('span');
        outer.className = 'w';
        inner.className = 'wi';
        inner.appendChild(content);
        outer.appendChild(inner);
        list.push(inner);
        return outer;
    }
    function unreveal(el) { if (el) el.classList.remove('reveal'); }

    function scramble(el, duration) {
        const final = el.textContent;
        const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&·';
        const state = { p: 0 };
        return gsap.to(state, {
            p: 1,
            duration,
            ease: 'none',
            onUpdate() {
                const keep = Math.floor(final.length * state.p);
                let out = final.slice(0, keep);
                for (let i = keep; i < final.length; i++) {
                    out += final[i] === ' ' ? ' ' : glyphs[(Math.random() * glyphs.length) | 0];
                }
                el.textContent = out;
            },
            onComplete() { el.textContent = final; }
        });
    }

    /* ---------------- Intro ---------------- */
    const heroName = document.querySelector('.hero-name');
    const heroTitle = document.querySelector('.hero-title');
    const heroSide = document.querySelector('.hero-side');
    const accent = document.querySelector('.hero-accent');
    const swoosh = document.querySelector('.swoosh path');
    [heroName, heroTitle, heroSide].forEach(unreveal);

    const titleWords = splitWords(heroTitle);
    const swooshLen = swoosh ? swoosh.getTotalLength() : 0;
    if (swoosh) gsap.set(swoosh, { strokeDasharray: swooshLen, strokeDashoffset: swooshLen });

    const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
    intro
        .from('.navbar', { y: -24, opacity: 0, duration: 0.9 }, 0)
        .add(() => window.heroNet && window.heroNet.boot(), 0.1)
        .add(scramble(heroName, 0.9), 0.2)
        .from(heroName, { opacity: 0, duration: 0.4 }, 0.2)
        .from(titleWords, { yPercent: 115, rotate: 5, duration: 1.3, stagger: 0.07 }, 0.35)
        .from(accent, { yPercent: 60, opacity: 0, filter: 'blur(8px)', duration: 1.4 }, 0.95)
        .add(() => window.heroNet && window.heroNet.forwardPass(), 1.2)
        .to(swoosh, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 1.75)
        .from(heroSide.children, { y: 28, opacity: 0, duration: 1, stagger: 0.12 }, 1.25)
        .from('.motion-toggle', { opacity: 0, duration: 0.6 }, 2.2);
    root.classList.add('motion-ready');

    /* ---------------- Hero: cursor light + scroll exit ---------------- */
    const hero = document.querySelector('.hero');
    hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        hero.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }, { passive: true });

    const exit = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero-inner', { yPercent: -22, opacity: 0.1, ease: 'none', scrollTrigger: exit });
    gsap.to('#hero-canvas', { scale: 1.3, opacity: 0, ease: 'none', scrollTrigger: { ...exit } });

    /* ---------------- Proof strip: rise + count up ---------------- */
    gsap.from('.proof-item', {
        y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: '.proof', start: 'top 90%' }
    });
    document.querySelectorAll('.proof [data-count]').forEach((el) => {
        const target = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const n = { v: 0 };
        gsap.to(n, {
            v: target, duration: 1.8, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 92%' },
            onUpdate() { el.textContent = n.v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
        });
    });

    /* ---------------- Section headings ---------------- */
    document.querySelectorAll('.section-head').forEach((head) => {
        unreveal(head);
        const h2 = head.querySelector('h2');
        const words = splitWords(h2);
        const tl = gsap.timeline({ scrollTrigger: { trigger: head, start: 'top 82%' } });
        tl.from(head.querySelector('.kicker'), { x: -24, opacity: 0, duration: 0.8, ease: 'expo.out' }, 0)
          .from(words, { yPercent: 115, rotate: 4, duration: 1.1, stagger: 0.05, ease: 'expo.out' }, 0.05);
    });

    /* ---------------- Featured project: opens like an aperture ---------------- */
    const featured = document.querySelector('.featured');
    if (featured) {
        unreveal(featured);
        gsap.fromTo(featured,
            { clipPath: 'inset(14% 10% 14% 10% round 16px)' },
            { clipPath: 'inset(0% 0% 0% 0% round 16px)', ease: 'none',
              scrollTrigger: { trigger: featured, start: 'top 95%', end: 'top 40%', scrub: 0.6 } });
        gsap.from(featured.querySelectorAll('.feat-copy > *'), {
            y: 30, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out',
            scrollTrigger: { trigger: featured, start: 'top 70%' }
        });
        gsap.from(featured.querySelectorAll('.feat-spec div'), {
            x: 40, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out',
            scrollTrigger: { trigger: featured, start: 'top 60%' }
        });
    }

    /* ---------------- Project rows: rule draws, then content rises ---------------- */
    document.querySelectorAll('.row').forEach((row) => {
        unreveal(row);
        row.classList.add('has-line');
        const line = document.createElement('span');
        line.className = 'row-line';
        line.setAttribute('aria-hidden', 'true');
        row.appendChild(line);
        gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 85%' } })
            .from(line, { scaleX: 0, duration: 1.1, ease: 'expo.inOut' }, 0)
            .from(row.querySelectorAll('.proj-num, .row-main > *, .row-links > *'),
                { y: 26, opacity: 0, duration: 0.9, stagger: 0.06, ease: 'expo.out' }, 0.25);
    });

    /* ---------------- Skills and coding cards ---------------- */
    document.querySelectorAll('.skill-group').forEach((group) => {
        unreveal(group);
        gsap.from(group.querySelectorAll('h3, .chip'), {
            y: 16, opacity: 0, duration: 0.6, stagger: 0.035, ease: 'power3.out',
            scrollTrigger: { trigger: group, start: 'top 85%' }
        });
    });
    const cards = document.querySelectorAll('.coding-card');
    cards.forEach(unreveal);
    gsap.from(cards, {
        y: 80, opacity: 0, rotateX: -12, transformPerspective: 900, transformOrigin: '50% 100%',
        duration: 1.2, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: '.coding-grid', start: 'top 85%' }
    });

    /* ---------------- About: photo wipes in, then drifts ---------------- */
    const photo = document.querySelector('.about-photo');
    if (photo) {
        unreveal(photo);
        const img = photo.querySelector('img');
        gsap.fromTo(photo, { clipPath: 'inset(100% 0% 0% 0% round 16px)' },
            { clipPath: 'inset(0% 0% 0% 0% round 16px)', duration: 1.4, ease: 'expo.inOut',
              scrollTrigger: { trigger: photo, start: 'top 80%' } });
        gsap.fromTo(img, { yPercent: -8, scale: 1.18 }, {
            yPercent: 8, scale: 1.18, ease: 'none',
            scrollTrigger: { trigger: photo, start: 'top bottom', end: 'bottom top', scrub: true }
        });
    }

    /* ---------------- Gallery: vertical scroll drives a horizontal reel ---------------- */
    const strip = document.getElementById('gallery-strip');
    const mm = gsap.matchMedia();
    mm.add('(min-width: 961px) and (pointer: fine)', () => {
        strip.classList.add('is-pinned');
        strip.scrollLeft = 0;
        const distance = () => Math.max(0, strip.scrollWidth - window.innerWidth);
        const reel = gsap.to(strip, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
                trigger: '#gallery',
                start: 'top top',
                end: () => '+=' + distance(),
                pin: true,
                scrub: 0.8,
                invalidateOnRefresh: true
            }
        });
        gsap.utils.toArray(strip.querySelectorAll('.g-item img')).forEach((img) => {
            gsap.fromTo(img, { scale: 1.2 }, {
                scale: 1, ease: 'none',
                scrollTrigger: { trigger: img, containerAnimation: reel, start: 'left right', end: 'center center', scrub: true }
            });
        });
        // keyboard users tabbing through photos: scroll the page to where that photo is in view
        const onFocus = (e) => {
            const item = e.target.closest('.g-item');
            if (!item) return;
            const st = reel.scrollTrigger;
            const progress = Math.min(1, Math.max(0, (item.offsetLeft - window.innerWidth * 0.3) / distance()));
            window.scrollTo({ top: st.start + (st.end - st.start) * progress, behavior: 'auto' });
        };
        strip.addEventListener('focusin', onFocus);
        return () => {
            strip.removeEventListener('focusin', onFocus);
            strip.classList.remove('is-pinned');
        };
    });

    /* ---------------- Contact ---------------- */
    const form = document.querySelector('.contact-form');
    if (form) {
        unreveal(form);
        gsap.from(form, {
            y: 60, opacity: 0, duration: 1.2, ease: 'expo.out',
            scrollTrigger: { trigger: form, start: 'top 85%' }
        });
    }

    // fonts change line lengths, which moves every trigger point
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());
})();
