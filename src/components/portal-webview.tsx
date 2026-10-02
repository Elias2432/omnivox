import * as WebBrowser from 'expo-web-browser';
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';

import { useAppState } from '@/providers/app-state';
import { buildInjectedJavaScript } from '@/lib/injected';
import type { SectionId } from '@/lib/portals';
import { useTheme } from '@/hooks/use-theme';

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

export const PortalWebView = forwardRef<PortalWebViewHandle, Props>(function PortalWebView(
  { section, url, onNavState },
  ref
) {
  const { entryUrl, handleBridge, sessionVersion } = useAppState();
  const theme = useTheme();
  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navRef = useRef<NavState>({ canGoBack: false, canGoForward: false, url: '', loading: true });

  const report = useCallback(
    (patch: Partial<NavState>) => {
      navRef.current = { ...navRef.current, ...patch };
      onNavState?.(navRef.current);
    },
    [onNavState]
  );

  useImperativeHandle(
    ref,
    () => ({
      reload: () => {
        setError(null);
        setLoading(true);
        webRef.current?.reload();
      },
      goBack: () => webRef.current?.goBack(),
      goForward: () => webRef.current?.goForward(),
    }),
    []
  );

  if (!entryUrl && !url) return null;
  const source = url ?? entryUrl!;

  const onMessage = (e: WebViewMessageEvent) => handleBridge(e.nativeEvent.data);

  const onShouldStartLoadWithRequest = (req: { url: string }) => {
    if (!/^https?:/i.test(req.url)) return true;
    const portalHost = (entryUrl ?? source).replace(/^https?:\/\//i, '').split('/')[0];
    const reqHost = req.url.replace(/^https?:\/\//i, '').split('/')[0];
    if (reqHost !== portalHost && !reqHost.endsWith(`.${portalHost}`)) {
      void WebBrowser.openBrowserAsync(req.url);
      return false;
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        source={{ uri: source }}
        style={styles.web}
        key={`${source}:${section}:${sessionVersion}`}
        injectedJavaScript={buildInjectedJavaScript({ section, deep: false })}
        onMessage={onMessage}
        onLoadStart={() => {
          setError(null);
          setLoading(true);
          report({ loading: true });
        }}
        onLoadEnd={() => {
          setLoading(false);
          report({ loading: false });
        }}
        onNavigationStateChange={(nav: WebViewNavigation) =>
          report({
            canGoBack: nav.canGoBack,
            canGoForward: nav.canGoForward,
            url: nav.url,
            loading: nav.loading,
          })
        }
        onError={(e) => {
          setError(e.nativeEvent.description || 'Impossible de charger le portail');
          setLoading(false);
        }}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        sharedCookiesEnabled
        useSharedProcessPool
        thirdPartyCookiesEnabled
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures
        setSupportMultipleWindows={false}
      />
      {loading && !error && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={theme.textSecondary} />
        </View>
      )}
      {error && (
        <View style={[styles.errorOverlay, { backgroundColor: theme.background }]}>
          <Text style={[styles.errorTitle, { color: theme.text }]}>Impossible de charger le portail</Text>
          <Text style={[styles.errorBody, { color: theme.textSecondary }]}>{error}</Text>
          <Pressable
            onPress={() => {
              setError(null);
              setLoading(true);
              webRef.current?.reload();
            }}
            style={[styles.retry, { backgroundColor: theme.backgroundSelected }]}>
            <Text style={{ color: theme.text, fontWeight: '600' }}>Réessayer</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  web: { flex: 1, backgroundColor: 'transparent' },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  errorTitle: { fontSize: 18, fontWeight: '700' },
  errorBody: { fontSize: 14, textAlign: 'center' },
  retry: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
});
