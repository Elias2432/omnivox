import { useLocalSearchParams } from 'expo-router';

import { PortalScreen } from '@/components/portal-screen';
import type { SectionId } from '@/lib/portals';

/**
 * Generic portal viewer: any deep link (schedule, a MIO message, a Léa document,
 * a service page, ...) renders here with its own URL and the section context
 * used to route further taps.
 */
export default function WebViewRoute() {
  const params = useLocalSearchParams<{ url?: string; section?: SectionId; title?: string }>();
  const section = (params.section ?? 'portal') as SectionId;
  const url = typeof params.url === 'string' && params.url ? params.url : undefined;
  const title = typeof params.title === 'string' && params.title ? params.title : 'Portail';

  return <PortalScreen section={section} title={title} url={url} />;
}
