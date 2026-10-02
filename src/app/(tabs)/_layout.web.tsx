import { Ionicons } from '@expo/vector-icons';
import { Tabs, TabList, TabSlot, TabTrigger, useTabTrigger } from 'expo-router/ui';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OX } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/providers/app-state';

type TabDef = {
  name: string;
  href: '/accueil' | '/mio' | '/lea' | '/services' | '/avis';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
};

const TABS: TabDef[] = [
  { name: 'accueil', href: '/accueil', label: 'Accueil', icon: 'home', iconOutline: 'home-outline' },
  { name: 'mio', href: '/mio', label: 'Mio', icon: 'mail', iconOutline: 'mail-outline' },
  { name: 'lea', href: '/lea', label: 'Léa', icon: 'book', iconOutline: 'book-outline' },
  { name: 'services', href: '/services', label: 'Services', icon: 'grid', iconOutline: 'grid-outline' },
  { name: 'avis', href: '/avis', label: 'Avis', icon: 'megaphone', iconOutline: 'megaphone-outline' },
];

function TabItem({
  def,
  badge,
}: {
  def: TabDef;
  badge: number | undefined;
}) {
  const theme = useTheme();
  const { triggerProps } = useTabTrigger({ name: def.name, href: def.href });
  const focused = triggerProps.isFocused;

  return (
    <View
      style={[
        styles.item,
        { backgroundColor: focused ? OX.activeTab : 'transparent' },
      ]}>
      <Ionicons
        name={focused ? def.icon : def.iconOutline}
        size={23}
        color={focused ? OX.link : theme.textSecondary}
      />
      <Text
        style={[
          styles.label,
          { color: theme.textSecondary },
          focused && styles.labelFocused,
        ]}>
        {def.label}
      </Text>
      {badge != null && badge > 0 ? (
        <View style={[styles.badge, { backgroundColor: OX.badge }]}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

/**
 * Web fallback for the native tab bar (PC visualiser only — iOS resolves
 * this file only on web platforms, `_layout.tsx` stays native). Headless
 * expo-router Tabs styled to match Omnivox's iOS bottom bar: white bar,
 * peach indicator, blue selected label, red count badges.
 */
export default function TabsLayoutWeb() {
  const theme = useTheme();
  const { unreadMio, leaBadge } = useAppState();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <Tabs style={styles.tabs}>
        <TabSlot style={styles.slot} />
        <TabList
          style={[
            styles.bar,
            {
              backgroundColor: theme.background,
              borderTopColor: theme.backgroundSelected,
            },
          ]}>
          {TABS.map((def) => (
            <TabTrigger key={def.name} name={def.name} href={def.href} style={styles.trigger}>
              <TabItem
                def={def}
                badge={
                  def.name === 'mio'
                    ? (unreadMio ?? undefined)
                    : def.name === 'lea'
                      ? (leaBadge ?? undefined)
                      : undefined
                }
              />
            </TabTrigger>
          ))}
        </TabList>
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { height: '100%', width: '100%' },
  tabs: { flex: 1, minHeight: 0 },
  slot: { flex: 1, minHeight: 0 },
  bar: {
    flexDirection: 'row',
    paddingTop: 6,
    paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  trigger: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    minWidth: 64,
  },
  label: { fontSize: 10, fontWeight: '500' },
  labelFocused: { color: OX.link, fontWeight: '600' },
  badge: {
    position: 'absolute',
    top: -2,
    right: 12,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
});
