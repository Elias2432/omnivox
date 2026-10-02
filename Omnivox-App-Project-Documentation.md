# Omnivox App — Documentation du projet

**Client Omnivox non officiel pour iPhone (copie de l’interface Omnivox Mobile)**

| | |
|---|---|
| Date du document | 2 octobre 2026 |
| Emplacement du projet | `C:\Users\sxmaj\Documents\Omnivox` |
| Plateforme | iOS (iPhone), testé via Expo Go |
| État | Vérifié — typecheck, lint, bundle de production, expo-doctor et lancement `Start O.bat` (tunnel) réussis |

> **Mention légale.** Ceci est un enveloppement non officiel et indépendant du
> portail web Omnivox public. Il n’est **ni affilié ni approuvé par Skytech
> Communications**. La charte graphique reproduite (en-tête orange, onglets,
> couleurs) est une **réimplémentation originale**, sans reprendre les
> images/marques de Skytech ; les visuels (icône, logo LÉA, illustrations) sont
> créés pour ce projet. Les identifiants étudiants ne sont saisis que sur la
> page de connexion officielle du portail dans une WebView et ne sont **jamais
> conservés** par l’application.

---

## 1. Présentation

L’application reproduit l’**Omnivox Mobile officiel** (en-tête orange, 5 onglets,
écrans français) tout en branchant chaque écran sur le vrai portail du cégep
(`https://<cégep>.omnivox.ca/intr/`) :

- **Écrans natifs** pour Accueil, Mio, Léa, Notes, Services, Avis — construits à
  partir de données scappées du portail, avec **repli automatique sur la vue
  portail** (WebView) si l’analyse HTML échoue
- **Onglets natifs** avec pastilles rouges (Mio non lus, nouveaux documents Léa)
- **Session unique** : connexion partagée entre toutes les WebViews (cookie pool)
- **Notifications locales** : nouveaux Mio, nouvelles notes, nouveaux
  documents/travaux
- **Téléchargements hors ligne** avec visionneuse, partage et suppression
- **Horaire, Nouvelles, Documents de cours** consultés dans le visualiseur du
  portail

## 2. Liste des fonctionnalités

### Accueil (onglet)
- En-tête orange « Omnivox » + cégep + date en français, bouton réglages
- Bandeau « déconnecté » si la session n’est pas ouverte
- **Événements** : cartes horizontales (jour/mois + titre, liseré coloré)
- **Horaire du jour** (bandeau bleu) avec salles, repli vers l’horaire complet
- **Communautés** : cartes avec pastilles rouges de comptage
- **Actualités** (bandeau rouge) : titres du portail → Nouvelles
- Tuiles d’accès rapide : Horaire · Notes · Mio · Léa · Fichiers · Réglages
- Mention « non officielle » + heure de dernière mise à jour

### Mio (onglet)
- En-tête « Réception (n) », sous-titre « n non lus »
- Recherche (expéditeur, objet, aperçu)
- Ligne « Afficher les Mio catégorisés » → portail
- Lignes natives : pastille d’initiales bleue, expéditeur, objet, aperçu, date,
  point bleu pour non lu ; touche une ligne → message dans le visualiseur
- Repli automatique : `PortalScreen` (portail réel) si l’analyse échoue

### Léa (onglet)
- En-tête « LÉA » + pastilles de couleurs (visuel original)
- Sélecteurs **Session** et **Classes** → portail
- Grille 2 colonnes : Communiqués, Documents, Travaux, Notes, Évènement,
  Enseignants, Sites web, Absences, Forum, Classe à distance — grands nombres
  bleus + pastilles rouges ; « Notes » → écran Notes natif
- Repli automatique sur le portail

### Notes (écran empilé)
- Sélecteur de session, moyenne globale « note finale »
- Cartes par cours : titre **coloré selon la couleur du portail**, code + groupe,
  « Moy. finale du groupe »
- Lien « Ouvrir le bulletin complet » → portail

### Services (onglet)
- En-tête « Omnivox », bandeau rouge « Quoi de neuf? » (avis du portail)
- Bandeau bleu « Services Omnivox » + lignes (activé/désactivé, sous-texte
  « Présentement désactivé »)
- Repli automatique sur le portail

### Avis (onglet)
- « Donnez-nous votre avis » + 4 boutons colorés (satisfaction) → formulaire du
  portail, rangée « Mon dossier », ouverture Safari

### Écrans empilés
Nouvelles · Documents de cours · Téléchargements (liste + état vide) ·
Visionneuse (aperçu PDF, partage, suppression) · Notes · Réglages (cégep,
notifications, déconnexion, à propos) · 404 · **visualiseur générique**
(`/webview` : horaire, message Mio, document Léa, service…)

### Session & notifications
- `SessionProbe` masqué (2×2 px) partageant le cookie pool : recharge toutes les
  **2 min** (min. 20 s entre rafraîchissements) + au retour au premier plan
- Scrape étendu : connexion, non-lus Mio, actualités, horaire du jour, **boîte
  Mio**, **grille Léa**, **notes**, **services**, **événements**, **communautés**,
  **avis « Quoi de neuf »**
- Notifications locales au décompte qui augmente (Mio/notes/documents/travaux) —
  désactivables dans Réglages ; pastille d’app iOS = non-lus Mio
- Déconnexion via `Quitter.aspx` du portail lui-même

### Téléchargements
- Liens de fichiers interceptés par JavaScript injecté (regex FR/EN)
- Fichier récupéré **même origine** avec cookies, découpé en tranches base64 de
  256 Ko via le pont JS→natif
- Côté natif : réassemblage vérifié (contrôle par index), décodage, écriture dans
  Documents via `expo-file-system` ; aperçu, partage (`expo-sharing`),
  suppression avec confirmation ; persistent entre les lancements

## 3. Pile technique

| Élément | Version |
|---|---|
| Expo SDK | 57 (`expo ~57.0.26`) |
| React Native | 0.86.3 |
| React | 19.2.3 |
| TypeScript | ~6.0.3 (strict, `npx tsc --noEmit` propre) |
| Expo Router | ~57.0.24 (routes typées activées) |
| react-native-webview | 13.16.1 (inclus dans Expo Go) |
| @react-native-async-storage/async-storage | 2.2.0 |
| expo-file-system | ~57.0.7 (API File/Directory) |
| expo-notifications | ~57.0.21 |
| expo-sharing / expo-web-browser | ~57.0.22 / ~57.0.3 |
| @expo/vector-icons | 15 (Ionicons) |
| Tunnel | `@expo/ngrok` ^4.1.3 (devDependency) |
| Lint | ESLint 9 + `eslint-config-expo` 57 |

Tous les paquets sont installés avec `npx expo install` (versions compatibles
SDK). Paquets inutilisés du gabarit retirés : `@expo/ui`, `expo-image`,
`expo-symbols`, `expo-device`, `expo-glass-effect`.

## 4. Comment lancer

**Le plus simple — un double-clic :** double-cliquer sur **Start O** sur le
 bureau (ou `Start O.bat` dans le dossier du projet). Le terminal affiche un
 menu puis le QR code. Les trois anciens scripts ont été fusionnés en un seul :

| Option du menu **Start O** | À utiliser quand |
|---|---|
| **1. Tunnel** (défaut) | Fonctionne même si le téléphone ne voit pas le PC (recommandé) |
| **2. LAN** | Téléphone et PC sur le même Wi-Fi (plus rapide) |
| **3. Corriger le LAN** | Le téléphone ne se connecte pas en LAN : élève en administrateur, passe le profil réseau Windows en « Privé », crée les règles de pare-feu pour `node.exe`, puis démarre en LAN |

Puis scanner le QR avec l’appareil photo de l’iPhone (**Expo Go** requis).

Alternative manuelle :

```powershell
cd C:\Users\sxmaj\Documents\Omnivox
npx expo start --tunnel      # ou: npx expo start (LAN)
```

Portes de qualité (toutes réussies actuellement) :

```powershell
npx tsc --noEmit                    # typecheck — 0 erreur
npx expo lint                       # eslint — 0 problème
npx expo export --platform ios      # bundle de production — OK
npx expo-doctor                     # 21/21
```

### Build de l’app installable (IPA) — GitHub Actions + Sideloadly

1. Un **push** sur `main` (ou déclenchement manuel) lance le workflow
   `.github/workflows/build-ios.yml` sur le dépôt public
   <https://github.com/Elias2432/omnivox>
2. Le workflow : `npm install` → `npx expo prebuild -p ios --no-install` →
   `pod install` (cache CocoaPods) → `xcodebuild archive` **sans signature**
   (`macos-26`, Xcode 26.6) → zip `Payload/*.app` → artefact **`Omnivox-ipa`**
3. Télécharger l’artefact : `Omnivox.ipa`
4. **Sideloadly** : iPhone branché en USB → glisser l’IPA → identifiant
   Apple → **Start** → sur l’iPhone, Réglages → Général → Gestion et
   supervision des appareils → faire confiance au certificat

Pourquoi ce chemin : EAS Build cloud exige un compte Apple **payant** ; IPA
non signé + Sideloadly signe gratuitement (compte gratuit : expiration après
7 jours rafraîchie automatiquement tant que Sideloadly tourne, **3 apps**
maximum).

Correctifs de build :
- `patch-package` (`patches/expo-modules-jsi+57.1.1.patch`) : retrait de
  `SWIFT_RETURNS_RETAINED` sur les **constructeurs** `RuntimeScheduler` —
  clang/Xcode 26 refuse cette annotation sur un constructeur
- `macos-26` + Xcode 26.6 : Swift 6.3 est le minimum d’Expo SDK 57
  (Swift 6.2 sur Xcode ≤ 26.3 échoue avec `sending … data races` dans
  `JavaScriptRuntime.swift`)
- Lockfile généré sous Windows : `npm install` en CI au lieu de `npm ci`
  (les dépendances optionnelles par plateforme manquent au lockfile)

## 5. Architecture

### 5.1 Modèle de session
```
┌─ AppStateProvider ────────────────────────────────────────┐
│  SessionProbe (WebView cachée, deep scrape)  ↔ cookies    │
│  PortalWebViews (écrans portail empilés)     ↔ partagés   │
│  Écrans natifs (aucune WebView) lisent le JSON du scrape  │
└───────────────────────────────────────────────────────────┘
```
- `sharedCookiesEnabled` + `useSharedProcessPool` sur toutes les WebViews
- La connexion dans n’importe quel écran connecte partout
- `sessionVersion` incrémenté au changement de cégep/déconnexion ; inclus dans
  le `key` des WebViews pour forcer un rechargement propre

### 5.2 Protocole du pont (`window.ReactNativeWebView.postMessage`)
Messages JSON définis dans `src/lib/bridge.ts`, dispatchés par
`src/lib/handle-bridge.ts` :

| Type | Direction | But |
|---|---|---|
| `scrape` | page → app | `{loggedIn, unreadMio, newsTitle, scheduleToday, mioMessages, leaStats, leaSession, leaClasses, grades, services, events, communities, newsItems, notices, fetchedAt}` |
| `navigate` | page → app | Lien de section → écran natif ; horaire/liens profonds → visualiseur |
| `openExternal` | page → app | Hôte externe → feuille de navigateur |
| `downloadStart/Chunk/End/Error` | page → app | Transfert de fichier par tranches |
| `log` | page → app | Débogage (échecs d’analyse HTML) |

### 5.3 Script injecté (`src/lib/injected.ts`)
Exécuté après chaque chargement de page :
- **Routeur de liens** — classe les clics (motifs FR/EN dans `SECTION_PATTERNS`
  : mio, horaire, lea, notes, nouvelles, documents, services, avis) → écran
  natif, visualiseur, téléchargement ou navigateur externe
- **Auto-navigation de section** — un lien profond atterrit sur la bonne page
- **Analyseur profond** (probe uniquement, `deep: true`) :
  - détection de connexion, compteur Mio, titre d’actualité
  - localisation des URL de section (Mio, Léa, horaire, services) puis
    `fetch` same-origin + parsing :
    - boîte Mio (`parseMioInbox`) — lignes, expéditeur, objet, aperçu, date, non-lu
    - grille Léa (`parseLeaGrid`) — libellés/valeurs/badges + session/classes
    - notes (`parseGrades`) — pourcentage, titre coloré (style inline du
      portail), code de cours, moyenne du groupe
    - services (`parseServices`) — libellés, état activé/désactivé
    - écrans d’accueil (`parseHomeWidgets`) — actualités, événements, communautés, avis
  - échec d’analyse → `null` → l’écran natif affiche automatiquement la vue portail
- **Téléchargeur par tranches** — `fetch` same-origin → base64 → 256 Ko

### 5.4 État (`src/providers/app-state.tsx`)
Contexte unique : hydratation AsyncStorage, choix du cégep, données du scrape +
`lastUpdatedAt`, badges (Mio, documents Léa), notifications (détections de
différences), liste des téléchargements (pub/sub), déconnexion, dispatch du pont,
minuteur de sondage (**120 s** + écoute du premier plan).

### 5.5 Routes
```
src/app/
├── _layout.tsx         Stack racine, headers ORANGE (#F5821F), StatusBar clair
├── index.tsx           redirection → /accueil ou /onboarding
├── +not-found.tsx
├── onboarding.tsx      choix du cégep (FR)
├── news.tsx            PortalScreen (section nouvelles)
├── course-docs.tsx     PortalScreen (section documents)
├── downloads.tsx       liste native
├── viewer.tsx          aperçu + partage/suppression
├── notes.tsx           notes native (repli portail)
├── webview.tsx         visualiseur générique (url + section + titre)
├── settings.tsx        cégep / notifications / déconnexion / à propos (FR)
└── (tabs)/
    ├── _layout.tsx     NativeTabs : Accueil · Mio · Léa · Services · Avis
    │                   (badges Mio + documents Léa, actif pêche #FBE9D0)
    ├── accueil.tsx     tableau de bord (events/communautés/actualités/horaire)
    ├── mio.tsx         boîte Mio native (repli portail)
    ├── lea.tsx         grille Léa native (repli portail)
    ├── services.tsx    services natifs (repli portail)
    └── avis.tsx        avis + Mon dossier
```

## 6. Carte des fichiers (hors routes)

```
src/
├── components/
│   ├── ox.tsx              briques UI : OxHeader, SectionBand, CountBadge,
│   │                       LoadingBlock, FallbackPrompt, Card, IconButton
│   ├── portal-webview.tsx  enveloppe WebView (toolbar, erreurs/retry, messages FR)
│   ├── portal-screen.tsx   barre d’outils + PortalWebView
│   └── session-probe.tsx   WebView cachée de sondage
├── providers/
│   └── app-state.tsx       contexte global (voir 5.4)
├── lib/
│   ├── portals.ts          cégeps, URL, motifs de sections (portail/mio/lea/…)
│   ├── bridge.ts           types de messages + ScrapeData étendu
│   ├── injected.ts         script injecté (routeur/analyseurs/téléchargeur)
│   ├── handle-bridge.ts    message → handlers (navigateur, webview générique)
│   ├── downloads.ts        réassemblage, stockage Files API, pub/sub, MIME
│   └── notifications.ts    permissions, notifications locales, badge d’app
├── hooks/                  use-theme, use-color-scheme (+ .web)
├── constants/theme.ts      palette Omnivox (orange #F5821F, bleu #1E6FD9,
│                           rouge #E53935, pêche #FBE9D0), Fonts, Spacing
└── app/                    routes uniquement (voir 5.5)
```

## 7. Design et identité

- **Palette Omnivox Mobile** : en-tête/accents orange `#F5821F`, liens/onglet
  actif bleu `#1E6FD9`, pastilles rouges `#E53935`, cellule d’onglet active
  pêche `#FBE9D0`, bandeaux rouge `#C0392B` / bleu `#1E88E5`, fond blanc —
  mode sombre conservé via `useTheme`
- **Barre d’onglets native** : Accueil/Mio/Léa/Services/Avis, SF Symbols
  (`house.fill`, `envelope.fill`, `book.fill`, `square.grid.2x2.fill`,
  `megaphone.fill`), badge rouge sur Mio et Léa
- **En-têtes de stack** : fond orange, texte blanc (ThemeProvider racine)
- **Icône d’app iOS** : la fleur orange originale Omnivox (fournie par
  l’utilisateur, 447 px → 1024×1024 RGB opaque, `assets/images/icon.png`) —
  usage personnel sideloadé. Nom d’accueil **« Omnivox Mobile »** via
  `ios.infoPlist.CFBundleDisplayName` (le schéma Xcode/CI reste `Omnivox`,
  `buildNumber` 2). Icônes secondaires toujours « anneau O » : favicon,
  couches Android, `.ico` Windows des raccourcis, splash `#000000`
- Toute la charte/illustrations internes sont des réimplémentations
  originales — seul l’icône d’app iOS reprend l’artwork Skytech (usage
  personnel, non destiné au magasin)

## 8. Résultats de vérification

| Contrôle | Résultat |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erreur (routes régénérées) |
| `npx expo lint` | ✅ 0 problème |
| `npx expo export --platform ios` | ✅ bundle Hermes construit |
| `npx expo-doctor` | ✅ 21/21 |
| `npx expo install --check` | ✅ dépendances à jour |
| `Start O.bat` (lancement réel) | ✅ Metro + tunnel ngrok : `https://…exp.direct` |
| GitHub Actions « Build iOS IPA » | ✅ run #6 : succès en 11 min 49 s → artefact `Omnivox.ipa` (11,3 Mo : binaire 6,56 Mo + `main.jsbundle` 2,96 Mo) |
| `npm ci` sous Windows | ⚠️ lockfile incomplet pour darwin → `npm install` en CI |

Correctifs et pièges rencontrés :
- RN 0.86 a supprimé `StyleSheet.absoluteFillObject` → styles de remplissage explicites
- Prop WebView renommée → `allowsBackForwardNavigationGestures`
- Tableaux de tranches peu denses → vérification par index (intégrité des fichiers)
- Aperçu PDF local : `allowingReadAccessToURL` requis pour l’accès fichier WKWebView
- Le typage des routes Expo devient périmé après ajout de routes → régénérer
  (`.expo/types/router.d.ts`) en lançant le serveur de dev
- `npx expo install X --save-dev` invalide → `npm install --save-dev`
- Passerelle LAN bloquée : profil réseau Windows « Public » + aucune règle de
  pare-feu pour `node.exe` → script `Enable LAN mode (Run as admin).bat`
- 5 onglets avec WebView chacun au lancement → remplacés par des écrans natifs
  (une seule WebView profonde : le probe)
- CI iOS : `npm ci` échoue (lockfile Windows sans optionnels darwin) →
  `npm install --no-audit --no-fund`
- CI iOS : Xcode 16.4 par défaut ≠ tools-version Swift 6.2 du Package.swift
  d’`expo-modules-jsi` → pin `DEVELOPER_DIR` ; 26.3 (Swift 6.2) échoue sur
  `sending … data races` → `macos-26` + Xcode 26.6 (Swift 6.3)
- Xcode 26 refuse `SWIFT_RETURNS_RETAINED` sur les constructeurs
  `RuntimeScheduler` → patch `patch-package` appliqué au `postinstall`
- Pousser un fichier `.github/workflows/*.yml` exige le scope `workflow` du
  token GitHub → `gh auth refresh -s workflow`
- `gh` absent de Windows : échec winget (UAC 1602) → binaire portable dans
  `%LOCALAPPDATA%\Programs\gh\bin\` + PATH utilisateur

## 9. Limitations connues et travaux futurs

- Notifications **locales uniquement** dans Expo Go — pas de push arrière-plan
  (un développement avec push `expo-notifications` lèverait cette limite)
- L’analyse HTML dépend du portail réel : les sélecteurs (`parseMioInbox`,
  `parseLeaGrid`, `parseGrades`, …) doivent être **affinés avec une session
  connectée** (les échecs loguent `parse:*` côté console et basculent
  automatiquement sur la vue portail — aucun écran vide)
- Les données scappées ne sont mises à jour que pendant l’utilisation de l’app
  (sondage 2 min + premier plan)
- Les cégeps personnalisés ne sont pas testés (motifs FR/GEN)
- L’app installée expire après **7 jours** (compte Apple gratuit) : garder
  Sideloadly ouvert pour le renouvellement automatique, sinon re-glisser
  l’IPA. Les notifications locales et badges fonctionnent (pas d’APNs requis)
- À faire avec l’utilisateur : capture de l’écran d’erreur rouge éventuel
  (Phase 3 du plan), réglage fin des couleurs/largeurs d’en-tête au pixel près,
  puces TestFlight via `eas build` (nécessite un compte Apple payant),
  styles iOS 26 Liquid Glass

## 10. Annexe

### Cégeps prévérifiés (11 + personnalisé)
Cégep de Sherbrooke · Dawson · Vanier · Marianopolis · John Abbott · Cégep de la
Gaspésie et des Îles · Champlain College–St. Lawrence · Cégep de Victoriaville ·
Cégep de l’Abitibi-Témiscamingue · Cégep Édouard-Montpetit · Cégep Heritage —
tous en `<hôte>.omnivox.ca`, `https://<hôte>/intr/` répond.

### URLs utiles
- Entrée : `https://<hôte>/intr/`
- Connexion : `https://<hôte>/Login/Account/Login?ReturnUrl=/intr/`
- Déconnexion : `https://<hôte>/intr/Module/Identification/Quitter.aspx`
- Dépôt GitHub (build IPA) : `https://github.com/Elias2432/omnivox`
- Sideloadly : `C:\Users\sxmaj\AppData\Local\Sideloadly\sideloadly.exe`
- GitHub CLI portable : `C:\Users\sxmaj\AppData\Local\Programs\gh\bin\gh.exe`

### Commandes utiles
```powershell
npx expo start --tunnel     # serveur dev + QR (défaut recommandé)
npx expo start              # mode LAN
npx tsc --noEmit            # typecheck
npx expo lint               # lint
npx expo export --platform ios
npx expo-doctor
npx expo run:ios            # build local (macOS uniquement)
npx patch-package expo-modules-jsi   # régénérer le patch après mise à jour
```

### Suivi du build IPA
```powershell
$gh = "$env:LOCALAPPDATA\Programs\gh\bin\gh.exe"
& $gh run list --repo Elias2432/omnivox --limit 5        # états des builds
& $gh run view <id> --repo Elias2432/omnivox --log       # journal complet
& $gh run download <id> --repo Elias2432/omnivox --name Omnivox-ipa --dir build
git push                                                 # déclenche un build
```

---
*Fin du document — généré le 2 octobre 2026.*
