import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState as RNAppState } from 'react-native';

import { SessionProbe, type SessionProbeHandle } from '@/components/session-probe';
import type { ScrapeData } from '@/lib/bridge';
import { deleteDownload, listDownloads, subscribeDownloads, type DownloadMeta } from '@/lib/downloads';
import { dispatchBridge } from '@/lib/handle-bridge';
import { notify, setAppBadge } from '@/lib/notifications';
import { COLLEGES, collegeFromCustomHost, entryUrl, logoutUrl, sectionRoute, type College, type SectionId } from '@/lib/portals';

const COLLEGE_KEY = 'omnivox.college.v1';
const CUSTOM_KEY = 'omnivox.customHost.v1';
const NOTIFY_KEY = 'omnivox.notifications.v1';

type AppState = {
  hydrated: boolean;
  college: College | null;
  entryUrl: string | null;
  sessionVersion: number;
  scrape: ScrapeData | null;
  lastUpdatedAt: number | null;
  unreadMio: number | null;
  leaBadge: number | null;
  notificationsOn: boolean;
  downloads: DownloadMeta[];
  selectCollege: (college: College) => Promise<void>;
  setCustomCollege: (host: string) => Promise<void>;
  toggleNotifications: (enabled: boolean) => Promise<void>;
  signOut: () => void;
  refreshScrape: () => void;
  refreshDownloads: () => Promise<void>;
  removeDownload: (id: string) => Promise<void>;
  handleBridge: (raw: string) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}

const MIN_REFRESH_MS = 20_000;
const POLL_MS = 120_000;

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [college, setCollege] = useState<College | null>(null);
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [scrape, setScrape] = useState<ScrapeData | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [downloads, setDownloads] = useState<DownloadMeta[]>([]);
  const [sessionVersion, setSessionVersion] = useState(0);
  const [probeMode, setProbeMode] = useState<'entry' | 'logout'>('entry');

  const probeRef = useRef<SessionProbeHandle>(null);
  const scrapeRef = useRef<ScrapeData | null>(null);
  const lastRefreshRef = useRef(0);

  const refreshDownloads = useCallback(async () => {
    setDownloads(await listDownloads());
  }, []);

  const refreshScrape = useCallback((force = false) => {
    const now = Date.now();
    if (!force && now - lastRefreshRef.current < MIN_REFRESH_MS) return;
    lastRefreshRef.current = now;
    probeRef.current?.reload();
  }, []);

  const onScrape = useCallback(
    (data: ScrapeData) => {
      const prev = scrapeRef.current;
      scrapeRef.current = data;
      setScrape(data);
      setLastUpdatedAt(Date.now());
      if (!notificationsOn || !prev) return;

      if (data.unreadMio != null) {
        setAppBadge(data.unreadMio);
        if (prev.unreadMio != null && data.unreadMio > prev.unreadMio) {
          const n = data.unreadMio;
          void notify(
            'Nouveaux messages MIO',
            `Vous avez ${n} message${n === 1 ? '' : 's'} non lu${n === 1 ? '' : 's'}.`
          );
        }
      }

      // Léa counters: new documents / assignments / etc.
      if (prev.leaStats && data.leaStats) {
        for (const stat of data.leaStats) {
          if (stat.badge == null) continue;
          const before = prev.leaStats.find((s) => s.key === stat.key)?.badge ?? 0;
          if (stat.badge > before) {
            void notify(
              `Nouveaux ${stat.label.toLowerCase()}`,
              `${stat.badge - before} élément${stat.badge - before === 1 ? '' : 's'} dans « ${stat.label} ».`
            );
          }
        }
      }

      // new grade posted
      if (prev.grades && data.grades) {
        const seen = new Set(prev.grades.map((g) => `${g.title}|${g.pct}`));
        const added = data.grades.filter((g) => !seen.has(`${g.title}|${g.pct}`));
        if (added.length > 0) {
          const g = added[0];
          void notify('Nouvelle note', `${g.title} : ${g.pct}`);
        }
      }
    },
    [notificationsOn]
  );

  const handleBridge = useCallback(
    (raw: string) => {
      dispatchBridge(raw, {
        onScrape,
        onNavigate: (section) => {
          const route = sectionRoute(section as SectionId);
          if (route) router.push(route);
        },
        onExternal: (url) => void WebBrowser.openBrowserAsync(url),
      });
    },
    [onScrape]
  );

  // hydrate persisted settings
  useEffect(() => {
    (async () => {
      try {
        const [collegeId, customHost, notifySetting] = await Promise.all([
          AsyncStorage.getItem(COLLEGE_KEY),
          AsyncStorage.getItem(CUSTOM_KEY),
          AsyncStorage.getItem(NOTIFY_KEY),
        ]);
        if (collegeId === 'custom' && customHost) {
          setCollege(collegeFromCustomHost(customHost));
        } else if (collegeId) {
          setCollege(COLLEGES.find((c) => c.id === collegeId) ?? null);
        }
        setNotificationsOn(notifySetting === '1');
        setDownloads(await listDownloads());
      } catch {
        /* start fresh */
      } finally {
        setHydrated(true);
        SplashScreen.hideAsync().catch(() => undefined);
      }
    })();
  }, []);

  // poll while the app is in use
  useEffect(() => {
    if (!college) return;
    const id = setInterval(() => refreshScrape(), POLL_MS);
    const sub = RNAppState.addEventListener('change', (state) => {
      if (state === 'active') refreshScrape();
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [college, refreshScrape]);

  useEffect(() => subscribeDownloads(() => void refreshDownloads()), [refreshDownloads]);

  const selectCollege = useCallback(async (next: College) => {
    await AsyncStorage.setItem(COLLEGE_KEY, next.id);
    if (next.id === 'custom') await AsyncStorage.setItem(CUSTOM_KEY, next.host);
    scrapeRef.current = null;
    setScrape(null);
    setProbeMode('entry');
    setSessionVersion((v) => v + 1);
    setCollege(next);
  }, []);

  const setCustomCollege = useCallback(
    (host: string) => selectCollege(collegeFromCustomHost(host)),
    [selectCollege]
  );

  const toggleNotifications = useCallback(async (enabled: boolean) => {
    setNotificationsOn(enabled);
    await AsyncStorage.setItem(NOTIFY_KEY, enabled ? '1' : '0');
  }, []);

  const signOut = useCallback(() => {
    if (!college) return;
    scrapeRef.current = null;
    setScrape(null);
    setSessionVersion((v) => v + 1);
    setProbeMode('logout');
  }, [college]);

  // once the logout landing page has loaded, go back to the normal entry URL
  const onProbeLoadEnd = useCallback(() => setProbeMode('entry'), []);

  const probeUrl = college
    ? probeMode === 'logout'
      ? logoutUrl(college.host)
      : entryUrl(college.host)
    : null;

  const value = useMemo<AppState>(
    () => ({
      hydrated,
      college,
      entryUrl: college ? entryUrl(college.host) : null,
      sessionVersion,
      scrape,
      lastUpdatedAt,
      unreadMio: scrape?.unreadMio ?? null,
      leaBadge: scrape?.leaStats?.find((s) => /document/i.test(s.label))?.badge ?? null,
      notificationsOn,
      downloads,
      selectCollege,
      setCustomCollege,
      toggleNotifications,
      signOut,
      refreshScrape: () => refreshScrape(true),
      refreshDownloads,
      removeDownload: deleteDownload,
      handleBridge,
    }),
    [
      hydrated,
      college,
      sessionVersion,
      scrape,
      lastUpdatedAt,
      notificationsOn,
      downloads,
      selectCollege,
      setCustomCollege,
      toggleNotifications,
      signOut,
      refreshScrape,
      refreshDownloads,
      handleBridge,
    ]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
      {probeUrl && (
        <SessionProbe
          key={`probe:${probeUrl}`}
          ref={probeRef}
          url={probeUrl}
          onMessage={handleBridge}
          onLoadEnd={onProbeLoadEnd}
        />
      )}
    </AppStateContext.Provider>
  );
}
