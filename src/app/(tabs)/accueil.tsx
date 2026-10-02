import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, CountBadge, IconButton, LoadingBlock, OxHeader, SectionBand } from '@/components/ox';
import { OX } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/providers/app-state';

const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

function todayLabel(): string {
  const d = new Date();
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
}

const EVENT_COLORS = [OX.orange, OX.bandBlue, OX.bandRed, '#7E57C2', '#00897B'];

export default function AccueilScreen() {
  const theme = useTheme();
  const { college, scrape, lastUpdatedAt, refreshScrape, unreadMio } = useAppState();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!refreshing) return;
    const t = setTimeout(() => setRefreshing(false), 2500);
    return () => clearTimeout(t);
  }, [refreshing]);

  if (!college) return <Redirect href="/onboarding" />;

  const schedule = scrape?.scheduleToday ?? null;
  const events = scrape?.events ?? null;
  const communities = scrape?.communities ?? null;
  const newsItems = scrape?.newsItems ?? null;
  const signedOut = scrape != null && !scrape.loggedIn;

  const openSchedule = () =>
    router.push({ pathname: '/webview', params: { section: 'schedule', title: 'Horaire' } });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              refreshScrape();
            }}
            tintColor={OX.orange}
          />
        }>
        <OxHeader
          title="Omnivox"
          subtitle={`${college.name} · ${todayLabel()}`}
          right={
            <>
              <IconButton name="settings-outline" onPress={() => router.push('/settings')} />
            </>
          }
        />

        {signedOut && (
          <Pressable
            onPress={() => router.push({ pathname: '/webview', params: { section: 'mio', title: 'Connexion' } })}
            style={[styles.banner, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="lock-closed-outline" size={18} color={OX.link} />
            <Text style={[styles.bannerText, { color: theme.text }]}>
              Vous êtes déconnecté. Ouvrez un onglet du portail pour vous connecter une fois — le reste
              de l’app se remplira ensuite.
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
          </Pressable>
        )}

        {events && events.length > 0 && (
          <View style={styles.block}>
            <Text style={[styles.blockTitle, { color: theme.text }]}>Événements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eventRow}>
              {events.map((ev, i) => (
                <Pressable key={`${ev.day}-${ev.title}-${i}`} onPress={openSchedule} style={[styles.eventCard, { backgroundColor: theme.backgroundElement }]}>
                  <View style={[styles.eventStrip, { backgroundColor: EVENT_COLORS[i % EVENT_COLORS.length] }]} />
                  <View style={styles.eventDate}>
                    <Text style={styles.eventDay}>{ev.day}</Text>
                    <Text style={styles.eventMonth}>{ev.month}</Text>
                  </View>
                  <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={3}>
                    {ev.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <Card style={{ marginHorizontal: 0 }}>
          <SectionBand label="Horaire du jour" color={OX.bandBlue} />
          <View style={styles.cardBody}>
            {schedule && schedule.length > 0 ? (
              schedule.map((item, i) => (
                <Pressable key={`${item.time}-${i}`} onPress={openSchedule} style={styles.scheduleRow}>
                  <Text style={[styles.scheduleTime, { color: OX.orange }]}>{item.time}</Text>
                  <View style={styles.scheduleCourse}>
                    <Text style={[styles.scheduleCourseText, { color: theme.text }]} numberOfLines={2}>
                      {item.course}
                    </Text>
                    {item.room ? (
                      <Text style={[styles.scheduleRoom, { color: theme.textSecondary }]}>Salle {item.room}</Text>
                    ) : null}
                  </View>
                </Pressable>
              ))
            ) : (
              <Pressable onPress={openSchedule} style={styles.emptyRow}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  {scrape
                    ? 'Aucun cours trouvé aujourd’hui — ouvrez l’horaire complet.'
                    : 'Attente des données du portail… tirez pour rafraîchir.'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
              </Pressable>
            )}
          </View>
        </Card>

        {communities && communities.length > 0 && (
          <View style={styles.block}>
            <Text style={[styles.blockTitle, { color: theme.text }]}>Communautés</Text>
            <View style={styles.commGrid}>
              {communities.map((c, i) => (
                <Card key={`${c.name}-${i}`} style={styles.commCard}>
                  <View style={styles.commIcon}>
                    <Ionicons name="people-outline" size={18} color={OX.link} />
                  </View>
                  <Text style={[styles.commName, { color: theme.text }]} numberOfLines={2}>
                    {c.name}
                  </Text>
                  <CountBadge value={c.badge} />
                </Card>
              ))}
            </View>
          </View>
        )}

        <Pressable onPress={() => router.push('/news')}>
          <Card style={{ marginHorizontal: 0 }}>
            <SectionBand label="Actualités" color={OX.bandRed} />
            <View style={styles.cardBody}>
              {newsItems && newsItems.length > 0 ? (
                newsItems.slice(0, 5).map((n, i) => (
                  <View key={`${n.title}-${i}`} style={styles.newsRow}>
                    <Text style={[styles.newsText, { color: theme.text }]} numberOfLines={2}>
                      {n.title}
                    </Text>
                    <Ionicons name="chevron-forward" size={15} color={theme.textSecondary} />
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: theme.textSecondary }]} numberOfLines={3}>
                  {scrape?.newsTitle ?? 'Les nouvelles de votre cégep et votre calendrier.'}
                </Text>
              )}
            </View>
          </Card>
        </Pressable>

        <View style={styles.quickRow}>
          {(
            [
              { label: 'Horaire', icon: 'calendar-outline', onPress: openSchedule },
              { label: 'Notes', icon: 'school-outline', onPress: () => router.push('/notes') },
              { label: 'Mio', icon: 'mail-outline', onPress: () => router.push('/mio') },
              { label: 'Léa', icon: 'book-outline', onPress: () => router.push('/lea') },
              { label: 'Fichiers', icon: 'folder-open-outline', onPress: () => router.push('/downloads') },
              { label: 'Réglages', icon: 'settings-outline', onPress: () => router.push('/settings') },
            ] as const
          ).map((tile) => (
            <Pressable
              key={tile.label}
              onPress={tile.onPress}
              style={({ pressed }) => [
                styles.tile,
                { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
              ]}>
              <Ionicons name={tile.icon} size={22} color={OX.orange} />
              <Text style={[styles.tileLabel, { color: theme.text }]}>{tile.label}</Text>
              {tile.label === 'Mio' && <CountBadge value={unreadMio} />}
            </Pressable>
          ))}
        </View>

        {!scrape && !signedOut && <LoadingBlock />}

        <Text style={[styles.disclaimer, { color: theme.textSecondary }]}>
          Application non officielle de {college.host} · Non affiliée à Skytech Communications.
          {lastUpdatedAt != null ? `\nDernière mise à jour : ${new Date(lastUpdatedAt).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}` : ''}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: 32, gap: 14 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
  },
  bannerText: { flex: 1, fontSize: 14, lineHeight: 19 },
  block: { paddingHorizontal: 16, gap: 8 },
  blockTitle: { fontSize: 17, fontWeight: '800' },
  eventRow: { gap: 10, paddingRight: 8 },
  eventCard: {
    width: 210,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E3E3E3',
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    overflow: 'hidden',
  },
  eventStrip: { width: 4, borderRadius: 2 },
  eventDate: { width: 44, alignItems: 'center' },
  eventDay: { fontSize: 20, fontWeight: '800', color: OX.orange },
  eventMonth: { fontSize: 11, fontWeight: '600', color: '#6B6B6B', textTransform: 'uppercase' },
  eventTitle: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  cardBody: { padding: 14, gap: 10 },
  scheduleRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  scheduleTime: { fontSize: 14, fontWeight: '700', width: 84 },
  scheduleCourse: { flex: 1, gap: 2 },
  scheduleCourseText: { fontSize: 15, fontWeight: '600' },
  scheduleRoom: { fontSize: 13 },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emptyText: { flex: 1, fontSize: 14, lineHeight: 20 },
  commGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  commCard: {
    width: '48%',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: OX.activeTab,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commName: { flex: 1, fontSize: 13, fontWeight: '600' },
  newsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  newsText: { flex: 1, fontSize: 14, lineHeight: 19 },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  tile: {
    width: '31%',
    aspectRatio: 1.1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tileLabel: { fontSize: 13, fontWeight: '600' },
  disclaimer: { fontSize: 11, textAlign: 'center', marginTop: 8, lineHeight: 16, paddingHorizontal: 24 },
});
