import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OxHeader } from '@/components/ox';
import { OX } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/providers/app-state';

const CHOICES = [
  { label: 'Très insatisfait', color: '#C0392B' },
  { label: 'Insatisfait', color: OX.orange },
  { label: 'Satisfait', color: OX.bandBlue },
  { label: 'Très satisfait', color: '#2E9E5B' },
];

export default function AvisScreen() {
  const theme = useTheme();
  const { college, entryUrl } = useAppState();

  if (!college) return <Redirect href="/onboarding" />;

  const openAvis = () =>
    router.push({ pathname: '/webview', params: { section: 'avis', title: 'Avis' } });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <OxHeader title="Avis" subtitle={college.name} />

        <View style={styles.body}>
          <View style={styles.bubble}>
            <Ionicons name="chatbubble-ellipses-outline" size={30} color={OX.orange} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Donnez-nous votre avis</Text>
          <Text style={[styles.sub, { color: theme.textSecondary }]}>
            Votre opinion nous aide à améliorer l’application. Le formulaire s’ouvre dans le portail
            officiel.
          </Text>

          <View style={styles.choices}>
            {CHOICES.map((c) => (
              <Pressable
                key={c.label}
                onPress={openAvis}
                style={({ pressed }) => [
                  styles.choice,
                  { backgroundColor: c.color, opacity: pressed ? 0.85 : 1 },
                ]}>
                <Text style={styles.choiceText}>{c.label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() =>
              entryUrl &&
              router.push({ pathname: '/webview', params: { url: entryUrl, section: 'portal', title: 'Mon dossier' } })
            }
            style={({ pressed }) => [
              styles.dossier,
              { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
            ]}>
            <View style={styles.dossierIcon}>
              <Ionicons name="person-outline" size={18} color={OX.link} />
            </View>
            <View style={styles.dossierText}>
              <Text style={[styles.dossierTitle, { color: theme.text }]}>Mon dossier</Text>
              <Text style={[styles.dossierSub, { color: theme.textSecondary }]}>
                Votre dossier étudiant sur le portail
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </Pressable>

          <Pressable
            onPress={() => entryUrl && void WebBrowser.openBrowserAsync(entryUrl)}
            style={styles.safariRow}>
            <Ionicons name="open-outline" size={15} color={OX.link} />
            <Text style={[styles.safariText, { color: OX.link }]}>Ouvrir le portail dans Safari</Text>
          </Pressable>

          <Text style={[styles.note, { color: theme.textSecondary }]}>
            Application non officielle · Non affiliée à Skytech Communications.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: 40 },
  body: { paddingHorizontal: 16, paddingTop: 24, alignItems: 'center', gap: 10 },
  bubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: OX.activeTab,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  sub: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 8 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 14 },
  choice: {
    width: '47%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  choiceText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  dossier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E3E3E3',
    padding: 14,
    marginTop: 18,
  },
  dossierIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: OX.activeTab,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dossierText: { flex: 1, gap: 2 },
  dossierTitle: { fontSize: 15, fontWeight: '700' },
  dossierSub: { fontSize: 13 },
  safariRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  safariText: { fontSize: 14, fontWeight: '600' },
  note: { fontSize: 11, textAlign: 'center', marginTop: 18, lineHeight: 16 },
});
