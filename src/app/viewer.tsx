import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { FilePreview } from '@/components/file-preview';
import { useAppState } from '@/providers/app-state';
import { useTheme } from '@/hooks/use-theme';
import { formatBytes, isPreviewable } from '@/lib/downloads';

function ActionButton({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.action} hitSlop={6}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

export default function ViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { downloads, removeDownload } = useAppState();
  const theme = useTheme();
  const file = downloads.find((d) => d.id === id);

  if (!file) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Ce fichier n’est plus disponible.</Text>
      </View>
    );
  }

  const share = async () => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          dialogTitle: file.name,
          mimeType: file.mime || undefined,
        });
      }
    } catch {
      Alert.alert('Partage impossible', 'La feuille de partage n’est pas disponible pour le moment.');
    }
  };

  const confirmDelete = () => {
    Alert.alert('Supprimer le fichier ?', file.name, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          void removeDownload(file.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: file.name }} />
      {isPreviewable(file.name) ? (
        <FilePreview uri={file.uri} name={file.name} />
      ) : (
        <View style={styles.center}>
          <Ionicons name="document-outline" size={52} color={theme.textSecondary} />
          <Text style={[styles.centerTitle, { color: theme.text }]} numberOfLines={2}>
            {file.name}
          </Text>
          <Text style={[styles.centerBody, { color: theme.textSecondary }]}>
            {formatBytes(file.size)} · Ce type de fichier ne peut pas être prévisualisé ici. Touchez
            « Partager » pour l’ouvrir dans une autre application.
          </Text>
        </View>
      )}
      <View style={[styles.toolbar, { borderTopColor: theme.backgroundSelected }]}>
        <ActionButton icon="share-outline" label="Partager" color={theme.accent} onPress={() => void share()} />
        <ActionButton icon="trash-outline" label="Supprimer" color={theme.danger} onPress={confirmDelete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  centerTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  centerBody: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  action: { alignItems: 'center', gap: 4, paddingHorizontal: 24 },
  actionLabel: { fontSize: 12, fontWeight: '600' },
});
