import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

type Props = { uri: string; name?: string };

export function FilePreview({ uri }: Props) {
  return (
    <WebView
      source={{ uri }}
      style={styles.preview}
      originWhitelist={['file://*']}
      allowingReadAccessToURL={uri.slice(0, uri.lastIndexOf('/'))}
    />
  );
}

const styles = StyleSheet.create({
  preview: { flex: 1, backgroundColor: '#ffffff' },
});
