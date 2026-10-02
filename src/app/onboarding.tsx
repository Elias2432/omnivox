import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppState } from '@/providers/app-state';
import { useTheme } from '@/hooks/use-theme';
import { COLLEGES, type College } from '@/lib/portals';

export default function Onboarding() {
  const theme = useTheme();
  const { selectCollege } = useAppState();
  const [custom, setCustom] = useState('');
  const [busy, setBusy] = useState(false);

  const choose = async (college: College) => {
    if (busy) return;
    setBusy(true);
    try {
      await selectCollege(college);
      router.replace('/accueil');
    } finally {
      setBusy(false);
    }
  };

  const chooseCustom = async () => {
    const host = custom.trim();
    if (!host.includes('.')) {
      Alert.alert(
        'Portail invalide',
        'Entrez une adresse de portail du type moncégep.omnivox.ca'
      );
      return;
    }
    await choose({ id: 'custom', name: host, host });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={[styles.logo, { backgroundColor: theme.accent }]}>
          <Ionicons name="school" size={28} color="#ffffff" />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Omnivox</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Choisissez votre cégep pour vous connecter à son portail étudiant
        </Text>
      </View>
      <FlatList
        data={COLLEGES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => void choose(item)}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
            ]}>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.rowHost, { color: theme.textSecondary }]}>{item.host}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </Pressable>
        )}
        ListFooterComponent={
          <View style={styles.custom}>
            <Text style={[styles.customLabel, { color: theme.textSecondary }]}>
              Votre cégep n’est pas dans la liste?
            </Text>
            <View style={styles.customRow}>
              <TextInput
                value={custom}
                onChangeText={setCustom}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                placeholder="mycegep.omnivox.ca"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                ]}
              />
              <Pressable
                onPress={() => void chooseCustom()}
                style={[styles.customButton, { backgroundColor: theme.accent }]}>
                <Text style={styles.customButtonText}>OK</Text>
              </Pressable>
            </View>
          </View>
        }
      />
      <Text style={[styles.note, { color: theme.textSecondary }]}>
        Application non officielle · Non affiliée à Skytech Communications.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { alignItems: 'center', paddingTop: 24, paddingBottom: 16, gap: 8 },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 30, fontWeight: '800' },
  subtitle: { fontSize: 15, textAlign: 'center', paddingHorizontal: 32 },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  rowText: { gap: 2, flexShrink: 1 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowHost: { fontSize: 13 },
  custom: { marginTop: 16, gap: 8 },
  customLabel: { fontSize: 14, fontWeight: '600' },
  customRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  customButton: {
    borderRadius: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  note: { textAlign: 'center', fontSize: 12, paddingBottom: 12 },
});
