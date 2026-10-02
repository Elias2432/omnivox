import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import { buildDemoScrape } from '@/lib/demo';

export type SessionProbeHandle = { reload: () => void };

type Props = {
  url: string;
  onMessage: (raw: string) => void;
  onLoadEnd?: () => void;
};

/**
 * Web stand-in for the native session probe (used by the PC visualiser).
 * There is no WebView on web, so instead of scraping the portal it emits a
 * synthetic `scrape` payload (src/lib/demo.ts) through the same bridge
 * protocol, which populates every native screen with demo content.
 * The logout landing URL produces a signed-out payload, mirroring native
 * behaviour when the user taps « Se déconnecter ».
 */
export const SessionProbe = forwardRef<SessionProbeHandle, Props>(function SessionProbe(
  { url, onMessage, onLoadEnd },
  ref
) {
  const stateRef = useRef({ url, onMessage, onLoadEnd });
  stateRef.current = { url, onMessage, onLoadEnd };

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emit = useRef(() => {
    const { url: u, onMessage: om, onLoadEnd: ole } = stateRef.current;
    const loggedIn = !/quitter/i.test(u);
    om(JSON.stringify({ type: 'scrape', data: buildDemoScrape(loggedIn) }));
    ole?.();
  }).current;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(emit, 600);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [url, emit]);

  useImperativeHandle(ref, () => ({
    reload: () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(emit, 250);
    },
  }));

  return null;
});
