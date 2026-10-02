import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { OX } from '@/constants/theme';

/** Orange Omnivox-style header used at the top of every native tab. */
export function OxHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSub}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.headerRight}>{right}</View> : null}
    </View>
  );
}

/** Full-width coloured section band (red "Quoi de neuf?", blue "Services Omnivox"...). */
export function SectionBand({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.band, { backgroundColor: color }]}>
      <Text style={styles.bandText}>{label}</Text>
    </View>
  );
}

/** Red pill badge (count of new items). */
export function CountBadge({ value }: { value?: number | null }) {
  if (value == null || value <= 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{value > 99 ? '99+' : String(value)}</Text>
    </View>
  );
}

export function IconButton({
  name,
  onPress,
  color = '#ffffff',
  size = 22,
}: {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  size?: number;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={styles.iconButton}>
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

/** Neutral placeholder shown while the probe fetches portal data. */
export function LoadingBlock({ label = 'Chargement du portail…' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <Ionicons name="hourglass-outline" size={28} color={OX.orange} />
      <Text style={styles.centerText}>{label}</Text>
    </View>
  );
}

/** Shown when the native parser produced nothing: open the real portal view instead. */
export function FallbackPrompt({
  text,
  actionLabel,
  onAction,
}: {
  text: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.centerText}>{text}</Text>
      <Pressable onPress={onAction} style={styles.fallbackButton}>
        <Text style={styles.fallbackButtonText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: OX.orange,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerText: { flex: 1, gap: 1 },
  headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  band: { paddingHorizontal: 16, paddingVertical: 9 },
  bandText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  badge: {
    backgroundColor: OX.badge,
    borderRadius: 11,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  iconButton: { padding: 2 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  centerText: { fontSize: 14, color: '#6B6B6B', textAlign: 'center', lineHeight: 20 },
  fallbackButton: {
    backgroundColor: OX.link,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  fallbackButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E3E3E3',
    overflow: 'hidden',
  },
});
