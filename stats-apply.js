/* Writes window.STATS (stats-data.js) into the page before the other scripts read it.
   Without STATS, the numbers already in the HTML stay as they are. */
(function applyStats() {
    const S = window.STATS;
    if (!S) return;

    const fmt = (v) => typeof v === 'number' && Number.isInteger(v) ? v.toLocaleString('en-US') : String(v);
    const title = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

    // Codeforces rank names and AtCoder colour bands, as each platform defines them
    const CF = [[1000, 'newbie'], [1200, 'pupil'], [1400, 'specialist'], [1600, 'expert'], [1900, 'candidate master']];
    const AC = [[0, 'gray'], [400, 'brown'], [800, 'green'], [1200, 'cyan'], [1600, 'blue']];
    const band = (table, r) => table.filter(([min]) => r >= min).pop()[1];
    const kyu = (r) => r >= 2000 ? `${Math.floor((r - 2000) / 200) + 1} Dan` : `${Math.max(1, 10 - Math.floor(Math.max(r, 0) / 200))} Kyu`;

    const derived = {
        'codeforces.rankName': S.codeforces && title(S.codeforces.rank),
        'codeforces.maxRankName': S.codeforces && title(S.codeforces.maxRank),
        'atcoder.kyu': S.atcoder && kyu(S.atcoder.maxRating || S.atcoder.rating) // AtCoder grades by highest rating
    };
    const get = (path) => path in derived ? derived[path]
        : path.split('.').reduce((o, k) => (o == null ? o : o[k]), S);

    document.querySelectorAll('[data-stat]').forEach((el) => {
        const v = get(el.dataset.stat);
        if (v == null) return;
        el.textContent = fmt(v);
        if ('count' in el.dataset) el.dataset.count = v;
    });

    // LeetCode donut reads data-n when visuals.js builds it
    const lc = S.leetcode;
    if (lc) {
        [['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']].forEach(([k, label]) => {
            const key = document.querySelector(`.lc-key[data-k="${k}"]`);
            if (key && lc[k] != null) { key.dataset.n = lc[k]; key.textContent = `${lc[k]} ${label}`; }
        });
    }

    // Rank badges take their band's colour
    const cfBadge = document.querySelector('[data-stat="codeforces.rankName"]');
    if (cfBadge && S.codeforces) cfBadge.style.setProperty('--rank', `var(--cf-${S.codeforces.rank.replace(' ', '-')}-ink)`);
    const acBadge = document.querySelector('[data-stat="atcoder.kyu"]');
    if (acBadge && S.atcoder) acBadge.style.setProperty('--rank', `var(--ac-${band(AC, S.atcoder.maxRating || S.atcoder.rating)}-ink)`);

    // Ladders: marker positions and labels
    function ladder(sel, max, marks, label) {
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
    if (S.codeforces) {
        const c = S.codeforces;
        const now = title(band(CF, Math.max(c.rating, 1000))), peak = title(band(CF, Math.max(c.maxRating, 1000)));
        ladder('.ladder[data-ladder="codeforces"]', 1900,
            [{ v: c.rating, text: `${fmt(c.rating)} · ${now}` }, { v: c.maxRating, text: `peak ${fmt(c.maxRating)} · ${peak}` }],
            `Codeforces rank ladder: current ${fmt(c.rating)} in ${now}, peak ${fmt(c.maxRating)} in ${peak}`);
    }
    if (S.atcoder) {
        const r = S.atcoder.rating, top = S.atcoder.maxRating || r;
        const now = title(band(AC, r)), peak = title(band(AC, top));
        const next = AC.find(([min]) => min > r);
        ladder('.ladder[data-ladder="atcoder"]', 1600,
            [{ v: r, text: `${fmt(r)} · ${now}` }, { v: top, text: `peak ${fmt(top)} · ${peak}` }],
            `AtCoder rank ladder: current ${fmt(r)} in the ${now.toLowerCase()} band` +
            (next ? `, ${next[0] - r} points below ${next[1]}` : '') + `; peak ${fmt(top)}`);
    }
})();
