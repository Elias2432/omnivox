import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useAppState } from '@/providers/app-state';
import { useTheme } from '@/hooks/use-theme';
import { ensureNotificationSetup } from '@/lib/notifications';

export default function SettingsScreen() {
  const theme = useTheme();
  const { college, entryUrl, notificationsOn, toggleNotifications, signOut } = useAppState();

  const onToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const granted = await ensureNotificationSetup();
      if (!granted) {
        Alert.alert(
          'Notifications désactivées',
          'Autorisez les notifications dans les Réglages de votre iPhone pour être alerté des nouveaux messages Mio, notes et documents.'
        );
        return;
      }
    }
    await toggleNotifications(enabled);
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Se déconnecter ?',
      'Cela efface votre session de portail sur cet iPhone. Vous devrez vous reconnecter dans un onglet.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se déconnecter', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <ScrollView style={[styles.safe, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.section, { color: theme.textSecondary }]}>CÉGEP</Text>
      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.cardRow}>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{college?.name ?? 'Aucun cégep'}</Text>
            <Text style={[styles.cardSub, { color: theme.textSecondary }]}>{college?.host ?? ''}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/onboarding')}
            style={[styles.pill, { backgroundColor: theme.backgroundSelected }]}>
            <Text style={{ color: theme.text, fontWeight: '600', fontSize: 13 }}>Changer</Text>
          </Pressable>
        </View>
        {entryUrl && (
          <Pressable
            onPress={() => void WebBrowser.openBrowserAsync(entryUrl)}
            style={styles.linkRow}>
            <Ionicons name="open-outline" size={16} color={theme.accent} />
            <Text style={[styles.linkText, { color: theme.accent }]}>Ouvrir le portail dans Safari</Text>
          </Pressable>
        )}
      </View>

      <Text style={[styles.section, { color: theme.textSecondary }]}>NOTIFICATIONS</Text>
      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.cardRow}>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Alertes du portail</Text>
            <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
              Nouveaux Mio, notes, documents et travaux · alertes locales pendant l’utilisation
            </Text>
          </View>
          <Switch
            value={notificationsOn}
            onValueChange={(v) => void onToggleNotifications(v)}
            trackColor={{ true: theme.accent }}
          />
        </View>
      </View>

      <Text style={[styles.section, { color: theme.textSecondary }]}>SESSION</Text>
      <Pressable
        onPress={confirmSignOut}
        style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.cardRow}>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: theme.danger }]}>Se déconnecter du portail</Text>
            <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
              Efface la session partagée sur cet iPhone
            </Text>
          </View>
          <Ionicons name="log-out-outline" size={20} color={theme.danger} />
        </View>
      </Pressable>

      <Text style={[styles.section, { color: theme.textSecondary }]}>À PROPOS</Text>
      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <Text style={[styles.about, { color: theme.textSecondary }]}>
          Ceci est une application non officielle et indépendante qui enveloppe le portail web
          Omnivox de votre cégep. Elle n’est ni affiliée ni approuvée par Skytech Communications.
          Vos identifiants ne sont saisis que sur la page de connexion officielle du portail et ne
          sont jamais conservés par cette application.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  section: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 20, marginBottom: 8 },
  card: { borderRadius: 16, padding: 16, gap: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardText: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSub: { fontSize: 13, lineHeight: 18 },
  pill: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  linkText: { fontSize: 14, fontWeight: '600' },
  about: { fontSize: 13, lineHeight: 19 },
});
