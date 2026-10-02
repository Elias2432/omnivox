import type { SectionId } from '@/lib/portals';

export type ScheduleItem = {
  time: string;
  course: string;
  room?: string;
};

export type MioMessage = {
  sender: string;
  subject: string;
  preview: string;
  date: string;
  unread: boolean;
  href: string;
};

export type LeaStat = {
  key: string;
  label: string;
  value: string;
  badge?: number;
  href?: string;
};

export type GradeItem = {
  pct: string;
  title: string;
  courseCode: string;
  groupAvg?: string;
  color?: string;
};

export type ServiceRow = {
  label: string;
  sub?: string;
  href?: string;
  enabled: boolean;
};

export type EventCard = {
  day: string;
  month: string;
  title: string;
  sub?: string;
  color?: string;
};

export type NewsItem = {
  title: string;
  href: string;
};

export type CommunityCard = {
  name: string;
  badge?: number;
  href?: string;
};

export type ScrapeData = {
  loggedIn: boolean;
  unreadMio: number | null;
  newsTitle: string | null;
  scheduleToday: ScheduleItem[] | null;
  fetchedAt: number;
  // native screens (null = parse failed / not fetched -> use web fallback)
  mioMessages?: MioMessage[] | null;
  leaStats?: LeaStat[] | null;
  leaSession?: string | null;
  leaClasses?: string | null;
  grades?: GradeItem[] | null;
  services?: ServiceRow[] | null;
  events?: EventCard[] | null;
  communities?: CommunityCard[] | null;
  newsItems?: NewsItem[] | null;
  notices?: string[] | null;
};

export type BridgeMessage =
  | { type: 'scrape'; data: ScrapeData }
  | { type: 'navigate'; section: SectionId; url: string }
  | { type: 'openExternal'; url: string }
  | { type: 'downloadStart'; id: string; name: string; mime: string; url: string }
  | { type: 'downloadChunk'; id: string; index: number; total: number; data: string }
  | { type: 'downloadEnd'; id: string }
  | { type: 'downloadError'; id: string; error: string }
  | { type: 'log'; message: string };

export function parseBridgeMessage(raw: string): BridgeMessage | null {
  try {
    const parsed = JSON.parse(raw) as BridgeMessage;
    if (parsed && typeof parsed === 'object' && 'type' in parsed) return parsed;
    return null;
  } catch {
    return null;
  }
}
