import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OX } from '@/constants/theme';
import { useAppState } from '@/providers/app-state';
import { useTheme } from '@/hooks/use-theme';
import type { SectionId } from '@/lib/portals';

export type PortalWebViewHandle = {
  reload: () => void;
  goBack: () => void;
  goForward: () => void;
};

export type NavState = {
  canGoBack: boolean;
  canGoForward: boolean;
  url: string;
  loading: boolean;
};

type Props = {
  section: SectionId;
  url?: string;
  onNavState?: (state: NavState) => void;
};

/**
 * Web stand-in for the native portal WebView (PC visualiser only). The real
 * portal cannot be rendered in a browser iframe (no WebView, CORS, and the
 * college portal blocks framing), so this shows a native-styled placeholder
 * while keeping the exact same handle/nav-state contract for PortalScreen.
 */
export const PortalWebView = forwardRef<PortalWebViewHandle, Props>(function PortalWebView(
  { section, url, onNavState },
  ref
) {
  const { entryUrl } = useAppState();
  const theme = useTheme();
  const navRef = useRef<NavState>({ canGoBack: false, canGoForward: false, url: '', loading: false });

  useImperativeHandle(
    ref,
    () => ({
      reload: () => {},
      goBack: () => {},
      goForward: () => {},
    }),
    []
  );

  const source = url ?? entryUrl ?? '';

  useEffect(() => {
    if (!source) return;
    navRef.current = { canGoBack: false, canGoForward: false, url: source, loading: false };
    onNavState?.(navRef.current);
  }, [source, onNavState]);

  if (!entryUrl && !url) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
        <Ionicons name="globe-outline" size={44} color={OX.orange} />
        <Text style={[styles.title, { color: theme.text }]}>
          Portail {section === 'mio' ? 'Mio' : section === 'lea' ? 'Léa' : 'Vitrine'}
        </Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          L’affichage réel du portail (WebKit) est réservé à l’iPhone. Cet aperçu PC ne présente que
          l’interface native, alimentée par des données de démonstration.
        </Text>
        {source ? (
          <Text numberOfLines={1} style={[styles.url, { color: theme.textSecondary }]}>
            {source}
          </Text>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    padding: 28,
    gap: 10,
  },
  title: { fontSize: 18, fontWeight: '700' },
  body: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  url: { fontSize: 11, maxWidth: '100%' },
});
