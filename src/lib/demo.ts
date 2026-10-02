import type { ScrapeData } from '@/lib/bridge';

/**
 * Data used by the web visualiser (session-probe.web.tsx). The PC preview
 * cannot scrape the real portal (no WebView / CORS), so it feeds the same
 * bridge a realistic synthetic payload instead. Never imported on iOS.
 */
export function buildDemoScrape(loggedIn: boolean): ScrapeData {
  const fetchedAt = Date.now();

  if (!loggedIn) {
    return {
      loggedIn: false,
      unreadMio: null,
      newsTitle: null,
      scheduleToday: null,
      fetchedAt,
      mioMessages: null,
      leaStats: null,
      leaSession: null,
      leaClasses: null,
      grades: null,
      services: null,
      events: null,
      communities: null,
      newsItems: null,
      notices: null,
    };
  }

  return {
    loggedIn: true,
    unreadMio: 3,
    newsTitle: 'Inscription à la session d’hiver 2027',
    scheduleToday: [
      { time: '08:30', course: 'INF1120 — Programmation I', room: 'Local 2-145' },
      { time: '10:15', course: 'MAT1360 — Mathématiques cégep', room: 'Local 3-210' },
      { time: '13:00', course: 'ENG1015 — Anglais technique', room: 'Local 1-008' },
      { time: '15:30', course: 'Laboratoire INF1120', room: 'Local 2-150' },
    ],
    fetchedAt,
    mioMessages: [
      {
        sender: 'Jean-François Roy',
        subject: 'Travaux pratiques — groupe B',
        preview:
          'Bonjour, le laboratoire de cette semaine se tient en local 2-150. Pensez à apporter votre ordinateur portable avec l’environnement de développement installé.',
        date: '1 oct.',
        unread: true,
        href: 'https://cegepsherbrooke.omnivox.ca/intr/Mio/Message/LireMessage.aspx?id=101',
      },
      {
        sender: 'Bibliothèque du campus',
        subject: 'Votre emprunt arrive à échéance',
        preview:
          'Le document « Initiation à la statistique » doit être retourné vendredi. Vous pouvez le prolonger depuis votre dossier lecteur.',
        date: '30 sept.',
        unread: true,
        href: 'https://cegepsherbrooke.omnivox.ca/intr/Mio/Message/LireMessage.aspx?id=102',
      },
      {
        sender: 'Marie-Claude Gagnon',
        subject: 'Remise du devoir 2 — INF1120',
        preview:
          'Le devoir 2 est à remettre en classe jeudi avant 13 h. Les retards ne seront pas acceptés sauf dispense écrite.',
        date: '29 sept.',
        unread: true,
        href: 'https://cegepsherbrooke.omnivox.ca/intr/Mio/Message/LireMessage.aspx?id=103',
      },
      {
        sender: 'Service des stages',
        subject: 'Réunion d’information — stages hiver 2027',
        preview:
          'Jeudi 9 octobre à 13 h, amphithéâtre 4. Inscrivez-vous sur la liste diffusée par votre département.',
        date: '28 sept.',
        unread: false,
        href: 'https://cegepsherbrooke.omnivox.ca/intr/Mio/Message/LireMessage.aspx?id=104',
      },
      {
        sender: 'Direction des études',
        subject: 'Résultats de la session d’été',
        preview:
          'Les résultats sont désormais affichés dans Léa. Consultez vos notes et, en cas d’erreur, écrivez-nous dans les 14 jours.',
        date: '26 sept.',
        unread: false,
        href: 'https://cegepsherbrooke.omnivox.ca/intr/Mio/Message/LireMessage.aspx?id=105',
      },
    ],
    leaStats: [
      { key: 'communiqués', label: 'Communiqués', value: '3', badge: 2 },
      { key: 'documents', label: 'Documents', value: '18', badge: 5 },
      { key: 'travaux', label: 'Travaux', value: '4', badge: 1 },
      { key: 'notes', label: 'Notes', value: '12' },
      { key: 'événement', label: 'Événements', value: '2' },
      { key: 'enseignants', label: 'Enseignants', value: '6' },
      { key: 'absences', label: 'Absences', value: '0' },
      { key: 'sites web', label: 'Sites web', value: '9' },
    ],
    leaSession: 'Automne 2026',
    leaClasses: 'Tous vos cours (5)',
    grades: [
      {
        pct: '92 %',
        title: 'Programmation I',
        courseCode: 'INF1120',
        groupAvg: '74 %',
        color: '#2E7D32',
      },
      {
        pct: '78 %',
        title: 'Mathématiques cégep',
        courseCode: 'MAT1360',
        groupAvg: '71 %',
        color: '#F57C1F',
      },
      {
        pct: '85 %',
        title: 'Anglais technique',
        courseCode: 'ENG1015',
        groupAvg: '79 %',
        color: '#2E7D32',
      },
      {
        pct: '88 %',
        title: 'Méthodologie du travail',
        courseCode: 'LOG1901',
        groupAvg: '76 %',
        color: '#2E7D32',
      },
      {
        pct: '63 %',
        title: 'Analyse et conception',
        courseCode: 'LOG2310',
        groupAvg: '69 %',
        color: '#E53935',
      },
    ],
    services: [
      { label: 'Mon portail étudiant', sub: 'Accès 24 h/24', enabled: true },
      { label: 'Bibliothèque', sub: 'Prolongation d’emprunts', enabled: true },
      { label: 'Réseau étudiant (Wi-Fi)', sub: 'Procédure de connexion', enabled: true },
      { label: 'Mon téléphone', sub: 'Service suspendu', enabled: false },
      { label: 'Infolettre du cégep', sub: 'Inscription en cours', enabled: true },
      { label: 'Soutien informatique', sub: 'demands@exemple.cegep.ca', enabled: true },
    ],
    events: [
      { day: '09', month: 'OCT', title: 'Portes ouvertes — techniques', sub: 'Amphithéâtre 4 · 9 h' },
      { day: '14', month: 'OCT', title: 'Ciné-club : séance gratuite', sub: 'Salle multifonction · 18 h' },
      { day: '24', month: 'OCT', title: 'Tournoi interdépartemental', sub: 'Gymnase · 16 h' },
      { day: '31', month: 'OCT', title: 'Foisonnement étudiant', sub: 'Hall principal · 10 h' },
    ],
    communities: [
      { name: 'Association étudiante', badge: 3 },
      { name: 'Clubs & activités', badge: 1 },
      { name: 'Vie du campus' },
    ],
    newsItems: [
      { title: 'Résultats de la session d’été affichés', href: '#' },
      { title: 'Inscription à l’hiver 2027 : ouverture le 12 octobre', href: '#' },
      { title: 'Nouveau local informatique au 2e étage', href: '#' },
      { title: 'Repas à 2 $ au cafétériapendant la semaine de révision', href: '#' },
    ],
    notices: [
      'Période de révision : du 14 au 18 décembre',
      'Librairie du campus : horaire prolongé jusqu’à 17 h',
    ],
  };
}
