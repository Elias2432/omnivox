import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, LoadingBlock, OxHeader, SectionBand } from '@/components/ox';
import { PortalScreen } from '@/components/portal-screen';
import { OX } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/providers/app-state';

export default function ServicesScreen() {
  const theme = useTheme();
  const { college, scrape, refreshScrape } = useAppState();

  if (!college) return <Redirect href="/onboarding" />;

  const services = scrape?.services ?? null;
  const notices = scrape?.notices ?? null;
  const openServices = () =>
    router.push({ pathname: '/webview', params: { section: 'services', title: 'Services' } });

  if (!scrape) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
        <OxHeader title="Omnivox" subtitle="Services" />
        <LoadingBlock />
      </SafeAreaView>
    );
  }

  if (!scrape.loggedIn) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
        <OxHeader title="Omnivox" subtitle="Services" />
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={30} color={OX.orange} />
          <Text style={[styles.centerText, { color: theme.textSecondary }]}>
            Connectez-vous au portail pour voir vos services.
          </Text>
          <Pressable onPress={openServices} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Ouvrir le portail</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!services) {
    return <PortalScreen section="services" title="Services" hideTitle />;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => refreshScrape()} tintColor={OX.orange} />
        }>
        <OxHeader title="Omnivox" subtitle={`Services · ${college.name}`} />

        <SectionBand label="Quoi de neuf?" color={OX.bandRed} />
        <View style={styles.noticeWrap}>
          {notices && notices.length > 0 ? (
            notices.map((n, i) => (
              <Card key={`${i}-${n.slice(0, 20)}`} style={styles.noticeCard}>
                <Ionicons name="information-circle-outline" size={18} color={OX.bandRed} />
                <Text style={[styles.noticeText, { color: theme.text }]} numberOfLines={4}>
                  {n}
                </Text>
              </Card>
            ))
          ) : (
            <Card style={styles.noticeCard}>
              <Ionicons name="information-circle-outline" size={18} color={OX.bandRed} />
              <Text style={[styles.noticeText, { color: theme.textSecondary }]}>
                Consultez le portail pour les dernières informations.
              </Text>
            </Card>
          )}
        </View>

        <SectionBand label="Services Omnivox" color={OX.bandBlue} />
        <View style={styles.list}>
          {services.map((svc, i) => (
            <Pressable
              key={`${svc.label}-${i}`}
              disabled={!svc.enabled && !svc.href}
              onPress={() =>
                svc.href &&
                router.push({
                  pathname: '/webview',
                  params: { url: svc.href, section: 'services', title: svc.label },
                })
              }
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: pressed
                    ? theme.backgroundSelected
                    : svc.enabled
                      ? theme.backgroundElement
                      : theme.backgroundAlt,
                },
              ]}>
              <View style={styles.rowIcon}>
                <Ionicons
                  name={svc.enabled ? 'chevron-forward' : 'lock-closed'}
                  size={15}
                  color={svc.enabled ? OX.link : '#9E9E9E'}
                />
              </View>
              <View style={styles.rowText}>
                <Text
                  style={[
                    styles.rowLabel,
                    { color: svc.enabled ? theme.text : theme.textSecondary },
                  ]}>
                  {svc.label}
                </Text>
                {svc.sub ? (
                  <Text style={[styles.rowSub, { color: theme.textSecondary }]} numberOfLines={2}>
                    {svc.sub}
                  </Text>
                ) : !svc.enabled ? (
                  <Text style={[styles.rowSub, { color: theme.textSecondary }]}>
                    Présentement désactivé
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  centerText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  loginButton: {
    backgroundColor: OX.link,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  loginButtonText: { color: '#FFFFFF', fontWeight: '700' },
  noticeWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, gap: 10 },
  noticeCard: { flexDirection: 'row', gap: 10, padding: 14, alignItems: 'flex-start' },
  noticeText: { flex: 1, fontSize: 14, lineHeight: 19 },
  list: { paddingTop: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E3E3E3',
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: OX.activeTab,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 13, lineHeight: 17 },
});
