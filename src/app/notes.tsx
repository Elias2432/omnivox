import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, LoadingBlock, SectionBand } from '@/components/ox';
import { PortalScreen } from '@/components/portal-screen';
import { OX } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/providers/app-state';

export default function NotesScreen() {
  const theme = useTheme();
  const { college, scrape, refreshScrape } = useAppState();

  if (!college) return <Redirect href="/onboarding" />;

  const grades = scrape?.grades ?? null;
  const openGrades = () =>
    router.push({ pathname: '/webview', params: { section: 'grades', title: 'Notes' } });

  if (!scrape) {
    return (
      <View style={[styles.safe, { backgroundColor: theme.background }]}>
        <LoadingBlock />
      </View>
    );
  }

  if (!scrape.loggedIn) {
    return (
      <View style={[styles.safe, { backgroundColor: theme.background }]}>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={30} color={OX.orange} />
          <Text style={[styles.centerText, { color: theme.textSecondary }]}>
            Connectez-vous au portail pour voir vos notes.
          </Text>
          <Pressable onPress={openGrades} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Ouvrir le portail</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!grades) {
    return <PortalScreen section="grades" title="Notes" hideTitle />;
  }

  const pcts = grades
    .map((g) => parseInt(g.pct, 10))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 100);
  const overall = pcts.length
    ? `${Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)}%`
    : '—';

  return (
    <ScrollView
      style={[styles.safe, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={() => refreshScrape()} tintColor={OX.orange} />
      }>
      <Pressable
        onPress={openGrades}
        style={({ pressed }) => [
          styles.sessionRow,
          { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
        ]}>
        <Text style={[styles.sessionLabel, { color: theme.textSecondary }]}>Session</Text>
        <Text style={[styles.sessionValue, { color: theme.text }]}>
          {scrape.leaSession ?? '—'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
      </Pressable>

      <Card style={styles.overallCard}>
        <SectionBand label="Résultats" color={OX.bandBlue} />
        <View style={styles.overallBody}>
          <Text style={[styles.overallPct, { color: OX.link }]}>{overall}</Text>
          <View style={styles.overallMeta}>
            <Text style={[styles.overallLabel, { color: theme.text }]}>note finale</Text>
            <Text style={[styles.overallSub, { color: theme.textSecondary }]}>
              {grades.length} évaluation{grades.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </Card>

      {grades.map((g, i) => (
        <Card key={`${g.title}-${i}`} style={styles.gradeCard}>
          <View style={styles.gradeTop}>
            <Text
              style={[
                styles.gradeTitle,
                { color: g.color ?? OX.link, fontWeight: '700' },
              ]}
              numberOfLines={2}>
              {g.title}
            </Text>
            <Text style={[styles.gradePct, { color: theme.text }]}>{g.pct}</Text>
          </View>
          <View style={styles.gradeMeta}>
            {g.courseCode ? (
              <Text style={[styles.gradeCode, { color: theme.textSecondary }]}>{g.courseCode}</Text>
            ) : null}
            <View style={styles.gradeSpacer} />
            {g.groupAvg ? (
              <Text style={[styles.gradeAvg, { color: theme.textSecondary }]}>
                Moy. finale du groupe : {g.groupAvg}
              </Text>
            ) : null}
          </View>
        </Card>
      ))}

      <Pressable onPress={openGrades} style={styles.openPortalRow}>
        <Ionicons name="open-outline" size={15} color={OX.link} />
        <Text style={[styles.openPortalText, { color: OX.link }]}>Ouvrir le bulletin complet</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  centerText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  loginButton: {
    backgroundColor: OX.link,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  loginButtonText: { color: '#FFFFFF', fontWeight: '700' },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E3E3E3',
    padding: 14,
  },
  sessionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  sessionValue: { flex: 1, fontSize: 15, fontWeight: '700' },
  overallCard: {},
  overallBody: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  overallPct: { fontSize: 46, fontWeight: '800' },
  overallMeta: { gap: 2 },
  overallLabel: { fontSize: 16, fontWeight: '700' },
  overallSub: { fontSize: 13 },
  gradeCard: { padding: 14, gap: 8 },
  gradeTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  gradeTitle: { flex: 1, fontSize: 15, lineHeight: 20 },
  gradePct: { fontSize: 20, fontWeight: '800' },
  gradeMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  gradeSpacer: { flex: 1 },
  gradeCode: { fontSize: 12, fontWeight: '600' },
  gradeAvg: { fontSize: 12 },
  openPortalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  openPortalText: { fontSize: 14, fontWeight: '700' },
});
