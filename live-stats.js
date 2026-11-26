/* Live competitive-programming stats.
   stats.json is refreshed daily by .github/workflows/update-stats.yml.
   Numbers in the HTML are the fallback; if the fetch fails nothing changes. */
(function () {
    'use strict';

    const fmt = (n) => Number(n).toLocaleString('en-US');
    const cap = (s) => String(s).replace(/\b\w/g, (c) => c.toUpperCase());
    const kyu = (r) => (r >= 2000 ? `${Math.floor((r - 2000) / 200) + 1} Dan` : `${10 - Math.floor(r / 200)} Kyu`);
    const FORMAT = {
        'leetcode.topPercent': (v) => `${v}%`,
        'leetcode.badge': String,
        'codeforces.rank': cap,
        'codeforces.maxRank': cap,
        'atcoder.kyu': String
    };

    function apply(stats) {
        // AtCoder grades (Kyu/Dan) by highest rating, not current
        if (stats.atcoder && stats.atcoder.rating != null) stats.atcoder.kyu = kyu(stats.atcoder.maxRating || stats.atcoder.rating);
        window.SITE_STATS = stats;

        document.querySelectorAll('[data-stat]').forEach((el) => {
            const key = el.dataset.stat;
            const v = key.split('.').reduce((o, k) => (o == null ? o : o[k]), stats);
            if (v == null) return;
            el.textContent = (FORMAT[key] || fmt)(v);
            if ('count' in el.dataset) el.dataset.count = v;
        });

        const lc = stats.leetcode;
        if (lc) {
            document.querySelectorAll('.lc-key').forEach((k) => {
                const n = lc[k.dataset.k];
                if (n == null) return;
                k.dataset.n = n;
                k.textContent = `${n} ${cap(k.dataset.k)}`;
            });
        }
        ladders(stats);
        document.dispatchEvent(new CustomEvent('stats:updated', { detail: stats }));
    }

    // Rank ladders: band colours and marker positions on the Codeforces and AtCoder cards
    const CF = [[0, 'newbie'], [1200, 'pupil'], [1400, 'specialist'], [1600, 'expert'], [1900, 'candidate master']];
    const AC = [[0, 'gray'], [400, 'brown'], [800, 'green'], [1200, 'cyan'], [1600, 'blue']];
    const band = (table, r) => table.filter(([min]) => r >= min).pop()[1];

    function setLadder(sel, max, marks, label) {
        const el = document.querySelector(sel);
        if (!el) return;
        const top = Math.max(...marks.map((m) => m.v));
        if (top > max - 50) el.style.setProperty('--max', Math.ceil((top + 100) / 100) * 100);
        el.querySelectorAll('.mark').forEach((m, i) => {
            if (!marks[i]) return;
            m.style.setProperty('--v', marks[i].v);
            m.querySelector('b').textContent = marks[i].text;
        });
        el.setAttribute('aria-label', label);
    }

    function ladders(stats) {
        const c = stats.codeforces, a = stats.atcoder;
        if (c && c.rating != null) {
            const now = cap(band(CF, c.rating)), peak = cap(band(CF, c.maxRating || c.rating));
            const badge = document.querySelector('[data-stat="codeforces.rank"]');
            if (badge) badge.style.setProperty('--rank', `var(--cf-${band(CF, c.rating).replace(' ', '-')}-ink)`);
            setLadder('.ladder[data-ladder="codeforces"]', 1900,
                [{ v: c.rating, text: `${fmt(c.rating)} · ${now}` }, { v: c.maxRating || c.rating, text: `peak ${fmt(c.maxRating || c.rating)} · ${peak}` }],
                `Codeforces rank ladder: current ${fmt(c.rating)} in ${now}, peak ${fmt(c.maxRating || c.rating)} in ${peak}`);
        }
        if (a && a.rating != null) {
            const top = a.maxRating || a.rating;
            const now = cap(band(AC, a.rating)), peak = cap(band(AC, top));
            const next = AC.find(([min]) => min > a.rating);
            const badge = document.querySelector('[data-stat="atcoder.kyu"]');
            if (badge) badge.style.setProperty('--rank', `var(--ac-${band(AC, top)}-ink)`);
            setLadder('.ladder[data-ladder="atcoder"]', 1600,
                [{ v: a.rating, text: `${fmt(a.rating)} · ${now}` }, { v: top, text: `peak ${fmt(top)} · ${peak}` }],
                `AtCoder rank ladder: current ${fmt(a.rating)} in the ${now.toLowerCase()} band` +
                (next ? `, ${next[0] - a.rating} points below ${next[1]}` : '') + `; peak ${fmt(top)}`);
        }
    }

    fetch('stats.json', { cache: 'no-cache' })
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then(apply)
        .catch(() => {});
})();
