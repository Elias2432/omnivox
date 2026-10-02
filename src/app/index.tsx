import { Redirect } from 'expo-router';

import { useAppState } from '@/providers/app-state';

export default function Index() {
  const { hydrated, college } = useAppState();
  if (!hydrated) return null;
  if (!college) return <Redirect href="/onboarding" />;
  return <Redirect href="/accueil" />;
}
