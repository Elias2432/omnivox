import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { OX } from '@/constants/theme';
import { useAppState } from '@/providers/app-state';

export default function TabsLayout() {
  const { unreadMio, leaBadge } = useAppState();
  const mioBadge = unreadMio != null && unreadMio > 0 ? String(unreadMio) : undefined;
  const leaCount = leaBadge != null && leaBadge > 0 ? String(leaBadge) : undefined;

  return (
    <NativeTabs
      tintColor={OX.link}
      backgroundColor="#FFFFFF"
      indicatorColor={OX.activeTab}
      labelStyle={{ selected: { color: OX.link, fontWeight: '600' } }}>
      <NativeTabs.Trigger name="accueil">
        <NativeTabs.Trigger.Label>Accueil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="mio">
        <NativeTabs.Trigger.Label>Mio</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="envelope.fill" md="mail" />
        {mioBadge && <NativeTabs.Trigger.Badge>{mioBadge}</NativeTabs.Trigger.Badge>}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="lea">
        <NativeTabs.Trigger.Label>Léa</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book.fill" md="menu_book" />
        {leaCount && <NativeTabs.Trigger.Badge>{leaCount}</NativeTabs.Trigger.Badge>}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="services">
        <NativeTabs.Trigger.Label>Services</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="square.grid.2x2.fill" md="apps" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="avis">
        <NativeTabs.Trigger.Label>Avis</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="megaphone.fill" md="campaign" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
