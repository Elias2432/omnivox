export type SectionId = 'portal' | 'schedule' | 'mio' | 'lea' | 'grades' | 'news' | 'documents' | 'services' | 'avis';

export type College = {
  id: string;
  name: string;
  host: string;
};

/** Hosts verified to answer on https://<host>/intr/. */
export const COLLEGES: College[] = [
  { id: 'cegepsherbrooke', name: 'Cégep de Sherbrooke', host: 'cegepsherbrooke.omnivox.ca' },
  { id: 'dawsoncollege', name: 'Dawson College', host: 'dawsoncollege.omnivox.ca' },
  { id: 'vaniercollege', name: 'Vanier College', host: 'vaniercollege.omnivox.ca' },
  { id: 'marianopolis', name: 'Marianopolis College', host: 'marianopolis.omnivox.ca' },
  { id: 'johnabbott', name: 'John Abbott College', host: 'johnabbott.omnivox.ca' },
  { id: 'cegepgim', name: 'Cégep de la Gaspésie et des Îles', host: 'cegepgim.omnivox.ca' },
  {
    id: 'champlaincollege-st-lawrence',
    name: 'Champlain College – St. Lawrence',
    host: 'champlaincollege-st-lawrence.omnivox.ca',
  },
  { id: 'cegepvicto', name: 'Cégep de Victoriaville', host: 'cegepvicto.omnivox.ca' },
  { id: 'cegepat', name: 'Cégep de l’Abitibi-Témiscamingue', host: 'cegepat.omnivox.ca' },
  { id: 'cegepmontpetit', name: 'Cégep Édouard-Montpetit', host: 'cegepmontpetit.omnivox.ca' },
  { id: 'cegep-heritage', name: 'Cégep Heritage College', host: 'cegep-heritage.omnivox.ca' },
];

/**
 * Regex source patterns used both in-app and inside the WebView to map a URL
 * (or link text) to a portal section. FR + EN keywords.
 */
export const SECTION_PATTERNS: Record<SectionId, string[]> = {
  portal: [],
  schedule: ['horaire', 'schedule', 'timetable', 'grille.*cours'],
  mio: ['\\bmio\\b', '/mio/', 'messagerie', 'communication'],
  lea: ['\\bl[ée]a\\b', 'module/lea', 'lia/'],
  grades: ['\\bnote', 'bulletin', 'grade', 'r[ée]sultat', '[ée]valuation', 'resultat', 'note finale'],
  news: ['nouvelle', 'actualit', 'infolettre', '[ée]v[ée]nement', 'event', '\\bnews\\b'],
  documents: ['document', 'fichier', 'course.*file', 'contenu.*cours', 'cours.*document'],
  services: [
    'service',
    'adresse courriel',
    'appareil',
    'choix de cours',
    'cours annul',
    'résidence',
    'residence',
    'stationnement',
    'biblioth',
    'changement de programme',
  ],
  avis: ['avis', 'feedback', 'commentaire', 'signaler un bogue', "donnez-nous votre avis"],
};

const FILE_PATTERN = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|txt|rtf|csv|epub|png|jpe?g|gif)(\?|#|$)/i;
const DOWNLOAD_PATTERN = /(t[ée]l[ée]charg|download)(er)?(\?|$|\/)/i;

export function isFileUrl(url: string): boolean {
  return FILE_PATTERN.test(url) || DOWNLOAD_PATTERN.test(url);
}

export function classifyUrl(
  url: string,
  text?: string,
  currentSection: SectionId = 'portal'
): SectionId | 'external' | 'file' | 'login' | null {
  if (!url) return null;
  if (isFileUrl(url)) return 'file';
  if (/\/login\/account\/login|\/identification\//i.test(url)) return 'login';
  const haystack = `${url} ${text ?? ''}`.toLowerCase();
  if (/\/(news|nouvelles?)\//i.test(url) && currentSection !== 'news') return 'news';
  for (const section of ['mio', 'schedule', 'lea', 'grades', 'news', 'documents', 'services', 'avis'] as SectionId[]) {
    for (const pattern of SECTION_PATTERNS[section]) {
      if (new RegExp(pattern, 'i').test(haystack)) return section;
    }
  }
  if (/^https?:\/\//i.test(url)) return null;
  return null;
}

export function entryUrl(host: string): string {
  return `https://${host}/intr/`;
}

export function logoutUrl(host: string): string {
  return `https://${host}/intr/Module/Identification/Quitter.aspx`;
}

export type SectionRoute = {
  section: SectionId;
  route: '/mio' | '/lea' | '/notes' | '/news' | '/course-docs' | '/services' | '/avis';
};

export function sectionRoute(section: SectionId): SectionRoute['route'] | null {
  switch (section) {
    case 'mio':
      return '/mio';
    case 'lea':
      return '/lea';
    case 'grades':
      return '/notes';
    case 'news':
      return '/news';
    case 'documents':
      return '/course-docs';
    case 'services':
      return '/services';
    case 'avis':
      return '/avis';
    default:
      return null;
  }
}

export function collegeFromCustomHost(host: string): College {
  const cleaned = host
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '');
  return { id: 'custom', name: cleaned, host: cleaned };
}
