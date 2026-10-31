/* ============================================================
   Portfolio — Rishini Dharan T
   visuals.js · interactive visuals
   ------------------------------------------------------------
   · hero neural network: the cursor is the input signal,
     activations propagate layer by layer, click = forward pass
   · LeetCode difficulty donut with hover / focus readout
   · skill → project filter
   ============================================================ */

(function () {
    'use strict';

    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function cssVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    /* ---------------- Hero neural network ---------------- */
    (function heroNetwork() {
        const canvas = document.getElementById('hero-canvas');
        const hero = canvas && canvas.closest('.hero');
        if (!canvas || !hero) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let W = 0, H = 0, dpr = 1;
        let nodes = [], edges = [], pulses = [];
        let colors = {};
        let pointer = { x: -9999, y: -9999, active: false, last: 0 };
        let visible = true, running = false, lastIdle = 0;

        function readColors() {
            const accent = cssVar('--accent') || '#8fd0ff';
            colors = {
                a: accent,
                b: accent,
                edge: cssVar('--net-edge') || 'rgba(159, 187, 219, 0.09)',
                node: cssVar('--net-node') || 'rgba(159, 187, 219, 0.35)'
            };
        }

        function build() {
            const rect = hero.getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = rect.width; H = rect.height;
            canvas.width = W * dpr; canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const small = W < 720;
            const layers = small ? [3, 5, 5, 3] : [4, 7, 9, 7, 4, 2];
            const x0 = W * 0.06, x1 = W * 0.94;
            // desktop hero copy sits in the lower third, so the network owns the band above it
            const top = H * 0.14, bottom = H * (small ? 0.9 : 0.5);
            nodes = []; edges = []; pulses = [];

            layers.forEach((count, li) => {
                const x = x0 + (x1 - x0) * (li / (layers.length - 1));
                for (let i = 0; i < count; i++) {
                    const y = top + (bottom - top) * ((i + 0.5) / count);
                    nodes.push({ x, y: y + (Math.random() - 0.5) * 18, layer: li, act: 0, cool: 0, out: [] });
                }
            });
            // fully connect adjacent layers, each edge with a fixed random weight
            for (const a of nodes) {
                for (const b of nodes) {
                    if (b.layer === a.layer + 1) {
                        const e = { a, b, w: 0.35 + Math.random() * 0.65 };
                        edges.push(e);
                        a.out.push(e);
                    }
                }
            }
        }

        function fire(node, strength) {
            node.act = Math.min(1, node.act + strength);
        }

        function forwardPass() {
            nodes.forEach(n => { if (n.layer === 0) fire(n, 1); });
            wake();
        }

        function step() {
            const now = performance.now();

            // cursor proximity excites nearby neurons
            if (pointer.active) {
                for (const n of nodes) {
                    const d = Math.hypot(n.x - pointer.x, n.y - pointer.y);
                    if (d < 130) fire(n, (1 - d / 130) * 0.08);
                }
            } else if (!REDUCED && now - lastIdle > 2600 && now - pointer.last > 3000) {
                // idle: a single faint input so the hero never reads as a still image
                lastIdle = now;
                const inputs = nodes.filter(n => n.layer === 0);
                fire(inputs[(Math.random() * inputs.length) | 0], 0.7);
            }

            // saturated neurons emit pulses along their strongest outgoing edges
            for (const n of nodes) {
                if (n.cool > 0) n.cool--;
                if (n.act > 0.55 && n.cool === 0 && n.out.length) {
                    n.out.forEach(e => { if (Math.random() < e.w * 0.55) pulses.push({ e, t: 0, s: n.act * e.w }); });
                    n.cool = 26;
                    n.act *= 0.5;
                }
                n.act *= 0.965;
            }

            for (let i = pulses.length - 1; i >= 0; i--) {
                const p = pulses[i];
                p.t += 0.028;
                if (p.t >= 1) {
                    fire(p.e.b, p.s * 0.9);
                    pulses.splice(i, 1);
                }
            }
            if (pulses.length > 260) pulses.splice(0, pulses.length - 260);
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);

            ctx.lineWidth = 1;
            ctx.strokeStyle = colors.edge;
            ctx.beginPath();
            for (const e of edges) { ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); }
            ctx.stroke();

            // edges carrying a pulse light up behind it
            ctx.strokeStyle = colors.b;
            for (const p of pulses) {
                const { a, b } = p.e;
                const t0 = Math.max(0, p.t - 0.18);
                ctx.globalAlpha = 0.5 * p.s;
                ctx.beginPath();
                ctx.moveTo(a.x + (b.x - a.x) * t0, a.y + (b.y - a.y) * t0);
                ctx.lineTo(a.x + (b.x - a.x) * p.t, a.y + (b.y - a.y) * p.t);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;

            for (const n of nodes) {
                const r = 3 + n.act * 4;
                ctx.fillStyle = colors.node;
                ctx.beginPath(); ctx.arc(n.x, n.y, 3, 0, Math.PI * 2); ctx.fill();
                if (n.act > 0.04) {
                    ctx.globalAlpha = Math.min(1, n.act * 1.4);
                    ctx.fillStyle = n.layer % 2 ? colors.b : colors.a;
                    ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill();
                    ctx.globalAlpha = 1;
                }
            }
        }

        function settled() {
            return !pointer.active && !pulses.length && nodes.every(n => n.act < 0.01);
        }

        function loop() {
            if (!visible || document.hidden || (REDUCED && settled())) { running = false; return; }
            step();
            draw();
            requestAnimationFrame(loop);
        }

        function wake() {
            if (!running && visible && !document.hidden) { running = true; requestAnimationFrame(loop); }
        }

        readColors();
        build();
        draw();

        window.addEventListener('resize', () => { build(); draw(); }, { passive: true });

        new MutationObserver(() => { readColors(); draw(); })
            .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        hero.addEventListener('pointermove', ev => {
            const r = hero.getBoundingClientRect();
            pointer.x = ev.clientX - r.left;
            pointer.y = ev.clientY - r.top;
            pointer.active = true;
            pointer.last = performance.now();
            wake();
        }, { passive: true });
        hero.addEventListener('pointerleave', () => { pointer.active = false; });
        hero.addEventListener('click', ev => {
            if (ev.target.closest('a, button')) return;
            forwardPass();
        });

        new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
            if (visible) wake();
        }).observe(hero);
        document.addEventListener('visibilitychange', wake);

        if (!REDUCED) {
            wake();
            setTimeout(forwardPass, 900);
        }
    })();

    /* ---------------- LeetCode difficulty donut ---------------- */
    (function leetcodeDonut() {
        const group = document.getElementById('lc-arcs');
        const keys = Array.from(document.querySelectorAll('.lc-key'));
        const num = document.getElementById('lc-center-num');
        const cap = document.getElementById('lc-center-cap');
        if (!group || !keys.length) return;

        const R = 48, C = 2 * Math.PI * R, GAP = 3;
        const total = keys.reduce((s, k) => s + Number(k.dataset.n), 0);
        const arcs = {};
        let offset = 0;

        keys.forEach(k => {
            const n = Number(k.dataset.n);
            const len = (n / total) * C;
            const arc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            arc.setAttribute('cx', 60); arc.setAttribute('cy', 60); arc.setAttribute('r', R);
            arc.setAttribute('class', 'lc-arc lc-' + k.dataset.k);
            arc.style.strokeDasharray = `${Math.max(0, len - GAP)} ${C}`;
            arc.style.strokeDashoffset = -offset;
            arc.addEventListener('pointerenter', () => show(k.dataset.k));
            arc.addEventListener('pointerleave', reset);
            group.appendChild(arc);
            arcs[k.dataset.k] = arc;
            offset += len;
        });

        function show(key) {
            const k = keys.find(x => x.dataset.k === key);
            const n = Number(k.dataset.n);
            num.textContent = n;
            cap.textContent = `${key} · ${Math.round((n / total) * 100)}%`;
            group.classList.add('has-focus');
            Object.entries(arcs).forEach(([name, el]) => el.classList.toggle('is-on', name === key));
            keys.forEach(x => x.classList.toggle('is-on', x === k));
        }
        function reset() {
            num.textContent = total;
            cap.textContent = 'solved';
            group.classList.remove('has-focus');
            Object.values(arcs).forEach(el => el.classList.remove('is-on'));
            keys.forEach(x => x.classList.remove('is-on'));
        }

        keys.forEach(k => {
            k.addEventListener('pointerenter', () => show(k.dataset.k));
            k.addEventListener('focus', () => show(k.dataset.k));
            k.addEventListener('click', () => show(k.dataset.k));
            k.addEventListener('pointerleave', reset);
            k.addEventListener('blur', reset);
        });
    })();

    /* ---------------- Skill → project filter ---------------- */
    (function skillFilter() {
        const chips = Array.from(document.querySelectorAll('.chips .chip'));
        const cards = Array.from(document.querySelectorAll('.project-card[data-skills]'));
        const text = document.getElementById('filter-text');
        const clear = document.getElementById('filter-clear');
        if (!chips.length || !cards.length || !text) return;

        const ALIAS = { 'google cloud platform': 'gcp' };
        const keyOf = chip => ALIAS[chip.textContent.trim().toLowerCase()] || chip.textContent.trim().toLowerCase();
        const defaultText = text.textContent;
        let current = null;

        chips.forEach(c => c.setAttribute('aria-pressed', 'false'));

        function apply(chip) {
            current = chip;
            chips.forEach(c => {
                const on = c === chip;
                c.classList.toggle('is-active', on);
                c.setAttribute('aria-pressed', String(on));
            });
            if (!chip) {
                cards.forEach(card => card.classList.remove('is-match', 'is-dim'));
                text.textContent = defaultText;
                clear.hidden = true;
                return;
            }
            const key = keyOf(chip);
            let hits = 0;
            cards.forEach(card => {
                const match = card.dataset.skills.split(' ').includes(key);
                if (match) hits++;
                card.classList.toggle('is-match', match);
                card.classList.toggle('is-dim', !match);
            });
            const label = chip.textContent.trim();
            text.textContent = hits
                ? `${label}: used in ${hits} of ${cards.length} projects below`
                : `${label}: not in a listed project yet. Ask me about it.`;
            clear.hidden = false;
            if (hits) document.getElementById('work').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
        }

        chips.forEach(c => c.addEventListener('click', () => apply(current === c ? null : c)));
        clear.addEventListener('click', () => apply(null));
    })();
})();
