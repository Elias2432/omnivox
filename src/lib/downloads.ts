import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { Alert } from 'react-native';

import type { BridgeMessage } from '@/lib/bridge';

export type DownloadMeta = {
  id: string;
  name: string;
  uri: string;
  size: number;
  mime: string;
  url: string;
  date: number;
};

const INDEX_KEY = 'omnivox.downloads.v1';

type Pending = {
  name: string;
  mime: string;
  url: string;
  chunks: string[];
  total: number;
};

const pending = new Map<string, Pending>();
const listeners = new Set<() => void>();

export function subscribeDownloads(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(): void {
  for (const fn of listeners) fn();
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, '');
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let buffer = 0;
  let bits = 0;
  let written = 0;
  for (let i = 0; i < clean.length; i++) {
    buffer = (buffer << 6) | B64.indexOf(clean[i]);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[written++] = (buffer >> bits) & 0xff;
      buffer &= (1 << bits) - 1;
    }
  }
  return out.subarray(0, written);
}

function downloadsDirectory(): Directory {
  const dir = new Directory(Paths.document, 'downloads');
  if (!dir.exists) dir.create();
  return dir;
}

function safeName(dir: Directory, name: string): string {
  const clean = name.replace(/[\\/:*?"<>|]+/g, '_').slice(0, 120) || 'download';
  let candidate = clean;
  let dot = candidate.lastIndexOf('.');
  let stem = dot > 0 ? candidate.slice(0, dot) : candidate;
  const ext = dot > 0 ? candidate.slice(dot) : '';
  let n = 1;
  while (new File(dir, candidate).exists) {
    candidate = `${stem} (${n})${ext}`;
    n++;
  }
  return candidate;
}

export async function listDownloads(): Promise<DownloadMeta[]> {
  try {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DownloadMeta[];
    return parsed.sort((a, b) => b.date - a.date);
  } catch {
    return [];
  }
}

async function saveIndex(items: DownloadMeta[]): Promise<void> {
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(items));
}

async function commit(p: Pending, id: string, chunks: string[]): Promise<void> {
  const bytes = base64ToBytes(chunks.join(''));
  const dir = downloadsDirectory();
  const name = safeName(dir, p.name);
  const file = new File(dir, name);
  file.write(bytes);
  const meta: DownloadMeta = {
    id,
    name,
    uri: file.uri,
    size: bytes.length,
    mime: p.mime,
    url: p.url,
    date: Date.now(),
  };
  const items = await listDownloads();
  items.unshift(meta);
  await saveIndex(items);
  emit();
}

export async function deleteDownload(id: string): Promise<void> {
  const items = await listDownloads();
  const found = items.find((i) => i.id === id);
  if (found) {
    try {
      const file = new File(found.uri);
      if (file.exists) file.delete();
    } catch {
      /* already gone */
    }
  }
  await saveIndex(items.filter((i) => i.id !== id));
  emit();
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function isPreviewable(name: string): boolean {
  return /\.(pdf|png|jpe?g|gif|txt|html?)$/i.test(name);
}

/** Returns true when the message belonged to a download flow. */
export function handleDownloadMessage(msg: BridgeMessage): boolean {
  switch (msg.type) {
    case 'downloadStart': {
      pending.set(msg.id, { name: msg.name, mime: msg.mime, url: msg.url, chunks: [], total: 0 });
      return true;
    }
    case 'downloadChunk': {
      const p = pending.get(msg.id);
      if (!p) return true;
      p.total = msg.total;
      p.chunks[msg.index] = msg.data;
      return true;
    }
    case 'downloadEnd': {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (!p) return true;
      let incomplete = p.chunks.length < p.total;
      for (let i = 0; i < p.total && !incomplete; i++) {
        if (typeof p.chunks[i] !== 'string') incomplete = true;
      }
      if (incomplete) {
        Alert.alert('Download failed', 'The file transfer was incomplete. Please try again.');
        return true;
      }
      commit(p, msg.id, p.chunks as string[]).catch((err: unknown) => {
        Alert.alert('Download failed', String(err));
      });
      return true;
    }
    case 'downloadError': {
      pending.delete(msg.id);
      Alert.alert('Download failed', msg.error || 'Unknown error');
      return true;
    }
    default:
      return false;
  }
}
