import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CountBadge, LoadingBlock, OxHeader } from '@/components/ox';
import { PortalScreen } from '@/components/portal-screen';
import { OX } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/providers/app-state';

const LEA_ORDER = [
  'communiqués',
  'communiqués',
  'documents',
  'travaux',
  'notes',
  'événement',
  'évènement',
  'enseignants',
  'sites web',
  'absences',
  'forum',
  'classe à distance',
];

export default function LeaScreen() {
  const theme = useTheme();
  const { college, scrape, refreshScrape } = useAppState();

  if (!college) return <Redirect href="/onboarding" />;

  const stats = scrape?.leaStats ?? null;
  const openLea = () =>
    router.push({ pathname: '/webview', params: { section: 'lea', title: 'Léa' } });

  if (!scrape) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
        <OxHeader title="Léa" subtitle="Votre espace d’apprentissage" />
        <LoadingBlock />
      </SafeAreaView>
    );
  }

  if (!scrape.loggedIn) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
        <OxHeader title="Léa" subtitle="Votre espace d’apprentissage" />
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={30} color={OX.orange} />
          <Text style={[styles.centerText, { color: theme.textSecondary }]}>
            Connectez-vous au portail pour consulter Léa.
          </Text>
          <Pressable onPress={openLea} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Ouvrir le portail</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return <PortalScreen section="lea" title="Léa" hideTitle />;
  }

  const ordered = [...stats].sort(
    (a, b) => LEA_ORDER.indexOf(a.key) - LEA_ORDER.indexOf(b.key)
  );

  const pressStat = (href: string | undefined, key: string) => {
    if (key === 'notes') {
      router.push('/notes');
      return;
    }
    if (href) {
      router.push({ pathname: '/webview', params: { url: href, section: 'lea', title: 'Léa' } });
    } else {
      openLea();
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => refreshScrape()}
            tintColor={OX.orange}
          />
        }>
        <OxHeader
          title="LÉA"
          subtitle={college.name}
          right={
            <>
              <View style={styles.leaLogo}>
                <View style={[styles.leaDot, { backgroundColor: '#FFC107' }]} />
                <View style={[styles.leaDot, { backgroundColor: '#4CAF50' }]} />
                <View style={[styles.leaDot, { backgroundColor: '#2196F3' }]} />
              </View>
            </>
          }
        />

        <View style={styles.selectors}>
          <Pressable
            onPress={openLea}
            style={({ pressed }) => [
              styles.selector,
              { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
            ]}>
            <Text style={[styles.selectorLabel, { color: theme.textSecondary }]}>Session</Text>
            <Text style={[styles.selectorValue, { color: theme.text }]}>
              {scrape.leaSession ?? '—'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
          </Pressable>
          <Pressable
            onPress={openLea}
            style={({ pressed }) => [
              styles.selector,
              { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
            ]}>
            <Text style={[styles.selectorLabel, { color: theme.textSecondary }]}>Classes</Text>
            <Text style={[styles.selectorValue, { color: theme.text }]} numberOfLines={1}>
              {scrape.leaClasses ?? 'Tous vos cours'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.grid}>
          {ordered.map((stat) => (
            <Pressable
              key={stat.key + (stat.label ?? '')}
              onPress={() => pressStat(stat.href, stat.key)}
              style={({ pressed }) => [
                styles.cell,
                {
                  backgroundColor: pressed ? OX.activeTab : theme.backgroundElement,
                  borderColor: '#E3E3E3',
                },
              ]}>
              <Text style={[styles.cellLabel, { color: theme.textSecondary }]} numberOfLines={2}>
                {stat.label}
              </Text>
              <View style={styles.cellValueRow}>
                <Text style={[styles.cellValue, { color: OX.link }]}>{stat.value}</Text>
                <CountBadge value={stat.badge} />
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.note, { color: theme.textSecondary }]}>
          Touchez une tuile pour l’ouvrir dans le portail.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: 32, gap: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  centerText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  loginButton: {
    backgroundColor: OX.link,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  loginButtonText: { color: '#FFFFFF', fontWeight: '700' },
  leaLogo: {
    flexDirection: 'row',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  leaDot: { width: 10, height: 10, borderRadius: 5 },
  selectors: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
  selector: {
    flex: 1,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E3E3E3',
    padding: 12,
    gap: 2,
  },
  selectorLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  selectorValue: { fontSize: 15, fontWeight: '700' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
  },
  cell: {
    width: '48%',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 6,
    minHeight: 84,
    justifyContent: 'space-between',
  },
  cellLabel: { fontSize: 13, fontWeight: '600' },
  cellValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  cellValue: { fontSize: 30, fontWeight: '800', lineHeight: 32 },
  note: { fontSize: 12, textAlign: 'center', paddingHorizontal: 24 },
});
