import type { SectionId } from '@/lib/portals';
import { SECTION_PATTERNS } from '@/lib/portals';

export type InjectedOptions = {
  section: SectionId;
  /** Run the heavier same-origin fetches (MIO inbox, Léa, grades, services). Probe only. */
  deep: boolean;
};

type InjectedConfig = InjectedOptions & {
  patterns: Record<SectionId, string[]>;
};

/**
 * Runs inside the portal page. Serialized with Function.prototype.toString() and
 * injected into every WebView. Must be fully self-contained.
 *
 * Responsibilities:
 *  - classify tapped links: files -> chunked download, other sections -> switch app tab,
 *    external hosts -> system browser
 *  - auto-navigate this WebView to its pinned section once it sits on the portal home
 *  - scrape session state + (deep mode) fetch & parse the MIO inbox, Léa grid,
 *    grades and services pages into JSON for the native screens
 */
export function portalScript(cfg: InjectedConfig): void {
  const patterns: Record<string, string[]> = cfg.patterns;
  const section = cfg.section;
  const bridge = window as unknown as { ReactNativeWebView?: { postMessage: (s: string) => void } };
  const logged: Record<string, boolean> = {};

  function post(msg: unknown): void {
    try {
      bridge.ReactNativeWebView?.postMessage(JSON.stringify(msg));
    } catch {
      /* bridge not ready */
    }
  }

  function debug(tag: string, info: string): void {
    if (logged[tag]) return;
    logged[tag] = true;
    post({ type: 'log', message: tag + ': ' + info });
  }

  function classify(href: string, text?: string | null): string | null {
    if (!href) return null;
    const h = String(href);
    if (/\.(pdf|docx?|xlsx?|pptx?|zip|rar|txt|rtf|csv|epub|png|jpe?g|gif)(\?|#|$)/i.test(h)) return 'file';
    if (/(t[ée]l[ée]charg|download)(er)?(\?|$|\/)/i.test(h)) return 'file';
    if (/\/login\/account\/login|\/identification\//i.test(h)) return 'login';
    const hay = (h + ' ' + (text || '')).toLowerCase();
    const order = ['mio', 'schedule', 'lea', 'grades', 'news', 'documents', 'services', 'avis'];
    for (const key of order) {
      const pats = patterns[key] || [];
      for (const pat of pats) {
        try {
          if (new RegExp(pat, 'i').test(hay)) return key;
        } catch {
          /* bad pattern */
        }
      }
    }
    return null;
  }

  function fileNameOf(url: string, text?: string | null): string {
    let base = '';
    try {
      const path = url.split('?')[0].split('#')[0];
      base = decodeURIComponent(path.split('/').pop() || '');
    } catch {
      base = '';
    }
    if (!base || base.indexOf('.') < 1) {
      base = (text || '').trim().replace(/\s+/g, ' ').slice(0, 60) || 'download';
    }
    base = base.replace(/[\\/:*?"<>|]+/g, '_');
    if (base.indexOf('.') < 1) base += '.bin';
    return base;
  }

  // ---- file downloads (chunked base64 over the RN bridge) ----
  const CHUNK = 256 * 1024;

  function startDownload(url: string, name: string): void {
    const id = 'dl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    fetch(url, { credentials: 'include' })
      .then((res: Response) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const mime = (res.headers.get('content-type') || '').split(';')[0];
        if (/text\/html/i.test(mime)) throw new Error('The portal returned a web page, not a file');
        post({ type: 'downloadStart', id, name, mime, url });
        return res.blob();
      })
      .then((blob: Blob) => blob.arrayBuffer())
      .then((buf: ArrayBuffer) => {
        const bytes = new Uint8Array(buf);
        const total = Math.max(1, Math.ceil(bytes.length / CHUNK));
        for (let i = 0; i < total; i++) {
          const slice = bytes.subarray(i * CHUNK, (i + 1) * CHUNK);
          let s = '';
          for (let k = 0; k < slice.length; k++) s += String.fromCharCode(slice[k]);
          post({ type: 'downloadChunk', id, index: i, total: data(s) });
        }
        post({ type: 'downloadEnd', id });
      })
      .catch((err: Error) => post({ type: 'downloadError', id, error: String(err && err.message ? err.message : err) }));

    function data(s: string): number {
      return Math.ceil(s.length / CHUNK) || 1;
    }
  }

  // ---- link interception ----
  document.addEventListener(
    'click',
    (e: Event) => {
      try {
        const target = e.target as Element | null;
        const a = target && target.closest ? (target.closest('a[href]') as HTMLAnchorElement | null) : null;
        if (!a) return;
        const raw = a.getAttribute('href') || '';
        if (!raw || raw.toLowerCase().indexOf('javascript:') === 0) return;
        const abs = a.href || raw;
        const kind = classify(abs, a.textContent);

        if (kind === 'file') {
          e.preventDefault();
          e.stopPropagation();
          startDownload(abs, fileNameOf(abs, a.textContent));
          return;
        }
        if (kind === 'login') return; // let the portal show its login page
        if (kind && kind !== section) {
          e.preventDefault();
          e.stopPropagation();
          post({ type: 'navigate', section: kind, url: abs });
          return;
        }
        const host = abs.replace(/^https?:\/\//i, '').split('/')[0];
        if (host && host !== location.host) {
          e.preventDefault();
          e.stopPropagation();
          post({ type: 'openExternal', url: abs });
          return;
        }
        if (a.target && a.target.toLowerCase() === '_blank') {
          e.preventDefault();
          e.stopPropagation();
          location.href = abs;
        }
      } catch (err) {
        post({ type: 'log', message: 'click: ' + err });
      }
    },
    true
  );

  // ---- section auto-navigation (portal home -> pinned section) ----
  function findSectionLink(want: string): string | null {
    const links = document.querySelectorAll('a[href]');
    for (let i = 0; i < links.length; i++) {
      const a = links[i] as HTMLAnchorElement;
      const abs = a.href;
      if (!abs || abs.indexOf('javascript:') === 0) continue;
      if (classify(abs, a.textContent) === want) return abs;
    }
    return null;
  }

  function findLeaLink(doc: Document): string | null {
    const links = doc.querySelectorAll('a[href]');
    for (let i = 0; i < links.length; i++) {
      const a = links[i] as HTMLAnchorElement;
      const t = (a.textContent || '').replace(/\s+/g, ' ').trim();
      if (/^l[ée]a$/i.test(t) || /\bl[ée]a\b/i.test(t.slice(0, 30))) return a.href;
    }
    for (const key of ['lea', 'grades']) {
      for (let i = 0; i < links.length; i++) {
        const a = links[i] as HTMLAnchorElement;
        if (classify(a.href, a.textContent) === key) return a.href;
      }
    }
    return null;
  }

  function autoNavigate(): void {
    if (!section || section === 'portal') return;
    const k = classify(location.href);
    if (k === section) return;
    if (k !== null && k !== 'portal') return; // deep inside some other section: leave it alone
    const found = findSectionLink(section);
    if (!found) return;
    try {
      if (sessionStorage.getItem('ox_nav_' + section) === found) return;
      sessionStorage.setItem('ox_nav_' + section, found);
    } catch {
      /* private mode */
    }
    if (found !== location.href) location.href = found;
  }

  // ---- scraping helpers ----
  function parseDoc(html: string): Document | null {
    try {
      return new DOMParser().parseFromString(html, 'text/html');
    } catch {
      return null;
    }
  }

  function txt(el: Element | null | undefined): string {
    return ((el && el.textContent) || '').replace(/\s+/g, ' ').trim();
  }

  function findNumberNearMio(): number | null {
    const nodes = document.querySelectorAll(
      '[class*="badge" i], [class*="compteur" i], [class*="unread" i], [class*="non-lu" i], [class*="notification" i], [class*="counter" i]'
    );
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i] as HTMLElement;
      const t = txt(el);
      if (!/^\d{1,3}$/.test(t)) continue;
      const context = txt(el.parentElement) + ' ' + (el.getAttribute('title') || '');
      if (/mio/i.test(context)) return parseInt(t, 10);
    }
    return null;
  }

  function baseScrape(): Record<string, unknown> {
    const out: Record<string, unknown> = {
      loggedIn: false,
      unreadMio: null,
      newsTitle: null,
      scheduleToday: null,
      fetchedAt: Date.now(),
    };
    try {
      const html = document.documentElement ? document.documentElement.innerHTML : '';
      const url = location.href;
      const onLogin = /\/login\/account\/login/i.test(url) || /PasswordEtu|OubliMotPasse|name="PasswordEtu"/i.test(html);
      out.loggedIn = !onLogin;

      let unread = findNumberNearMio();
      if (unread === null) {
        const anchor = findSectionLink('mio');
        if (anchor) {
          const m = anchor.match(/\((\d{1,3})\)/);
          if (m) unread = parseInt(m[1], 10);
        }
      }
      if (unread === null) {
        const m = html.match(/mio[^\d]{0,40}(\d{1,3})/i);
        if (m) unread = parseInt(m[1], 10);
      }
      if (unread !== null && unread >= 0 && unread < 1000) out.unreadMio = unread;

      const links = document.querySelectorAll('a[href]');
      for (let i = 0; i < links.length && !out.newsTitle; i++) {
        const a = links[i] as HTMLAnchorElement;
        const text = txt(a);
        if (text.length < 15 || text.length > 160) continue;
        if (classify(a.href, text) === 'news') out.newsTitle = text;
      }
      if (!out.newsTitle) {
        const heads = document.querySelectorAll('h1, h2, h3');
        for (let i = 0; i < heads.length && !out.newsTitle; i++) {
          const el = heads[i] as HTMLElement;
          const ctx = ((el.parentElement && el.parentElement.className) || '') + ' ' + el.className + ' ' + el.id;
          const text = txt(el);
          if (text.length >= 15 && text.length <= 160 && /nouvel|actualit|news|event|[ée]v[ée]nement|infolettre/i.test(ctx)) {
            out.newsTitle = text;
          }
        }
      }
    } catch {
      /* keep whatever we got */
    }
    return out;
  }

  const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];
  const DAYS_EN = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

  function parseScheduleHtml(html: string): { time: string; course: string; room?: string }[] | null {
    const doc = parseDoc(html);
    if (!doc) return null;
    const rows = Array.prototype.slice.call(doc.querySelectorAll('tr')) as HTMLTableRowElement[];
    let header: HTMLTableRowElement | null = null;
    let col = -1;
    let today = -1;
    for (const row of rows) {
      const cells = Array.prototype.slice.call(row.querySelectorAll('td, th')) as HTMLElement[];
      for (let i = 0; i < cells.length; i++) {
        const t = txt(cells[i]).toLowerCase();
        const fr = DAYS.indexOf(t.slice(0, 8));
        const en = DAYS_EN.indexOf(t.slice(0, 9));
        if (fr >= 0 || en >= 0) {
          header = row;
          col = i;
          const d = new Date().getDay(); // 0 Sun .. 6 Sat
          today = d >= 1 && d <= 5 ? d : -1;
          break;
        }
      }
      if (header) break;
    }
    if (!header || col < 0) return null;
    if (today < 0) return []; // weekend

    const items: { time: string; course: string; room?: string }[] = [];
    let seen = false;
    for (const row of rows) {
      if (row === header) {
        seen = true;
        continue;
      }
      if (!seen) continue;
      const cells = Array.prototype.slice.call(row.querySelectorAll('td, th')) as HTMLElement[];
      if (cells.length <= col) continue;
      const time = txt(cells[0]);
      if (!/\d{1,2}:\d{2}/.test(time)) continue;
      const raw = txt(cells[col]);
      if (!raw || raw === '&nbsp;') continue;
      if (/^(-|—|x|\s)*$/.test(raw)) continue;
      const roomMatch = raw.match(/\(([^)]{1,30})\)/);
      items.push({
        time: time.slice(0, 40),
        course: raw.slice(0, 90),
        room: roomMatch ? roomMatch[1] : undefined,
      });
    }
    return items.length ? items : null;
  }

  // ---- native screen parsers -------------------------------------------

  const MIO_ROW_SELECTORS = 'tr, li, [class*="mio" i], [class*="message" i], [class*="ligne" i], [class*="item" i]';

  function parseMioInbox(html: string): unknown[] | null {
    const doc = parseDoc(html);
    if (!doc) return null;
    const rows = doc.querySelectorAll(MIO_ROW_SELECTORS);
    const out: unknown[] = [];
    const seen: Record<string, boolean> = {};
    for (let i = 0; i < rows.length && out.length < 60; i++) {
      const row = rows[i];
      const anchors = row.querySelectorAll('a[href]');
      if (!anchors.length) continue;
      // the message link is usually the subject anchor
      let subjectA: HTMLAnchorElement | null = null;
      let sender = '';
      let date = '';
      const plain = txt(row);
      if (plain.length < 25) continue;
      for (let k = 0; k < anchors.length; k++) {
        const a = anchors[k] as HTMLAnchorElement;
        const t = txt(a);
        if (t.length < 3) continue;
        if (classify(a.href, t) === 'file' || classify(a.href, t) === 'login') continue;
        if (!subjectA && t.length >= 3) subjectA = a;
        if (/\d{1,2}[\s/-](janv|févr|fevr|mars|avril|mai|juin|juil|août|aout|sept|oct|nov|déc|dec)/i.test(t)) {
          date = t.slice(0, 20);
        }
        if (!sender && /\S+\s+\S+/.test(t) && t.length < 50 && t !== txt(subjectA)) sender = t;
      }
      if (!subjectA) continue;
      const href = subjectA.href;
      if (seen[href]) continue;
      seen[href] = true;
      const subject = txt(subjectA);
      // preview = row text minus sender/subject/date
      let preview = plain;
      preview = preview.replace(subject, ' ').replace(sender, ' ').replace(date, ' ');
      preview = preview.replace(/\s+/g, ' ').trim().slice(0, 140);
      const rowClass = ((row.getAttribute('class') || '') + ' ' + (row.getAttribute('id') || '')).toLowerCase();
      const unread =
        /nonlu|non-lu|unread|nz|bold/.test(rowClass) ||
        ((subjectA.getAttribute('style') || '').toLowerCase().indexOf('bold') >= 0) ||
        (row.getAttribute('data-unread') === '1');
      out.push({ sender: sender.slice(0, 60), subject: subject.slice(0, 120), preview, date, unread, href });
    }
    if (!out.length) {
      debug('parse:mio', 'no rows, html=' + html.length);
      return null;
    }
    return out;
  }

  const LEA_LABELS = [
    'Communiqués',
    'Communiqués',
    'Documents',
    'Travaux',
    'Notes',
    'Évènement',
    'Évènement',
    'Enseignants',
    'Sites web',
    'Absences',
    'Forum',
    'Classe à distance',
  ];

  function parseLeaGrid(html: string): { stats: unknown[] | null; session: string | null; classes: string | null } {
    const doc = parseDoc(html);
    if (!doc) return { stats: null, session: null, classes: null };
    let session: string | null = null;
    let classes: string | null = null;
    const sm = html.match(/(Hiver|Automne|[Éé]t[ée]|Printemps)\s+20\d{2}/);
    if (sm) session = sm[0];
    const cm = html.match(/Tous vos cours|Toutes vos classes|Tous les cours/i);
    if (cm) classes = cm[0];

    const stats: unknown[] = [];
    const used: Record<string, boolean> = {};
    const all = doc.querySelectorAll('td, div, span, p, li, a, strong, b');
    for (let i = 0; i < all.length && stats.length < 14; i++) {
      const el = all[i];
      const t = txt(el);
      if (!t || t.length > 30) continue;
      let label = '';
      for (const L of LEA_LABELS) {
        if (t.toLowerCase() === L.toLowerCase()) {
          label = L;
          break;
        }
      }
      if (!label || used[label]) continue;
      used[label] = true;
      // look for the value in the element itself, siblings or parent
      let value = '';
      let badge: number | undefined;
      const scope = [el, el.parentElement, el.nextElementSibling, el.previousElementSibling];
      for (const s of scope) {
        if (!s) continue;
        const st = txt(s);
        const vm = st.match(/(-|\d{1,3})\b/);
        if (vm && (st.length <= 40 || /badge|compteur|count/i.test(s.getAttribute('class') || ''))) {
          value = vm[1];
          const bm = st.match(/\((\d{1,3})\)/) || st.match(/class="[^"]*(?:badge|count|compteur)[^"]*"[^>]*>\s*(\d{1,3})/i);
          if (bm) badge = parseInt(bm[1], 10);
          if (value) break;
        }
      }
      if (!value) value = '-';
      let href: string | undefined;
      const anc =
        (el.closest('a') as HTMLAnchorElement | null) ||
        (el.querySelector('a[href]') as HTMLAnchorElement | null);
      if (anc) href = anc.href;
      const parent = el.parentElement;
      if (!href && parent) {
        const pa = parent.querySelector('a[href]') as HTMLAnchorElement | null;
        if (pa) href = pa.href;
      }
      stats.push({ key: label.toLowerCase(), label, value, badge, href });
    }
    if (!stats.length) debug('parse:lea', 'no stats, html=' + html.length);
    return { stats: stats.length ? stats : null, session, classes };
  }

  function parseGrades(html: string): unknown[] | null {
    const doc = parseDoc(html);
    if (!doc) return null;
    const out: unknown[] = [];
    const rows = doc.querySelectorAll('tr, li, [class*="note" i], [class*="grade" i], [class*="ligne" i], div');
    const seen: Record<string, boolean> = {};
    for (let i = 0; i < rows.length && out.length < 40; i++) {
      const row = rows[i];
      const t = txt(row);
      const pm = t.match(/(\d{1,3})\s*%/);
      if (!pm) continue;
      if (t.length > 400) continue;
      const pct = pm[1] + '%';
      // title: bold/anchor text containing letters
      let title = '';
      const bolds = row.querySelectorAll('b, strong, a, [class*="titre" i], [class*="title" i], h1, h2, h3, h4');
      for (let k = 0; k < bolds.length; k++) {
        const bt = txt(bolds[k]);
        if (bt.length >= 8 && /\d/.test(bt) === false && /[a-zà-ÿ]/i.test(bt)) {
          title = bt.slice(0, 90);
          break;
        }
      }
      if (!title) {
        const tm = t.match(/(\d{3}-\d{3}[A-Za-z-]*\s+gr\.\s*\d+)?\s*(.{10,90})/);
        title = tm ? (tm[2] || '').slice(0, 90) : t.slice(0, 90);
      }
      if (!title || seen[pct + title]) continue;
      seen[pct + title] = true;
      const cm = t.match(/\b(\d{3}-\d{3}[A-Za-z-]*(?:\s+gr\.\s*\d+)?)\b/);
      const courseCode = cm ? cm[1] : '';
      const gm = t.match(/Moy[.\s]*finale[^\d]{0,30}(\d{1,3})\s*%/i) || t.match(/Moyenne[^\d]{0,30}(\d{1,3})\s*%/i);
      const groupAvg = gm ? gm[1] + '%' : undefined;
      // color: inline color style on the title element (portal colours grades)
      let color: string | undefined;
      const colored = row.querySelectorAll('[style*="color" i]');
      for (let k = 0; k < colored.length; k++) {
        const st = (colored[k] as HTMLElement).getAttribute('style') || '';
        const m = st.match(/color\s*:\s*(#[0-9a-f]{3,8}|rgb[a]?\([^)]+\))/i);
        if (m && !/gray|grey|black|#000/i.test(m[1])) {
          color = m[1];
          break;
        }
      }
      out.push({ pct, title, courseCode, groupAvg, color });
    }
    if (!out.length) {
      debug('parse:grades', 'no grades, html=' + html.length);
      return null;
    }
    return out;
  }

  function parseServices(html: string): unknown[] | null {
    const doc = parseDoc(html);
    if (!doc) return null;
    const out: unknown[] = [];
    const seen: Record<string, boolean> = {};
    const links = doc.querySelectorAll('a[href]');
    for (let i = 0; i < links.length && out.length < 40; i++) {
      const a = links[i] as HTMLAnchorElement;
      const label = txt(a);
      if (label.length < 4 || label.length > 60) continue;
      if (classify(a.href, label) !== 'services') continue;
      if (seen[label]) continue;
      seen[label] = true;
      const container = a.parentElement;
      const ctx = txt(container) + ' ' + txt(container && container.parentElement);
      const disabled = /d[ée]sactiv|indisponible|non disponible|disabled|ferm[ée]/i.test(ctx.slice(label.length));
      const subM = ctx.match(/(pr[ée]sentement d[ée]sactiv[^,.;]{0,60}|de retour le [^,.;]{0,40})/i);
      out.push({ label, sub: subM ? subM[1].slice(0, 80) : undefined, href: a.href, enabled: !disabled });
    }
    if (!out.length) debug('parse:services', 'no rows, html=' + html.length);
    return out.length ? out : null;
  }

  function parseHomeWidgets(doc: Document): {
    news: unknown[] | null;
    events: unknown[] | null;
    communities: unknown[] | null;
    notices: string[] | null;
  } {
    // news items
    const news: unknown[] = [];
    const seenN: Record<string, boolean> = {};
    const links = doc.querySelectorAll('a[href]');
    for (let i = 0; i < links.length && news.length < 12; i++) {
      const a = links[i] as HTMLAnchorElement;
      const t = txt(a);
      if (t.length < 12 || t.length > 140) continue;
      if (classify(a.href, t) !== 'news') continue;
      if (seenN[t]) continue;
      seenN[t] = true;
      news.push({ title: t, href: a.href });
    }

    // events: blocks containing a short date (e.g. "5 octobre") + a title
    const events: unknown[] = [];
    const MONTHS = 'janv|févr|fevr|mars|avril|mai|juin|juil|août|aout|sept|oct|nov|déc|dec';
    const candidates = doc.querySelectorAll('div, td, li, article, section');
    const seenE: Record<string, boolean> = {};
    for (let i = 0; i < candidates.length && events.length < 10; i++) {
      const el = candidates[i];
      const t = txt(el);
      if (t.length < 10 || t.length > 220) continue;
      const dm = t.match(new RegExp('(\\d{1,2})\\s+(' + MONTHS + ')\\w*\\.?', 'i'));
      if (!dm) continue;
      if (el.querySelectorAll('div, article, li').length > 6) continue; // too deep = container
      const title = t.replace(dm[0], ' ').replace(/\s+/g, ' ').trim();
      if (title.length < 3) continue;
      const key = dm[0] + title;
      if (seenE[key]) continue;
      seenE[key] = true;
      events.push({ day: dm[1], month: dm[2].slice(0, 4), title: title.slice(0, 90), sub: undefined, color: undefined });
    }

    // communities: heading "Communautés" -> following container anchors
    const communities: unknown[] = [];
    let commContainer: Element | null = null;
    const heads = doc.querySelectorAll('h1, h2, h3, h4, strong, b, div, span');
    for (let i = 0; i < heads.length; i++) {
      if (/communaut/i.test(txt(heads[i])) && txt(heads[i]).length < 40) {
        commContainer = heads[i].parentElement;
        break;
      }
    }
    if (commContainer) {
      const cl = commContainer.querySelectorAll('a[href]');
      const seenC: Record<string, boolean> = {};
      for (let i = 0; i < cl.length && communities.length < 8; i++) {
        const a = cl[i] as HTMLAnchorElement;
        const name = txt(a);
        if (name.length < 2 || name.length > 40) continue;
        if (seenC[name]) continue;
        seenC[name] = true;
        const ctx = txt(a.parentElement);
        const bm = ctx.match(/\((\d{1,3})\)/) || ctx.match(/(\d{1,3})\s*$/);
        communities.push({ name, badge: bm ? parseInt(bm[1], 10) : undefined, href: a.href });
      }
    }

    // "Quoi de neuf?" notices
    const notices: string[] = [];
    const all = doc.querySelectorAll('div, td, p, li, strong');
    for (let i = 0; i < all.length && notices.length < 5; i++) {
      const t = txt(all[i]);
      if (/quoi de neuf/i.test(t) && t.length < 300 && all[i].querySelectorAll('div, p').length <= 4) {
        const clean = t.replace(/quoi de neuf\?/i, '').trim();
        if (clean.length >= 8) notices.push(clean.slice(0, 160));
      }
    }

    return {
      news: news.length ? news : null,
      events: events.length ? events : null,
      communities: communities.length ? communities : null,
      notices: notices.length ? notices : null,
    };
  }

  function fetchText(url: string): Promise<string> {
    return fetch(url, { credentials: 'include' }).then((r: Response) => (r.ok ? r.text() : ''));
  }

  function deepScrape(out: Record<string, unknown>): Promise<void> {
    if (!cfg.deep) return Promise.resolve();
    const home = document.documentElement ? document : null;
    if (home) {
      const w = parseHomeWidgets(home as unknown as Document);
      if (w.news) out.newsItems = w.news;
      if (w.events) out.events = w.events;
      if (w.communities) out.communities = w.communities;
      if (w.notices) out.notices = w.notices;
    }

    const mioUrl = findSectionLink('mio');
    const leaUrl = findLeaLink(document);
    const servicesUrl = findSectionLink('services');
    const jobs: Promise<void>[] = [];

    // schedule (home dashboard)
    const schedUrl = findSectionLink('schedule');
    if (schedUrl) {
      jobs.push(
        fetchText(schedUrl)
          .then((html) => {
            if (html) out.scheduleToday = parseScheduleHtml(html);
          })
          .catch(() => undefined)
      );
    }

    // MIO inbox
    if (mioUrl) {
      jobs.push(
        fetchText(mioUrl)
          .then((html) => {
            if (!html) return;
            out.mioMessages = parseMioInbox(html);
            if (out.unreadMio === null) {
              const m = html.match(/non[- ]lus?[^\d]{0,25}(\d{1,3})/i) || html.match(/\((\d{1,3})\)/);
              if (m) {
                const n = parseInt(m[1], 10);
                if (n > 0 && n < 1000) out.unreadMio = n;
              }
            }
          })
          .catch(() => undefined)
      );
    }

    // Léa grid + grades chain
    if (leaUrl) {
      jobs.push(
        fetchText(leaUrl)
          .then((html) => {
            if (!html) return;
            const grid = parseLeaGrid(html);
            if (grid.stats) out.leaStats = grid.stats;
            if (grid.session) out.leaSession = grid.session;
            if (grid.classes) out.leaClasses = grid.classes;
            // find the grades/notes link from the Léa page (or reuse patterns)
            let gradesUrl: string | null = null;
            const doc = parseDoc(html);
            if (doc) {
              const ls = doc.querySelectorAll('a[href]');
              for (let i = 0; i < ls.length; i++) {
                const a = ls[i] as HTMLAnchorElement;
                const k = classify(a.href, a.textContent);
                if (k === 'grades') {
                  gradesUrl = a.href;
                  break;
                }
              }
              if (!gradesUrl) gradesUrl = findLeaLink(doc);
            }
            if (!gradesUrl) return;
            return fetchText(gradesUrl).then((gh: string) => {
              if (gh) out.grades = parseGrades(gh);
            });
          })
          .catch(() => undefined)
      );
    }

    // services menu
    if (servicesUrl) {
      jobs.push(
        fetchText(servicesUrl)
          .then((html) => {
            if (html) out.services = parseServices(html);
          })
          .catch(() => undefined)
      );
    }

    return Promise.all(jobs).then(() => undefined);
  }

  function runScrape(): void {
    try {
      const out = baseScrape();
      const finish = () => post({ type: 'scrape', data: out });
      deepScrape(out).then(finish, finish);
    } catch {
      /* never break the page */
    }
  }

  function boot(): void {
    autoNavigate();
    runScrape();
  }

  if (document.readyState === 'complete') {
    boot();
  } else {
    window.addEventListener('load', boot);
  }
}

export function buildInjectedJavaScript(options: InjectedOptions): string {
  const full: InjectedConfig = { ...options, patterns: SECTION_PATTERNS };
  return `(${portalScript.toString()})(${JSON.stringify(full)}); true;`;
}
