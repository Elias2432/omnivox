import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Props = { uri: string; name?: string };

/**
 * Web stand-in for the native file preview (PC visualiser only): browser
 * WebViews cannot load file:// URIs, so show a placeholder instead.
 */
export function FilePreview({ name }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <Ionicons name="document-outline" size={52} color={theme.textSecondary} />
      <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
        {name ?? 'Document'}
      </Text>
      <Text style={[styles.body, { color: theme.textSecondary }]}>
        La prévisualisation du document s’affiche sur l’iPhone.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  title: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  body: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
