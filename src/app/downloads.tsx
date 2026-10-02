import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppState } from '@/providers/app-state';
import { useTheme } from '@/hooks/use-theme';
import { formatBytes, type DownloadMeta } from '@/lib/downloads';

function fileIcon(name: string): keyof typeof Ionicons.glyphMap {
  if (/\.pdf$/i.test(name)) return 'document-text';
  if (/\.(png|jpe?g|gif)$/i.test(name)) return 'image';
  if (/\.(zip|rar)$/i.test(name)) return 'archive';
  return 'document';
}

function dateLabel(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes()
  ).padStart(2, '0')}`;
}

export default function DownloadsScreen() {
  const theme = useTheme();
  const { downloads, removeDownload } = useAppState();

  const confirmDelete = (item: DownloadMeta) => {
    Alert.alert('Supprimer le fichier ?', item.name, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => void removeDownload(item.id) },
    ]);
  };

  return (
    <View style={[styles.safe, { backgroundColor: theme.background }]}>
      <FlatList
        data={downloads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="folder-open-outline" size={44} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucun téléchargement</Text>
            <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>
              Touchez un lien PDF ou fichier dans un onglet du portail : il sera enregistré ici pour
              une consultation hors ligne.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/viewer', params: { id: item.id } })}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
            ]}>
            <View style={[styles.icon, { backgroundColor: theme.background }]}>
              <Ionicons name={fileIcon(item.name)} size={20} color={theme.accent} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowName, { color: theme.text }]} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={[styles.rowMeta, { color: theme.textSecondary }]}>
                {formatBytes(item.size)} · {dateLabel(item.date)}
              </Text>
            </View>
            <Pressable onPress={() => confirmDelete(item)} hitSlop={8} style={styles.trash}>
              <Ionicons name="trash-outline" size={20} color={theme.danger} />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: 16, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 12 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowName: { fontSize: 15, fontWeight: '600' },
  rowMeta: { fontSize: 12 },
  trash: { padding: 6 },
  empty: { alignItems: 'center', paddingTop: 64, gap: 8, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyBody: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
