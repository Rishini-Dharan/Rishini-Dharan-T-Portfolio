/* ============================================================
   Portfolio — Rishini Dharan T
   ambient.js · random background events engine
   ------------------------------------------------------------
   A lightweight, self-scheduling scene director that fires
   short-lived "engineering" events onto a dedicated canvas
   layer: signal packets routed across PCB traces, meteors,
   network topologies, radar pings, CRT scan sweeps, bit flips,
   satellite orbits and drifting code ghosts.

   Design constraints:
     · one shared rAF loop, ~40fps ceiling
     · caps concurrent events (3 desktop / 2 mobile)
     · sleeps while the tab is hidden
     · fully disabled under prefers-reduced-motion
   ============================================================ */

(function () {
    'use strict';

    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (REDUCED) return;

    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let W = 0, H = 0, dpr = 1, mobile = false;

    /* ---------------- utils ---------------- */
    const rnd = (a, b) => a + Math.random() * (b - a);
    const irnd = (a, b) => Math.floor(rnd(a, b + 1));
    const pick = (arr) => arr[(Math.random() * arr.length) | 0];
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const ease = {
        out: (p) => 1 - Math.pow(1 - p, 3),
        io: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
        // 0 -> 1 -> 0 envelope: fade in, hold, fade out
        pulse: (p, rise, fall) => (p < rise ? p / rise : p > 1 - fall ? (1 - p) / fall : 1)
    };

    function palette() {
        const light = document.documentElement.getAttribute('data-theme') === 'light';
        return light
            ? { cyan: '6,148,180', violet: '109,93,246', pink: '190,24,93', green: '5,150,105', amber: '180,120,10', k: 0.7 }
            : { cyan: '34,211,238', violet: '167,139,250', pink: '244,114,182', green: '52,211,153', amber: '251,191,36', k: 1 };
    }
    const accents = (p) => [p.cyan, p.violet, p.cyan, p.green, p.pink];

    /* ---------------- sizing ---------------- */
    function size() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        mobile = W < 760;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /* ============================================================
       EVENTS
       Each factory returns { life, draw(ctx, p, dt) } where p is
       normalised progress 0->1. The director disposes it at p >= 1.
       ============================================================ */

    /* --- 1. signal packet routed across a PCB trace --- */
    function evPacket() {
        const p = palette();
        const col = Math.random() < 0.62 ? p.cyan : p.violet;
        const pts = [];
        const DIAG = 0.70710678;
        const side = irnd(0, 3);
        let x, y, d;
        if (side === 0) { x = rnd(W * 0.1, W * 0.9); y = -30; d = [0, 1]; }
        else if (side === 1) { x = W + 30; y = rnd(H * 0.1, H * 0.9); d = [-1, 0]; }
        else if (side === 2) { x = rnd(W * 0.1, W * 0.9); y = H + 30; d = [0, -1]; }
        else { x = -30; y = rnd(H * 0.1, H * 0.9); d = [1, 0]; }
        pts.push({ x: x, y: y });

        const segs = irnd(4, 7);
        for (let i = 0; i < segs; i++) {
            const len = rnd(70, 240);
            x += d[0] * len; y += d[1] * len;
            pts.push({ x: x, y: y });
            // 90 degree turns mostly, 45 occasionally — reads like a real board trace
            const turn = Math.random() < 0.72 ? 90 : 45;
            const s = Math.random() < 0.5 ? 1 : -1;
            const a = Math.atan2(d[1], d[0]) + (turn * Math.PI / 180) * s;
            let nx = Math.cos(a), ny = Math.sin(a);
            // snap to the 8 board directions
            nx = Math.abs(nx) < 0.35 ? 0 : Math.sign(nx) * (Math.abs(ny) < 0.35 ? 1 : DIAG);
            ny = Math.abs(ny) < 0.35 ? 0 : Math.sign(ny) * (nx === 0 ? 1 : DIAG);
            if (nx === 0 && ny === 0) { nx = 1; ny = 0; }
            // steer back in if the trace wanders far off canvas
            if (x < -80) nx = Math.abs(nx) || 1;
            if (x > W + 80) nx = -Math.abs(nx) || -1;
            if (y < -80) ny = Math.abs(ny) || 1;
            if (y > H + 80) ny = -Math.abs(ny) || -1;
            d = [nx, ny];
        }

        const cum = [0];
        for (let i = 1; i < pts.length; i++) {
            cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
        }
        const total = cum[cum.length - 1] || 1;

        function at(dist) {
            const t = clamp(dist, 0, total);
            for (let i = 1; i < cum.length; i++) {
                if (t <= cum[i]) {
                    const f = (t - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
                    return {
                        x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f,
                        y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f
                    };
                }
            }
            return pts[pts.length - 1];
        }
        function strokeRange(a, b, style, width) {
            if (b <= a) return;
            ctx.beginPath();
            const s = at(a);
            ctx.moveTo(s.x, s.y);
            for (let i = 1; i < cum.length; i++) {
                if (cum[i] > a && cum[i] < b) ctx.lineTo(pts[i].x, pts[i].y);
            }
            const e = at(b);
            ctx.lineTo(e.x, e.y);
            ctx.strokeStyle = style;
            ctx.lineWidth = width;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        return {
            life: rnd(2600, 3800),
            draw: function (ctx, prog) {
                const a = ease.pulse(prog, 0.08, 0.22) * p.k;
                strokeRange(0, total, 'rgba(' + col + ',' + (0.1 * a) + ')', 1.1);
                for (let i = 1; i < pts.length - 1; i++) {
                    ctx.beginPath();
                    ctx.arc(pts[i].x, pts[i].y, 2.6, 0, 6.283);
                    ctx.strokeStyle = 'rgba(' + col + ',' + (0.24 * a) + ')';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                const head = ease.io(clamp((prog - 0.06) / 0.82, 0, 1)) * total;
                strokeRange(Math.max(0, head - 150), head, 'rgba(' + col + ',' + (0.5 * a) + ')', 1.7);
                strokeRange(Math.max(0, head - 46), head, 'rgba(' + col + ',' + (0.85 * a) + ')', 2.2);
                const hp = at(head);
                ctx.shadowColor = 'rgba(' + col + ',' + (0.9 * a) + ')';
                ctx.shadowBlur = 16;
                ctx.beginPath();
                ctx.arc(hp.x, hp.y, 3.1, 0, 6.283);
                ctx.fillStyle = 'rgba(' + col + ',' + a + ')';
                ctx.fill();
                ctx.shadowBlur = 0;
                if (prog > 0.86) {
                    const b = (prog - 0.86) / 0.14;
                    const end = pts[pts.length - 1];
                    ctx.beginPath();
                    ctx.arc(end.x, end.y, 4 + b * 26, 0, 6.283);
                    ctx.strokeStyle = 'rgba(' + col + ',' + ((1 - b) * 0.55 * p.k) + ')';
                    ctx.lineWidth = 1.4;
                    ctx.stroke();
                }
            }
        };
    }

    /* --- 2. meteor --- */
    function evMeteor() {
        const p = palette();
        const col = Math.random() < 0.5 ? p.cyan : p.violet;
        const ang = rnd(2.42, 2.72);
        const len = rnd(150, 320);
        const dist = Math.hypot(W, H) * rnd(0.55, 0.95);
        const sx = rnd(W * 0.35, W * 1.15);
        const sy = rnd(-H * 0.1, H * 0.55);
        const dx = Math.cos(ang), dy = Math.sin(ang);
        const sparks = Array.from({ length: 5 }, () => ({ at: rnd(0.15, 0.9), off: rnd(-9, 9), r: rnd(0.8, 1.9) }));
        return {
            life: rnd(1100, 1700),
            draw: function (ctx, prog) {
                const a = ease.pulse(prog, 0.12, 0.35) * p.k;
                const t = ease.out(prog) * dist;
                const hx = sx + dx * t, hy = sy + dy * t;
                const tx = hx - dx * len, ty = hy - dy * len;
                const g = ctx.createLinearGradient(tx, ty, hx, hy);
                g.addColorStop(0, 'rgba(' + col + ',0)');
                g.addColorStop(0.7, 'rgba(' + col + ',' + (0.28 * a) + ')');
                g.addColorStop(1, 'rgba(' + col + ',' + (0.9 * a) + ')');
                ctx.beginPath();
                ctx.moveTo(tx, ty);
                ctx.lineTo(hx, hy);
                ctx.strokeStyle = g;
                ctx.lineWidth = 1.9;
                ctx.lineCap = 'round';
                ctx.stroke();
                ctx.shadowColor = 'rgba(' + col + ',' + a + ')';
                ctx.shadowBlur = 18;
                ctx.beginPath();
                ctx.arc(hx, hy, 2.2, 0, 6.283);
                ctx.fillStyle = 'rgba(255,255,255,' + (0.85 * a) + ')';
                ctx.fill();
                ctx.shadowBlur = 0;
                sparks.forEach(function (s) {
                    const px = hx - dx * len * s.at - dy * s.off;
                    const py = hy - dy * len * s.at + dx * s.off;
                    ctx.beginPath();
                    ctx.arc(px, py, s.r, 0, 6.283);
                    ctx.fillStyle = 'rgba(' + col + ',' + (0.35 * a * (1 - s.at)) + ')';
                    ctx.fill();
                });
            }
        };
    }

    /* --- 3. network topology forming and dissolving --- */
    function evTopology() {
        const p = palette();
        const col = pick(accents(p));
        const cx = rnd(W * 0.12, W * 0.88), cy = rnd(H * 0.14, H * 0.86);
        const R = rnd(80, 170);
        const n = irnd(5, 9);
        const nodes = Array.from({ length: n }, function (_, i) {
            const a = (i / n) * 6.283 + rnd(-0.35, 0.35);
            const r = R * rnd(0.32, 1);
            return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.78, r: rnd(2, 3.6), d: (i / n) * 0.3 };
        });
        const edges = [];
        nodes.forEach(function (a, i) {
            nodes.map(function (b, j) { return { j: j, d: Math.hypot(a.x - b.x, a.y - b.y) }; })
                .filter(function (o) { return o.j !== i; })
                .sort(function (u, v) { return u.d - v.d; })
                .slice(0, 2)
                .forEach(function (o) {
                    const dup = edges.some(function (e) { return e[0] === o.j && e[1] === i; });
                    if (!dup) edges.push([i, o.j]);
                });
        });
        const label = Math.random() < 0.6
            ? pick(['node-0' + irnd(1, 9), 'shard/' + irnd(1, 4), 'peer:' + irnd(3000, 9999), 'k8s-w' + irnd(1, 6)])
            : null;
        return {
            life: rnd(3600, 5200),
            draw: function (ctx, prog) {
                const a = ease.pulse(prog, 0.2, 0.3) * p.k;
                ctx.lineWidth = 1;
                edges.forEach(function (e, i) {
                    const g = clamp((prog - 0.1 - i * 0.03) / 0.3, 0, 1);
                    if (g <= 0) return;
                    const A = nodes[e[0]], B = nodes[e[1]];
                    ctx.beginPath();
                    ctx.moveTo(A.x, A.y);
                    ctx.lineTo(A.x + (B.x - A.x) * ease.out(g), A.y + (B.y - A.y) * ease.out(g));
                    ctx.strokeStyle = 'rgba(' + col + ',' + (0.3 * a) + ')';
                    ctx.stroke();
                });
                nodes.forEach(function (nd, i) {
                    const g = clamp((prog - nd.d * 0.5) / 0.18, 0, 1);
                    if (g <= 0) return;
                    const pulse = 1 + Math.sin(prog * 14 + i) * 0.14;
                    ctx.beginPath();
                    ctx.arc(nd.x, nd.y, nd.r * g * pulse, 0, 6.283);
                    ctx.fillStyle = 'rgba(' + col + ',' + (0.75 * a) + ')';
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(nd.x, nd.y, nd.r * 2.9 * g, 0, 6.283);
                    ctx.strokeStyle = 'rgba(' + col + ',' + (0.16 * a) + ')';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                });
                if (label && prog > 0.25) {
                    ctx.font = '10px "JetBrains Mono", monospace';
                    ctx.textAlign = 'left';
                    ctx.fillStyle = 'rgba(' + col + ',' + (0.42 * a) + ')';
                    ctx.fillText(label, nodes[0].x + 10, nodes[0].y - 8);
                }
            }
        };
    }

    /* --- 4. CRT scan sweep with glitch slices --- */
    function evScan() {
        const p = palette();
        const col = Math.random() < 0.5 ? p.cyan : p.pink;
        const top = rnd(0, H * 0.6);
        const span = rnd(H * 0.25, H * 0.5);
        const slices = Array.from({ length: irnd(2, 4) }, function () {
            return { at: Math.random(), h: rnd(2, 7), off: rnd(-26, 26) };
        });
        return {
            life: rnd(1200, 1900),
            draw: function (ctx, prog) {
                const a = ease.pulse(prog, 0.15, 0.4) * p.k;
                const y = top + ease.io(prog) * span;
                const g = ctx.createLinearGradient(0, y - 46, 0, y + 8);
                g.addColorStop(0, 'rgba(' + col + ',0)');
                g.addColorStop(1, 'rgba(' + col + ',' + (0.09 * a) + ')');
                ctx.fillStyle = g;
                ctx.fillRect(0, y - 46, W, 54);
                ctx.fillStyle = 'rgba(' + col + ',' + (0.28 * a) + ')';
                ctx.fillRect(0, y, W, 1);
                slices.forEach(function (s) {
                    ctx.fillStyle = 'rgba(' + col + ',' + (0.13 * a) + ')';
                    ctx.fillRect(s.off, y - 46 + s.at * 46, W, s.h);
                });
            }
        };
    }

    /* --- 5. radar ping with crosshair + telemetry --- */
    function evPing() {
        const p = palette();
        const col = Math.random() < 0.55 ? p.green : p.cyan;
        const x = rnd(W * 0.1, W * 0.9), y = rnd(H * 0.15, H * 0.85);
        const max = rnd(70, 150);
        const label = pick([
            irnd(1, 240) + 'ms · ' + irnd(1, 64) + ' pkt',
            'lat ' + rnd(2, 40).toFixed(1) + 'ms',
            irnd(10, 99) + '.' + irnd(0, 255) + '.' + irnd(0, 255) + '.' + irnd(1, 254),
            'rssi -' + irnd(38, 92) + 'dBm'
        ]);
        return {
            life: rnd(2000, 2900),
            draw: function (ctx, prog) {
                const a = ease.pulse(prog, 0.1, 0.35) * p.k;
                for (let i = 0; i < 3; i++) {
                    const rp = clamp((prog - i * 0.15) / 0.75, 0, 1);
                    if (rp <= 0) continue;
                    ctx.beginPath();
                    ctx.arc(x, y, ease.out(rp) * max, 0, 6.283);
                    ctx.strokeStyle = 'rgba(' + col + ',' + ((1 - rp) * 0.4 * a) + ')';
                    ctx.lineWidth = 1.2;
                    ctx.stroke();
                }
                ctx.strokeStyle = 'rgba(' + col + ',' + (0.5 * a) + ')';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x - 9, y); ctx.lineTo(x - 3, y);
                ctx.moveTo(x + 3, y); ctx.lineTo(x + 9, y);
                ctx.moveTo(x, y - 9); ctx.lineTo(x, y - 3);
                ctx.moveTo(x, y + 3); ctx.lineTo(x, y + 9);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, 6.283);
                ctx.fillStyle = 'rgba(' + col + ',' + (0.85 * a) + ')';
                ctx.fill();
                ctx.font = '10px "JetBrains Mono", monospace';
                ctx.textAlign = 'left';
                ctx.fillStyle = 'rgba(' + col + ',' + (0.5 * a) + ')';
                ctx.fillText(label, x + 14, y - 10);
            }
        };
    }

    /* --- 6. bit-flip block --- */
    function evBits() {
        const p = palette();
        const col = Math.random() < 0.5 ? p.violet : p.cyan;
        const cols = irnd(6, 12), rows = irnd(2, 4);
        const x = rnd(W * 0.06, W * 0.86), y = rnd(H * 0.15, H * 0.85);
        const cw = 9, ch = 13;
        const grid = Array.from({ length: cols * rows }, function () { return Math.random() < 0.5 ? '0' : '1'; });
        let acc = 0;
        return {
            life: rnd(1700, 2600),
            draw: function (ctx, prog, dt) {
                acc += dt;
                if (acc > 90) {
                    acc = 0;
                    for (let i = 0; i < 4; i++) grid[(Math.random() * grid.length) | 0] = Math.random() < 0.5 ? '0' : '1';
                }
                const a = ease.pulse(prog, 0.2, 0.35) * p.k;
                ctx.font = '11px "JetBrains Mono", monospace';
                ctx.textAlign = 'center';
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const v = grid[r * cols + c];
                        ctx.fillStyle = 'rgba(' + col + ',' + ((v === '1' ? 0.5 : 0.2) * a) + ')';
                        ctx.fillText(v, x + c * cw, y + r * ch);
                    }
                }
            }
        };
    }

    /* --- 7. satellite on a slow orbit --- */
    function evOrbit() {
        const p = palette();
        const col = pick(accents(p));
        const cx = rnd(W * 0.15, W * 0.85), cy = rnd(H * 0.18, H * 0.82);
        const rx = rnd(70, 165), ry = rx * rnd(0.3, 0.62);
        const rot = rnd(-0.6, 0.6);
        const turns = Math.random() < 0.3 ? 2 : 1;
        return {
            life: rnd(3200, 4600),
            draw: function (ctx, prog) {
                const a = ease.pulse(prog, 0.18, 0.3) * p.k;
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(rot);
                ctx.beginPath();
                ctx.ellipse(0, 0, rx, ry, 0, 0, 6.283);
                ctx.setLineDash([4, 7]);
                ctx.strokeStyle = 'rgba(' + col + ',' + (0.22 * a) + ')';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.setLineDash([]);
                const ang = prog * 6.283 * turns;
                for (let i = 1; i <= 7; i++) {
                    const t = ang - i * 0.075;
                    ctx.beginPath();
                    ctx.arc(Math.cos(t) * rx, Math.sin(t) * ry, 1.6, 0, 6.283);
                    ctx.fillStyle = 'rgba(' + col + ',' + ((0.3 - i * 0.035) * a) + ')';
                    ctx.fill();
                }
                ctx.shadowColor = 'rgba(' + col + ',' + a + ')';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(Math.cos(ang) * rx, Math.sin(ang) * ry, 2.6, 0, 6.283);
                ctx.fillStyle = 'rgba(' + col + ',' + (0.9 * a) + ')';
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, 6.283);
                ctx.fillStyle = 'rgba(' + col + ',' + (0.28 * a) + ')';
                ctx.fill();
                ctx.restore();
            }
        };
    }

    /* --- 8. drifting code ghost --- */
    const SNIPPETS = [
        'while (!working) { coffee++; }',
        'git rebase -i HEAD~3',
        'model.eval()  # no_grad',
        'docker compose up -d --build',
        'SELECT * FROM ideas WHERE shipped = 1;',
        'O(n log n) — ship it',
        'kubectl rollout status deploy/api',
        'const answer = 42;',
        'torch.cuda.is_available() -> True',
        'npm run build -- --prod',
        'ssh deploy@prod -p 22',
        'for (;;) { learn(); }',
        'try { launch() } catch { iterate() }',
        'pip install -r requirements.txt',
        'binary search the bug, not the code',
        'grep -rn "TODO" ./src',
        'assert loss < prev_loss',
        'make -j8',
        'curl -s /api/health | jq .',
        'rm -rf ./doubt'
    ];
    function evGhost() {
        const p = palette();
        const col = Math.random() < 0.5 ? p.cyan : p.violet;
        const text = pick(SNIPPETS);
        const x = rnd(W * 0.08, W * 0.6), y = rnd(H * 0.18, H * 0.86);
        const rise = rnd(18, 40);
        return {
            life: rnd(3400, 4600),
            draw: function (ctx, prog) {
                const a = ease.pulse(prog, 0.25, 0.4) * p.k;
                const yy = y - ease.out(prog) * rise;
                ctx.font = (mobile ? 11 : 12.5) + 'px "JetBrains Mono", monospace';
                ctx.textAlign = 'left';
                ctx.fillStyle = 'rgba(' + col + ',' + (0.3 * a) + ')';
                ctx.fillText(text, x, yy);
                ctx.fillStyle = 'rgba(' + col + ',' + (0.5 * a) + ')';
                ctx.fillText('>', x - 14, yy);
            }
        };
    }

    /* ============================================================
       DIRECTOR — weighted random scheduling
       ============================================================ */
    const SCENE = [
        { make: evPacket, w: 20, heavy: false },
        { make: evMeteor, w: 16, heavy: false },
        { make: evTopology, w: 14, heavy: true },
        { make: evPing, w: 13, heavy: false },
        { make: evScan, w: 9, heavy: false },
        { make: evOrbit, w: 11, heavy: true },
        { make: evBits, w: 9, heavy: true },
        { make: evGhost, w: 10, heavy: false }
    ];
    const TOTAL_W = SCENE.reduce(function (s, e) { return s + e.w; }, 0);

    function nextScene() {
        let r = Math.random() * TOTAL_W;
        for (const e of SCENE) { r -= e.w; if (r <= 0) return e; }
        return SCENE[0];
    }

    const active = [];
    let cooldown = rnd(600, 1800);

    function schedule() {
        const cap = mobile ? 2 : 3;
        if (active.length >= cap) return;
        const scene = nextScene();
        if (mobile && scene.heavy && Math.random() < 0.5) return;
        const ev = scene.make();
        ev.t = 0;
        active.push(ev);
        // occasional double-feature: two events overlap for a busier beat
        if (!mobile && active.length < cap && Math.random() < 0.16) {
            const ev2 = nextScene().make();
            ev2.t = -rnd(200, 700);
            active.push(ev2);
        }
    }

    /* ---------------- loop ---------------- */
    let running = true, last = 0;
    function frame(now) {
        if (!running) return;
        requestAnimationFrame(frame);
        const dt = last ? Math.min(now - last, 64) : 16;
        if (now - last < 25) return; // ~40fps ceiling
        last = now;

        ctx.clearRect(0, 0, W, H);

        cooldown -= dt;
        if (cooldown <= 0) {
            schedule();
            cooldown = mobile ? rnd(5200, 12000) : rnd(2400, 7200);
        }

        for (let i = active.length - 1; i >= 0; i--) {
            const ev = active[i];
            ev.t += dt;
            if (ev.t < 0) continue;
            const prog = ev.t / ev.life;
            if (prog >= 1) { active.splice(i, 1); continue; }
            ctx.save();
            try {
                ev.draw(ctx, prog, dt);
            } catch (err) {
                active.splice(i, 1);
            }
            ctx.restore();
        }
    }

    document.addEventListener('visibilitychange', function () {
        running = !document.hidden;
        if (running) {
            last = 0;
            requestAnimationFrame(frame);
        } else {
            active.length = 0;
            ctx.clearRect(0, 0, W, H);
        }
    });

    let rt = 0;
    window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () { size(); active.length = 0; }, 120);
    }, { passive: true });

    size();
    requestAnimationFrame(frame);

    /* ============================================================
       SYSTEM LOG — a small ambient console of random build /
       deploy / inference events, like a terminal left open on a
       second monitor. Toggle with the backtick key.
       ============================================================ */
    (function sysLog() {
        const box = document.getElementById('sys-console');
        const body = document.getElementById('sys-body');
        const toggle = document.getElementById('sys-toggle');
        const restore = document.getElementById('sys-restore');
        if (!box || !body) return;

        const n = irnd;
        const f = function (a, b, d) { return rnd(a, b).toFixed(d); };
        const LINES = [
            function () { return ['ok', 'build · vite ' + n(1, 9) + '.' + n(0, 9) + 's · ' + n(28, 96) + ' modules']; },
            function () { return ['ok', 'tests · ' + n(38, 214) + ' passed · 0 failed']; },
            function () { return ['ok', 'pytest · ' + n(64, 320) + ' passed in ' + f(1.1, 9.9, 1) + 's']; },
            function () { return ['run', 'docker build · layer ' + n(3, 9) + '/11 cached']; },
            function () { return ['net', 'GET /api/v1/predict · 200 · ' + n(21, 180) + 'ms']; },
            function () { return ['net', 'POST /infer · 200 · ' + n(40, 400) + 'ms · ' + n(1, 32) + 'kb']; },
            function () { return ['ml', 'epoch ' + n(1, 40) + '/40 · loss ' + f(0.01, 0.6, 4) + ' · acc ' + f(0.82, 0.99, 3)]; },
            function () { return ['ml', 'cuda:0 · ' + f(1.2, 9.4, 1) + ' GB / 12 GB']; },
            function () { return ['ok', 'lint · 0 errors · ' + n(0, 4) + ' warnings']; },
            function () { return ['git', 'push origin main · ' + n(1, 12) + ' objects']; },
            function () { return ['git', 'commit ' + Math.random().toString(16).slice(2, 9) + ' · ' + n(1, 9) + ' files']; },
            function () { return ['dep', 'preview ready · ' + f(4, 22, 1) + 's']; },
            function () { return ['ok', 'redis · hit ratio ' + f(0.9, 0.99, 2)]; },
            function () { return ['run', 'queue · ' + n(0, 14) + ' jobs pending']; },
            function () { return ['net', 'ws · ' + n(1, 60) + ' clients connected']; },
            function () { return ['ok', 'lighthouse · perf ' + n(92, 100) + ' · a11y ' + n(95, 100)]; },
            function () { return ['ml', 'embed · ' + n(120, 4800) + ' vectors · ' + n(8, 90) + 'ms']; },
            function () { return ['warn', 'retry ' + n(1, 3) + '/3 · backoff ' + n(200, 1600) + 'ms']; },
            function () { return ['run', 'leetcode · streak ' + n(60, 400) + ' days']; },
            function () { return ['ok', 'cache warm · ' + n(12, 240) + ' keys']; }
        ];
        const GLYPH = { ok: '✓', run: '⟳', net: '→', ml: '◆', git: '⎇', dep: '▲', warn: '!' };

        function stamp() {
            const d = new Date();
            return [d.getHours(), d.getMinutes(), d.getSeconds()]
                .map(function (v) { return String(v).padStart(2, '0'); })
                .join(':');
        }

        function emit() {
            const line = pick(LINES)();
            const kind = line[0], text = line[1];
            const li = document.createElement('li');
            li.className = 'sys-line k-' + kind;

            const t = document.createElement('span');
            t.className = 'sys-t';
            t.textContent = stamp();
            const g = document.createElement('span');
            g.className = 'sys-g';
            g.textContent = GLYPH[kind];
            const x = document.createElement('span');
            x.className = 'sys-x';

            li.append(t, g, x);
            body.appendChild(li);
            while (body.children.length > 5) body.removeChild(body.firstChild);

            let i = 0;
            (function type() {
                if (!x.isConnected) return;
                x.textContent = text.slice(0, ++i);
                if (i < text.length) setTimeout(type, 12);
            })();
        }

        function setOpen(open) {
            box.classList.toggle('is-hidden', !open);
            if (restore) restore.hidden = open;
            try { localStorage.setItem('rd-syslog', open ? '1' : '0'); } catch (e) { /* private mode */ }
        }
        if (toggle) toggle.addEventListener('click', function () { setOpen(false); });
        if (restore) restore.addEventListener('click', function () { setOpen(true); });
        document.addEventListener('keydown', function (e) {
            const tag = (document.activeElement && document.activeElement.tagName) || '';
            if (e.key === '`' && !/^(INPUT|TEXTAREA)$/.test(tag)) {
                e.preventDefault();
                setOpen(box.classList.contains('is-hidden'));
            }
        });

        let saved = '1';
        try { saved = localStorage.getItem('rd-syslog') || '1'; } catch (e) { /* noop */ }
        setOpen(saved === '1');

        let timer = 0;
        function loop() {
            if (!document.hidden) emit();
            timer = setTimeout(loop, rnd(4200, 11000));
        }
        setTimeout(function () {
            box.classList.add('ready');
            emit();
            loop();
        }, 1600);
        window.addEventListener('pagehide', function () { clearTimeout(timer); });
    })();
})();
