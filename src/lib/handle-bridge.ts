import { parseBridgeMessage, type ScrapeData } from '@/lib/bridge';
import { handleDownloadMessage } from '@/lib/downloads';
import { router } from 'expo-router';

export type BridgeHandlers = {
  onScrape: (data: ScrapeData) => void;
  onNavigate: (section: string, url: string) => void;
  onExternal: (url: string) => void;
};

function openInWebview(url: string, title: string, section: string): void {
  router.push({ pathname: '/webview', params: { url, title, section } });
}

export function dispatchBridge(raw: string, handlers: BridgeHandlers): void {
  const msg = parseBridgeMessage(raw);
  if (!msg) return;
  if (handleDownloadMessage(msg)) return;
  switch (msg.type) {
    case 'scrape':
      handlers.onScrape(msg.data);
      break;
    case 'navigate': {
      // schedule has no dedicated native screen: open it in the generic portal viewer
      if (msg.section === 'schedule') {
        openInWebview(msg.url, 'Horaire', 'schedule');
        break;
      }
      // deep links (message detail, document page, ...) open in the viewer too
      const deep = /message|lire|lecture|detail|fiche|download/i.test(msg.url) && msg.section !== 'services';
      if (deep && msg.url) {
        openInWebview(msg.url, 'Portail', msg.section);
        break;
      }
      handlers.onNavigate(msg.section, msg.url);
      break;
    }
    case 'openExternal':
      handlers.onExternal(msg.url);
      break;
    case 'log':
      console.log('[portal]', msg.message);
      break;
    default:
      break;
  }
}
