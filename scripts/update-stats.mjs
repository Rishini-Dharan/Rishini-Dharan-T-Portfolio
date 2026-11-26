// Refreshes stats-data.js (LeetCode, Codeforces, AtCoder) and contributions.js (GitHub).
// Run by .github/workflows/update-stats.yml once a day, or by hand: node scripts/update-stats.mjs
// A source that fails or returns implausible data keeps its last saved values.
import { readFile, writeFile } from 'node:fs/promises';

const ROOT = new URL('../', import.meta.url);
const HANDLES = {
    leetcode: 'rishini_dharan',
    codeforces: 'Rishini_Dharan_T',
    atcoder: 'Rishini',
    github: 'Rishini-Dharan'
};
const today = new Date().toISOString().slice(0, 10);
const UA = { 'user-agent': 'Mozilla/5.0 (portfolio stats updater)' };

async function getJSON(url, init = {}) {
    const res = await fetch(url, { ...init, headers: { ...UA, ...(init.headers || {}) } });
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
    return res.json();
}

async function readGlobal(file, name) {
    try {
        const src = await readFile(new URL(file, ROOT), 'utf8');
        const start = src.indexOf(`window.${name} = `);
        return JSON.parse(src.slice(start + `window.${name} = `.length).trim().replace(/;$/, ''));
    } catch { return null; }
}

/* ---------------- Sources ---------------- */
async function leetcode() {
    const query = `query($u: String!) {
        matchedUser(username: $u) { submitStatsGlobal { acSubmissionNum { difficulty count } } }
        userContestRanking(username: $u) { rating globalRanking topPercentage badge { name } }
    }`;
    const { data } = await getJSON('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'content-type': 'application/json', referer: 'https://leetcode.com/' },
        body: JSON.stringify({ query, variables: { u: HANDLES.leetcode } })
    });
    const ac = Object.fromEntries(data.matchedUser.submitStatsGlobal.acSubmissionNum.map((d) => [d.difficulty, d.count]));
    const r = data.userContestRanking;
    return {
        rating: Math.round(r.rating),
        globalRank: r.globalRanking,
        topPercent: r.topPercentage,
        badge: r.badge ? r.badge.name : null,
        solved: ac.All, easy: ac.Easy, medium: ac.Medium, hard: ac.Hard
    };
}

async function codeforces() {
    const info = (await getJSON(`https://codeforces.com/api/user.info?handles=${HANDLES.codeforces}`)).result[0];
    const subs = (await getJSON(`https://codeforces.com/api/user.status?handle=${HANDLES.codeforces}`)).result;
    const solved = new Set(subs.filter((s) => s.verdict === 'OK').map((s) => `${s.problem.contestId}-${s.problem.index}`));
    return { rating: info.rating, maxRating: info.maxRating, rank: info.rank, maxRank: info.maxRank, solved: solved.size };
}

async function atcoder() {
    const history = await getJSON(`https://atcoder.jp/users/${HANDLES.atcoder}/history/json`);
    const rated = history.filter((h) => h.IsRated);
    const out = { rating: rated[rated.length - 1].NewRating, maxRating: Math.max(...rated.map((h) => h.NewRating)) };
    // the profile page is the only place the overall rank and percentile appear: "25594th (Top 20.58%)"
    const html = await (await fetch(`https://atcoder.jp/users/${HANDLES.atcoder}`, { headers: UA })).text();
    const m = html.match(/<th[^>]*>Rank<\/th>\s*<td>(\d+)(?:st|nd|rd|th)\s*(?:<span[^>]*>\(Top ([\d.]+)%\)<\/span>)?/);
    if (m) { out.rank = Number(m[1]); if (m[2]) out.topPercent = Number(m[2]); }
    else console.warn('atcoder: rank not found on profile page');
    return out;
}

async function github() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN not set');
    const query = `query($u: String!) { user(login: $u) { contributionsCollection { contributionCalendar {
        totalContributions weeks { contributionDays { date contributionCount } } } } } }`;
    const { data } = await getJSON('https://api.github.com/graphql', {
        method: 'POST',
        headers: { authorization: `bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ query, variables: { u: HANDLES.github } })
    });
    const cal = data.user.contributionsCollection.contributionCalendar;
    const days = cal.weeks.flatMap((w) => w.contributionDays);
    return { asOf: today, total: cal.totalContributions, start: days[0].date, counts: days.map((d) => d.contributionCount) };
}

/* ---------------- Sanity check ---------------- */
// Decide whether freshly fetched numbers are believable enough to replace the saved ones.
// `fresh` and `previous` have the shape each source function returns; `previous` may be null.
// A rejected fetch costs nothing: the saved values stay and tomorrow's run tries again.
function isPlausible(source, fresh, previous) {
    const num = (v) => typeof v === 'number' && Number.isFinite(v);
    const sane = (r) => num(r) && r > 0 && r < 5000;
    const noBigJump = (a, b) => !num(b) || Math.abs(a - b) <= 400;

    switch (source) {
        case 'leetcode':
            return sane(fresh.rating) && num(fresh.solved) && fresh.solved > 0
                && fresh.easy + fresh.medium + fresh.hard === fresh.solved
                && (!previous || fresh.solved >= previous.solved)      // solved counts never go down
                && noBigJump(fresh.rating, previous && previous.rating);
        case 'codeforces':
            return sane(fresh.rating) && sane(fresh.maxRating) && fresh.maxRating >= fresh.rating
                && num(fresh.solved) && fresh.solved > 0
                && (!previous || fresh.solved >= previous.solved)
                && noBigJump(fresh.rating, previous && previous.rating);
        case 'atcoder':
            return sane(fresh.rating) && sane(fresh.maxRating) && fresh.maxRating >= fresh.rating
                && (!previous || !num(previous.maxRating) || fresh.maxRating >= previous.maxRating) // a peak never drops
                && noBigJump(fresh.rating, previous && previous.rating);
        case 'github':
            return Array.isArray(fresh.counts) && fresh.counts.length >= 364 && fresh.counts.length <= 371
                && fresh.counts.every((n) => Number.isInteger(n) && n >= 0)
                && fresh.counts.reduce((a, b) => a + b, 0) === fresh.total;
        default:
            return false;
    }
}

/* ---------------- Run ---------------- */
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const stats = (await readGlobal('stats-data.js', 'STATS')) || {};
const contrib = await readGlobal('contributions.js', 'CONTRIB');
let statsChanged = false;

for (const [name, fn] of Object.entries({ leetcode, codeforces, atcoder })) {
    try {
        const fresh = await fn();
        const { asOf, ...prev } = stats[name] || {};
        if (!isPlausible(name, fresh, stats[name] || null)) { console.warn(`${name}: implausible, kept saved values`, fresh); continue; }
        const merged = { ...prev, ...Object.fromEntries(Object.entries(fresh).filter(([, v]) => v != null)) };
        if (!same(merged, prev)) { stats[name] = { ...merged, asOf: today }; statsChanged = true; }
        console.log(`${name}: ok${same(merged, prev) ? ' (unchanged)' : ' (updated)'}`);
    } catch (e) {
        console.warn(`${name}: failed, kept saved values: ${e.message}`);
    }
}
if (statsChanged) {
    await writeFile(new URL('stats-data.js', ROOT),
        '// Competitive-programming stats, refreshed by scripts/update-stats.mjs.\n' +
        `window.STATS = ${JSON.stringify(stats, null, 2)};\n`);
}

try {
    const fresh = await github();
    if (!isPlausible('github', fresh, contrib)) throw new Error('implausible');
    if (!contrib || !same({ ...fresh, asOf: 0 }, { ...contrib, asOf: 0 })) {
        await writeFile(new URL('contributions.js', ROOT),
            `// GitHub contribution calendar for ${HANDLES.github}, refreshed by scripts/update-stats.mjs on ${today}.\n` +
            `window.CONTRIB = ${JSON.stringify(fresh)};\n`);
        console.log('github: ok (updated)');
    } else console.log('github: ok (unchanged)');
} catch (e) {
    console.warn(`github: failed, kept saved values: ${e.message}`);
}
