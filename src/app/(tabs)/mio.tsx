import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingBlock, OxHeader } from '@/components/ox';
import { PortalScreen } from '@/components/portal-screen';
import { OX } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/providers/app-state';

function initialsOf(name: string): string {
  const parts = name.replace(/\s+/g, ' ').trim().split(' ');
  if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() ?? '?';
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

const AVATAR_COLORS = [OX.link, '#7E57C2', '#00897B', OX.orangeDark, '#546E7A'];

export default function MioScreen() {
  const theme = useTheme();
  const { college, scrape, refreshScrape } = useAppState();
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const messages = scrape?.mioMessages ?? null;
  const filtered = useMemo(() => {
    if (!messages) return null;
    const q = query.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        m.sender.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.preview.toLowerCase().includes(q)
    );
  }, [messages, query]);

  if (!college) return <Redirect href="/onboarding" />;

  const openInbox = () =>
    router.push({ pathname: '/webview', params: { section: 'mio', title: 'Mio' } });

  // no portal data yet: show the loading state (the probe is fetching)
  if (!scrape) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
        <OxHeader title="Réception" subtitle="Mio" />
        <LoadingBlock />
      </SafeAreaView>
    );
  }

  if (!scrape.loggedIn) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
        <OxHeader title="Réception" subtitle="Mio" />
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={30} color={OX.orange} />
          <Text style={[styles.centerText, { color: theme.textSecondary }]}>
            Connectez-vous au portail pour lire vos messages Mio.
          </Text>
          <Pressable onPress={openInbox} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Ouvrir le portail</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // native parse failed -> real portal view (identical to the official app's content)
  if (!messages || !filtered) {
    return <PortalScreen section="mio" title="Mio" hideTitle />;
  }

  const unread = messages.filter((m) => m.unread).length;

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
              setTimeout(() => setRefreshing(false), 2500);
            }}
            tintColor={OX.orange}
          />
        }>
        <OxHeader title={`Réception (${messages.length})`} subtitle={unread > 0 ? `${unread} non lus` : 'Mio'} />

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color="#8A8A8E" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un message"
            placeholderTextColor="#8A8A8E"
            style={[styles.search, { color: theme.text, backgroundColor: theme.backgroundAlt }]}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>

        <Pressable
          onPress={openInbox}
          style={({ pressed }) => [
            styles.categorizedRow,
            { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
          ]}>
          <Ionicons name="pricetags-outline" size={17} color={OX.link} />
          <Text style={[styles.categorizedText, { color: theme.text }]}>Afficher les Mio catégorisés</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
        </Pressable>

        {filtered.length === 0 && (
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            {query ? 'Aucun message trouvé.' : 'Votre boîte de réception est vide.'}
          </Text>
        )}

        {filtered.map((m, i) => {
          const color = AVATAR_COLORS[(m.sender.charCodeAt(0) + i) % AVATAR_COLORS.length];
          return (
            <Pressable
              key={`${m.href}-${i}`}
              onPress={() =>
                router.push({ pathname: '/webview', params: { url: m.href, section: 'mio', title: 'Mio' } })
              }
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: pressed
                    ? theme.backgroundSelected
                    : m.unread
                      ? OX.activeTab
                      : theme.backgroundElement,
                },
              ]}>
              <View style={[styles.avatar, { backgroundColor: color }]}>
                <Text style={styles.avatarText}>{initialsOf(m.sender)}</Text>
              </View>
              <View style={styles.rowBody}>
                <View style={styles.rowTop}>
                  <Text
                    style={[
                      styles.sender,
                      { color: theme.text },
                      m.unread ? styles.strong : undefined,
                    ]}
                    numberOfLines={1}>
                    {m.sender || '—'}
                  </Text>
                  <Text style={[styles.date, { color: theme.textSecondary }]} numberOfLines={1}>
                    {m.date}
                  </Text>
                </View>
                <Text
                  style={[styles.subject, { color: theme.text }, m.unread ? styles.strong : undefined]}
                  numberOfLines={1}>
                  {m.subject}
                </Text>
                <Text style={[styles.preview, { color: theme.textSecondary }]} numberOfLines={2}>
                  {m.preview}
                </Text>
              </View>
              {m.unread && <View style={styles.dot} />}
            </Pressable>
          );
        })}
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  search: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  categorizedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  categorizedText: { flex: 1, fontSize: 14, fontWeight: '600' },
  empty: { textAlign: 'center', padding: 28, fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E3E3E3',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  rowBody: { flex: 1, gap: 2 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  sender: { flex: 1, fontSize: 15, fontWeight: '600' },
  strong: { fontWeight: '800' },
  date: { fontSize: 12 },
  subject: { fontSize: 14, fontWeight: '600' },
  preview: { fontSize: 13, lineHeight: 17 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: OX.link,
    marginLeft: 4,
  },
});
