/* ============================================================
   Portfolio · Rishini Dharan T
   programmer.js · command palette, shell, contribution graph,
   typed source excerpt. Every command does something real:
   it navigates, opens a real URL, or prints content that is
   already on this page.
   ============================================================ */

(function () {
    'use strict';

    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

    /* ---------------- Shared content model ---------------- */
    const PROJECTS = [
        { slug: 'qguardian', name: 'Q-Guardian OS', note: 'AI security operations center, HackIndia 2025 national winner',
          demo: 'https://rishini-dharan.github.io/HackIndia2026/', code: 'https://github.com/Rishini-Dharan/HackIndia2026' },
        { slug: 'm5', name: 'M5 Forecasting Engine', note: '40 LightGBM models serving 28-day forecasts',
          demo: 'https://m5-forecasting-gules.vercel.app', code: 'https://github.com/Rishini-Dharan/m5_forecasting' },
        { slug: 'mining', name: 'Mining Emission & Filtration', note: 'HackIndia 2025 preliminary round winner',
          demo: 'https://rishini-dharan.github.io/HackIndia-Spark-1-2025-Nueral-Titans/', code: 'https://github.com/Rishini-Dharan/HackIndia-Spark-1-2025-Nueral-Titans' },
        { slug: 'lattice', name: 'Lattice Protocol', note: 'parametric income protection for gig workers',
          code: 'https://github.com/Rishini-Dharan/DevTrails' },
        { slug: 'lifeconnect', name: 'LifeConnect', note: 'TensorFlow.js case routing to NGOs (private repo)' },
        { slug: 'agent', name: 'Agent System', note: 'local-first multi-agent orchestrator',
          code: 'https://github.com/Rishini-Dharan/agent-system' }
    ];
    const SECTIONS = ['work', 'skills', 'shell', 'about', 'experience', 'gallery', 'contact'];

    function goTo(id, focusSel) {
        const el = document.getElementById(id);
        if (!el) return false;
        el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
        if (focusSel) setTimeout(() => { const f = document.querySelector(focusSel); if (f) f.focus({ preventScroll: true }); }, REDUCED ? 0 : 700);
        return true;
    }
    function openUrl(url) {
        window.open(url, '_blank', 'noopener');
    }
    function toggleTheme(want) {
        const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        if (!want || want !== cur) document.getElementById('theme-toggle').click();
    }

    /* ---------------- Command palette ---------------- */
    (function palette() {
        const dialog = document.getElementById('palette');
        const input = document.getElementById('palette-input');
        const list = document.getElementById('palette-list');
        const empty = document.getElementById('palette-empty');
        const opener = document.getElementById('palette-open');
        if (!dialog || !input) return;

        if (IS_MAC) document.querySelectorAll('.kbd-mod, .term-aside kbd:first-of-type').forEach((k) => { k.textContent = '⌘'; });

        const items = [];
        SECTIONS.forEach((id) => items.push({ group: 'Go to', label: id.charAt(0).toUpperCase() + id.slice(1), run: () => goTo(id) }));
        PROJECTS.forEach((p) => {
            if (p.demo) items.push({ group: 'Open demo', label: p.name, hint: 'new tab', run: () => openUrl(p.demo) });
            if (p.code) items.push({ group: 'Open code', label: p.name, hint: 'GitHub', run: () => openUrl(p.code) });
        });
        items.push(
            { group: 'Action', label: 'Switch theme', run: () => toggleTheme() },
            { group: 'Action', label: 'Use the shell', run: () => goTo('shell', '#term-input') },
            { group: 'Action', label: 'Write me a message', run: () => goTo('contact', '#cf-name') },
            { group: 'Profile', label: 'GitHub', hint: 'Rishini-Dharan', run: () => openUrl('https://github.com/Rishini-Dharan') },
            { group: 'Profile', label: 'LinkedIn', run: () => openUrl('https://www.linkedin.com/in/rishini-dharan-t/') },
            { group: 'Profile', label: 'LeetCode', hint: 'Knight · 1,895', run: () => openUrl('https://leetcode.com/u/rishini_dharan/') }
        );

        // each typed word must appear as a subsequence somewhere (word order is free); tighter matches score higher
        function subseq(text, word) {
            let pos = -1, gaps = 0;
            for (const ch of word) {
                const next = text.indexOf(ch, pos + 1);
                if (next === -1) return 0;
                gaps += next - pos - 1;
                pos = next;
            }
            return 1 / (1 + gaps);
        }
        function score(text, q) {
            const words = q.toLowerCase().split(/\s+/).filter(Boolean);
            if (!words.length) return 1;
            text = text.toLowerCase();
            return words.reduce((acc, w) => acc * subseq(text, w), 1);
        }

        let shown = [], active = 0, lastFocus = null;

        function render() {
            const q = input.value.trim();
            shown = items
                .map((it) => ({ it, s: score(it.group + ' ' + it.label, q) }))
                .filter((x) => x.s > 0)
                .sort((a, b) => b.s - a.s)
                .map((x) => x.it);
            active = Math.min(active, Math.max(0, shown.length - 1));
            list.textContent = '';
            shown.forEach((it, i) => {
                const li = document.createElement('li');
                li.id = 'pal-' + i;
                li.className = 'palette-item';
                li.setAttribute('role', 'option');
                li.setAttribute('aria-selected', String(i === active));
                const g = document.createElement('span'); g.className = 'pi-group mono'; g.textContent = it.group;
                const l = document.createElement('span'); l.className = 'pi-label'; l.textContent = it.label;
                li.append(g, l);
                if (it.hint) { const h = document.createElement('span'); h.className = 'pi-hint mono'; h.textContent = it.hint; li.append(h); }
                li.addEventListener('mousemove', () => { if (active !== i) { active = i; mark(); } });
                li.addEventListener('click', () => choose(i));
                list.append(li);
            });
            empty.hidden = shown.length > 0;
            input.setAttribute('aria-activedescendant', shown.length ? 'pal-' + active : '');
        }
        function mark() {
            list.querySelectorAll('.palette-item').forEach((li, i) => li.setAttribute('aria-selected', String(i === active)));
            const cur = document.getElementById('pal-' + active);
            if (cur) cur.scrollIntoView({ block: 'nearest' });
            input.setAttribute('aria-activedescendant', cur ? cur.id : '');
        }
        function open() {
            lastFocus = document.activeElement;
            dialog.hidden = false;
            input.value = '';
            active = 0;
            render();
            input.focus();
        }
        function close() {
            dialog.hidden = true;
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }
        function choose(i) {
            const it = shown[i];
            if (!it) return;
            close();
            it.run();
        }

        opener.addEventListener('click', open);
        dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
        input.addEventListener('input', () => { active = 0; render(); });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % Math.max(1, shown.length); mark(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + shown.length) % Math.max(1, shown.length); mark(); }
            else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
            else if (e.key === 'Tab') { e.preventDefault(); } // the input is the only focus stop inside the dialog
        });
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                dialog.hidden ? open() : close();
            } else if (e.key === 'Escape' && !dialog.hidden) {
                close();
            }
        });
    })();

    /* ---------------- Shell ---------------- */
    (function shell() {
        const log = document.getElementById('term-log');
        const form = document.getElementById('term-form');
        const input = document.getElementById('term-input');
        if (!log || !form) return;

        const history = [];
        let hIndex = 0;

        function line(parts, cls) {
            const p = document.createElement('p');
            if (cls) p.className = cls;
            (Array.isArray(parts) ? parts : [parts]).forEach((part) => {
                if (typeof part === 'string') p.append(document.createTextNode(part));
                else if (part.href) {
                    const a = document.createElement('a');
                    a.href = part.href;
                    a.textContent = part.text;
                    if (/^https?:/.test(part.href)) { a.target = '_blank'; a.rel = 'noopener'; }
                    p.append(a);
                } else if (part.b) {
                    const b = document.createElement('b'); b.textContent = part.b; p.append(b);
                }
            });
            log.append(p);
            log.scrollTop = log.scrollHeight;
        }
        const blank = () => line('');

        const COMMANDS = {
            help() {
                line([{ b: 'Commands' }]);
                [['whoami', 'who you are talking to'], ['ls', 'list projects'], ['cat <project>', 'details and links for one project'], ['open <project>', 'open the live demo, or the code'],
                 ['code <project>', 'open the source on GitHub'], ['skills', 'print the stack'], ['stats', 'competitive programming numbers'],
                 ['cat about', 'the short bio'], ['cd <section>', SECTIONS.join(', ')], ['theme [dark|light]', 'switch theme'],
                 ['contact', 'jump to the message form'], ['history', 'commands you ran'], ['clear', 'clear the screen']]
                    .forEach(([c, d]) => line('  ' + c.padEnd(20) + d));
            },
            whoami() {
                line('Rishini Dharan T, AI & full-stack developer in Chennai.');
                line('B.Tech AI & Data Science, CGPA 8.75. HackIndia 2025 national winner. LeetCode Knight.');
                line('Open to AI and full-stack internships for Summer 2026.');
            },
            ls(args) {
                const what = args[0] || 'projects';
                if (what === 'sections' || what === '~' || what === '/') { line('  ' + SECTIONS.join('  ')); return; }
                if (what !== 'projects') line('ls: ' + what + ': not a folder here. Showing projects instead.', 'term-dim');
                PROJECTS.forEach((p) => line('  ' + p.slug.padEnd(13) + p.note));
                line('Run "open <name>", for example "open m5".', 'term-dim');
            },
            open(args) { openProject(args[0], false); },
            code(args) { openProject(args[0], true); },
            skills() {
                document.querySelectorAll('.skill-group').forEach((g) => {
                    const chips = Array.from(g.querySelectorAll('.chip')).map((c) => c.textContent);
                    line('  ' + g.querySelector('h3').textContent.padEnd(18) + chips.join(', '));
                });
            },
            stats() {
                line('  LeetCode    1,895 rating, Knight, 729 solved (230 E / 390 M / 109 H)');
                line('  Codeforces  1,248 current, 1,417 peak, 204 solved');
                line('  AtCoder     772 rating, top 18.15%');
            },
            cat(args) {
                const f = (args[0] || 'about').replace(/\.(md|txt)$/, '');
                const project = findProject(f);
                if (project) { describe(project); return; }
                if (f === 'skills' || f === 'stats') { COMMANDS[f](); return; }
                if (f === 'resume' || f === 'cv') {
                    line('There is no resume file on this site yet.', 'term-dim');
                    line(['Ask for one: ', { href: '#contact', text: 'contact' }, ' or ', { href: 'https://www.linkedin.com/in/rishini-dharan-t/', text: 'LinkedIn' }]);
                    return;
                }
                if (f !== 'about') line('cat: ' + f + ': no such file, showing about instead.', 'term-dim');
                document.querySelectorAll('.about-copy > p').forEach((p) => line(p.textContent.trim()));
            },
            goto(args) {
                const raw = (args[0] || '').replace(/^[~./]+|\/+$/g, '');
                if (!raw) { window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); line('Back to the top.'); return; }
                const id = raw === 'projects' ? 'work' : raw;
                if (goTo(id)) line('Scrolling to ' + id + '.');
                else line('goto: no section called "' + raw + '". Sections: ' + SECTIONS.join(', '), 'term-err');
            },
            pwd() { line('/home/rishini/portfolio'); },
            echo(args) { line(args.join(' ')); },
            date() { line(new Date().toString()); },
            exit() { line('There is no leaving. Try "contact" instead.', 'term-dim'); },
            man() { COMMANDS.help(); },
            theme(args) {
                const want = args[0];
                if (want && want !== 'dark' && want !== 'light') { line('theme: use "dark" or "light"', 'term-err'); return; }
                toggleTheme(want);
                line('theme set to ' + document.documentElement.getAttribute('data-theme'));
            },
            contact() {
                line('Opening the message form…');
                goTo('contact', '#cf-name');
            },
            sudo(args) {
                if (args.join(' ') === 'hire rishini') {
                    line('[sudo] permission granted. Good call.');
                    line(['Next step: ', { href: '#contact', text: 'send a message' }, ' or ', { href: 'https://www.linkedin.com/in/rishini-dharan-t/', text: 'connect on LinkedIn' }, '.']);
                } else {
                    line('sudo: try "sudo hire rishini"', 'term-err');
                }
            },
            history() { history.forEach((h, i) => line('  ' + String(i + 1).padStart(3) + '  ' + h)); },
            clear() { log.textContent = ''; }
        };

        function findProject(q) {
            q = (q || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (q.length < 2) return null;
            return PROJECTS.find((x) => x.slug === q) ||
                PROJECTS.find((x) => x.slug.startsWith(q) || x.name.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(q));
        }
        function describe(p) {
            line([{ b: p.name }]);
            line('  ' + p.note);
            if (p.demo) line(['  demo  ', { href: p.demo, text: p.demo }]);
            if (p.code) line(['  code  ', { href: p.code, text: p.code }]);
            if (!p.demo && !p.code) line('  private repo, walkthrough on request', 'term-dim');
        }
        function openProject(slug, codeOnly) {
            const p = findProject(slug);
            if (!p) {
                if (slug) line((codeOnly ? 'code' : 'open') + ': no project called "' + slug + '".', 'term-err');
                line('Pick one: ' + PROJECTS.map((x) => x.slug).join(', ') + '. For example "' + (codeOnly ? 'code' : 'open') + ' m5".', 'term-dim');
                return;
            }
            const url = codeOnly ? p.code : (p.demo || p.code);
            if (!url) { line(p.name + ' is a private repo. ', 'term-dim'); line(['Ask for a walkthrough: ', { href: '#contact', text: 'contact' }]); return; }
            line(['Opening ', { href: url, text: url }]);
            openUrl(url);
        }

        function run(raw) {
            const cmd = raw.trim();
            line(['rishini@portfolio:~$ ', cmd], 'term-echo');
            if (!cmd) return;
            history.push(cmd);
            hIndex = history.length;
            const words = cmd.split(/\s+/);
            let name = words[0].toLowerCase();
            if (words.includes('--help') || words.includes('-h')) { COMMANDS.help(); return; }
            // flags like -la are habit, not meaning, so drop them
            let args = words.slice(1).filter((a) => !a.startsWith('-')).map((a) => a.toLowerCase());
            if (ALIASES[name]) {
                if (ALIAS_ARG[name] && !args.length) args = [ALIAS_ARG[name]];
                name = ALIASES[name];
            }
            // a bare project name opens it: "m5" works like "open m5"
            if (!COMMANDS[name] && findProject(name)) { args = [name]; name = 'open'; }
            const fn = COMMANDS[name];
            if (fn) { fn(args); return; }
            const near = Object.keys(COMMANDS).concat(Object.keys(ALIASES))
                .map((c) => ({ c, d: distance(name, c) }))
                .sort((a, b) => a.d - b.d)[0];
            if (near && near.d <= 2) line(name + ': not a command here. Did you mean "' + (ALIASES[near.c] || near.c) + '"?', 'term-dim');
            else line(name + ': not a command here. Type "help" to see what this shell can do.', 'term-dim');
        }

        // what people type out of habit, mapped onto the commands that exist
        const ALIASES = {
            dir: 'ls', ll: 'ls', la: 'ls', projects: 'ls', work: 'ls', cd: 'goto', go: 'goto',
            about: 'cat', bio: 'cat', resume: 'cat', cv: 'cat', '?': 'help', commands: 'help', hire: 'contact',
            mail: 'contact', email: 'contact', hello: 'whoami', hi: 'whoami', who: 'whoami', cls: 'clear', quit: 'exit', logout: 'exit'
        };
        const ALIAS_ARG = { about: 'about', bio: 'about', resume: 'resume', cv: 'resume' };

        function distance(a, b) {
            const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
            for (let j = 1; j <= b.length; j++) d[0][j] = j;
            for (let i = 1; i <= a.length; i++) {
                for (let j = 1; j <= b.length; j++) {
                    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
                }
            }
            return d[a.length][b.length];
        }

        const completions = () => Object.keys(COMMANDS)
            .concat(PROJECTS.flatMap((p) => ['open ' + p.slug, 'code ' + p.slug]))
            .concat(SECTIONS.map((s) => 'goto ' + s), ['ls projects', 'cat about', 'sudo hire rishini']);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            run(input.value);
            input.value = '';
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' && history.length) {
                e.preventDefault(); hIndex = Math.max(0, hIndex - 1); input.value = history[hIndex];
            } else if (e.key === 'ArrowDown' && history.length) {
                e.preventDefault(); hIndex = Math.min(history.length, hIndex + 1); input.value = history[hIndex] || '';
            } else if (e.key === 'Tab' && input.value.trim()) {
                const v = input.value.toLowerCase();
                const hit = completions().find((c) => c.startsWith(v) && c !== v);
                if (hit) { e.preventDefault(); input.value = hit; }
            }
        });
        document.querySelectorAll('.try-cmd').forEach((b) => b.addEventListener('click', () => {
            run(b.dataset.cmd);
            input.focus({ preventScroll: true });
        }));
        document.getElementById('terminal').addEventListener('click', (e) => {
            if (!e.target.closest('a') && !window.getSelection().toString()) input.focus({ preventScroll: true });
        });

        line('Welcome. This shell reads the same content as the page.', 'term-dim');
        line('Type "help" to list commands, or press Tab to complete one.', 'term-dim');
    })();

    /* ---------------- Contribution calendar ---------------- */
    (function contributions() {
        const data = window.CONTRIB;
        const grid = document.getElementById('contrib-grid');
        const tip = document.getElementById('contrib-tip');
        const meta = document.getElementById('contrib-meta');
        if (!data || !grid) return;

        const start = new Date(data.start + 'T00:00:00');
        const fmt = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        const level = (n) => n === 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 2 : n <= 10 ? 3 : 4;
        const end = new Date(start); end.setDate(start.getDate() + data.counts.length - 1);

        grid.setAttribute('aria-label', data.total + ' GitHub contributions between ' + fmt(start) + ' and ' + fmt(end));
        meta.textContent = data.total + ' contributions in the last year · from GitHub on ' + new Date(data.asOf + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

        const frag = document.createDocumentFragment();
        data.counts.forEach((n, i) => {
            const cell = document.createElement('span');
            const col = Math.floor(i / 7), row = i % 7;
            cell.className = 'cday';
            cell.dataset.l = level(n);
            cell.dataset.i = i;
            cell.style.setProperty('--wave', (col + row * 1.5) * 14 + 'ms');
            frag.append(cell);
        });
        grid.append(frag);

        grid.addEventListener('pointerover', (e) => {
            const c = e.target.closest('.cday');
            if (!c) return;
            const i = +c.dataset.i;
            const d = new Date(start); d.setDate(start.getDate() + i);
            const n = data.counts[i];
            tip.textContent = (n ? n + ' contribution' + (n === 1 ? '' : 's') : 'No contributions') + ' on ' + fmt(d);
        });

        if (!('IntersectionObserver' in window)) { grid.classList.add('play'); return; }
        new IntersectionObserver((entries, io) => {
            if (entries[0].isIntersecting) { grid.classList.add('play'); io.disconnect(); }
        }, { threshold: 0.3 }).observe(grid);
    })();

    /* ---------------- Typed, highlighted source excerpt ---------------- */
    (function typedCode() {
        const code = document.getElementById('qg-code');
        if (!code) return;
        const src = code.textContent;

        // small Python highlighter: enough for this excerpt, not a general parser
        const RE = /(#[^\n]*)|(f?"(?:[^"\\\n]|\\.)*")|(@[\w.]+)|\b(async|await|def|try|while|except|True|False|None|return)\b|\b(\w+)(?=\()/g;
        const tokens = [];
        let last = 0, m;
        while ((m = RE.exec(src))) {
            if (m.index > last) tokens.push({ t: src.slice(last, m.index) });
            const cls = m[1] ? 'tk-com' : m[2] ? 'tk-str' : m[3] ? 'tk-dec' : m[4] ? 'tk-kw' : 'tk-fn';
            tokens.push({ t: m[0], c: cls });
            last = RE.lastIndex;
        }
        if (last < src.length) tokens.push({ t: src.slice(last) });

        function paint(limit) {
            code.textContent = '';
            let used = 0;
            for (const tk of tokens) {
                if (used >= limit) break;
                const text = tk.t.slice(0, limit - used);
                used += text.length;
                if (tk.c) { const s = document.createElement('span'); s.className = tk.c; s.textContent = text; code.append(s); }
                else code.append(document.createTextNode(text));
            }
            if (limit < src.length) { const caret = document.createElement('span'); caret.className = 'tk-caret'; code.append(caret); }
        }

        if (REDUCED || !('IntersectionObserver' in window)) { paint(Infinity); return; }

        const pre = code.parentElement;
        pre.style.minHeight = pre.offsetHeight + 'px'; // hold the final height so typing never shifts the layout
        paint(0);
        new IntersectionObserver((entries, io) => {
            if (!entries[0].isIntersecting) return;
            io.disconnect();
            const t0 = performance.now(), duration = 2600;
            (function tick(now) {
                const p = Math.min(1, (now - t0) / duration);
                paint(Math.floor(src.length * p));
                if (p < 1) requestAnimationFrame(tick);
            })(t0);
        }, { threshold: 0.4 }).observe(pre);
    })();
})();
