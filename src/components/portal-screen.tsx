import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PortalWebView, type NavState, type PortalWebViewHandle } from '@/components/portal-webview';
import { useAppState } from '@/providers/app-state';
import { useTheme } from '@/hooks/use-theme';
import type { SectionId } from '@/lib/portals';

type Props = {
  section: SectionId;
  title: string;
  /** Hide the in-screen title bar (stack screens already have a native header). */
  hideTitle?: boolean;
  url?: string;
};

function IconButton({
  name,
  onPress,
  disabled,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  color: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={[styles.button, disabled && styles.buttonDisabled]}>
      <Ionicons name={name} size={22} color={color} />
    </Pressable>
  );
}

export function PortalScreen({ section, title, hideTitle, url }: Props) {
  const theme = useTheme();
  const { entryUrl } = useAppState();
  const webRef = useRef<PortalWebViewHandle>(null);
  const [nav, setNav] = useState<NavState>({ canGoBack: false, canGoForward: false, url: '', loading: false });

  const currentUrl = nav.url || url || entryUrl || '';

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.bar, { borderBottomColor: theme.backgroundSelected }]}>
        {!hideTitle && (
          <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>
            {title}
          </Text>
        )}
        <View style={styles.actions}>
          {nav.loading && <ActivityIndicator size="small" color={theme.textSecondary} />}
          <IconButton
            name="chevron-back"
            color={theme.text}
            disabled={!nav.canGoBack}
            onPress={() => webRef.current?.goBack()}
          />
          <IconButton
            name="chevron-forward"
            color={theme.text}
            disabled={!nav.canGoForward}
            onPress={() => webRef.current?.goForward()}
          />
          <IconButton name="refresh" color={theme.text} onPress={() => webRef.current?.reload()} />
          <IconButton
            name="open-outline"
            color={theme.text}
            disabled={!currentUrl}
            onPress={() => void WebBrowser.openBrowserAsync(currentUrl)}
          />
        </View>
      </View>
      <PortalWebView
        ref={webRef}
        section={section}
        url={url}
        onNavState={setNav}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  title: { fontSize: 17, fontWeight: '700', flexShrink: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  button: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 },
  buttonDisabled: { opacity: 0.3 },
});
