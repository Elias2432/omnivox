import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { buildInjectedJavaScript } from '@/lib/injected';

export type SessionProbeHandle = { reload: () => void };

type Props = {
  url: string;
  onMessage: (raw: string) => void;
  onLoadEnd?: () => void;
};

/**
 * A nearly invisible WebView that shares the portal cookie pool. It loads the
 * portal home, runs the deep scraping script (same-origin fetches of the MIO
 * inbox, Léa grid, grades, services and schedule pages) and reports back to
 * the app. It also performs the periodic refresh used for badges and local
 * notifications.
 */
export const SessionProbe = forwardRef<SessionProbeHandle, Props>(function SessionProbe(
  { url, onMessage, onLoadEnd },
  ref
) {
  const webRef = useRef<WebView>(null);

  useImperativeHandle(ref, () => ({
    reload: () => webRef.current?.reload(),
  }));

  return (
    <View style={styles.host} pointerEvents="none">
      <WebView
        ref={webRef}
        source={{ uri: url }}
        style={styles.web}
        injectedJavaScript={buildInjectedJavaScript({ section: 'portal', deep: true })}
        onMessage={(e: WebViewMessageEvent) => onMessage(e.nativeEvent.data)}
        onLoadEnd={onLoadEnd}
        sharedCookiesEnabled
        useSharedProcessPool
        thirdPartyCookiesEnabled
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 2,
    height: 2,
    opacity: 0.01,
    zIndex: -1,
  },
  web: {
    backgroundColor: 'transparent',
  },
});
