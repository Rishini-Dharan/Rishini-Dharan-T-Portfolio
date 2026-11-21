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
        if (stats.atcoder && stats.atcoder.rating != null) stats.atcoder.kyu = kyu(stats.atcoder.rating);
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
        document.dispatchEvent(new CustomEvent('stats:updated', { detail: stats }));
    }

    fetch('stats.json', { cache: 'no-cache' })
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then(apply)
        .catch(() => {});
})();
